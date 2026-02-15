
export const SHORT_VERSES = [
  "﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾",
  "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾",
  "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾",
  "﴿فَاصْبِرْ صَبْرًا جَمِيلًا﴾",
  "﴿وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ﴾",
  "﴿إِنَّ اللَّهَ مَعَ الصَّابِرِينَ﴾",
  "﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ﴾",
  "﴿لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ﴾",
  "﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾",
  "﴿وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ﴾"
];

export const checkAndShowDailyVerse = () => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const lastShown = localStorage.getItem('last_verse_notification_date');
  const today = new Date().toDateString();

  // تظهر الإشعار مرة واحدة فقط في اليوم عند فتح التطبيق
  if (lastShown !== today) {
    const randomVerse = SHORT_VERSES[Math.floor(Math.random() * SHORT_VERSES.length)];
    
    try {
      // Fix: Cast options to any as 'renotify' and 'badge' are valid browser properties but might not be in standard TypeScript NotificationOptions
      new Notification("نور الإيمان: آية تلامس قلبك 🌸", {
        body: randomVerse,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        dir: 'rtl',
        tag: 'daily-verse', // يمنع تكرار الإشعارات المتشابهة
        renotify: true
      } as any);
      localStorage.setItem('last_verse_notification_date', today);
    } catch (e) {
      console.warn("Notification system error:", e);
    }
  }
};

export const isHostedOnNetlify = () => {
  const hostname = window.location.hostname;
  return hostname.includes('netlify.app') || hostname.includes('noor-al-iman') || hostname === 'localhost';
};
