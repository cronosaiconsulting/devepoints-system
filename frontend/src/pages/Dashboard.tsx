import { useEffect, useState } from 'react';
import { userAPI, storeAPI } from '../api/client';
import { Navbar } from '../components/Navbar';
import { Coins, Clock, TrendingUp, AlertCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, historyRes, expiringRes, ordersRes] = await Promise.all([
        userAPI.getBalance(),
        userAPI.getHistory(),
        userAPI.getExpiring(),
        storeAPI.getOrders()
      ]);

      setBalance(balanceRes.data.balance);
      setHistory(historyRes.data.history);
      setExpiring(expiringRes.data.expiringCoins);
      setOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCoupon = async (orderId: number) => {
    try {
      const response = await storeAPI.downloadCoupon(orderId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cupon-${orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading coupon:', error);
      alert('Error al descargar el cupón');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Saldo Actual</p>
                <p className="text-4xl font-bold mt-2">{balance}</p>
                <p className="text-blue-100 text-sm mt-1">Tokens Develand</p>
              </div>
              <Coins className="w-16 h-16 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Transacciones</p>
                <p className="text-3xl font-bold mt-2">{history.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Expiran Pronto</p>
                <p className="text-3xl font-bold mt-2">
                  {expiring.reduce((sum, item) => sum + parseInt(item.expiring_amount), 0)}
                </p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Expiring Warning */}
        {expiring.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">¡Tokens por Expirar Pronto!</h3>
                <div className="mt-2 space-y-1">
                  {expiring.map((item, idx) => (
                    <p key={idx} className="text-yellow-700">
                      <strong>{item.expiring_amount}</strong> Tokens Develand expiran el{' '}
                      {format(new Date(item.expires_at), 'dd MMM yyyy')}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders with Print Coupon */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Mis Compras</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Producto</th>
                    <th className="text-right py-3 px-4">Tokens Gastados</th>
                    <th className="text-center py-3 px-4">Cupón</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{format(new Date(order.created_at), 'dd MMM yyyy')}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{order.product_name}</div>
                        <div className="text-sm text-gray-600">{order.product_description}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600">
                        {order.coins_spent} tokens
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handlePrintCoupon(order.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Imprimir cupón</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Historial de Transacciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Descripción</th>
                  <th className="text-right py-3 px-4">Cantidad</th>
                  <th className="text-left py-3 px-4">Expira</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{format(new Date(tx.created_at), 'dd MMM yyyy')}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          tx.type === 'spend' || tx.type === 'expire'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {tx.type === 'earn' ? 'ganar' : tx.type === 'spend' ? 'compra' : tx.type === 'admin_award' ? 'premio' : tx.type === 'referral' ? 'referido' : 'expirar'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{tx.description}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      tx.type === 'spend' || tx.type === 'expire' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'spend' || tx.type === 'expire' ? '-' : '+'}{tx.amount}
                    </td>
                    <td className="py-3 px-4">
                      {tx.expires_at ? format(new Date(tx.expires_at), 'dd MMM yyyy') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
