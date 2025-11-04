import { useState, useEffect } from 'react';
import { adminAPI } from '../api/client';
import { Zap, Calendar, Coins, ChevronRight } from 'lucide-react';

interface Impulso {
  id: number;
  amount: number;
  event_title: string;
  default_expiry_days: number;
  description?: string;
  active: boolean;
  created_at: string;
}

export default function Impulsos() {
  const [impulsos, setImpulsos] = useState<Impulso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImpulso, setSelectedImpulso] = useState<Impulso | null>(null);

  useEffect(() => {
    loadImpulsos();
  }, []);

  const loadImpulsos = async () => {
    try {
      const response = await adminAPI.getAllRewards();
      setImpulsos(response.data.rewards);
    } catch (error) {
      console.error('Failed to load impulsos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando impulsos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center mb-2">
            <Zap className="w-10 h-10 mr-3 text-yellow-500" />
            Impulsos Develand
          </h1>
          <p className="text-gray-600 text-lg">
            Descubre las recompensas disponibles para impulsar tu experiencia
          </p>
        </div>

        {impulsos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              No hay impulsos disponibles en este momento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impulsos.map((impulso) => (
              <div
                key={impulso.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedImpulso(impulso)}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{impulso.event_title}</h3>
                  <div className="flex items-center text-2xl font-bold">
                    <Coins className="w-6 h-6 mr-2" />
                    <span>Ð {impulso.amount}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      Válido por {impulso.default_expiry_days} días
                    </span>
                  </div>

                  {impulso.description && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {impulso.description}
                    </p>
                  )}

                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImpulso(impulso);
                    }}
                  >
                    Ver Detalles
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {selectedImpulso && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImpulso(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">{selectedImpulso.event_title}</h2>
              <div className="flex items-center text-3xl font-bold">
                <Coins className="w-8 h-8 mr-3" />
                <span>Ð {selectedImpulso.amount}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  <div>
                    <p className="font-semibold">Duración de validez</p>
                    <p className="text-lg">{selectedImpulso.default_expiry_days} días</p>
                  </div>
                </div>
              </div>

              {selectedImpulso.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedImpulso.description}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Nota:</strong> Los impulsos son asignados por el equipo de Develand.
                  Contacta con tu coordinador para solicitar este impulso.
                </p>
              </div>

              <button
                onClick={() => setSelectedImpulso(null)}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
