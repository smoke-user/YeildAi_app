
import React from 'react';
import { LayoutDashboard, Map, Calculator, Settings, MessageSquareText } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

// Custom Yield AI Logo Component
const YieldAILogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Rotors */}
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="8" />
    <circle cx="80" cy="20" r="12" stroke="currentColor" strokeWidth="8" />
    <circle cx="20" cy="65" r="12" stroke="currentColor" strokeWidth="8" />
    <circle cx="80" cy="65" r="12" stroke="currentColor" strokeWidth="8" />
    
    {/* Body */}
    <rect x="35" y="30" width="30" height="25" rx="4" fill="currentColor" />
    
    {/* Arms */}
    <path d="M28 26 L38 33" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M72 26 L62 33" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M28 59 L38 52" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M72 59 L62 52" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

    {/* Field Waves */}
    <path d="M20 85 C 35 80, 45 95, 80 85" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" className="text-yellow-500 opacity-80" />
    <path d="M25 95 C 40 90, 50 100, 75 95" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" className="text-yellow-500 opacity-60" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();
  
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: t.nav.dashboard, icon: <LayoutDashboard size={20} /> },
    { id: 'MAPPING', label: t.nav.mapping, icon: <Map size={20} /> },
    { id: 'CALCULATOR', label: t.nav.calculator, icon: <Calculator size={20} /> },
    { id: 'AI_CHAT', label: t.nav.chat, icon: <MessageSquareText size={20} /> },
    { id: 'DRONE_CONTROL', label: t.nav.drone, icon: <Settings size={20} /> },
  ];

  return (
    <div className="hidden md:flex w-64 bg-yield-950 dark:bg-[#011c16] text-white flex-col h-full flex-shrink-0 transition-all border-r border-yield-900 dark:border-dark-border z-10 relative">
      <div className="p-6 flex items-center space-x-3 border-b border-yield-900/50">
        <div className="bg-white/10 p-2 rounded-xl relative overflow-hidden group border border-white/10">
          <YieldAILogo className="w-8 h-8 text-yield-500" />
        </div>
        <div>
          <h1 className="font-bold text-xl leading-none tracking-tight text-white">Yield AI</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id
                ? 'bg-yield-600 text-white shadow-lg shadow-yield-900/50 scale-[1.02]'
                : 'text-yield-300 hover:bg-yield-900/50 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-yield-900/50">
        <div className="bg-yield-900/50 rounded-xl p-4 border border-yield-800/30">
          <div className="flex items-center space-x-2 text-sm text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>{t.common.statusOnline}</span>
          </div>
          <p className="text-xs text-yield-500 mt-2 font-mono opacity-60">{t.common.version}</p>
        </div>
      </div>
    </div>
  );
};
