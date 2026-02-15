
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { askReligiousQuestion } from '../services/geminiService';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const STORAGE_KEY = 'noor_al_iman_chat_history';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
        setDefaultMessage();
      }
    } else {
      setDefaultMessage();
    }
  }, []);

  // Save history on changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const setDefaultMessage = () => {
    setMessages([
      { role: 'bot', text: 'السلام عليكم ورحمة الله وبركاته. أنا مساعدك في الأمور الدينية، كيف يمكنني إفادتك اليوم؟' }
    ]);
  };

  const clearHistory = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في مسح سجل المحادثات؟")) {
      localStorage.removeItem(STORAGE_KEY);
      setDefaultMessage();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    const botResponse = await askReligiousQuestion(userMsg);
    
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setIsLoading(false);

    // Trigger subtle reminder after receiving knowledge
    window.dispatchEvent(new CustomEvent('trigger-istighfar', { detail: { force: false } }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-500">
      {/* Header with Clear Button */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
        <h3 className="text-sm font-bold gold-text flex items-center gap-2">
          <Sparkles size={14} className="animate-pulse" />
          المساعد الذكي
        </h3>
        <button 
          onClick={clearHistory}
          className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-500 group"
          title="مسح السجل"
        >
          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
                ${m.role === 'user' ? 'bg-[#d4af37]/10 border-[#d4af37]/30' : 'bg-white/5 border-white/10'}`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-[#d4af37]" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user' 
                  ? 'bg-[#d4af37] text-black font-medium shadow-lg shadow-[#d4af37]/10' 
                  : 'glass-card text-white border-white/10 shadow-xl'}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="glass-card p-4 rounded-2xl flex items-center gap-2 border-[#d4af37]/20">
              <Loader2 className="animate-spin text-[#d4af37]" size={16} />
              <span className="text-xs text-gray-400">جاري البحث في المصادر الإسلامية...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-white/10">
        <div className="relative">
          <input 
            type="text" 
            placeholder="اسأل عن أي مسألة دينية..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full glass-card border-[#d4af37]/30 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#d4af37] transition-all pr-16 text-right placeholder:text-gray-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#d4af37] text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
          <RotateCcw size={10} /> تنبيه: الإجابات يتم توليدها بواسطة الذكاء الاصطناعي، يرجى مراجعة أهل العلم.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
