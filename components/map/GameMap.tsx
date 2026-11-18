"use client";

import dynamic from "next/dynamic";

const LeafletGameMap = dynamic(() => import("./LeafletGameMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading" role="status">
      Načítám mapu…
    </div>
  ),
});

export default function GameMap() {
  return <LeafletGameMap />;
}
