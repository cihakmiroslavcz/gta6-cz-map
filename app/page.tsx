import Image from "next/image";
import GameMap from "@/components/map/GameMap";

export default function Home() {
  return (
    <main className="map-screen" aria-labelledby="map-title">
      <h1 id="map-title" className="map-title map-glass">
        <Image
          src="/logo/gta6-cz-map-logo.svg"
          alt="GTA VI Interaktivní mapa"
          width={132}
          height={33}
          loading="eager"
          unoptimized
        />
      </h1>
      <GameMap />
    </main>
  );
}
