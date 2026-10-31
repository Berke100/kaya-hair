import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Play, X } from 'lucide-react';
import { closeDialog, isDialogOpen, showDialog } from '../lib/dialog';
import { founder } from '../config/team';
import { founderVideos } from '../config/founder';
import { soundscape } from '../lib/soundscape';
import { prefersReducedMotion } from '../lib/motion';

type Video = (typeof founderVideos)[number];

/**
 * Kurucu: Abdurrahman Kaya. Portre, kısa biyografi ve kendi soru–cevap
 * videoları. Videolar bölüm ekrandayken sessiz döngüde oynar (altyazıları
 * videoya gömülü); tıklanınca tam ekranda baştan, sesli açılır.
 */
export default function FounderSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const previewRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState<Video | null>(null);
  const [reduce] = useState(() => prefersReducedMotion());

  // Önizlemeler: yalnızca ekrandayken ve hareket azaltma kapalıyken oynar
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        previewRefs.current.forEach((v) => {
          if (!v) return;
          if (e.isIntersecting && !isDialogOpen(dialogRef.current)) {
            if (v.preload === 'none') v.preload = 'auto';
            v.play().catch(() => {});
          } else v.pause();
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Tam ekran oynatıcı
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      playerRef.current?.pause();
      soundscape.duck(false);
      setOpen(null);
      if (!reduce) previewRefs.current.forEach((v) => v?.play().catch(() => {}));
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [reduce]);

  const watch = (v: Video) => {
    previewRefs.current.forEach((p) => p?.pause());
    // Oynatıcı aynı dokunuşun içinde oluşturulup başlatılır: iOS sesli
    // oynatmaya yalnızca kullanıcı hareketinin içinde izin verir.
    flushSync(() => setOpen(v));
    showDialog(dialogRef.current);
    soundscape.duck(true);
    const p = playerRef.current;
    if (!p) return;
    p.muted = false;
    p.play().catch(() => {
      p.muted = true;
      p.play().catch(() => {});
    });
  };

  return (
    <section
      ref={sectionRef}
      id="kurucu"
      aria-labelledby="kurucu-baslik"
      className="relative scroll-mt-16 overflow-hidden bg-ink"
    >
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(168,132,98,0.16),transparent)]"
        aria-hidden="true"
      />
      <div className="gutter relative mx-auto grid max-w-[1320px] gap-10 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14 md:py-28 lg:gap-20">
        {/* Portre */}
        <figure className="group relative aspect-[4/5] max-w-full self-start overflow-hidden bg-coal md:sticky md:top-28" data-reveal>
          <img
            src={founder.photo}
            alt={`${founder.name}, ${founder.role}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%] transition-transform duration-[1600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ivory/10" aria-hidden="true" />
          <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
            <span>
              <span className="micro block text-[9px] text-bronze">Kurucu · Baş stilist</span>
              <span className="editorial mt-1 block text-2xl text-ivory">{founder.name}</span>
            </span>
            <img
              src="./assets/brand/logo-sand.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-auto opacity-70"
              loading="lazy"
            />
          </figcaption>
        </figure>

        {/* Metin ve videolar */}
        <div className="min-w-0">
          <div data-reveal style={{ ['--d' as string]: 1 }}>
            <p className="micro flex items-center gap-4 text-bronze">
              <span className="h-px w-8 bg-bronze" aria-hidden="true" />
              Kurucumuz
            </p>
            <h2 id="kurucu-baslik" className="editorial mt-5 text-[clamp(2.6rem,5vw,4.6rem)] text-ivory">
              {founder.name}
            </h2>
            <div className="mt-6 flex max-w-[56ch] flex-col gap-4 text-[15px] leading-relaxed text-ivory/75 md:text-base">
              {founder.bio.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </div>

          <div className="mt-12" data-reveal style={{ ['--d' as string]: 2 }}>
            <div className="flex items-baseline justify-between gap-4 border-t border-ivory/10 pt-6">
              <h3 className="micro text-[10px] text-ivory/80">Ustadan cevaplar</h3>
              <span className="text-xs text-mute">Sesli izlemek için dokunun</span>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 md:gap-5">
              {founderVideos.map((v, i) => (
                <li key={v.src} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => watch(v)}
                    className="group relative block aspect-[9/16] w-full overflow-hidden bg-coal text-left"
                    aria-label={`${v.title} videosunu sesli izle`}
                  >
                    <video
                      ref={(el) => (previewRefs.current[i] = el)}
                      src={v.src}
                      poster={v.poster}
                      muted
                      loop
                      playsInline
                      preload="none"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/30" aria-hidden="true" />
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-ink/60 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-ivory/80 md:backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bronze" aria-hidden="true" /> 0:55
                    </span>
                    <span
                      className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/40 bg-ink/50 text-ivory md:bg-ink/40 md:backdrop-blur-md transition-[transform,background-color,border-color] duration-500 group-hover:scale-110 group-hover:border-bronze group-hover:bg-bronze/80 md:h-16 md:w-16"
                      aria-hidden="true"
                    >
                      <Play size={20} strokeWidth={1.5} className="translate-x-0.5" fill="currentColor" />
                    </span>
                    <span className="absolute inset-x-3 bottom-3 md:inset-x-4 md:bottom-4">
                      <span className="editorial block text-lg leading-tight text-ivory md:text-2xl">{v.title}</span>
                      <span className="mt-2 hidden flex-col gap-1 text-xs text-ivory/65 md:flex">
                        {v.topics.map((t) => (
                          <span key={t}>— {t}</span>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={open ? `${open.title} — video` : 'Video'}
        className="m-0 h-full max-h-none w-full max-w-none bg-ink/95 p-0 text-ivory backdrop:bg-ink/85"
        onClick={(e) => e.target === e.currentTarget && closeDialog(dialogRef.current)}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4 px-4 pb-[max(16px,env(safe-area-inset-bottom,0px))] pt-[max(16px,env(safe-area-inset-top,0px))]">
          <div className="flex w-full max-w-[min(440px,calc((100svh-120px)*9/16))] items-center justify-between gap-4">
            <p className="micro truncate text-[10px] text-ivory/70">{open?.title}</p>
            <button
              type="button"
              onClick={() => closeDialog(dialogRef.current)}
              className="grid h-11 w-11 shrink-0 place-items-center"
              aria-label="Videoyu kapat"
              autoFocus
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          {open && (
            <video
              ref={playerRef}
              key={open.src}
              src={open.src}
              poster={open.poster}
              controls
              playsInline
              onEnded={() => soundscape.duck(false)}
              className="aspect-[9/16] max-h-[calc(100svh-120px)] w-auto max-w-full bg-coal"
            />
          )}
        </div>
      </dialog>
    </section>
  );
}
