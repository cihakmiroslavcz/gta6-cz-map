"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./map-points";

export type GameMapProps = {
  hiddenPointIds: string[];
  points: MapPoint[];
  canManagePoints: boolean;
};

const LeafletGameMap = dynamic(() => import("./LeafletGameMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading" role="status">
      Načítám mapu…
    </div>
  ),
});

export default function GameMap(props: GameMapProps) {
  return <LeafletGameMap {...props} />;
}
