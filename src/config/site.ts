/**
 * İŞLETME BİLGİLERİ — tek düzenleme noktası.
 *
 * Boş bırakılan (null / '') her alan sitede "Eklenecek" olarak işaretlenir;
 * hiçbir bilgi uydurulmaz. Değeri yazdığınız anda ilgili buton/bağlantı çalışır.
 */

/** Saat aralığı: ['10:00', '21:00'] */
export type TimeRange = [open: string, close: string];

export interface SiteConfig {
  brand: { name: string; tagline: string; city: string };
  contact: {
    address: string | null;
    postalCode: string | null;
    /** Görünen telefon */
    phone: string | null;
    /** WhatsApp numarası, ülke koduyla ve yalnız rakam: "905xxxxxxxxx" */
    whatsapp: string | null;
    /** Instagram kullanıcı adı, @ olmadan */
    instagram: string | null;
    /** Google Haritalar bağlantısı */
    mapsUrl: string | null;
    /**
     * Çalışma saatleri, Pazartesi'den başlayarak 7 gün.
     * Boş dizi = kapalı. Bir günde birden fazla aralık olabilir (öğle arası gibi).
     */
    hours: { day: string; ranges: TimeRange[] }[];
  };
  /**
   * Yasal bilgiler: KVKK aydınlatma metni ve künyede kullanılır.
   * Boş bırakılan alanlar "Eklenecek" olarak görünür.
   */
  legal: {
    /**
     * Veri sorumlusu: şahıs işletmesiyse işletme sahibinin adı soyadı,
     * şirketse ticaret unvanı (vergi levhasındaki gibi).
     */
    controllerName: string | null;
    /** KVKK başvuruları ve iletişim için e-posta */
    email: string | null;
    /** Kayıtlı elektronik posta (KEP) adresi, varsa */
    kep: string | null;
    taxOffice: string | null;
    taxNumber: string | null;
    /** Yalnızca şirketler için MERSİS numarası */
    mersis: string | null;
    /** Metinlerin son güncellenme tarihi */
    updated: string;
  };
  booking: {
    /** Online randevu platformu. Doluysa sitedeki tüm "Randevu al" butonları buraya gider. */
    bookingUrl: string | null;
    bookingPlatform: string | null;
    /** WhatsApp'tan yazıldığında hazır gelen mesaj */
    whatsappMessage: string;
  };
}

export const site: SiteConfig = {
  brand: {
    name: 'KAYA HAIR',
    tagline: "GENTLEMEN'S GROOMING",
    city: 'Serdivan / Sakarya',
  },
  contact: {
    address: 'Kemalpaşa Mah. Yemişli Sok. No: 27/B, 54000 Serdivan / Sakarya',
    postalCode: '54000',
    phone: '0533 609 38 54',
    whatsapp: '905336093854',
    instagram: 'kayahair',
    mapsUrl:
      'https://www.google.com/maps/place/KAYA+HA%C4%B0R/@40.7620168,30.3565976,17z/data=!4m15!1m8!3m7!1s0x14ccb3f655edc383:0x5d3ee756f3bdac7a!2sKAYA+HA%C4%B0R!8m2!3d40.7621247!4d30.356617!10e5!16s%2Fg%2F11tp77ngwj!3m5!1s0x14ccb3f655edc383:0x5d3ee756f3bdac7a!8m2!3d40.7621247!4d30.356617!16s%2Fg%2F11tp77ngwj',
    hours: [
      { day: 'Pazartesi', ranges: [['10:00', '21:00']] },
      { day: 'Salı', ranges: [['10:00', '21:00']] },
      { day: 'Çarşamba', ranges: [['10:00', '21:00']] },
      { day: 'Perşembe', ranges: [['10:00', '21:00']] },
      { day: 'Cuma', ranges: [['10:00', '12:00'], ['14:00', '21:00']] },
      { day: 'Cumartesi', ranges: [['10:00', '21:00']] },
      { day: 'Pazar', ranges: [] },
    ],
  },
  legal: {
    controllerName: null,
    email: null,
    kep: null,
    taxOffice: null,
    taxNumber: null,
    mersis: null,
    updated: '31 Ekim 2026',
  },
  booking: {
    bookingUrl: 'https://www.kolayrandevu.com/isletme/kayahair?website=1',
    bookingPlatform: 'KolayRandevu',
    whatsappMessage: 'Merhaba, KAYA HAIR için randevu almak istiyorum.',
  },
};

// Türetilmiş bağlantılar — elle düzenlemeye gerek yok.
const digits = (s: string) => s.replace(/\D/g, '');

export const links = {
  whatsappBase: site.contact.whatsapp ? `https://wa.me/${digits(site.contact.whatsapp)}` : null,
  instagram: site.contact.instagram
    ? `https://www.instagram.com/${site.contact.instagram.replace(/^@/, '')}/`
    : null,
  phone: site.contact.phone ? `tel:+90${digits(site.contact.phone).replace(/^0/, '')}` : null,
  booking: site.booking.bookingUrl,
  maps: site.contact.mapsUrl,
};

export const whatsappLink = (text: string = site.booking.whatsappMessage) =>
  links.whatsappBase ? `${links.whatsappBase}?text=${encodeURIComponent(text)}` : null;

/** Sitedeki tüm "Randevu al" butonlarının hedefi */
export const bookingTarget = links.booking
  ? { href: links.booking, target: '_blank' as const, rel: 'noopener noreferrer' }
  : { href: '#randevu' };
