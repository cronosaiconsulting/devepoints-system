import { useState, useEffect } from 'react';
import { userAPI, adminAPI } from '../api/client';
import { Navbar } from '../components/Navbar';
import { Zap, Calendar, Coins, ChevronRight, AlertCircle } from 'lucide-react';

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
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalImpulso, setApprovalImpulso] = useState<Impulso | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    nombreCompleto: '',
    fechaLogro: '',
    mensaje: ''
  });

  useEffect(() => {
    loadImpulsos();
  }, []);

  const loadImpulsos = async () => {
    try {
      const response = await userAPI.getRewards();
      setImpulsos(response.data.rewards);
    } catch (error) {
      console.error('Failed to load impulsos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalImpulso) return;

    try {
      await adminAPI.createApproval(
        approvalImpulso.id,
        approvalForm.nombreCompleto,
        approvalForm.fechaLogro,
        approvalForm.mensaje
      );
      alert('Solicitud de impulso enviada correctamente. El equipo la revisará pronto.');
      setShowApprovalForm(false);
      setApprovalForm({ nombreCompleto: '', fechaLogro: '', mensaje: '' });
      setApprovalImpulso(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al enviar la solicitud');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Cargando impulsos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center mb-2">
            <Zap className="w-10 h-10 mr-3 text-yellow-500" />
            Impulsos Develand
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Descubre las recompensas disponibles para impulsar tu experiencia
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Si tus tokens por un Impulso no han sido entregados, pulsa en el botón verde <strong>"Reclamar"</strong> para solicitarlos
                </p>
              </div>
            </div>
          </div>
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
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
              >
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white cursor-pointer flex flex-col"
                  onClick={() => setSelectedImpulso(impulso)}
                >
                  <h3
                    className="font-bold mb-2 line-clamp-2 min-h-[3.5rem]"
                    style={{
                      fontSize: impulso.event_title.length > 50 ? '1rem' : impulso.event_title.length > 30 ? '1.125rem' : '1.25rem'
                    }}
                  >
                    {impulso.event_title}
                  </h3>
                  <div className="flex items-center text-2xl font-bold">
                    <Coins className="w-6 h-6 mr-2" />
                    <span>Ð {impulso.amount}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      Válido por {impulso.default_expiry_days} días
                    </span>
                  </div>

                  <div className="flex-1 mb-4">
                    {impulso.description && (
                      <p className="text-gray-700 line-clamp-3">
                        {impulso.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mt-auto">
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      onClick={() => setSelectedImpulso(impulso)}
                    >
                      Ver Detalles
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                    <button
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-semibold"
                      onClick={() => {
                        setApprovalImpulso(impulso);
                        setShowApprovalForm(true);
                      }}
                    >
                      Reclamar
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>
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

      {/* Modal de Solicitud de Aprobación */}
      {showApprovalForm && approvalImpulso && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApprovalForm(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Solicitar Aprobación de Impulso</h2>
              <p className="text-green-50">{approvalImpulso.event_title}</p>
            </div>

            <form onSubmit={handleApprovalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={approvalForm.nombreCompleto}
                  onChange={(e) => setApprovalForm({ ...approvalForm, nombreCompleto: e.target.value })}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de logro
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={approvalForm.fechaLogro}
                  onChange={(e) => setApprovalForm({ ...approvalForm, fechaLogro: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={approvalForm.mensaje}
                  onChange={(e) => setApprovalForm({ ...approvalForm, mensaje: e.target.value })}
                  placeholder="Describe tu logro y por qué mereces este impulso..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApprovalForm(false);
                    setApprovalForm({ nombreCompleto: '', fechaLogro: '', mensaje: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
