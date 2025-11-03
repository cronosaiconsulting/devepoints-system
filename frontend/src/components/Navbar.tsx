import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, ShoppingBag, Users, Gift, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold flex-shrink-0">
            <img src="/logo_develand.png" alt="Develand" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <span className="hidden sm:inline">Tokens Develand</span>
            <span className="sm:hidden">Develand</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-1 hover:text-blue-200 whitespace-nowrap">
              <LayoutDashboard className="w-5 h-5" />
              <span>Panel</span>
            </Link>
            <Link to="/store" className="flex items-center space-x-1 hover:text-blue-200 whitespace-nowrap">
              <ShoppingBag className="w-5 h-5" />
              <span>Tienda</span>
            </Link>
            <Link to="/referrals" className="flex items-center space-x-1 hover:text-blue-200 whitespace-nowrap">
              <Gift className="w-5 h-5" />
              <span>Referidos</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 hover:text-blue-200 whitespace-nowrap">
                <Users className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}
            <div className="flex items-center space-x-4 border-l border-blue-400 pl-4">
              <span className="text-sm whitespace-nowrap">{user?.fullName}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 hover:text-blue-200 whitespace-nowrap"
              >
                <LogOut className="w-5 h-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-blue-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-blue-500 mt-2 pt-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 hover:text-blue-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Panel</span>
              </Link>
              <Link
                to="/store"
                className="flex items-center space-x-2 hover:text-blue-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Tienda</span>
              </Link>
              <Link
                to="/referrals"
                className="flex items-center space-x-2 hover:text-blue-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Gift className="w-5 h-5" />
                <span>Referidos</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 hover:text-blue-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
              <div className="border-t border-blue-500 pt-3 mt-2">
                <div className="text-sm mb-3">{user?.fullName}</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-blue-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
