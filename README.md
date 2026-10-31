# KAYA HAIR — Web Sitesi

Kaydırma kontrollü, gerçek salon fotoğraflarıyla çalışan sinematik web sitesi.
React + TypeScript + Vite + Tailwind CSS + GSAP ScrollTrigger.

## Kurulum

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # yayın için dist/ klasörü
npm run preview      # derlenmiş sürümü yerelde dene
```

`npm run build:single`: JS ve CSS'i tek bir `index.html` içine gömer (`dist-single/`).
`assets/` klasörü yanında durur. Basit barındırma ya da önizleme için uygundur.

## Yayınlama

`npm run build` sonrası oluşan **dist/** klasörünü herhangi bir statik barındırmaya yükleyin:

- **Netlify / Vercel:** depoyu bağlayın; build komutu `npm run build`, çıktı klasörü `dist`.
- **Klasik hosting (cPanel vb.):** `dist/` içeriğini `public_html` klasörüne yükleyin.

Tüm yollar göreli olduğundan alt klasörde de çalışır.

## Nereden ne düzenlenir?

| Ne | Dosya |
| --- | --- |
| Adres, telefon, WhatsApp, Instagram, harita, çalışma saatleri | `src/config/site.ts` |
| Randevu bağlantısı (online platform) ve WhatsApp hazır mesajı | `src/config/site.ts` → `booking` |
| Sahne metinleri, zamanlamalar, kamera hareketleri | `src/config/scenes.ts` |
| Hizmetler ve açıklamaları | `src/config/services.ts` |
| Fotoğraf yolları ve açıklamaları (alt metin) | `src/config/assets.ts` |

Boş bırakılan her iletişim alanı sitede **“Eklenecek”** olarak görünür; hiçbir bilgi uydurulmaz. Çalışma saatleri günlük aralıklar olarak girilir; site bunlardan "Şu an açık / kapalı" durumunu Türkiye saatine göre hesaplar. `bookingUrl` doluysa sitedeki tüm "Randevu al" butonları o platforma gider.
Randevu kanalı eklenmeden randevu bölümünde yapılandırma notu görünür. Site hiçbir zaman
“randevunuz onaylandı” demez; ziyaretçiyi seçilen kanala yönlendirir.

Adres ve telefon girildiğinde, arama motorları için `HairSalon` yapılandırılmış verisi otomatik eklenir.

## Fotoğraf → sahne eşlemesi

| Dosya (`public/assets/`) | Sahne |
| --- | --- |
| `storefront.jpg` | Varış, Geçiş (cam kapıya yaklaşma) + İletişim |
| `waiting-lounge.jpg` | Bekleme alanı (portrelerden koltuklara eğim) |
| `barber-main.jpg` | Ustalık (ilk açı) + Final (karartılmış) + Randevu arka planı |
| `mirror-craft.jpg` | Ustalık (aynadaki imzadan ustaya iniş) + Hizmetler |
| `barber-side.jpg` | Ustalık (ikinci açı) |
| `barber-detail.jpg` | Detaylar (halka avizelerden koltuğa) |
| `team-at-work.jpg`, `entrance-open.jpg`, `barber-window.jpg`, `barber-daylight.jpg` | Yalnızca galeri |

Google Haritalar'dan alınan fotoğraflarda harita arayüzü (oklar, yazılar) kırpılmıştır.
Galerinin kategorileri ve sırası: `src/config/gallery.ts`. Turda hangi fotoğrafların
önceden yükleneceği: `src/config/assets.ts` → `tourPhotoKeys`.

## Randevu formu

Form bir randevu sistemi değildir. Ziyaretçinin bilgilerinden hazır bir mesaj oluşturur.
`contact.whatsapp` doluysa mesaj **WhatsApp ile gönder** butonuyla salona gider.
Boşsa ziyaretçi mesajı kopyalayabilir ya da arayabilir. Veriler sitede saklanmaz.

Fotoğraf modu yalnızca bu beş gerçek kareyi kullanır: yakınlaştırma, kaydırma ve geçişler.
Görünmeyen açı ya da kapıdan geçiş animasyonu üretilmez.

## Yürüyüş videosu eklemek

1. Higgsfield'dan indirdiğiniz mp4'ü hazırlayın:

   ```bash
   bash scripts/prepare-video.sh ~/Downloads/higgsfield-video.mp4
   ```

   Betik `public/assets/` içine masaüstü (1920px), mobil (1280px) sürümünü ve bir
   poster karesi yazar. Her 4 karede bir anahtar kare koyar ve sesi kaldırır;
   kaydırmayla ileri-geri sarmanın akıcı olması buna bağlıdır.

2. Başka bir şey değişmez. Açılış ekranı videoyu tamamen indirir (en fazla 12 sn bekler),
   kaydırma ilerlemesi (0–1) videonun süresine eşlenir.

3. Metinlerin video üzerindeki zamanlaması `src/config/scenes.ts` → `videoTimeline`,
   bölüm göstergesi `videoChapters`, karartma ve kadraj `videoLook` içindedir.
   Değerler videodaki saniye / toplam süre oranıdır (ör. 14 sn'lik videoda 7. saniye = 0.5).

Video yoksa ya da indirilemezse tur gerçek fotoğraflarla çalışır. Video açılış ekranından
sonra inerse tur yumuşak bir geçişle videoya döner.

## Yasal metinler (KVKK, gizlilik, çerez, künye)

Alt menüdeki bağlantılar tam ekran pencerede açılır; `#kvkk`, `#gizlilik`, `#cerez`, `#kunye`
adresleriyle doğrudan paylaşılabilir. İşletme bilgileri (unvan, e-posta, vergi bilgileri)
`src/config/site.ts` → `legal` alanından girilir; boş alanlar "Eklenecek" görünür.
Metinlerin kendisi `src/config/legal.tsx` içindedir. Siteye çerez, analitik, form ya da
gömülü harita eklenirse bu metinler güncellenmelidir.

Yazı tipleri `@fontsource` paketleriyle siteyle birlikte sunulur (`src/fonts.ts`); ziyaretçi
Google Fonts'a bağlanmaz.

## Sesli tur

`src/lib/soundscape.ts` — tüm sesler tarayıcıda Web Audio ile sentezlenir, dosya yüklenmez.
Ses varsayılan olarak kapalıdır; menüdeki "Salonu dinle" düğmesi ya da açılıştaki
"Salonu sesiyle gezin" bağlantısıyla açılır. Kapı zilinin çaldığı an
`src/components/SoundToggle.tsx` → `DOOR_AT` (tur ilerlemesi, varsayılan 0.2).
Müzik akorları `chords`, ses seviyeleri `setPosition` ve her sesin kendi fonksiyonundaki
`vel` değerleriyle ayarlanır.

## Teknik notlar

- Kaydırma sırasında React yeniden çizim yapmaz. ScrollTrigger hedef ilerlemeyi verir,
  `requestAnimationFrame` döngüsü yumuşatıp DOM'a yalnızca `transform` / `opacity` yazar.
- Sahne `position: sticky` ile sabitlenir; tarayıcının doğal kaydırmasıyla çakışmaz.
- `prefers-reduced-motion`: kamera hareketi ve yumuşatma kapanır, geçişler kalır.
- Özel imleç yalnızca fare kullanılan cihazlarda; sistem imleci her zaman görünür.
- Mobilde yürüyüş daha kısadır (`walkthroughLength`), güvenli alan boşlukları uygulanır.
