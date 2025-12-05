/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('lead_outcomes', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    lead_id: {
      type: 'integer',
      notNull: true,
      references: 'leads(id)',
      onDelete: 'CASCADE',
    },
    outcome: {
      type: 'varchar(50)',
      notNull: true,
    },
    contacted: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    contacted_at: {
      type: 'timestamp',
    },
    contacted_by: {
      type: 'integer',
      references: 'users(id)',
      onDelete: 'SET NULL',
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

  pgm.createIndex('lead_outcomes', 'lead_id');
  pgm.createIndex('lead_outcomes', 'outcome');
  pgm.createIndex('lead_outcomes', 'contacted');
  pgm.createIndex('lead_outcomes', 'contacted_at');
};

exports.down = (pgm) => {
  pgm.dropTable('lead_outcomes');
};