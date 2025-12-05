/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('lead_scores', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    lead_id: {
      type: 'integer',
      notNull: true,
      references: 'leads(id)',
      onDelete: 'CASCADE',
      unique: true,
    },
    score: {
      type: 'decimal(5, 4)',
      notNull: true,
    },
    probability: {
      type: 'decimal(5, 4)',
      notNull: true,
    },
    model_version: {
      type: 'varchar(50)',
    },
    feature_vector: {
      type: 'jsonb',
    },
    calculated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
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

  pgm.createIndex('lead_scores', 'lead_id');
  pgm.createIndex('lead_scores', 'score');
  pgm.createIndex('lead_scores', 'calculated_at');
};

exports.down = (pgm) => {
  pgm.dropTable('lead_scores');
};