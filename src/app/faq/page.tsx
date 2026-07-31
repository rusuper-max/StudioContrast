// src/app/faq/page.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import FaqListClient, { type FaqLite } from "@/components/FaqListClient";

export const metadata: Metadata = {
  title: "FAQ | Studio Contrast",
  description:
    "Odgovori na česta pitanja: uslovi plaćanja, rok isporuke, broj fotografija, RAW fajlovi, broj fotografa, dodatne usluge, putni troškovi, odlaganje/otkazivanje i drugo.",
  alternates: { canonical: "/faq" },
};

type FaqItem = {
  id: string;
  q: string;
  aText: string;   // za SEO JSON-LD
  aJSX: ReactNode; // render sa linkovima i formatiranjem
};

const toId = (s: string) =>
  s
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/đ/g, "dj")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const FAQ: FaqItem[] = [
  {
    id: toId("Kako da rezervišemo termin?"),
    q: "Kako da rezervišemo termin?",
    aText:
      "Pošaljite nam upit sa datumom, lokacijom i okvirnim planom dana. Ako smo slobodni, šaljemo ponudu. Rezervacija je potvrđena potpisivanjem kratkog ugovora.",
    aJSX: (
      <>
        Pošaljite nam upit sa <strong>datumom</strong>, <strong>lokacijom</strong> i okvirnim planom
        dana. Ako smo slobodni, vraćamo <Link className="link" href="/ponude">ponudu</Link>.
        Rezervacija je potvrđena potpisivanjem kratkog ugovora.
      </>
    ),
  },

  /** PREIMENOVANO: "Uslovi plaćanja" (umesto "Koliki je avans i uslovi plaćanja?") */
  {
    id: toId("Uslovi plaćanja"),
    q: "Uslovi plaćanja",
    aText:
      "Plaćanje se vrši po završetku snimanja ili po preuzimanju materijala, u skladu sa dogovorom u ugovoru.",
    aJSX: (
      <>
        Plaćanje se vrši <strong>po završetku snimanja</strong> ili <strong>po preuzimanju materijala</strong>,
        u skladu sa dogovorom u ugovoru.
      </>
    ),
  },

  {
    id: toId("Koliko fotografija dobijamo?"),
    q: "Koliko fotografija dobijamo?",
    aText:
      "Zavisi od paketa i dinamike događaja: okvirno 250–800+ fotografija. Ne isporučujemo rafal višak, već urednu, selektovanu priču dana.",
    aJSX: (
      <>
        Zavisi od paketa i dinamike događaja: okvirno <strong>250–800+</strong> fotografija. Ne isporučujemo
        „rafal“ višak, već urednu, selektovanu priču dana.
      </>
    ),
  },

  /** NOVO: Koliko fotografa — + opcije dodatnog fotografa/kamermana */
  {
    id: toId("Koliko fotografa dobijamo?"),
    q: "Koliko fotografa dobijamo?",
    aText:
      "Broj fotografa zavisi od paketa. U konfiguratoru postoji opcija za dodatnog fotografa i dodatnog kamermana (video).",
    aJSX: (
      <>
        Broj fotografa <strong>zavisi od odabranog paketa</strong>. Po potrebi možete uključiti i
        <strong> dodatnog fotografa</strong> ili <strong>dodatnog kamermana (video)</strong> kroz{" "}
        <Link className="link" href="/ponude">konfigurator</Link>.
      </>
    ),
  },

  /** IZMENJENO: Rok isporuke + način isporuke */
  {
    id: toId("Rok isporuke i kako dobijamo fotke?"),
    q: "Rok isporuke i kako dobijamo fotke?",
    aText:
      "Link ka Google Drive-u i USB; rok isporuke 7–15 dana u zavisnosti od paketa.",
    aJSX: (
      <>
        Isporuka ide kao <strong>privatni link ka Google Drive-u</strong> i{" "}
        <strong>USB</strong>. Rok isporuke je <strong>7–15 dana</strong> u zavisnosti od izabranog paketa.
      </>
    ),
  },

  /** NOVO: Ekspres obrada (prioritetna isporuka 3–5 radnih dana) */
  {
    id: toId("Šta je Ekspres obrada?"),
    q: "Šta je Ekspres obrada?",
    aText:
      "Ekspres obrada je prioritetna postprodukcija – projekat ide preko reda, a online galerija stiže u roku od 3–5 radnih dana. Kvalitet je isti kao kod standardne obrade; doplata se dodaje kroz konfigurator. Ubrzana isporuka videa je moguća po dogovoru.",
    aJSX: (
      <>
        <p>
          <strong>Ekspres obrada</strong> je prioritetna postprodukcija — vaš projekat ide
          <em> „preko reda“</em> ispred redovnih obrada. Gotovu online galeriju dobijate u roku od{" "}
          <strong>3–5 radnih dana</strong> od događaja (umesto standardnog roka).
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Kvalitet i selekcija su identični kao kod standardne obrade — ubrzava se samo isporuka.</li>
          <li>Opcija se dodaje kao doplata u <Link className="link" href="/ponude">konfiguratoru</Link>.</li>
          <li>Za ubrzanu isporuku <em>videa</em> napišite u poruci — javimo dostupne mogućnosti.</li>
        </ul>
      </>
    ),
  },

  {
    id: toId("Putni troškovi i dolazak van grada?"),
    q: "Putni troškovi i dolazak van grada?",
    aText:
      "U Zlatiborskom okrugu putni troškovi se ne naplaćuju. Za angažmane van okruga troškovi su predmet dogovora nakon kontakta (u zavisnosti od mesta i termina).",
    aJSX: (
      <>
        U <strong>Zlatiborskom okrugu</strong> putni troškovi se <strong>ne naplaćuju</strong>. Za angažmane{" "}
        <em>van okruga</em> troškovi su <strong>prema dogovoru</strong> nakon kontakta (u zavisnosti od mesta i termina).{" "}
        <Link className="link" href="/kontakt">Kontakt</Link>
      </>
    ),
  },

  {
    id: toId("Da li nudite video i dron?"),
    q: "Da li nudite video i dron?",
    aText:
      "Da. Video i dron su dostupni kao dodaci ili kroz pakete. Detaljno pogledajte stranicu Ponude i izaberite konfiguraciju.",
    aJSX: (
      <>
        Da. Video i dron su dostupni kao dodaci ili kroz pakete — pogledajte{" "}
        <Link className="link" href="/ponude">Ponude</Link> i izaberite konfiguraciju.
      </>
    ),
  },

  /** IZMENJENO: RAW fajlovi — obrazloženje i doplata opcionalno */
  {
    id: toId("Da li dobijamo RAW fajlove?"),
    q: "Da li dobijamo RAW fajlove?",
    aText:
      "Standardno ne isporučujemo RAW fajlove: to su digitalni negativi bez obrade, izuzetno veliki i deo su autorskog procesa. Dobijate obrađene JPEG fotografije i licencu za ličnu upotrebu. Na zahtev je moguće dobiti RAW uz posebnu doplatu kroz konfigurator (ne podrazumeva prenos autorskih prava).",
    aJSX: (
      <>
        Standardno <strong>ne isporučujemo RAW fajlove</strong>: to su digitalni „negativi“ bez obrade, vrlo
        veliki i deo autorskog procesa (kolor vođenje, toniranje, selekcija). U redovnoj isporuci dobijate
        <strong> obrađene JPEG fotografije</strong> i <strong>licencu za ličnu upotrebu</strong>. Na zahtev je
        moguće dobiti RAW uz <strong>posebnu doplatu</strong> kroz{" "}
        <Link className="link" href="/ponude">konfigurator</Link>. Isporuka RAW fajlova <em>ne podrazumeva</em>{" "}
        prenos autorskih prava — o posebnoj komercijalnoj licenci se dogovaramo zasebno.
      </>
    ),
  },

  /** IZMENJENO: Objavljivanje — checkbox u konfiguratoru, bez naplate */
  {
    id: toId("Da li objavljujete naše fotografije na mrežama?"),
    q: "Da li objavljujete naše fotografije na mrežama?",
    aText:
      "Delimo selekciju radova kao deo portfolija, ali poštujemo vaš izbor. U konfiguratoru postoji besplatna opcija da označite da se vaše fotografije ne objavljuju.",
    aJSX: (
      <>
        Delimo selekciju radova kao deo portfolija, ali uvek poštujemo <strong>privatnost</strong> i vaš izbor.
        U <Link className="link" href="/ponude">konfiguratoru</Link> postoji <strong>besplatna opcija</strong>{" "}
        da označite <em>“ne objavljuj u portfoliju / na mrežama”</em>.
      </>
    ),
  },

  /** IZMENJENO: Odlaganje / otkazivanje — 30+ dana besplatno, ispod 30 dana 25% */
  {
    id: toId("Šta ako moramo da odložimo ili otkažemo?"),
    q: "Šta ako moramo da odložimo ili otkažemo?",
    aText:
      "Odlaganje/otkazivanje bez naknade ako je više od 30 dana do termina. Ako je 30 dana ili manje do termina, naplaćuje se 25% od ukupne cene.",
    aJSX: (
      <>
        Ako je do zakazanog termina ostalo <strong>više od 30 dana</strong> — odlaganje/otkazivanje je{" "}
        <strong>bez naknade</strong>. Ako je <strong>30 dana ili manje</strong> — naplaćuje se{" "}
        <strong>25% od ukupne cene</strong>.
      </>
    ),
  },

  {
    id: toId("Koliko unapred treba da rezervišemo?"),
    q: "Koliko unapred treba da rezervišemo?",
    aText:
      "Za prolećne/letnje termine — što pre, često 6–12 meseci unapred. Za portrete i porodične sesije obično je dovoljno 2–4 nedelje ranije.",
    aJSX: (
      <>
        Za prolećne/letnje termine — što pre, često <strong>6–12 meseci</strong> unapred. Za portrete i
        porodične sesije obično je dovoljno <strong>2–4 nedelje</strong> ranije.
      </>
    ),
  },

  {
    id: toId("Gde možemo da vidimo pun portfolio?"),
    q: "Gde možemo da vidimo pun portfolio?",
    aText:
      "Na stranici Portfolio imate kategorije sa albumima. Kliknite da okrenete strane i pogledate cele priče.",
    aJSX: (
      <>
        Na stranici <Link className="link" href="/portfolio">Portfolio</Link> imate kategorije sa albumima.
        Kliknite da okrenete strane i pogledate cele priče.
      </>
    ),
  },

  {
    id: toId("Kako da pošaljemo upit?"),
    q: "Kako da pošaljemo upit?",
    aText:
      "Najbrže preko kontakt stranice ili konfiguratora ponuda — pošaljite datum, lokaciju i okvirne informacije i javljamo se sa raspoloživošću i ponudom.",
    aJSX: (
      <>
        Najbrže preko <Link className="link" href="/kontakt">kontakt stranice</Link> ili{" "}
        <Link className="link" href="/ponude">konfiguratora ponuda</Link> — pošaljite datum, lokaciju i okvirne
        informacije i javljamo se sa raspoloživošću i ponudom.
      </>
    ),
  },
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.aText },
    })),
  };

  const lite: FaqLite[] = FAQ.map(({ id, q, aJSX }) => ({ id, q, aJSX }));

  return (
    <>
      <Navbar />
      <main className="section pt-16 md:pt-24">
        <Container className="!max-w-[1480px] md:!px-8">
          {/* Zaglavlje — editorial split: naslov levo, uvod desno */}
          <Reveal>
            <div className="grid gap-6 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <span className="eyebrow">FAQ</span>
                <h1 className="display-2 mt-4 max-w-[14ch]">
                  Česta <em className="serif-italic">pitanja</em>
                </h1>
              </div>
              <div className="md:col-span-5 md:pb-2">
                <p className="lead max-w-sm leading-relaxed md:ml-auto">
                  Kratak vodič kroz najvažnije informacije — ako vam nešto nije
                  jasno, <Link href="/kontakt" className="link">pišite nam</Link>.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Sadržaj — brzi skok levo (sticky), pitanja desno */}
          <div className="mt-12 grid gap-12 border-t border-[var(--border)] pt-10 md:mt-16 md:grid-cols-12 md:gap-8 md:pt-14">
            <Reveal className="md:col-span-4 lg:col-span-3">
              <nav aria-label="Brzi skok" className="md:sticky md:top-28">
                <span className="meta-caps">Brzi skok</span>
                <ul className="mt-5 space-y-2.5">
                  {FAQ.map((f, i) => (
                    <li key={f.id} className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-[9px] tracking-[0.25em] text-[var(--accent-strong)]"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <a href={`#${f.id}`} className="link text-[13px] leading-snug text-[var(--muted)]">
                        {f.q}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>

            {/* Lista pitanja (client) */}
            <Reveal delay={120} className="md:col-span-8 lg:col-span-8 lg:col-start-5">
              <FaqListClient items={lite} />

              <div className="mt-12 flex justify-center md:mt-14">
                <Link href="/ponude" className="btn-text">
                  Sastavite svoju ponudu
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Footer />
    </>
  );
}
