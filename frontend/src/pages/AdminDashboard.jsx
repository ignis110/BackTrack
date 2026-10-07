import { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Database, Settings, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login?role=admin');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <div className="p-8 text-2xl font-bold text-slate-800">Admin Dashboard Overview</div>;
      case 'Users Management':
        return <div className="p-8 text-2xl font-bold text-slate-800">Users Management</div>;
      case 'Courses':
        return <div className="p-8 text-2xl font-bold text-slate-800">Courses</div>;
      case 'System Logs':
        return <div className="p-8 text-2xl font-bold text-slate-800">System Logs</div>;
      case 'Settings':
        return <div className="p-8 text-2xl font-bold text-slate-800">Settings</div>;
      default:
        return <div className="p-8 text-2xl font-bold text-slate-800">Admin Dashboard Overview</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-blue-900 text-white flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold tracking-tight">BackTrack<span className="text-blue-400">.</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full lg:h-auto z-40
        w-64 bg-blue-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:m-4 lg:rounded-[2rem] shadow-2xl overflow-hidden
      `}>
        <div className="p-8 pb-4 hidden lg:block">
          <h1 className="text-2xl font-bold tracking-tight">BackTrack<span className="text-blue-400">.</span></h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          <nav className="space-y-2 mt-8 lg:mt-0">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activeTab === 'Dashboard'} onClick={() => {setActiveTab('Dashboard'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<Users size={20} />} text="Users Management" active={activeTab === 'Users Management'} onClick={() => {setActiveTab('Users Management'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<BookOpen size={20} />} text="Courses" active={activeTab === 'Courses'} onClick={() => {setActiveTab('Courses'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<Database size={20} />} text="System Logs" active={activeTab === 'System Logs'} onClick={() => {setActiveTab('System Logs'); setIsMobileMenuOpen(false);}} />
          </nav>

          <nav className="space-y-2 mt-10">
            <SidebarItem icon={<Settings size={20} />} text="Settings" active={activeTab === 'Settings'} onClick={() => {setActiveTab('Settings'); setIsMobileMenuOpen(false);}} />
            <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 mx-2 rounded-xl transition-colors text-blue-200 hover:text-white hover:bg-white/10 mt-8">
              <div className="flex items-center gap-3">
                <LogOut size={20} />
                <span>Log out</span>
              </div>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-4 pr-4 pl-4 lg:pl-0">
        <header className="flex justify-between items-center px-4 lg:px-8 py-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Admin Control Panel</h2>
            <p className="text-sm lg:text-base text-slate-500 mt-1">System overview and management.</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center font-bold text-xl text-blue-700">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, text, active = false, badge, className = "", onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 mx-2 rounded-xl transition-colors cursor-pointer ${active ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-blue-200 hover:bg-white/10 hover:text-white'} ${className}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{text}</span>
      </div>
      {badge && (
        <span className={`bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      )}
    </button>
  );
}
