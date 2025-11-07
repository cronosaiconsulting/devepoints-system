import { pool } from '../config/database';

export const settingsService = {
  async getAllSettings() {
    try {
      const result = await pool.query(
        `SELECT key, value, description, updated_at
         FROM settings
         ORDER BY key ASC`
      );
      return result.rows;
    } catch (error: any) {
      // If settings table doesn't exist, return default settings
      if (error.code === '42P01') {
        return [
          { key: 'tokens_per_referral', value: '50', description: 'Cantidad de tokens que gana el referidor por cada referido exitoso', updated_at: new Date() },
          { key: 'referral_bonus_new_user', value: '25', description: 'Tokens de bonificación para nuevos usuarios referidos', updated_at: new Date() },
          { key: 'tokens_per_euro', value: '1', description: 'Tipo de cambio: X tokens = 1€', updated_at: new Date() },
          { key: 'expiring_soon_days', value: '30', description: 'Días para considerar que los tokens expiran pronto', updated_at: new Date() },
          { key: 'logo_url', value: '', description: 'URL del logo principal (usar IMGUR)', updated_at: new Date() },
          { key: 'terms_and_conditions', value: '<h2>Términos y Condiciones</h2><p>Aquí van los términos y condiciones de uso del sistema.</p>', description: 'Términos y condiciones del sistema (HTML)', updated_at: new Date() }
        ];
      }
      throw error;
    }
  },

  async getSetting(key: string) {
    try {
      const result = await pool.query(
        'SELECT value FROM settings WHERE key = $1',
        [key]
      );
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0].value;
    } catch (error: any) {
      // If settings table doesn't exist, return defaults
      if (error.code === '42P01') {
        const defaults: Record<string, string> = {
          'tokens_per_referral': '50',
          'referral_bonus_new_user': '25',
          'tokens_per_euro': '1',
          'expiring_soon_days': '30',
          'logo_url': '',
          'terms_and_conditions': '<h2>Términos y Condiciones</h2><p>Aquí van los términos y condiciones de uso del sistema.</p>'
        };
        return defaults[key] || null;
      }
      throw error;
    }
  },

  async updateSetting(key: string, value: string) {
    try {
      const result = await pool.query(
        `UPDATE settings
         SET value = $1, updated_at = CURRENT_TIMESTAMP
         WHERE key = $2
         RETURNING *`,
        [value, key]
      );
      if (result.rows.length === 0) {
        throw new Error('Setting not found');
      }
      return result.rows[0];
    } catch (error: any) {
      // If settings table doesn't exist, just return a mock response
      if (error.code === '42P01') {
        throw new Error('Settings table not initialized. Please run migrations.');
      }
      throw error;
    }
  },

  async getSettingsAsObject() {
    const settings = await this.getAllSettings();
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });
    return settingsObj;
  },
};
