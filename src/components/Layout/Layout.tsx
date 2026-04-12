import React, { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated || isAuthRoute) {
    return <div className="min-h-screen bg-gray-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 md:ml-0 overflow-hidden">
        <header className="md:hidden sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold text-white">CVAS</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="h-full p-4 sm:p-5 lg:p-6 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;