"use client";

import dynamic from "next/dynamic";

export type GameMapProps = {
  hiddenPointIds: string[];
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
