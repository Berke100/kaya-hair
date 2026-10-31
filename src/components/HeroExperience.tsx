import { bookingTarget } from '../config/site';
import { ArrowRight, Volume2 } from 'lucide-react';
import { useSound } from './SoundToggle';
import { sceneCopy } from '../config/scenes';
import { walkthrough } from '../lib/walkthrough';

/** SAHNE 01 — Varış. Dış cephe fotoğrafının üzerindeki açılış metni. */
export default function HeroExperience({ range }: { range: [number, number] }) {
  const c = sceneCopy.arrival;
  const sound = useSound();
  return (
    <div
      id="ana-sayfa"
      className="scene gutter absolute inset-0 flex items-end pb-[calc(env(safe-area-inset-bottom,0px)+104px)] md:pb-20"
      data-range={range.join(',')}
    >
      <div className="max-w-3xl">
        <p className="intro-item micro flex items-center gap-4 text-bronze">
          <span className="h-px w-8 bg-bronze" aria-hidden="true" />
          {c.tagline}
        </p>
        <h1 className="intro-item mt-5 font-display text-[clamp(2.6rem,8.4vw,7.2rem)] font-medium uppercase leading-[0.95] tracking-[0.12em] text-ivory">
          {c.title}
        </h1>
        <p className="intro-item editorial mt-5 text-[clamp(1.9rem,3.6vw,3.2rem)] text-ivory">{c.headline}</p>
        <p className="intro-item mt-4 max-w-[40ch] text-[15px] leading-relaxed text-ivory/75 md:text-base">{c.text}</p>
        <div className="intro-item mt-8 flex flex-col gap-3 sm:flex-row">
          <a {...bookingTarget} className="btn btn-primary">
            Randevu al <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => walkthrough.scrollTo(0.39)}>
            Mekânı keşfet
          </button>
        </div>
        {sound.supported && !sound.on && (
          <button
            type="button"
            onClick={sound.toggle}
            className="intro-item group mt-6 inline-flex items-center gap-3 text-[13px] text-ivory/70 transition-colors hover:text-ivory"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-ivory/25 transition-colors group-hover:border-bronze">
              <Volume2 size={14} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="link-line">Salonu sesiyle gezin</span>
            <span className="text-mute">· kulaklıkla daha iyi</span>
          </button>
        )}
      </div>
    </div>
  );
}
