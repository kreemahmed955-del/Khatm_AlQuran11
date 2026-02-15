
import React, { useState, useRef, useEffect } from 'react';
import { HADITHS } from '../constants';
import { Book, Quote, Share2, Copy, Search, Check, Play, Pause, Loader2, Volume2 } from 'lucide-react';
import { generateHadithAudio, decodeBase64ToUint8, decodeAudioData } from '../services/geminiService';

const HadithView: React.FC = () => {
  const [activeCat, setActiveCat] = useState<'all' | 'faith' | 'manners' | 'quran' | 'general'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Audio playback states
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setPlayingId(null);
  };

  const handlePlayHadith = async (item: typeof HADITHS[0]) => {
    if (playingId === item.id) {
      stopAudio();
      return;
    }

    try {
      stopAudio();
      setLoadingAudioId(item.id);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const base64Audio = await generateHadithAudio(item.text);
      const audioBytes = decodeBase64ToUint8(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setPlayingId(null);
        sourceNodeRef.current = null;
      };

      source.start();
      sourceNodeRef.current = source;
      setPlayingId(item.id);
    } catch (error) {
      console.error("Playback error:", error);
      alert("عذراً، تعذر تشغيل الصوت حالياً.");
    } finally {
      setLoadingAudioId(null);
    }
  };

  const filtered = HADITHS.filter(h => {
    const matchesCat = activeCat === 'all' || h.category === activeCat;
    const matchesSearch = h.text.includes(search) || h.source.includes(search);
    return matchesCat && matchesSearch;
  });

  const copyToClipboard = (id: number, text: string, source: string) => {
    const content = `${text}\nالمصدر: ${source}\n- تطبيق نور الإيمان`;
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gold-text">الأحاديث النبوية</h2>
        <p className="text-gray-400 text-sm">مختارات من كلام النبي ﷺ مسموعة</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-[#d4af37]/5 blur-xl group-focus-within:bg-[#d4af37]/10 transition-all rounded-3xl" />
        <div className="relative">
          <input 
            type="text" 
            placeholder="ابحث في الأحاديث..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-card border-[#d4af37]/20 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#d4af37]/50 transition-all pr-12 text-right"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#d4af37]/50" size={20} />
        </div>
      </div>

      <div className="flex bg-black/40 backdrop-blur-md rounded-2xl p-1 border border-[#d4af37]/20 overflow-x-auto scrollbar-hide shadow-xl">
        <CatTab active={activeCat === 'all'} onClick={() => setActiveCat('all')} label="الكل" />
        <CatTab active={activeCat === 'faith'} onClick={() => setActiveCat('faith')} label="الإيمان" />
        <CatTab active={activeCat === 'manners'} onClick={() => setActiveCat('manners')} label="الأخلاق" />
        <CatTab active={activeCat === 'quran'} onClick={() => setActiveCat('quran')} label="القرآن" />
        <CatTab active={activeCat === 'general'} onClick={() => setActiveCat('general')} label="عام" />
      </div>

      <div className="space-y-6">
        {filtered.length > 0 ? filtered.map((item) => (
          <div 
            key={item.id} 
            className={`glass-card p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden
              ${playingId === item.id ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-[0_0_25px_rgba(212,175,55,0.1)]' : 'border-[#d4af37]/10 hover:border-[#d4af37]/40'}`}
          >
            {/* Playing Status Indicator */}
            {playingId === item.id && (
              <div className="absolute top-0 right-0 left-0 h-0.5 bg-[#d4af37]/20">
                <div className="h-full bg-[#d4af37] animate-[shimmer_2s_infinite_linear]" style={{ width: '40%' }} />
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <span className="bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 size={12} className={playingId === item.id ? "animate-pulse" : ""} />
                {item.category === 'faith' && "إيمانيات"}
                {item.category === 'manners' && "أخلاق"}
                {item.category === 'quran' && "القرآن"}
                {item.category === 'general' && "حديث عام"}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePlayHadith(item)}
                  disabled={loadingAudioId !== null && loadingAudioId !== item.id}
                  className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center
                    ${playingId === item.id 
                      ? 'bg-[#d4af37] text-black scale-110 shadow-lg shadow-[#d4af37]/30' 
                      : 'bg-white/5 text-[#d4af37] hover:bg-white/10'}`}
                >
                  {loadingAudioId === item.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : playingId === item.id ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} className="ml-0.5" fill="currentColor" />
                  )}
                </button>
                <button 
                  onClick={() => copyToClipboard(item.id, item.text, item.source)}
                  className="p-2.5 rounded-xl bg-white/5 text-gray-500 hover:text-[#d4af37] hover:bg-white/10 transition-all"
                  title="نسخ الحديث"
                >
                  {copiedId === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <p className="text-2xl leading-[1.8] text-white text-right mb-6 font-medium quran-font transition-all group-hover:text-[#f9e38c]">
              {item.text}
            </p>
            
            <div className="flex justify-start items-center gap-3 border-t border-white/5 pt-5">
              <div className="p-1.5 rounded-lg bg-[#d4af37]/10">
                <Quote size={12} className="text-[#d4af37] rotate-180" />
              </div>
              <span className="text-sm font-bold text-[#d4af37]/80">{item.source}</span>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5">
            <Book size={64} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">لا توجد نتائج تطابق بحثك</p>
            <p className="text-sm mt-1">حاول البحث عن كلمات أخرى في الأحاديث</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(300%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
};

const CatTab: React.FC<{active: boolean, onClick: () => void, label: string}> = ({active, onClick, label}) => (
  <button 
    onClick={onClick}
    className={`flex-1 min-w-[90px] py-3.5 rounded-xl transition-all duration-300 text-xs font-bold relative overflow-hidden
      ${active ? 'text-black' : 'text-gray-500 hover:text-[#d4af37]'}`}
  >
    {active && (
      <div className="absolute inset-0 bg-[#d4af37] animate-in fade-in zoom-in duration-300" />
    )}
    <span className="relative z-10">{label}</span>
  </button>
);

export default HadithView;
