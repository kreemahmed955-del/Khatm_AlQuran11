
import React, { useState, useEffect } from 'react';
import { Tab } from '../types';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  BellRing, 
  Library, 
  Clock, 
  Heart, 
  Instagram, 
  Youtube, 
  Share2,
  ShieldCheck,
  ExternalLink,
  Send,
  Sparkles
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: Tab) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [randomVerse, setRandomVerse] = useState<{text: string, reference: string} | null>(null);

  const fetchRandomVerse = async () => {
    try {
      const randomId = Math.floor(Math.random() * 6236) + 1;
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomId}/ar.alafasy`);
      const data = await res.json();
      setRandomVerse({
        text: data.data.text,
        reference: `${data.data.surah.name} : ${data.data.numberInSurah}`
      });
      window.dispatchEvent(new CustomEvent('trigger-istighfar', { detail: { force: false } }));
    } catch (e) {
      setRandomVerse({ text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", reference: "سورة طه : 114" });
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'تطبيق نور الإيمان',
      text: '🌸 تطبيق نور الإيمان - رفيقك لختم القرآن الكريم، الأذكار، ورسائل ربانية يومية. حمله الآن واجعله صدقة جارية لك ولأهلك.',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n\nرابط التطبيق:\n${shareData.url}`);
      alert('تم نسخ رابط التطبيق والرسالة الدعوية بنجاح، يمكنك الآن إرسالها لأصدقائك.');
    }
  };

  useEffect(() => {
    fetchRandomVerse();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-10">
      {/* Daily Message Section */}
      <section className="relative overflow-hidden glass-card rounded-3xl p-8 border border-[#d4af37]/40 shadow-2xl shadow-[#d4af37]/5">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Star size={100} className="text-[#d4af37]" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <span className="text-sm font-bold tracking-widest text-[#d4af37]/80 uppercase">رسالة من الله لك</span>
          <div className="h-px w-16 bg-[#d4af37]/30" />
          <p className="quran-font text-2xl md:text-3xl leading-relaxed text-white">
            {randomVerse ? `"${randomVerse.text}"` : "جاري التحميل..."}
          </p>
          <span className="text-sm italic text-[#d4af37]/70">{randomVerse?.reference}</span>
          <button 
            onClick={fetchRandomVerse}
            className="px-6 py-2 rounded-full border border-[#d4af37] text-xs hover:bg-[#d4af37] hover:text-black transition-all"
          >
            آية أخرى
          </button>
        </div>
      </section>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        <QuickCard 
          title="القرآن الكريم" 
          subtitle="أتمم ختمتك" 
          onClick={() => onNavigate('quran')}
          icon={<Star className="w-8 h-8 text-[#d4af37]" />}
        />
        <QuickCard 
          title="مواقيت الصلاة" 
          subtitle="نبهني لكل صلاة" 
          onClick={() => onNavigate('prayer')}
          icon={<Clock className="w-8 h-8 text-[#d4af37]" />}
        />
        <QuickCard 
          title="أذكار المسلم" 
          subtitle="تحصين اليوم" 
          onClick={() => onNavigate('adhkar')}
          icon={<Quote className="w-8 h-8 text-[#d4af37]" />}
        />
        <QuickCard 
          title="الأحاديث" 
          subtitle="سنة نبينا" 
          onClick={() => onNavigate('hadith')}
          icon={<Library className="w-8 h-8 text-[#d4af37]" />}
        />
      </div>

      {/* Share the App Section */}
      <section className="animate-in slide-in-from-right duration-700">
        <button 
          onClick={handleShareApp}
          className="w-full glass-card p-6 rounded-[2.5rem] border-2 border-dashed border-[#d4af37]/40 bg-gradient-to-l from-[#d4af37]/10 to-transparent flex items-center justify-between group overflow-hidden relative transition-all hover:border-[#d4af37] hover:scale-[1.01]"
        >
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37] text-black flex items-center justify-center shadow-[0_10px_20px_rgba(212,175,55,0.3)] group-hover:rotate-12 transition-transform duration-500">
              <Share2 size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                انشر تؤجر
                <Sparkles size={16} className="text-[#d4af37]" />
              </h3>
              <p className="text-xs text-[#d4af37]/80 font-medium">"الدال على الخير كفاعله"، شارك التطبيق الآن</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">
            <ChevronLeft size={24} className="text-[#d4af37]" />
            <span className="text-[8px] font-bold text-[#d4af37] uppercase tracking-widest">Share</span>
          </div>
        </button>
      </section>

      {/* Developer Support & Contact Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold gold-text flex items-center gap-2">
            <Heart size={16} className="animate-pulse" />
            دعم المشروع والتواصل
          </h3>
          <button 
            onClick={() => onNavigate('support')}
            className="text-[10px] text-[#d4af37] hover:underline flex items-center gap-1"
          >
            عرض الكل <ChevronLeft size={12} />
          </button>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-[#d4af37]/30 space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
               <ShieldCheck size={24} />
             </div>
             <div>
               <h4 className="text-sm font-bold text-white">صدقة جارية ودعم تقني</h4>
               <p className="text-[10px] text-gray-500">50% للمطور و 50% لمساعدة الفقراء</p>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SocialIcon 
              href="https://www.instagram.com/r8_h_?igsh=M2R3NDl0N3h2cG5x" 
              icon={<Instagram size={20} />} 
              label="Instagram"
            />
            <SocialIcon 
              href="https://youtube.com/channel/UC3g72dKR76l7JanhDPH0wwQ?si=5BHF98GQyuv-oQYY" 
              icon={<Youtube size={20} />} 
              label="YouTube"
            />
            <SocialIcon 
              href="https://www.tiktok.com/@i_.0_?_r=1&_t=ZS-93w5ykbHK0z" 
              icon={<Share2 size={20} />} 
              label="TikTok"
            />
          </div>

          <button 
            onClick={() => onNavigate('support')}
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#d4af37]/20"
          >
            <Heart size={18} fill="black" /> ادعم المشروع الآن
          </button>
        </div>
      </section>
    </div>
  );
};

const QuickCard: React.FC<{title: string, subtitle: string, onClick: () => void, icon: React.ReactNode}> = ({title, subtitle, onClick, icon}) => (
  <button 
    onClick={onClick}
    className="glass-card p-6 rounded-3xl border border-[#d4af37]/20 hover:border-[#d4af37] transition-all text-right group"
  >
    <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
  </button>
);

const SocialIcon: React.FC<{href: string, icon: React.ReactNode, label: string}> = ({href, icon, label}) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5 transition-all group"
  >
    <div className="text-[#d4af37] group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-[8px] font-bold text-gray-500 uppercase">{label}</span>
  </a>
);

export default HomeView;
