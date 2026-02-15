
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah } from '../types';
import { RECITERS } from '../constants';
import { Search, Book, ArrowRight, ChevronRight, Bookmark, Loader2, BookOpen, Play, Pause, Volume2, User, ChevronDown, Check, X, Headphones, Repeat, FastForward, Info, BookOpenCheck, Sparkles, Command } from 'lucide-react';

interface QuranViewProps {
  onSaveProgress: (progress: { surah: number, ayah: number }) => void;
}

interface SearchMatch {
  number: number;
  text: string;
  surah: Surah;
  numberInSurah: number;
}

interface TafsirData {
  text: string;
  surahName: string;
  ayahNumber: number;
}

const QuranView: React.FC<QuranViewProps> = ({ onSaveProgress }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Audio state
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [showReciterList, setShowReciterList] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Verse Search States
  const [isVerseSearch, setIsVerseSearch] = useState(false);
  const [verseSearchResults, setVerseSearchResults] = useState<SearchMatch[]>([]);
  const [isSearchingVerses, setIsSearchingVerses] = useState(false);

  // Tafsir States
  const [activeTafsir, setActiveTafsir] = useState<TafsirData | null>(null);
  const [isTafsirLoading, setIsTafsirLoading] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const savedReciterId = localStorage.getItem('selected_reciter');
    if (savedReciterId) {
      const reciter = RECITERS.find(r => r.id === savedReciterId);
      if (reciter) setSelectedReciter(reciter);
    }
    const savedAutoPlay = localStorage.getItem('quran_autoplay');
    if (savedAutoPlay) setIsAutoPlay(JSON.parse(savedAutoPlay));
    
    fetchSurahs();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fetchSurahs = async () => {
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await res.json();
      setSurahs(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAyahs = async (surahNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await res.json();
      setAyahs(data.data.ayahs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTafsir = async (ayahNumberInSurah: number) => {
    if (!selectedSurah) return;
    setIsTafsirLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurah.number}:${ayahNumberInSurah}/ar.jalalayn`);
      const data = await res.json();
      if (data.code === 200) {
        setActiveTafsir({
          text: data.data.text,
          surahName: selectedSurah.name,
          ayahNumber: ayahNumberInSurah
        });
      }
    } catch (e) {
      console.error("Tafsir error:", e);
    } finally {
      setIsTafsirLoading(false);
    }
  };

  const handleVerseSearch = async () => {
    if (!search.trim()) return;
    setIsSearchingVerses(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(search)}/all/quran-simple`);
      const data = await res.json();
      if (data.code === 200) {
        setVerseSearchResults(data.data.matches);
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setIsSearchingVerses(false);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    fetchAyahs(surah.number);
  };

  const handleNavigateToVerse = (match: SearchMatch) => {
    setSelectedSurah(match.surah);
    fetchAyahs(match.surah.number);
    setIsVerseSearch(false);
  };

  const handleSaveAyah = (ayahNumber: number) => {
    if (selectedSurah) {
      const progress = { surah: selectedSurah.number, ayah: ayahNumber };
      localStorage.setItem('quran_progress', JSON.stringify(progress));
      onSaveProgress(progress);
      window.dispatchEvent(new CustomEvent('trigger-istighfar'));
    }
  };

  const playAyahAudio = (ayahNumber: number, reciterId?: string) => {
    if (!audioRef.current) return;

    setAudioLoading(true);
    const rid = reciterId || selectedReciter.id;
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${rid}/${ayahNumber}.mp3`;
    
    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.play().catch(e => {
        console.error("Playback error:", e);
        setAudioLoading(false);
    });
    
    setPlayingAyah(ayahNumber);
    
    audioRef.current.onplaying = () => setAudioLoading(false);
    
    audioRef.current.onended = () => {
      setPlayingAyah(null);
      if (isAutoPlay) {
        const currentIndex = ayahs.findIndex(a => a.number === ayahNumber);
        if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
          playAyahAudio(ayahs[currentIndex + 1].number);
          const nextEl = document.getElementById(`ayah-${ayahs[currentIndex + 1].number}`);
          nextEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
  };

  const toggleRecitation = (ayahNumber: number) => {
    if (playingAyah === ayahNumber) {
      if (audioRef.current?.paused) {
        audioRef.current.play();
      } else {
        audioRef.current?.pause();
        setPlayingAyah(null); 
      }
    } else {
      playAyahAudio(ayahNumber);
    }
  };

  const toggleAutoPlay = () => {
    const newVal = !isAutoPlay;
    setIsAutoPlay(newVal);
    localStorage.setItem('quran_autoplay', JSON.stringify(newVal));
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
        audioRef.current.playbackRate = nextRate;
    }
  };

  const changeReciter = (reciter: typeof RECITERS[0]) => {
    const wasPlaying = playingAyah !== null;
    const currentAyah = playingAyah;
    
    setSelectedReciter(reciter);
    localStorage.setItem('selected_reciter', reciter.id);
    setShowReciterList(false);
    
    if (wasPlaying && currentAyah) {
      playAyahAudio(currentAyah, reciter.id);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedSurah) {
    return (
      <div className="animate-in fade-in slide-in-from-left duration-300 relative">
        {/* Tafsir Modal */}
        {activeTafsir && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-lg p-8 rounded-[2.5rem] border border-[#d4af37]/50 shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-6 text-right relative overflow-hidden">
              <button 
                onClick={() => setActiveTafsir(null)}
                className="absolute top-6 left-6 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
                  <BookOpenCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold gold-text">تفسير الجلالين</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">{activeTafsir.surahName} - آية {activeTafsir.ayahNumber}</p>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                <p className="quran-font text-2xl leading-[1.8] text-white whitespace-pre-wrap">
                  {activeTafsir.text}
                </p>
              </div>

              <button 
                onClick={() => setActiveTafsir(null)}
                className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] transition-transform"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => { setSelectedSurah(null); setPlayingAyah(null); if (audioRef.current) audioRef.current.pause(); }}
            className="flex items-center gap-2 text-[#d4af37] hover:underline"
          >
            <ArrowRight size={20} />
            <span className="text-xs font-bold">الفهرس</span>
          </button>

          <div className="flex gap-2">
            <button 
              onClick={cyclePlaybackRate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border bg-[#d4af37]/5 text-[#d4af37] border-[#d4af37]/30"
              title="سرعة التلاوة"
            >
              <FastForward size={12} />
              <span>{playbackRate}x</span>
            </button>

            <button 
              onClick={toggleAutoPlay}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border
                ${isAutoPlay ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-[#d4af37]/5 text-[#d4af37] border-[#d4af37]/30'}`}
              title="تشغيل تلقائي للآيات"
            >
              <Repeat size={12} className={isAutoPlay ? "animate-spin-slow" : ""} />
              <span>{isAutoPlay ? 'تلقائي' : 'يدوي'}</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowReciterList(!showReciterList)}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-[#d4af37]/30 px-3 py-1.5 rounded-full text-[10px] gold-text hover:bg-[#d4af37]/10 transition-all"
              >
                <User size={12} />
                <span className="max-w-[80px] truncate">{selectedReciter.name}</span>
                <ChevronDown size={12} />
              </button>

              {showReciterList && (
                <div className="absolute left-0 mt-2 w-56 glass-card rounded-2xl border border-[#d4af37]/30 z-[70] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto">
                    {RECITERS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => changeReciter(r)}
                        className={`w-full text-right px-4 py-3 flex items-center justify-between hover:bg-[#d4af37]/10 transition-colors border-b border-white/5 last:border-0 ${selectedReciter.id === r.id ? 'bg-[#d4af37]/5' : ''}`}
                      >
                        <div className="text-right">
                          <p className={`text-xs font-bold ${selectedReciter.id === r.id ? 'gold-text' : 'text-white'}`}>{r.name}</p>
                          <p className="text-[9px] text-gray-500">{r.subname}</p>
                        </div>
                        {selectedReciter.id === r.id && <Check size={14} className="gold-text" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border border-[#d4af37]/40 mb-10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient opacity-50" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl" />
          
          <h2 className="text-5xl font-bold mb-3 text-white quran-font drop-shadow-lg">{selectedSurah.name}</h2>
          <div className="flex items-center justify-center gap-3 text-gray-500 text-xs font-bold tracking-widest uppercase">
            <div className="h-px w-8 bg-gray-800" />
            <span>عدد الآيات: {selectedSurah.numberOfAyahs}</span>
            <div className="h-px w-8 bg-gray-800" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#d4af37]" size={40} />
            <p className="text-gray-400 text-sm">جاري تحميل آيات الذكر الحكيم...</p>
          </div>
        ) : (
          <div className="space-y-6 pb-24">
            {ayahs.map((ayah) => (
              <div 
                id={`ayah-${ayah.number}`}
                key={ayah.number} 
                className={`group relative glass-card p-8 rounded-[2rem] border transition-all duration-700 overflow-hidden
                  ${playingAyah === ayah.number 
                    ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_30px_rgba(212,175,55,0.1)] scale-[1.02]' 
                    : 'border-white/5 hover:border-[#d4af37]/30 hover:bg-white/5'}`}
              >
                {/* Visualizer effect when playing */}
                {playingAyah === ayah.number && !audioRef.current?.paused && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="w-1 bg-[#d4af37] animate-pulse-height rounded-full" style={{ height: `${Math.random()*40 + 20}px`, animationDelay: `${i*0.1}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-500
                      ${playingAyah === ayah.number ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/30' : 'bg-white/5 text-gray-500'}`}>
                      {ayah.numberInSurah}
                    </div>
                    <button 
                      onClick={() => toggleRecitation(ayah.number)}
                      className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center
                        ${playingAyah === ayah.number ? 'bg-black text-[#d4af37] shadow-xl' : 'bg-white/5 text-[#d4af37] hover:bg-white/10'}`}
                    >
                      {audioLoading && playingAyah === ayah.number ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (playingAyah === ayah.number && !audioRef.current?.paused) ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                    <button 
                      onClick={() => fetchTafsir(ayah.numberInSurah)}
                      disabled={isTafsirLoading}
                      className="p-3 rounded-2xl bg-white/5 text-gray-500 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
                      title="عرض التفسير"
                    >
                      {isTafsirLoading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveAyah(ayah.numberInSurah)}
                      className="p-2.5 rounded-xl bg-white/5 text-gray-500 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all opacity-0 group-hover:opacity-100"
                      title="حفظ التقدم هنا"
                    >
                      <Bookmark size={18} />
                    </button>
                  </div>
                </div>
                <p className={`quran-font text-3xl leading-[2.2] text-white text-right relative z-10 transition-all duration-500
                  ${playingAyah === ayah.number ? 'text-[#f9e38c] drop-shadow-[0_2px_10px_rgba(249,227,140,0.3)]' : 'group-hover:text-white'}`}>
                  {ayah.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Floating Player Summary */}
        {playingAyah && (
          <div className="fixed bottom-24 left-4 right-4 z-[60] glass-card bg-black/80 backdrop-blur-2xl border border-[#d4af37]/40 rounded-3xl p-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] relative">
                <div className={`absolute inset-0 rounded-2xl border border-[#d4af37]/30 animate-ping opacity-20 ${audioRef.current?.paused ? 'hidden' : ''}`} />
                <Headphones size={24} />
              </div>
              <div className="text-right">
                <h4 className="text-xs font-bold text-white">تلاوة {selectedReciter.name}</h4>
                <p className="text-[10px] text-[#d4af37] font-medium mt-0.5">{selectedSurah.name} - الآية {ayahs.find(a => a.number === playingAyah)?.numberInSurah}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { audioRef.current?.pause(); setPlayingAyah(null); }}
                className="p-3 bg-white/5 text-gray-400 hover:text-white rounded-2xl"
              >
                <X size={20} />
              </button>
              <button 
                onClick={() => toggleRecitation(playingAyah)}
                className="w-12 h-12 bg-[#d4af37] text-black rounded-2xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20"
              >
                {audioLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                ) : !audioRef.current?.paused ? (
                    <Pause size={24} fill="currentColor" />
                ) : (
                    <Play size={24} fill="currentColor" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-12">
      {/* Sleek Refined Search Section */}
      <div className="space-y-10">
        {/* Floating Tab Selection Pill */}
        <div className="flex bg-black/40 backdrop-blur-3xl rounded-[2.2rem] p-1.5 border border-[#d4af37]/20 w-fit mx-auto shadow-2xl relative overflow-hidden group/tabs transition-all hover:border-[#d4af37]/40">
          <div className="absolute inset-0 bg-[#d4af37]/5 opacity-0 group-hover/tabs:opacity-100 transition-opacity duration-700" />
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-br from-[#d4af37] to-[#f9e38c] rounded-[1.8rem] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_10px_25px_rgba(212,175,55,0.4)]
              ${isVerseSearch ? 'translate-x-[-100%]' : 'translate-x-0'}`} 
          />
          <button 
            onClick={() => { setIsVerseSearch(false); setSearch(''); setVerseSearchResults([]); }}
            className={`relative z-10 px-12 py-4 rounded-2xl text-[11px] font-extrabold transition-all duration-500 flex items-center gap-3 ${!isVerseSearch ? 'text-black' : 'text-gray-400 hover:text-[#d4af37]'}`}
          >
            <Book size={18} strokeWidth={2.5} className={!isVerseSearch ? "animate-pulse" : ""} />
            فهرس السور
          </button>
          <button 
            onClick={() => { setIsVerseSearch(true); setSearch(''); }}
            className={`relative z-10 px-12 py-4 rounded-2xl text-[11px] font-extrabold transition-all duration-500 flex items-center gap-3 ${isVerseSearch ? 'text-black' : 'text-gray-400 hover:text-[#d4af37]'}`}
          >
            <Search size={18} strokeWidth={2.5} className={isVerseSearch ? "animate-pulse" : ""} />
            بحث الآيات
          </button>
        </div>

        {/* Premium Integrated Floating Search Bar */}
        <div className="relative group max-w-3xl mx-auto px-4 md:px-0">
          {/* Animated Ambient Glow */}
          <div className="absolute -inset-6 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/15 to-[#d4af37]/0 blur-[80px] opacity-0 group-focus-within:opacity-100 transition-all duration-1000 scale-95 group-focus-within:scale-100" />
          
          <div className={`relative flex items-center bg-black/70 backdrop-blur-3xl border-2 rounded-[3.5rem] p-3 transition-all duration-700 ease-out
            ${isSearchingVerses ? 'border-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.2)]' : 'border-[#d4af37]/20 group-focus-within:border-[#d4af37] shadow-[0_20px_60px_rgba(0,0,0,0.6)] group-focus-within:scale-[1.02]'}`}>
            
            {/* Focal Search Icon Hub */}
            <div className="mr-2 flex items-center justify-center w-16 h-16 rounded-full bg-black/90 border border-[#d4af37]/30 text-[#d4af37] transition-all duration-700 group-focus-within:bg-[#d4af37] group-focus-within:text-black group-focus-within:shadow-[0_0_30px_rgba(212,175,55,0.6)] group-focus-within:rotate-[360deg]">
              {isSearchingVerses ? (
                <Loader2 className="animate-spin" size={30} />
              ) : (
                <Search className="group-hover:scale-110 transition-transform" size={30} strokeWidth={3} />
              )}
            </div>

            <input 
              type="text" 
              placeholder={isVerseSearch ? "اكتب كلمة من الوحي الإلهي..." : "ابحث عن السورة المباركة..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isVerseSearch && handleVerseSearch()}
              className="flex-1 bg-transparent border-none px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none text-right font-bold text-2xl quran-font tracking-wide"
            />

            <div className="flex items-center gap-4 px-4">
              {search.length > 0 && (
                <button 
                  onClick={() => { setSearch(''); setVerseSearchResults([]); }}
                  className="p-3.5 text-gray-500 hover:text-white transition-all hover:bg-white/10 rounded-full group/close"
                  title="مسح البحث"
                >
                  <X size={24} className="group-hover/close:rotate-180 transition-transform duration-700" />
                </button>
              )}
              {isVerseSearch ? (
                <button 
                  onClick={handleVerseSearch}
                  disabled={isSearchingVerses || !search.trim()}
                  className="bg-gradient-to-br from-[#d4af37] to-[#f9e38c] text-black font-black text-sm px-14 py-5 rounded-[2.5rem] hover:shadow-[0_15px_40px_rgba(212,175,55,0.6)] active:scale-90 transition-all disabled:opacity-50 flex items-center gap-3 group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 uppercase tracking-tighter">بحث ذكي</span>
                  <Sparkles size={20} className="relative z-10 group-hover/btn:animate-spin" />
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] shadow-inner">
                  <Command size={14} className="opacity-50" />
                  <span>K</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Animated labels */}
          <div className="mt-8 flex justify-center gap-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-700">
            <div className="flex items-center gap-3 px-6 py-2.5 rounded-[1.2rem] bg-white/5 border border-white/5 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] group-hover:border-[#d4af37]/30 transition-all hover:text-[#d4af37]">
              <Book size={16} className="text-[#d4af37] opacity-70" />
              <span>١١٤ سورة مباركة</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-2.5 rounded-[1.2rem] bg-white/5 border border-white/5 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] group-hover:border-[#d4af37]/30 transition-all hover:text-[#d4af37]">
              <BookOpenCheck size={16} className="text-[#d4af37] opacity-70" />
              <span>بحث قرآني متقدم</span>
            </div>
          </div>
        </div>
      </div>

      {!isVerseSearch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
          {filteredSurahs.map((surah) => (
            <button 
              key={surah.number}
              onClick={() => handleSurahClick(surah)}
              className="glass-card p-8 rounded-[3.2rem] border border-white/5 hover:border-[#d4af37]/60 flex items-center justify-between transition-all group hover:bg-[#d4af37]/10 hover:translate-y-[-8px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-18 h-18 rounded-[1.8rem] bg-black/60 border border-white/10 flex items-center justify-center text-lg font-black gold-text shadow-inner group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-700">
                  {surah.number}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-3xl text-white group-hover:text-[#f9e38c] transition-colors quran-font leading-none">{surah.name}</h3>
                  <p className="text-[11px] text-gray-500 font-black tracking-[0.2em] uppercase mt-2 opacity-50 group-hover:opacity-100 transition-all">{surah.englishName}</p>
                </div>
              </div>
              <div className="bg-[#d4af37]/10 p-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-all -translate-x-8 group-hover:translate-x-0 group-hover:bg-[#d4af37]/30 relative z-10">
                <ChevronRight className="text-[#d4af37]" strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-700">
          {isSearchingVerses ? (
            <div className="flex flex-col items-center justify-center py-40 gap-12">
              <div className="relative">
                <div className="absolute inset-[-30px] animate-ping bg-[#d4af37]/20 rounded-full duration-[2000ms]" />
                <div className="relative w-32 h-32 rounded-full bg-black border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_80px_rgba(212,175,55,0.5)]">
                  <Loader2 className="animate-spin text-[#d4af37]" size={56} />
                </div>
              </div>
              <div className="text-center space-y-4">
                <p className="text-[#d4af37] font-black text-3xl quran-font animate-pulse tracking-[0.2em] uppercase">جاري استحضار الآيات العظيمة</p>
                <div className="flex justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-bounce" />
                </div>
              </div>
            </div>
          ) : verseSearchResults.length > 0 ? (
            <div className="space-y-10">
              <div className="flex items-center justify-between px-10">
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d4af37]/40 to-transparent" />
                <div className="flex items-center gap-4 mx-10">
                  <Sparkles size={20} className="text-[#d4af37] animate-pulse" />
                  <p className="text-[14px] font-black text-[#d4af37] uppercase tracking-[0.5em] font-arabic">
                    النتائج المكتشفة: {verseSearchResults.length} موضع مبارك
                  </p>
                </div>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
              </div>
              {verseSearchResults.map((match, idx) => (
                <div 
                  key={idx}
                  className="glass-card p-14 rounded-[4rem] border border-white/10 hover:border-[#d4af37]/70 transition-all text-right group relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <button 
                      onClick={() => handleNavigateToVerse(match)}
                      className="text-[12px] font-black bg-[#d4af37]/10 text-[#d4af37] px-12 py-5 rounded-full flex items-center gap-4 hover:bg-[#d4af37] hover:text-black transition-all shadow-2xl active:scale-90 group/open border border-[#d4af37]/20"
                    >
                      <BookOpen size={20} className="group-hover/open:rotate-12 transition-transform" /> 
                      تصفح السورة المباركة
                    </button>
                    <div className="flex flex-col items-end">
                      <span className="text-4xl font-black gold-text quran-font tracking-wider mb-2">{match.surah.name}</span>
                      <div className="h-0.5 w-16 bg-gradient-to-l from-[#d4af37] to-transparent mb-2" />
                      <span className="text-[12px] text-gray-500 font-black uppercase tracking-[0.3em]">الآية {match.numberInSurah}</span>
                    </div>
                  </div>
                  <p className="quran-font text-4xl md:text-6xl leading-[2.6] text-white group-hover:text-[#f9e38c] transition-all relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    {match.text}
                  </p>
                </div>
              ))}
            </div>
          ) : search.trim() !== '' ? (
            <div className="text-center py-40 text-gray-500 glass-card rounded-[5rem] border border-white/5 animate-in zoom-in duration-1000 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-white/10 relative">
                <Book size={64} className="opacity-10 text-[#d4af37] scale-125" />
                <X size={32} className="absolute inset-0 m-auto text-red-500/40" />
              </div>
              <h3 className="text-4xl font-black text-white mb-6 quran-font">لم تظهر نتائج لبحثك</h3>
              <p className="text-sm opacity-40 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest">جرّب كلمات أخرى أو تأكد من خلوها من التشكيل في محرك البحث.</p>
            </div>
          ) : (
            <div className="text-center py-48 opacity-10 group cursor-default">
              <div className="relative inline-block mb-12">
                <Search size={180} className="mx-auto group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 ease-out" />
                <div className="absolute -top-6 -right-6 bg-[#d4af37] w-14 h-14 rounded-full flex items-center justify-center text-black animate-pulse shadow-2xl">
                    <Sparkles size={30} />
                </div>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.8em] group-hover:tracking-[1em] transition-all duration-1000 font-arabic opacity-60">ابحث عن السكينة في كلمات الله العزيز</p>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-height {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
        .animate-pulse-height {
          animation: pulse-height 0.8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}} />
    </div>
  );
};

export default QuranView;
