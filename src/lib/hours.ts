import { site, type TimeRange } from '../config/site';

/** Salonun saat dilimindeki şu anki gün (0 = Pazartesi) ve dakika. */
function nowInIstanbul() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const day = Math.max(0, order.indexOf(get('weekday')));
  const minutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
  return { day, minutes };
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export const formatRanges = (ranges: TimeRange[]) =>
  ranges.length ? ranges.map(([a, b]) => `${a} – ${b}`).join(' · ') : 'Kapalı';

export interface OpenStatus {
  today: number;
  open: boolean;
  /** Kısa durum metni: "Şu an açık · 21:00'e kadar" */
  label: string;
}

export function openStatus(): OpenStatus | null {
  const hours = site.contact.hours;
  if (hours.length !== 7) return null;
  const { day, minutes } = nowInIstanbul();
  const current = hours[day].ranges.find(([a, b]) => minutes >= toMin(a) && minutes < toMin(b));
  if (current) return { today: day, open: true, label: `Şu an açık · ${current[1]}'e kadar` };

  // Bugün daha sonra açılıyor mu?
  const laterToday = hours[day].ranges.find(([a]) => toMin(a) > minutes);
  if (laterToday) return { today: day, open: false, label: `Şu an kapalı · ${laterToday[0]}'da açılıyor` };

  // Sonraki açık gün
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = hours[d].ranges[0];
    if (first) {
      const when = i === 1 ? 'Yarın' : hours[d].day;
      return { today: day, open: false, label: `Şu an kapalı · ${when} ${first[0]}'da açılıyor` };
    }
  }
  return { today: day, open: false, label: 'Şu an kapalı' };
}
