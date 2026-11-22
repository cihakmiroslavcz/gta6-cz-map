"use client";

import {
  CRS,
  Control,
  TileLayer,
  Transformation,
  divIcon,
  latLngBounds,
  point,
  type Coords,
  type LatLngBoundsExpression,
  type LeafletEventHandlerFnMap,
  type LeafletMouseEvent,
  type Marker as LeafletMarker,
  type MarkerCluster,
  type MarkerClusterGroup,
  type Point,
} from "leaflet";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Pane, Popup, Rectangle, Tooltip, useMap } from "react-leaflet";
import ClusterGroup from "react-leaflet-cluster";
import { mapViewOnlyParam, maxZoom, readMapLocation, worldHalfSize } from "@/lib/map-location";
import type { GameMapProps } from "./GameMap";
import LeonidaLayer from "./LeonidaLayer";
import MapLocationMenu from "./MapLocationMenu";
import MapTools from "./MapTools";
import MobileMapDialog from "./MobileMapDialog";
import PointCard from "./PointCard";
import PointEditorForm from "./PointEditorForm";
import type { MapArea } from "./map-area-search";
import {
  baseMapStorageKey,
  readLeonidaManifest,
  type BaseMap,
  type LeonidaManifest,
  type LeonidaStatus,
  type LeonidaVariant,
} from "./map-basemaps";
import { getMapFilterType, updateHiddenFilterTypes, type MapFilterType } from "./map-filter-groups";
import { pointLinkParam, pointTypes, type MapPoint } from "./map-points";

const tileRoot = "/maps/tiles/6/yanis,18";
const tileSize = 256;
const emptyTile = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const metersPerPixelAtZoomZero = 32;
const pixelOrigin = worldHalfSize / metersPerPixelAtZoomZero;

// Game coordinates are [y, x] in Leaflet. Image rows increase southward.
const gameCrs = {
  ...CRS.Simple,
  transformation: new Transformation(
    1 / metersPerPixelAtZoomZero,
    pixelOrigin,
    -1 / metersPerPixelAtZoomZero,
    pixelOrigin,
  ),
};

// The Yanis V18 side panel occupies this rectangle in zoom-zero image pixels.
const sidePanelBounds = latLngBounds(
  gameCrs.pointToLatLng(point(632, 164), 0),
  gameCrs.pointToLatLng(point(828, 797), 0),
);

// Inclusive [min column, min row, max column, max row] from GTADB maps/maps.js.
const tileRanges = [
  [0, 0, 3, 3],
  [1, 1, 6, 6],
  [2, 2, 12, 12],
  [5, 5, 25, 24],
  [10, 10, 51, 49],
  [21, 21, 103, 99],
] as const;

const pointZoom = 3;
const viewStorageKey = "gta6-cz-map:view:v1";
const clusteringStorageKey = "gta6-cz-map:clustering";
const worldBounds: LatLngBoundsExpression = [
  [-worldHalfSize, -worldHalfSize],
  [worldHalfSize, worldHalfSize],
];

type MapView = { center: [number, number]; zoom: number };

// The second reference screenshot shows northern Leonida at zoom 2.
const defaultView: MapView = { center: [7560, -4056], zoom: 2 };

function readMapView(): MapView {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(viewStorageKey) ?? "null");
    if (saved && typeof saved === "object" && "center" in saved && "zoom" in saved) {
      const { center, zoom } = saved;
      const [y, x] = Array.isArray(center) && center.length === 2 ? center : [];
      if (
        typeof y === "number" && typeof x === "number" &&
        Math.max(Math.abs(y), Math.abs(x)) <= worldHalfSize &&
        typeof zoom === "number" && Number.isInteger(zoom) && zoom >= 0 && zoom <= maxZoom
      ) {
        return { center: [y, x], zoom };
      }
    }
  } catch {
    // A browser can block storage, or a saved view can be malformed.
  }
  return defaultView;
}

function RememberMapView() {
  const map = useMap();

  useEffect(() => {
    function saveView() {
      const { lat, lng } = map.getCenter();
      const view: MapView = { center: [lat, lng], zoom: map.getZoom() };
      try {
        window.localStorage.setItem(viewStorageKey, JSON.stringify(view));
      } catch {
        // The map remains usable when local storage is unavailable.
      }
    }

    map.on("moveend", saveView);
    return () => {
      map.off("moveend", saveView);
    };
  }, [map]);

  return null;
}

function MapCoordinates() {
  const map = useMap();
  const [coordinates, setCoordinates] = useState(() => map.getCenter());

  useEffect(() => {
    const canHover = window.matchMedia("(any-hover: hover)");
    let cursor: Point | null = null;

    function updateCoordinates() {
      setCoordinates(cursor ? map.containerPointToLatLng(cursor) : map.getCenter());
    }

    function followCursor(event: LeafletMouseEvent) {
      if (!canHover.matches) return;
      cursor = event.containerPoint;
      setCoordinates(event.latlng);
    }

    function showCenter() {
      cursor = null;
      updateCoordinates();
    }

    const events = { mousemove: followCursor, mouseout: showCenter, moveend: updateCoordinates };
    map.on(events);
    return () => {
      map.off(events);
    };
  }, [map]);

  return (
    <div className="map-coordinates map-glass" aria-label="Herní souřadnice">
      X: {coordinates.lng.toFixed(3)}, Y: {coordinates.lat.toFixed(3)}
    </div>
  );
}

const pointIcons = new Map<string, ReturnType<typeof divIcon>>();

function pointIcon({ category, type }: MapPoint) {
  const key = `${category}:${type}`;
  const cached = pointIcons.get(key);
  if (cached) return cached;
  const { icon: iconName } = pointTypes[type];

  const icon = type === "treasure"
    ? divIcon({
      className: `map-treasure map-pin-${category}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      tooltipAnchor: [0, -12],
    }) : divIcon({
      className: `map-pin map-pin-${category} map-pin-type-${type}`,
      html: `<span class="material-icon" data-icon="${iconName}" aria-hidden="true">${iconName}</span>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -34],
      tooltipAnchor: [0, -38],
    });
  pointIcons.set(key, icon);
  return icon;
}

const pointMarkerEvents: LeafletEventHandlerFnMap = {
  add({ target }: { target: LeafletMarker }) {
    target.getElement()?.setAttribute("aria-label", target.options.alt ?? "");
  },
  popupopen({ target }: { target: LeafletMarker }) {
    target.closeTooltip();
  },
  tooltipopen({ target }: { target: LeafletMarker }) {
    if (target.isPopupOpen()) target.closeTooltip();
  },
};

const clusterSizes = [
  { minimum: 100, size: 52, className: "map-cluster-dense" },
  { minimum: 50, size: 44, className: "map-cluster-large" },
  { minimum: 10, size: 36, className: "map-cluster-medium" },
];
const smallCluster = { size: 32, className: "map-cluster-small" };

function clusterIcon(cluster: MarkerCluster) {
  const count = cluster.getChildCount();
  const { size, className } = clusterSizes.find(({ minimum }) => count >= minimum) ?? smallCluster;
  return divIcon({
    className: `map-cluster ${className}`,
    html: `<span aria-hidden="true">${count}</span><span class="map-cluster-label">Skupina ${count} míst, přiblížit</span>`,
    iconSize: [size, size],
  });
}

class GtadbTileLayer extends TileLayer {
  override getTileUrl({ x, y, z }: Coords): string {
    const range = tileRanges[z];
    if (!range) return emptyTile;

    const [minX, minY, maxX, maxY] = range;
    if (x < minX || x > maxX || y < minY || y > maxY) {
      return emptyTile;
    }

    return `${tileRoot}/${z}/${z},${y},${x}.jpg`;
  }
}

function CommunityLayer({ visible }: { visible: boolean }) {
  const map = useMap();
  const tileLayer = useRef<GtadbTileLayer>(null);

  useEffect(() => {
    const tiles = new GtadbTileLayer("", {
      bounds: worldBounds,
      minZoom: 0,
      maxZoom,
      noWrap: true,
      tileSize,
    }).addTo(map);
    tileLayer.current = tiles;
    const zoom = new Control.Zoom({
      position: "bottomright",
      zoomInText: '<span class="material-icon" aria-hidden="true">add</span>',
      zoomOutText: '<span class="material-icon" aria-hidden="true">remove</span>',
      zoomInTitle: "Přiblížit",
      zoomOutTitle: "Oddálit",
    }).addTo(map);

    return () => {
      zoom.remove();
      tiles.remove();
      tileLayer.current = null;
    };
  }, [map]);

  useLayoutEffect(() => {
    tileLayer.current?.setOpacity(visible ? 1 : 0);
  }, [visible]);

  return (
    <Pane name="community-mask" style={{ zIndex: 210, pointerEvents: "none" }}>
      {visible && (
        <Rectangle
          bounds={sidePanelBounds}
          className="map-panel-mask"
          interactive={false}
          stroke={false}
          fillOpacity={1}
        />
      )}
    </Pane>
  );
}

type PointMarkersProps = {
  points: MapPoint[];
  canManagePoints: boolean;
  isV2: boolean;
  selection: { point: MapPoint } | null;
  clustering: boolean;
  onPointEdit: (point: MapPoint) => void;
};

function MapAreaView({ selection }: { selection: { area: MapArea } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!selection) return;

    const size = map.getSize();
    map.closePopup();
    map.fitBounds(selection.area.bounds, {
      maxZoom: maxZoom - 1,
      padding: point(Math.min(48, size.x / 8), Math.min(108, size.y / 6)),
      animate: false,
    });
  }, [selection, map]);

  return null;
}

function PointMarkers({ points, canManagePoints, isV2, selection, clustering, onPointEdit }: PointMarkersProps) {
  const map = useMap();
  const markers = useRef(new Map<string, LeafletMarker>());
  const group = useRef<MarkerClusterGroup>(null);

  useEffect(() => {
    if (!selection) return;

    // React Leaflet may still be mounting a marker revealed by the filter change.
    let active = true;
    const frame = requestAnimationFrame(() => {
      const marker = markers.current.get(selection.point.id);
      if (!marker) return;

      map.setView(marker.getLatLng(), Math.max(map.getZoom(), pointZoom), { animate: false });
      if (group.current) {
        group.current.zoomToShowLayer(marker, () => {
          if (active && map.hasLayer(marker)) marker.openPopup();
        });
      } else {
        marker.openPopup();
      }
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [map, selection]);

  const visibleMarkers = useMemo(() => points.map((point) => (
    <Marker
      key={point.id}
      ref={(marker) => {
        if (marker) {
          marker.options.alt = point.name;
          marker.getElement()?.setAttribute("aria-label", point.name);
          markers.current.set(point.id, marker);
        } else markers.current.delete(point.id);
      }}
      position={[point.y, point.x]}
      icon={pointIcon(point)}
      alt={point.name}
      riseOnHover
      eventHandlers={pointMarkerEvents}
    >
      <Popup maxWidth={320} autoPanPaddingTopLeft={[16, 152]} autoPanPaddingBottomRight={[16, 136]}>
        <PointCard point={point} canManagePoint={canManagePoints} isV2={isV2} onEdit={onPointEdit} />
      </Popup>
      <Tooltip className="map-point-tooltip" direction="top" offset={[0, -5]} opacity={1}>
        <span>{point.name}</span>
      </Tooltip>
    </Marker>
  )), [points, canManagePoints, isV2, onPointEdit]);

  return clustering ? (
    <ClusterGroup
      ref={group}
      iconCreateFunction={clusterIcon}
      maxClusterRadius={56}
      disableClusteringAtZoom={maxZoom}
      spiderfyOnMaxZoom={false}
      showCoverageOnHover={false}
      animate={false}
    >
      {visibleMarkers}
    </ClusterGroup>
  ) : visibleMarkers;
}

export default function LeafletGameMap({ hiddenPointIds, points: allPoints, canManagePoints, isV2 = false }: GameMapProps) {
  const points = useMemo(() => {
    const hidden = new Set(hiddenPointIds);
    return allPoints.filter(({ id }) => !hidden.has(id));
  }, [allPoints, hiddenPointIds]);
  const [editingPoint, setEditingPoint] = useState<MapPoint | null>(null);
  const [{ sharedLocation, showLocationMarker }] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      sharedLocation: readMapLocation(Object.fromEntries(params)),
      showLocationMarker: params.get(mapViewOnlyParam) !== "1",
    };
  });
  const [hiddenTypes, setHiddenTypes] = useState<ReadonlySet<MapFilterType>>(() => new Set());
  const visiblePoints = useMemo(() => points.filter(({ type }) => !hiddenTypes.has(getMapFilterType(type))), [points, hiddenTypes]);
  const [selection, setSelection] = useState<{ point: MapPoint } | { area: MapArea } | null>(() => {
    const pointId = new URLSearchParams(window.location.search).get(pointLinkParam);
    const point = points.find(({ id }) => id === pointId);
    return point ? { point } : null;
  });
  const [initialView] = useState<MapView>(() => {
    if (selection && "point" in selection) return { center: [selection.point.y, selection.point.x], zoom: pointZoom };
    if (sharedLocation) return { center: [sharedLocation.y, sharedLocation.x], zoom: sharedLocation.zoom };
    return readMapView();
  });
  const [clustering, setClustering] = useState(() => {
    try {
      return window.localStorage.getItem(clusteringStorageKey) !== "false";
    } catch {
      return true;
    }
  });
  const [baseMap, setBaseMap] = useState<BaseMap>(() => {
    try {
      return window.localStorage.getItem(baseMapStorageKey) === "official" ? "official" : "community";
    } catch {
      return "community";
    }
  });
  const [manifest, setManifest] = useState<LeonidaManifest | null>(null);
  const [leonidaStatus, setLeonidaStatus] = useState<LeonidaStatus>("loading");
  const [leonidaRequested, setLeonidaRequested] = useState(baseMap === "official");
  const [leonidaVariant, setLeonidaVariant] = useState<LeonidaVariant>(1);
  const [leonidaTileError, setLeonidaTileError] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonOpacity, setComparisonOpacity] = useState(50);

  useEffect(() => {
    const controller = new AbortController();
    readLeonidaManifest(controller.signal)
      .then((manifest) => {
        if (!controller.signal.aborted) setManifest(manifest);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLeonidaStatus("unavailable");
      });
    return () => controller.abort();
  }, []);

  const selectedBaseMap = leonidaStatus === "unavailable" ? "community" : baseMap;
  const comparisonEnabled = comparing && leonidaStatus !== "unavailable";
  const officialDisplayed = selectedBaseMap === "official" && leonidaStatus === "ready";
  const officialOpacity = leonidaStatus !== "ready" ? 0 : comparisonEnabled ? comparisonOpacity / 100 : Number(officialDisplayed);

  function changeBaseMap(next: BaseMap) {
    setComparing(false);
    setBaseMap(next);
    if (next === "official") setLeonidaRequested(true);
    try {
      window.localStorage.setItem(baseMapStorageKey, next);
    } catch {
      // The preference still works for this visit.
    }
  }

  function changeComparison(enabled: boolean) {
    setComparing(enabled);
    if (enabled) setLeonidaRequested(true);
  }

  function changeLeonidaVariant(variant: LeonidaVariant) {
    setLeonidaTileError(false);
    setLeonidaVariant(variant);
  }

  const reportLeonidaTileError = useCallback(() => setLeonidaTileError(true), []);

  function changeClustering(enabled: boolean) {
    setClustering(enabled);
    try {
      window.localStorage.setItem(clusteringStorageKey, String(enabled));
    } catch {
      // The preference still works for this visit.
    }
  }

  const selectPoint = useCallback((point: MapPoint) => {
    const type = getMapFilterType(point.type);
    setHiddenTypes((previous) => previous.has(type) ? updateHiddenFilterTypes(previous, [type], true) : previous);
    setSelection({ point });
  }, []);

  return (
    <>
      <MapTools
        points={points}
        canManagePoints={canManagePoints}
        isV2={isV2}
        hiddenTypes={hiddenTypes}
        onTypesChange={(types, visible) =>
          setHiddenTypes((previous) => updateHiddenFilterTypes(previous, types, visible))
        }
        onPointSelect={selectPoint}
        onAreaSelect={(area) => setSelection({ area })}
        clustering={clustering}
        onClusteringChange={changeClustering}
        basemap={{
          selected: selectedBaseMap,
          onSelect: changeBaseMap,
          officialAvailable: Boolean(manifest) && leonidaStatus !== "unavailable",
          officialStatus: leonidaStatus,
          variants: manifest?.variants ?? [],
          variant: leonidaVariant,
          onVariantChange: changeLeonidaVariant,
          tileError: leonidaTileError,
          comparing: comparisonEnabled,
          onComparisonChange: changeComparison,
          opacity: comparisonOpacity,
          onOpacityChange: setComparisonOpacity,
        }}
      />
      <MapContainer
        className="game-map"
        crs={gameCrs}
        center={initialView.center}
        zoom={initialView.zoom}
        minZoom={0}
        maxZoom={maxZoom}
        maxBounds={worldBounds}
        maxBoundsViscosity={1}
        zoomControl={false}
        attributionControl={false}
      >
        <CommunityLayer visible={!officialDisplayed || comparisonEnabled} />
        {manifest && leonidaRequested && (
          <LeonidaLayer
            manifest={manifest}
            variant={leonidaVariant}
            opacity={officialOpacity}
            status={leonidaStatus}
            onStatusChange={setLeonidaStatus}
            onTileError={reportLeonidaTileError}
          />
        )}
        <RememberMapView />
        <MapCoordinates />
        <MapAreaView selection={selection && "area" in selection ? selection : null} />
        <MapLocationMenu
          sharedLocation={!selection && showLocationMarker ? sharedLocation : null}
          canManagePoints={canManagePoints}
          isV2={isV2}
          onPointAdded={selectPoint}
        />
        <PointMarkers
          points={visiblePoints}
          canManagePoints={canManagePoints}
          isV2={isV2}
          selection={selection && "point" in selection ? selection : null}
          clustering={clustering}
          onPointEdit={setEditingPoint}
        />
      </MapContainer>
      {canManagePoints && editingPoint && (
        <MobileMapDialog title="Upravit bod" onClose={() => setEditingPoint(null)}>
          <PointEditorForm
            point={editingPoint}
            isV2={isV2}
            inDialog
            onSaved={(point) => {
              setEditingPoint(null);
              selectPoint(point);
            }}
          />
        </MobileMapDialog>
      )}
    </>
  );
}
