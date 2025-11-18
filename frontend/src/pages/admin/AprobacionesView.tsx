import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Zap, Filter, Eye, Check, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Approval {
  id: number;
  user_id: number;
  impulso_id: number;
  nombre_completo: string;
  fecha_logro: string;
  mensaje: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  motivo_rechazo?: string;
  created_at: string;
  user_full_name: string;
  email: string;
  event_title: string;
  amount: number;
  reviewed_at?: string;
  reviewer_name?: string;
}

export default function AprobacionesView() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [totalApprovals, setTotalApprovals] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Filters
  const [filters, setFilters] = useState({
    userName: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, [currentPage, filters]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await adminAPI.getApprovals(itemsPerPage, offset, filters);
      setApprovals(response.data.approvals);
      setTotalApprovals(response.data.total);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: number) => {
    if (!confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) return;

    try {
      await adminAPI.approveImpulso(approvalId);
      alert('Solicitud aprobada correctamente. Los tokens han sido asignados al usuario.');
      loadApprovals();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al aprobar la solicitud');
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectReason.trim()) {
      alert('Por favor, proporciona un motivo de rechazo');
      return;
    }

    try {
      await adminAPI.rejectImpulso(selectedApproval.id, rejectReason);
      alert('Solicitud rechazada correctamente.');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApproval(null);
      loadApprovals();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al rechazar la solicitud');
    }
  };

  const handleShowDetails = async (approval: Approval) => {
    try {
      const response = await adminAPI.getApprovalDetails(approval.id);
      setSelectedApproval(response.data.approval);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading approval details:', error);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadApprovals();
  };

  const clearFilters = () => {
    setFilters({
      userName: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalApprovals / itemsPerPage);

  if (loading && approvals.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Cargando aprobaciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Zap className="w-8 h-8 text-yellow-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Aprobaciones de Impulsos</h1>
            <p className="text-gray-600">Gestiona las solicitudes de impulsos de los usuarios</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.userName}
                onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
                placeholder="Buscar por nombre..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {approvals.length === 0 ? (
          <div className="p-12 text-center">
            <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No hay aprobaciones que mostrar</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impulso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Logro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {approval.user_full_name}
                          </div>
                          <div className="text-sm text-gray-500">{approval.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {approval.event_title}
                          </div>
                          <div className="text-sm text-gray-500">Ð {approval.amount}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {approval.nombre_completo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(approval.fecha_logro).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(approval.status)}`}>
                          {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleShowDetails(approval)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 inline mr-1" />
                            Detalles
                          </button>
                          {approval.status === 'pendiente' && (
                            <>
                              <button
                                onClick={() => handleApprove(approval.id)}
                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg"
                                title="Aceptar"
                              >
                                <Check className="w-4 h-4 inline mr-1" />
                                Aceptar
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApproval(approval);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg"
                                title="Rechazar"
                              >
                                <XCircle className="w-4 h-4 inline mr-1" />
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalApprovals)}
                </span>{' '}
                de <span className="font-medium">{totalApprovals}</span> resultados
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 inline" />
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApproval && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Detalles de la Solicitud</h2>
              <p className="text-blue-50">ID: {selectedApproval.id}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Usuario del sistema</p>
                  <p className="font-semibold">{selectedApproval.user_full_name}</p>
                  <p className="text-sm text-gray-600">{selectedApproval.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre completo (formulario)</p>
                  <p className="font-semibold">{selectedApproval.nombre_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Impulso solicitado</p>
                  <p className="font-semibold">{selectedApproval.event_title}</p>
                  <p className="text-sm text-gray-600">Ð {selectedApproval.amount} tokens</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de logro</p>
                  <p className="font-semibold">
                    {new Date(selectedApproval.fecha_logro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(selectedApproval.status)}`}>
                    {selectedApproval.status.charAt(0).toUpperCase() + selectedApproval.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de solicitud</p>
                  <p className="font-semibold">
                    {new Date(selectedApproval.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Mensaje</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApproval.mensaje}</p>
                </div>
              </div>

              {selectedApproval.status === 'rechazada' && selectedApproval.motivo_rechazo && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Motivo de rechazo</p>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-700 whitespace-pre-wrap">{selectedApproval.motivo_rechazo}</p>
                  </div>
                </div>
              )}

              {selectedApproval.reviewed_at && (
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Revisado por</p>
                    <p className="font-semibold">{selectedApproval.reviewer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de revisión</p>
                    <p className="font-semibold">
                      {new Date(selectedApproval.reviewed_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {selectedApproval.status === 'pendiente' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleApprove(selectedApproval.id);
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                    >
                      <Check className="w-5 h-5 inline mr-2" />
                      Aceptar
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Rechazar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApproval && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Rechazar Solicitud</h2>
              <p className="text-red-50">{selectedApproval.event_title}</p>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Estás a punto de rechazar la solicitud de <strong>{selectedApproval.user_full_name}</strong>.
                Por favor, proporciona un motivo del rechazo.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explica por qué se rechaza esta solicitud..."
              />

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
