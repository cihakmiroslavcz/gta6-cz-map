"use client";

import { useState } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import { pointCategories, pointLinkParam, pointTypes, type MapPoint } from "./map-points";

const reportEmail = process.env.NEXT_PUBLIC_MAP_REPORT_EMAIL?.trim();

export default function PointCard({ point }: { point: MapPoint }) {
  const [shareStatus, setShareStatus] = useState<
    { copied: true } | { copied: false; link: string } | null
  >(null);

  async function copyLink() {
    const url = new URL("/", window.location.origin);
    url.searchParams.set(pointLinkParam, point.id);

    try {
      await navigator.clipboard.writeText(url.href);
      setShareStatus({ copied: true });
    } catch {
      setShareStatus({ copied: false, link: url.href });
    }
  }

  return (
    <article className="point-card" aria-label={point.name}>
      <div className="point-card-detail" role="region" aria-label="Podrobnosti o místě" tabIndex={0}>
        <header className="point-card-heading">
          <h2>{point.name}</h2>
          <ul className="point-chips" aria-label="Kategorie a typ místa">
            <li className="point-chip point-chip-category" data-category={point.category}>
              <span className={`point-symbol point-${point.category}`} aria-hidden="true" />
              {pointCategories[point.category]}
            </li>
            <li className="point-chip">{pointTypes[point.type].label}</li>
          </ul>
        </header>
        {point.description && <p>{point.description}</p>}
        {point.location && <p>{point.location}</p>}
        <p className="point-card-note">{point.unconfirmed ? "Nepotvrzené místo · Přibližná poloha" : "Přibližná poloha"}</p>
      </div>

      <footer className="point-share">
        <div className="point-share-actions">
          <button type="button" onClick={copyLink}>
            <MaterialIcon name="content_copy" />
            Zkopírovat odkaz
          </button>
          {reportEmail && (
            <a
              className="point-report"
              href={`/nahlasit-chybu?${new URLSearchParams({ [pointLinkParam]: point.id })}`}
            >
              Nahlásit chybu
            </a>
          )}
        </div>
        {shareStatus?.copied && <span role="status">Odkaz zkopírován.</span>}
        {shareStatus && !shareStatus.copied && (
          <label>
            Odkaz ke zkopírování
            <input
              readOnly
              value={shareStatus.link}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        )}
      </footer>
    </article>
  );
}
