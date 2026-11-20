"use client";

import { useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import MapFilters from "@/components/map/MapFilters";
import { getMapFilterType, updateHiddenFilterTypes, type MapFilterType } from "@/components/map/map-filter-groups";
import { pointCategories, pointTypes, type PublishedPointType } from "@/components/map/map-points";
import styles from "./design-system.module.css";

const previewPins = [
  { type: "mountain", left: "58%", top: "30%" },
  { type: "gunShop", left: "28%", top: "56%" },
  { type: "clothingStore", left: "73%", top: "68%" },
  { type: "hairSalon", left: "47%", top: "79%" },
  { type: "restaurant", left: "40%", top: "38%" },
  { type: "gasStation", left: "66%", top: "47%" },
] satisfies readonly { type: PublishedPointType; left: string; top: string }[];

export default function FilterPreview() {
  const [hiddenTypes, setHiddenTypes] = useState<ReadonlySet<MapFilterType>>(() => new Set());
  const visiblePins = previewPins.filter(({ type }) => !hiddenTypes.has(getMapFilterType(type)));

  return (
    <div className={`map-glass ${styles.preview}`}>
      <div className={styles.filterDemo}>
        <h3>Filtry</h3>
        <p>Zapni nebo vypni kategorii a sleduj značky v náhledu.</p>
        <MapFilters
          points={previewPins}
          hiddenTypes={hiddenTypes}
          onTypesChange={(types, visible) =>
            setHiddenTypes((previous) => updateHiddenFilterTypes(previous, types, visible))
          }
        />
      </div>

      <figure className={styles.mapPreview}>
        <div
          className={styles.mapScene}
          style={{ backgroundImage: 'url("/maps/tiles/6/yanis,18/0/0,1,1.jpg")' }}
        >
          <ul aria-label="Značky v náhledu" className={styles.previewPins}>
            {visiblePins.map(({ type, left, top }) => {
              const { category, icon, label } = pointTypes[type];
              return (
                <li
                  key={type}
                  className={`map-pin map-pin-${category} ${styles.pin}`}
                  style={{ left, top }}
                  aria-label={`${pointCategories[category].label}, ${label}`}
                >
                  <MaterialIcon name={icon} />
                </li>
              );
            })}
          </ul>
          <span className={`map-glass ${styles.previewStatus}`} role="status">
            Zobrazené značky {visiblePins.length} z {previewPins.length}
          </span>
        </div>
        <figcaption>
          Yanis V18 · <a href="/maps/yanis-v18-kredity.jpg">Kredity</a> ·{" "}
          <a href="https://github.com/rolux/gtadb.org">GTADB</a> ·{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </figcaption>
      </figure>
    </div>
  );
}
