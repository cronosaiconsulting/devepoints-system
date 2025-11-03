import { pool } from '../config/database';

export const settingsService = {
  async getAllSettings() {
    const result = await pool.query(
      `SELECT key, value, description, updated_at
       FROM settings
       ORDER BY key ASC`
    );
    return result.rows;
  },

  async getSetting(key: string) {
    const result = await pool.query(
      'SELECT value FROM settings WHERE key = $1',
      [key]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0].value;
  },

  async updateSetting(key: string, value: string) {
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
