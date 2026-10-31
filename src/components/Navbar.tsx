import { bookingTarget } from '../config/site';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { walkthrough } from '../lib/walkthrough';
import SoundToggle from './SoundToggle';

const items = [
  { label: 'Deneyim', href: '#deneyim', action: () => walkthrough.scrollTo(0.24) },
  { label: 'Kurucu', href: '#kurucu' },
  { label: 'Hakkımızda', href: '#hakkimizda' },
  { label: 'Hizmetler', href: '#hizmetler' },
  { label: 'Ekip', href: '#ekip' },
  { label: 'Galeri', href: '#galeri' },
  { label: 'İletişim', href: '#iletisim' },
];

function smooth(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Sinematik alanın dışına çıkınca koyu zemine geçer.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const header = headerRef.current;
      const walk = document.getElementById('deneyim');
      if (!header || !walk) return;
      const past = walk.getBoundingClientRect().bottom < header.offsetHeight + 8;
      header.dataset.solid = String(past);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e: React.MouseEvent, item: (typeof items)[number]) => {
    setOpen(false);
    if (item.action) {
      e.preventDefault();
      item.action();
    }
  };

  return (
    <header
      ref={headerRef}
      data-solid="false"
      className="group fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-colors duration-500 data-[solid=true]:border-b data-[solid=true]:border-ivory/10 data-[solid=true]:bg-ink/95 md:data-[solid=true]:bg-ink/85 md:data-[solid=true]:backdrop-blur-md"
    >
      <div className="gutter flex h-16 items-center justify-between gap-6 md:h-20">
        <a
          href="#ana-sayfa"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: smooth() });
          }}
          className="block shrink-0 opacity-90 transition-opacity hover:opacity-100"
          aria-label="KAYA HAIR, sayfanın başına dön"
        >
          <img
            src="./assets/brand/logo-sand.png"
            alt="KAYA HAIR Gentlemen's Grooming"
            width={802}
            height={403}
            className="h-10 w-auto md:h-12"
            decoding="async"
          />
        </a>

        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-9">
            {items.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={(e) => go(e, item)}
                  className="link-line text-[13px] tracking-[0.06em] text-ivory/80 transition-colors hover:text-ivory"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <SoundToggle />
          <a {...bookingTarget} className="btn btn-ghost min-h-[40px] px-4 text-[11px] md:px-5">
            Randevu al
          </a>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center text-ivory lg:hidden"
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={open}
            aria-controls="mobil-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      <div
        id="mobil-menu"
        hidden={!open}
        className="gutter border-t border-ivory/10 bg-ink/95 pb-8 pt-4 lg:hidden"
      >
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.label} className="border-b border-ivory/10">
              <a
                href={item.href}
                onClick={(e) => go(e, item)}
                className="flex items-center justify-between py-4 font-display text-lg text-ivory"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
