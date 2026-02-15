
import React, { useState } from 'react';
import { 
  Heart, 
  DollarSign, 
  ShieldCheck, 
  HelpCircle, 
  Users, 
  Instagram, 
  Youtube, 
  Share2, 
  ExternalLink, 
  Copy, 
  Check, 
  CreditCard, 
  Wallet,
  MessageCircle,
  Mail,
  Send
} from 'lucide-react';

const SupportView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-10 pb-16">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#d4af37]/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-black border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Heart size={44} className="text-[#d4af37] fill-[#d4af37]/10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold gold-text">الدعم والتواصل</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          مساهمتكم هي الوقود لاستمرار هذا العمل الدعوي وتطويره ليصل إلى كل مسلم.
        </p>
      </div>

      {/* Distribution Policy Card */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-[#d4af37]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <ShieldCheck size={120} className="text-[#d4af37]" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">سياسة توزيع التبرعات</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xl">50%</div>
              <div className="text-right">
                <h4 className="text-xs font-bold text-white">مساعدة الفقراء</h4>
                <p className="text-[10px] text-gray-500">صدقة جارية ومساعدات عينية</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl">50%</div>
              <div className="text-right">
                <h4 className="text-xs font-bold text-white">تطوير البرنامج</h4>
                <p className="text-[10px] text-gray-500">تكاليف السيرفرات والتحديثات</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-[#d4af37] font-medium text-center bg-[#d4af37]/5 py-3 rounded-xl border border-[#d4af37]/10 italic">
            "ما نقص مال من صدقة، بل يزده، بل يزده"
          </p>
        </div>
      </div>

      {/* Social Media & Contact Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
            <MessageCircle size={18} />
          </div>
          <h3 className="font-bold text-sm gold-text">تواصل مباشر مع المطور</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SocialCard 
            href="https://www.instagram.com/r8_h_?igsh=M2R3NDl0N3h2cG5x" 
            icon={<Instagram size={24} />} 
            label="Instagram"
            username="@r8_h_"
            color="hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888]"
          />
          <SocialCard 
            href="https://youtube.com/channel/UC3g72dKR76l7JanhDPH0wwQ?si=5BHF98GQyuv-oQYY" 
            icon={<Youtube size={24} />} 
            label="YouTube"
            username="قناة المطور"
            color="hover:bg-[#ff0000]"
          />
          <SocialCard 
            href="https://www.tiktok.com/@i_.0_?_r=1&_t=ZS-93w5ykbHK0z" 
            icon={<Share2 size={24} />} 
            label="TikTok"
            username="@i_.0_"
            color="hover:bg-black hover:border-white/40"
          />
        </div>
      </div>

      {/* Financial Support Methods */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
            <DollarSign size={18} />
          </div>
          <h3 className="font-bold text-sm gold-text">طرق الدعم المادي</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* IQD Mastercard */}
          <div className="glass-card group p-6 rounded-[2rem] border border-white/5 flex flex-col gap-5 transition-all hover:border-[#d4af37]/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center shadow-inner">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">ماستر كارد (داخل العراق)</h4>
                  <p className="text-xs text-gray-500">دعم عبر زين كاش أو الماستر</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-[#d4af37]/20 group-hover:bg-black/80 transition-colors">
              <span className="font-mono text-xl gold-text tracking-[0.2em]">7342598278</span>
              <button 
                onClick={() => copyToClipboard('7342598278', 'iqd')}
                className="p-3 bg-[#d4af37]/10 hover:bg-[#d4af37] rounded-xl transition-all text-[#d4af37] hover:text-black shadow-lg"
              >
                {copiedId === 'iqd' ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Crypto Wallet */}
          <div className="glass-card group p-6 rounded-[2rem] border border-white/5 flex flex-col gap-5 transition-all hover:border-[#d4af37]/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center shadow-inner">
                  <Wallet size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">العملات الرقمية (Crypto)</h4>
                  <p className="text-xs text-gray-400">دعم عالمي عبر المحافظ المشفرة</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-[#d4af37]/20 overflow-hidden group-hover:bg-black/80 transition-colors">
              <span className="font-mono text-[10px] md:text-xs text-[#d4af37] truncate max-w-[80%] uppercase tracking-wider">XKO8772f189402b4627632a748aafa73c1b7272e1b4</span>
              <button 
                onClick={() => copyToClipboard('XKO8772f189402b4627632a748aafa73c1b7272e1b4', 'crypto')}
                className="p-3 bg-[#d4af37]/10 hover:bg-[#d4af37] rounded-xl transition-all text-[#d4af37] hover:text-black shadow-lg shrink-0"
              >
                {copiedId === 'crypto' ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-xs text-[#d4af37]/60 italic">شكرًا لكل من ساهم ولو بالقليل، جزاكم الله خيرًا وجعلها في ميزان حسناتكم.</p>
        <p className="text-[10px] text-gray-600 mt-2">نور الإيمان © 2024</p>
      </div>
    </div>
  );
};

const SocialCard: React.FC<{href: string, icon: React.ReactNode, label: string, username: string, color: string}> = ({href, icon, label, username, color}) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-3 border border-white/5 transition-all duration-300 group ${color} hover:text-white hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}
  >
    <div className="text-[#d4af37] group-hover:text-white transition-colors transform group-hover:scale-110 duration-300">
      {icon}
    </div>
    <div className="text-center">
      <span className="block text-xs font-bold text-white group-hover:text-white">{label}</span>
      <span className="block text-[9px] font-medium text-gray-500 group-hover:text-white/80">{username}</span>
    </div>
    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/20 transition-colors">
      <ExternalLink size={12} className="opacity-40 group-hover:opacity-100" />
    </div>
  </a>
);

export default SupportView;
