import { ArrowUpRight, Star } from 'lucide-react';
import { ratingSummary, reviews, type Review } from '../config/reviews';

function Stars({ size = 14 }: { size?: number }) {
  return (
    <span className="flex gap-0.5 text-bronze" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} strokeWidth={0} fill="currentColor" />
      ))}
    </span>
  );
}

function Card({ r }: { r: Review }) {
  return (
    <figure className="mr-4 flex w-[300px] shrink-0 flex-col justify-between gap-5 border border-ivory/10 bg-coal/60 p-6 md:w-[360px]">
      <div className="flex items-center justify-between gap-3">
        <span className="micro text-[9px] text-mute">{r.source}</span>
        <Stars size={12} />
      </div>
      <blockquote className="editorial text-[1.35rem] leading-snug text-ivory/90">“{r.text}”</blockquote>
      <figcaption className="flex items-center justify-between gap-3 text-xs text-mute">
        <span className="text-ivory/70">{r.author}</span>
        {r.date && <span>{r.date}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * Müşteri yorumları: solda puan özeti, yanında kendiliğinden akan
 * gerçek yorum kartları (fareyle üzerine gelince durur).
 */
export default function ReviewsSection() {
  const s = ratingSummary;
  const score = s.score.toLocaleString('tr-TR', { minimumFractionDigits: 1 });

  return (
    <section id="yorumlar" aria-labelledby="yorumlar-baslik" className="scroll-mt-16 overflow-hidden border-t border-ivory/10 bg-ink">
      <div className="gutter mx-auto flex max-w-[1440px] flex-col gap-6 pb-10 pt-20 md:flex-row md:items-end md:justify-between md:pb-12 md:pt-24" data-reveal>
        <div>
          <p className="micro flex items-center gap-4 text-bronze">
            <span className="h-px w-8 bg-bronze" aria-hidden="true" />
            Müşteri yorumları
          </p>
          <h2 id="yorumlar-baslik" className="editorial mt-5 text-[clamp(2.2rem,4vw,3.6rem)] text-ivory">
            Koltuktan kalkanlar anlatıyor.
          </h2>
        </div>

        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-5 self-start border border-ivory/15 px-5 py-4 transition-colors hover:border-bronze md:self-auto"
          aria-label={`${s.source} üzerinde ${s.outOf} üzerinden ${score} puan, ${s.ratings} puanlama ve ${s.reviews} yorum. Tüm yorumları gör.`}
        >
          <span className="font-display text-[2.6rem] font-light leading-none tabular-nums text-ivory">{score}</span>
          <span className="flex flex-col gap-1.5">
            <Stars />
            <span className="text-xs text-mute">
              {s.source} · {s.ratings.toLocaleString('tr-TR')} puanlama · {s.reviews} yorum
            </span>
          </span>
          <ArrowUpRight
            size={18}
            strokeWidth={1.4}
            className="text-ivory/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ivory"
            aria-hidden="true"
          />
        </a>
      </div>

      {/* Ekran okuyucular için sade liste */}
      <ul className="sr-only">
        {reviews.map((r) => (
          <li key={r.author + r.text.slice(0, 12)}>
            {r.text} — {r.author}, {r.source}
          </li>
        ))}
      </ul>

      {/* Akan şerit */}
      <div className="marquee relative pb-20 md:pb-24" aria-hidden="true">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-ink to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-ink to-transparent md:w-40" />
        {/* Kartlar arası boşluk mr-4 ile: iki kopya eşit genişlikte kalır, -50% döngü zıplamaz */}
        <div className="marquee-track flex w-max [animation-duration:70s]">
          {[0, 1].map((copy) =>
            reviews.map((r) => <Card key={`${copy}-${r.author}-${r.text.slice(0, 10)}`} r={r} />),
          )}
        </div>
      </div>
    </section>
  );
}
