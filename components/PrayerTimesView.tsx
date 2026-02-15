
import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Bell, BellOff, Loader2, Volume2, Square, Info, ShieldCheck, Compass, CheckCircle2, Circle, Smartphone } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const ADHAN_URL = "https://www.islamcan.com/adhan/sounds/adhan-from-makkah.mp3";
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const PrayerTimesView: React.FC = () => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ city: string; country: string, lat: number, lng: number } | null>(null);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [qiblaDir, setQiblaDir] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [viewMode, setViewMode] = useState<'times' | 'qibla' | 'tracker'>('times');
  const [trackedPrayers, setTrackedPrayers] = useState<Record<string, boolean>>({});
  
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTriggeredPrayer = useRef<string | null>(null);
  const hapticTriggered = useRef<boolean>(false);

  useEffect(() => {
    const savedAlerts = localStorage.getItem('prayer_alerts');
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    const todayKey = new Date().toISOString().split('T')[0];
    const savedTracker = localStorage.getItem(`prayer_tracker_${todayKey}`);
    if (savedTracker) setTrackedPrayers(JSON.parse(savedTracker));

    fetchLocationAndTimes();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (times) {
      const interval = setInterval(updateNextPrayer, 1000);
      return () => clearInterval(interval);
    }
  }, [times, alerts]);

  // Handle Qibla Alignment Haptics
  useEffect(() => {
    if (viewMode === 'qibla' && qiblaDir !== null && isCompassActive) {
      const diff = Math.abs((heading + qiblaDir) % 360);
      const isAligned = diff < 2 || diff > 358;
      
      if (isAligned && !hapticTriggered.current) {
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        hapticTriggered.current = true;
      } else if (!isAligned) {
        hapticTriggered.current = false;
      }
    }
  }, [heading, qiblaDir, viewMode, isCompassActive]);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    let compassHeading = 0;
    if ((event as any).webkitCompassHeading) {
      // iOS
      compassHeading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android / Others
      compassHeading = 360 - event.alpha;
    }
    setHeading(compassHeading);
  };

  const startCompass = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          setError("يجب منح صلاحية الوصول للمستشعرات لتشغيل البوصلة.");
          return;
        }
      }
      
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setIsCompassActive(true);
    } catch (e) {
      console.error("Compass activation error", e);
      setError("تعذر تشغيل البوصلة على هذا المتصفح.");
    }
  };

  const calculateQibla = (lat: number, lng: number) => {
    const phi1 = lat * Math.PI / 180;
    const phi2 = KAABA_LAT * Math.PI / 180;
    const lam1 = lng * Math.PI / 180;
    const lam2 = KAABA_LNG * Math.PI / 180;

    const y = Math.sin(lam2 - lam1);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lam2 - lam1);
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    setQiblaDir((qibla + 360) % 360);
  };

  const fetchLocationAndTimes = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          calculateQibla(latitude, longitude);
          await fetchTimesByCoords(latitude, longitude);
        },
        async () => {
          const defaultLat = 24.7136, defaultLng = 46.6753;
          calculateQibla(defaultLat, defaultLng);
          await fetchTimesByCoords(defaultLat, defaultLng);
          setError("لم نتمكن من تحديد موقعك بدقة، تم عرض مواقيت مدينة الرياض.");
        }
      );
    } else {
      fetchTimesByCoords(24.7136, 46.6753);
    }
  };

  const fetchTimesByCoords = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`);
      const data = await res.json();
      setTimes(data.data.timings);
      setLocation({
        city: data.data.meta.timezone.split('/')[1]?.replace('_', ' ') || 'موقعك الحالي',
        country: data.data.meta.timezone.split('/')[0] || '',
        lat,
        lng
      });
      setLoading(false);
    } catch (e) {
      setError("حدث خطأ أثناء تحميل المواقيت.");
      setLoading(false);
    }
  };

  const playAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(ADHAN_URL);
    audio.play().catch(e => console.log("Autoplay blocked or audio error", e));
    audioRef.current = audio;
    setIsPlayingAdhan(true);
    audio.onended = () => setIsPlayingAdhan(false);
  };

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAdhan(false);
    }
  };

  const updateNextPrayer = () => {
    if (!times) return;
    const now = new Date();
    const prayerList = [
      { id: 'Fajr', name: 'الفجر', time: times.Fajr },
      { id: 'Dhuhr', name: 'الظهر', time: times.Dhuhr },
      { id: 'Asr', name: 'العصر', time: times.Asr },
      { id: 'Maghrib', name: 'المغرب', time: times.Maghrib },
      { id: 'Isha', name: 'العشاء', time: times.Isha },
    ];

    const currentFormattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let next = null;
    for (const prayer of prayerList) {
      if (prayer.time === currentFormattedTime && alerts[prayer.id] && lastTriggeredPrayer.current !== prayer.id) {
        lastTriggeredPrayer.current = prayer.id;
        playAdhan();
      }

      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0);

      if (prayerDate > now) {
        const diff = prayerDate.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        next = { 
          name: prayer.name, 
          time: prayer.time, 
          remaining: `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}` 
        };
        break;
      }
    }

    if (!next) {
      next = { name: 'الفجر', time: times.Fajr, remaining: '--:--' };
    }
    setNextPrayer(next);
  };

  const toggleAlert = (name: string) => {
    const newAlerts = { ...alerts, [name]: !alerts[name] };
    setAlerts(newAlerts);
    localStorage.setItem('prayer_alerts', JSON.stringify(newAlerts));
  };

  const togglePrayerTrack = (id: string) => {
    const newTracker = { ...trackedPrayers, [id]: !trackedPrayers[id] };
    setTrackedPrayers(newTracker);
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`prayer_tracker_${todayKey}`, JSON.stringify(newTracker));
    
    if (!trackedPrayers[id]) {
        window.dispatchEvent(new CustomEvent('trigger-istighfar', { detail: { force: true } }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
        <p className="text-gray-400">جاري حساب مواقيت الصلاة لموقعك...</p>
      </div>
    );
  }

  const isAligned = qiblaDir !== null && Math.abs(((heading + qiblaDir) % 360)) < 3;

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8">
      {/* Playing Adhan Overlay */}
      {isPlayingAdhan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="glass-card w-full max-sm p-8 rounded-[3rem] border border-[#d4af37]/50 shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient animate-pulse" />
            <div className="mx-auto w-24 h-24 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 relative">
              <div className="absolute inset-0 rounded-full border border-[#d4af37]/20 animate-ping" />
              <Volume2 size={48} className="animate-bounce" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold gold-text quran-font">حي على الصلاة</h3>
              <p className="text-sm text-gray-400 leading-relaxed">يرفع الآن أذان الحرم المكي الشريف</p>
            </div>
            <button 
              onClick={stopAdhan}
              className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#d4af37]/20"
            >
              <Square size={18} fill="black" /> إيقاف الأذان
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs within Prayer Section */}
      <div className="flex bg-black/40 backdrop-blur-md rounded-2xl p-1 border border-[#d4af37]/20 shadow-xl max-w-sm mx-auto">
        <button 
          onClick={() => setViewMode('times')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${viewMode === 'times' ? 'bg-[#d4af37] text-black' : 'text-gray-500'}`}
        >
          المواقيت
        </button>
        <button 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${viewMode === 'tracker' ? 'bg-[#d4af37] text-black' : 'text-gray-500'}`}
          onClick={() => setViewMode('tracker')}
        >
          المتابعة
        </button>
        <button 
          onClick={() => setViewMode('qibla')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${viewMode === 'qibla' ? 'bg-[#d4af37] text-black' : 'text-gray-500'}`}
        >
          القبلة
        </button>
      </div>

      {viewMode === 'times' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold gold-text">مواقيت الصلاة</h2>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
              <MapPin size={12} className="text-[#d4af37]" />
              {location?.city}, {location?.country}
            </p>
          </div>

          {nextPrayer && (
            <div className="glass-card rounded-[2.5rem] p-10 border border-[#d4af37]/40 relative overflow-hidden text-center shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Clock size={160} className="text-[#d4af37]" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                  <span className="text-[#d4af37] text-[10px] font-bold tracking-widest uppercase">الصلاة القادمة</span>
                </div>
                <h3 className="text-5xl font-bold text-white quran-font tracking-tight">{nextPrayer.name}</h3>
                <div className="text-6xl font-mono text-[#d4af37] py-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">{nextPrayer.remaining}</div>
                <p className="text-xs text-gray-500 font-medium">متبقي على رفع أذان صلاة {nextPrayer.name}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {[
              { id: 'Fajr', name: 'الفجر', time: times?.Fajr },
              { id: 'Sunrise', name: 'الشروق', time: times?.Sunrise },
              { id: 'Dhuhr', name: 'الظهر', time: times?.Dhuhr },
              { id: 'Asr', name: 'العصر', time: times?.Asr },
              { id: 'Maghrib', name: 'المغرب', time: times?.Maghrib },
              { id: 'Isha', name: 'العشاء', time: times?.Isha },
            ].map((p) => {
              if (!p.time) return null;
              const isNext = nextPrayer?.name === p.name;
              const isSunrise = p.id === 'Sunrise';
              
              return (
                <div 
                  key={p.id}
                  className={`group glass-card p-6 rounded-3xl border flex items-center justify-between transition-all duration-500
                    ${isNext ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_25px_rgba(212,175,55,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => !isSunrise && toggleAlert(p.id)}
                      className={`p-3 rounded-2xl transition-all duration-300 ${isSunrise ? 'opacity-0 pointer-events-none' : ''} 
                        ${alerts[p.id] ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-500'}`}
                    >
                      {alerts[p.id] ? <Bell size={20} /> : <BellOff size={20} />}
                    </button>
                    <div className="text-right">
                      <h4 className={`text-xl font-bold ${isNext ? 'gold-text' : 'text-white'}`}>{p.name}</h4>
                    </div>
                  </div>
                  <div className={`text-3xl font-mono font-bold ${isNext ? 'text-[#d4af37]' : 'text-white/80'}`}>
                    {p.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'qibla' && (
        <div className="flex flex-col items-center justify-center py-10 space-y-10 animate-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold gold-text">اتجاه القبلة</h2>
            <p className="text-gray-400 text-sm">حدد اتجاه صلاتك بدقة</p>
          </div>

          {!isCompassActive ? (
            <div className="glass-card p-8 rounded-[2rem] border border-[#d4af37]/30 text-center space-y-6 max-w-sm">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto text-[#d4af37]">
                <Smartphone size={32} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-white">تفعيل مستشعر الاتجاه</h4>
                <p className="text-xs text-gray-400">نحتاج للوصول إلى بوصلة الهاتف لتحديد اتجاه القبلة بدقة في الوقت الفعلي.</p>
              </div>
              <button 
                onClick={startCompass}
                className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl shadow-lg shadow-[#d4af37]/20 hover:scale-105 active:scale-95 transition-all"
              >
                بدء البوصلة
              </button>
            </div>
          ) : (
            <>
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Visual Indicator for Phone Orientation */}
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20">
                    <div className={`w-1 h-6 rounded-full transition-colors duration-300 ${isAligned ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-[#d4af37]'}`} />
                    <span className={`text-[10px] font-bold ${isAligned ? 'text-green-500' : 'text-[#d4af37]'}`}>أعلى الهاتف</span>
                </div>

                {/* Compass background disc (Rotates with device heading) */}
                <div 
                  className="absolute inset-0 rounded-full border-4 border-[#d4af37]/20 glass-card flex items-center justify-center transition-transform duration-200 ease-out"
                  style={{ transform: `rotate(${-heading}deg)` }}
                >
                  <div className="absolute top-4 font-bold text-[#d4af37] text-lg">N</div>
                  <div className="absolute bottom-4 font-bold text-gray-500">S</div>
                  <div className="absolute left-4 font-bold text-gray-500">W</div>
                  <div className="absolute right-4 font-bold text-gray-500">E</div>
                  
                  <div className="w-3/4 h-3/4 rounded-full border border-[#d4af37]/10 border-dashed" />
                  <div className="w-1/2 h-1/2 rounded-full border border-[#d4af37]/10" />

                  {/* Qibla Indicator on the disc */}
                  {qiblaDir !== null && (
                    <div 
                      className="absolute inset-0"
                      style={{ transform: `rotate(${qiblaDir}deg)` }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className={`w-2 h-32 md:h-40 bg-gradient-to-t from-transparent via-[#d4af37] to-[#d4af37] rounded-full transition-all duration-300 ${isAligned ? 'opacity-100 shadow-[0_0_30px_rgba(34,197,94,0.8)] via-green-500 to-green-500' : 'opacity-80 shadow-[0_0_20px_rgba(212,175,55,0.3)]'}`} />
                        <div className={`w-14 h-14 bg-black border-2 rounded-full flex items-center justify-center -mt-7 shadow-xl transition-all duration-300 ${isAligned ? 'border-green-500 scale-110' : 'border-[#d4af37]'}`}>
                          <Compass size={28} className={isAligned ? 'text-green-500' : 'text-[#d4af37]'} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`glass-card p-6 rounded-3xl border transition-all duration-500 text-center space-y-2 max-w-sm ${isAligned ? 'border-green-500 bg-green-500/10' : 'border-[#d4af37]/30'}`}>
                <h4 className={`font-bold text-lg ${isAligned ? 'text-green-500' : 'text-[#d4af37]'}`}>
                  {isAligned ? 'أنت في اتجاه القبلة تماماً' : `بزاوية ${qiblaDir?.toFixed(1)}° درجة`}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isAligned 
                    ? 'تقبل الله منا ومنكم صالح الأعمال.' 
                    : 'قم بتدوير الهاتف حتى يتحول المؤشر إلى اللون الأخضر ويصدر الهاتف اهتزازاً.'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {viewMode === 'tracker' && (
        <div className="space-y-8 animate-in slide-in-from-top duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold gold-text">متابعة الصلوات</h2>
            <p className="text-gray-400 text-sm">حافظ على صلواتك في وقتها</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'Fajr', name: 'صلاة الفجر' },
              { id: 'Dhuhr', name: 'صلاة الظهر' },
              { id: 'Asr', name: 'صلاة العصر' },
              { id: 'Maghrib', name: 'صلاة المغرب' },
              { id: 'Isha', name: 'صلاة العشاء' },
            ].map((p) => (
              <button 
                key={p.id}
                onClick={() => togglePrayerTrack(p.id)}
                className={`glass-card p-6 rounded-[2rem] border flex items-center justify-between transition-all group
                  ${trackedPrayers[p.id] ? 'border-green-500/40 bg-green-500/5' : 'border-white/5 hover:border-[#d4af37]/30'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                    ${trackedPrayers[p.id] ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-500 group-hover:bg-[#d4af37]/10 group-hover:text-[#d4af37]'}`}>
                    {trackedPrayers[p.id] ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                  <div className="text-right">
                    <h4 className={`font-bold ${trackedPrayers[p.id] ? 'text-green-500' : 'text-white'}`}>{p.name}</h4>
                    <p className="text-[10px] text-gray-500">{trackedPrayers[p.id] ? 'تمت بحمد الله' : 'لم يتم التحديد بعد'}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold tracking-widest text-[#d4af37]/40 uppercase">
                  {new Date().toLocaleDateString('ar-EG', { weekday: 'long' })}
                </div>
              </button>
            ))}
          </div>

          {Object.values(trackedPrayers).filter(v => v).length === 5 && (
            <div className="glass-card p-6 rounded-3xl border border-[#d4af37] bg-[#d4af37]/10 text-center animate-bounce">
                <p className="text-[#d4af37] font-bold">ما شاء الله! أتممت صلوات اليوم كاملة.</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 p-4 rounded-2xl text-[10px] text-[#d4af37] text-center flex items-center justify-center gap-2">
          <Info size={14} /> {error}
        </div>
      )}

      <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
          <ShieldCheck size={20} />
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          <strong className="text-[#d4af37] block mb-1">ملاحظة هامة:</strong>
          يرجى التأكد من بقاء التطبيق مفتوحاً في الخلفية ومنح صلاحيات الموقع لضمان دقة المواقيت والقبلة.
        </p>
      </div>
    </div>
  );
};

export default PrayerTimesView;
