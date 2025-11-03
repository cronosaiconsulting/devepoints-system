import { pool } from '../config/database';

async function migrateSettings() {
  try {
    console.log('Creating settings table...');

    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Settings table created successfully');

    // Insert default settings
    console.log('Inserting default settings...');

    const defaultSettings = [
      {
        key: 'tokens_per_referral',
        value: '50',
        description: 'Cantidad de tokens que gana el referidor por cada referido exitoso'
      },
      {
        key: 'tokens_per_euro',
        value: '1',
        description: 'Tipo de cambio: X tokens = 1€'
      },
      {
        key: 'expiring_soon_days',
        value: '30',
        description: 'Días para considerar que los tokens expiran pronto (para notificaciones)'
      },
      {
        key: 'referral_bonus_new_user',
        value: '25',
        description: 'Tokens de bonificación para nuevos usuarios referidos'
      }
    ];

    for (const setting of defaultSettings) {
      await pool.query(
        `INSERT INTO settings (key, value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.description]
      );
    }

    console.log('Default settings inserted successfully');
    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateSettings();
