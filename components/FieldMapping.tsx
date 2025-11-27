
import React, { useState, useRef } from 'react';
import { Trash2, Check, Ruler, Info } from 'lucide-react';
import { Coordinate, Field } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface FieldMappingProps {
  onSaveField: (field: Field) => void;
}

export const FieldMapping: React.FC<FieldMappingProps> = ({ onSaveField }) => {
  const { t } = useLanguage();
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [fieldName, setFieldName] = useState('');
  const [calculatedArea, setCalculatedArea] = useState<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const calculateArea = (coords: Coordinate[]) => {
    if (coords.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].x * coords[j].y;
      area -= coords[j].x * coords[i].y;
    }
    const areaSqMeters = Math.abs(area) / 2;
    return areaSqMeters / 10000;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newPoints = [...points, { x, y }];
      setPoints(newPoints);
      setCalculatedArea(calculateArea(newPoints));
    }
  };

  const resetMap = () => {
    setPoints([]);
    setIsDrawing(true);
    setCalculatedArea(0);
    setFieldName('');
  };

  const saveField = () => {
    if (!fieldName) {
      alert(t.mapping.enterNameAlert);
      return;
    }
    const newField: Field = {
      id: Date.now().toString(),
      name: fieldName,
      areaHa: Number(calculatedArea.toFixed(4)),
      coordinates: points,
      plantingDate: new Date().toISOString().split('T')[0]
    };
    onSaveField(newField);
    resetMap();
    alert(t.mapping.saveAlert);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Ruler className="text-yield-600" />
              {t.mapping.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t.mapping.desc}
            </p>
          </div>
          <div className="self-end md:self-auto text-right bg-yield-50 dark:bg-yield-900/30 px-4 py-2 rounded-lg md:bg-transparent md:p-0">
             <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.mapping.areaLabel}</div>
             <div className="text-2xl md:text-3xl font-bold text-yield-600 dark:text-yield-400">
               {calculatedArea.toFixed(2)} <span className="text-sm text-slate-400">га</span>
             </div>
          </div>
        </div>

        {/* Map Canvas Simulation */}
        <div 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full h-64 md:h-96 bg-slate-100 dark:bg-[#032019] rounded-xl border-2 border-dashed border-slate-300 dark:border-yield-900 overflow-hidden cursor-crosshair group hover:border-yield-400 transition-colors touch-none"
          style={{
             backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
             backgroundSize: '20px 20px'
          }}
        >
          {points.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none p-4 text-center">
                <span className="bg-white/80 dark:bg-black/50 px-4 py-2 rounded-full text-sm backdrop-blur-sm">{t.mapping.clickToAdd}</span>
             </div>
          )}

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
             {points.length > 0 && (
                <>
                  <polygon 
                    points={points.map(p => `${p.x},${p.y}`).join(' ')} 
                    className="fill-yield-500/20 stroke-yield-600 stroke-2"
                  />
                  {points.length > 2 && (
                    <line 
                       x1={points[points.length-1].x} 
                       y1={points[points.length-1].y}
                       x2={points[0].x}
                       y2={points[0].y}
                       className="stroke-yield-600 stroke-1 stroke-dasharray-4"
                       opacity="0.5"
                    />
                  )}
                </>
             )}
             {points.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="5" className="fill-white stroke-yield-600 stroke-2" />
             ))}
          </svg>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.mapping.fieldNameLabel}</label>
            <input 
              type="text" 
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder={t.mapping.fieldNamePlaceholder}
              className="w-full px-4 py-3 md:py-2 bg-white dark:bg-yield-900/20 border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yield-500 outline-none text-slate-900 dark:text-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <button 
               onClick={resetMap}
               className="flex-1 md:flex-none px-6 py-3 md:py-2.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 font-medium active:scale-[0.98] transition-all"
             >
               <Trash2 size={18} /> {t.common.delete}
             </button>
             <button 
               onClick={saveField}
               disabled={points.length < 3}
               className={`flex-1 md:flex-none px-8 py-3 md:py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-[0.98] ${
                 points.length < 3 
                   ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                   : 'bg-yield-600 hover:bg-yield-700 shadow-lg shadow-yield-900/20'
               }`}
             >
               <Check size={18} /> {t.common.save}
             </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
         <Info className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
         <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">{t.mapping.droneIntegration}</h4>
            <p className="text-blue-700 dark:text-blue-200/70 text-sm mt-1">
               {t.mapping.droneIntegrationDesc}
            </p>
         </div>
      </div>
    </div>
  );
};
