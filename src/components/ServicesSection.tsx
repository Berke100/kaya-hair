import { ArrowUpRight } from 'lucide-react';
import { photos } from '../config/assets';
import { otherServices, services } from '../config/services';
import { bookingTarget } from '../config/site';

/**
 * Hizmetler: dört görsel kart (mobilde yana kaydırılır) ve altında
 * salonun diğer hizmetlerinin aktığı şerit.
 */
export default function ServicesSection() {
  return (
    <section id="hizmetler" aria-labelledby="hizmetler-baslik" className="warm-glow scroll-mt-16 overflow-hidden">
      <div className="gutter mx-auto max-w-[1440px] pb-14 pt-24 md:pb-16 md:pt-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="micro flex items-center gap-4 text-bronze">
              <span className="h-px w-8 bg-bronze" aria-hidden="true" />
              Hizmetler
            </p>
            <h2 id="hizmetler-baslik" className="editorial mt-5 text-[clamp(2.4rem,4.6vw,4.2rem)] text-ivory">
              Saçtan sakala, özenli bir bakım.
            </h2>
          </div>
          <a {...bookingTarget} className="link-line inline-flex items-center gap-2 self-start text-sm text-ivory/80 hover:text-ivory md:self-auto">
            Fiyatları gör ve randevu al <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>

        <ul
          className="-mx-5 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Hizmet listesi"
        >
          {services.map((s, i) => {
            const p = photos[s.photo];
            return (
              <li
                key={s.name}
                data-reveal
                style={{ ['--d' as string]: i }}
                className="w-[76vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <article className="group relative aspect-[3/4] overflow-hidden bg-coal md:aspect-[4/5]">
                  <img
                    src={p.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: s.focus }}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.07] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/5" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <span
                      className="mb-4 block h-px w-8 bg-bronze transition-[width] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:w-16"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-xl font-medium text-ivory md:text-2xl">{s.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ivory/75 transition-[opacity,transform] duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      {s.description}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      {otherServices.length > 0 && (
        <div className="marquee border-y border-ivory/10 py-6 md:py-8" aria-label={`Salonda ayrıca: ${otherServices.join(', ')}`}>
          <div className="marquee-track flex w-max items-center" aria-hidden="true">
            {[0, 1].map((copy) =>
              otherServices.map((name) => (
                <span key={`${copy}-${name}`} className="flex items-center">
                  <span className="editorial whitespace-nowrap px-6 text-[clamp(1.6rem,3.4vw,2.8rem)] text-ivory/80 md:px-10">
                    {name}
                  </span>
                  <span className="h-1.5 w-1.5 rotate-45 bg-bronze" />
                </span>
              )),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
