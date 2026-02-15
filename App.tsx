
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Home, 
  MessageSquare, 
  Heart, 
  Sun, 
  Settings,
  Star, 
  Library,
  Clock,
  Share2,
  Check
} from 'lucide-react';
import QuranView from './components/QuranView';
import AdhkarView from './components/AdhkarView';
import AIAssistant from './components/AIAssistant';
import HomeView from './components/HomeView';
import SupportView from './components/SupportView';
import NotificationSettingsView from './components/NotificationSettings';
import HadithView from './components/HadithView';
import IstighfarBanner from './components/IstighfarBanner';
import PrayerTimesView from './components/PrayerTimesView';
import { Tab, ThemeType } from './types';
import { checkAndShowDailyVerse } from './services/notificationService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [lastRead, setLastRead] = useState<{ surah: number, ayah: number } | null>(null);
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('quran_progress');
    if (saved) setLastRead(JSON.parse(saved));

    const savedTheme = localStorage.getItem('app_theme') as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = `theme-${savedTheme}`;
    }

    const initNotifications = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          checkAndShowDailyVerse();
        }
      }
    };

    initNotifications();

    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('trigger-istighfar'));
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: 'تطبيق نور الإيمان',
      text: '🌸 تطبيق نور الإيمان - رفيقك لختم القرآن الكريم، الأذكار، ورسائل ربانية يومية. حمله الآن واجعله صدقة جارية لك ولأهلك.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n\nرابط التطبيق:\n${shareData.url}`);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'quran': return <QuranView onSaveProgress={(p) => setLastRead(p)} />;
      case 'prayer': return <PrayerTimesView />;
      case 'hadith': return <HadithView />;
      case 'adhkar': return <AdhkarView />;
      case 'ai': return <AIAssistant />;
      case 'support': return <SupportView />;
      case 'settings': return <NotificationSettingsView theme={theme} onThemeChange={changeTheme} />;
      default: return <HomeView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 transition-colors duration-500">
      <IstighfarBanner />
      
      {/* Toast Notification for sharing */}
      {showShareToast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#d4af37] text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(212,175,55,0.4)] border border-black/10">
            <Check size={18} />
            تم نسخ الرابط والرسالة بنجاح
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-[#d4af37]/30">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-[#d4af37] animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest gold-text">نور الإيمان</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleShare} 
            className="p-2 rounded-xl bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-black transition-all duration-300 active:scale-90"
            title="مشاركة التطبيق"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d4af37] transition-all duration-300"
            title="الإعدادات"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 w-full glass-card border-t border-[#d4af37]/30 px-4 py-3 z-50">
        <div className="flex justify-around items-center max-w-xl mx-auto">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home />} 
            label="الرئيسية" 
          />
          <NavButton 
            active={activeTab === 'quran'} 
            onClick={() => setActiveTab('quran')} 
            icon={<BookOpen />} 
            label="القرآن" 
          />
          <NavButton 
            active={activeTab === 'prayer'} 
            onClick={() => setActiveTab('prayer')} 
            icon={<Clock />} 
            label="المواقيت" 
          />
          <NavButton 
            active={activeTab === 'hadith'} 
            onClick={() => setActiveTab('hadith')} 
            icon={<Library />} 
            label="الأحاديث" 
          />
          <NavButton 
            active={activeTab === 'adhkar'} 
            onClick={() => setActiveTab('adhkar')} 
            icon={<Sun />} 
            label="الأذكار" 
          />
          <NavButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<MessageSquare />} 
            label="اسألنا" 
          />
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-[#d4af37] scale-110 font-bold' : 'text-gray-500 opacity-70'}`}
  >
    <div className={`${active ? 'bg-[#d4af37]/10 p-2 rounded-xl' : ''}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className="text-[9px] font-medium truncate w-full text-center">{label}</span>
  </button>
);

export default App;
