import type { PhotoKey } from './assets';

/**
 * GALERİ — kategoriler, sıra ve fotoğraf başlıkları.
 * Galeri kategori kategori kendi kendine akar; bir kategori bitince
 * sıradakine geçer. `focus` fotoğrafın sahnede hangi bölgesinin
 * görüneceğini belirler (CSS object-position).
 */

export interface GalleryItem {
  photo: PhotoKey;
  caption: string;
  focus?: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  /** Kategori seçiliyken görünen tek satırlık açıklama */
  line: string;
  items: GalleryItem[];
}

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'salon',
    name: 'Salon',
    line: 'İstasyonlar, aynalar ve sıcak ışık.',
    items: [
      { photo: 'barberMain', caption: 'Ana salon, akşam ışığı', focus: '45% 55%' },
      { photo: 'barberSide', caption: 'Kemerli ayna ve istasyonlar', focus: '50% 50%' },
      { photo: 'barberDetail', caption: 'Halka avizeler ve klasik koltuk', focus: '50% 62%' },
      { photo: 'barberWindow', caption: 'Vitrin tarafı', focus: '50% 55%' },
      { photo: 'barberDaylight', caption: 'Gün ışığında istasyonlar', focus: '45% 50%' },
    ],
  },
  {
    id: 'bekleme',
    name: 'Bekleme Alanı',
    line: 'Sıranızı rahatça bekleyin.',
    items: [{ photo: 'lounge', caption: 'Bekleme alanı', focus: '55% 60%' }],
  },
  {
    id: 'dis-cephe',
    name: 'Dış Cephe',
    line: 'Kemalpaşa, Yemişli Sokak.',
    items: [
      { photo: 'storefront', caption: 'Akşam üstü dış cephe', focus: '50% 40%' },
      { photo: 'entranceOpen', caption: 'Kapı açık, salon içeriden', focus: '50% 45%' },
    ],
  },
];

/** Her fotoğrafın sahnede kaldığı süre (ms) */
export const gallerySlideMs = 5200;
