import { useEffect, useRef, useState } from 'react';
import { photos } from '../config/assets';
import { visitAutoMs, visitIntro, visitSteps, type VisitStep } from '../config/about';
import { prefersReducedMotion } from '../lib/motion';
import { soundscape } from '../lib/soundscape';

const photoOf = (s: VisitStep) => (typeof s.photo === 'string' ? photos[s.photo] : s.photo);

/**
 * Hakkımızda: solda tek bir fotoğraf çerçevesi, sağda üç satırlık liste.
 * Seçilen satır açılır ve fotoğraf ona geçer. Bölüm ekrandayken adımlar
 * kendiliğinden ilerler; ziyaretçi bir satıra dokunursa otomatik akış durur.
 */
export default function VisitSection() {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduce] = useState(() => prefersReducedMotion());
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (manual || !inView || reduce) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % visitSteps.length), visitAutoMs);
    return () => window.clearTimeout(id);
  }, [active, manual, inView, reduce]);

  // İkram adımı açılınca kahve makinesi sesi (ses açıksa)
  useEffect(() => {
    if (inView && visitSteps[active]?.id === 'ikram') soundscape.coffee();
  }, [active, inView]);

  const choose = (i: number) => {
    setManual(true);
    setActive(i);
  };

  return (
    <section
      ref={ref}
      id="hakkimizda"
      aria-labelledby="hakkimizda-baslik"
      className="scroll-mt-16 border-t border-ivory/10 bg-ink"
    >
      <div className="gutter mx-auto grid max-w-[1200px] items-center gap-10 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-14 md:py-28 lg:gap-20">
        {/* Fotoğraf çerçevesi */}
        <div
          className="relative aspect-[4/3] max-w-full overflow-hidden bg-coal md:aspect-[4/5] md:max-h-[540px]"
          data-reveal
        >
          {visitSteps.map((s, i) => {
            const p = photoOf(s);
            const on = i === active;
            return (
              <img
                key={s.id}
                src={p.src}
                alt={on ? p.alt : ''}
                aria-hidden={!on}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: s.focus }}
                className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                  on ? 'scale-100 opacity-100' : 'scale-[1.05] opacity-0'
                }`}
              />
            );
          })}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ivory/10" aria-hidden="true" />
          <span className="absolute bottom-4 left-4 bg-ink/70 px-3 py-1.5 font-display text-[11px] tabular-nums tracking-[0.2em] text-ivory md:backdrop-blur-sm">
            {String(active + 1).padStart(2, '0')} <span className="text-mute">/ {String(visitSteps.length).padStart(2, '0')}</span>
          </span>
        </div>

        {/* Metin */}
        <div className="min-w-0" data-reveal style={{ ['--d' as string]: 1 }}>
          <p className="micro flex items-center gap-4 text-bronze">
            <span className="h-px w-8 bg-bronze" aria-hidden="true" />
            {visitIntro.label}
          </p>
          <h2 id="hakkimizda-baslik" className="editorial mt-5 max-w-[18ch] text-[clamp(2.1rem,3.6vw,3.2rem)] text-ivory">
            {visitIntro.title}
          </h2>

          <ol className="mt-10 border-t border-ivory/10">
            {visitSteps.map((s, i) => {
              const on = i === active;
              const panelId = `ziyaret-${s.id}`;
              return (
                <li key={s.id} className="relative border-b border-ivory/10">
                  {/* İlerleme çizgisi */}
                  <span className="absolute inset-x-0 -top-px h-px overflow-hidden" aria-hidden="true">
                    {on && (
                      <span
                        key={`${active}-${manual}`}
                        className={`absolute inset-0 origin-left bg-bronze ${manual || reduce ? '' : 'slide-progress'}`}
                        style={manual || reduce ? undefined : { animationDuration: `${visitAutoMs}ms` }}
                      />
                    )}
                  </span>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={on}
                      aria-controls={panelId}
                      onClick={() => choose(i)}
                      className="group flex w-full items-baseline gap-5 py-5 text-left"
                    >
                      <span className={`font-display text-xs tabular-nums transition-colors ${on ? 'text-bronze' : 'text-mute'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                        <span
                          className={`font-display text-lg font-medium transition-colors md:text-xl ${
                            on ? 'text-ivory' : 'text-ivory/55 group-hover:text-ivory'
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="micro text-[9px] text-mute">{s.label}</span>
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-label={s.title}
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                      on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`max-w-[52ch] pb-6 pl-[2.6rem] text-[15px] leading-relaxed text-ivory/75 transition-opacity duration-500 ${
                          on ? 'opacity-100 delay-150' : 'opacity-0'
                        }`}
                      >
                        {s.text}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
