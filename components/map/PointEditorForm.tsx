"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addPoint, editPoint } from "@/app/admin/actions";
import { saveMapV2Point } from "@/app/admin/mapa-v2/actions";
import { mapLocationParams, worldHalfSize, type MapLocation } from "@/lib/map-location";
import PointClassificationFields from "./PointClassificationFields";
import { pointLinkParam, type MapPoint } from "./map-points";

type PointEditorProps = ({ location: MapLocation; point?: never } | { point: MapPoint; location?: never }) & {
  onSaved: (point: MapPoint) => void;
  inDialog?: boolean;
  isV2?: boolean;
};

export default function PointEditorForm({ location, point, onSaved, inDialog = false, isV2 = false }: PointEditorProps) {
  const [result, action, pending] = useActionState(isV2 ? saveMapV2Point : point ? editPoint : addPoint, null);
  const [name, setName] = useState(point?.name ?? "");
  const [description, setDescription] = useState(point?.description ?? "");
  const [coordinates, setCoordinates] = useState({ x: String(point?.x ?? ""), y: String(point?.y ?? "") });
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!inDialog) nameInput.current?.focus({ preventScroll: true });
  }, [inDialog]);

  useEffect(() => {
    if (result && "point" in result) onSaved(result.point);
  }, [result, onSaved]);

  const form = (
    <form action={action} className="point-editor">
      {point ? (
        <input type="hidden" name={pointLinkParam} value={point.id} />
      ) : Array.from(mapLocationParams(location), ([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="point-card-detail point-editor-fields">
        <label>
          Název
          <input ref={nameInput} name="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <PointClassificationFields initial={point} required />
        {isV2 && point && (
          <div className="point-editor-coordinates">
            {(["x", "y"] as const).map((axis) => (
              <label key={axis}>
                Souřadnice {axis.toUpperCase()}
                <input
                  type="number"
                  name={axis}
                  required
                  step={0.001}
                  min={-worldHalfSize}
                  max={worldHalfSize}
                  value={coordinates[axis]}
                  onChange={(event) => setCoordinates({ ...coordinates, [axis]: event.target.value })}
                />
              </label>
            ))}
          </div>
        )}
        <label>
          Popis (nepovinný)
          <textarea name="description" rows={2} maxLength={3000} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
      </div>
      {result && "error" in result && <p className="point-editor-error" role="alert">{result.error}</p>}
      <div className="point-share point-share-actions">
        <button type="submit" disabled={pending}>{pending ? "Ukládá se…" : point ? "Uložit změny" : "Přidat na mapu"}</button>
      </div>
    </form>
  );

  if (inDialog) return form;

  return (
    <section className="point-card" aria-labelledby="add-point-heading">
      <header className="point-card-heading">
        <h2 id="add-point-heading">{point ? "Upravit bod" : "Přidat bod"}</h2>
      </header>
      {form}
    </section>
  );
}
