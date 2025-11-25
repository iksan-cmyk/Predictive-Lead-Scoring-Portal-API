/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('leads', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    customer_id: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    age: {
      type: 'integer',
      notNull: true,
    },
    job: {
      type: 'varchar(100)',
      notNull: true,
    },
    marital: {
      type: 'varchar(50)',
      notNull: true,
    },
    education: {
      type: 'varchar(100)',
      notNull: true,
    },
    default_credit: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    balance: {
      type: 'decimal(15, 2)',
      notNull: true,
      default: 0,
    },
    housing_loan: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    personal_loan: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    contact_type: {
      type: 'varchar(50)',
    },
    day_of_month: {
      type: 'integer',
    },
    month: {
      type: 'varchar(20)',
    },
    duration: {
      type: 'integer',
    },
    campaign: {
      type: 'integer',
      default: 0,
    },
    pdays: {
      type: 'integer',
    },
    previous: {
      type: 'integer',
      default: 0,
    },
    poutcome: {
      type: 'varchar(50)',
    },
    assigned_to: {
      type: 'integer',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'new',
    },
    notes: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('leads', 'customer_id');
  pgm.createIndex('leads', 'assigned_to');
  pgm.createIndex('leads', 'status');
  pgm.createIndex('leads', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('leads');
};