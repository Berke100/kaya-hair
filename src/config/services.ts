import type { PhotoKey } from './assets';

/**
 * HİZMETLER — sırayı, adları, açıklamaları ve kart fotoğrafını buradan düzenleyin.
 * Fiyat bilgisi bilinçli olarak yer almıyor; güncel fiyatlar randevu platformunda.
 */

export interface Service {
  name: string;
  description: string;
  photo: PhotoKey;
  /** Fotoğrafın kart içindeki odak noktası (CSS object-position) */
  focus?: string;
}

export const services: Service[] = [
  {
    name: 'Saç Kesimi',
    description: 'Yüz hattınıza ve gündelik düzeninize göre şekillenen, bakımı kolay kesimler.',
    photo: 'barberSide',
    focus: '35% 50%',
  },
  {
    name: 'Sakal Tasarımı',
    description: 'Sakal formunun belirlenmesi, hat çalışması ve düzenli görünüm için bakım.',
    photo: 'barberMain',
    focus: '30% 60%',
  },
  {
    name: 'Saç Şekillendirme',
    description: 'Özel günler ya da günlük kullanım için doğru ürünle tamamlanan şekillendirme.',
    photo: 'barberWindow',
    focus: '55% 50%',
  },
  {
    name: 'Erkek Bakımı',
    description: 'Saç ve cilt için kişisel ihtiyacınıza göre planlanan bakım uygulamaları.',
    photo: 'barberDetail',
    focus: '50% 70%',
  },
];

/** Salon vitrininde listelenen diğer hizmetler (dış cephe fotoğrafından). */
export const otherServices: string[] = [
  'Sakal Kesimi',
  'Açma – Boyama',
  'Perma',
  'Keratin Düzleştirme',
  'Cilt Bakımı',
  'Saç Bakımı',
];
