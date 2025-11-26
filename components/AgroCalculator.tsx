
import React, { useState } from 'react';
import { Sprout, FlaskConical, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Field, FertilizerPlan, SeedPlan } from '../types';
import { analyzeFertilizerNeeds, analyzeSeedingNeeds } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AgroCalculatorProps {
  fields: Field[];
}

export const AgroCalculator: React.FC<AgroCalculatorProps> = ({ fields }) => {
  const { t, language } = useLanguage();
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [cropType, setCropType] = useState('');
  const [chemicalInput, setChemicalInput] = useState('');
  const [activeTab, setActiveTab] = useState<'SEEDS' | 'CHEMICALS'>('SEEDS');
  
  const [loading, setLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedPlan | null>(null);
  const [fertResult, setFertResult] = useState<FertilizerPlan | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleCalculate = async () => {
    if (!selectedField || !cropType) {
        alert(t.calculator.alertSelect);
        return;
    }

    setLoading(true);
    try {
        if (activeTab === 'SEEDS') {
            const result = await analyzeSeedingNeeds(selectedField.areaHa, cropType, language);
            setSeedResult(result);
            setFertResult(null);
        } else {
            if (!chemicalInput) {
                alert(t.calculator.alertChem);
                setLoading(false);
                return;
            }
            const result = await analyzeFertilizerNeeds(selectedField.areaHa, cropType, chemicalInput, language);
            setFertResult(result);
            setSeedResult(null);
        }
    } catch (e) {
        alert(t.calculator.error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Section */}
      <div className="lg:col-span-1 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Sparkles className="text-purple-600" />
          {t.calculator.title}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.calculator.selectField}</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
            >
              <option value="">{t.calculator.selectPlaceholder}</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.areaHa} га)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.calculator.cropLabel}</label>
            <input 
               type="text"
               placeholder={t.calculator.cropPlaceholder}
               value={cropType}
               onChange={(e) => setCropType(e.target.value)}
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg mt-6">
            <button
               onClick={() => setActiveTab('SEEDS')}
               className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'SEEDS' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               {t.calculator.tabSeeds}
            </button>
            <button
               onClick={() => setActiveTab('CHEMICALS')}
               className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'CHEMICALS' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               {t.calculator.tabChemicals}
            </button>
          </div>

          {activeTab === 'CHEMICALS' && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.calculator.chemLabel}</label>
                <input 
                   type="text"
                   placeholder={t.calculator.chemPlaceholder}
                   value={chemicalInput}
                   onChange={(e) => setChemicalInput(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading || !selectedFieldId}
            className={`w-full mt-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
               loading ? 'bg-slate-400' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-900/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : t.calculator.calculateBtn}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 space-y-4">
         {!seedResult && !fertResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 md:p-12 text-center min-h-[300px]">
               <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Sparkles size={32} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-medium text-slate-600">{t.calculator.resultsTitle}</h3>
               <p className="text-slate-400 max-w-sm mt-2">
                  {t.calculator.resultsDesc}
               </p>
            </div>
         )}

         {loading && (
             <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
                <Loader2 size={48} className="animate-spin text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">{t.calculator.analyzing}</h3>
                <p className="text-slate-500 text-center">{t.calculator.analyzingDesc}</p>
             </div>
         )}

         {seedResult && activeTab === 'SEEDS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-green-600 p-6 text-white">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                     <Sprout size={18} />
                     <span className="text-sm font-medium uppercase tracking-wider">{t.calculator.planSeeds}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{seedResult.cropType}</h2>
                  <div className="mt-2 text-green-100 text-sm">{t.calculator.field}: {selectedField?.name} ({selectedField?.areaHa} га)</div>
               </div>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <div className="text-xs text-slate-500 uppercase font-bold">{t.calculator.recVariety}</div>
                     <div className="text-lg font-medium text-slate-800">{seedResult.seedVarietyRecommendation}</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-xs text-slate-500 uppercase font-bold">{t.calculator.depth}</div>
                     <div className="text-lg font-medium text-slate-800">{seedResult.optimalPlantingDepth}</div>
                  </div>
                  <div className="col-span-1 md:col-span-2 bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col md:flex-row gap-6">
                     <div className="flex-1">
                        <div className="text-sm text-green-700 font-medium mb-1">{t.calculator.ratePerHa}</div>
                        <div className="text-2xl font-bold text-green-900">{seedResult.seedsPerHa}</div>
                     </div>
                     <div className="flex-1">
                        <div className="text-sm text-green-700 font-medium mb-1">{t.calculator.totalNeeded}</div>
                        <div className="text-2xl font-bold text-green-900">{seedResult.totalSeedsNeeded}</div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {fertResult && activeTab === 'CHEMICALS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-blue-600 p-6 text-white">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                     <FlaskConical size={18} />
                     <span className="text-sm font-medium uppercase tracking-wider">{t.calculator.planFert}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{fertResult.productName}</h2>
                  <div className="mt-2 text-blue-100 text-sm">{t.calculator.field}: {selectedField?.name} ({selectedField?.areaHa} га)</div>
               </div>
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-sm text-blue-700 font-medium mb-1">{t.calculator.dosage}</div>
                        <div className="text-xl font-bold text-blue-900">{fertResult.amountPerHa}</div>
                     </div>
                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-sm text-blue-700 font-medium mb-1">{t.calculator.totalVol}</div>
                        <div className="text-xl font-bold text-blue-900">{fertResult.totalAmount}</div>
                     </div>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-800 mb-2">{t.calculator.method}</h4>
                     <p className="text-slate-600 text-sm leading-relaxed">{fertResult.applicationMethod}</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start gap-3">
                     <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                     <div>
                        <h4 className="font-bold text-yellow-800 text-sm">{t.calculator.safety}</h4>
                        <p className="text-yellow-700 text-sm mt-1">{fertResult.safetyAdvice}</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};
