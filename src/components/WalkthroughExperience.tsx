import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos } from '../config/assets';
import { videoLook, visualLayers, walkthroughLength } from '../config/scenes';
import {
  cameraTransform,
  clamp,
  coverSize,
  fadeWindow,
  isCompactViewport,
  prefersReducedMotion,
  sampleCamera,
  smoothstep,
} from '../lib/motion';
import { walkthrough } from '../lib/walkthrough';
import { loader, videoSource } from '../lib/loader';
import SceneOverlay from './SceneOverlay';
import ScrollProgress from './ScrollProgress';

gsap.registerPlugin(ScrollTrigger);

export type WalkMode = 'image' | 'video';

/** iPhone / iPad (tüm tarayıcıları WebKit'tir) ya da masaüstü Safari. */
const isAppleWebKit = () => {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const safari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
  return ios || safari;
};

/**
 * Kaydırma kontrollü tur.
 *
 * - Video modu: yükleyici videoyu tamamen indirir; kaydırma ilerlemesi (0–1)
 *   videonun süresine eşlenir ve kare konumu kaydırmayla belirlenir.
 * - Fotoğraf modu: video yoksa ya da henüz inmediyse, gerçek fotoğraflar
 *   üzerinde kamera hareketi ve geçişlerle anlatım. Video sonradan inerse
 *   yumuşak bir geçişle videoya geçilir.
 *
 * Kaydırma sırasında React yeniden çizim yapmaz; tüm güncellemeler
 * requestAnimationFrame içinde doğrudan DOM üzerinde yapılır.
 */
export default function WalkthroughExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<WalkMode>('image');
  const [compact] = useState(() => isCompactViewport());

  // Yükleyici videoyu indirdiyse video moduna geç.
  useEffect(() => {
    let alive = true;
    let watchdog = 0;
    let onTouch: (() => void) | null = null;
    loader.video.then((url) => {
      const v = videoRef.current;
      const direct = videoSource();
      if (!alive || !url || !v) return;
      let done = false;
      const ok = () => {
        if (done || !isFinite(v.duration) || v.duration <= 0) return;
        done = true;
        window.clearTimeout(watchdog);
        v.pause();
        if (alive) setMode('video');
      };
      // iOS duraklatılmış videonun karesini bir kez oynatılmadan çizmez ve
      // veriyi yüklemez; sessiz bir oynat-durdur bunu tetikler.
      const prime = () => {
        v.play().then(() => v.pause(), () => {});
      };
      const useDirect = () => {
        if (!alive || done || !direct || v.src.startsWith('http')) return;
        v.src = direct;
        v.load();
        prime();
      };
      v.addEventListener('loadeddata', ok);
      v.addEventListener('canplay', ok);
      // Safari blob URL'den video oynatmaz: kimi zaman hata verir
      // (MEDIA_ERR_SRC_NOT_SUPPORTED), kimi zaman sessizce bekler. iPhone ve
      // Safari'de baştan doğrudan dosya kullanılır; diğerlerinde hata ya da
      // 4 sn içinde kare gelmezse doğrudan dosyaya geçilir (önbellekten gelir).
      v.addEventListener('error', useDirect, { once: true });
      if (isAppleWebKit() && direct) {
        v.src = direct;
      } else {
        v.src = url;
        watchdog = window.setTimeout(useDirect, 4000);
      }
      v.load();
      prime();
      // Düşük Güç Modu'nda iOS dokunuş olmadan video başlatmaz: ilk dokunuşta
      // videoyu hazırla (kullanıcı hareketi içinde oynat-durdur serbesttir).
      onTouch = () => {
        if (!done) prime();
      };
      window.addEventListener('touchend', onTouch, { once: true, passive: true });
    });
    return () => {
      alive = false;
      window.clearTimeout(watchdog);
      if (onTouch) window.removeEventListener('touchend', onTouch);
    };
  }, []);

  // Kaydırma → hedef ilerleme → yumuşatılmış ilerleme → DOM
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    walkthrough.registerSection(section);

    const reduce = prefersReducedMotion();
    let vw = stage.clientWidth;
    let vh = stage.clientHeight;
    let covers = visualLayers.map((l) => coverSize(photos[l.photo].width, photos[l.photo].height, vw, vh));
    let target = 0;
    let current = 0;
    let raf = 0;
    let lastSeek = -1;
    let seekTarget = -1;
    let lastTick = 0;

    const sizeImages = () => {
      vw = stage.clientWidth;
      vh = stage.clientHeight;
      covers = visualLayers.map((l) => coverSize(photos[l.photo].width, photos[l.photo].height, vw, vh));
      imgRefs.current.forEach((img, i) => {
        if (!img) return;
        img.style.width = `${covers[i].w}px`;
        img.style.height = `${covers[i].h}px`;
      });
    };

    const applyImages = (p: number) => {
      visualLayers.forEach((layer, i) => {
        const el = layerRefs.current[i];
        const img = imgRefs.current[i];
        if (!el || !img) return;
        const o = fadeWindow(p, layer.fade);
        if (o <= 0.001) {
          if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
          return;
        }
        el.style.visibility = 'visible';
        el.style.opacity = o.toFixed(3);
        const cam = reduce
          ? { ...sampleCamera(layer.camera, (layer.camera[0].at + layer.camera[layer.camera.length - 1].at) / 2), zoom: 1 }
          : sampleCamera(layer.camera, p);
        img.style.transform = cameraTransform(covers[i], vw, vh, cam);
      });
    };

    const applyVideo = (p: number) => {
      const v = videoRef.current;
      if (dimRef.current) {
        const d = videoLook.dim + (videoLook.finalDim - videoLook.dim) * smoothstep(videoLook.finalDimFrom[0], videoLook.finalDimFrom[1], p);
        dimRef.current.style.opacity = d.toFixed(3);
      }
      if (!v || !isFinite(v.duration)) return;
      const t = clamp(p) * Math.max(0, v.duration - 0.05);
      seekTarget = t;
      // Arama sürerken yeni arama başlatma; çok küçük farkları atla.
      // Atlanan hedef, arama bitince (seeked) uygulanır.
      if (v.seeking || Math.abs(t - lastSeek) < 1 / 60) return;
      lastSeek = t;
      v.currentTime = t;
    };
    // Telefonda kare çözme yavaş: kaydırma dururken son hedef atlanmışsa
    // video yanlış karede kalmasın diye arama bitince hedefe yeniden git.
    const onSeeked = () => {
      const v = videoRef.current;
      if (!v || stage.dataset.mode !== 'video' || seekTarget < 0) return;
      if (Math.abs(seekTarget - lastSeek) >= 1 / 60) {
        lastSeek = seekTarget;
        v.currentTime = seekTarget;
      }
    };
    const videoEl = videoRef.current;
    videoEl?.addEventListener('seeked', onSeeked);

    const render = (p: number) => {
      if (stage.dataset.mode === 'video') applyVideo(p);
      else applyImages(p);
      walkthrough.publish(p);
    };

    const tick = (now: number) => {
      // Kare hızından bağımsız yumuşatma: 60 Hz'de kare başına 0.1;
      // telefon kare düşürünce ya da 120 Hz ekranda his aynı kalır.
      const dt = lastTick ? Math.min(64, now - lastTick) : 16.67;
      lastTick = now;
      const ease = reduce ? 1 : 1 - Math.pow(0.9, dt / 16.67);
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0003) current = target;
      render(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) {
        lastTick = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    sizeImages();
    render(0);

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress;
        wake();
      },
      onRefresh: (self) => {
        sizeImages();
        target = self.progress;
        current = target;
        lastSeek = -1;
        render(current);
      },
    });

    const ro = new ResizeObserver(() => {
      sizeImages();
      render(current);
    });
    ro.observe(stage);

    // Açılış: yükleme ekranı kalkarken görüntü hafifçe yerine oturur.
    let intro: gsap.core.Tween | null = null;
    let alive = true;
    if (!reduce && introRef.current) {
      gsap.set(introRef.current, { scale: 1.08 });
      loader.ready.then(() => {
        if (!alive || !introRef.current) return;
        intro = gsap.to(introRef.current, { scale: 1, duration: 2.6, delay: 0.6, ease: 'power3.out' });
      });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      st.kill();
      ro.disconnect();
      intro?.kill();
      videoEl?.removeEventListener('seeked', onSeeked);
    };
  }, []);

  // Mod değişince mevcut ilerlemeyi yeniden uygula.
  useEffect(() => {
    if (stageRef.current) stageRef.current.dataset.mode = mode;
    ScrollTrigger.refresh();
  }, [mode]);

  const length = compact ? walkthroughLength.mobile : walkthroughLength.desktop;

  return (
    <section
      ref={sectionRef}
      id="deneyim"
      aria-label="KAYA HAIR salon turu"
      className="walk-section relative bg-ink"
      style={{ ['--walk-len' as string]: length }}
    >
      <div ref={stageRef} data-mode="image" className="stage sticky top-0 w-full overflow-hidden bg-ink">
        <div ref={introRef} className="absolute inset-0 origin-[50%_45%]">
          {/* Fotoğraf modu. Video moduna geçince tamamen kaldırılır (display: none):
              7 büyük katman telefonda GPU belleğini doldurup titremeye yol açıyordu. */}
          <div className={mode === 'video' ? 'hidden' : 'contents'} aria-hidden={mode === 'video' || undefined}>
            {visualLayers.map((layer, i) => {
              const photo = photos[layer.photo];
              return (
                <div
                  key={layer.id}
                  ref={(el) => (layerRefs.current[i] = el)}
                  className="walk-layer"
                  style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}
                  aria-hidden={i === 0 ? undefined : true}
                >
                  <img
                    ref={(el) => (imgRefs.current[i] = el)}
                    src={photo.src}
                    alt={i === 0 ? photo.alt : ''}
                    width={photo.width}
                    height={photo.height}
                    decoding="async"
                    loading="eager"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-ink" style={{ opacity: layer.dim }} />
                </div>
              );
            })}
          </div>

          {/* Video modu */}
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              mode === 'video' ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{ objectPosition: compact ? videoLook.focusMobile : videoLook.focus }}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-label="KAYA HAIR salonunun içinde kaydırmayla ilerleyen tur videosu"
            tabIndex={-1}
          />
          <div
            ref={dimRef}
            className={`absolute inset-0 bg-ink ${mode === 'video' ? '' : 'hidden'}`}
            style={{ opacity: videoLook.dim }}
            aria-hidden="true"
          />
        </div>

        {/* Okunabilirlik için sinematik kararmalar */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_40%,rgba(26,18,14,0.75)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />

        <SceneOverlay key={`o-${mode}`} mode={mode} />
        <ScrollProgress key={`p-${mode}`} mode={mode} />
      </div>
    </section>
  );
}
