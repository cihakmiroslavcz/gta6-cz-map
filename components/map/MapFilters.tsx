"use client";

import { useId, useMemo, useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import { getMapFilterGroups, type MapFilterType } from "./map-filter-groups";
import { pointTypes, type MapPoint } from "./map-points";

export type MapFiltersProps = {
  points: readonly Pick<MapPoint, "type">[];
  hiddenTypes: ReadonlySet<MapFilterType>;
  onTypesChange: (types: readonly MapFilterType[], visible: boolean) => void;
};

type FilterGroup = ReturnType<typeof getMapFilterGroups>[number];
const countFormat = new Intl.NumberFormat("cs-CZ");

function MapFilterGroup({ group, hiddenTypes, onTypesChange }: { group: FilterGroup } & Omit<MapFiltersProps, "points">) {
  const controlsId = useId();
  const [expanded, setExpanded] = useState(false);
  const total = group.rows.reduce((count, row) => count + row.count, 0);
  const visible = group.rows.reduce((count, row) => count + (hiddenTypes.has(row.type) ? 0 : row.count), 0);

  return (
    <section className="map-filter-group" data-category={group.id} aria-label={group.label}>
      <div className="map-filter-group-header">
        <button
          type="button"
          className="map-filter-expand"
          aria-expanded={expanded}
          aria-controls={controlsId}
          aria-label={`${group.label}, ${visible} z ${total} bodů zobrazeno`}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="map-filter-group-icon"><MaterialIcon name={group.icon} /></span>
          <span>{group.label}</span>
          <span className="map-filter-count" aria-hidden="true">{countFormat.format(visible)}/{countFormat.format(total)}</span>
          <span className="map-filter-chevron" aria-hidden="true" />
        </button>
        <label className="map-filter-toggle">
          <input
            className="map-switch"
            type="checkbox"
            checked={visible === total}
            aria-label={`Zobrazit skupinu ${group.label}`}
            ref={(input) => { if (input) input.indeterminate = visible > 0 && visible < total; }}
            onChange={(event) => onTypesChange(group.rows.map(({ type }) => type), event.target.checked)}
          />
        </label>
      </div>
      <ul id={controlsId} className="map-filter-rows" hidden={!expanded}>
        {group.rows.map(({ type, count }) => (
          <li key={type}>
            <label className="map-filter-row" data-type={type}>
              <span className="map-filter-row-icon"><MaterialIcon name={pointTypes[type].icon} /></span>
              <span>{type === "hairSalon" ? "Kadeřnictví a holičství" : pointTypes[type].label}</span>
              <span className="map-filter-count" aria-hidden="true">{countFormat.format(count)}</span>
              <input
                className="map-switch"
                type="checkbox"
                role="switch"
                checked={!hiddenTypes.has(type)}
                onChange={(event) => onTypesChange([type], event.target.checked)}
              />
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function MapFilters({ points, hiddenTypes, onTypesChange }: MapFiltersProps) {
  const groups = useMemo(() => getMapFilterGroups(points), [points]);

  return (
    <fieldset className="map-filters">
      <legend>Kategorie bodů</legend>
      {groups.length > 0 ? (
        <div className="map-filter-options">
          {groups.map((group) => (
            <MapFilterGroup key={group.id} group={group} hiddenTypes={hiddenTypes} onTypesChange={onTypesChange} />
          ))}
        </div>
      ) : <p>Na mapě zatím nejsou žádné body.</p>}
    </fieldset>
  );
}
