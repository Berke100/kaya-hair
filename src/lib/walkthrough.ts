/**
 * Yürüyüş ilerlemesi için küçük bir yayın kanalı.
 * Kaydırma sırasında React yeniden çizim yapmaz; bileşenler buraya
 * abone olup DOM'u doğrudan günceller.
 */

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let current = 0;
let sectionEl: HTMLElement | null = null;

export const walkthrough = {
  get progress() {
    return current;
  },
  publish(p: number) {
    current = p;
    listeners.forEach((fn) => fn(p));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    fn(current);
    return () => {
      listeners.delete(fn);
    };
  },
  registerSection(el: HTMLElement | null) {
    sectionEl = el;
  },
  /** Yürüyüşte belirli bir ilerleme noktasına kaydırır. */
  scrollTo(p: number) {
    if (!sectionEl) return;
    const top = sectionEl.getBoundingClientRect().top + window.scrollY;
    const travel = sectionEl.offsetHeight - window.innerHeight;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: top + travel * p, behavior: reduce ? 'auto' : 'smooth' });
  },
};
