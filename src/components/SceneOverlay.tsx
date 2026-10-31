import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Instagram, MapPin } from 'lucide-react';
import { sceneCopy, videoTimeline } from '../config/scenes';
import { links, bookingTarget } from '../config/site';
import { prefersReducedMotion, smoothstep, textWindow } from '../lib/motion';
import { walkthrough } from '../lib/walkthrough';
import { loader } from '../lib/loader';
import HeroExperience from './HeroExperience';
import type { WalkMode } from './WalkthroughExperience';

type SceneKey = 'arrival' | 'transition' | 'lounge' | 'craft' | 'details' | 'final';

/** Açılış animasyonu bir kez oynar; mod değişiminde tekrar etmez. */
let introPlayed = false;

/**
 * Sahne metinleri. Her `.scene` öğesi `data-range` aralığında görünür;
 * opaklık ve hafif dikey kayma kaydırmaya bağlıdır. Aralıklar fotoğraf
 * ve video modunda ayrı ayrı tanımlıdır (config/scenes.ts).
 */
export default function SceneOverlay({ mode }: { mode: WalkMode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const rangeOf = (key: SceneKey): [number, number] | null =>
    mode === 'video' ? videoTimeline[key] : sceneCopy[key].range;
  const serviceAts =
    mode === 'video' ? videoTimeline.services : sceneCopy.craft.services.map(([at]) => at);

  // Etiketli sahneleri görünme sırasına göre numarala: "01 / BEKLEME ALANI"
  const labelled = (['lounge', 'craft', 'details'] as const).filter((k) => rangeOf(k));
  const labelOf = (key: 'lounge' | 'craft' | 'details') =>
    `${String(labelled.indexOf(key) + 1).padStart(2, '0')} / ${sceneCopy[key].label.replace(/^\d+\s*\/\s*/, '')}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = prefersReducedMotion();
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-range]')).map((el) => ({
      el,
      range: el.dataset.range!.split(',').map(Number) as [number, number],
    }));
    const tags = Array.from(root.querySelectorAll<HTMLElement>('[data-at]')).map((el) => ({
      el,
      at: Number(el.dataset.at),
    }));
    const craftEnd = (mode === 'video' ? videoTimeline.craft : sceneCopy.craft.range)?.[1] ?? 1;

    const apply = (p: number) => {
      for (const { el, range } of scenes) {
        const o = textWindow(p, range);
        const visible = o > 0.01;
        el.style.visibility = visible ? 'visible' : 'hidden';
        if (!visible) continue;
        el.style.opacity = o.toFixed(3);
        // Girerken aşağıdan gelir, çıkarken yukarı süzülür.
        const mid = (range[0] + Math.min(range[1], 1)) / 2;
        const dir = p < mid ? 1 : -1;
        el.style.transform = reduce ? 'none' : `translate3d(0, ${(dir * (1 - o) * 28).toFixed(1)}px, 0)`;
      }
      for (const { el, at } of tags) {
        const o = Math.min(smoothstep(at, at + 0.018, p), 1 - smoothstep(craftEnd - 0.02, craftEnd, p));
        el.style.opacity = o.toFixed(3);
        el.style.transform = reduce ? 'none' : `translate3d(${((1 - o) * 18).toFixed(1)}px, 0, 0)`;
      }
    };
    const unsub = walkthrough.subscribe(apply);

    // Açılış metinleri yükleme ekranı kalkarken sırayla belirir.
    let intro: gsap.core.Timeline | null = null;
    let alive = true;
    if (!reduce && !introPlayed) {
      const items = root.querySelectorAll('.intro-item');
      gsap.set(items, { y: 26, opacity: 0 });
      loader.ready.then(() => {
        if (!alive) return;
        introPlayed = true;
        intro = gsap.timeline({ delay: 1.2 });
        intro.to(items, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.11 });
      });
    }
    return () => {
      alive = false;
      unsub();
      if (intro) {
        intro.progress(1);
        intro.kill();
      }
    };
  }, [mode]);

  const { transition, lounge, craft, details, final } = sceneCopy;
  const r = {
    transition: rangeOf('transition'),
    lounge: rangeOf('lounge'),
    craft: rangeOf('craft'),
    details: rangeOf('details'),
    final: rangeOf('final'),
  };

  return (
    <div ref={rootRef} className="absolute inset-0">
      <HeroExperience range={rangeOf('arrival') ?? [-1, 0.13]} />

      {/* Geçiş */}
      {r.transition && (
        <div
          className="scene gutter absolute inset-0 flex items-center justify-center text-center"
          data-range={r.transition.join(',')}
          style={{ visibility: 'hidden' }}
        >
          <div className="max-w-[36rem] md:max-w-[52rem]">
            <h2 className="editorial text-[clamp(2.4rem,6.4vw,5.6rem)] text-ivory">{transition.headline}</h2>
            <p className="mx-auto mt-6 max-w-[34ch] text-[15px] leading-relaxed text-ivory/75 md:text-base">
              {transition.text}
            </p>
          </div>
        </div>
      )}

      {/* Bekleme alanı */}
      {r.lounge && (
        <div
          className="scene gutter absolute inset-0 flex items-end pb-[calc(env(safe-area-inset-bottom,0px)+108px)] md:items-center md:pb-0"
          data-range={r.lounge.join(',')}
          style={{ visibility: 'hidden' }}
        >
          <SceneText label={labelOf('lounge')} headline={lounge.headline} text={lounge.text} />
        </div>
      )}

      {/* Ustalık */}
      {r.craft && (
        <div
          className="scene gutter absolute inset-0 flex flex-col justify-end gap-10 pb-[calc(env(safe-area-inset-bottom,0px)+108px)] md:flex-row md:items-end md:justify-between md:pb-24"
          data-range={r.craft.join(',')}
          style={{ visibility: 'hidden' }}
        >
          <SceneText label={labelOf('craft')} headline={craft.headline} text={craft.text} />
          <ul className="flex flex-wrap gap-x-5 gap-y-2 md:mr-28 md:flex-col md:gap-4" aria-label="Hizmetler">
            {craft.services.map(([, name], i) => (
              <li
                key={name}
                data-at={serviceAts[i] ?? serviceAts[serviceAts.length - 1]}
                className="flex items-center gap-3 font-display text-sm font-medium uppercase tracking-[0.2em] text-ivory md:text-[15px]"
                style={{ opacity: 0 }}
              >
                <span className="h-px w-5 bg-bronze md:w-10" aria-hidden="true" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detaylar */}
      {r.details && (
        <div
          className="scene gutter absolute inset-0 flex items-end pb-[calc(env(safe-area-inset-bottom,0px)+108px)] md:pb-24"
          data-range={r.details.join(',')}
          style={{ visibility: 'hidden' }}
        >
          <SceneText label={labelOf('details')} headline={details.headline} text={details.text} />
        </div>
      )}

      {/* Final */}
      {r.final && (
        <div
          className="scene gutter absolute inset-0 flex items-center justify-center text-center"
          data-range={r.final.join(',')}
          style={{ visibility: 'hidden' }}
        >
          <div className="flex flex-col items-center">
            <p className="font-display text-[13px] font-medium tracking-[0.5em] text-ivory/80 md:text-sm">KAYA HAIR</p>
            <span className="mt-5 h-10 w-px bg-bronze" aria-hidden="true" />
            <h2 className="editorial mt-6 max-w-[16ch] text-[clamp(2.6rem,7vw,6.4rem)] text-ivory">{final.headline}</h2>
            <p className="mt-5 text-[15px] text-ivory/75 md:text-base">{final.text}</p>
            <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <a {...bookingTarget} className="btn btn-primary">
                Hemen randevu al <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </a>
              {links.instagram ? (
                <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Instagram size={16} strokeWidth={1.5} aria-hidden="true" /> Instagram'da keşfet
                </a>
              ) : links.maps ? (
                // Instagram eklenene kadar ikinci buton yol tarifine gider.
                <a href={links.maps} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <MapPin size={16} strokeWidth={1.5} aria-hidden="true" /> Yol tarifi al
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SceneText({ label, headline, text }: { label: string; headline: string; text: string }) {
  return (
    <div className="max-w-xl">
      <p className="micro flex items-center gap-4 text-bronze">
        <span className="h-px w-8 bg-bronze" aria-hidden="true" />
        {label}
      </p>
      <h2 className="editorial mt-5 text-[clamp(2.4rem,5.6vw,5rem)] text-ivory">{headline}</h2>
      <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-ivory/75 md:text-base">{text}</p>
    </div>
  );
}
