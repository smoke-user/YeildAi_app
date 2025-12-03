
import React, { useState } from 'react';
import { Sprout, FlaskConical, Sparkles, AlertCircle, Loader2, CalendarClock, ListChecks, Save } from 'lucide-react';
import { Field, FertilizerPlan, SeedPlan, AIPlan } from '../types';
import { analyzeFertilizerNeeds, analyzeSeedingNeeds } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AgroCalculatorProps {
  fields: Field[];
  onUpdateField: (field: Field) => void;
}

export const AgroCalculator: React.FC<AgroCalculatorProps> = ({ fields, onUpdateField }) => {
  const { t, language } = useLanguage();
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [cropType, setCropType] = useState('');
  const [targetYield, setTargetYield] = useState('');
  const [soilType, setSoilType] = useState('sierozem');
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
            const result = await analyzeSeedingNeeds(selectedField.areaHa, cropType, targetYield, soilType, language);
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

  const handleSavePlan = () => {
    if (!selectedField) return;

    let plan: AIPlan;

    if (activeTab === 'SEEDS' && seedResult) {
      plan = {
        type: 'SEEDING',
        createdAt: new Date().toISOString(),
        summary: `Seeding: ${seedResult.cropType}, ${seedResult.totalSeedsNeeded}`,
        details: seedResult
      };
    } else if (activeTab === 'CHEMICALS' && fertResult) {
      plan = {
        type: 'FERTILIZER',
        createdAt: new Date().toISOString(),
        summary: `Fertilizer: ${fertResult.productName}, ${fertResult.totalAmount}`,
        details: fertResult
      };
    } else {
      return;
    }

    const updatedField: Field = {
      ...selectedField,
      cropType: cropType || selectedField.cropType,
      aiPlan: plan
    };

    onUpdateField(updatedField);
    alert(t.calculator.planSaved);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Section */}
      <div className="lg:col-span-1 bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border h-fit transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-purple-600 dark:text-purple-400" />
          {t.calculator.title}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.selectField}</label>
            <select 
              className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white"
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
            >
              <option value="" className="text-black">{t.calculator.selectPlaceholder}</option>
              {fields.map(f => (
                <option key={f.id} value={f.id} className="text-black">{f.name} ({f.areaHa} га)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.cropLabel}</label>
            <input 
               type="text"
               placeholder={t.calculator.cropPlaceholder}
               value={cropType}
               onChange={(e) => setCropType(e.target.value)}
               className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-yield-900/40 p-1 rounded-lg mt-6">
            <button
               onClick={() => setActiveTab('SEEDS')}
               className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'SEEDS' ? 'bg-white dark:bg-yield-800 text-yield-700 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
               {t.calculator.tabSeeds}
            </button>
            <button
               onClick={() => setActiveTab('CHEMICALS')}
               className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'CHEMICALS' ? 'bg-white dark:bg-yield-800 text-blue-700 dark:text-blue-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
               {t.calculator.tabChemicals}
            </button>
          </div>

          {activeTab === 'SEEDS' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.yieldLabel}</label>
                    <input 
                       type="number"
                       placeholder="4.5"
                       value={targetYield}
                       onChange={(e) => setTargetYield(e.target.value)}
                       className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.soilLabel}</label>
                    <select 
                       value={soilType}
                       onChange={(e) => setSoilType(e.target.value)}
                       className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white"
                    >
                      <option value="sierozem">{t.calculator.soilTypes.sierozem}</option>
                      <option value="sandy">{t.calculator.soilTypes.sandy}</option>
                      <option value="clay">{t.calculator.soilTypes.clay}</option>
                      <option value="loam">{t.calculator.soilTypes.loam}</option>
                    </select>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'CHEMICALS' && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.chemLabel}</label>
                <input 
                   type="text"
                   placeholder={t.calculator.chemPlaceholder}
                   value={chemicalInput}
                   onChange={(e) => setChemicalInput(e.target.value)}
                   className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                />
             </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading || !selectedFieldId}
            className={`w-full mt-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
               loading ? 'bg-slate-400' : 'bg-gradient-to-r from-yield-600 to-emerald-600 hover:from-yield-700 hover:to-emerald-700 shadow-lg shadow-yield-900/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : t.calculator.calculateBtn}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 space-y-4">
         {!seedResult && !fertResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-card rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border p-8 md:p-12 text-center min-h-[300px]">
               <div className="bg-white dark:bg-yield-900/30 p-4 rounded-full shadow-sm mb-4">
                  <Sparkles size={32} className="text-slate-300 dark:text-yield-700" />
               </div>
               <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">{t.calculator.resultsTitle}</h3>
               <p className="text-slate-400 dark:text-slate-500 max-w-sm mt-2">
                  {t.calculator.resultsDesc}
               </p>
            </div>
         )}

         {loading && (
             <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-12">
                <Loader2 size={48} className="animate-spin text-yield-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-white">{t.calculator.analyzing}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center">{t.calculator.analyzingDesc}</p>
             </div>
         )}

         {seedResult && activeTab === 'SEEDS' && (
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-yield-600 p-6 text-white flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 opacity-80 mb-1">
                         <Sprout size={18} />
                         <span className="text-sm font-medium uppercase tracking-wider">{t.calculator.planSeeds}</span>
                      </div>
                      <h2 className="text-2xl font-bold">{seedResult.cropType}</h2>
                      <div className="mt-2 text-yield-100 text-sm">{t.calculator.field}: {selectedField?.name} ({selectedField?.areaHa} га)</div>
                  </div>
                  <button 
                    onClick={handleSavePlan}
                    className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <Save size={18} /> {t.common.save}
                  </button>
               </div>
               <div className="p-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{t.calculator.recVariety}</div>
                        <div className="text-lg font-medium text-slate-800 dark:text-white">{seedResult.seedVarietyRecommendation}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{t.calculator.depth}</div>
                        <div className="text-lg font-medium text-slate-800 dark:text-white">{seedResult.optimalPlantingDepth}</div>
                      </div>
                      <div className="col-span-1 md:col-span-2 bg-yield-50 dark:bg-yield-900/20 p-4 rounded-xl border border-yield-100 dark:border-yield-900 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="text-sm text-yield-700 dark:text-yield-300 font-medium mb-1">{t.calculator.ratePerHa}</div>
                            <div className="text-2xl font-bold text-yield-900 dark:text-white">{seedResult.seedsPerHa}</div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-yield-700 dark:text-yield-300 font-medium mb-1">{t.calculator.totalNeeded}</div>
                            <div className="text-2xl font-bold text-yield-900 dark:text-white">{seedResult.totalSeedsNeeded}</div>
                        </div>
                      </div>
                  </div>

                  {/* Operation Plan */}
                  {seedResult.operationPlan && (
                    <div className="border-t border-slate-100 dark:border-dark-border pt-6">
                       <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                         <ListChecks size={20} className="text-yield-600" />
                         {t.calculator.opsPlan}
                       </h3>
                       <div className="space-y-4">
                         {seedResult.operationPlan.map((step, idx) => (
                           <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                 <div className="w-8 h-8 rounded-full bg-yield-100 dark:bg-yield-900/50 text-yield-700 dark:text-yield-300 flex items-center justify-center font-bold text-sm">
                                   {idx + 1}
                                 </div>
                                 {idx < seedResult.operationPlan!.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-yield-900/30 my-1"></div>}
                              </div>
                              <div className="pb-4">
                                 <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                                    <span className="font-bold text-slate-800 dark:text-white">{step.stepName}</span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                       <CalendarClock size={12} /> {step.timing}
                                    </span>
                                 </div>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>
         )}

         {fertResult && activeTab === 'CHEMICALS' && (
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-blue-600 dark:bg-blue-700 p-6 text-white flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 opacity-80 mb-1">
                         <FlaskConical size={18} />
                         <span className="text-sm font-medium uppercase tracking-wider">{t.calculator.planFert}</span>
                      </div>
                      <h2 className="text-2xl font-bold">{fertResult.productName}</h2>
                      <div className="mt-2 text-blue-100 text-sm">{t.calculator.field}: {selectedField?.name} ({selectedField?.areaHa} га)</div>
                  </div>
                  <button 
                    onClick={handleSavePlan}
                    className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <Save size={18} /> {t.common.save}
                  </button>
               </div>
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">{t.calculator.dosage}</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{fertResult.amountPerHa}</div>
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">{t.calculator.totalVol}</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{fertResult.totalAmount}</div>
                     </div>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-800 dark:text-white mb-2">{t.calculator.method}</h4>
                     <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{fertResult.applicationMethod}</p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-start gap-3">
                     <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                     <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">{t.calculator.safety}</h4>
                        <p className="text-yellow-700 dark:text-yellow-100/70 text-sm mt-1">{fertResult.safetyAdvice}</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};
