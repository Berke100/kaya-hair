/**
 * MÜŞTERİ YORUMLARI — yalnızca gerçek, herkese açık yorumlar.
 *
 * Kaynaklar (31 Ekim 2026'da alındı):
 * - kayahairclub.com "Yorumlar" bölümü (işletmenin kendi sitesinde yayımladığı yorumlar)
 * - KolayRandevu işletme sayfası (puan özeti ve son yorumlar)
 *
 * İsimler kaynaktaki gibi maskelenmiştir; metinlerde yalnızca noktalama düzeltilmiştir. Puan özetini güncellemek için
 * `ratingSummary` alanlarını KolayRandevu sayfasındaki değerlerle değiştirin.
 */

export const ratingSummary = {
  score: 5,
  outOf: 5,
  ratings: 802,
  reviews: 226,
  source: 'KolayRandevu',
  url: 'https://www.kolayrandevu.com/isletme/kayahair?website=1',
};

export interface Review {
  text: string;
  author: string;
  source: 'Google' | 'KolayRandevu';
  date?: string;
}

export const reviews: Review[] = [
  {
    text: 'Abdurrahman beye teşekkür ederim, işini gerçekten çok güzel yapan biri. Kalite asla tesadüf değildir.',
    author: 'Fa*** İp***',
    source: 'Google',
  },
  {
    text: 'Tuna işini sanat olarak yapan birisi, kendimizi çok özel ve şanslı hissediyoruz.',
    author: 'has...i',
    source: 'KolayRandevu',
    date: 'Ekim 2026',
  },
  {
    text: 'Arkadaşlar çok uzun süredir gidiyorum. Kesinlikle güler yüzlü hizmet alırsınız ve saç kesiminden her türlü memnun kalırsınız.',
    author: 'Ah*** Ke***',
    source: 'Google',
  },
  {
    text: "Abdurrahman Bey'e ilgi alakasından dolayı teşekkür ederim. 3. yılımız, her şey çok güzel.",
    author: 'mus...i',
    source: 'KolayRandevu',
    date: 'Eylül 2026',
  },
  {
    text: 'Hiç şaşmaz, aynı güzellikte aynı profesyonellikte devam ediyor. Eline sağlık Ömer, kolay gelsin.',
    author: 'Kü***',
    source: 'KolayRandevu',
  },
  {
    text: 'Muhammet beyin eline sağlık, çok ilgiliydi. Teşekkürler.',
    author: 'ere...l',
    source: 'KolayRandevu',
    date: 'Ekim 2026',
  },
  {
    text: "Sakarya'nın en iyisi.",
    author: 'Me***',
    source: 'KolayRandevu',
  },
];
