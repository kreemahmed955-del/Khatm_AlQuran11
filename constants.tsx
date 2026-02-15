
import { Dhikr, Hadith } from './types';

export interface Reciter {
  id: string;
  name: string;
  subname: string;
}

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', subname: 'مرتل' },
  { id: 'ar.hazzaalbalushi', name: 'هزاع البلوشي', subname: 'تلاوة هادئة' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', subname: 'الحرم المكي' },
  { id: 'ar.yasserabdullahaldosari', name: 'ياسر الدوسري', subname: 'تلاوة نجدية' },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد', subname: 'المجود' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', subname: 'المنشاوي' },
];

export const ADHKAR: Dhikr[] = [
  { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", count: 1, category: 'morning' },
  { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", count: 1, category: 'morning' },
  { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", count: 1, category: 'evening' },
  { text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَهُ", count: 1, category: 'evening' },
  { text: "كن منفرداً في حاجتك، معتزلاً في كربتك، حامداً في نعمتك", count: 1, category: 'ali' },
  { text: "الدنيا دار ممر لا دار مقر، والناس فيها رجلان: رجل باع فيها نفسه فأوبقها، ورجل ابتاع نفسه فأعتقها", count: 1, category: 'ali' },
  { text: "لو أن الصبر كان رجلاً لكان كريماً", count: 1, category: 'ali' },
  { text: "نحن قوم أعزنا الله بالإسلام، فإذا ابتغينا العزة في غيره أذلنا الله", count: 1, category: 'sahaba' },
];

export const HADITHS: Hadith[] = [
  { id: 1, text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", source: "البخاري ومسلم", category: 'faith' },
  { id: 2, text: "خيركم من تعلم القرآن وعلمه", source: "البخاري", category: 'quran' },
  { id: 3, text: "الدين النصيحة", source: "مسلم", category: 'manners' },
  { id: 4, text: "لا يُؤمِنُ أحدُكم حتى يُحِبَّ لأخيه ما يُحِبُّ لنفسِه", source: "البخاري ومسلم", category: 'manners' },
  { id: 5, text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", source: "مسلم", category: 'faith' },
  { id: 6, text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ", source: "الترمذي", category: 'manners' },
  { id: 7, text: "الطهور شطر الإيمان", source: "مسلم", category: 'general' },
];
