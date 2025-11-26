
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { FieldMapping } from './components/FieldMapping';
import { AgroCalculator } from './components/AgroCalculator';
import { DroneConnection } from './components/DroneConnection';
import { MobileNavigation } from './components/MobileNavigation';
import { ViewState, Field } from './types';
import { Map, TrendingUp, Calendar, AlertTriangle, Globe } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './utils/translations';

const Dashboard: React.FC<{ 
  fields: Field[], 
  setView: (view: ViewState) => void, 
  totalArea: number 
}> = ({ fields, setView, totalArea }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
               <Map size={24} />
            </div>
            <div>
               <div className="text-slate-500 text-sm font-medium">{t.dashboard.totalFields}</div>
               <div className="text-2xl font-bold text-slate-800">{fields.length}</div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
               <TrendingUp size={24} />
            </div>
            <div>
               <div className="text-slate-500 text-sm font-medium">{t.dashboard.totalArea}</div>
               <div className="text-2xl font-bold text-slate-800">{totalArea.toFixed(2)} га</div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
               <Calendar size={24} />
            </div>
            <div>
               <div className="text-slate-500 text-sm font-medium">{t.dashboard.season}</div>
               <div className="text-2xl font-bold text-slate-800">2025</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-800">{t.dashboard.activeFields}</h3>
            {fields.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <p>{t.dashboard.noFields}</p>
                 <button onClick={() => setView('MAPPING')} className="text-green-600 font-medium mt-2 hover:underline">{t.dashboard.addField}</button>
              </div>
            ) : (
              <div className="space-y-3">
                 {fields.map(field => (
                    <div key={field.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <div>
                          <div className="font-bold text-slate-800">{field.name}</div>
                          <div className="text-xs text-slate-500">{t.dashboard.dateAdded}: {field.plantingDate}</div>
                       </div>
                       <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                          {field.areaHa} га
                       </div>
                    </div>
                 ))}
              </div>
            )}
         </div>

         <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold text-lg mb-4">{t.dashboard.quickActions}</h3>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setView('DRONE_CONTROL')} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-xl text-left transition-colors">
                  <div className="text-blue-400 mb-2 font-bold">{t.dashboard.connectDrone}</div>
                  <p className="text-xs text-slate-300">{t.dashboard.connectDroneDesc}</p>
               </button>
               <button onClick={() => setView('CALCULATOR')} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-xl text-left transition-colors">
                  <div className="text-green-400 mb-2 font-bold">{t.dashboard.calcFertilizer}</div>
                  <p className="text-xs text-slate-300">{t.dashboard.calcFertilizerDesc}</p>
               </button>
            </div>
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
               <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
               <div className="text-sm text-slate-300">
                  <span className="text-yellow-500 font-bold block mb-1">{t.dashboard.weatherWarning}</span>
                  {t.dashboard.weatherDesc}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('DASHBOARD');
  const [fields, setFields] = useState<Field[]>([]);
  const { language, setLanguage, t } = useLanguage();

  const handleSaveField = (field: Field) => {
    setFields([...fields, field]);
  };

  const totalArea = fields.reduce((acc, field) => acc + field.areaHa, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
      <Sidebar currentView={currentView} setView={setView} />
      
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                {currentView === 'DASHBOARD' && t.dashboard.title}
                {currentView === 'MAPPING' && t.nav.mapping}
                {currentView === 'CALCULATOR' && t.nav.calculator}
                {currentView === 'DRONE_CONTROL' && t.nav.drone}
              </h2>
              <p className="text-slate-500 text-sm md:text-base">{t.dashboard.subtitle}</p>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
                 <Globe size={16} className="text-slate-400" />
                 <select 
                   value={language}
                   onChange={(e) => setLanguage(e.target.value as Language)}
                   className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                 >
                   <option value="ru">Русский</option>
                   <option value="uz">O'zbek</option>
                   <option value="en">English</option>
                 </select>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-600">{t.common.server}</span>
              </div>
            </div>
          </header>

          {currentView === 'DASHBOARD' && (
            <Dashboard fields={fields} setView={setView} totalArea={totalArea} />
          )}

          {currentView === 'MAPPING' && (
            <FieldMapping onSaveField={handleSaveField} />
          )}

          {currentView === 'CALCULATOR' && (
            <AgroCalculator fields={fields} />
          )}

          {currentView === 'DRONE_CONTROL' && (
            <DroneConnection />
          )}
        </div>
      </main>

      <MobileNavigation currentView={currentView} setView={setView} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
};

export default App;
