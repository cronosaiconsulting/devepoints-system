import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Receipt, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

export const TransactionsView = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      if (filters.amountMin) params.append('amount_min', filters.amountMin);
      if (filters.amountMax) params.append('amount_max', filters.amountMax);

      const response = await adminAPI.getTransactions(100, 0);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (transactionId: number) => {
    if (!confirm('Are you sure you want to refund this transaction?')) return;

    const reason = prompt('Refund reason (optional):');

    try {
      await adminAPI.refundTransaction(transactionId, reason || undefined);
      alert('Transaction refunded successfully!');
      loadTransactions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Refund failed');
    }
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Receipt className="w-8 h-8 mr-3 text-blue-600" />
                All Transactions
              </h1>
              <p className="text-gray-600">Complete transaction history across all users</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="earn">Earn</option>
                  <option value="spend">Spend</option>
                  <option value="admin_award">Admin Award</option>
                  <option value="referral">Referral</option>
                  <option value="expire">Expire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={filters.amountMin}
                  onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="999999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={filters.amountMax}
                  onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">ID</th>
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 font-semibold">Observations</th>
                  <th className="text-left py-3 px-4 font-semibold">Expires</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">#{tx.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{tx.full_name}</div>
                        <div className="text-sm text-gray-500">{tx.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        tx.type === 'spend' || tx.type === 'expire'
                          ? 'bg-red-100 text-red-700'
                          : tx.type === 'admin_award'
                          ? 'bg-purple-100 text-purple-700'
                          : tx.type === 'referral'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${
                      tx.type === 'spend' || tx.type === 'expire' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'spend' || tx.type === 'expire' ? '-' : '+'}{tx.amount} tokens
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3 px-4 text-gray-500 text-sm max-w-xs truncate">
                      {tx.observations || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {tx.expires_at ? format(new Date(tx.expires_at), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      {(tx.type === 'spend' || tx.type === 'admin_award') && !tx.refunded && (
                        <button
                          onClick={() => handleRefund(tx.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Refund
                        </button>
                      )}
                      {tx.refunded && (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded">
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
