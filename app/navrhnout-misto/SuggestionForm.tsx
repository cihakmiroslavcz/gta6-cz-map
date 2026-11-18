"use client";

import { useActionState, useState } from "react";
import styles from "@/app/map-feedback.module.css";
import { mapLocationParams, type MapLocation } from "@/lib/map-location";
import { submitSuggestion } from "./actions";

export default function SuggestionForm({ location }: { location: MapLocation }) {
  const [result, action, pending] = useActionState(submitSuggestion, null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const coordinates = `X ${location.x.toFixed(3)}, Y ${location.y.toFixed(3)}`;

  if (result?.saved) return <p role="status">Díky! Návrh byl uložen a správce mapy si ho může prohlédnout.</p>;

  return (
    <form className={styles.form} action={action} aria-label="Návrh místa">
      <dl className={styles.point}>
        <div>
          <dt>Herní souřadnice</dt>
          <dd>{coordinates}</dd>
        </div>
      </dl>
      {Array.from(mapLocationParams(location), ([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div className={styles.field}>
        <label htmlFor="suggest-name">Název místa</label>
        <input
          id="suggest-name"
          name="name"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="suggest-description">Co na tomto místě je?</label>
        <textarea
          id="suggest-description"
          name="description"
          rows={5}
          required
          maxLength={3000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      {result && <p role="alert">{result.error}</p>}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Ukládá se…" : "Odeslat návrh"}
      </button>
    </form>
  );
}
