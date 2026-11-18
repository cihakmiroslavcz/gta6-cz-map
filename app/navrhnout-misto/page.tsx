import type { Metadata } from "next";
import MaterialIcon from "@/components/MaterialIcon";
import { MapFeedbackPage } from "@/components/MapFeedback";
import styles from "@/app/map-feedback.module.css";
import { mapLocationParams, mapViewOnlyParam, readMapLocation } from "@/lib/map-location";
import SuggestionForm from "./SuggestionForm";

export const metadata: Metadata = {
  title: "Navrhnout místo | GTA VI Interaktivní mapa",
};

type SuggestPageProps = PageProps<"/navrhnout-misto">;

async function SuggestContent({ searchParams }: Pick<SuggestPageProps, "searchParams">) {
  const params = await searchParams;
  const location = readMapLocation(params);
  const locationParams = location && mapLocationParams(location);
  const mapHref = locationParams ? `/?${locationParams}` : "/";
  const backHref = locationParams ? `${mapHref}&${mapViewOnlyParam}=1` : mapHref;

  return (
    <>
      <a href={backHref} className={styles.back}>
        <MaterialIcon name="arrow_back" />
        Zpět na mapu
      </a>
      {!location ? (
        <p>Vyber nejdřív místo na mapě a zvol „Navrhnout místo“.</p>
      ) : (
        <SuggestionForm location={location} />
      )}
    </>
  );
}

export default function SuggestPage({ searchParams }: SuggestPageProps) {
  return (
    <MapFeedbackPage title="Navrhnout místo">
      <SuggestContent searchParams={searchParams} />
    </MapFeedbackPage>
  );
}
