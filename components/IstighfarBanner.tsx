
import React, { useEffect, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

const IstighfarBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("أستغفر الله العظيم وأتوب إليه");

  const phrases = [
    "أستغفر الله العظيم وأتوب إليه",
    "ربّ اغفر لي ولوالديّ وللمؤمنين والمؤمنات",
    "اللهم إنك عفو كريم تحب العفو فاعفُ عني",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "اللهم صلِّ وسلم وبارك على نبينا محمد",
    "سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
    "يا حي يا قيوم برحمتك أستغيث"
  ];

  useEffect(() => {
    const handleTrigger = (event?: any) => {
      // Higher chance if explicitly triggered by action, lower if periodic
      const chance = event?.detail?.force ? 1 : 0.4;
      
      if (Math.random() < chance) {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setMessage(randomPhrase);
        setIsVisible(true);
        
        // Auto-hide after 6 seconds
        const timer = setTimeout(() => setIsVisible(false), 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('trigger-istighfar', handleTrigger);
    return () => window.removeEventListener('trigger-istighfar', handleTrigger);
  }, [phrases]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-1000">
      <div className="relative group">
        {/* Glowing background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/30 to-[#d4af37]/0 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative glass-card bg-black/80 backdrop-blur-xl border border-[#d4af37]/40 rounded-full px-8 py-4 flex items-center justify-center gap-4 shadow-2xl shadow-[#d4af37]/20">
          <div className="flex-shrink-0">
            <Sparkles size={18} className="text-[#d4af37] animate-pulse" />
          </div>
          
          <span className="text-sm md:text-base font-medium text-[#d4af37] quran-font text-center leading-relaxed">
            {message}
          </span>

          <div className="flex-shrink-0">
            <Heart size={14} className="text-[#d4af37]/40 fill-[#d4af37]/10" />
          </div>

          {/* Close indicator/timer bar */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default IstighfarBanner;
