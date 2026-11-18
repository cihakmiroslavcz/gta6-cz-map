"use client";

import { useActionState, useState } from "react";
import { isPublishedPointType, pointCategories, pointTypes, visiblePointCategories } from "@/components/map/map-points";
import { reviewSuggestion } from "./actions";
import styles from "./admin.module.css";

const types = Object.keys(pointTypes)
  .filter(isPublishedPointType)
  .sort((a, b) => pointTypes[a].label.localeCompare(pointTypes[b].label, "cs"));

export default function SuggestionReviewForm({ id, name, description }: { id: string; name: string; description: string }) {
  const [error, action, pending] = useActionState(reviewSuggestion, null);
  const [title, setTitle] = useState(name);
  const [details, setDetails] = useState(description);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  return (
    <details className={styles.review}>
      <summary>Posoudit návrh</summary>
      <form action={action} className={styles.login}>
        <input type="hidden" name="suggestionId" value={id} />
        <label>
          Název na mapě
          <input name="name" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Popis na mapě
          <textarea name="description" required maxLength={3000} rows={4} value={details} onChange={(event) => setDetails(event.target.value)} />
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
        {error && <p role="alert">{error}</p>}
        <div className={styles.toolbar}>
          <button type="submit" name="decision" value="approved" className={styles.primary} disabled={pending}>
            Schválit a přidat na mapu
          </button>
          <button type="submit" name="decision" value="rejected" className={styles.control} disabled={pending} formNoValidate>
            Zamítnout
          </button>
        </div>
      </form>
    </details>
  );
}
