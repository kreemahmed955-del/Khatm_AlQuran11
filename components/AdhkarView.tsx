
import React, { useState } from 'react';
import { ADHKAR } from '../constants';
import { Sun, Moon, Star, Users, CheckCircle, RotateCcw, Sparkles } from 'lucide-react';

const AdhkarView: React.FC = () => {
  const [activeCat, setActiveCat] = useState<'morning' | 'evening' | 'ali' | 'sahaba'>('morning');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const filtered = ADHKAR.filter(a => a.category === activeCat);

  const handleIncrement = (itemText: string, max: number) => {
    const key = `${activeCat}-${itemText}`;
    const current = counts[key] || 0;
    
    if (current < max) {
      const nextCount = current + 1;
      setCounts(prev => ({ ...prev, [key]: nextCount }));
      
      if (nextCount === max) {
        setCompletedItems(prev => new Set(prev).add(key));
        window.dispatchEvent(new CustomEvent('trigger-istighfar'));
        // Play a subtle vibration if supported
        if ('vibrate' in navigator) navigator.vibrate(50);
      }
    }
  };

  const resetCategory = () => {
    if (window.confirm("هل تريد إعادة تصفير عداد هذه المجموعة؟")) {
      const newCounts = { ...counts };
      const newCompleted = new Set(completedItems);
      filtered.forEach(item => {
        const key = `${activeCat}-${item.text}`;
        delete newCounts[key];
        newCompleted.delete(key);
      });
      setCounts(newCounts);
      setCompletedItems(newCompleted);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Category Header */}
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl font-bold gold-text">الأذكار والمأثورات</h2>
        <p className="text-gray-400 text-sm">حصن نفسك بذكر الله في كل وقت</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/40 backdrop-blur-md rounded-2xl p-1.5 border border-[#d4af37]/20 mb-8 sticky top-20 z-40 shadow-xl">
        <CatTab active={activeCat === 'morning'} onClick={() => setActiveCat('morning')} icon={<Sun size={18}/>} label="الصباح" />
        <CatTab active={activeCat === 'evening'} onClick={() => setActiveCat('evening')} icon={<Moon size={18}/>} label="المساء" />
        <CatTab active={activeCat === 'ali'} onClick={() => setActiveCat('ali')} icon={<Star size={18}/>} label="الإمام علي" />
        <CatTab active={activeCat === 'sahaba'} onClick={() => setActiveCat('sahaba')} icon={<Users size={18}/>} label="الصحابة" />
      </div>

      {/* List */}
      <div className="space-y-6">
        {filtered.map((item, idx) => {
          const key = `${activeCat}-${item.text}`;
          const currentCount = counts[key] || 0;
          const isDone = completedItems.has(key);
          const progress = (currentCount / item.count) * 100;
          
          return (
            <div 
              key={idx} 
              onClick={() => handleIncrement(item.text, item.count)}
              className={`group relative glass-card p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer select-none overflow-hidden
                ${isDone 
                  ? 'border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                  : 'border-[#d4af37]/20 hover:border-[#d4af37]/60 active:scale-[0.98]'}`}
            >
              {/* Progress Background Layer */}
              <div 
                className="absolute inset-0 bg-[#d4af37]/5 transition-all duration-500 ease-out origin-right"
                style={{ width: `${progress}%` }}
              />

              <div className="relative z-10">
                <p className="quran-font text-2xl leading-[1.8] text-white text-right mb-6 transition-colors">
                  {item.text}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <div className="flex items-center gap-2 text-green-500 animate-in zoom-in duration-300">
                        <div className="bg-green-500/20 p-2 rounded-full">
                          <CheckCircle size={18} />
                        </div>
                        <span className="text-xs font-bold font-arabic">تم بحمد الله</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#d4af37]">
                        <div className="bg-[#d4af37]/10 p-2 rounded-full group-hover:bg-[#d4af37]/20 transition-colors">
                          <Sparkles size={16} className={currentCount > 0 ? "animate-spin" : ""} />
                        </div>
                        <span className="text-[10px] font-bold opacity-60">انقر للتسبيح</span>
                      </div>
                    )}
                  </div>

                  {/* Circular Counter Display */}
                  <div className="relative flex items-center justify-center w-14 h-14">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-white/5"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={150.8}
                        strokeDashoffset={150.8 - (150.8 * progress) / 100}
                        strokeLinecap="round"
                        className={`transition-all duration-500 ease-out ${isDone ? 'text-green-500' : 'text-[#d4af37]'}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-sm font-bold font-mono ${isDone ? 'text-green-500' : 'text-white'}`}>
                        {currentCount}
                      </span>
                      <span className="text-[8px] opacity-40 -mt-1">{item.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex justify-center">
        <button 
          onClick={resetCategory}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all text-xs font-bold"
        >
          <RotateCcw size={16} />
          إعادة تصفير العداد
        </button>
      </div>
    </div>
  );
};

const CatTab: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({active, onClick, icon, label}) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-[10px] font-bold relative overflow-hidden
      ${active ? 'text-black' : 'text-gray-500 hover:text-[#d4af37]'}`}
  >
    {active && (
      <div className="absolute inset-0 bg-[#d4af37] animate-in fade-in zoom-in duration-300" />
    )}
    <div className="relative z-10">
      {icon}
    </div>
    <span className="relative z-10">{label}</span>
  </button>
);

export default AdhkarView;
