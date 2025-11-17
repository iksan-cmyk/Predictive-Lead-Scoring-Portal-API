/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('lead_features', {
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
    feature_name: {
      type: 'varchar(100)',
      notNull: true,
    },
    feature_value: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('lead_features', 'lead_id');
  pgm.createIndex('lead_features', ['lead_id', 'feature_name'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('lead_features');
};