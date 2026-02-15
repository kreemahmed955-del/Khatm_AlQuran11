
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah } from '../types';
import { RECITERS } from '../constants';
import { Search, Book, ArrowRight, ChevronRight, Bookmark, Loader2, BookOpen, Play, Pause, Volume2, User, ChevronDown, Check, X, Headphones, Repeat, FastForward, Info, BookOpenCheck, Sparkles } from 'lucide-react';

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
    // Initialize audio object once
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
      {/* Premium Search Section */}
      <div className="space-y-6">
        {/* Tab Selection Pill */}
        <div className="flex bg-black/60 backdrop-blur-xl rounded-2xl p-1.5 border border-[#d4af37]/20 w-fit mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#d4af37] rounded-xl transition-all duration-500 ease-out shadow-lg shadow-[#d4af37]/20
              ${isVerseSearch ? 'translate-x-[-100%]' : 'translate-x-0'}`} 
          />
          <button 
            onClick={() => { setIsVerseSearch(false); setSearch(''); setVerseSearchResults([]); }}
            className={`relative z-10 px-8 py-3 rounded-xl text-xs font-bold transition-colors duration-500 flex items-center gap-2 ${!isVerseSearch ? 'text-black' : 'text-gray-500 hover:text-[#d4af37]'}`}
          >
            <Book size={14} />
            فهرس السور
          </button>
          <button 
            onClick={() => { setIsVerseSearch(true); setSearch(''); }}
            className={`relative z-10 px-8 py-3 rounded-xl text-xs font-bold transition-colors duration-500 flex items-center gap-2 ${isVerseSearch ? 'text-black' : 'text-gray-500 hover:text-[#d4af37]'}`}
          >
            <Search size={14} />
            بحث الآيات
          </button>
        </div>

        {/* Search Bar Bar */}
        <div className="relative group max-w-3xl mx-auto">
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/10 to-[#d4af37]/0 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
          
          <div className={`relative flex items-center bg-black/40 backdrop-blur-2xl border-2 rounded-[2.5rem] p-1.5 transition-all duration-500 
            ${isSearchingVerses ? 'border-[#d4af37]' : 'border-white/5 group-focus-within:border-[#d4af37]/50 shadow-2xl group-focus-within:scale-[1.01]'}`}>
            
            {/* Prominent Icon */}
            <div className="ml-2 flex items-center justify-center w-14 h-14 rounded-full bg-[#d4af37]/10 text-[#d4af37] transition-all duration-500 group-focus-within:bg-[#d4af37] group-focus-within:text-black">
              {isSearchingVerses ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Search className="group-focus-within:scale-110 transition-transform" size={24} />
              )}
            </div>

            <input 
              type="text" 
              placeholder={isVerseSearch ? "اكتب ما تبحث عنه في كتاب الله..." : "ابحث عن سورة محددة..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isVerseSearch && handleVerseSearch()}
              className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none text-right font-medium text-lg quran-font"
            />

            <div className="flex items-center gap-2 px-2">
              {search.length > 0 && (
                <button 
                  onClick={() => { setSearch(''); setVerseSearchResults([]); }}
                  className="p-3 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                >
                  <X size={18} />
                </button>
              )}
              {isVerseSearch && (
                <button 
                  onClick={handleVerseSearch}
                  disabled={isSearchingVerses || !search.trim()}
                  className="bg-[#d4af37] text-black font-bold text-sm px-10 py-4 rounded-[1.8rem] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span>بحث</span>
                  <Sparkles size={16} />
                </button>
              )}
            </div>
          </div>
          
          {/* Subtext info */}
          {!isVerseSearch && search === '' && (
            <div className="mt-4 flex justify-center gap-6 opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Book size={10} /> 114 سورة</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles size={10} /> 6236 آية</span>
            </div>
          )}
        </div>
      </div>

      {!isVerseSearch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-700">
          {filteredSurahs.map((surah) => (
            <button 
              key={surah.number}
              onClick={() => handleSurahClick(surah)}
              className="glass-card p-6 rounded-[2.5rem] border border-white/5 hover:border-[#d4af37]/40 flex items-center justify-between transition-all group hover:bg-[#d4af37]/5 hover:translate-y-[-2px]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-sm font-bold gold-text shadow-inner group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-500">
                  {surah.number}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-xl text-white group-hover:text-[#f9e38c] transition-colors">{surah.name}</h3>
                  <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">{surah.englishName}</p>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 group-hover:bg-[#d4af37]/20">
                <ChevronRight className="text-[#d4af37]" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-700">
          {isSearchingVerses ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-[#d4af37]/20 rounded-full" />
                <div className="relative w-20 h-20 rounded-full bg-black border-2 border-[#d4af37] flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#d4af37]" size={32} />
                </div>
              </div>
              <p className="text-[#d4af37] font-bold text-lg quran-font animate-pulse">جاري استخراج الآيات من المصحف الشريف...</p>
            </div>
          ) : verseSearchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4af37]/20" />
                <p className="text-[10px] font-bold text-[#d4af37] mx-4 uppercase tracking-[0.2em]">تم العثور على {verseSearchResults.length} نتيجة</p>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4af37]/20" />
              </div>
              {verseSearchResults.map((match, idx) => (
                <div 
                  key={idx}
                  className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-[#d4af37]/40 transition-all text-right group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center mb-5 relative z-10">
                    <button 
                      onClick={() => handleNavigateToVerse(match)}
                      className="text-[10px] font-bold bg-[#d4af37]/10 text-[#d4af37] px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#d4af37] hover:text-black transition-all shadow-sm"
                    >
                      <BookOpen size={14} /> تصفح السورة
                    </button>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold gold-text quran-font">{match.surah.name}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">آية {match.numberInSurah}</span>
                    </div>
                  </div>
                  <p className="quran-font text-3xl leading-[2] text-white group-hover:text-[#f9e38c] transition-colors relative z-10">
                    {match.text}
                  </p>
                </div>
              ))}
            </div>
          ) : search.trim() !== '' ? (
            <div className="text-center py-24 text-gray-500 glass-card rounded-[3rem] border border-white/5 animate-in zoom-in duration-500">
              <Book size={80} className="mx-auto mb-6 opacity-10 text-[#d4af37]" />
              <p className="text-xl font-bold text-white mb-2">عذراً، لم نجد نتائج لـ "{search}"</p>
              <p className="text-sm opacity-60">تأكد من كتابة الكلمة بشكل صحيح في محرك بحث الوحي</p>
            </div>
          ) : (
            <div className="text-center py-24 text-gray-500 opacity-30">
              <Search size={100} className="mx-auto mb-6" />
              <p className="text-sm font-bold uppercase tracking-[0.3em]">اكتب ما تبحث عنه في كتاب الله العزيز</p>
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
