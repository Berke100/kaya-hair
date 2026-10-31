import { useEffect, useRef } from 'react';
import { chapters as photoChapters, videoChapters } from '../config/scenes';
import type { WalkMode } from './WalkthroughExperience';
import { smoothstep } from '../lib/motion';
import { walkthrough } from '../lib/walkthrough';

/**
 * Bölüm göstergesi + ilerleme çizgisi + "Kaydırarak keşfet" ipucu.
 * Etkin bölüm kaydırmayla otomatik güncellenir; her bölüme tıklanabilir.
 */
export default function ScrollProgress({ mode }: { mode: WalkMode }) {
  const chapters = mode === 'video' ? videoChapters : photoChapters;
  const fillRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const mobileLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let active = -1;
    return walkthrough.subscribe((p) => {
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (hintRef.current) {
        const o = 1 - smoothstep(0.005, 0.035, p);
        hintRef.current.style.opacity = o.toFixed(3);
        hintRef.current.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      }
      const idx = chapters.findIndex((c) => p >= c.start && p < c.end);
      if (idx !== active && idx >= 0) {
        active = idx;
        navRef.current?.querySelectorAll('button').forEach((b, i) => {
          b.setAttribute('aria-current', i === idx ? 'step' : 'false');
        });
        if (mobileLabelRef.current) mobileLabelRef.current.textContent = chapters[idx].label;
      }
    });
  }, [chapters]);

  return (
    <>
      {/* Masaüstü: sağ kenarda bölüm listesi */}
      <nav
        ref={navRef}
        aria-label="Tur bölümleri"
        className="absolute right-[max(28px,env(safe-area-inset-right,0px))] top-1/2 hidden -translate-y-1/2 lg:block xl:right-[max(48px,env(safe-area-inset-right,0px))]"
      >
        <div className="relative flex gap-5">
          <span className="relative w-px bg-ivory/15" aria-hidden="true">
            <span ref={fillRef} className="absolute inset-0 origin-top bg-bronze" style={{ transform: 'scaleY(0)' }} />
          </span>
          <ol className="flex flex-col gap-5">
            {chapters.map((c, i) => (
              <li key={c.label}>
                <button
                  type="button"
                  onClick={() => walkthrough.scrollTo(c.jump)}
                  aria-current={i === 0 ? 'step' : 'false'}
                  className="micro text-left text-[10px] text-ivory/40 transition-colors duration-500 hover:text-ivory aria-[current=step]:text-ivory"
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Mobil / tablet: alt kenarda ince ilerleme çubuğu */}
      <div className="gutter absolute inset-x-0 bottom-0 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] lg:hidden">
        <div className="flex items-center gap-4">
          <span ref={mobileLabelRef} className="micro shrink-0 text-[10px] text-ivory/70">
            {chapters[0].label}
          </span>
          <span className="relative h-px flex-1 bg-ivory/15" aria-hidden="true">
            <span ref={barRef} className="absolute inset-0 origin-left bg-bronze" style={{ transform: 'scaleX(0)' }} />
          </span>
        </div>
      </div>

      {/* Kaydırma ipucu */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] right-[max(20px,env(safe-area-inset-right,0px))] flex flex-col items-center gap-3 md:bottom-12 md:left-1/2 md:right-auto md:-translate-x-1/2 lg:bottom-14"
      >
        <span className="micro text-[10px] text-ivory/70">Kaydırarak keşfet</span>
        <span className="relative hidden h-10 w-px overflow-hidden bg-ivory/15 md:block" aria-hidden="true">
          <span className="hint-line absolute inset-0 bg-ivory/80" />
        </span>
      </div>
    </>
  );
}
