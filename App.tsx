
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FieldMapping } from './components/FieldMapping';
import { AgroCalculator } from './components/AgroCalculator';
import { DroneConnection } from './components/DroneConnection';
import { AIChat } from './components/AIChat';
import { KnowledgeManager } from './components/KnowledgeManager'; // NEW
import { MobileNavigation } from './components/MobileNavigation';
import { PresentationMode } from './components/PresentationMode';
import { ViewState, Field } from './types';
import { Map, TrendingUp, Calendar, AlertTriangle, Globe, Moon, Sun, Trash2, FileText, Download, CheckCircle, Database } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Language } from './utils/translations';
import { DB } from './services/db'; 
import { StorageService } from './services/storageService'; 

// Duplicate Logo Component for Header usage
const YieldAILogoSmall = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="8" />
    <circle cx="80" cy="20" r="12" stroke="currentColor" strokeWidth="8" />
    <circle cx="20" cy="65" r="12" stroke="currentColor" strokeWidth="8" />
    <circle cx="80" cy="65" r="12" stroke="currentColor" strokeWidth="8" />
    <rect x="35" y="30" width="30" height="25" rx="4" fill="currentColor" />
    <path d="M28 26 L38 33" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M72 26 L62 33" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M28 59 L38 52" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M72 59 L62 52" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M20 85 C 35 80, 45 95, 80 85" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" className="text-yellow-500 opacity-80" />
  </svg>
);

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-yield-800 dark:bg-yield-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
    <CheckCircle size={20} className="text-green-400" />
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">×</button>
  </div>
);

const Dashboard: React.FC<{ 
  fields: Field[], 
  setView: (view: ViewState) => void, 
  totalArea: number,
  onDeleteField: (id: string) => void,
  onLoadDemo: () => void
}> = ({ fields, setView, totalArea, onDeleteField, onLoadDemo }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border flex items-center gap-4 transition-colors">
            <div className="bg-yield-100 dark:bg-yield-900 p-3 rounded-xl text-yield-600 dark:text-yield-100">
               <Map size={24} />
            </div>
            <div>
               <div className="text-yield-800 dark:text-gray-400 text-sm font-medium">{t.dashboard.totalFields}</div>
               <div className="text-2xl font-bold text-yield-900 dark:text-white">{fields.length}</div>
            </div>
         </div>
         <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border flex items-center gap-4 transition-colors">
            <div className="bg-yield-100 dark:bg-yield-900 p-3 rounded-xl text-yield-600 dark:text-yield-100">
               <TrendingUp size={24} />
            </div>
            <div>
               <div className="text-yield-800 dark:text-gray-400 text-sm font-medium">{t.dashboard.totalArea}</div>
               <div className="text-2xl font-bold text-yield-900 dark:text-white">{totalArea.toFixed(2)} га</div>
            </div>
         </div>
         <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border flex items-center gap-4 transition-colors">
            <div className="bg-yield-100 dark:bg-yield-900 p-3 rounded-xl text-yield-600 dark:text-yield-100">
               <Calendar size={24} />
            </div>
            <div>
               <div className="text-yield-800 dark:text-gray-400 text-sm font-medium">{t.dashboard.season}</div>
               <div className="text-2xl font-bold text-yield-900 dark:text-white">2025</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border transition-colors">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg text-yield-900 dark:text-white">{t.dashboard.activeFields}</h3>
               {fields.length === 0 && (
                 <button 
                   onClick={onLoadDemo}
                   className="text-xs bg-slate-100 dark:bg-yield-900 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                 >
                    <Download size={14} /> {t.common.loadDemo}
                 </button>
               )}
            </div>
            {fields.length === 0 ? (
              <div className="text-center py-10 text-yield-800 dark:text-gray-400 bg-yield-50 dark:bg-yield-950/30 rounded-xl border border-dashed border-yield-200 dark:border-dark-border">
                 <p>{t.dashboard.noFields}</p>
                 <button onClick={() => setView('MAPPING')} className="text-yield-600 font-medium mt-2 hover:underline">{t.dashboard.addField}</button>
              </div>
            ) : (
              <div className="space-y-3">
                 {fields.map(field => (
                    <div key={field.id} className="flex justify-between items-start p-4 bg-yield-50 dark:bg-yield-900/20 rounded-xl border border-yield-100 dark:border-dark-border group">
                       <div className="space-y-1">
                          <div className="font-bold text-yield-900 dark:text-white flex items-center gap-2">
                            {field.name}
                            {(field.seedPlan || field.fertilizerPlan) && (
                              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                <FileText size={10} /> AI Plans
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-yield-600 dark:text-gray-400">{t.dashboard.dateAdded}: {field.plantingDate}</div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <div className="px-3 py-1 bg-yield-100 dark:bg-yield-800 text-yield-700 dark:text-yield-100 rounded-lg text-sm font-bold">
                            {field.areaHa} га
                         </div>
                         <button 
                            onClick={() => onDeleteField(field.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title={t.common.delete}
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                 ))}
              </div>
            )}
         </div>

         <div className="bg-gradient-to-br from-yield-900 to-yield-800 dark:from-black dark:to-yield-950 text-white p-6 rounded-2xl shadow-lg border border-transparent dark:border-dark-border">
            <h3 className="font-bold text-lg mb-4">{t.dashboard.quickActions}</h3>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setView('DRONE_CONTROL')} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl text-left transition-colors backdrop-blur-sm">
                  <div className="text-blue-200 mb-2 font-bold">{t.dashboard.connectDrone}</div>
                  <p className="text-xs text-blue-100/70">{t.dashboard.connectDroneDesc}</p>
               </button>
               <button onClick={() => setView('CALCULATOR')} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl text-left transition-colors backdrop-blur-sm">
                  <div className="text-green-300 mb-2 font-bold">{t.dashboard.calcFertilizer}</div>
                  <p className="text-xs text-green-100/70">{t.dashboard.calcFertilizerDesc}</p>
               </button>
            </div>
            <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/10 flex items-start gap-3">
               <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
               <div className="text-sm text-gray-200">
                  <span className="text-yellow-400 font-bold block mb-1">{t.dashboard.weatherWarning}</span>
                  {t.dashboard.weatherDesc}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('DASHBOARD');
  const [fields, setFields] = useState<Field[]>([]); 
  const [isDbReady, setIsDbReady] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  // Robust Initialization with Dual Loading (DB + Backup)
  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      try {
          // 1. Try to load from IndexedDB
          let loadedFields = await DB.getAllFields();
          
          // 2. If DB is empty, check Backup LocalStorage
          if (loadedFields.length === 0) {
              console.log("[App] DB empty, checking backup...");
              const backupFields = StorageService.getFields();
              if (backupFields.length > 0) {
                  console.log("[App] Restoring from backup...");
                  loadedFields = backupFields;
                  // Restore backup to DB
                  for (const f of backupFields) {
                      await DB.saveField(f);
                  }
              }
          }

          if (mounted) {
              setFields(loadedFields);
              setIsDbReady(true);
          }
      } catch (e) {
          console.error("Data Initialization Failed", e);
          if (mounted) setIsDbReady(true); 
      }
    };
    initData();

    return () => { mounted = false; };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveField = async (field: Field) => {
    try {
        // Dual Write Strategy
        await DB.saveField(field); // 1. Save to DB
        
        // Refresh State
        const updated = await DB.getAllFields();
        setFields(updated);
        
        StorageService.saveFields(updated); // 2. Save to Backup
        
        showToast(t.common.dataSaved);
        setView('DASHBOARD');
    } catch (e) {
        console.error(e);
        showToast("Error saving field");
    }
  };

  const handleDeleteField = async (id: string) => {
    if (confirm("Are you sure you want to delete this field?")) {
      await DB.deleteField(id);
      
      const updated = await DB.getAllFields();
      setFields(updated);
      StorageService.saveFields(updated); // Update Backup
      
      showToast(t.common.fieldDeleted);
    }
  };

  const handleUpdateField = async (updatedField: Field) => {
    try {
        // Dual Write
        await DB.saveField(updatedField);
        
        const updated = await DB.getAllFields();
        setFields(updated);
        StorageService.saveFields(updated); // Update Backup

        showToast(t.calculator.planSaved);
    } catch (e) {
        console.error("Update failed", e);
    }
  };

  const handleLoadDemo = async () => {
    const demoFields = StorageService.getDemoFields();
    for (const f of demoFields) {
        await DB.saveField(f);
    }
    const updated = await DB.getAllFields();
    setFields(updated);
    StorageService.saveFields(updated); // Backup Demo Data
    
    showToast("Demo Data Loaded!");
  };

  const totalArea = fields.reduce((acc, field) => acc + field.areaHa, 0);

  // Simple loading screen
  if (!isDbReady) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-yield-50 dark:bg-dark-bg text-yield-600 dark:text-yield-100 gap-4">
          <Database size={40} className="animate-pulse" />
          <p className="font-mono text-sm">Initializing Database...</p>
        </div>
      );
  }

  // Intercept Presentation View
  if (currentView === 'PRESENTATION') {
     return <PresentationMode onClose={() => setView('DASHBOARD')} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-yield-50 dark:bg-dark-bg font-sans transition-colors duration-300">
      <Sidebar currentView={currentView} setView={setView} />
      
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="md:hidden bg-yield-600 p-2 rounded-lg text-white">
                <YieldAILogoSmall className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-yield-900 dark:text-white leading-tight">
                  {currentView === 'DASHBOARD' && t.dashboard.title}
                  {currentView === 'MAPPING' && t.nav.mapping}
                  {currentView === 'CALCULATOR' && t.nav.calculator}
                  {currentView === 'DRONE_CONTROL' && t.nav.drone}
                  {currentView === 'AI_CHAT' && t.nav.chat}
                  {currentView === 'KNOWLEDGE_BASE' && "Knowledge Base"}
                </h2>
                <p className="text-yield-600 dark:text-gray-400 text-sm md:text-base">{t.dashboard.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button 
                onClick={toggleTheme}
                className="p-2 bg-white dark:bg-dark-card text-yield-600 dark:text-yield-100 rounded-lg shadow-sm border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-yield-900 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="flex items-center gap-2 bg-white dark:bg-dark-card px-3 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-dark-border">
                 <Globe size={16} className="text-yield-400" />
                 <select 
                   value={language}
                   onChange={(e) => setLanguage(e.target.value as Language)}
                   className="bg-transparent text-sm font-medium text-yield-700 dark:text-gray-200 outline-none cursor-pointer"
                 >
                   <option value="ru" className="text-black">Русский</option>
                   <option value="uz" className="text-black">O'zbek</option>
                   <option value="en" className="text-black">English</option>
                 </select>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white dark:bg-dark-card px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-dark-border">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yield-600 dark:text-gray-300">{t.common.server}</span>
              </div>
            </div>
          </header>

          {currentView === 'DASHBOARD' && (
            <Dashboard 
              fields={fields} 
              setView={setView} 
              totalArea={totalArea} 
              onDeleteField={handleDeleteField}
              onLoadDemo={handleLoadDemo}
            />
          )}

          {currentView === 'MAPPING' && (
            <FieldMapping onSaveField={handleSaveField} />
          )}

          {currentView === 'CALCULATOR' && (
            <AgroCalculator fields={fields} onUpdateField={handleUpdateField} />
          )}

          {currentView === 'DRONE_CONTROL' && (
            <DroneConnection />
          )}

          {currentView === 'AI_CHAT' && (
            <AIChat fields={fields} />
          )}

          {currentView === 'KNOWLEDGE_BASE' && (
            <KnowledgeManager />
          )}
        </div>
        
        {/* Toast Notification */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </main>

      <MobileNavigation currentView={currentView} setView={setView} />
    </div>
  );
};

export default App;
