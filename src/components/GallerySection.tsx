import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { closeDialog, showDialog } from '../lib/dialog';
import { photos } from '../config/assets';
import { galleryCategories, gallerySlideMs } from '../config/gallery';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Galeri: tek ekranlık, kendi kendine akan bir sahne.
 * Kategoriler sırayla oynar; her fotoğraf yavaşça yakınlaşır, üstteki
 * çubuklar ilerlemeyi gösterir. Fareyle üzerine gelince, sekme gizliyken
 * ya da galeri ekranda değilken durur. Tıklayınca tam ekran açılır.
 */
export default function GallerySection() {
  const slides = useMemo(
    () => galleryCategories.flatMap((c, ci) => c.items.map((item, ii) => ({ ...item, ci, ii }))),
    [],
  );
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [reduce] = useState(() => prefersReducedMotion());
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const current = slides[idx];
  const cat = galleryCategories[current.ci];
  const paused = hover || !inView || lightbox || reduce;

  const go = useCallback(
    (next: number) => {
      const n = (next + slides.length) % slides.length;
      if (n === idx) return;
      setPrev(idx);
      setIdx(n);
    },
    [idx, slides.length],
  );
  const step = useCallback((d: number) => go(idx + d), [go, idx]);

  const firstOf = (ci: number) => slides.findIndex((s) => s.ci === ci);

  // Ekranda mı?
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVis = () => setInView((v) => (document.hidden ? false : v));
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Hafif paralaks (yalnızca fare)
  useEffect(() => {
    const el = stageRef.current;
    if (!el || reduce || !window.matchMedia('(pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    const leave = () => {
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [reduce]);

  // Tam ekran
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setLightbox(false);
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);
  const openLightbox = () => {
    setLightbox(true);
    showDialog(dialogRef.current);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  };
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const catSlides = slides.filter((s) => s.ci === current.ci);

  return (
    <section
      ref={sectionRef}
      id="galeri"
      aria-labelledby="galeri-baslik"
      className="warm-band scroll-mt-16"
    >
      <div className="gutter mx-auto grid max-w-[1440px] gap-8 py-20 md:py-28 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-14">
        {/* Kategoriler */}
        <div className="flex min-w-0 flex-col" data-reveal>
          <p className="micro flex items-center gap-4 text-bronze">
            <span className="h-px w-8 bg-bronze" aria-hidden="true" />
            Galeri
          </p>
          <h2 id="galeri-baslik" className="editorial mt-5 text-[clamp(2.2rem,3.6vw,3.4rem)] text-ivory">
            Salonu gezin.
          </h2>

          <div
            role="tablist"
            aria-label="Galeri kategorileri"
            className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:mt-10 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {galleryCategories.map((c, ci) => {
              const active = ci === current.ci;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="galeri-sahne"
                  onClick={() => go(firstOf(ci))}
                  className={`group flex shrink-0 items-baseline justify-between gap-4 whitespace-nowrap border px-4 py-2.5 text-left transition-colors duration-300 lg:border-0 lg:border-b lg:border-ivory/10 lg:px-0 lg:py-4 ${
                    active ? 'border-bronze text-ivory' : 'border-ivory/15 text-ivory/50 hover:text-ivory'
                  }`}
                >
                  <span className="flex items-center gap-3 font-display text-[15px] lg:text-lg">
                    <span
                      className={`hidden h-px bg-bronze transition-[width] duration-500 lg:block ${active ? 'w-6' : 'w-0'}`}
                      aria-hidden="true"
                    />
                    {c.name}
                  </span>
                  <span className="text-xs tabular-nums text-mute">{String(c.items.length).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-6 hidden text-sm leading-relaxed text-mute lg:block" aria-live="polite">
            {cat.line}
          </p>
        </div>

        {/* Sahne */}
        <div
          id="galeri-sahne"
          ref={stageRef}
          role="region"
          aria-roledescription="otomatik akan galeri"
          aria-label={`${cat.name}: ${current.caption}`}
          tabIndex={0}
          data-paused={paused}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          onKeyDown={onKey}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative h-[min(72svh,620px)] min-h-[380px] overflow-hidden bg-coal outline-offset-4 [--px:0] [--py:0] lg:h-[min(78svh,700px)]"
          data-reveal
          style={{ ['--d' as string]: 1 }}
        >
          <div
            className="absolute -inset-4 transition-transform duration-700 ease-out"
            style={{ transform: 'translate3d(calc(var(--px) * -14px), calc(var(--py) * -10px), 0)' }}
          >
            {prev !== null && prev !== idx && (
              <img
                key={`prev-${prev}`}
                src={photos[slides[prev].photo].src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full slide-out object-cover"
                style={{ objectPosition: slides[prev].focus }}
                onAnimationEnd={() => setPrev(null)}
              />
            )}
            <div key={`cur-${idx}`} className={`absolute inset-0 ${reduce ? '' : 'kb'}`}>
              <img
                src={photos[current.photo].src}
                alt={photos[current.photo].alt}
                className={`absolute inset-0 h-full w-full object-cover ${reduce ? 'slide-in-static' : 'slide-in'}`}
                style={{ objectPosition: current.focus }}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/40" aria-hidden="true" />

          {/* İlerleme çubukları */}
          <div className="absolute inset-x-4 top-4 flex gap-1.5 md:inset-x-6 md:top-6" aria-hidden="true">
            {catSlides.map((s) => {
              const state = s.ii < current.ii ? 'done' : s.ii === current.ii ? 'now' : 'todo';
              return (
                <span key={s.ii} className="relative h-[2px] flex-1 overflow-hidden bg-ivory/20">
                  {state === 'done' && <span className="absolute inset-0 bg-ivory" />}
                  {state === 'now' &&
                    (reduce ? (
                      <span className="absolute inset-0 bg-ivory" />
                    ) : (
                      <span
                        key={`bar-${idx}`}
                        className="slide-progress absolute inset-0 bg-ivory"
                        style={{ animationDuration: `${gallerySlideMs}ms` }}
                        onAnimationEnd={() => step(1)}
                      />
                    ))}
                </span>
              );
            })}
          </div>

          {/* Alt bilgi ve kontroller */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 md:inset-x-6 md:bottom-6">
            <div className="min-w-0">
              <p className="micro text-[10px] text-bronze">{cat.name}</p>
              <p key={`cap-${idx}`} className="editorial mt-2 caption-in text-[clamp(1.5rem,2.6vw,2.2rem)] text-ivory">
                {current.caption}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button type="button" onClick={() => step(-1)} className="grid h-11 w-11 place-items-center border border-ivory/25 bg-ink/60 text-ivory md:bg-ink/40 md:backdrop-blur-sm transition-colors hover:border-bronze" aria-label="Önceki fotoğraf">
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => step(1)} className="grid h-11 w-11 place-items-center border border-ivory/25 bg-ink/60 text-ivory md:bg-ink/40 md:backdrop-blur-sm transition-colors hover:border-bronze" aria-label="Sonraki fotoğraf">
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={openLightbox} className="grid h-11 w-11 place-items-center border border-ivory/25 bg-ink/60 text-ivory md:bg-ink/40 md:backdrop-blur-sm transition-colors hover:border-bronze" aria-label="Tam ekran görüntüle">
                <Expand size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Fotoğraf görüntüleyici"
        className="m-0 h-full max-h-none w-full max-w-none bg-ink/95 p-0 text-ivory backdrop:bg-ink/80"
        onClick={(e) => e.target === e.currentTarget && closeDialog(dialogRef.current)}
        onKeyDown={onKey}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {lightbox && (
          <div className="gutter flex h-full flex-col pb-[max(16px,env(safe-area-inset-bottom,0px))] pt-[max(16px,env(safe-area-inset-top,0px))]">
            <div className="flex items-center justify-between py-2">
              <p className="micro text-[10px] tabular-nums text-ivory/60">
                {cat.name} · {String(current.ii + 1).padStart(2, '0')} / {String(catSlides.length).padStart(2, '0')}
              </p>
              <button type="button" onClick={() => closeDialog(dialogRef.current)} className="grid h-11 w-11 place-items-center" aria-label="Kapat" autoFocus>
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <img key={current.photo} src={photos[current.photo].src} alt={photos[current.photo].alt} className="min-h-0 max-w-full flex-1 object-contain" />
              <figcaption className="text-sm text-ivory/75">{current.caption}</figcaption>
            </figure>
            <div className="flex items-center justify-center gap-3 py-3">
              <button type="button" onClick={() => step(-1)} className="btn btn-ghost min-h-[44px] px-4" aria-label="Önceki fotoğraf">
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => step(1)} className="btn btn-ghost min-h-[44px] px-4" aria-label="Sonraki fotoğraf">
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
