import { site } from '../config/site';
import { legalDocs, legalOrder } from '../config/legal';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ivory/10 bg-coal">
      <div className="gutter mx-auto max-w-[1440px] pb-[calc(env(safe-area-inset-bottom,0px)+40px)] pt-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <img
              src="./assets/brand/logo-sand.png"
              alt={`KAYA HAIR ${site.brand.tagline}`}
              width={802}
              height={403}
              loading="lazy"
              className="h-20 w-auto opacity-90 md:h-24"
            />
            <p className="mt-5 text-sm text-mute">{site.brand.city}</p>
          </div>

          <nav aria-label="Alt menü">
            <p className="micro text-[10px] text-mute">Menü</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-ivory/80">
              <li><a className="link-line hover:text-ivory" href="#ana-sayfa">Ana Sayfa</a></li>
              <li><a className="link-line hover:text-ivory" href="#deneyim">Deneyim</a></li>
              <li><a className="link-line hover:text-ivory" href="#kurucu">Kurucu</a></li>
              <li><a className="link-line hover:text-ivory" href="#hakkimizda">Hakkımızda</a></li>
              <li><a className="link-line hover:text-ivory" href="#hizmetler">Hizmetler</a></li>
              <li><a className="link-line hover:text-ivory" href="#ekip">Ekip</a></li>
              <li><a className="link-line hover:text-ivory" href="#galeri">Galeri</a></li>
              <li><a className="link-line hover:text-ivory" href="#yorumlar">Yorumlar</a></li>
              <li><a className="link-line hover:text-ivory" href="#randevu">Randevu ve iletişim</a></li>
            </ul>
          </nav>

        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-ivory/10 pt-6 text-xs text-mute md:flex-row md:items-center md:justify-between">
          <p>© {year} KAYA HAIR. Tüm hakları saklıdır.</p>
          <nav aria-label="Yasal metinler">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legalOrder.map((k) => (
                <li key={k}>
                  <a className="link-line hover:text-ivory" href={`#${k}`}>
                    {legalDocs[k].title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
