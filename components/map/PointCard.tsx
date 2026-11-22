"use client";

import { useActionState, useState } from "react";
import { hidePoint } from "@/app/admin/actions";
import MaterialIcon from "@/components/MaterialIcon";
import { mapV2Path } from "@/lib/map-location";
import { pointCategories, pointLinkParam, pointTypes, type MapPoint } from "./map-points";

const dollarFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function HidePointForm({ pointId }: { pointId: string }) {
  const [error, action, pending] = useActionState(hidePoint, null);

  return (
    <form action={action} className="point-hide">
      <input type="hidden" name={pointLinkParam} value={pointId} />
      <button type="submit" disabled={pending}>{pending ? "Skrývá se…" : "Skrýt bod"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default function PointCard({ point, canManagePoint = false, isV2 = false, onEdit }: {
  point: MapPoint;
  canManagePoint?: boolean;
  isV2?: boolean;
  onEdit?: (point: MapPoint) => void;
}) {
  const [shareStatus, setShareStatus] = useState<
    { copied: true } | { copied: false; link: string } | null
  >(null);
  const robbery = point.category === "robberies" ? point.robbery : undefined;

  async function copyLink() {
    const url = new URL(isV2 ? mapV2Path : "/", window.location.origin);
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
              {pointCategories[point.category].label}
            </li>
            <li className="point-chip" data-type={point.type}>{pointTypes[point.type].label}</li>
          </ul>
        </header>
        {point.description && <p className="point-card-description">{point.description}</p>}
        {point.location && <p>{point.location}</p>}
        {robbery && (
          <dl className="point-card-facts">
            {robbery.security && (
              <div>
                <dt>Zabezpečení</dt>
                <dd>{robbery.security}</dd>
              </div>
            )}
            {robbery.take && (
              <div>
                <dt>Možná kořist</dt>
                <dd>{dollarFormat.format(robbery.take.min)} – {dollarFormat.format(robbery.take.max)}</dd>
              </div>
            )}
          </dl>
        )}
        {point.verificationSource && (
          <p className="point-card-note">Ověřeno ve hře · Přibližná poloha</p>
        )}
      </div>

      <footer className="point-share">
        <div className="point-share-actions">
          <button type="button" onClick={copyLink}>
            <MaterialIcon name="content_copy" />
            Zkopírovat odkaz
          </button>
          {!isV2 && (
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
      {canManagePoint && (
        <div className="point-admin-actions">
          {onEdit && <button type="button" onClick={() => onEdit(point)}>Upravit bod</button>}
          {!isV2 && <HidePointForm pointId={point.id} />}
        </div>
      )}
    </article>
  );
}
