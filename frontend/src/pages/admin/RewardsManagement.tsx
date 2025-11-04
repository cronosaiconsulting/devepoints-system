import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Gift, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Reward {
  id: number;
  amount: number;
  event_title: string;
  default_expiry_days: number;
  description?: string;
  active: boolean;
  created_at: string;
}

export default function RewardsManagement() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({ amount: '', eventTitle: '', defaultExpiryDays: '180', description: '' });
  const [editForm, setEditForm] = useState({ amount: '', eventTitle: '', defaultExpiryDays: '', description: '' });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const response = await adminAPI.getAllRewards();
      setRewards(response.data.rewards);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createReward(
        parseInt(createForm.amount),
        createForm.eventTitle,
        parseInt(createForm.defaultExpiryDays),
        createForm.description
      );
      alert('Reward created successfully!');
      setShowCreateModal(false);
      setCreateForm({ amount: '', eventTitle: '', defaultExpiryDays: '180', description: '' });
      loadRewards();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create reward');
    }
  };

  const handleUpdateReward = async (id: number) => {
    try {
      await adminAPI.updateReward(id, {
        amount: parseInt(editForm.amount),
        event_title: editForm.eventTitle,
        default_expiry_days: parseInt(editForm.defaultExpiryDays),
        description: editForm.description
      });
      alert('Reward updated successfully!');
      setEditingId(null);
      loadRewards();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update reward');
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await adminAPI.updateReward(id, { active: !currentActive });
      loadRewards();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update reward');
    }
  };

  const handleDeleteReward = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      await adminAPI.deleteReward(id);
      alert('Reward deleted successfully!');
      loadRewards();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete reward');
    }
  };

  const startEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setEditForm({
      amount: reward.amount.toString(),
      eventTitle: reward.event_title,
      defaultExpiryDays: reward.default_expiry_days.toString(),
      description: reward.description || ''
    });
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Gift className="w-8 h-8 mr-3 text-purple-600" />
            Rewards Management
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Reward
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rewards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No rewards found. Create your first reward!
                    </td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{reward.id}</td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === reward.id ? (
                          <input
                            type="text"
                            value={editForm.eventTitle}
                            onChange={(e) => setEditForm({ ...editForm, eventTitle: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{reward.event_title}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === reward.id ? (
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                            rows={2}
                          />
                        ) : (
                          <span className="text-gray-700">{reward.description || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === reward.id ? (
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="border rounded px-2 py-1 w-24"
                          />
                        ) : (
                          <span className="font-bold text-blue-600">Ð {reward.amount}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === reward.id ? (
                          <input
                            type="number"
                            value={editForm.defaultExpiryDays}
                            onChange={(e) => setEditForm({ ...editForm, defaultExpiryDays: e.target.value })}
                            className="border rounded px-2 py-1 w-24"
                          />
                        ) : (
                          <span className="text-gray-700">{reward.default_expiry_days} days</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleActive(reward.id, reward.active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reward.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {reward.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(reward.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {editingId === reward.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateReward(reward.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(reward)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Reward Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-green-600" />
              Create New Reward
            </h3>
            <form onSubmit={handleCreateReward}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={createForm.eventTitle}
                  onChange={(e) => setCreateForm({ ...createForm, eventTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Ð)
                </label>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Expiry Days
                </label>
                <input
                  type="number"
                  value={createForm.defaultExpiryDays}
                  onChange={(e) => setCreateForm({ ...createForm, defaultExpiryDays: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Number of days before coins expire (default: 180)</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Impulso
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Describe qué incluye este impulso..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ amount: '', eventTitle: '', defaultExpiryDays: '180', description: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Create Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
