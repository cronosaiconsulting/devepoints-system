import { useEffect, useState } from 'react';
import { adminAPI } from '../api/client';
import { Navbar } from '../components/Navbar';
import { Users, TrendingUp, ShoppingBag, Coins, Search, Award } from 'lucide-react';

export const Admin = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalCoinsIssued: 0, totalCoinsSpent: 0, totalOrders: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [awardForm, setAwardForm] = useState({ amount: '', description: '', expiryDays: '180' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(20, 0)
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await adminAPI.searchUsers(searchQuery);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleAwardCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    try {
      await adminAPI.awardCoins(
        selectedUser.id,
        parseInt(awardForm.amount),
        awardForm.description,
        parseInt(awardForm.expiryDays)
      );
      alert('Coins awarded successfully!');
      setAwardForm({ amount: '', description: '', expiryDays: '180' });
      setSelectedUser(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Award failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Coins Issued</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCoinsIssued}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Coins Spent</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCoinsSpent}</p>
              </div>
              <Coins className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Award Coins Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Award className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold">Award Devecoins</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search User</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                    >
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email} - Balance: {user.balance}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold">Selected: {selectedUser.full_name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            )}

            <form onSubmit={handleAwardCoins} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={awardForm.amount}
                  onChange={(e) => setAwardForm({ ...awardForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  value={awardForm.description}
                  onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Days</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={awardForm.expiryDays}
                  onChange={(e) => setAwardForm({ ...awardForm, expiryDays: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedUser}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Award Coins
              </button>
            </form>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Users</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Referrals: {user.referral_count} | Code: {user.referral_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <Coins className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="font-bold text-blue-600">{user.balance}</span>
                      </div>
                      <span className="text-xs text-gray-500">{user.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
