import { useState } from 'react';
import { LayoutDashboard, BookOpen, AlertTriangle, FileText, Bell, TrendingUp, Settings, LogOut, Calendar, Clock, CheckCircle2, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'My Subjects':
        return <div className="p-8 text-2xl font-bold text-pine">My Subjects (Under Construction)</div>;
      case 'My Backlogs':
        return <div className="p-8 text-2xl font-bold text-pine">My Backlogs (Under Construction)</div>;
      case 'Documents':
        return <div className="p-8 text-2xl font-bold text-pine">Documents (Under Construction)</div>;
      case 'Notifications':
        return <div className="p-8 text-2xl font-bold text-pine">Notifications (Under Construction)</div>;
      case 'Progress':
        return <div className="p-8 text-2xl font-bold text-pine">Academic Progress (Under Construction)</div>;
      case 'Settings':
        return <div className="p-8 text-2xl font-bold text-pine">Settings (Under Construction)</div>;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-brandy-light font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-pine text-brandy flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold tracking-tight">BackTrack<span className="text-copper">.</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full lg:h-auto z-40
        w-64 bg-pine text-brandy flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:m-4 lg:rounded-[2rem] shadow-2xl overflow-hidden
      `}>
        <div className="p-8 pb-4 hidden lg:block">
          <h1 className="text-2xl font-bold tracking-tight">BackTrack<span className="text-copper">.</span></h1>
        </div>
        <div className="p-8 pb-4 block lg:hidden mt-12">
          <h2 className="text-lg font-bold text-brandy/70">Menu</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          <div className="text-xs font-semibold text-dingley uppercase tracking-wider mb-4 px-4 hidden lg:block">Menu</div>
          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activeTab === 'Dashboard'} onClick={() => {setActiveTab('Dashboard'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<BookOpen size={20} />} text="My Subjects" active={activeTab === 'My Subjects'} onClick={() => {setActiveTab('My Subjects'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<AlertTriangle size={20} />} text="My Backlogs" badge="2" active={activeTab === 'My Backlogs'} onClick={() => {setActiveTab('My Backlogs'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<FileText size={20} />} text="Documents" active={activeTab === 'Documents'} onClick={() => {setActiveTab('Documents'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<Bell size={20} />} text="Notifications" badge="3" badgeColor="bg-copper text-white" active={activeTab === 'Notifications'} onClick={() => {setActiveTab('Notifications'); setIsMobileMenuOpen(false);}} />
            <SidebarItem icon={<TrendingUp size={20} />} text="Progress" active={activeTab === 'Progress'} onClick={() => {setActiveTab('Progress'); setIsMobileMenuOpen(false);}} />
          </nav>

          <div className="text-xs font-semibold text-dingley uppercase tracking-wider mt-10 mb-4 px-4 hidden lg:block">Account</div>
          <nav className="space-y-2 lg:mt-0 mt-10">
            <SidebarItem icon={<Settings size={20} />} text="Settings" active={activeTab === 'Settings'} onClick={() => {setActiveTab('Settings'); setIsMobileMenuOpen(false);}} />
            <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 mx-2 rounded-xl transition-colors text-dingley hover:text-copper hover:bg-copper/10 mt-8">
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
        {/* Header */}
        <header className="flex justify-between items-center px-4 lg:px-8 py-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-pine">Good morning, Rahul</h2>
            <p className="text-sm lg:text-base text-kombu/70 mt-1">Here is your academic progress overview.</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-brandy border-4 border-white shadow-sm flex items-center justify-center font-bold text-xl text-pine">R</div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  const [showFullHistory, setShowFullHistory] = useState(false);

  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-20 lg:pb-0">
      {/* Left Column (Main Stats) */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Brandy Card - Subjects */}
          <div className="bg-brandy rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full opacity-50 blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <h3 className="font-semibold text-pine mb-4 text-lg">Subjects</h3>
            <div className="flex gap-6">
              <div>
                <div className="text-4xl font-bold text-pine">8</div>
                <div className="text-xs font-semibold text-pine/70 mt-1 uppercase">Total</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pine">6</div>
                <div className="text-xs font-semibold text-pine/70 mt-1 uppercase">Passed</div>
              </div>
            </div>
            <div className="mt-6 flex h-12 items-end gap-2 border-b-2 border-pine/20 pb-2">
              <div className="w-2 bg-pine h-[80%] rounded-t-sm"></div>
              <div className="w-2 bg-kombu h-[60%] rounded-t-sm"></div>
              <div className="w-2 bg-pine/70 h-[100%] rounded-t-sm"></div>
              <div className="w-2 bg-pine h-[40%] rounded-t-sm"></div>
            </div>
          </div>

          {/* Copper Card - Backlogs Summary */}
          <div className="bg-copper rounded-[2rem] p-6 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/20 rounded-tl-full opacity-30 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform"></div>
            <h3 className="font-semibold text-white mb-4 text-lg">Backlog Status</h3>
            <div className="flex gap-4 sm:gap-8">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white">2</span>
                </div>
                <div className="text-xs font-semibold text-brandy mt-1 uppercase">Pending</div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white">1</span>
                </div>
                <div className="text-xs font-semibold text-brandy mt-1 uppercase">Scheduled</div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white">0</span>
                </div>
                <div className="text-xs font-semibold text-brandy mt-1 uppercase">Cleared</div>
              </div>
            </div>
            
            {/* Decorative wavy line */}
            <div className="mt-6 h-12 flex items-center overflow-hidden opacity-60">
                <svg viewBox="0 0 400 40" className="w-full h-full stroke-white stroke-2 fill-none" preserveAspectRatio="none">
                  <path d="M0 20 Q 20 0, 40 20 T 80 20 T 120 20 T 160 20 T 200 20 T 240 20 T 280 20 T 320 20 T 360 20 T 400 20" />
                </svg>
            </div>
          </div>
        </div>

        {/* Middle Row Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dingley Card - Risk Level */}
          <div className="bg-dingley rounded-[2rem] p-6 shadow-sm col-span-1 lg:col-span-1 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-kombu rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
              <h3 className="font-semibold text-brandy-light mb-2 text-lg">Risk Assessment</h3>
              <div className="flex items-center gap-4 mt-6">
                <div className="text-3xl font-bold text-white">Medium</div>
              </div>
              <p className="text-sm text-brandy/80 mt-2">Based on 2 pending subjects</p>
          </div>

          {/* Kombu Card - Next Exam */}
          <div className="bg-kombu rounded-[2rem] p-6 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="absolute -right-4 -top-8 text-9xl text-dingley opacity-20">★</div>
              <h3 className="font-semibold text-brandy mb-2 text-lg">Next Exam Schedule</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">Nov 20</div>
                  <div className="text-xs sm:text-sm font-semibold text-brandy/70 mt-1 uppercase">Date</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">10:00 AM</div>
                  <div className="text-xs sm:text-sm font-semibold text-brandy/70 mt-1 uppercase">Time</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">DBMS</div>
                  <div className="text-xs sm:text-sm font-semibold text-brandy/70 mt-1 uppercase">Subject</div>
                </div>
              </div>
          </div>
        </div>

        {/* Bottom Section - Action Required */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-xl text-pine">Action Required</h3>
            <button className="text-sm font-semibold text-kombu hover:text-copper bg-white px-4 py-2 rounded-full shadow-sm transition-colors cursor-pointer">View All</button>
          </div>
          
          <div className="space-y-4">
            {/* Action Item 1 */}
            <div className="bg-copper/20 hover:bg-copper/30 transition-colors cursor-pointer rounded-2xl p-1 shadow-sm flex flex-col sm:flex-row border border-copper/10">
              <div className="bg-white/60 rounded-xl p-4 flex items-center gap-4 w-full sm:w-1/3">
                <div className="bg-white p-2 rounded-full text-copper shadow-sm"><AlertTriangle size={20} /></div>
                <div>
                  <div className="font-bold text-pine">Upload Document</div>
                  <div className="text-xs text-copper font-semibold uppercase mt-1">Pending</div>
                </div>
              </div>
              <div className="p-4 flex flex-col justify-center w-full sm:w-2/3">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-pine">Operating Systems (BCA302)</div>
                  <span className="bg-white text-copper text-xs font-bold px-3 py-1 rounded-full border border-copper/20">Attempt 1</span>
                </div>
                <p className="text-sm text-kombu/80 mt-1">Please upload your previous semester marksheet to verify this backlog application.</p>
              </div>
            </div>

            {/* Action Item 2 */}
            <div className="bg-brandy/40 hover:bg-brandy/60 transition-colors cursor-pointer rounded-2xl p-1 shadow-sm flex flex-col sm:flex-row border border-brandy/30">
              <div className="bg-white/60 rounded-xl p-4 flex items-center gap-4 w-full sm:w-1/3">
                <div className="bg-white p-2 rounded-full text-dingley shadow-sm"><CheckCircle2 size={20} /></div>
                <div>
                  <div className="font-bold text-pine">Faculty Verified</div>
                  <div className="text-xs text-dingley font-semibold uppercase mt-1">Ready</div>
                </div>
              </div>
              <div className="p-4 flex flex-col justify-center w-full sm:w-2/3">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-pine">Database Mgmt (BCA301)</div>
                  <span className="bg-white text-dingley text-xs font-bold px-3 py-1 rounded-full border border-brandy">Attempt 2</span>
                </div>
                <p className="text-sm text-kombu/80 mt-1">Dr. Sharma has verified your application. Proceed to pay exam fee.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column (Timeline & Calendar) */}
      <div className="w-full xl:w-80 flex flex-col gap-6">
        
        {/* Timeline Widget */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-brandy-light flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-xl text-pine">Activity</h3>
              <p className="text-sm text-dingley">Today's timeline</p>
            </div>
            <button className="bg-brandy-light hover:bg-brandy/50 text-pine text-xs font-bold px-3 py-1.5 rounded-full transition">All ⌄</button>
          </div>

          <div className="relative border-l-2 border-brandy-light ml-4 space-y-8 mt-8 pb-4">
            <TimelineItem 
              time="09:15" 
              title="Faculty Remark Added" 
              desc="Dr. Sharma left a remark on OS backlog." 
              color="bg-copper/20 text-copper border-white"
              icon={<FileText size={16} />}
            />
            <TimelineItem 
              time="10:30" 
              title="Status Changed" 
              desc="DBMS moved to 'Exam Scheduled'" 
              color="bg-dingley/20 text-dingley border-white"
              icon={<Calendar size={16} />}
              active
            />
            <TimelineItem 
              time="11:45" 
              title="Document Uploaded" 
              desc="Marksheet.pdf successfully processed." 
              color="bg-brandy/40 text-pine border-white"
              icon={<CheckCircle2 size={16} />}
            />
            <TimelineItem 
              time="14:00" 
              title="Login" 
              desc="New session started from IP." 
              color="bg-brandy-light text-kombu border-white"
              icon={<Clock size={16} />}
            />
            
            {showFullHistory && (
              <>
                <TimelineItem 
                  time="Yesterday" 
                  title="Backlog Registered" 
                  desc="Applied for OS backlog." 
                  color="bg-brandy-light text-kombu border-white"
                  icon={<FileText size={16} />}
                />
              </>
            )}
          </div>
          
          <button 
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="w-full mt-4 bg-pine hover:bg-kombu text-brandy font-semibold py-3 rounded-2xl transition shadow-md cursor-pointer"
          >
            {showFullHistory ? 'Show less' : 'View full history'}
          </button>
        </div>

      </div>
    </div>
  );
}

function SidebarItem({ icon, text, active = false, badge, badgeColor = "bg-copper text-white", className = "", onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 mx-2 rounded-xl transition-colors cursor-pointer ${active ? 'bg-brandy-light text-pine font-semibold shadow-sm' : 'text-brandy/70 hover:bg-white/10 hover:text-white'} ${className}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{text}</span>
      </div>
      {badge && (
        <span className={`${badgeColor} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function TimelineItem({ time, title, desc, color, icon, active = false }) {
  return (
    <div className="relative pl-6">
      <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border-4 ${color} shadow-sm z-10`}>
        {icon}
      </div>
      {active && (
        <div className="absolute top-3 -left-4 w-[150%] border-t border-dashed border-brandy -z-10"></div>
      )}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-dingley mb-1">{time}</span>
        <div className={`bg-brandy-light/50 rounded-2xl p-3 border border-brandy-light ${active ? 'ring-1 ring-dingley/50 bg-dingley/5' : ''}`}>
          <h4 className="font-semibold text-pine text-sm">{title}</h4>
          <p className="text-xs text-kombu mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
