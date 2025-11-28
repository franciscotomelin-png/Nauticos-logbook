
import React from 'react';
import { LayoutDashboard, Anchor, CalendarDays, FileBadge, BookOpen, Menu, X, GraduationCap, Calculator, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'embarkations', label: 'Embarques', icon: Anchor },
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'agenda', label: 'Agenda', icon: GraduationCap },
  { id: 'calendar', label: 'Calendário', icon: CalendarDays },
  { id: 'documents', label: 'Documentos', icon: FileBadge },
  { id: 'notes', label: 'Diário', icon: BookOpen },
];

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sidebar (Desktop) - Deep Navy Premium Look */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0F172A] text-white shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-xl">
               <Anchor className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">Nauticos</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-medium">Pro Logbook</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-2xl backdrop-blur-sm border border-slate-700/50 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-lg">
              OF
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Oficial</p>
              <p className="text-xs text-slate-400 font-medium">Náutica / DPO</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        {/* Mobile Header - Glassmorphism */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white shadow-lg z-30 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="bg-blue-500/20 p-1.5 rounded-lg">
                <Anchor className="w-5 h-5 text-blue-400" />
             </div>
             <span className="font-bold text-lg tracking-tight">Nauticos</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-[#0F172A]/95 backdrop-blur-xl z-40 transition-all duration-300 flex flex-col pt-20 px-6 animate-in fade-in slide-in-from-top-10">
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl border transition-all ${
                    activeTab === item.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={22} />
                  <span className="text-lg font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto mb-10 space-y-4">
              <button 
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700 font-bold"
              >
                <LogOut size={20} />
                Sair da Conta
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 pb-32 md:pb-10 no-scrollbar">
           <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
