import type { CameraKey } from '../config/scenes';

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hermite eğrisi: 0..1 arası yumuşak geçiş */
export const smoothstep = (a: number, b: number, v: number) => {
  if (a === b) return v >= b ? 1 : 0;
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Dört noktalı görünürlük penceresi: giriş → tam görünür → çıkış */
export const fadeWindow = (p: number, [a, b, c, d]: [number, number, number, number]) =>
  Math.min(smoothstep(a, b, p), 1 - smoothstep(c, d, p));

/** Metin katmanları için: aralığın ilk ve son %18'inde yumuşak giriş/çıkış */
export const textWindow = (p: number, [start, end]: [number, number]) => {
  const span = Math.min(end, 1) - Math.max(start, 0);
  const f = Math.max(0.018, span * 0.18);
  return fadeWindow(p, [start, start + f, end - f, end]);
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Kamera anahtar kareleri arasında yumuşak interpolasyon */
export function sampleCamera(keys: CameraKey[], p: number): Omit<CameraKey, 'at'> {
  if (p <= keys[0].at) return keys[0];
  const last = keys[keys.length - 1];
  if (p >= last.at) return last;
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    if (p >= k0.at && p <= k1.at) {
      const t = easeInOut((p - k0.at) / (k1.at - k0.at));
      return { fx: lerp(k0.fx, k1.fx, t), fy: lerp(k0.fy, k1.fy, t), zoom: lerp(k0.zoom, k1.zoom, t) };
    }
  }
  return last;
}

/** Fotoğrafın ekranı kaplayacağı temel boyut (object-fit: cover eşdeğeri) */
export function coverSize(imgW: number, imgH: number, vw: number, vh: number) {
  const s = Math.max(vw / imgW, vh / imgH);
  return { w: imgW * s, h: imgH * s };
}

/**
 * Odak noktasını ekran ortasına getiren, kenarları asla açığa çıkarmayan
 * dönüşüm. transform-origin: 0 0 varsayılır.
 */
export function cameraTransform(
  cover: { w: number; h: number },
  vw: number,
  vh: number,
  cam: { fx: number; fy: number; zoom: number },
) {
  const z = Math.max(1, cam.zoom);
  const w = cover.w * z;
  const h = cover.h * z;
  const x = clamp(vw / 2 - cam.fx * w, vw - w, 0);
  const y = clamp(vh / 2 - cam.fy * h, vh - h, 0);
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${z.toFixed(4)})`;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCompactViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
