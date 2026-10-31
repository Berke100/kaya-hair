import type { PhotoKey } from './assets';

/**
 * SAHNE YAPILANDIRMASI
 *
 * Tüm değerler 0–1 arası kaydırma ilerlemesine (progress) göredir.
 * 0 = turun başı, 1 = sonu. Metinleri, zamanlamaları ve kamera
 * hareketlerini yalnızca bu dosyadan değiştirebilirsiniz.
 */

/* ------------------------------------------------------------------ */
/* 1. GÖRSEL KATMANLAR (fotoğraf modu)                                 */
/* ------------------------------------------------------------------ */

/**
 * Kamera anahtar karesi.
 * fx / fy: fotoğraf üzerinde ekranın ortasına getirilecek nokta (0–1).
 * zoom: ekranı kaplayan boyuta göre yakınlaştırma (1 = tam kaplama).
 * Kamera fotoğrafın dışına asla taşmaz; boşluk görünmez.
 */
export interface CameraKey {
  at: number;
  fx: number;
  fy: number;
  zoom: number;
}

export interface VisualLayer {
  id: string;
  photo: PhotoKey;
  /** Görünmeye başladığı / tam göründüğü / kaybolmaya başladığı / bittiği an */
  fade: [inStart: number, inEnd: number, outStart: number, outEnd: number];
  camera: CameraKey[];
  /** Okunabilirlik için üstüne binen karartma (0–1) */
  dim: number;
}

export const visualLayers: VisualLayer[] = [
  {
    // VARIŞ → GEÇİŞ: Dış cephe. Kamera cam kapıya doğru ilerler.
    id: 'arrival',
    photo: 'storefront',
    fade: [-1, 0, 0.2, 0.27],
    camera: [
      { at: 0, fx: 0.5, fy: 0.4, zoom: 1 },
      { at: 0.13, fx: 0.5, fy: 0.5, zoom: 1.22 },
      { at: 0.27, fx: 0.5, fy: 0.55, zoom: 2.3 },
    ],
    dim: 0.36,
  },
  {
    // BEKLEME ALANI: Portrelerden koltuklara yavaş bir eğim.
    id: 'lounge',
    photo: 'lounge',
    fade: [0.2, 0.27, 0.4, 0.45],
    camera: [
      { at: 0.2, fx: 0.6, fy: 0.42, zoom: 1.35 },
      { at: 0.3, fx: 0.64, fy: 0.33, zoom: 1.12 },
      { at: 0.44, fx: 0.52, fy: 0.68, zoom: 1.04 },
    ],
    dim: 0.28,
  },
  {
    // USTALIK 1: Ana berber alanı, koltuklar boyunca soldan sağa.
    id: 'craft-main',
    photo: 'barberMain',
    fade: [0.4, 0.45, 0.52, 0.56],
    camera: [
      { at: 0.4, fx: 0.32, fy: 0.55, zoom: 1.16 },
      { at: 0.56, fx: 0.7, fy: 0.5, zoom: 1.05 },
    ],
    dim: 0.3,
  },
  {
    // USTALIK 2: Aynadaki imzadan, işini yapan ustaya iniş.
    id: 'craft-mirror',
    photo: 'mirrorCraft',
    fade: [0.52, 0.56, 0.62, 0.66],
    camera: [
      { at: 0.52, fx: 0.45, fy: 0.12, zoom: 1.06 },
      { at: 0.66, fx: 0.42, fy: 0.55, zoom: 1.0 },
    ],
    dim: 0.26,
  },
  {
    // USTALIK 3: İstasyonlara ikinci açı.
    id: 'craft-side',
    photo: 'barberSide',
    fade: [0.62, 0.66, 0.7, 0.74],
    camera: [
      { at: 0.62, fx: 0.28, fy: 0.5, zoom: 1.2 },
      { at: 0.74, fx: 0.68, fy: 0.5, zoom: 1.05 },
    ],
    dim: 0.3,
  },
  {
    // DETAYLAR: Tavandaki halka avizelerden koltuğa iniş.
    id: 'details',
    photo: 'barberDetail',
    fade: [0.7, 0.74, 0.84, 0.88],
    camera: [
      { at: 0.7, fx: 0.42, fy: 0.11, zoom: 1.12 },
      { at: 0.78, fx: 0.48, fy: 0.42, zoom: 1.02 },
      { at: 0.88, fx: 0.6, fy: 0.74, zoom: 1.06 },
    ],
    dim: 0.32,
  },
  {
    // FİNAL: Ana salon, karartılmış.
    id: 'final',
    photo: 'barberMain',
    fade: [0.84, 0.9, 2, 3],
    camera: [
      { at: 0.84, fx: 0.55, fy: 0.5, zoom: 1.28 },
      { at: 1, fx: 0.55, fy: 0.48, zoom: 1.06 },
    ],
    dim: 0.72,
  },
];

/* ------------------------------------------------------------------ */
/* 2. METİN KATMANLARI                                                 */
/* ------------------------------------------------------------------ */

export const sceneCopy = {
  arrival: {
    range: [-1, 0.13] as [number, number],
    title: 'KAYA HAIR',
    tagline: "GENTLEMEN'S GROOMING · SERDİVAN",
    headline: 'Tarzın başladığı yer.',
    text: 'Modern erkek bakımını, özenle tasarlanmış bir atmosferde keşfedin.',
  },
  transition: {
    range: [0.16, 0.27] as [number, number],
    headline: 'İçeri adım attığınız anda farkı hissedin.',
    text: 'Her ayrıntısı konforunuz ve tarzınız düşünülerek tasarlandı.',
  },
  lounge: {
    range: [0.29, 0.42] as [number, number],
    label: '01 / BEKLEME ALANI',
    headline: 'Konfor, deneyimin bir parçasıdır.',
    text: 'Özenle hazırlanmış bekleme alanımızda, kendinize ayırdığınız zamanın keyfini çıkarın.',
  },
  craft: {
    range: [0.45, 0.69] as [number, number],
    label: '02 / BERBER DENEYİMİ',
    headline: 'Her detayda ustalık.',
    text: 'Tarzınıza uygun saç ve sakal uygulamalarıyla kişisel bakımınızı özenli bir deneyime dönüştürüyoruz.',
    /** Etiketler sırayla belirir: [görünme anı, metin] */
    services: [
      [0.48, 'Saç Kesimi'],
      [0.52, 'Sakal Tasarımı'],
      [0.56, 'Saç Şekillendirme'],
      [0.6, 'Kişisel Bakım'],
    ] as [number, string][],
  },
  details: {
    range: [0.71, 0.84] as [number, number],
    label: '03 / KAYA HAIR ATMOSFERİ',
    headline: 'Tarz, detaylarda saklıdır.',
    text: 'Modern tasarım, özenli hizmet ve size özel bir bakım deneyimi.',
  },
  final: {
    range: [0.88, 2] as [number, number],
    headline: 'Yeni tarzın için yerini ayırt.',
    text: 'KAYA HAIR deneyimi seni bekliyor.',
  },
};

/* ------------------------------------------------------------------ */
/* 3. BÖLÜM GÖSTERGESİ                                                 */
/* ------------------------------------------------------------------ */

export const chapters = [
  { label: 'Varış', start: 0, end: 0.28, jump: 0 },
  { label: 'Bekleme Alanı', start: 0.28, end: 0.44, jump: 0.35 },
  { label: 'Ustalık', start: 0.44, end: 0.69, jump: 0.55 },
  { label: 'Detaylar', start: 0.69, end: 0.86, jump: 0.78 },
  { label: 'Randevu', start: 0.86, end: 1.01, jump: 0.96 },
];

/** Tur bölümünün uzunluğu (ekran yüksekliği katı). */
export const walkthroughLength = { desktop: 8, mobile: 5 };

/* ------------------------------------------------------------------ */
/* 4. VİDEO MODU                                                       */
/* ------------------------------------------------------------------ */

/**
 * Video modunda metinlerin zamanlaması. Video, fotoğraf turundan farklı
 * bir akışa sahip olduğu için aralıklar ayrı tutulur.
 * null = bu sahnenin metni video modunda gösterilmez.
 * Değerler videodaki saniye / toplam süre oranıdır.
 */
export const videoTimeline: Record<
  'arrival' | 'transition' | 'lounge' | 'craft' | 'details' | 'final',
  [number, number] | null
> & { services: number[] } = {
  // 0–1,7 sn: dış cephe, tabela ve vitrin
  arrival: [-1, 0.12],
  // 2,5–4,3 sn: cam kapıdan içeri geçiş
  transition: [0.16, 0.31],
  lounge: null,
  // 4,8–8,6 sn: istasyonlar boyunca yan kayış
  craft: [0.34, 0.6],
  services: [0.37, 0.42, 0.47, 0.52],
  // 9–11,6 sn: pencere tarafı, içerideki KAYA HAIR tabelası, halka avizeler
  details: [0.63, 0.81],
  // 12 sn sonrası: tüm salonu gösteren geniş final planı
  final: [0.86, 2],
};

export const videoChapters = [
  { label: 'Varış', start: 0, end: 0.32, jump: 0 },
  { label: 'Ustalık', start: 0.32, end: 0.62, jump: 0.46 },
  { label: 'Detaylar', start: 0.62, end: 0.84, jump: 0.72 },
  { label: 'Randevu', start: 0.84, end: 1.01, jump: 0.96 },
];

/** Video üzerindeki karartma ve kadraj */
export const videoLook = {
  /** Metin okunabilirliği için sabit karartma */
  dim: 0.22,
  /** Final sahnesinde ulaşılan karartma */
  finalDim: 0.62,
  /** Final karartmasının başladığı ve tamamlandığı ilerleme */
  finalDimFrom: [0.8, 0.88] as [number, number],
  /** object-position: masaüstü ve dikey mobil ekran için kadraj */
  focus: '50% 50%',
  focusMobile: '50% 50%',
};
