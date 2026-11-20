import { useState } from 'react';
import Sidebar from './Sidebar';
import AppLogo from '../ui/AppLogo';
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-100 px-4 py-4 lg:px-8 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <AppLogo size="xs" className="lg:hidden" />
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
