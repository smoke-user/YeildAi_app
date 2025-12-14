import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Map, Database, Brain, Sprout, ShieldCheck, Globe, Zap, Users, Download } from 'lucide-react';
import pptxgen from "pptxgenjs";

interface PresentationModeProps {
  onClose: () => void;
}

// Reusing Logo for branding consistency
const YieldAILogoBig = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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

export const PresentationMode: React.FC<PresentationModeProps> = ({ onClose }) => {
  const [slide, setSlide] = useState(0);

  const handleExportPPTX = () => {
    const pres = new pptxgen();
    
    // Set Metadata
    pres.title = "Yield AI Pitch Deck";
    pres.subject = "AI500 Hackathon Uzbekistan";
    pres.author = "Yield AI Team";

    // Define Master Slide (Dark Theme)
    pres.defineSlideMaster({
      title: "MASTER_DARK",
      background: { color: "050505" },
      objects: [
        { rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "22c55e" } } }, // Top green bar
        { text: { text: "Yield AI - AI500 Hackathon", options: { x: 0.5, y: 0.2, w: 4, h: 0.3, fontSize: 10, color: "aaaaaa" } } }
      ]
    });

    // 1. INTRO
    let slide1 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide1.addText("Yield AI", { x: 1, y: 2, w: '80%', fontSize: 60, color: "ffffff", bold: true, align: "center" });
    slide1.addText("Smart Farming Uzbekistan", { x: 1, y: 3, w: '80%', fontSize: 24, color: "22c55e", align: "center" });
    slide1.addText("«Превращаем данные в урожай»", { x: 2, y: 4.5, w: '60%', fontSize: 18, color: "cccccc", italic: true, align: "center", shape: pres.ShapeType.roundRect, fill: { color: "1a1a1a" } });

    // 2. PROBLEM
    let slide2 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide2.addText("ПРОБЛЕМА", { x: 0.5, y: 0.5, fontSize: 14, color: "22c55e", bold: true });
    slide2.addText("Сельское хозяйство ЦА в кризисе данных", { x: 0.5, y: 1, w: '90%', fontSize: 36, color: "ffffff", bold: true });
    
    slide2.addShape(pres.ShapeType.rect, { x: 0.5, y: 2.2, w: 2.8, h: 2.5, fill: { color: "1a1a1a" }, line: {color: "333333"} });
    slide2.addText("Перерасход", { x: 0.7, y: 2.4, fontSize: 18, color: "ef4444", bold: true });
    slide2.addText("Фермеры тратят на 30% больше удобрений из-за расчетов «на глаз».", { x: 0.7, y: 2.9, w: 2.4, fontSize: 14, color: "cccccc" });

    slide2.addShape(pres.ShapeType.rect, { x: 3.6, y: 2.2, w: 2.8, h: 2.5, fill: { color: "1a1a1a" }, line: {color: "333333"} });
    slide2.addText("Дефицит Знаний", { x: 3.8, y: 2.4, fontSize: 18, color: "f97316", bold: true });
    slide2.addText("Нехватка агрономов. Нормы ГОСТ часто игнорируются или неизвестны.", { x: 3.8, y: 2.9, w: 2.4, fontSize: 14, color: "cccccc" });

    slide2.addShape(pres.ShapeType.rect, { x: 6.7, y: 2.2, w: 2.8, h: 2.5, fill: { color: "1a1a1a" }, line: {color: "333333"} });
    slide2.addText("Потеря Данных", { x: 6.9, y: 2.4, fontSize: 18, color: "3b82f6", bold: true });
    slide2.addText("Бумажные журналы теряются. Нет интернета в полях — нет синхронизации.", { x: 6.9, y: 2.9, w: 2.4, fontSize: 14, color: "cccccc" });

    // 3. SOLUTION
    let slide3 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide3.addText("РЕШЕНИЕ", { x: 0.5, y: 0.5, fontSize: 14, color: "22c55e", bold: true });
    slide3.addText("Платформа Yield AI", { x: 0.5, y: 1, fontSize: 40, color: "ffffff", bold: true });
    slide3.addText("Единое PWA приложение: GIS карты + Телеметрия дронов + Generative AI.", { x: 0.5, y: 1.8, w: '80%', fontSize: 18, color: "cccccc" });
    
    slide3.addText("✓ Offline-First Архитектура (Работает без сети)", { x: 0.5, y: 2.8, fontSize: 18, color: "ffffff" });
    slide3.addText("✓ Локализация (Узбекистан: Язык + RAG База)", { x: 0.5, y: 3.4, fontSize: 18, color: "ffffff" });
    slide3.addText("✓ Точный GPS замер полей", { x: 0.5, y: 4.0, fontSize: 18, color: "ffffff" });

    // 4. TECH
    let slide4 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide4.addText("ТЕХНОЛОГИИ", { x: 0.5, y: 0.5, fontSize: 14, color: "22c55e", bold: true });
    slide4.addText("Технический Стек", { x: 0.5, y: 1, fontSize: 36, color: "ffffff", bold: true });

    slide4.addText("Google Gemini 2.5 Flash", { x: 0.5, y: 2, fontSize: 20, color: "3b82f6", bold: true });
    slide4.addText("Быстрая модель для генерации планов посева и анализа фото.", { x: 0.5, y: 2.4, w: 4, fontSize: 14, color: "cccccc" });

    slide4.addText("RAG Knowledge Graph", { x: 5.5, y: 2, fontSize: 20, color: "a855f7", bold: true });
    slide4.addText("Векторный поиск по ГОСТ 5947-68, 23577-79. Никаких галлюцинаций.", { x: 5.5, y: 2.4, w: 4, fontSize: 14, color: "cccccc" });

    slide4.addText("Dual-Write Storage", { x: 0.5, y: 4, fontSize: 20, color: "22c55e", bold: true });
    slide4.addText("IndexedDB + LocalStorage Backup. Защита от потери данных.", { x: 0.5, y: 4.4, w: 4, fontSize: 14, color: "cccccc" });

    slide4.addText("OpenLayers GIS", { x: 5.5, y: 4, fontSize: 20, color: "f97316", bold: true });
    slide4.addText("Геодезические расчеты площади без тяжелого бэкенда.", { x: 5.5, y: 4.4, w: 4, fontSize: 14, color: "cccccc" });

    // 5. IMPACT
    let slide5 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide5.addText("РЫНОК И ВЛИЯНИЕ", { x: 0.5, y: 0.5, fontSize: 14, color: "22c55e", bold: true });
    slide5.addText("Почему это важно?", { x: 0.5, y: 1, fontSize: 36, color: "ffffff", bold: true });

    slide5.addText("15-20%", { x: 1, y: 2.5, fontSize: 60, color: "22c55e", bold: true });
    slide5.addText("Снижение затрат на семена и удобрения", { x: 1, y: 3.5, w: 3, fontSize: 16, color: "cccccc" });

    slide5.addText("3 Языка", { x: 6, y: 2.5, fontSize: 60, color: "3b82f6", bold: true });
    slide5.addText("Полная локализация (UZ, RU, EN) для фермеров", { x: 6, y: 3.5, w: 3, fontSize: 16, color: "cccccc" });

    // Save
    pres.writeFile({ fileName: "Yield_AI_Presentation_Uzbekistan.pptx" });
  };

  const slides = [
    // SLIDE 1: INTRO
    {
      id: 'intro',
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-700">
          <div className="w-48 h-48 bg-yield-500/10 rounded-full flex items-center justify-center mb-4 border border-yield-500/20 shadow-[0_0_100px_rgba(34,197,94,0.2)]">
            <YieldAILogoBig className="w-32 h-32 text-yield-500" />
          </div>
          <div>
            <h1 className="text-7xl font-bold text-white tracking-tight mb-4">
              Yield <span className="text-yield-500">AI</span>
            </h1>
            <p className="text-2xl text-slate-400 font-light">Smart Farming Uzbekistan</p>
          </div>
          <div className="mt-12 px-8 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <p className="text-xl text-yield-100">"Превращаем данные в урожай"</p>
          </div>
        </div>
      )
    },
    // SLIDE 2: PROBLEM
    {
      id: 'problem',
      render: () => (
        <div className="h-full flex flex-col justify-center px-16 animate-in slide-in-from-right duration-500">
          <h2 className="text-yield-500 font-bold tracking-widest uppercase mb-4 text-sm">Проблема</h2>
          <h1 className="text-5xl font-bold text-white mb-12 leading-tight">Сельское хозяйство ЦА<br/>сталкивается с кризисом данных.</h1>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="mb-6 bg-red-500/20 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe size={32} className="text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Перерасход Ресурсов</h3>
              <p className="text-slate-400">Фермеры тратят на 30% больше удобрений из-за неточных расчетов "на глаз".</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="mb-6 bg-orange-500/20 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain size={32} className="text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Дефицит Знаний</h3>
              <p className="text-slate-400">Нехватка квалифицированных агрономов. Нормы ГОСТ часто игнорируются или неизвестны.</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="mb-6 bg-blue-500/20 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database size={32} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Потеря Данных</h3>
              <p className="text-slate-400">Бумажные журналы теряются. В полях нет стабильного интернета для синхронизации.</p>
            </div>
          </div>
        </div>
      )
    },
    // SLIDE 3: SOLUTION
    {
      id: 'solution',
      render: () => (
        <div className="h-full flex flex-col justify-center px-16 animate-in slide-in-from-right duration-500">
           <div className="flex items-center gap-12">
              <div className="flex-1">
                <h2 className="text-yield-500 font-bold tracking-widest uppercase mb-4 text-sm">Решение</h2>
                <h1 className="text-6xl font-bold text-white mb-8">Платформа Yield AI</h1>
                <p className="text-2xl text-slate-300 leading-relaxed mb-8">
                  Единое веб-приложение (PWA), объединяющее GIS карты, телеметрию дронов и Generative AI в роли персонального агронома.
                </p>
                <ul className="space-y-6">
                  <li className="flex items-center gap-4 text-xl text-white">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">✓</div>
                    Offline-First Архитектура (Без интернета)
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">✓</div>
                    Локализация (Узбекистан: Язык + RAG База)
                  </li>
                  <li className="flex items-center gap-4 text-xl text-white">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">✓</div>
                    Точный GPS замер полей
                  </li>
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                 <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-yield-600 to-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                 <div className="absolute grid grid-cols-2 gap-4">
                    <div className="bg-[#0c1f17] p-6 rounded-2xl border border-yield-500/30 w-48 h-48 flex flex-col items-center justify-center text-center">
                        <Map size={40} className="text-yield-400 mb-4" />
                        <span className="font-bold text-white">Карты (GIS)</span>
                    </div>
                    <div className="bg-[#0c1f17] p-6 rounded-2xl border border-yield-500/30 w-48 h-48 flex flex-col items-center justify-center text-center mt-12">
                        <Zap size={40} className="text-yellow-400 mb-4" />
                        <span className="font-bold text-white">AI Агенты</span>
                    </div>
                    <div className="bg-[#0c1f17] p-6 rounded-2xl border border-yield-500/30 w-48 h-48 flex flex-col items-center justify-center text-center -mt-12">
                        <Users size={40} className="text-blue-400 mb-4" />
                        <span className="font-bold text-white">Фермеры</span>
                    </div>
                    <div className="bg-[#0c1f17] p-6 rounded-2xl border border-yield-500/30 w-48 h-48 flex flex-col items-center justify-center text-center">
                        <ShieldCheck size={40} className="text-purple-400 mb-4" />
                        <span className="font-bold text-white">Надежность</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    // SLIDE 4: TECH STACK
    {
      id: 'tech',
      render: () => (
        <div className="h-full flex flex-col justify-center px-16 animate-in slide-in-from-right duration-500">
           <h2 className="text-yield-500 font-bold tracking-widest uppercase mb-4 text-sm">Под капотом</h2>
           <h1 className="text-5xl font-bold text-white mb-12">Технологический Стек</h1>

           <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div className="flex gap-6">
                    <div className="bg-blue-500/20 p-4 rounded-xl h-fit"><Brain size={32} className="text-blue-400"/></div>
                    <div>
                       <h3 className="text-2xl font-bold text-white mb-2">Google Gemini 2.5 Flash</h3>
                       <p className="text-slate-400">Быстрая модель с низкой задержкой для генерации планов посева и анализа химического состава по фото.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="bg-purple-500/20 p-4 rounded-xl h-fit"><Database size={32} className="text-purple-400"/></div>
                    <div>
                       <h3 className="text-2xl font-bold text-white mb-2">RAG Knowledge Graph</h3>
                       <p className="text-slate-400">Векторный поиск по нормам Узбекистана (ГОСТ 5947-68, 23577-79). ИИ опирается на реальные факты.</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex gap-6">
                    <div className="bg-green-500/20 p-4 rounded-xl h-fit"><ShieldCheck size={32} className="text-green-400"/></div>
                    <div>
                       <h3 className="text-2xl font-bold text-white mb-2">Dual-Write Storage</h3>
                       <p className="text-slate-400">IndexedDB для скорости + LocalStorage как надежный бэкап. Ноль потерь данных при сбоях сети.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="bg-orange-500/20 p-4 rounded-xl h-fit"><Map size={32} className="text-orange-400"/></div>
                    <div>
                       <h3 className="text-2xl font-bold text-white mb-2">OpenLayers GIS</h3>
                       <p className="text-slate-400">Геодезический расчет площади и спутниковые слои без тяжелых бэкенд-зависимостей.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    // SLIDE 5: DEMO HIGHLIGHTS
    {
      id: 'demo',
      render: () => (
        <div className="h-full flex flex-col justify-center px-16 animate-in slide-in-from-right duration-500">
          <h2 className="text-yield-500 font-bold tracking-widest uppercase mb-4 text-sm">Демо Продукта</h2>
          <h1 className="text-5xl font-bold text-white mb-8">Создано для Полей</h1>
          
          <div className="flex gap-6 overflow-x-auto pb-4">
             {/* Card 1 */}
             <div className="min-w-[300px] bg-[#1a1a1a] rounded-xl border border-slate-800 p-6 flex flex-col">
                <div className="h-40 bg-slate-800/50 rounded-lg mb-4 flex items-center justify-center">
                   <Sprout size={48} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Умный Калькулятор</h3>
                <p className="text-sm text-slate-400 mt-2">Рассчитывает КГ/ГА на основе типа почвы (Серозем) и культуры.</p>
             </div>
              {/* Card 2 */}
             <div className="min-w-[300px] bg-[#1a1a1a] rounded-xl border border-slate-800 p-6 flex flex-col">
                <div className="h-40 bg-slate-800/50 rounded-lg mb-4 flex items-center justify-center">
                   <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20"></div>
                      <Globe size={48} className="text-blue-500 relative z-10" />
                   </div>
                </div>
                <h3 className="text-xl font-bold text-white">Карты и GPS</h3>
                <p className="text-sm text-slate-400 mt-2">Точный замер площади в гектарах. Работает с GPS устройства.</p>
             </div>
              {/* Card 3 */}
             <div className="min-w-[300px] bg-[#1a1a1a] rounded-xl border border-slate-800 p-6 flex flex-col">
                <div className="h-40 bg-slate-800/50 rounded-lg mb-4 flex items-center justify-center">
                   <Zap size={48} className="text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Мультимодальный Чат</h3>
                <p className="text-sm text-slate-400 mt-2">Загрузите фото больного растения или мешка удобрений — Gemini проведет диагностику.</p>
             </div>
          </div>
        </div>
      )
    },
    // SLIDE 6: IMPACT
    {
       id: 'impact',
       render: () => (
         <div className="h-full flex flex-col justify-center px-16 animate-in slide-in-from-right duration-500">
            <h2 className="text-yield-500 font-bold tracking-widest uppercase mb-4 text-sm">Рынок и Влияние</h2>
            <h1 className="text-5xl font-bold text-white mb-12">Почему это важно</h1>
            
            <div className="grid grid-cols-2 gap-16">
               <div className="space-y-8">
                  <div className="border-l-4 border-yield-500 pl-6">
                     <h3 className="text-4xl font-bold text-white mb-2">15-20%</h3>
                     <p className="text-xl text-slate-400">Снижение затрат на семена и удобрения для малых хозяйств.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-6">
                     <h3 className="text-4xl font-bold text-white mb-2">3 Языка</h3>
                     <p className="text-xl text-slate-400">Полная локализация (Узбекский, Русский, Английский) преодолевает цифровой барьер.</p>
                  </div>
               </div>
               <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Масштабируемость</h3>
                  <p className="text-slate-400 mb-6 text-lg">
                    Архитектура не зависит от региона. Мы можем масштабироваться на Казахстан, Таджикистан и Кыргызстан, просто обновив Базу Знаний RAG.
                  </p>
                  <div className="flex gap-2">
                     <span className="bg-yield-900 text-yield-300 px-3 py-1 rounded text-sm font-bold">UZ</span>
                     <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded text-sm font-bold">KZ</span>
                     <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded text-sm font-bold">TJ</span>
                  </div>
               </div>
            </div>
         </div>
       )
    },
    // SLIDE 7: END
    {
        id: 'end',
        render: () => (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in duration-500">
                <h1 className="text-6xl font-bold text-white mb-4">Yield AI</h1>
                <p className="text-2xl text-yield-400">Агрономия будущего, уже сегодня.</p>
                
                <div className="mt-12 flex gap-6">
                    <button onClick={onClose} className="bg-yield-600 hover:bg-yield-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-yield-500/20">
                        Запустить Демо
                    </button>
                </div>
                
                <p className="absolute bottom-8 text-slate-500 text-sm">AI500 Hackathon • Uzbekistan • 2025</p>
            </div>
        )
    }
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setSlide(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050505] z-[100] text-white overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yield-900 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[150px]"></div>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 h-full w-full max-w-7xl mx-auto p-8 md:p-12">
        {slides[slide].render()}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
        <span className="text-slate-500 font-mono text-sm">{slide + 1} / {slides.length}</span>
        
        <button 
           onClick={handleExportPPTX}
           className="p-3 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition-all text-blue-400 hover:text-blue-300 mr-4"
           title="Скачать PPTX"
        >
            <Download size={24} />
        </button>

        <button 
           onClick={() => setSlide(prev => Math.max(prev - 1, 0))}
           disabled={slide === 0}
           className="p-3 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-30 backdrop-blur-sm transition-all"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
           onClick={() => setSlide(prev => Math.min(prev + 1, slides.length - 1))}
           disabled={slide === slides.length - 1}
           className="p-3 bg-yield-600 rounded-full hover:bg-yield-500 disabled:opacity-30 shadow-lg shadow-yield-500/20 transition-all"
        >
            <ChevronRight size={24} />
        </button>
      </div>

      {/* Close Button */}
      <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors z-20">
         Exit Pitch Mode [ESC]
      </button>
    </div>
  );
};