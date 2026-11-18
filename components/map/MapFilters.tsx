import { pointCategories, visiblePointCategories, type PointCategory } from "./map-points";

export type MapFiltersProps = {
  selectedCategories: Record<PointCategory, boolean>;
  onCategoryChange: (category: PointCategory, checked: boolean) => void;
  categoryCounts?: Record<PointCategory, number>;
};

const countFormat = new Intl.NumberFormat("cs-CZ");

export default function MapFilters({ selectedCategories, onCategoryChange, categoryCounts }: MapFiltersProps) {
  return (
    <fieldset className="map-filters">
      <legend>Kategorie bodů</legend>
      <div className="map-filter-options">
        {visiblePointCategories.map((category) => (
          <label className="map-filter-option" key={category}>
            <span className={`point-symbol point-${category}`} aria-hidden="true" />
            <span>{pointCategories[category]}</span>
            {categoryCounts && <span className="map-filter-count">{countFormat.format(categoryCounts[category])}</span>}
            <input
              className="map-switch"
              type="checkbox"
              role="switch"
              checked={selectedCategories[category]}
              onChange={(event) => onCategoryChange(category, event.target.checked)}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
