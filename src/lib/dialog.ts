/**
 * <dialog> açma/kapama, desteklemeyen eski Safari (iOS < 15.4) dahil.
 * Orada showModal/close yoktur; `open` niteliği ve index.css'teki kurallar
 * pencereyi tam ekran gösterir, kapanınca aynı `close` olayı tetiklenir.
 */
type D = HTMLDialogElement | null | undefined;

export function showDialog(d: D) {
  if (!d) return;
  if (typeof d.showModal === 'function') {
    if (!d.open) d.showModal();
    return;
  }
  d.setAttribute('open', '');
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeDialog(d);
  };
  document.addEventListener('keydown', onKey);
  d.addEventListener('close', () => document.removeEventListener('keydown', onKey), { once: true });
}

export function closeDialog(d: D) {
  if (!d) return;
  if (typeof d.close === 'function') {
    d.close();
    return;
  }
  if (!d.hasAttribute('open')) return;
  d.removeAttribute('open');
  d.dispatchEvent(new Event('close'));
}

export const isDialogOpen = (d: D) => !!d && d.hasAttribute('open');
