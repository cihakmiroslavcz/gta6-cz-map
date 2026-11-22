import { getPointClassification, mapPoints, pointTypes, type MapPoint } from "@/components/map/map-points";
import guidePoints from "./verified-guide-points.json";
import notebookPoints from "./verified-notebook-points.json";

const stripClubGuide = "https://www.pcgamer.com/games/grand-theft-auto/gta-6-strip-club-locations/";

// Keep existing GTADB IDs so links, point edits and moderation still work.
const verificationSources = new Map([
  ["L172", `${stripClubGuide}#section-jack-of-hearts`],
  ["L190", `${stripClubGuide}#section-nine1nine`],
  ["L325", "https://howtovideogame.com/gta-6-princess-iguana/"],
  ["L360", "https://gta6gps.com/?p=salons-8"],
  ["L370", "https://gta6gps.com/?p=salons-7"],
  ["L556", "https://www.pcgamer.com/games/grand-theft-auto/gta-6-unique-playlists/"],
  ["L629", `${stripClubGuide}#section-delights`],
]);

const verifiedGtadbPoints = mapPoints.flatMap((point) => {
  const verificationSource = verificationSources.get(point.id);
  return verificationSource ? [{ ...point, unconfirmed: false, verificationSource }] : [];
});

const verifiedNotebookPoints = notebookPoints.flatMap(({ kind, type, points }) => {
  const classification = getPointClassification(type);
  if (!classification) return [];

  return points.map(({ sourceId, ...point }) => ({
    ...point,
    ...classification,
    verificationSource: `https://leonidanotebook.com/guides/gta-6-${kind}-locations/#${sourceId}`,
  }));
});

const verifiedGuidePoints = guidePoints.flatMap(({ type, points }) => {
  const classification = getPointClassification(type);
  if (!classification) return [];

  return points.map((point) => ({ ...point, ...classification }));
});

export const verifiedMapPoints: MapPoint[] = [
  ...verifiedGtadbPoints,
  ...verifiedNotebookPoints,
  ...verifiedGuidePoints,
  {
    // The public suggestion already used this ID for Barnacle Beauties.
    id: "S93f1f9c4-dbe0-45d3-a597-fe4e8959519d",
    name: "Barnacle Beauties",
    location: "Key Lento",
    category: pointTypes.hairSalon.category,
    type: "hairSalon",
    x: -3210,
    y: -6687,
    verificationSource: "https://gta6gps.com/?p=salons-4",
  },
];
