import { useEffect, useRef } from 'react';
import { CalendarDays, Phone } from 'lucide-react';
import { links, bookingTarget } from '../config/site';

/**
 * Mobilde turun bittiği andan itibaren altta duran randevu çubuğu.
 * Randevu bölümü ekrandayken ve sayfanın en altında gizlenir.
 */
export default function MobileCta() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      const walk = document.getElementById('deneyim');
      const booking = document.getElementById('randevu');
      if (!el || !walk) return;
      const vh = window.innerHeight;
      const pastTour = walk.getBoundingClientRect().bottom < vh * 0.6;
      const b = booking?.getBoundingClientRect();
      const bookingInView = b ? b.top < vh && b.bottom > 0 : false;
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 40;
      const show = pastTour && !bookingInView && !atEnd;
      el.dataset.show = String(show);
      el.inert = !show;
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

  return (
    <div
      ref={ref}
      data-show="false"
      className="fixed inset-x-0 bottom-0 z-40 translate-y-full border-t border-ivory/10 bg-ink/95 pb-[max(12px,env(safe-area-inset-bottom,0px))] pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))] pt-3 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] data-[show=true]:translate-y-0 md:hidden"
    >
      <div className="flex gap-2">
        <a {...bookingTarget} className="btn btn-primary min-h-[46px] flex-1 px-3">
          <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" /> Randevu al
        </a>
        {links.phone && (
          <a href={links.phone} className="btn btn-ghost min-h-[46px] px-4" aria-label="Salonu ara">
            <Phone size={16} strokeWidth={1.5} aria-hidden="true" /> Ara
          </a>
        )}
      </div>
    </div>
  );
}
