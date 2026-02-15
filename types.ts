
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  surah?: Surah;
  numberInSurah: number;
}

export interface Dhikr {
  text: string;
  count: number;
  category: 'morning' | 'evening' | 'ali' | 'sahaba';
}

export interface Hadith {
  id: number;
  text: string;
  source: string;
  category: 'faith' | 'manners' | 'quran' | 'general';
}

export interface NotificationSettings {
  enabled: boolean;
  time: string;
  includeTafsir: boolean;
}

export type ThemeType = 'classic' | 'emerald' | 'midnight' | 'sepia';

export type Tab = 'home' | 'quran' | 'prayer' | 'hadith' | 'adhkar' | 'ai' | 'support' | 'settings';
