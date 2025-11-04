import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { BarChart3, TrendingUp, Coins } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Panel de Análisis
          </h1>
          <p className="text-gray-600">Información y tendencias del sistema</p>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Mejores Usuarios por Saldo
          </h2>
          <div className="space-y-3">
            {analytics?.topUsers?.map((user: any, idx: number) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="font-bold text-blue-600">Ð {user.balance}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Coins className="w-6 h-6 mr-2 text-purple-600" />
            Productos Populares
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Producto</th>
                  <th className="text-left py-2 px-4">Compras</th>
                  <th className="text-left py-2 px-4">Ingresos Totales</th>
                  <th className="text-left py-2 px-4">Precio</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.popularProducts?.map((product: any) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.purchase_count || 0}</td>
                    <td className="py-3 px-4 font-bold text-green-600">
                      Ð {product.total_revenue || 0}
                    </td>
                    <td className="py-3 px-4 text-blue-600">Ð {product.price}</td>
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
