import { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Settings, Save } from 'lucide-react';
import { settingsAPI } from '../../api/client';

interface Setting {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export const SettingsView = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data.settings);
      // Initialize edited values
      const values: Record<string, string> = {};
      response.data.settings.forEach((s: Setting) => {
        values[s.key] = s.value;
      });
      setEditedValues(values);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues({ ...editedValues, [key]: value });
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await settingsAPI.update(key, editedValues[key]);
      await loadSettings();
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      tokens_per_referral: 'Tokens por Referido',
      tokens_per_euro: 'Tipo de Cambio (Tokens = 1€)',
      expiring_soon_days: 'Días para "Expiran Pronto"',
      referral_bonus_new_user: 'Bonificación para Nuevos Usuarios Referidos',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-600">Ajusta los parámetros principales del sistema de tokens</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 space-y-6">
            {settings.map((setting) => (
              <div key={setting.key} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <label className="block text-lg font-semibold text-gray-900 mb-1">
                      {getSettingLabel(setting.key)}
                    </label>
                    <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={editedValues[setting.key] || ''}
                        onChange={(e) => handleValueChange(setting.key, e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleSave(setting.key)}
                        disabled={saving || editedValues[setting.key] === setting.value}
                        className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
                          editedValues[setting.key] === setting.value
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Última actualización: {new Date(setting.updated_at).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los cambios en la configuración se aplicarán inmediatamente después de guardar.
            Asegúrate de verificar los valores antes de confirmar.
          </p>
        </div>
      </div>
    </div>
  );
};
