"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import { mapContactEmail } from "@/lib/map-contact";
import { isMapPointId } from "@/lib/map-point-id";
import MapFilters, { type MapFiltersProps } from "./MapFilters";
import { indexMapAreas, normalizeSearch, searchMapAreas, type MapArea } from "./map-area-search";
import type { BaseMap, LeonidaStatus, LeonidaVariant } from "./map-basemaps";
import { getMapFilterType } from "./map-filter-groups";
import { pointCategories, pointTypes, type MapPoint } from "./map-points";

const legendSections = [
  {
    title: "Silnice a železnice",
    items: [
      { label: "Dálnice", swatch: 0 },
      { label: "Silnice", swatch: 1 },
      { label: "Ulička", swatch: 2 },
      { label: "Pěšina", swatch: 3 },
      { label: "Nezpevněná cesta", swatch: 4 },
      { label: "Železnice", swatch: 5 },
      { label: "Městská železnice (Metrorail)", swatch: 6 },
      { label: "Městská dráha (Metromover)", swatch: 7 },
    ],
  },
  {
    title: "Terén",
    items: [
      { label: "Průmyslová zóna", swatch: 8 },
      { label: "Městská zástavba", swatch: 9 },
      { label: "Park", swatch: 10 },
      { label: "Pláž a písek", swatch: 11 },
      { label: "Mokřady", swatch: 12 },
      { label: "Zemědělská půda", swatch: 13 },
    ],
  },
];

type MapToolsProps = Omit<MapFiltersProps, "points"> & {
  points: MapPoint[];
  canManagePoints: boolean;
  onPointSelect: (point: MapPoint) => void;
  onAreaSelect: (area: MapArea) => void;
  clustering: boolean;
  onClusteringChange: (enabled: boolean) => void;
  basemap: {
    selected: BaseMap;
    onSelect: (basemap: BaseMap) => void;
    officialAvailable: boolean;
    officialStatus: LeonidaStatus;
    variants: LeonidaVariant[];
    variant: LeonidaVariant;
    onVariantChange: (variant: LeonidaVariant) => void;
    tileError: boolean;
    comparing: boolean;
    onComparisonChange: (enabled: boolean) => void;
    opacity: number;
    onOpacityChange: (opacity: number) => void;
  };
};

function BasemapSettings({
  selected, onSelect, officialAvailable, officialStatus, variants, variant,
  onVariantChange, tileError, comparing, onComparisonChange, opacity, onOpacityChange,
}: MapToolsProps["basemap"]) {
  const showOfficial = selected === "official" || comparing;

  return (
    <div className="map-settings-section map-basemap-settings">
      <h3 id="map-basemap-title">Mapový podklad</h3>
      <div className="map-basemap-options" role="radiogroup" aria-labelledby="map-basemap-title">
        {([
          { value: "community", label: "Neoficiální mapa" },
          { value: "official", label: "Oficiální mapa" },
        ] as const).map(({ value, label }) => (
          <label className="map-basemap-option" key={value}>
            <input
              type="radio"
              name="map-basemap"
              value={value}
              checked={selected === value}
              disabled={value === "official" && !officialAvailable}
              onChange={() => onSelect(value)}
            />
            {label}
          </label>
        ))}
      </div>
      {officialStatus === "unavailable" && <p role="status">Oficiální mapa je momentálně nedostupná.</p>}
      {showOfficial && officialStatus === "loading" && <p role="status">Načítám oficiální mapu…</p>}
      {showOfficial && tileError && <p role="status">Některé dlaždice chybí. Místo nich se zobrazuje náhled.</p>}
      <label className="map-filter-option">
        <span>Překrýt podklady</span>
        <input
          className="map-switch"
          type="checkbox"
          role="switch"
          checked={comparing}
          disabled={!officialAvailable}
          onChange={(event) => onComparisonChange(event.target.checked)}
        />
      </label>
      {comparing && (
        <label className="map-basemap-control">
          <span>Krytí oficiální mapy <output>{opacity} %</output></span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            aria-label="Krytí oficiální mapy"
            onChange={(event) => onOpacityChange(event.target.valueAsNumber)}
          />
        </label>
      )}
      {showOfficial && variants.length > 1 && (
        <label className="map-basemap-control">
          <span>Rozlišení oficiální mapy</span>
          <select value={variant} onChange={(event) => {
            const next = variants.find((value) => String(value) === event.target.value);
            if (next) onVariantChange(next);
          }}>
            {variants.map((value) => (
              <option key={value} value={value}>{value === 1 ? "Původní (1×)" : `Zvětšené (${value}×)`}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

function indexPoint(point: MapPoint) {
  const { label, aliases } = pointTypes[point.type];
  return {
    point,
    searchText: normalizeSearch([
      point.id, point.name, point.sourceName, point.location, label, pointCategories[point.category].label, ...aliases,
    ].join(" ")),
  };
}

const searchLimit = 40;
const areaSearchLimit = 6;

export default function MapTools({
  points,
  canManagePoints,
  hiddenTypes,
  onTypesChange,
  onPointSelect,
  onAreaSelect,
  clustering,
  onClusteringChange,
  basemap,
}: MapToolsProps) {
  const [openPanel, setOpenPanel] = useState<"search" | "filters" | "legend" | "settings" | null>(null);
  const [query, setQuery] = useState("");
  const searchPanel = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchablePoints = useMemo(() => points.map(indexPoint), [points]);
  const searchableAreas = useMemo(() => indexMapAreas(points), [points]);
  const searchTerm = normalizeSearch(query);
  const searchWords = searchTerm.split(" ");
  const exactPoint = isMapPointId(searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1))
    ? points.find(({ id }) => id.toLowerCase() === searchTerm)
    : undefined;
  const results = exactPoint ? [exactPoint] : searchTerm
    ? searchablePoints
      .filter(({ searchText }) => searchWords.every((word) => searchText.includes(word)))
      .map(({ point }) => point)
    : [];
  const areaResults = exactPoint ? [] : searchMapAreas(searchableAreas, searchTerm);

  useEffect(() => {
    if (openPanel !== "search") return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !searchPanel.current?.contains(event.target)) {
        setOpenPanel(null);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress, true);
  }, [openPanel]);

  function closeSearch() {
    setOpenPanel(null);
    searchInput.current?.blur();
  }

  function selectPoint(point: MapPoint) {
    onPointSelect(point);
    closeSearch();
  }

  function selectArea(area: MapArea) {
    onAreaSelect(area);
    closeSearch();
  }

  return (
    <aside className="map-hud" aria-label="Nástroje mapy">
      <div className="map-search" ref={searchPanel}>
        <form
          className="map-search-field map-glass"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (areaResults[0]) selectArea(areaResults[0]);
            else if (results[0]) selectPoint(results[0]);
          }}
        >
          <MaterialIcon name="search" />
          <input
            id="map-search-input"
            ref={searchInput}
            type="search"
            aria-label="Hledat místo, oblast nebo typ"
            aria-controls="map-search-panel"
            placeholder="Místo nebo oblast"
            value={query}
            onFocus={() => setOpenPanel("search")}
            onClick={() => setOpenPanel("search")}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenPanel("search");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpenPanel(null);
            }}
          />
        </form>
        <div
          id="map-search-panel"
          className="map-tools-panel map-glass map-search-results"
          hidden={openPanel !== "search" || !searchTerm}
        >
          {areaResults.length > 0 && (
            <ul aria-label="Nalezené oblasti">
              {areaResults.slice(0, areaSearchLimit).map((area) => (
                <li key={area.key}>
                  <button className="map-search-area" type="button" onClick={() => selectArea(area)}>
                    <MaterialIcon name="map" />
                    <span>{area.name}<small>Oblast na mapě</small></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <ul aria-label="Výsledky hledání">
              {results.slice(0, searchLimit).map((point) => (
                <li key={point.id}>
                  <button type="button" onClick={() => selectPoint(point)}>
                    {point.name}
                    <small>{point.sourceName && point.location ? point.location : pointTypes[point.type].label}</small>
                    {hiddenTypes.has(getMapFilterType(point.type)) && (
                      <small>Skryto filtrem · výběr zapne podkategorii</small>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {areaResults.length === 0 && results.length === 0 && (
            <p className="map-search-empty" role="status">Žádné místo nenalezeno.</p>
          )}
          {results.length > searchLimit && (
            <p className="map-search-empty" role="status">
              Zobrazeno {searchLimit} z {results.length} výsledků. Hledání můžeš upřesnit názvem nebo oblastí.
            </p>
          )}
        </div>
      </div>
      <div className="map-tools">
        <div className="map-tools-buttons map-glass">
          <button
            type="button"
            aria-label="Filtry"
            aria-controls="map-filter-panel"
            aria-expanded={openPanel === "filters"}
            onClick={() => setOpenPanel(openPanel === "filters" ? null : "filters")}
          >
            <MaterialIcon name="filter_list" />
            <span className="map-tool-label">Filtry</span>
          </button>
          <button
            type="button"
            aria-label="Legenda"
            aria-controls="map-legend-panel"
            aria-expanded={openPanel === "legend"}
            onClick={() => setOpenPanel(openPanel === "legend" ? null : "legend")}
          >
            <MaterialIcon name="map" />
            <span className="map-tool-label">Legenda</span>
          </button>
          <button
            type="button"
            aria-label="Nastavení"
            aria-controls="map-settings-panel"
            aria-expanded={openPanel === "settings"}
            onClick={() => setOpenPanel(openPanel === "settings" ? null : "settings")}
          >
            <MaterialIcon name="settings" />
            <span className="map-tool-label">Nastavení</span>
          </button>
        </div>
        <div id="map-filter-panel" className="map-tools-panel map-filter-panel map-glass" hidden={openPanel !== "filters"}>
          <MapFilters
            points={points}
            hiddenTypes={hiddenTypes}
            onTypesChange={onTypesChange}
          />
        </div>
        <div id="map-legend-panel" className="map-tools-panel map-glass" hidden={openPanel !== "legend"}>
          {legendSections.map(({ title, items }) => (
            <section className="map-legend-section" key={title}>
              <h2>{title}</h2>
              <ul>
                {items.map(({ label, swatch }) => (
                  <li key={swatch}>
                    <span
                      className="legend-swatch"
                      style={{ backgroundPositionY: `calc(var(--legend-swatch-height) * ${-swatch})` }}
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <section
          id="map-settings-panel"
          className="map-settings-panel map-tools-panel map-glass"
          aria-labelledby="map-settings-title"
          hidden={openPanel !== "settings"}
        >
          <h2 id="map-settings-title">Nastavení</h2>
          <label className="map-filter-option">
            <span>Seskupovat značky při oddálení</span>
            <input
              className="map-switch"
              type="checkbox"
              role="switch"
              checked={clustering}
              onChange={(event) => onClusteringChange(event.target.checked)}
            />
          </label>
          <BasemapSettings {...basemap} />
          {canManagePoints && (
            <div className="map-settings-section">
              <h3>Administrace</h3>
              <p><a href="/admin">Správa skrytých bodů</a></p>
            </div>
          )}
          <div className="map-settings-section">
            <h3>O projektu</h3>
            <p>
              GTA VI Interaktivní mapa je neoficiální fanouškovský projekt. Není spojený
              se společnostmi Rockstar Games ani Take-Two Interactive Software, Inc.
            </p>
            <p>
              <a href="https://www.rockstargames.com/">Rockstar Games</a> a{" "}
              <a href="https://www.rockstargames.com/gta-vi">Grand Theft Auto</a> jsou ochranné
              známky společnosti <a href="https://www.take2games.com/">Take-Two Interactive Software, Inc.</a>
            </p>
          </div>
          <div className="map-settings-section">
            <h3>Kontakt</h3>
            <p>
              Dotazy, připomínky a návrhy na doplnění mapy nám můžeš poslat na{" "}
              <a href={`mailto:${mapContactEmail}`}>{mapContactEmail}</a>.
            </p>
          </div>
          <div className="map-settings-section">
            <h3>Kredity</h3>
            <p>
              Mapový podklad <a href="/maps/yanis-v18-kredity.jpg">Yanis V18 a kredity autorů</a>.{" "}
              © 2025–2026 <a href="https://map.gtadb.org/">GTADB.ORG a přispěvatelé</a>. Licence{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
              Původní postranní panel mapy je zakrytý.
            </p>
            <p>
              Oficiální mapa Leonidy © Rockstar Games.{" "}
              <a href="https://www.rockstargames.com/VI/media/artwork-wallpapers">Stáhnout mapu u Rockstar Games</a>.
            </p>
            <p>
              Data bodů vytvořili <a href="https://github.com/rolux/gtadb.org/blob/main/map/data/6/landmarks.json">GTADB
              a přispěvatelé</a> pod licencí{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Kategorie a popisky jsou upravené.
            </p>
          </div>
          <footer className="map-settings-copyright">
            © 2026 GTA VI Interaktivní mapa · Rozhraní a české texty
          </footer>
        </section>
      </div>
    </aside>
  );
}
