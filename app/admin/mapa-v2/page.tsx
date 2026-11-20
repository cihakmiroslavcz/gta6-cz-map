import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import GameMap from "@/components/map/GameMap";
import { getMapAdminClient } from "@/lib/supabase/map-server";
import { readMapV2Access, readMapV2Points } from "@/lib/supabase/map-v2";

export const metadata: Metadata = {
  title: "Mapa V2 | GTA VI Interaktivní mapa",
  robots: { index: false, follow: false },
};

async function MapV2Content() {
  await connection();
  const client = await getMapAdminClient();
  if (!client) redirect("/admin");

  const access = await readMapV2Access(client);
  if (access.allowed === false) redirect("/admin");
  const result = access.error ? { error: access.error } : await readMapV2Points(client);
  return (
    <>
      <header className="map-title map-title-v2 map-glass">
        <h1>Mapa V2</h1>
        {"points" in result && (
          <p>{result.points.length === 0 ? "Přidej první bod pravým kliknutím nebo klepnutím na mapu." : "Potvrzené body"}</p>
        )}
      </header>
      {"error" in result ? (
        <div className="map-loading" role="alert">{result.error}</div>
      ) : (
        <GameMap hiddenPointIds={[]} points={result.points} canManagePoints isV2 />
      )}
    </>
  );
}

export default function MapV2Page() {
  return (
    <main className="map-screen" aria-label="Mapa V2">
      <Suspense fallback={<div className="map-loading" role="status">Načítám mapu V2…</div>}>
        <MapV2Content />
      </Suspense>
    </main>
  );
}
