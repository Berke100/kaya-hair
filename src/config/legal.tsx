import type { ReactNode } from 'react';
import { links, site } from './site';

/**
 * YASAL METİNLER — KVKK aydınlatma metni, gizlilik ve çerez politikası, künye.
 *
 * Metinler sitenin bugünkü işleyişine göre yazılmıştır: sitede form, çerez,
 * analitik ya da reklam izleyicisi yoktur; randevu KolayRandevu'da alınır.
 * Bunlardan biri değişirse (ör. Google Analytics, iletişim formu, harita
 * gömme, salonda kamera) ilgili bölümler güncellenmelidir.
 *
 * İşletme bilgileri `config/site.ts` → `legal` alanından gelir. Yayından önce
 * bir hukuk danışmanına okutulması önerilir.
 */

export type LegalKey = 'kvkk' | 'gizlilik' | 'cerez' | 'kunye';

const { brand, contact, legal } = site;

/** Boş bilgi için görünür işaret: hiçbir bilgi uydurulmaz. */
function Field({ value }: { value: string | null }) {
  return value ? <>{value}</> : <span className="text-bronze">Eklenecek</span>;
}

const H = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-10 font-display text-lg font-medium text-ivory first:mt-0">{children}</h3>
);
const P = ({ children }: { children: ReactNode }) => <p className="mt-4">{children}</p>;
const UL = ({ items }: { items: ReactNode[] }) => (
  <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 marker:text-bronze">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="link-line text-ivory">
    {children}
  </a>
);

/** Veri sorumlusunun adı: unvan girilmişse o, değilse marka adı. */
const controller = legal.controllerName ? `${legal.controllerName} (${brand.name})` : brand.name;

/** KVKK başvuru kanalları: yalnızca dolu olanlar listelenir. */
const applyChannels: ReactNode[] = [
  <>
    Kimliğinizi tespit edici belgelerle birlikte <strong>yazılı olarak</strong>, ıslak imzalı dilekçeyle şahsen ya da
    noter aracılığıyla: <Field value={contact.address} />
  </>,
  ...(legal.kep ? [<>Kayıtlı elektronik posta (KEP) ile: {legal.kep}</>] : []),
  ...(legal.email
    ? [
        <>
          Güvenli elektronik imza, mobil imza ya da daha önce bize bildirdiğiniz ve sistemimizde kayıtlı e-posta adresinizden:{' '}
          <a href={`mailto:${legal.email}`} className="link-line text-ivory">
            {legal.email}
          </a>
        </>,
      ]
    : []),
];

export const legalDocs: Record<LegalKey, { title: string; short: string; body: ReactNode }> = {
  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    short: 'KVKK',
    body: (
      <>
        <P>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) madde 10 ve Aydınlatma Yükümlülüğünün Yerine
          Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca, {brand.name} müşterilerini ve web sitesi
          ziyaretçilerini kişisel verilerinin nasıl işlendiği hakkında bilgilendirmek için hazırlanmıştır.
        </P>

        <H>1. Veri sorumlusu</H>
        <P>
          Kişisel verileriniz, veri sorumlusu sıfatıyla <strong>{controller}</strong> (“Salon”) tarafından işlenir.
        </P>
        <UL
          items={[
            <>
              Adres: <Field value={contact.address} />
            </>,
            <>
              Telefon: <Field value={contact.phone} />
            </>,
            <>
              E-posta: <Field value={legal.email} />
            </>,
          ]}
        />

        <H>2. İşlenen kişisel veriler</H>
        <UL
          items={[
            <>
              <strong>Kimlik ve iletişim:</strong> ad soyad, telefon numarası; WhatsApp ya da Instagram üzerinden yazdığınızda
              kullanıcı adınız ve profil bilginiz.
            </>,
            <>
              <strong>Müşteri işlem:</strong> randevu tarihi ve saati, seçilen hizmet ve personel, randevu geçmişi, talep ve
              mesaj içerikleri.
            </>,
            <>
              <strong>Finans:</strong> hizmet bedeli ve fatura bilgileri (fatura düzenlenmesi hâlinde).
            </>,
            <>
              <strong>İşlem güvenliği:</strong> web sitesini ziyaret ettiğinizde barındırma hizmeti sağlayıcısının sunucu
              kayıtlarına otomatik olarak düşen IP adresi, tarayıcı ve cihaz bilgisi, erişim zamanı.
            </>,
          ]}
        />
        <P>
          Salon, sağlık bilgisi ya da başka bir özel nitelikli kişisel veri talep etmez. Hizmet için önemli olduğunu
          düşündüğünüz bir bilgiyi (ör. bir ürüne alerji) kendiniz paylaşırsanız, yalnızca o hizmetin güvenle verilmesi için
          kullanılır ve açık rızanıza dayanır.
        </P>

        <H>3. İşleme amaçları</H>
        <UL
          items={[
            'Randevu oluşturma, değiştirme, hatırlatma ve iptal süreçlerinin yürütülmesi',
            'Saç, sakal ve bakım hizmetlerinin sunulması',
            'Telefon, WhatsApp ve Instagram üzerinden gelen soru ve taleplerin yanıtlanması',
            'Fatura düzenlenmesi, muhasebe ve vergi yükümlülüklerinin yerine getirilmesi',
            'Web sitesinin çalışması, güvenliği ve kötüye kullanımın önlenmesi',
            'Hukuki uyuşmazlıklarda hakların korunması ve yetkili kurumların taleplerinin karşılanması',
          ]}
        />

        <H>4. Toplama yöntemi ve hukuki sebepler</H>
        <P>
          Kişisel verileriniz; telefon, WhatsApp, Instagram ve salonda sözlü olarak ya da KolayRandevu online randevu
          platformu üzerinden kısmen otomatik yollarla, web sitesi sunucu kayıtları ise otomatik yollarla toplanır. Kanun'un
          5. maddesindeki şu hukuki sebeplere dayanılır:
        </P>
        <UL
          items={[
            <>
              <strong>Bir sözleşmenin kurulması veya ifası (m. 5/2-c):</strong> randevu ve hizmet süreçleri.
            </>,
            <>
              <strong>Hukuki yükümlülüğün yerine getirilmesi (m. 5/2-ç):</strong> fatura, muhasebe ve vergi mevzuatı.
            </>,
            <>
              <strong>Bir hakkın tesisi, kullanılması veya korunması (m. 5/2-e):</strong> olası uyuşmazlıklar.
            </>,
            <>
              <strong>Meşru menfaat (m. 5/2-f):</strong> taleplerin yanıtlanması, web sitesinin güvenliği.
            </>,
            <>
              <strong>Açık rıza (m. 5/1):</strong> yalnızca kendiniz paylaştığınız, hizmet için gerekli özel bilgiler
              için. Açık rızanızı dilediğiniz zaman geri alabilirsiniz.
            </>,
          ]}
        />

        <H>5. Aktarım</H>
        <P>Kişisel verileriniz, yalnızca yukarıdaki amaçlarla sınırlı olarak şu alıcılara aktarılabilir:</P>
        <UL
          items={[
            <>
              <strong>KolayRandevu:</strong> online randevu altyapısı. Platformda açtığınız hesap için KolayRandevu kendi
              aydınlatma metni kapsamında ayrıca veri sorumlusudur.
            </>,
            <>
              <strong>Mali müşavir ve muhasebe hizmeti sağlayıcıları:</strong> fatura ve vergi yükümlülükleri.
            </>,
            <>
              <strong>Yetkili kamu kurum ve kuruluşları ile yargı mercileri:</strong> kanunen zorunlu hâllerde, talep
              üzerine.
            </>,
            <>
              <strong>Web sitesi barındırma hizmeti sağlayıcısı (Vercel Inc., ABD):</strong> site sunucu kayıtları. Bu
              aktarım yurt dışına yapılmaktadır ve Kanun'un 9. maddesinde öngörülen güvencelere uygun olarak
              gerçekleştirilir.
            </>,
          ]}
        />
        <P>
          WhatsApp (Meta Platforms) ya da Instagram üzerinden bize yazdığınızda, iletişim bu platformların altyapısında ve
          kendi gizlilik politikalarına göre gerçekleşir; kanalı siz seçtiğiniz için bu platformlara Salon tarafından ayrıca
          bir aktarım yapılmaz.
        </P>

        <H>6. Saklama süresi</H>
        <P>
          Kişisel veriler, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen süreler boyunca saklanır;
          fatura ve muhasebe kayıtları için bu süre vergi ve ticaret mevzuatının öngördüğü süredir. Süre dolduğunda veriler
          silinir, yok edilir ya da anonim hâle getirilir.
        </P>

        <H>7. Kanun'un 11. maddesi kapsamındaki haklarınız</H>
        <UL
          items={[
            'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
            'İşlenmişse buna ilişkin bilgi talep etme',
            'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
            'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
            'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
            'Kanun\'un 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme',
            'Düzeltme, silme veya yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme',
            'Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
            'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
          ]}
        />

        <H>8. Başvuru</H>
        <P>
          Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun olarak
          aşağıdaki yollarla iletebilirsiniz:
        </P>
        <UL items={applyChannels} />
        <P>
          Başvurunuzda adınız soyadınız, imzanız, T.C. kimlik numaranız (yabancılar için uyruk ve pasaport ya da kimlik
          numarası), tebligata esas adresiniz, varsa e-posta adresiniz ve telefon numaranız ile talebinizin konusu yer
          almalıdır. Başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır; işlemin ayrıca bir maliyet
          gerektirmesi hâlinde Kişisel Verileri Koruma Kurulu'nca belirlenen tarifedeki ücret alınabilir. Başvurunuzun
          reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hâlinde Kişisel Verileri Koruma
          Kurulu'na şikâyette bulunabilirsiniz.
        </P>
      </>
    ),
  },

  gizlilik: {
    title: 'Gizlilik Politikası',
    short: 'Gizlilik',
    body: (
      <>
        <P>
          Bu politika, {brand.name} web sitesini ziyaret ettiğinizde ve salonla iletişime geçtiğinizde gizliliğinizi nasıl
          koruduğumuzu özetler. Kişisel verilerin işlenmesine ilişkin ayrıntılı bilgi KVKK Aydınlatma Metni'ndedir.
        </P>

        <H>Web sitesinde topladıklarımız</H>
        <P>
          Bu sitede üyelik, form, reklam ya da ziyaretçi analizi aracı yoktur; sizden herhangi bir bilgi istemez ve
          kaydetmez. Site, tarayıcınızda çerez ya da benzeri bir kayıt oluşturmaz. Yazı tipleri ve görseller de sitenin
          kendi sunucusundan yüklenir, bu sırada üçüncü taraf bir hizmete bağlanılmaz.
        </P>
        <P>
          Siteyi barındıran hizmet sağlayıcı (Vercel), güvenlik ve hizmetin çalışması için teknik sunucu kayıtları (IP
          adresi, tarayıcı bilgisi, erişim zamanı) tutar. Bu kayıtlar ziyaretçileri tanımak ya da profillemek için
          kullanılmaz.
        </P>

        <H>Sesli tur</H>
        <P>
          “Salonu dinle” özelliğindeki sesler tamamen tarayıcınızda üretilir. Mikrofonunuza erişilmez, ses kaydı yapılmaz
          ve hiçbir bilgi gönderilmez.
        </P>

        <H>Randevu ve iletişim</H>
        <P>
          Online randevu, salonun kullandığı KolayRandevu platformunda alınır; “Randevu al” butonları sizi bu platforma
          yönlendirir. WhatsApp, Instagram ve Google Haritalar bağlantıları da ilgili hizmetlerin kendi sayfalarını açar.
          Bu hizmetlerde paylaştığınız bilgiler, her birinin kendi gizlilik politikasına tabidir:
        </P>
        <UL
          items={[
            <A href="https://www.kolayrandevu.com/">KolayRandevu</A>,
            <A href="https://www.whatsapp.com/legal/privacy-policy">WhatsApp Gizlilik İlkesi</A>,
            <A href="https://privacycenter.instagram.com/policy">Instagram Gizlilik İlkesi</A>,
            <A href="https://policies.google.com/privacy?hl=tr">Google Gizlilik Politikası</A>,
          ]}
        />

        <H>Müşteri yorumları</H>
        <P>
          Sitede yer alan yorumlar, herkese açık olarak yayımlanmış yorumlardan alınmıştır ve yorum sahiplerinin adları,
          kaynakta olduğu gibi kısaltılarak gösterilir. Yorumunuzun kaldırılmasını isterseniz bize ulaşabilirsiniz.
        </P>

        <H>Güvenlik</H>
        <P>
          Site yalnızca şifreli bağlantı (HTTPS) üzerinden sunulur. Salonda tutulan randevu ve müşteri bilgilerine yalnızca
          yetkili çalışanlar erişir.
        </P>

        <H>Çocuklar</H>
        <P>
          18 yaşından küçükler için randevu ve iletişim taleplerinin veli ya da vasi tarafından iletilmesini rica ederiz.
        </P>

        <H>Değişiklikler ve iletişim</H>
        <P>
          Bu politika gerektiğinde güncellenir; güncel sürüm her zaman bu sayfadadır. Sorularınız için:{' '}
          <Field value={contact.phone} />
          {legal.email && (
            <>
              {' · '}
              <a href={`mailto:${legal.email}`} className="link-line text-ivory">
                {legal.email}
              </a>
            </>
          )}
          .
        </P>
      </>
    ),
  },

  cerez: {
    title: 'Çerez Politikası',
    short: 'Çerezler',
    body: (
      <>
        <H>Bu site çerez kullanmaz</H>
        <P>
          {brand.name} web sitesi, tarayıcınızda çerez (cookie), yerel depolama (localStorage) ya da benzeri bir izleme
          teknolojisi kullanmaz. Sitede reklam, ziyaretçi analizi veya sosyal medya izleyicisi bulunmaz. Bu nedenle size bir
          çerez onay penceresi gösterilmez.
        </P>

        <H>Üçüncü taraf siteler</H>
        <P>
          Sitedeki bir bağlantıyla KolayRandevu, WhatsApp, Instagram ya da Google Haritalar'a geçtiğinizde, bu siteler kendi
          çerezlerini kullanabilir. Bu çerezler ilgili hizmetin kendi politikasına tabidir; nasıl kullanıldıklarını o
          hizmetlerin sayfalarından öğrenebilirsiniz.
        </P>

        <H>Çerezleri yönetme</H>
        <P>
          Tarayıcınızın ayarlarından çerezleri görüntüleyebilir, silebilir ve engelleyebilirsiniz. Bu sitenin çalışması
          herhangi bir çereze bağlı değildir.
        </P>

        <H>Değişiklikler</H>
        <P>
          Siteye ileride çerez kullanan bir özellik eklenirse bu politika güncellenir ve gerekli olmayan çerezler için
          önceden onayınız alınır.
        </P>
      </>
    ),
  },

  kunye: {
    title: 'Künye',
    short: 'Künye',
    body: (
      <>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
          {(
            [
              ['İşletme', brand.name],
              ['Unvan / işletme sahibi', legal.controllerName],
              ['Adres', contact.address],
              ['Telefon', contact.phone],
              ['E-posta', legal.email],
              ['Vergi dairesi', legal.taxOffice],
              ['Vergi numarası', legal.taxNumber],
              ...(legal.mersis ? [['MERSİS numarası', legal.mersis] as const] : []),
              ...(legal.kep ? [['KEP adresi', legal.kep] as const] : []),
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-mute">{k}</dt>
              <dd className="text-ivory">
                <Field value={v} />
              </dd>
            </div>
          ))}
        </dl>
        <P>
          Online randevu: <A href={links.booking ?? 'https://www.kolayrandevu.com/'}>{site.booking.bookingPlatform ?? 'KolayRandevu'}</A>
          {links.instagram && (
            <>
              {' · '}Instagram: <A href={links.instagram}>@{contact.instagram}</A>
            </>
          )}
        </P>
      </>
    ),
  },
};

export const legalOrder: LegalKey[] = ['kvkk', 'gizlilik', 'cerez', 'kunye'];
