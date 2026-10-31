import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { team, initials } from '../config/team';
import { prefersReducedMotion } from '../lib/motion';

/** Kurucu kendi bölümünde tanıtıldığı için şeritte kadronun geri kalanı yer alır. */
const people = team.map((m) => ({ name: m.name, role: m.role, photo: m.photo, note: '' }));

const DUR = 4800;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Profesyonel kadro: hikâye tarzı 3B şerit.
 * Ortadaki kart öne çıkar, yandakiler perspektifle geriye döner; arkada
 * aktif fotoğrafın bulanık yansıması durur. Ekrandayken kendiliğinden
 * ilerler; fareyle üzerine gelince, sekme gizliyken ya da durdurulunca bekler.
 * Ok tuşları, oklar, parmakla ya da fareyle sürükleme ile gezilir.
 */
export default function TeamSection() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hoverPause, setHoverPause] = useState(false);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 760);
  const [amb, setAmb] = useState<[string, string]>([people[0].photo, people[0].photo]);
  const [ambOn, setAmbOn] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const inView = useRef(false);
  const prog = useRef(0);
  const t0 = useRef(0);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const n = people.length;
  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);
  const active = playing && !hoverPause;

  // Arka plan yansıması: iki katman arasında yumuşak geçiş
  useEffect(() => {
    setAmb((a) => {
      const next: [string, string] = [...a] as [string, string];
      next[ambOn ^ 1] = people[idx].photo;
      return next;
    });
    setAmbOn((o) => o ^ 1);
    prog.current = 0;
    t0.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // İlerleme ve otomatik geçiş
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (active && inView.current && !document.hidden) {
        prog.current = Math.min(1, (now - t0.current) / DUR);
        if (prog.current >= 1) {
          setIdx((i) => (i + 1) % n);
          return;
        }
      } else {
        t0.current = now - prog.current * DUR;
      }
      const bar = barRefs.current[idx];
      if (bar) bar.style.transform = `scaleX(${prog.current.toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };
    t0.current = performance.now() - prog.current * DUR;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, idx, n]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onResize = () => setMobile(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(idx + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(idx - 1);
    }
  };

  const current = people[idx];

  return (
    <section id="ekip" aria-labelledby="ekip-baslik" className="relative scroll-mt-16 overflow-hidden bg-ink">
      {/* Arka plan yansıması */}
      <div
        className="pointer-events-none absolute inset-x-[-10%] bottom-0 top-[-10%] z-0 hidden md:block [mask-image:radial-gradient(55%_50%_at_50%_58%,#000_30%,transparent_75%)]"
        aria-hidden="true"
      >
        {amb.map((src, i) => (
          <i
            key={i}
            className="absolute inset-0 scale-[1.2] bg-cover bg-center blur-[70px] saturate-[1.3] transition-opacity duration-[1600ms]"
            style={{ backgroundImage: `url(${src})`, opacity: i === ambOn ? 0.28 : 0 }}
          />
        ))}
      </div>

      <div className="gutter relative z-[1] mx-auto max-w-[1440px] pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="micro flex items-center gap-4 text-bronze">
              <span className="h-px w-8 bg-bronze" aria-hidden="true" />
              Profesyonel kadro
            </p>
            <h2 id="ekip-baslik" className="editorial mt-5 text-[clamp(2.4rem,4.6vw,4.2rem)] text-ivory">
              Ekibimiz
            </h2>
          </div>
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-mute">
            Saç tasarım uzmanlarımız ve asistanlarımız, her koltukta aynı özenle.
          </p>
        </div>

        {/* 3B şerit */}
        <div
          ref={rootRef}
          role="region"
          aria-roledescription="kaydırmalı ekip şeridi"
          aria-label={`${current.name}, ${current.role}`}
          tabIndex={0}
          onKeyDown={onKey}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverPause(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHoverPause(false)}
          onPointerDown={(e) => (drag.current = { x: e.clientX, y: e.clientY, moved: false })}
          onPointerMove={(e) => {
            if (drag.current && Math.abs(e.clientX - drag.current.x) > 10) drag.current.moved = true;
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1));
            setTimeout(() => (drag.current = null), 0);
          }}
          className="relative mt-12 touch-pan-y select-none outline-offset-8 [--cw:calc(var(--gh)*0.66)] [--gh:min(64vh,560px)] [perspective:1600px] max-md:[--cw:min(66vw,calc(var(--gh)*0.66))] max-md:[--gh:min(58vh,470px)] md:mt-14"
          style={{ height: 'var(--gh)' }}
          data-reveal
        >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {people.map((p, i) => {
              let o = i - idx;
              if (o > n / 2) o -= n;
              if (o < -n / 2) o += n;
              const a = Math.abs(o);
              const vis = a <= (mobile ? 2 : 3);
              const x = o * (mobile ? 80 : 68);
              const s = 1 - Math.min(a, 3) * 0.12;
              const ry = Math.max(-1, Math.min(1, o)) * -16;
              const on = a === 0;
              return (
                <article
                  key={p.name}
                  aria-hidden={!on}
                  onClick={() => {
                    if (drag.current?.moved) return;
                    if (!on) go(i);
                  }}
                  className="group absolute left-1/2 top-0 h-full cursor-pointer overflow-hidden bg-coal shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] transition-[transform,opacity,filter] duration-[800ms] ease-[cubic-bezier(0.2,0.75,0.2,1)] will-change-transform"
                  style={{
                    width: 'var(--cw)',
                    marginLeft: 'calc(var(--cw) / -2)',
                    transform: `translateX(${x}%) translateZ(${-a * 90}px) rotateY(${ry}deg) scale(${s})`,
                    opacity: vis ? (on ? 1 : a === 1 ? 0.8 : 0.45) : 0,
                    filter: on || mobile ? 'none' : `saturate(.6) brightness(${(1 - a * 0.1).toFixed(2)})`,
                    zIndex: 10 - a,
                    pointerEvents: vis ? undefined : 'none',
                  }}
                >
                  <Portrait src={p.photo} name={p.name} animate={on} />
                  <div
                    className={`absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/85 transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden="true"
                  />
                  {/* İlerleme çubuğu */}
                  <span
                    className={`absolute inset-x-4 top-4 h-[2px] overflow-hidden bg-ivory/25 transition-opacity duration-300 ${on ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden="true"
                  >
                    <i
                      ref={(el) => (barRefs.current[i] = el)}
                      className="absolute inset-0 origin-left bg-bronze"
                      style={{ transform: 'scaleX(0)' }}
                    />
                  </span>
                  <div
                    className={`absolute inset-x-4 bottom-5 transition-[opacity,transform] duration-500 md:inset-x-5 ${
                      on ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-2 opacity-0'
                    }`}
                  >
                    <p className="micro text-[9px] text-bronze">{p.role}</p>
                    <h3 className="editorial mt-1.5 text-[clamp(1.5rem,2.2vw,2rem)] leading-tight text-ivory">{p.name}</h3>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => go(idx - 1)}
            className="absolute left-[max(0px,calc(50%-var(--cw)*0.5-84px))] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-ink/60 text-ivory backdrop-blur-md transition-[transform,border-color] hover:scale-105 hover:border-bronze md:grid"
            aria-label="Önceki kişi"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(idx + 1)}
            className="absolute right-[max(0px,calc(50%-var(--cw)*0.5-84px))] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-ink/60 text-ivory backdrop-blur-md transition-[transform,border-color] hover:scale-105 hover:border-bronze md:grid"
            aria-label="Sonraki kişi"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Alt bilgi */}
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 text-center">
          {current.note && (
            <p key={current.name} className="caption-in max-w-[56ch] text-sm leading-relaxed text-ivory/70">
              {current.note}
            </p>
          )}
          <div className="flex items-center gap-4">
            <span className="font-display text-xs tabular-nums tracking-[0.12em] text-mute">
              {pad(idx + 1)} / {pad(n)}
            </span>
            <button
              type="button"
              onClick={() => {
                setHoverPause(false);
                setPlaying((v) => !v);
              }}
              className="grid h-10 w-10 place-items-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-bronze"
              aria-label={playing ? 'Otomatik geçişi durdur' : 'Otomatik geçişi başlat'}
            >
              {playing ? <Pause size={14} strokeWidth={1.8} /> : <Play size={14} strokeWidth={1.8} className="translate-x-px" />}
            </button>
            <div className="flex gap-1.5" aria-hidden="true">
              {people.map((p, i) => (
                <span
                  key={p.name}
                  className={`h-1 rounded-full transition-[width,background-color] duration-500 ${i === idx ? 'w-6 bg-bronze' : 'w-1 bg-ivory/25'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portrait({ src, name, animate }: { src: string; name: string; animate: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(80%_60%_at_50%_35%,rgba(168,132,98,0.22),transparent_70%)]">
        <span className="editorial text-5xl text-bronze/80">{initials(name)}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      draggable={false}
      decoding="async"
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full object-cover object-[50%_22%] ${animate ? 'kb' : ''}`}
    />
  );
}
