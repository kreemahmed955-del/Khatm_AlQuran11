
import React, { useState, useEffect } from 'react';
import { Bell, Clock, BookOpen, Check, Play, ShieldAlert, Palette, Save, X, Info, Instagram, Youtube, Share2, Heart, ExternalLink } from 'lucide-react';
import { NotificationSettings, ThemeType } from '../types';

interface Props {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const NotificationSettingsView: React.FC<Props> = ({ theme, onThemeChange }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    time: '05:00',
    includeTafsir: true,
  });
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [pendingToggleValue, setPendingToggleValue] = useState<boolean | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setOriginalSettings(parsed);
    } else {
      setOriginalSettings({ enabled: true, time: '05:00', includeTafsir: true });
    }
    
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    return permission;
  };

  const hasChanges = originalSettings && (
    settings.time !== originalSettings.time || 
    settings.includeTafsir !== originalSettings.includeTafsir
  );

  const performSave = async (updatedSettings: NotificationSettings) => {
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
    setOriginalSettings(updatedSettings);
    setShowSaveConfirm(false);
    
    if (updatedSettings.enabled && permissionStatus !== 'granted') {
      await requestPermission();
    }
  };

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  const initiateToggle = () => {
    setPendingToggleValue(!settings.enabled);
    setShowToggleConfirm(true);
  };

  const confirmToggle = () => {
    if (pendingToggleValue !== null) {
      const newSettings = { ...settings, enabled: pendingToggleValue };
      setSettings(newSettings);
      performSave(newSettings);
    }
    setShowToggleConfirm(false);
    setPendingToggleValue(null);
  };

  const testNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification("نور الإيمان: آية اليوم", {
        body: settings.includeTafsir 
          ? "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ - طلب الزيادة في العلم النافع هو نهج الأنبياء." 
          : "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾",
        icon: '/favicon.ico'
      });
    } else {
      requestPermission();
    }
  };

  const themeOptions: { id: ThemeType; label: string; color: string }[] = [
    { id: 'classic', label: 'الأسود والذهبي', color: '#0a0a0a' },
    { id: 'emerald', label: 'الأخضر الزمردي', color: '#062216' },
    { id: 'midnight', label: 'أزرق الليل', color: '#020617' },
    { id: 'sepia', label: 'ورقي مريح', color: '#f5f2e9' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-8 pb-12">
      {/* Confirmation Dialogs */}
      {showToggleConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm p-8 rounded-3xl border border-[#d4af37]/50 shadow-2xl space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
              <Bell size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {pendingToggleValue ? "تفعيل التنبيهات؟" : "إيقاف التنبيهات؟"}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {pendingToggleValue 
                  ? "سيتم إرسال آية قرآنية لك يومياً في الوقت المحدد لتشجيعك على المتابعة."
                  : "هل أنت متأكد من رغبتك في التوقف عن استلام آيات الختمة اليومية؟"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmToggle}
                className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                تأكيد
              </button>
              <button 
                onClick={() => setShowToggleConfirm(false)}
                className="w-full text-gray-400 text-sm hover:text-white transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm p-8 rounded-3xl border border-[#d4af37]/50 shadow-2xl space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
              <Save size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">هل ترغب في حفظ التغييرات؟</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                سيتم تطبيق الإعدادات الجديدة لتنبيهات الورد اليومي.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => performSave(settings)}
                className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                حفظ
              </button>
              <button 
                onClick={() => setShowSaveConfirm(false)}
                className="w-full text-gray-400 text-sm hover:text-white transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gold-text">الإعدادات والمظهر</h2>
        <p className="text-gray-400 text-sm">خصص تجربتك في تطبيق نور الإيمان</p>
      </div>

      {/* Theme Selection */}
      <div className="glass-card p-6 rounded-3xl border border-[#d4af37]/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
            <Palette size={20} />
          </div>
          <h4 className="font-bold text-sm">مظهر التطبيق</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onThemeChange(opt.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === opt.id ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 opacity-60'}`}
            >
              <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: opt.color }} />
              <span className="text-[10px] font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6 rounded-3xl border border-[#d4af37]/30 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.enabled ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-gray-800 text-gray-500'}`}>
              <Bell size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">تفعيل الإشعارات</h4>
              <p className="text-[10px] text-gray-500">استلام آية قرآنية يومياً</p>
            </div>
          </div>
          <button 
            onClick={initiateToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-[#d4af37]' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${settings.enabled ? 'right-7' : 'right-1'}`} />
          </button>
        </div>

        <div className={`space-y-4 transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-sm">وقت التنبيه</h4>
          </div>
          <input 
            type="time" 
            value={settings.time}
            onChange={(e) => setSettings({...settings, time: e.target.value})}
            className="w-full bg-black/40 border border-[#d4af37]/30 rounded-xl px-4 py-3 text-[#d4af37] focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className={`flex items-center justify-between transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">إرفاق تفسير مختصر</h4>
              <p className="text-[10px] text-gray-500">إظهار معنى الآية مع الإشعار</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings({...settings, includeTafsir: !settings.includeTafsir})}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.includeTafsir ? 'bg-[#d4af37]' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${settings.includeTafsir ? 'right-7' : 'right-1'}`} />
          </button>
        </div>

        <div className="pt-4 space-y-3">
          {hasChanges && (
            <button 
              onClick={handleSaveClick}
              className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 animate-bounce"
            >
              <Save size={18} /> حفظ التغييرات
            </button>
          )}
          
          <button 
            onClick={testNotification}
            className="w-full border border-[#d4af37]/30 text-[#d4af37] py-3 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-[#d4af37]/5"
          >
            <Play size={14} /> معاينة الإشعار الآن
          </button>
        </div>
      </div>

      {/* Social Media & Contact Info Section */}
      <div className="glass-card p-6 rounded-3xl border border-[#d4af37]/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
            <Info size={20} />
          </div>
          <h4 className="font-bold text-sm">عن التطبيق والمطور</h4>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <SocialLinkSmall 
              href="https://www.instagram.com/r8_h_?igsh=M2R3NDl0N3h2cG5x"
              icon={<Instagram size={16} />}
              label="تواصل عبر إنستغرام"
              sublabel="@r8_h_"
            />
            <SocialLinkSmall 
              href="https://youtube.com/channel/UC3g72dKR76l7JanhDPH0wwQ?si=5BHF98GQyuv-oQYY"
              icon={<Youtube size={16} />}
              label="قناة اليوتيوب"
              sublabel="دروس وإرشادات"
            />
            <SocialLinkSmall 
              href="https://www.tiktok.com/@i_.0_?_r=1&_t=ZS-93w5ykbHK0z"
              icon={<Share2 size={16} />}
              label="حساب التيك توك"
              sublabel="مقاطع دينية"
            />
          </div>

          <div className="h-px bg-[#d4af37]/10" />

          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            تطبيق <span className="gold-text">نور الإيمان</span> هو صدقة جارية تهدف لنشر كلام الله وسنة نبيه ﷺ.
          </p>
        </div>
      </div>
    </div>
  );
};

const SocialLinkSmall: React.FC<{href: string, icon: React.ReactNode, label: string, sublabel: string}> = ({href, icon, label, sublabel}) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5 transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className="text-[#d4af37] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h5 className="text-xs font-bold text-white group-hover:gold-text transition-colors">{label}</h5>
        <p className="text-[9px] text-gray-500">{sublabel}</p>
      </div>
    </div>
    <ExternalLink size={12} className="text-gray-600 group-hover:text-[#d4af37] transition-colors" />
  </a>
);

export default NotificationSettingsView;
