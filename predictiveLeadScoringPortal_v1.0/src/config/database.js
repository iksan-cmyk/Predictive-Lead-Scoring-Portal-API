const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
    return;
  }
  console.log(`SQLite database ready at ${dbPath}`);
});

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onResult(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

module.exports = {
  db,
  run,
  get,
  all,
};
