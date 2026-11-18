import type { Metadata } from "next";
import { Suspense } from "react";
import { mapPoints, pointLinkParam } from "@/components/map/map-points";
import { supabaseConfig } from "@/lib/supabase/config";
import { getMapAdminClient } from "@/lib/supabase/map-server";
import { restorePoint, signIn, signOut } from "./actions";
import SuggestionList from "./SuggestionList";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Správa bodů | GTA VI Interaktivní mapa",
  robots: { index: false, follow: false },
};

type AdminPageProps = PageProps<"/admin">;
const pointNames = new Map(mapPoints.map(({ id, name }) => [id, name]));

async function AdminContent({ searchParams }: Pick<AdminPageProps, "searchParams">) {
  if (!supabaseConfig) return <p>Správa bodů zatím není propojená se Supabase.</p>;

  const [client, params] = await Promise.all([getMapAdminClient(), searchParams]);
  if (!client) {
    return (
      <form className={styles.login} action={signIn}>
        <label>
          E-mail správce
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Heslo
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button type="submit" className={styles.primary}>Přihlásit se</button>
        {params.stav === "prihlaseni" && <p role="alert">Přihlášení správce se nezdařilo.</p>}
      </form>
    );
  }

  const { data, error } = await client.from("map_hidden_points").select("point_id").order("point_id");
  return (
    <>
      <div className={styles.toolbar}>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Leaflet needs a fresh document when returning to the map. */}
        <a href="/" className={styles.control}>Otevřít mapu</a>
        <form action={signOut}>
          <button type="submit" className={styles.control}>Odhlásit se</button>
        </form>
      </div>
      <h2>Skryté body</h2>
      {params.stav === "obnoveno" && <p role="status">Bod byl obnoven.</p>}
      {params.stav === "chyba" && <p role="alert">Bod se nepodařilo obnovit.</p>}
      {error ? (
        <p role="alert">Seznam skrytých bodů se nepodařilo načíst.</p>
      ) : data.length === 0 ? (
        <p>Zatím nejsou skryté žádné body.</p>
      ) : (
        <ul className={styles.points}>
          {data.map(({ point_id: id }) => (
            <li key={id}>
              <span>{pointNames.get(id) ?? "Bod mimo aktuální data"} <small>{id}</small></span>
              <form action={restorePoint}>
                <input type="hidden" name={pointLinkParam} value={id} />
                <button type="submit" className={styles.control} aria-label={`Obnovit bod ${pointNames.get(id) ?? id}`}>
                  Obnovit
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <SuggestionList client={client} pageValue={params.navrhy} />
    </>
  );
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  return (
    <main className={styles.page}>
      <section className={`map-glass ${styles.panel}`} aria-labelledby="admin-title">
        <h1 id="admin-title">Správa bodů</h1>
        <Suspense fallback={<p role="status">Načítám správu…</p>}>
          <AdminContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
