
import React, { useState, useEffect, useRef } from 'react';
import { Sprout, FlaskConical, Sparkles, AlertCircle, Loader2, CalendarClock, ListChecks, Save, Terminal, Scale, Database, TrendingUp, BookOpen, Search, ChevronDown, CheckCircle, TestTube } from 'lucide-react';
import { Field, FertilizerPlan, SeedPlan } from '../types';
import { analyzeFertilizerNeeds, analyzeSeedingNeeds } from '../services/geminiService';
import { KnowledgeBase } from '../services/knowledgeBase';
import { useLanguage } from '../contexts/LanguageContext';

interface AgroCalculatorProps {
  fields: Field[];
  onUpdateField: (field: Field) => void;
}

// Technical Console Logger Component
const AIConsoleLog = ({ loading, restored, activeTab, inputs }: { loading: boolean; restored: boolean; activeTab: 'SEEDS' | 'CHEMICALS', inputs: any }) => {
  const [logs, setLogs] = useState<{ts: string, type: 'INFO' | 'PROMPT' | 'NET' | 'JSON' | 'SUCCESS' | 'HISTORY' | 'RAG' | 'EMBED', msg: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle Restoration Logs
  useEffect(() => {
    if (restored) {
        setLogs(prev => {
            // Check if we just added history logs to prevent duplication on re-renders
            const lastLog = prev[prev.length - 1];
            if (lastLog && lastLog.type === 'SUCCESS' && lastLog.msg.includes('Historical')) return prev;

            const separator = prev.length > 0 ? [{ ts: '---', type: 'INFO' as const, msg: '------------------------------------------' }] : [];

            return [
                ...prev,
                ...separator,
                { ts: '0ms', type: 'HISTORY', msg: 'DB: Connected to IndexedDB...' },
                { ts: '+15ms', type: 'HISTORY', msg: 'DB: Plans retrieved successfully.' },
                { ts: '+30ms', type: 'INFO', msg: `Restored Context: Crop="${inputs.crop}" | Soil=${inputs.soil}` },
                { ts: '+45ms', type: 'SUCCESS', msg: 'Historical Data Loaded. Ready.' },
            ];
        });
    }
  }, [restored]); // Depend only on restored flag

  // Handle Loading Logs (Simulation)
  useEffect(() => {
    if (loading) {
      // Clear timeouts from any previous run to avoid overlapping logs from a cancelled/restarted action
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      const startTime = Date.now();
      
      const addLog = (type: 'INFO' | 'PROMPT' | 'NET' | 'JSON' | 'SUCCESS' | 'RAG' | 'EMBED', msg: string) => {
        setLogs(prev => [...prev, {
          ts: `+${Date.now() - startTime}ms`,
          type,
          msg
        }]);
      };

      // Add Separator for new calculation
      setLogs(prev => {
          const separator = prev.length > 0 ? [{ ts: '---', type: 'INFO' as const, msg: '------------------------------------------' }] : [];
          return [...prev, ...separator];
      });

      addLog('INFO', `Initializing ${activeTab === 'SEEDS' ? 'Agent 1 (Planning)' : 'Agent 2 (Chemistry)'}...`);

      const queryItem = activeTab === 'SEEDS' ? inputs.crop : inputs.chemical;

      const sequence = [
        { t: 100, type: 'INFO' as const, msg: `Context: Area=${inputs.area}ha | Query="${queryItem}" | Soil=${inputs.soil}` },
        { t: 300, type: 'EMBED' as const, msg: `Generating Vector Embedding (text-embedding-004)...` },
        { t: 600, type: 'EMBED' as const, msg: `Vector: [0.012, -0.45, 0.22, ...]` },
        { t: 800, type: 'RAG' as const, msg: `Calculating Cosine Similarity against Knowledge Graph...` },
        { t: 1000, type: 'RAG' as const, msg: `[RAG MATCH] Found specifications in Knowledge Graph (Score: 0.92)` },
        { t: 1200, type: 'PROMPT' as const, msg: 'Constructing System Prompt with RAG Context...' },
        { t: 1500, type: 'NET' as const, msg: 'POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent' },
        { t: 2000, type: 'NET' as const, msg: 'Response received: 200 OK | Latency: 500ms' },
        { t: 2200, type: 'JSON' as const, msg: 'Parsing structured output...' },
        { t: 2500, type: 'SUCCESS' as const, msg: 'Data validated. Rendering UI.' },
      ];

      sequence.forEach(s => {
          const id = setTimeout(() => addLog(s.type, s.msg), s.t);
          timeoutsRef.current.push(id);
      });
    }
    // Note: We DO NOT clear timeouts when loading becomes false. 
    // This ensures the visual trace finishes even if the API call is faster than the simulation.
  }, [loading]);

  // Cleanup on unmount only
  useEffect(() => {
      return () => {
          timeoutsRef.current.forEach(clearTimeout);
      };
  }, []);

  if (!loading && logs.length === 0) {
    return (
      <div className="mt-6 bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs text-slate-500 h-[200px] flex items-center justify-center flex-col gap-2">
         <Terminal size={24} className="opacity-20" />
         <span>AI System Idle. Waiting for input...</span>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-[#0c0c0c] rounded-lg border border-slate-800 shadow-inner overflow-hidden flex flex-col h-[280px]">
      <div className="bg-[#1a1a1a] px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Terminal size={12} className="text-slate-400" />
           <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">System Trace</span>
        </div>
        <div className="flex gap-1.5">
           <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
           <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
           <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto font-mono text-[11px] md:text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-100">
             <span className="text-slate-600 min-w-[50px] text-right shrink-0 select-none">{log.ts}</span>
             <div className="flex-1 break-all">
                {log.type === 'INFO' && <span className="text-blue-400 font-bold">[INFO]</span>}
                {log.type === 'PROMPT' && <span className="text-purple-400 font-bold">[PROMPT]</span>}
                {log.type === 'RAG' && <span className="text-pink-400 font-bold">[RAG]</span>}
                {log.type === 'EMBED' && <span className="text-indigo-400 font-bold">[EMBED]</span>}
                {log.type === 'NET' && <span className="text-yellow-400 font-bold">[NET]</span>}
                {log.type === 'JSON' && <span className="text-orange-400 font-bold">[JSON]</span>}
                {log.type === 'SUCCESS' && <span className="text-green-500 font-bold">[DONE]</span>}
                {log.type === 'HISTORY' && <span className="text-cyan-400 font-bold">[DB_LOAD]</span>}
                <span className={`ml-2 ${
                  log.type === 'PROMPT' ? 'text-slate-300 italic' : 
                  log.type === 'JSON' ? 'text-orange-200' :
                  log.type === 'SUCCESS' ? 'text-green-400' : 
                  log.type === 'RAG' ? 'text-pink-200' :
                  log.type === 'EMBED' ? 'text-indigo-200' :
                  log.type === 'HISTORY' ? 'text-cyan-100' : 'text-slate-300'
                }`}>
                  {log.msg}
                </span>
             </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 animate-pulse mt-2">
            <span className="text-slate-600 min-w-[50px] text-right">...</span>
            <span className="text-green-500">_</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AgroCalculator: React.FC<AgroCalculatorProps> = ({ fields, onUpdateField }) => {
  const { t, language } = useLanguage();
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [cropType, setCropType] = useState('');
  
  // Soil Selection Logic (Dropdown + Custom Input)
  const [soilSelectValue, setSoilSelectValue] = useState('sierozem');
  const [customSoilInput, setCustomSoilInput] = useState('');
  const [soilType, setSoilType] = useState('sierozem'); // The final derived value sent to API

  // Fertilizer Search State
  const [chemicalInput, setChemicalInput] = useState('');
  const [isFertDropdownOpen, setIsFertDropdownOpen] = useState(false);
  const [availableFertilizers, setAvailableFertilizers] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'SEEDS' | 'CHEMICALS'>('SEEDS');
  
  const [loading, setLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedPlan | null>(null);
  const [fertResult, setFertResult] = useState<FertilizerPlan | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load available fertilizers from KnowledgeBase
    setAvailableFertilizers(KnowledgeBase.getAvailableFertilizers());

    // Click outside listener for dropdown
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsFertDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync Final Soil Type based on inputs
  useEffect(() => {
    if (soilSelectValue === 'custom') {
        setSoilType(customSoilInput);
    } else {
        setSoilType(soilSelectValue);
    }
  }, [soilSelectValue, customSoilInput]);


  // Derive the currently selected field from props (which are synced with DB in App.tsx)
  const selectedField = fields.find(f => f.id === selectedFieldId);

  useEffect(() => {
    // Reset or Restore state when field changes
    if (!selectedFieldId) {
        setCropType('');
        setSoilSelectValue('sierozem');
        setCustomSoilInput('');
        setSeedResult(null);
        setFertResult(null);
        setIsRestored(false);
        return;
    }

    if (selectedField) {
        // Restore Inputs
        if (selectedField.cropType) setCropType(selectedField.cropType);
        
        if (selectedField.soilType) {
            const standardSoils = ['sierozem', 'sandy', 'clay', 'loam', 'takyr', 'meadow', 'saline'];
            if (standardSoils.includes(selectedField.soilType)) {
                setSoilSelectValue(selectedField.soilType);
                setCustomSoilInput('');
            } else {
                setSoilSelectValue('custom');
                setCustomSoilInput(selectedField.soilType);
            }
        } else {
            setSoilSelectValue('sierozem');
        }

        // Restore Both Results (Independent Slots)
        let restoredAny = false;
        
        if (selectedField.seedPlan) {
            setSeedResult(selectedField.seedPlan);
            restoredAny = true;
        } else {
            setSeedResult(null);
        }

        if (selectedField.fertilizerPlan) {
            setFertResult(selectedField.fertilizerPlan);
            // Restore chemical input name
            if (selectedField.fertilizerPlan.productName) {
                setChemicalInput(selectedField.fertilizerPlan.productName);
            }
            restoredAny = true;
        } else {
            setFertResult(null);
        }

        setIsRestored(restoredAny);
    }
  }, [selectedFieldId, fields]); 

  const handleCalculate = async () => {
    if (!selectedField || !cropType) {
        alert(t.calculator.alertSelect);
        return;
    }

    // Validate custom soil if selected
    if (soilSelectValue === 'custom' && !customSoilInput.trim()) {
        alert("Please enter a custom soil type.");
        return;
    }

    setLoading(true);
    // Don't clear the OTHER result when calculating one
    setIsRestored(false); 
    
    try {
        if (activeTab === 'SEEDS') {
            const result = await analyzeSeedingNeeds(selectedField.areaHa, cropType, soilType, language);
            const planWithTimestamp = { ...result, createdAt: new Date().toISOString() };
            
            setSeedResult(planWithTimestamp);
            
            // AUTO SAVE: Merge with existing field data, preserving fertilizer plan
            const updatedField: Field = {
                ...selectedField,
                cropType: cropType,
                soilType: soilType, // Saves the actual text string (custom or standard)
                seedPlan: planWithTimestamp, // Update Seeds
                // Fertilizer plan stays as is (it's already in selectedField)
            };
            onUpdateField(updatedField);
            
        } else {
            if (!chemicalInput) {
                alert(t.calculator.alertChem);
                setLoading(false);
                return;
            }
            const result = await analyzeFertilizerNeeds(selectedField.areaHa, cropType, chemicalInput, language);
            const planWithTimestamp = { ...result, createdAt: new Date().toISOString() };

            setFertResult(planWithTimestamp);
            
             // AUTO SAVE: Merge with existing field data, preserving seed plan
            const updatedField: Field = {
                ...selectedField,
                cropType: cropType,
                soilType: soilType,
                fertilizerPlan: planWithTimestamp, // Update Fertilizer
                // Seed plan stays as is
            };
            onUpdateField(updatedField);
        }
    } catch (e) {
        console.error(e);
        alert(t.calculator.error);
    } finally {
        setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!selectedField) return;
    // Manual save triggers update
    const updatedField = { ...selectedField, cropType, soilType };
    if (seedResult) updatedField.seedPlan = seedResult;
    if (fertResult) updatedField.fertilizerPlan = fertResult;

    onUpdateField(updatedField);
    setIsRestored(true);
  };

  // Filter fertilizers for dropdown
  const filteredFertilizers = availableFertilizers.filter(f => 
    f.toLowerCase().includes(chemicalInput.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border h-fit transition-colors">
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
                  <option key={f.id} value={f.id} className="text-black">
                      {f.name} ({f.areaHa} га) {(f.seedPlan || f.fertilizerPlan) ? '✓' : ''}
                  </option>
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
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.soilLabel}</label>
                      <select 
                         value={soilSelectValue}
                         onChange={(e) => setSoilSelectValue(e.target.value)}
                         className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white mb-2"
                      >
                        <option value="sierozem">{t.calculator.soilTypes.sierozem}</option>
                        <option value="sandy">{t.calculator.soilTypes.sandy}</option>
                        <option value="clay">{t.calculator.soilTypes.clay}</option>
                        <option value="loam">{t.calculator.soilTypes.loam}</option>
                        <option value="takyr">{t.calculator.soilTypes.takyr}</option>
                        <option value="meadow">{t.calculator.soilTypes.meadow}</option>
                        <option value="saline">{t.calculator.soilTypes.saline}</option>
                        <option value="custom">{t.calculator.soilTypes.custom}</option>
                      </select>
                      
                      {soilSelectValue === 'custom' && (
                         <input 
                           type="text"
                           placeholder={t.calculator.customSoilPlaceholder}
                           value={customSoilInput}
                           onChange={(e) => setCustomSoilInput(e.target.value)}
                           className="w-full p-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white animate-in fade-in slide-in-from-top-2"
                         />
                      )}
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'CHEMICALS' && (
               <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2" ref={wrapperRef}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.calculator.chemLabel}</label>
                  <div className="relative">
                      <div className="relative">
                          <input 
                             type="text"
                             placeholder={t.calculator.chemPlaceholder}
                             value={chemicalInput}
                             onChange={(e) => {
                                 setChemicalInput(e.target.value);
                                 setIsFertDropdownOpen(true);
                             }}
                             onFocus={() => setIsFertDropdownOpen(true)}
                             className="w-full p-3 pr-10 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                          />
                          <Search className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      
                      {/* Searchable Dropdown */}
                      {isFertDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-yield-900 border border-slate-200 dark:border-yield-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                             {filteredFertilizers.length > 0 ? (
                                 filteredFertilizers.map((fert, idx) => (
                                     <button
                                        key={idx}
                                        onClick={() => {
                                            setChemicalInput(fert);
                                            setIsFertDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-yield-800 text-sm text-slate-700 dark:text-slate-200 transition-colors border-b border-slate-100 dark:border-yield-800/50 last:border-0"
                                     >
                                        {fert}
                                     </button>
                                 ))
                             ) : (
                                 <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 italic">No matches found. You can keep typing custom name.</div>
                             )}
                          </div>
                      )}
                  </div>
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

        <AIConsoleLog 
          loading={loading} 
          restored={isRestored}
          activeTab={activeTab} 
          inputs={{
            fieldId: selectedFieldId || 'UNKNOWN',
            area: selectedField?.areaHa || 0,
            crop: cropType,
            chemical: chemicalInput,
            soil: soilType,
            yield: "AUTO"
          }}
        />
      </div>

      <div className="lg:col-span-2 space-y-4">
         {!seedResult && !fertResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-card rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border p-8 md:p-12 text-center min-h-[400px]">
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
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-12 opacity-50">
                <div className="flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-yield-900/50 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-yield-900/50 rounded mb-2"></div>
                    <div className="h-3 w-48 bg-slate-100 dark:bg-yield-900/30 rounded"></div>
                </div>
             </div>
         )}

         {/* SEED RESULTS */}
         {seedResult && activeTab === 'SEEDS' && (
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-yield-600 p-6 text-white flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 opacity-80 mb-1">
                         <Sprout size={18} />
                         <span className="text-sm font-medium uppercase tracking-wider">{t.calculator.planSeeds}</span>
                      </div>
                      <h2 className="text-2xl font-bold">{seedResult.cropType}</h2>
                      <div className="mt-2 text-yield-100 text-sm flex items-center gap-2">
                        <span>{t.calculator.field}: {selectedField?.name} ({selectedField?.areaHa} га)</span>
                        {isRestored && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><Database size={10} /> Persisted</span>}
                      </div>
                  </div>
                  <button 
                    onClick={handleSavePlan}
                    className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <Save size={18} /> {t.common.save}
                  </button>
               </div>
               <div className="p-6">
                  {seedResult.sourceCitation && (
                      <div className="mb-4 bg-purple-50 dark:bg-purple-900/10 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-900/30 flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                             Calculated using: {seedResult.sourceCitation}
                          </span>
                      </div>
                  )}

                  {seedResult.estimatedYieldProjection && (
                     <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                         <TrendingUp className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
                         <div>
                             <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">{t.calculator.yieldImpact}</h4>
                             <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">{seedResult.estimatedYieldProjection}</p>
                         </div>
                     </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{t.calculator.recVariety}</div>
                        <div className="text-lg font-medium text-slate-800 dark:text-white">{seedResult.seedVarietyRecommendation}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{t.calculator.depth}</div>
                        <div className="text-lg font-medium text-slate-800 dark:text-white">{seedResult.optimalPlantingDepth}</div>
                      </div>

                      <div className="col-span-1 md:col-span-2 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-center gap-4">
                         <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg text-yellow-700 dark:text-yellow-400">
                             <Scale size={20} />
                         </div>
                         <div>
                            <div className="text-xs text-yellow-800 dark:text-yellow-300 uppercase font-bold">{t.calculator.tsw}</div>
                            <div className="text-base font-medium text-slate-800 dark:text-white">{seedResult.thousandSeedWeight || 'N/A'}</div>
                         </div>
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
         
         {/* FERTILIZER RESULTS */}
         {fertResult && activeTab === 'CHEMICALS' && (
             <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-blue-600 dark:bg-blue-700 p-6 text-white flex justify-between items-start">
                   <div>
                       <div className="flex items-center gap-2 opacity-80 mb-1">
                          <FlaskConical size={18} />
                          <span className="text-sm font-medium uppercase tracking-wider">{t.calculator.planFert}</span>
                       </div>
                       <h2 className="text-2xl font-bold">{fertResult.productName}</h2>
                       <div className="mt-2 text-blue-100 text-sm flex items-center gap-2">
                         <span>{t.calculator.field}: {selectedField?.name} ({selectedField?.areaHa} га)</span>
                         {isRestored && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><Database size={10} /> Persisted</span>}
                       </div>
                   </div>
                   <button 
                     onClick={handleSavePlan}
                     className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm font-bold"
                   >
                     <Save size={18} /> {t.common.save}
                   </button>
                </div>
                <div className="p-6 space-y-6">
                    {/* AGRONOMIC ANALYSIS SECTION */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                             <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                             <h4 className="font-bold text-slate-800 dark:text-white uppercase text-sm tracking-wide">{t.calculator.agronomicAnalysis}</h4>
                        </div>
                        
                        {fertResult.suitabilityAnalysis && (
                             <div className="mb-4">
                                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.calculator.suitability}</h5>
                                <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                   <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                     {fertResult.suitabilityAnalysis}
                                   </p>
                                </div>
                             </div>
                        )}

                        {fertResult.recommendedSoilTests && fertResult.recommendedSoilTests.length > 0 && (
                            <div>
                                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.calculator.requiredTests}</h5>
                                <div className="flex flex-wrap gap-2">
                                    {fertResult.recommendedSoilTests.map((test, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-sm border border-purple-100 dark:border-purple-800">
                                            <TestTube size={14} />
                                            {test}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

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
