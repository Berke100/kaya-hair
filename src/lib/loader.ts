import { photos, tourPhotoKeys, walkthroughVideo } from '../config/assets';
import { isCompactViewport } from './motion';

/**
 * Açılış yükleyicisi.
 *
 * 1. Tur fotoğraflarını önceden yükler (fotoğraf modu ve yedek için).
 * 2. Yürüyüş videosunu `fetch` ile tamamen indirip blob URL'ye çevirir.
 *    Video tamamen bellekte olduğu için kaydırmayla ileri-geri sarma ağ
 *    beklemeden, akıcı çalışır.
 *
 * `ready`: açılış ekranının kalkabileceği an (fotoğraflar + video ya da süre sınırı).
 * `video`: video blob URL'si; video yoksa ya da indirilemezse null.
 * Video süre sınırından sonra inerse tur fotoğraftan videoya kendiliğinden geçer.
 */

type ProgressFn = (ratio: number) => void;
const listeners = new Set<ProgressFn>();
let ratio = 0;
let started = false;

let resolveReady!: () => void;
const ready = new Promise<void>((r) => (resolveReady = r));
let resolveVideo!: (url: string | null) => void;
const video = new Promise<string | null>((r) => (resolveVideo = r));

function report(r: number) {
  ratio = Math.max(ratio, r);
  listeners.forEach((fn) => fn(ratio));
}

export function videoSource(): string | null {
  const compact = isCompactViewport();
  if (compact && !walkthroughVideo.enableOnMobile) return null;
  return compact && walkthroughVideo.srcMobile ? walkthroughVideo.srcMobile : walkthroughVideo.src;
}

async function fetchVideo(src: string, onProgress: (r: number) => void): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok || !res.body) return null;
    const type = res.headers.get('content-type') ?? '';
    if (type && !type.startsWith('video/') && !type.includes('octet-stream')) return null;
    const total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) onProgress(received / total);
    }
    if (received < 1024) return null;
    return URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
  } catch {
    return null;
  }
}

export const loader = {
  ready,
  video,
  onProgress(fn: ProgressFn) {
    listeners.add(fn);
    fn(ratio);
    return () => {
      listeners.delete(fn);
    };
  },
  start() {
    if (started) return;
    started = true;

    const src = videoSource();
    // İlerleme ağırlıkları: video varsa çoğunluğu videodur.
    const wPhotos = src ? 0.25 : 1;
    const wVideo = 1 - wPhotos;
    let pPhotos = 0;
    let pVideo = 0;
    const update = () => report(pPhotos * wPhotos + pVideo * wVideo);

    let photosDone = false;
    let videoDone = !src;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      report(1);
      resolveReady();
    };
    const check = () => {
      if (photosDone && videoDone) finish();
    };
    window.setTimeout(finish, walkthroughVideo.loadTimeoutMs);

    const total = tourPhotoKeys.length;
    let n = 0;
    tourPhotoKeys.forEach((key) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = photos[key].src;
      const settle = () => {
        n += 1;
        pPhotos = n / total;
        update();
        if (n === total) {
          photosDone = true;
          check();
        }
      };
      img.decode().then(settle, settle);
    });

    if (!src) {
      resolveVideo(null);
      return;
    }
    fetchVideo(src, (r) => {
      pVideo = r;
      update();
    }).then((url) => {
      pVideo = 1;
      update();
      videoDone = true;
      resolveVideo(url);
      check();
    });
  },
};
