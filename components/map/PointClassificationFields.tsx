"use client";

import { useState, useSyncExternalStore } from "react";
import {
  getPointTypes,
  isPublishedPointCategory,
  pointCategories,
  pointTypes,
  publishedPointCategories,
  readPointClassification,
  type MapPoint,
  type PublishedPointCategory,
  type PublishedPointType,
} from "./map-points";

type PointClassificationFieldsProps = {
  initial?: Pick<MapPoint, "category" | "type">;
  required?: boolean;
  fieldClassName?: string;
  report?: boolean;
};

const subscribeToNothing = () => () => {};
const getClientReady = () => true;
const getServerReady = () => false;

export default function PointClassificationFields({
  initial,
  required = false,
  fieldClassName,
  report = false,
}: PointClassificationFieldsProps) {
  const canSelect = useSyncExternalStore(subscribeToNothing, getClientReady, getServerReady);
  const [category, setCategory] = useState<PublishedPointCategory | "">(
    isPublishedPointCategory(initial?.category) ? initial.category : "",
  );
  const [type, setType] = useState<PublishedPointType | "">(
    () => readPointClassification(initial?.category, initial?.type)?.type ?? "",
  );
  const types = category ? getPointTypes(category) : [];

  return (
    <>
      <label className={fieldClassName}>
        {required ? "Kategorie" : "Kategorie (nepovinná)"}
        <select
          name={report ? undefined : "category"}
          required={required}
          disabled={!canSelect}
          value={category}
          onChange={(event) => {
            const value = event.target.value;
            setCategory(isPublishedPointCategory(value) ? value : "");
            setType("");
          }}
        >
          <option value="" disabled={required}>Vyber kategorii</option>
          {publishedPointCategories.map((value) => <option key={value} value={value}>{pointCategories[value].label}</option>)}
        </select>
      </label>
      <label className={fieldClassName}>
        Typ místa
        <select
          name={report ? undefined : "type"}
          required={Boolean(category)}
          disabled={!canSelect || !category}
          value={type}
          onChange={(event) => setType(readPointClassification(category, event.target.value)?.type ?? "")}
        >
          <option value="" disabled>{category ? "Vyber typ místa" : "Nejdřív vyber kategorii"}</option>
          {types.map((value) => <option key={value} value={value}>{pointTypes[value].label}</option>)}
        </select>
      </label>
      {report && category && type && (
        <>
          <input type="hidden" name="Navržená kategorie" value={pointCategories[category].label} />
          <input type="hidden" name="Navržený typ místa" value={pointTypes[type].label} />
        </>
      )}
    </>
  );
}
