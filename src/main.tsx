import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { links, site } from './config/site';
import './fonts';
import './index.css';
import { initReveal } from './lib/reveal';

// Arama motorları için yerel işletme verisi (yalnızca gerçek bilgilerle).
if (site.contact.address && site.contact.phone) {
  const dayCodes = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: site.brand.name,
    description: "Gentlemen's Grooming — Serdivan'da erkek saç ve sakal bakımı",
    image: new URL('./assets/storefront.jpg', document.baseURI).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kemalpaşa Mah. Yemişli Sok. No: 27/B',
      postalCode: site.contact.postalCode ?? undefined,
      addressLocality: 'Serdivan',
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 40.7621247, longitude: 30.356617 },
    telephone: '+90 533 609 38 54',
    ...(links.maps && { hasMap: links.maps }),
    ...(links.instagram && { sameAs: [links.instagram] }),
    openingHoursSpecification: site.contact.hours.flatMap((h, i) =>
      h.ranges.map(([opens, closes]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${dayCodes[i]}`,
        opens,
        closes,
      })),
    ),
    ...(links.booking && {
      potentialAction: {
        '@type': 'ReserveAction',
        target: links.booking,
      },
    }),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

initReveal();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
