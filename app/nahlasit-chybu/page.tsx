import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import MaterialIcon from "@/components/MaterialIcon";
import { mapPoints, pointLinkParam, type MapPoint } from "@/components/map/map-points";
import { mapContactEmail } from "@/lib/map-contact";
import { readHiddenPointIds } from "@/lib/supabase/map-server";
import styles from "./report.module.css";

export const metadata: Metadata = {
  title: "Nahlásit chybu | GTA VI Interaktivní mapa",
};

const publicMapOrigin = "https://gta6-cz-map.vercel.app";

type ReportPageProps = PageProps<"/nahlasit-chybu">;

function ReportForm({ point, mapHref }: { point: MapPoint; mapHref: string }) {
  const coordinates = `X ${point.x}, Y ${point.y}`;
  const mapUrl = new URL(mapHref, publicMapOrigin);
  const returnUrl = new URL("/nahlasit-chybu", publicMapOrigin);
  returnUrl.searchParams.set(pointLinkParam, point.id);
  returnUrl.searchParams.set("odeslano", "1");
  const recipient = encodeURIComponent(mapContactEmail).replace("%40", "@");

  return (
    <form className={styles.form} action={`https://formsubmit.co/${recipient}`} method="post" aria-label="Hlášení chyby">
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

      <input type="hidden" name="_subject" value={`Chyba na mapě: ${point.name}`} />
      <input type="hidden" name="_next" value={returnUrl.href} />
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

      <button className={styles.submit} type="submit">Odeslat hlášení</button>
      <p className={styles.note}>
        Hlášení zpracovává <a href="https://formsubmit.co/">FormSubmit</a>.
      </p>
    </form>
  );
}

async function ReportContent({ searchParams }: Pick<ReportPageProps, "searchParams">) {
  const [params, hiddenPointIds] = await Promise.all([searchParams, readHiddenPointIds()]);
  if (!hiddenPointIds) return <p>Údaje o bodu se nepodařilo načíst. Zkus obnovit stránku.</p>;
  const pointId = params[pointLinkParam];
  const point = mapPoints.find(({ id }) => id === pointId && !hiddenPointIds.includes(id));
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
    <main className={styles.page}>
      <section className={`map-glass ${styles.panel}`} aria-labelledby="report-title">
        <Image
          className={styles.logo}
          src="/logo/gta6-cz-map-logo.svg"
          alt="GTA VI Interaktivní mapa"
          width={216}
          height={54}
          unoptimized
        />
        <h1 id="report-title">Nahlásit chybu</h1>
        <Suspense fallback={<p role="status">Načítám údaje o bodu…</p>}>
          <ReportContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
