import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { closeDialog, isDialogOpen, showDialog } from '../lib/dialog';
import { legalDocs, legalOrder, type LegalKey } from '../config/legal';
import { site } from '../config/site';

const isLegal = (h: string): h is LegalKey => (legalOrder as string[]).includes(h);

/**
 * Yasal metinler (KVKK, gizlilik, çerez, künye) tam ekran pencerede açılır.
 * Adres çubuğundaki #kvkk, #gizlilik, #cerez, #kunye ile doğrudan açılabilir;
 * böylece bağlantı olarak paylaşılabilir ve geri tuşu pencereyi kapatır.
 */
export default function LegalDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<LegalKey | null>(null);

  // Adres çubuğu → açık belge
  useEffect(() => {
    const sync = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      setDoc(isLegal(h) ? h : null);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // Açık belge → pencere
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (doc) {
      showDialog(d);
      document.documentElement.style.overflow = 'hidden';
      // Odak metne: klavyeyle doğrudan kaydırılabilir, ilk sekmede çerçeve çıkmaz.
      bodyRef.current?.scrollTo(0, 0);
      bodyRef.current?.focus({ preventScroll: true });
    } else if (isDialogOpen(d)) {
      closeDialog(d);
    }
  }, [doc]);

  // Pencere kapanınca (Esc, X, dışarı tıklama) adresi temizle; sayfa kaymaz.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = '';
      if (isLegal(decodeURIComponent(window.location.hash.slice(1)))) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setDoc(null);
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  const current = doc ? legalDocs[doc] : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="yasal-baslik"
      className="m-0 h-full max-h-none w-full max-w-none bg-ink p-0 text-ivory backdrop:bg-ink/80"
    >
      {current && doc && (
        <div className="flex h-full flex-col">
          <div className="border-b border-ivory/10 pt-[env(safe-area-inset-top,0px)]">
            <div className="gutter mx-auto flex max-w-3xl items-center justify-between gap-4 py-3">
              <nav aria-label="Yasal metinler" className="-mx-2 flex min-w-0 flex-wrap">
                {legalOrder.map((k) => (
                  <a
                    key={k}
                    href={`#${k}`}
                    aria-current={k === doc ? 'page' : undefined}
                    className="micro shrink-0 whitespace-nowrap px-2 py-2 text-[10px] text-ivory/50 transition-colors hover:text-ivory aria-[current=page]:text-bronze"
                  >
                    {legalDocs[k].short}
                  </a>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => closeDialog(dialogRef.current)}
                className="grid h-11 w-11 shrink-0 place-items-center"
                aria-label="Kapat"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div ref={bodyRef} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none">
            <article className="gutter mx-auto max-w-3xl pb-[calc(env(safe-area-inset-bottom,0px)+64px)] pt-10 md:pt-14">
              <p className="micro flex items-center gap-4 text-bronze">
                <span className="h-px w-8 bg-bronze" aria-hidden="true" />
                {site.brand.name}
              </p>
              <h2 id="yasal-baslik" className="editorial mt-5 text-[clamp(2.2rem,5vw,3.4rem)] text-ivory">
                {current.title}
              </h2>
              <p className="mt-3 text-xs text-mute">Son güncelleme: {site.legal.updated}</p>
              <div className="mt-10 text-[15px] leading-relaxed text-ivory/75">{current.body}</div>
            </article>
          </div>
        </div>
      )}
    </dialog>
  );
}
