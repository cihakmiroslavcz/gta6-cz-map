import Image from "next/image";
import { Suspense } from "react";
import GameMap from "@/components/map/GameMap";
import { getMapAdminClient, readPublishedPoints, readHiddenPointIds } from "@/lib/supabase/map-server";

async function MapContent() {
  const [hiddenPointIds, publishedPoints, admin] = await Promise.all([
    readHiddenPointIds(), readPublishedPoints(), getMapAdminClient(),
  ]);

  if (!hiddenPointIds || !publishedPoints) {
    return <div className="map-loading" role="alert">Mapu se nepodařilo načíst. Zkus obnovit stránku.</div>;
  }

  return <GameMap hiddenPointIds={hiddenPointIds} publishedPoints={publishedPoints} canManagePoints={Boolean(admin)} />;
}

export default function Home() {
  return (
    <main className="map-screen" aria-labelledby="map-title">
      <h1 id="map-title" className="map-title map-glass">
        <Image
          src="/logo/gta6-cz-map-logo.svg"
          alt="GTA VI Interaktivní mapa"
          width={142}
          height={37}
          loading="eager"
          unoptimized
        />
      </h1>
      <Suspense fallback={<div className="map-loading" role="status">Načítám mapu…</div>}>
        <MapContent />
      </Suspense>
    </main>
  );
}
