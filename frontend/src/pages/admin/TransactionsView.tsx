import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Receipt } from 'lucide-react';
import { format } from 'date-fns';

export const TransactionsView = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await adminAPI.getTransactions(100, 0);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Receipt className="w-8 h-8 mr-3 text-blue-600" />
            All Transactions
          </h1>
          <p className="text-gray-600">Complete transaction history across all users</p>
        </div>

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
                      {tx.type === 'spend' || tx.type === 'expire' ? '-' : '+'}Ð {tx.amount}
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
