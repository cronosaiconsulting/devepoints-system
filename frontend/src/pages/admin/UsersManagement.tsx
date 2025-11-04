import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Users, Search, Award, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export const UsersManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [selectedReward, setSelectedReward] = useState<string>('');
  const [awardForm, setAwardForm] = useState({ amount: '', description: '', expiryDays: '180', observations: '' });
  const [createForm, setCreateForm] = useState({ email: '', password: '', fullName: '', role: 'user' });

  useEffect(() => {
    loadUsers();
    loadRewards();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers(100, 0);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRewards = async () => {
    try {
      const response = await adminAPI.getAllRewards();
      setRewards(response.data.rewards.filter((r: any) => r.active));
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    try {
      const response = await adminAPI.searchUsers(searchQuery);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleRewardChange = (rewardId: string) => {
    setSelectedReward(rewardId);

    if (rewardId === 'others') {
      // Clear form for custom input
      setAwardForm({ amount: '', description: '', expiryDays: '180', observations: '' });
    } else if (rewardId) {
      // Fill form with selected reward
      const reward = rewards.find(r => r.id === parseInt(rewardId));
      if (reward) {
        setAwardForm({
          amount: reward.amount.toString(),
          description: reward.event_title,
          expiryDays: (reward.default_expiry_days || 180).toString(),
          observations: ''
        });
      }
    }
  };

  const handleAwardCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await adminAPI.awardCoins(
        selectedUser.id,
        parseInt(awardForm.amount),
        awardForm.description,
        parseInt(awardForm.expiryDays),
        awardForm.observations || undefined
      );
      alert('¡Monedas otorgadas exitosamente!');
      setShowAwardModal(false);
      setSelectedUser(null);
      setSelectedReward('');
      setAwardForm({ amount: '', description: '', expiryDays: '180', observations: '' });
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Otorgamiento fallido');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(
        createForm.email,
        createForm.password,
        createForm.fullName,
        createForm.role
      );
      alert('¡Usuario creado exitosamente!');
      setShowCreateModal(false);
      setCreateForm({ email: '', password: '', fullName: '', role: 'user' });
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Creación de usuario fallida');
    }
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

      <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">Gestionar todos los usuarios registrados</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Crear Usuario
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Buscar por correo o nombre..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </button>
            <button
              onClick={loadUsers}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold">Correo</th>
                <th className="text-left py-3 px-4 font-semibold">Saldo</th>
                <th className="text-left py-3 px-4 font-semibold">Referidos</th>
                <th className="text-left py-3 px-4 font-semibold">Rol</th>
                <th className="text-left py-3 px-4 font-semibold">Registro</th>
                <th className="text-left py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.full_name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-600">Ð {user.balance}</span>
                  </td>
                  <td className="py-3 px-4">{user.referral_count}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowAwardModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Otorgar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Award Modal */}
        {showAwardModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Otorgar Monedas a {selectedUser.full_name}</h3>

              <form onSubmit={handleAwardCoins} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Recompensa</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={selectedReward}
                    onChange={(e) => handleRewardChange(e.target.value)}
                  >
                    <option value="">-- Seleccionar una recompensa --</option>
                    {rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.event_title} - Ð {reward.amount}
                      </option>
                    ))}
                    <option value="others">Otros (Personalizado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={awardForm.amount}
                    onChange={(e) => setAwardForm({ ...awardForm, amount: e.target.value })}
                    disabled={!!(selectedReward && selectedReward !== 'others')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del Evento</label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    value={awardForm.description}
                    onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                    disabled={!!(selectedReward && selectedReward !== 'others')}
                  />
                </div>

                {selectedReward === 'others' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      value={awardForm.observations}
                      onChange={(e) => setAwardForm({ ...awardForm, observations: e.target.value })}
                      placeholder="Notas opcionales sobre este premio..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Días de Expiración</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={awardForm.expiryDays}
                    onChange={(e) => setAwardForm({ ...awardForm, expiryDays: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Otorgar Monedas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAwardModal(false);
                      setSelectedUser(null);
                      setSelectedReward('');
                    }}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <UserPlus className="w-6 h-6 mr-2 text-green-600" />
                Crear Nuevo Usuario
              </h3>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Crear Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ email: '', password: '', fullName: '', role: 'user' });
                    }}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
