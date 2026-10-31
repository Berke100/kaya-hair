import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import { photos } from '../config/assets';
import { links, site, whatsappLink } from '../config/site';
import { formatRanges, openStatus, type OpenStatus } from '../lib/hours';

/**
 * Randevu bölümü. Asıl randevu, salonun kullandığı online platformda alınır;
 * WhatsApp ve telefon ikinci kanal olarak sunulur. Site kendisi randevu
 * kaydetmez ya da onaylamaz.
 */
export default function BookingSection() {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(openStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const wa = whatsappLink();
  const channels = [
    links.booking && {
      key: 'online',
      href: links.booking,
      external: true,
      icon: CalendarDays,
      title: 'Online randevu al',
      text: `Size uygun gün ve saati ${site.booking.bookingPlatform ?? 'online randevu sistemi'} üzerinden hemen seçin.`,
      primary: true,
    },
    wa && {
      key: 'wa',
      href: wa,
      external: true,
      icon: MessageCircle,
      title: "WhatsApp'tan yazın",
      text: 'Sorularınız ya da özel bir isteğiniz için mesaj gönderin.',
      primary: false,
    },
    links.phone && {
      key: 'tel',
      href: links.phone,
      external: false,
      icon: Phone,
      title: 'Arayın',
      text: site.contact.phone!,
      primary: false,
    },
    links.maps && {
      key: 'maps',
      href: links.maps,
      external: true,
      icon: MapPin,
      title: 'Yol tarifi al',
      text: site.contact.address ?? 'Google Haritalar',
      primary: false,
    },
  ].filter(Boolean) as {
    key: string;
    href: string;
    external: boolean;
    icon: typeof Phone;
    title: string;
    text: string;
    primary: boolean;
  }[];

  return (
    <section id="randevu" aria-labelledby="randevu-baslik" className="relative scroll-mt-16 overflow-hidden bg-ink">
      <img
        src={photos.barberMain.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[60%_50%] opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" aria-hidden="true" />

      <div className="gutter relative mx-auto grid max-w-[1440px] gap-16 py-24 md:py-36 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
        <div>
          <p className="micro flex items-center gap-4 text-bronze" data-reveal>
            <span className="h-px w-8 bg-bronze" aria-hidden="true" />
            Randevu ve iletişim
          </p>
          <h2 id="randevu-baslik" data-reveal className="editorial mt-6 text-[clamp(2.8rem,6vw,5.4rem)] text-ivory">
            Yeni tarzın için yerini ayırt.
          </h2>
          <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-ivory/75">
            Beklemeden, size uygun saatte. Randevunuzu online alın ya da bize doğrudan ulaşın.
          </p>

          {status && (
            <p className="mt-10 flex items-center gap-3 text-sm text-ivory/85" aria-live="polite">
              <span
                className={`h-2 w-2 rounded-full ${status.open ? 'bg-[#8FAF86]' : 'bg-mute'}`}
                aria-hidden="true"
              />
              {status.label}
            </p>
          )}
          <dl className="mt-5 max-w-sm border-t border-ivory/10 text-sm" data-reveal>
            {site.contact.hours.map((h, i) => (
              <div
                key={h.day}
                className={`flex justify-between gap-6 border-b border-ivory/10 py-2.5 tabular-nums ${
                  status?.today === i ? 'text-ivory' : 'text-ivory/60'
                }`}
              >
                <dt className="flex items-center gap-2">
                  {h.day}
                  {status?.today === i && <span className="micro text-[9px] text-bronze">Bugün</span>}
                </dt>
                <dd>{formatRanges(h.ranges)}</dd>
              </div>
            ))}
          </dl>
          {links.instagram && (
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line mt-8 inline-flex items-center gap-2 text-sm text-ivory/80 hover:text-ivory"
            >
              <Instagram size={15} strokeWidth={1.5} aria-hidden="true" /> @{site.contact.instagram}
            </a>
          )}
        </div>

        <ul id="iletisim" className="flex min-w-0 scroll-mt-24 flex-col gap-3 self-center">
          {channels.map((c, i) => {
            const Icon = c.icon;
            return (
              <li key={c.key} data-reveal style={{ ['--d' as string]: i }}>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`group flex items-center gap-5 border p-5 transition-colors duration-300 md:p-7 ${
                    c.primary
                      ? 'border-ivory bg-ivory text-ink hover:border-bronze hover:bg-bronze'
                      : 'border-ivory/15 bg-ink/50 text-ivory backdrop-blur-sm hover:border-bronze'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.3} aria-hidden="true" className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-medium md:text-xl">{c.title}</span>
                    <span className={`mt-1 block text-sm ${c.primary ? 'text-ink/70' : 'text-mute'}`}>{c.text}</span>
                  </span>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.3}
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            );
          })}
          <li className="pt-3 text-xs leading-relaxed text-mute">
            Online randevu {site.booking.bookingPlatform ?? 'harici bir platform'} üzerinden yeni sekmede açılır.
            Kişisel verileriniz{' '}
            <a href="#kvkk" className="link-line text-ivory/80 hover:text-ivory">
              KVKK Aydınlatma Metni
            </a>{' '}
            kapsamında işlenir.
          </li>
        </ul>
      </div>
    </section>
  );
}
