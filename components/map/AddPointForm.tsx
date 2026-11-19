"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addPoint } from "@/app/admin/actions";
import { mapLocationParams, type MapLocation } from "@/lib/map-location";
import { isPublishedPointType, pointCategories, pointTypes, visiblePointCategories, type MapPoint } from "./map-points";

const types = Object.keys(pointTypes)
  .filter(isPublishedPointType)
  .sort((a, b) => pointTypes[a].label.localeCompare(pointTypes[b].label, "cs"));

export default function AddPointForm({ location, onAdded, inDialog = false }: {
  location: MapLocation;
  onAdded: (point: MapPoint) => void;
  inDialog?: boolean;
}) {
  const [result, action, pending] = useActionState(addPoint, null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!inDialog) nameInput.current?.focus({ preventScroll: true });
  }, [inDialog]);

  useEffect(() => {
    if (result && "point" in result) onAdded(result.point);
  }, [result, onAdded]);

  const form = (
    <form action={action} className="point-editor">
      {Array.from(mapLocationParams(location), ([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="point-card-detail point-editor-fields">
        <label>
          Název
          <input ref={nameInput} name="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Kategorie
          <select name="category" required value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="" disabled>Vyber kategorii</option>
            {visiblePointCategories.map((value) => <option key={value} value={value}>{pointCategories[value]}</option>)}
          </select>
        </label>
        <label>
          Typ místa
          <select name="type" required value={type} onChange={(event) => setType(event.target.value)}>
            <option value="" disabled>Vyber typ místa</option>
            {types.map((value) => <option key={value} value={value}>{pointTypes[value].label}</option>)}
          </select>
        </label>
        <label>
          Popis (nepovinný)
          <textarea name="description" rows={2} maxLength={3000} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
      </div>
      {result && "error" in result && <p className="point-editor-error" role="alert">{result.error}</p>}
      <div className="point-share point-share-actions">
        <button type="submit" disabled={pending}>{pending ? "Ukládá se…" : "Přidat na mapu"}</button>
      </div>
    </form>
  );

  if (inDialog) return form;

  return (
    <section className="point-card" aria-labelledby="add-point-heading">
      <header className="point-card-heading">
        <h2 id="add-point-heading">Přidat bod</h2>
      </header>
      {form}
    </section>
  );
}
