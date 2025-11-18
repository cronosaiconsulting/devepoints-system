import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, TrendingUp, ShoppingCart, Receipt, BarChart3, Gift, Settings, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

export const AdminSidebar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin', label: 'Panel', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/rewards', label: 'Recompensas', icon: Gift },
    { path: '/admin/aprobaciones', label: 'Aprobaciones', icon: Zap },
    { path: '/admin/products', label: 'Gestión de Catálogo', icon: Package },
    { path: '/admin/transactions', label: 'Transacciones', icon: Receipt },
    { path: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
    { path: '/admin/analytics', label: 'Analíticas', icon: BarChart3 },
    { path: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 text-white min-h-screen p-4
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="mb-8 flex flex-col items-center">
        <img src="/logo_develand.png" alt="Develand" className="w-20 h-20 object-contain mb-3" />
        <h2 className="text-xl font-bold text-blue-400 mb-1">Admin Panel</h2>
        <p className="text-gray-400 text-sm">Tokens Develand System</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <Link
          to="/dashboard"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Volver a Vista de Usuario</span>
        </Link>
      </div>
    </aside>
    </>
  );
};
