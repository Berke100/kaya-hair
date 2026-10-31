import type { PhotoKey } from './assets';

/**
 * HAKKIMIZDA — kayahairclub.com'daki Hakkımızda, Mekanımız ve
 * İkramlarımız içeriğinden. Sıra, bir müşterinin salondaki akışıdır:
 * kapıdan girer, bekleme salonunda oturur, ikramını alır.
 */

export interface VisitStep {
  id: string;
  label: string;
  title: string;
  text: string;
  /** Mevcut fotoğraflardan biri ya da doğrudan bir yol */
  photo: PhotoKey | { src: string; alt: string };
  focus?: string;
}

export const visitIntro = {
  label: 'Hakkımızda',
  title: 'Koltuğa oturmadan başlayan bir deneyim.',
};

export const visitSteps: VisitStep[] = [
  {
    id: 'hakkimizda',
    label: 'Hakkımızda',
    title: 'Kaya Hair',
    text: "Serdivan'ın kalbinde, Kemalpaşa Mahallesi'nde hizmet veren Kaya Hair, erkek kuaförlüğünü bir sanat formuna dönüştürüyor. Kurucumuz Abdurrahman Kaya liderliğinde, her müşterimize özel çözümler sunuyor, klasik berberlik geleneğini modern tekniklerle harmanlıyoruz.",
    photo: 'storefront',
    focus: '50% 40%',
  },
  {
    id: 'mekan',
    label: 'Mekanımız',
    title: 'Ev sıcaklığında konfor',
    text: "Kaya Hair'e adım attığınız andan itibaren kendinizi evinizde gibi hissedeceksiniz. Modern ve şık bekleme salonumuz, günün yorgunluğunu geride bırakıp bakım deneyiminize hazırlanmanız için tasarlandı.",
    photo: 'lounge',
    focus: '55% 55%',
  },
  {
    id: 'ikram',
    label: 'İkramlarımız',
    title: 'Keyfinize keyif katalım',
    text: "Saç işleminizi yaptırmadan önce dilediğiniz kahve eşliğinde bekleme salonumuzda keyifle dinlenebilirsiniz. Arkanıza yaslanın, gerisini bize bırakın; Kaya Hair, size en iyi deneyimi sunmak için burada.",
    photo: { src: './assets/ikram.jpg', alt: 'Buzlu, sütlü soğuk kahve bardağı' },
    focus: '50% 45%',
  },
];

/** Adımlar arasında otomatik geçiş süresi (ms). Kullanıcı seçim yapınca durur. */
export const visitAutoMs = 6500;
