
import React, { useState, useEffect } from 'react';
import { Plane, Battery, Wifi, Activity, Power, RefreshCw } from 'lucide-react';
import { DroneStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const DroneConnection: React.FC = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<DroneStatus>({
    connected: false,
    battery: 0,
    altitude: 0,
    speed: 0,
    status: 'OFFLINE',
    model: 'DJI Agras T30 (Simulated)',
  });

  const [loading, setLoading] = useState(false);

  const toggleConnection = () => {
    if (status.connected) {
      setStatus(prev => ({ ...prev, connected: false, status: 'OFFLINE', battery: 0, altitude: 0 }));
    } else {
      setLoading(true);
      setTimeout(() => {
        setStatus({
          connected: true,
          battery: 87,
          altitude: 0,
          speed: 0,
          status: 'IDLE',
          model: 'DJI Agras T30 (Simulated)',
        });
        setLoading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status.connected) {
      interval = setInterval(() => {
        setStatus(prev => ({
          ...prev,
          battery: Math.max(0, prev.battery - 0.1),
          altitude: prev.status === 'MAPPING' ? 30 + Math.random() * 2 : 0,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status.connected, status.status]);

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-dark-border transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-yield-900 dark:text-white flex items-center gap-2">
          <Plane className="text-blue-600 dark:text-blue-400" />
          {t.drone.title}
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${status.connected ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
          {status.connected ? t.drone.statusConnected : t.drone.statusDisconnected}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-yield-900/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">{t.drone.model}</label>
            <div className="text-slate-800 dark:text-gray-200 font-medium break-words">{status.model}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-yield-900/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border">
               <div className="flex items-center gap-2 mb-1">
                 <Battery size={16} className={status.battery < 20 ? "text-red-500" : "text-green-500"} />
                 <span className="text-xs text-slate-500 dark:text-slate-400">{t.drone.battery}</span>
               </div>
               <div className="text-2xl font-bold text-slate-800 dark:text-white">{status.connected ? status.battery.toFixed(0) : 0}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-yield-900/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border">
               <div className="flex items-center gap-2 mb-1">
                 <Wifi size={16} className="text-blue-500" />
                 <span className="text-xs text-slate-500 dark:text-slate-400">{t.drone.signal}</span>
               </div>
               <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white truncate">{status.connected ? t.drone.signalStrong : '-'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-yield-900/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border">
               <div className="flex items-center gap-2 mb-1">
                 <Activity size={16} className="text-purple-500" />
                 <span className="text-xs text-slate-500 dark:text-slate-400">{t.drone.altitude}</span>
               </div>
               <div className="text-2xl font-bold text-slate-800 dark:text-white">{status.altitude.toFixed(1)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-yield-900/20 p-4 rounded-xl border border-slate-100 dark:border-dark-border">
               <div className="flex items-center gap-2 mb-1">
                 <RefreshCw size={16} className="text-orange-500" />
                 <span className="text-xs text-slate-500 dark:text-slate-400">{t.drone.status}</span>
               </div>
               <div className="text-lg font-bold text-slate-800 dark:text-white">{status.status}</div>
            </div>
          </div>

          <button
            onClick={toggleConnection}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              status.connected 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900' 
                : 'bg-yield-600 text-white hover:bg-yield-700 shadow-lg shadow-yield-900/20'
            }`}
          >
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : status.connected ? (
              <>
                <Power size={20} /> {t.drone.btnDisconnect}
              </>
            ) : (
              <>
                <Wifi size={20} /> {t.drone.btnConnect}
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
        <strong>{t.drone.note}</strong> {t.drone.noteText}
      </div>
    </div>
  );
};
