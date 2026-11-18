import type { Metadata } from "next";
import Link from "next/link";
import MaterialIcon, { materialIcons } from "@/components/MaterialIcon";
import PointCard from "@/components/map/PointCard";
import { mapPoints, pointCategories, pointCategoryCounts, pointTypes, visiblePointCategories, type MapPoint } from "@/components/map/map-points";
import FilterPreview from "./FilterPreview";
import styles from "./design-system.module.css";

export const metadata: Metadata = {
  title: "Design systém | GTA VI Interaktivní mapa",
  description: "Barvy, 4px mřížka, typografie a komponenty české interaktivní mapy GTA VI.",
};

const sections = [
  { id: "komponenty", label: "Komponenty" },
  { id: "barvy", label: "Barvy" },
  { id: "rozestupy", label: "Rozestupy" },
  { id: "typografie", label: "Typografie" },
];

const palette = [
  { name: "Voda mapy", token: "--map-water" },
  { name: "Skleněný panel", token: "--glass-base" },
  { name: "Hlavní text", token: "--glass-ink" },
  { name: "Vedlejší text", token: "--glass-muted" },
  { name: "Zapnutý přepínač", token: "--map-switch-on" },
  { name: "Sdílení místa", token: "--point-action" },
  { name: "Okraj panelu", token: "--glass-edge" },
];

const spacing = [
  { size: 4, use: "Vnitřní odsazení lišty tlačítek" },
  { size: 8, use: "Mezera mezi řádky filtrů" },
  { size: 12, use: "Mezera mezi vzorkem a textem v legendě" },
  { size: 16, use: "Vnitřní odsazení panelu" },
  { size: 20, use: "Okraj mapy na desktopu" },
  { size: 24, use: "Mezera mezi oddíly legendy" },
  { size: 32, use: "Odsazení náhledu komponent na desktopu" },
];

const typography = [
  { style: "displaySample", text: "Mapa Leonidy", role: "Velký nadpis", metrics: "40–72 / 44–80 px · 700" },
  { style: "headingSample", text: "Komponenty", role: "Nadpis sekce", metrics: "24 / 32 px · 700" },
  { style: "inputSample", text: "Místo nebo typ", role: "Běžný text a vstupy", metrics: "16 / 24 px · 400" },
  { style: "titleSample", text: "GTA VI Interaktivní mapa", role: "Název mapy", metrics: "15 / 20 px · 750" },
  { style: "controlSample", text: "Filtry", role: "Ovládací prvky", metrics: "14 / 20 px · 600" },
  { style: "captionSample", text: "Přibližná poloha", role: "Popisky", metrics: "12 / 16 px · 400" },
];

const cardExample = mapPoints.find(({ id }) => id === "L298");
const countFormat = new Intl.NumberFormat("cs-CZ");
const pinGroups = visiblePointCategories.map((category) => {
  const types = new Map<MapPoint["type"], number>();
  for (const point of mapPoints) {
    if (point.category === category) types.set(point.type, (types.get(point.type) ?? 0) + 1);
  }
  return { category, types: [...types].sort(([a], [b]) => pointTypes[a].label.localeCompare(pointTypes[b].label, "cs")) };
});

export default function DesignSystemPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.mapLink}>
            <MaterialIcon name="arrow_back" />
            Zpět na mapu
          </Link>
          <nav aria-label="Sekce design systému" className={styles.navigation}>
            {sections.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Design <span>systém</span></h1>
          <p>Barvy, typografie, 4px mřížka a ovládací prvky interaktivní mapy GTA VI.</p>
        </div>

        <section id="komponenty" className={styles.section}>
          <h2>Komponenty</h2>
          <FilterPreview />
          <div className={styles.icons}>
            <h3>Značky na mapě</h3>
            <p>{countFormat.format(mapPoints.length)} bodů podle kategorie a typu</p>
            {pinGroups.map(({ category, types }) => (
              <section key={category} className={styles.pinGroup}>
                <h4>{pointCategories[category]} · {countFormat.format(pointCategoryCounts[category])}</h4>
                <ul className={styles.iconGrid}>
                  {types.map(([type, count]) => (
                    <li key={type}>
                      <span className={`map-pin map-pin-${category} ${styles.pinExample}`}>
                        <MaterialIcon name={pointTypes[type].icon} />
                      </span>
                      <span>{pointTypes[type].label}</span>
                      <code>{countFormat.format(count)}</code>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {cardExample && (
            <div id="karta-mista" className={styles.pointCardExample}>
              <h3>Karta místa</h3>
              <div className={`map-glass ${styles.pointCardSurface}`}>
                <PointCard point={cardExample} />
              </div>
            </div>
          )}
          <div className={styles.icons}>
            <h3>Ikony</h3>
            <p>Google Material Symbols Rounded · 20 px</p>
            <ul className={styles.iconGrid}>
              {materialIcons.map(({ name, label }) => (
                <li key={name}>
                  <MaterialIcon name={name} />
                  <span>{label}</span>
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="barvy" className={styles.section}>
          <h2>Barvy</h2>
          <ul className={styles.palette}>
            {palette.map(({ name, token }) => (
              <li className={styles.colorCard} key={token}>
                <span className={styles.swatch} style={{ backgroundColor: `var(${token})` }} />
                <strong>{name}</strong>
                <code>{token}</code>
              </li>
            ))}
          </ul>
        </section>

        <section id="rozestupy" className={styles.section}>
          <h2>Rozestupy</h2>
          <ul className={styles.spacingList}>
            {spacing.map(({ size, use }) => (
              <li key={size}>
                <span className={styles.spacingGuide} aria-hidden="true">
                  <span style={{ width: `var(--space-${size / 4})` }} />
                </span>
                <strong>{size} px</strong>
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="typografie" className={styles.section}>
          <h2>Typografie</h2>
          <p className={styles.sectionIntro}>Onest · velikost písma / výška řádku · váha</p>
          <ul className={styles.typeList}>
            {typography.map(({ style, text, role, metrics }) => (
              <li key={style}>
                <p className={styles[style]}>{text}</p>
                <div>
                  <strong>{role}</strong>
                  <code>{metrics}</code>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
