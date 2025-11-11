const { run, get, all } = require('../config/database');
const { hashPassword } = require('./authService');

const ensureLeadsSchema = async () => {
  const columns = await all('PRAGMA table_info(leads);');
  const hasScoreColumn = columns.some((column) => column.name === 'score');

  if (!columns.length || !hasScoreColumn) {
    await run('DROP TABLE IF EXISTS leads;');
    await run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        job TEXT,
        balance REAL,
        score REAL NOT NULL,
        probability REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
};

const initDatabase = async () => {
  await run('PRAGMA foreign_keys = ON;');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await ensureLeadsSchema();

  await run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      job TEXT,
      balance REAL,
      payload TEXT NOT NULL,
      probability REAL NOT NULL,
      predicted_class TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminExists = await get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const passwordHash = await hashPassword('admin123');
    await run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
      'admin',
      passwordHash,
      'admin',
    ]);
    console.log('Seeded default admin user (username: admin, password: admin123)');
  }
};

const getUserByUsername = (username) => get('SELECT * FROM users WHERE username = ?', [username]);
const getUserById = (id) => get('SELECT * FROM users WHERE id = ?', [id]);

const createUser = ({ username, passwordHash, role = 'agent' }) =>
  run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
    username,
    passwordHash,
    role,
  ]);

const mapLeadRow = (row) =>
  row && {
    id: row.id,
    name: row.name,
    age: row.age,
    job: row.job,
    balance: row.balance,
    score: row.score,
    probability: row.probability,
    createdAt: row.created_at,
  };

const createLeadRecord = ({ name, age, job, balance, score, probability }) =>
  run(
    `INSERT INTO leads (name, age, job, balance, score, probability)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [name, age ?? null, job ?? null, balance ?? null, score, probability]
  );

const getLeadRecordById = (id) =>
  get(
    `SELECT id, name, age, job, balance, score, probability, created_at
       FROM leads
      WHERE id = ?`,
    [id]
  ).then(mapLeadRow);

const updateLeadRecordById = (id, { name, age, job, balance, score, probability }) =>
  run(
    `UPDATE leads
        SET name = ?, age = ?, job = ?, balance = ?, score = ?, probability = ?
      WHERE id = ?`,
    [name, age ?? null, job ?? null, balance ?? null, score, probability, id]
  );

const deleteLeadRecordById = (id) => run('DELETE FROM leads WHERE id = ?', [id]);

const createPredictionRecord = ({ name, age, job, balance, probability, predictedClass, payload }) =>
  run(
    `INSERT INTO predictions (name, age, job, balance, probability, predicted_class, payload)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      name || null,
      typeof age === 'number' ? age : null,
      job || null,
      typeof balance === 'number' ? balance : null,
      probability,
      predictedClass,
      JSON.stringify(payload),
    ]
  );

const listLeadRecords = () =>
  all(
    `SELECT id, name, age, job, balance, score, probability, created_at
       FROM leads
       ORDER BY created_at DESC;`
  ).then((rows) => rows.map(mapLeadRow));

module.exports = {
  initDatabase,
  getUserByUsername,
  getUserById,
  createUser,
  createLeadRecord,
  getLeadRecordById,
  updateLeadRecordById,
  deleteLeadRecordById,
  listLeadRecords,
  createPredictionRecord,
};
