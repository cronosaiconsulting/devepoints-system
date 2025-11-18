import { pool } from '../config/database';

async function migrateAprobaciones() {
  console.log('Starting aprobaciones_impulsos table migration...');

  try {
    // Create aprobaciones_impulsos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aprobaciones_impulsos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        impulso_id INTEGER NOT NULL REFERENCES rewards(id),
        nombre_completo VARCHAR(255) NOT NULL,
        fecha_logro DATE NOT NULL,
        mensaje TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
        motivo_rechazo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by INTEGER REFERENCES users(id)
      );
    `);
    console.log('✓ Created aprobaciones_impulsos table');

    // Create indexes for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aprobaciones_impulsos_user_id ON aprobaciones_impulsos(user_id);
    `);
    console.log('✓ Created index on user_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aprobaciones_impulsos_status ON aprobaciones_impulsos(status);
    `);
    console.log('✓ Created index on status');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aprobaciones_impulsos_fecha_logro ON aprobaciones_impulsos(fecha_logro);
    `);
    console.log('✓ Created index on fecha_logro');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aprobaciones_impulsos_created_at ON aprobaciones_impulsos(created_at);
    `);
    console.log('✓ Created index on created_at');

    console.log('✅ Aprobaciones migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAprobaciones();
