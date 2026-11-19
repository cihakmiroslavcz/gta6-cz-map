import type { Metadata } from "next";
import MaterialIcon from "@/components/MaterialIcon";
import { MapFeedbackForm, MapFeedbackPage } from "@/components/MapFeedback";
import { pointLinkParam, type MapPoint } from "@/components/map/map-points";
import { publicMapOrigin } from "@/lib/map-contact";
import { isMapPointId } from "@/lib/map-point-id";
import { readMapPoints, readHiddenPointIds } from "@/lib/supabase/map-server";
import styles from "@/app/map-feedback.module.css";

export const metadata: Metadata = {
  title: "Nahlásit chybu | GTA VI Interaktivní mapa",
};

type ReportPageProps = PageProps<"/nahlasit-chybu">;

function ReportForm({ point, mapHref }: { point: MapPoint; mapHref: string }) {
  const coordinates = `X ${point.x}, Y ${point.y}`;
  const mapUrl = new URL(mapHref, publicMapOrigin);
  const returnParams = new URLSearchParams({ [pointLinkParam]: point.id, odeslano: "1" });

  return (
    <MapFeedbackForm
      label="Hlášení chyby"
      subject={`Chyba na mapě: ${point.name}`}
      returnHref={`/nahlasit-chybu?${returnParams}`}
      submitLabel="Odeslat hlášení"
    >
      <dl className={styles.point}>
        <div>
          <dt>Bod</dt>
          <dd>{point.name}</dd>
        </div>
        <div>
          <dt>ID bodu</dt>
          <dd>{point.id}</dd>
        </div>
        <div>
          <dt>Herní souřadnice</dt>
          <dd>{coordinates}</dd>
        </div>
      </dl>

      <input type="hidden" name="Bod" value={point.name} />
      <input type="hidden" name="ID bodu" value={point.id} />
      <input type="hidden" name="Odkaz na mapu" value={mapUrl.href} />
      <input type="hidden" name="Herní souřadnice" value={coordinates} />

      <div className={styles.field}>
        <label htmlFor="report-message">Co je špatně?</label>
        <textarea
          id="report-message"
          name="Popis chyby"
          rows={5}
          required
          minLength={10}
          maxLength={3000}
          aria-describedby="report-message-hint"
        />
        <p id="report-message-hint" className={styles.note}>
          Popiš chybu alespoň 10 znaky. Pokud víš, jak má bod vypadat, připiš to.
        </p>
      </div>

    </MapFeedbackForm>
  );
}

async function ReportContent({ searchParams }: Pick<ReportPageProps, "searchParams">) {
  const params = await searchParams;
  const pointId = params[pointLinkParam];
  const [hiddenPointIds, points] = await Promise.all([
    readHiddenPointIds(), isMapPointId(pointId) ? readMapPoints(pointId) : [],
  ]);
  if (!hiddenPointIds || !points) return <p>Údaje o bodu se nepodařilo načíst. Zkus obnovit stránku.</p>;
  const point = points.find(({ id }) => id === pointId && !hiddenPointIds.includes(id));
  const mapHref = point ? `/?${new URLSearchParams({ [pointLinkParam]: point.id })}` : "/";

  return (
    <>
      {/* A document navigation gives Leaflet a fresh map when returning from the form. */}
      <a href={mapHref} className={styles.back}>
        <MaterialIcon name="arrow_back" />
        {point ? "Zpět k bodu" : "Zpět na mapu"}
      </a>
      {params.odeslano === "1" && point ? (
        <p role="status">Díky za hlášení chyby u bodu {point.name}.</p>
      ) : !point ? (
        <p>Bod se nepodařilo najít. Otevři jeho detail na mapě a zvol „Nahlásit chybu“.</p>
      ) : (
        <ReportForm point={point} mapHref={mapHref} />
      )}
    </>
  );
}

export default function ReportPage({ searchParams }: ReportPageProps) {
  return (
    <MapFeedbackPage title="Nahlásit chybu">
      <ReportContent searchParams={searchParams} />
    </MapFeedbackPage>
  );
}
