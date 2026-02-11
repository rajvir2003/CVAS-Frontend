import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Truck, 
  Users, 
  Shield, 
  Settings, 
  LogOut,
  FileText,
  Plus,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'WORKER':
        return [
          { path: '/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/vehicle-entry', icon: Truck, label: 'Vehicle Entry' },
          { path: '/profile', icon: Settings, label: 'Profile' }
        ];
      case 'CHECKPOINT ADMIN':
        return [
          { path: '/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/manage-workers', icon: Users, label: 'Manage Workers' },
          { path: '/vehicle-logs', icon: FileText, label: 'Vehicle Logs' },
          { path: '/profile', icon: Settings, label: 'Profile' }
        ];
      case 'SUPER ADMIN':
        return [
          { path: '/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/manage-checkpoints', icon: Shield, label: 'Manage Checkpoints' },
          { path: '/all-vehicles', icon: Truck, label: 'All Vehicles' },
          { path: '/profile', icon: Settings, label: 'Profile' }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-8 w-8 text-green-400" />
          <span className="text-xl font-bold">CVAS</span>
        </div>
        <p className="text-sm text-gray-400">Civil Vehicle Acquisition System</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="border-t border-gray-700 pt-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.serviceNumber}</p>
            <p className="text-xs text-gray-400">{user?.unit}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;