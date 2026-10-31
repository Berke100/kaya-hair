/**
 * Kaydırınca açılma. `data-reveal` taşıyan öğeler ekrana girince `is-in`
 * sınıfını alır. JS çalışmazsa ya da azaltılmış hareket tercih edilmişse
 * içerik baştan görünür kalır.
 */
export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-reveal');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
  scan();
  // Sonradan eklenen öğeler (ör. galeri kategorisi değişimi) için
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}
