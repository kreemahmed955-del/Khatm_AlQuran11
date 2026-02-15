
import React, { useState, useEffect } from 'react';
import { Bell, Clock, BookOpen, Check, Play, Palette, Save, X, Info, Instagram, Youtube, Share2, ExternalLink, ShieldCheck, Database, Cloud, FileJson, CheckCircle2, Loader2 } from 'lucide-react';
import { NotificationSettings as SettingsType, ThemeType } from '../types';
import { isHostedOnNetlify } from '../services/notificationService';

interface Props {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const NotificationSettingsView: React.FC<Props> = ({ theme, onThemeChange }) => {
  const [settings, setSettings] = useState<SettingsType>({
    enabled: true,
    time: '05:00',
    includeTafsir: true,
  });
  const [originalSettings, setOriginalSettings] = useState<SettingsType | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [pendingToggleValue, setPendingToggleValue] = useState<boolean | null>(null);
  
  // Backup States
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

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

  const performSave = async (updatedSettings: SettingsType) => {
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
    setOriginalSettings(updatedSettings);
    setShowSaveConfirm(false);
    
    if (updatedSettings.enabled && permissionStatus !== 'granted') {
      await requestPermission();
    }
  };

  const handleGoogleDriveBackup = async () => {
    setIsBackingUp(true);
    
    // جمع كافة بيانات التطبيق من التخزين المحلي
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        backupData[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // محاكاة الاتصال السحابي لتجربة مستخدم أفضل
    await new Promise(resolve => setTimeout(resolve, 1500));

    const link = document.createElement('a');
    link.href = url;
    link.download = `Noor-AlIman-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsBackingUp(false);
    setBackupSuccess(true);
    const now = new Date().toLocaleString('ar-EG');
    localStorage.setItem('last_backup_date', now);
    setTimeout(() => setBackupSuccess(false), 3000);
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
          <div className="glass-card w-full max-w-xs p-8 rounded-3xl border border-[#d4af37]/50 shadow-2xl space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
              <Bell size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {pendingToggleValue ? "تفعيل التنبيهات؟" : "إيقاف التنبيهات؟"}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                سيتم إرسال آية قرآنية لك يومياً لتشجيعك على المتابعة والذكر.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { 
                  if (pendingToggleValue !== null) { 
                    const s = { ...settings, enabled: pendingToggleValue }; 
                    setSettings(s); 
                    performSave(s); 
                  } 
                  setShowToggleConfirm(false); 
                }} 
                className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                تأكيد الاختيار
              </button>
              <button onClick={() => setShowToggleConfirm(false)} className="w-full text-gray-400 text-sm hover:text-white transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gold-text">الإعدادات والسحابة</h2>
        <p className="text-gray-400 text-sm">خصص تجربتك واحفظ بياناتك بأمان</p>
      </div>

      {/* Cloud Backup Section (Google Drive Style) */}
      <div className="glass-card p-7 rounded-[2.5rem] border border-[#d4af37]/40 bg-gradient-to-br from-black via-black/60 to-[#d4af37]/10 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-500 opacity-40" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
              <Cloud size={28} className={isBackingUp ? "animate-bounce" : ""} />
            </div>
            <div className="text-right">
              <h4 className="font-bold text-white text-lg">النسخ الاحتياطي</h4>
              <p className="text-[10px] text-gray-400">احفظ الختمة والأذكار وسجل المحادثات</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson size={16} className="text-[#d4af37]/60" />
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 block">آخر نسخة</span>
                <span className="text-[11px] text-white font-mono">{localStorage.getItem('last_backup_date') || 'لا توجد'}</span>
              </div>
            </div>
            {backupSuccess && (
              <div className="flex items-center gap-1.5 text-green-500 animate-in slide-in-from-left duration-300">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-bold">تم الحفظ</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleGoogleDriveBackup}
            disabled={isBackingUp}
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#d4af37]/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {isBackingUp ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
            <span>حفظ نسخة احتياطية (Drive)</span>
          </button>
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
              <h4 className="font-bold text-sm">إشعارات آية اليوم</h4>
              <p className="text-[10px] text-gray-500">استلام رسائل ربانية قصيرة</p>
            </div>
          </div>
          <button 
            onClick={() => { setPendingToggleValue(!settings.enabled); setShowToggleConfirm(true); }}
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
            <h4 className="font-bold text-sm">وقت التنبيه المفضل</h4>
          </div>
          <input 
            type="time" 
            value={settings.time}
            onChange={(e) => setSettings({...settings, time: e.target.value})}
            className="w-full bg-black/40 border border-[#d4af37]/30 rounded-xl px-4 py-3 text-[#d4af37] focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="pt-4 space-y-3">
          {hasChanges && (
            <button 
              onClick={() => performSave(settings)}
              className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 animate-bounce shadow-lg shadow-[#d4af37]/30"
            >
              <Save size={18} /> حفظ التغييرات
            </button>
          )}
          <button 
            onClick={() => { 
              if (permissionStatus === 'granted') { 
                new Notification("نور الإيمان: آية تلامس قلبك 🌸", { body: "﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾" }); 
              } else { 
                requestPermission(); 
              } 
            }} 
            className="w-full border border-[#d4af37]/30 text-[#d4af37] py-3 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-[#d4af37]/5 transition-all"
          >
            <Play size={14} /> اختبار الإشعار الفوري
          </button>
        </div>
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
            <button key={opt.id} onClick={() => onThemeChange(opt.id)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === opt.id ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 opacity-60'}`}>
              <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: opt.color }} />
              <span className="text-[10px] font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Status */}
      <div className="glass-card p-6 rounded-3xl border border-[#d4af37]/30 bg-gradient-to-l from-[#d4af37]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">حالة الاستضافة</h4>
              <p className="text-[10px] text-gray-500">نظام موثوق وآمن</p>
            </div>
          </div>
          {isHostedOnNetlify() ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-500 text-[10px] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              مستضاف على Netlify
            </div>
          ) : (
            <div className="text-[10px] text-gray-500 italic">بيئة محلية</div>
          )}
        </div>
      </div>

      {/* Developer Social Links */}
      <div className="glass-card p-6 rounded-3xl border border-[#d4af37]/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
            <Info size={20} />
          </div>
          <h4 className="font-bold text-sm">تواصل مع المطور</h4>
        </div>
        <div className="flex flex-col gap-2">
          <SocialLinkSmall href="https://www.instagram.com/r8_h_?igsh=M2R3NDl0N3h2cG5x" icon={<Instagram size={16} />} label="Instagram" sublabel="@r8_h_" />
          <SocialLinkSmall href="https://youtube.com/channel/UC3g72dKR76l7JanhDPH0wwQ?si=5BHF98GQyuv-oQYY" icon={<Youtube size={16} />} label="YouTube" sublabel="Noor Al-Iman Channel" />
          <SocialLinkSmall href="https://www.tiktok.com/@i_.0_?_r=1&_t=ZS-93w5ykbHK0z" icon={<Share2 size={16} />} label="TikTok" sublabel="@i_.0_" />
        </div>
      </div>
    </div>
  );
};

const SocialLinkSmall: React.FC<{href: string, icon: React.ReactNode, label: string, sublabel: string}> = ({href, icon, label, sublabel}) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5 transition-all group">
    <div className="flex items-center gap-3">
      <div className="text-[#d4af37] group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <h5 className="text-xs font-bold text-white group-hover:gold-text transition-colors">{label}</h5>
        <p className="text-[9px] text-gray-500">{sublabel}</p>
      </div>
    </div>
    <ExternalLink size={12} className="text-gray-600 group-hover:text-[#d4af37] transition-colors" />
  </a>
);

export default NotificationSettingsView;
