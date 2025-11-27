
import React from 'react';
import { LayoutDashboard, Map, Calculator, Settings } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MobileNavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();

  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: t.nav.dashboard, icon: <LayoutDashboard size={24} /> },
    { id: 'MAPPING', label: t.nav.mapping, icon: <Map size={24} /> },
    { id: 'CALCULATOR', label: t.nav.calculator, icon: <Calculator size={24} /> },
    { id: 'DRONE_CONTROL', label: t.nav.drone, icon: <Settings size={24} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border px-2 pb-safe pt-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-end h-16 pb-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              currentView === item.id
                ? 'text-yield-600 dark:text-yield-400'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors duration-300 ${currentView === item.id ? 'bg-yield-50 dark:bg-yield-900/30' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
