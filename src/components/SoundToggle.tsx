import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundscape } from '../lib/soundscape';
import { walkthrough } from '../lib/walkthrough';

/** Kapıdan geçiş anı (tur ilerlemesi). Video ve fotoğraf turunda ~%20. */
const DOOR_AT = 0.2;

/**
 * Sesli turu bağlar: kaydırma → ses karışımı, butonlar → imleç vızıltısı.
 * Arayüzü olmayan tek seferlik bağlayıcı; App içinde bir kez kullanılır.
 */
export function SoundBridge() {
  useEffect(() => {
    let p = 0;
    let raf = 0;
    const update = () => {
      raf = 0;
      const walk = document.getElementById('deneyim');
      const inTour = walk ? walk.getBoundingClientRect().bottom > window.innerHeight * 0.5 : false;
      soundscape.setPosition(p, inTour, DOOR_AT);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const unsub = walkthrough.subscribe((v) => {
      p = v;
      queue();
    });
    window.addEventListener('scroll', queue, { passive: true });

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest('a, button, [role="tab"]');
      const from = (e.relatedTarget as Element | null)?.closest('a, button, [role="tab"]');
      if (el && el !== from) soundscape.hoverBuzz();
    };
    document.addEventListener('pointerover', onOver);
    return () => {
      unsub();
      window.removeEventListener('scroll', queue);
      document.removeEventListener('pointerover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

export function useSound() {
  const [on, setOn] = useState(soundscape.enabled);
  useEffect(() => soundscape.subscribe(setOn), []);
  return { on, supported: soundscape.supported, toggle: () => soundscape.toggle() };
}

/** Menüdeki ses düğmesi. */
export default function SoundToggle() {
  const { on, supported, toggle } = useSound();
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Salon seslerini kapat' : 'Salonu dinle: salon seslerini aç'}
      className="group flex h-10 items-center gap-2.5 px-2 text-ivory/75 transition-colors hover:text-ivory"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-full border border-ivory/20 transition-colors group-hover:border-bronze group-aria-pressed:border-bronze">
        {on ? <Volume2 size={15} strokeWidth={1.5} aria-hidden="true" /> : <VolumeX size={15} strokeWidth={1.5} aria-hidden="true" />}
        {on && <span className="absolute inset-0 animate-ping rounded-full border border-bronze/50 [animation-duration:2.4s]" aria-hidden="true" />}
      </span>
      <span className="micro hidden text-[10px] xl:inline">{on ? 'Ses açık' : 'Salonu dinle'}</span>
    </button>
  );
}
