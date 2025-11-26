
import React from 'react';
import { LayoutDashboard, Map, Calculator, Settings, Sprout } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();
  
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: t.nav.dashboard, icon: <LayoutDashboard size={20} /> },
    { id: 'MAPPING', label: t.nav.mapping, icon: <Map size={20} /> },
    { id: 'CALCULATOR', label: t.nav.calculator, icon: <Calculator size={20} /> },
    { id: 'DRONE_CONTROL', label: t.nav.drone, icon: <Settings size={20} /> },
  ];

  return (
    <div className="hidden md:flex w-64 bg-slate-900 text-white flex-col h-full flex-shrink-0 transition-all">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
        <div className="bg-green-500 p-2 rounded-lg">
          <Sprout size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">{t.common.appTitle}</h1>
          <p className="text-xs text-slate-400">{t.common.appSubtitle}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.id
                ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">{t.common.appSubtitle}</p>
          <div className="flex items-center space-x-2 text-sm text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>{t.common.statusOnline}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.common.version}</p>
        </div>
      </div>
    </div>
  );
};
