import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { loader } from '../lib/loader';
import { prefersReducedMotion } from '../lib/motion';

/** Açılış ekranı: tur fotoğrafları yüklenirken yüzde gösterir. */
export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLImageElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const shown = { v: 0 };
    let tween: gsap.core.Tween | null = null;
    const unsub = loader.onProgress((r) => {
      tween?.kill();
      tween = gsap.to(shown, {
        v: r * 100,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = String(Math.round(shown.v));
          if (barRef.current) barRef.current.style.transform = `scaleX(${shown.v / 100})`;
          if (fillRef.current) fillRef.current.style.clipPath = `inset(0 ${(100 - shown.v).toFixed(2)}% 0 0)`;
        },
      });
    });
    loader.start();
    document.documentElement.style.overflow = 'hidden';

    let alive = true;
    loader.ready.then(() => {
      if (!alive) return;
      const root = rootRef.current;
      const done = () => {
        document.documentElement.style.overflow = '';
        // index.html'deki yükleme güvencesine: site açıldı, hata ekranı gösterme.
        window.__khReady = true;
        setGone(true);
      };
      if (!root || prefersReducedMotion()) return done();
      gsap
        .timeline({ delay: 0.5, onComplete: done })
        .to(root.querySelector('.pl-inner'), { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' })
        .to(root, { yPercent: -100, duration: 1.05, ease: 'power4.inOut' }, '-=0.1');
    });
    return () => {
      alive = false;
      unsub();
      tween?.kill();
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (gone) return null;
  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
      aria-label="Salon turu yükleniyor"
    >
      <div className="pl-inner gutter flex w-full max-w-md flex-col items-center text-center">
        {/* Logo yükleme yüzdesiyle soldan sağa dolar */}
        <div className="relative w-[min(260px,62vw)]">
          <img
            src="./assets/brand/logo-sand.png"
            alt="KAYA HAIR Gentlemen's Grooming"
            width={802}
            height={403}
            className="block h-auto w-full opacity-[0.14]"
          />
          <img
            ref={fillRef}
            src="./assets/brand/logo-sand.png"
            alt=""
            aria-hidden="true"
            width={802}
            height={403}
            className="absolute inset-0 block h-auto w-full"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          />
        </div>
        <span className="relative mt-10 h-px w-40 overflow-hidden bg-ivory/10" aria-hidden="true">
          <span ref={barRef} className="absolute inset-0 origin-left bg-bronze" style={{ transform: 'scaleX(0)' }} />
        </span>
        <p className="micro mt-5 text-[10px] tabular-nums text-ivory/60">
          Salon hazırlanıyor · <span ref={numRef}>0</span>%
        </p>
      </div>
    </div>
  );
}
