"use client";

import { useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import MapFilters from "@/components/map/MapFilters";
import { getMapFilterType, updateHiddenFilterTypes, type MapFilterType } from "@/components/map/map-filter-groups";
import { pointCategories, pointTypes } from "@/components/map/map-points";
import styles from "./design-system.module.css";

const previewPins = [
  { category: "nature", type: "mountain", left: "58%", top: "30%" },
  { category: "landmark", type: "bar", left: "28%", top: "56%" },
  { category: "city", type: "clothingStore", left: "73%", top: "68%" },
  { category: "hairdresser", type: "hairSalon", left: "47%", top: "79%" },
] as const;

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
            {visiblePins.map(({ category, type, left, top }) => (
              <li
                key={category}
                className={`map-pin map-pin-${category} ${styles.pin}`}
                style={{ left, top }}
                aria-label={pointCategories[category]}
              >
                <MaterialIcon name={pointTypes[type].icon} />
              </li>
            ))}
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
