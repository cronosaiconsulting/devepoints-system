import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, ShoppingBag, Users, Gift, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <img src="/logo_develand.png" alt="Develand" className="w-8 h-8 object-contain" />
            <span>Tokens Develand</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-1 hover:text-blue-200">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/store" className="flex items-center space-x-1 hover:text-blue-200">
              <ShoppingBag className="w-5 h-5" />
              <span>Store</span>
            </Link>
            <Link to="/referrals" className="flex items-center space-x-1 hover:text-blue-200">
              <Gift className="w-5 h-5" />
              <span>Referrals</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 hover:text-blue-200">
                <Users className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.fullName}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 hover:text-blue-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
