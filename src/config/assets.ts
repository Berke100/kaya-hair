/**
 * VARLIK YOLLARI — fotoğraflar ve gelecekteki yürüyüş videosu.
 * Dosyalar public/assets/ klasöründedir. Bir fotoğrafı değiştirmek için
 * aynı adla üzerine yazmanız yeterli.
 *
 * `width` / `height`: fotoğrafın gerçek piksel boyutu. Kamera hareketleri
 * bu oran üzerinden hesaplanır; fotoğrafı değiştirirseniz güncelleyin.
 */

export type PhotoKey =
  | 'storefront'
  | 'lounge'
  | 'barberMain'
  | 'barberSide'
  | 'barberDetail'
  | 'mirrorCraft'
  | 'teamAtWork'
  | 'entranceOpen'
  | 'barberWindow'
  | 'barberDaylight';

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const photos: Record<PhotoKey, Photo> = {
  storefront: {
    src: './assets/storefront.jpg',
    width: 963,
    height: 1020,
    alt: 'KAYA HAIR dış cephesi: lacivert tabela, cam giriş kapısı, ürün vitrinleri ve önündeki oturma grupları',
  },
  lounge: {
    src: './assets/waiting-lounge.jpg',
    width: 960,
    height: 1280,
    alt: 'Bekleme alanı: koyu kanepe ve koltuklar, yuvarlak sehpa, gri duvarda üç siyah-beyaz hayvan portresi',
  },
  barberMain: {
    src: './assets/barber-main.jpg',
    width: 1280,
    height: 960,
    alt: 'Ana berber alanı: siyah berber koltukları, çerçeveli aynalar, lavabolar ve sıcak ışıklı duvar aplikleri',
  },
  barberSide: {
    src: './assets/barber-side.jpg',
    width: 1280,
    height: 960,
    alt: 'Berber istasyonlarına farklı bir açı: kemerli ayna, koltuklar, yeşil duvar detayı ve halka avize',
  },
  barberDetail: {
    src: './assets/barber-detail.jpg',
    width: 1080,
    height: 1920,
    alt: 'Gün ışığında salon: tavandaki halka aydınlatmalar, klasik siyah berber koltuğu ve gri taş zemin',
  },
  mirrorCraft: {
    src: './assets/mirror-craft.jpg',
    width: 1279,
    height: 1920,
    alt: 'Altın çerçeveli kemerli aynada yansıyan bir saç kesimi; aynanın üstünde KAYA HAIR imzası',
  },
  teamAtWork: {
    src: './assets/team-at-work.jpg',
    width: 691,
    height: 830,
    alt: 'KAYA HAIR ekibi çalışırken: tüm istasyonlarda müşteriler, gri mermer zemin ve halka avizeler',
  },
  entranceOpen: {
    src: './assets/entrance-open.jpg',
    width: 1222,
    height: 828,
    alt: 'Kapısı açık KAYA HAIR girişi: vitrin rafı, turuncu aplikler ve içerideki istasyonlar',
  },
  barberWindow: {
    src: './assets/barber-window.jpg',
    width: 692,
    height: 828,
    alt: 'Akşam ışığında vitrin tarafındaki istasyonlar, aydınlatmalı oval ayna ve iç mekân KAYA HAIR tabelası',
  },
  barberDaylight: {
    src: './assets/barber-daylight.jpg',
    width: 1520,
    height: 828,
    alt: 'Gün ışığı alan iki istasyon: çerçeveli aynalar, deri koltuklar, altın çerçeveli boy aynası ve bitkiler',
  },
};

/** Turda kullanılan ve yükleme ekranında önceden yüklenen fotoğraflar */
export const tourPhotoKeys: PhotoKey[] = [
  'storefront',
  'lounge',
  'barberMain',
  'mirrorCraft',
  'barberSide',
  'barberDetail',
];

/**
 * YÜRÜYÜŞ VİDEOSU
 * Gerçek bir yürüyüş videosu çekildiğinde public/assets/kaya-hair-walkthrough.mp4
 * olarak eklemeniz yeterli. Dosya yoksa ya da yüklenemezse site otomatik olarak
 * fotoğraf tabanlı sinematik moda geçer.
 *
 * Kaydırmayla akıcı sarma için videoyu sık anahtar kareyle kodlayın:
 *   ffmpeg -i girdi.mp4 -c:v libx264 -preset slow -crf 23 -g 6 -keyint_min 6 \
 *     -movflags +faststart -an -vf "scale=1920:-2" kaya-hair-walkthrough.mp4
 */
export const walkthroughVideo: {
  src: string;
  srcMobile: string | null;
  enableOnMobile: boolean;
  loadTimeoutMs: number;
} = {
  src: './assets/kaya-hair-walkthrough.mp4',
  /** Mobil için daha hafif sürüm (720p). null ise masaüstü dosyası kullanılır. */
  srcMobile: './assets/kaya-hair-walkthrough-mobile.mp4',
  /** Mobilde de video kullanılsın mı? */
  enableOnMobile: true,
  /**
   * Açılış ekranı en fazla bu kadar bekler (ms). Video daha geç inerse tur
   * fotoğraflarla başlar ve video hazır olunca kendiliğinden videoya geçer.
   */
  loadTimeoutMs: 12000,
};
