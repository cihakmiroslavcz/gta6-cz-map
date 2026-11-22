"use client";

import { useActionState, useState } from "react";
import PointClassificationFields from "@/components/map/PointClassificationFields";
import type { PointClassification } from "@/components/map/map-points";
import { reviewSuggestion } from "./actions";
import styles from "./admin.module.css";

export default function SuggestionReviewForm({
  id,
  name,
  description,
  classification,
}: {
  id: string;
  name: string;
  description: string;
  classification: PointClassification | null;
}) {
  const [error, action, pending] = useActionState(reviewSuggestion, null);
  const [title, setTitle] = useState(name);
  const [details, setDetails] = useState(description);

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
        <PointClassificationFields initial={classification ?? undefined} required />
        <label>
          Odkaz na doklad polohy ze hry
          <input name="verificationSource" type="url" required maxLength={1000} />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className={styles.toolbar}>
          <button type="submit" name="decision" value="approved" className={styles.primary} disabled={pending}>
            Potvrdit polohu a přidat na mapu
          </button>
          <button type="submit" name="decision" value="rejected" className={styles.control} disabled={pending} formNoValidate>
            Zamítnout
          </button>
        </div>
      </form>
    </details>
  );
}
