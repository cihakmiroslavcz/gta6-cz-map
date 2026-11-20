import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { getPointClassification, pointLinkParam } from "@/components/map/map-points";
import { mapLocationParams } from "@/lib/map-location";
import { suggestionPointId } from "@/lib/map-point-id";
import SuggestionReviewForm from "./SuggestionReviewForm";
import styles from "./admin.module.css";

const pageSize = 20;
const timeFormat = new Intl.DateTimeFormat("cs-CZ", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Prague",
});

export default async function SuggestionList({ client, pageValue }: { client: SupabaseClient; pageValue: unknown }) {
  const requestedPage = typeof pageValue === "string" ? Number(pageValue) : 1;
  const page = Number.isSafeInteger(requestedPage * pageSize) && Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const start = (page - 1) * pageSize;
  const { data, error } = await client
    .from("map_suggestions")
    .select("*,review:map_suggestion_reviews(decision,name,description)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + pageSize);

  return (
    <section className={styles.suggestions} aria-labelledby="suggestions-title">
      <h2 id="suggestions-title">Návrhy míst</h2>
      {error ? (
        <p role="alert">Návrhy míst se nepodařilo načíst.</p>
      ) : (
        <>
          {data.length === 0 ? <p>Na této stránce nejsou žádné návrhy.</p> : (
            <ul className={styles.suggestionList}>
              {data.slice(0, pageSize).map((suggestion) => {
                const x = Number(suggestion.x);
                const y = Number(suggestion.y);
                const review = Array.isArray(suggestion.review) ? suggestion.review[0] : suggestion.review;
                const decision = review?.decision;
                const status = decision === "approved" ? "Schváleno" : decision === "rejected" ? "Zamítnuto" : "Čeká na kontrolu";
                const mapParams = decision === "approved"
                  ? new URLSearchParams({ [pointLinkParam]: suggestionPointId(suggestion.id) })
                  : mapLocationParams({ x, y, zoom: suggestion.zoom });
                return (
                  <li key={suggestion.id}>
                    <h3>{review?.name ?? suggestion.name}</h3>
                    <small>
                      <time dateTime={suggestion.created_at}>{timeFormat.format(new Date(suggestion.created_at))}</time>
                      {" · "}X {x.toFixed(3)}, Y {y.toFixed(3)}{" · "}{status}
                    </small>
                    <p>{review?.description ?? suggestion.description}</p>
                    <a href={`/?${mapParams}`}>Zobrazit místo na mapě</a>
                    {!decision && (
                      <SuggestionReviewForm
                        id={suggestion.id}
                        name={suggestion.name}
                        description={suggestion.description}
                        classification={getPointClassification(suggestion.type)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {(page > 1 || data.length > pageSize) && (
            <nav className={styles.toolbar} aria-label="Stránky návrhů míst">
              {page > 1 && <Link className={styles.control} href={`/admin?navrhy=${page - 1}`}>Předchozí</Link>}
              {data.length > pageSize && <Link className={styles.control} href={`/admin?navrhy=${page + 1}`}>Další</Link>}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
