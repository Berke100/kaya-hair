/**
 * EKİP — kayahairclub.com'daki "Profesyonel Kadro / Ekibimiz" bölümünden.
 *
 * Fotoğraflar public/assets/team/ klasörüne `photo` alanındaki adla konur.
 * Fotoğraf yoksa kartta ismin baş harfleri görünür; site bozulmaz.
 * `source`: fotoğrafın kayahairclub.com'daki dosya adı (eşleştirme için).
 */

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
  source: string;
  /** Kart içinde fotoğrafın odak noktası */
  focus?: string;
}

export const founder = {
  name: 'Abdurrahman Kaya',
  role: 'Kurucu',
  photo: './assets/team/abdurrahman-kaya.jpg',
  source: 'team-7',
  bio: [
    "Yılların deneyimini ve tutkusunu her kesimde hissettiren Abdurrahman Kaya, Kaya Hair'in kurucusu ve baş stilistidir. Mesleğe olan bağlılığı ve mükemmeliyetçi yaklaşımıyla, her müşterisine benzersiz bir deneyim sunmayı ilke edinmiştir.",
    "Klasik berberlik sanatını çağdaş tekniklerle birleştiren vizyonuyla, Kaya Hair'i Serdivan'ın en prestijli erkek bakım merkezi hâline getirmiştir.",
  ],
};

export const team: TeamMember[] = [
  { name: 'Muhammed Ömer Kaya', role: 'Saç Tasarım Uzmanı', photo: './assets/team/muhammed-omer-kaya.jpg', source: 'team-5' },
  { name: 'Mehmet Ali Demirci', role: 'Saç Tasarım Uzmanı', photo: './assets/team/mehmet-ali-demirci.jpg', source: 'team-1' },
  { name: 'İrfan Yılmaz', role: 'Saç Tasarım Uzmanı', photo: './assets/team/irfan-yilmaz.jpg', source: 'team-3' },
  { name: 'Yücel Üşenmez', role: 'Saç Tasarım Uzmanı', photo: './assets/team/yucel-usenmez.jpg', source: 'team-2' },
  { name: 'Tuna Abdussamed', role: 'Saç Tasarım Uzmanı', photo: './assets/team/tuna-abdussamed.jpg', source: 'team-4' },
  { name: 'Canberk Bayraktar', role: 'Asistan', photo: './assets/team/canberk-bayraktar.jpg', source: 'team-8' },
  { name: 'Kaan Yaylacı', role: 'Asistan', photo: './assets/team/kaan-yaylaci.jpg', source: 'team-6' },
];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toLocaleUpperCase('tr-TR');
