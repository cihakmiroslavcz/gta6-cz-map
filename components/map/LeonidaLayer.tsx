import { imageOverlay, latLngBounds, point, type ImageOverlay as LeafletImageOverlay, type LatLngBounds } from "leaflet";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ImageOverlay, Pane, useMap } from "react-leaflet";
import { leonidaAlignment, leonidaAssetRoot, type LeonidaManifest, type LeonidaStatus, type LeonidaVariant } from "./map-basemaps";

const paneName = "leonida";

type LeonidaLayerProps = {
  manifest: LeonidaManifest;
  variant: LeonidaVariant;
  opacity: number;
  status: LeonidaStatus;
  onStatusChange: (status: LeonidaStatus) => void;
  onTileError: () => void;
};

type Tile = { layer: LeafletImageOverlay; settled: boolean };

function clearTile(tiles: Map<string, Tile>, key: string, tile: Tile) {
  tile.layer.remove().off();
  tiles.delete(key);
}

function LeonidaTiles({ bounds, manifest, variant, enabled, onTileError }: {
  bounds: LatLngBounds;
  manifest: LeonidaManifest;
  variant: LeonidaVariant;
  enabled: boolean;
  onTileError: () => void;
}) {
  const map = useMap();
  const tileCache = useRef(new Map<string, Tile>());
  const requestedTiles = useRef(new Set<string>());

  useEffect(() => {
    const tiles = tileCache.current;
    return () => {
      for (const [key, tile] of tiles) clearTile(tiles, key, tile);
    };
  }, []);

  useEffect(() => {
    const tiles = tileCache.current;
    if (!enabled) return;

    const { tileSize } = manifest;
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const spanX = bounds.getEast() - west;
    const spanY = north - bounds.getSouth();

    function removeReplacedTiles() {
      for (const key of requestedTiles.current) {
        if (!tiles.get(key)?.settled) return;
      }
      for (const [key, tile] of tiles) {
        if (!requestedTiles.current.has(key)) clearTile(tiles, key, tile);
      }
    }

    function syncTiles() {
      const viewport = map.getBounds().pad(0.1);
      const displayWidth = map.project(bounds.getNorthEast()).x - map.project(bounds.getNorthWest()).x;
      const density = displayWidth * window.devicePixelRatio / manifest.width;
      const factor = density <= 0.5 ? 0.5 : density <= 1 ? 1 : variant;
      const requested = new Set<string>();
      requestedTiles.current = requested;

      if (!bounds.intersects(viewport) || density <= 0.25) {
        removeReplacedTiles();
        return;
      }

      const width = Math.max(1, Math.round(manifest.width * factor));
      const height = Math.max(1, Math.round(manifest.height * factor));
      const minColumn = Math.max(0, Math.floor((viewport.getWest() - west) / spanX * width / tileSize));
      const maxColumn = Math.ceil(Math.min(width, (viewport.getEast() - west) / spanX * width) / tileSize) - 1;
      const minRow = Math.max(0, Math.floor((north - viewport.getNorth()) / spanY * height / tileSize));
      const maxRow = Math.ceil(Math.min(height, (north - viewport.getSouth()) / spanY * height) / tileSize) - 1;

      for (let row = minRow; row <= maxRow; row++) {
        for (let column = minColumn; column <= maxColumn; column++) {
          const key = `${factor}/${column}-${row}`;
          requested.add(key);
          const existing = tiles.get(key);
          if (existing) {
            existing.layer.bringToFront();
            continue;
          }

          const left = column * tileSize;
          const top = row * tileSize;
          const right = Math.min(left + tileSize, width);
          const bottom = Math.min(top + tileSize, height);
          const tileBounds = latLngBounds(
            [north - bottom / height * spanY, west + left / width * spanX],
            [north - top / height * spanY, west + right / width * spanX],
          );
          const layer = imageOverlay(`${leonidaAssetRoot}/${key}.webp`, tileBounds, { pane: paneName, zIndex: 1 });
          const tile: Tile = { layer, settled: false };
          tiles.set(key, tile);
          layer.once("load", () => {
            tile.settled = true;
            removeReplacedTiles();
          });
          layer.once("error", () => {
            tile.settled = true;
            layer.remove();
            onTileError();
            removeReplacedTiles();
          });
          layer.addTo(map);
        }
      }

      // Keep old detail in view while the new level loads. The preview fills any gaps.
      for (const [key, tile] of tiles) {
        if (!requested.has(key) && (!tile.settled || !viewport.intersects(tile.layer.getBounds()))) {
          clearTile(tiles, key, tile);
        }
      }
      removeReplacedTiles();
    }

    syncTiles();
    map.on("moveend", syncTiles);
    return () => {
      map.off("moveend", syncTiles);
    };
  }, [bounds, enabled, manifest, map, onTileError, variant]);

  return null;
}

function LeonidaImages({ manifest, variant, opacity, status, onStatusChange, onTileError }: LeonidaLayerProps) {
  const map = useMap();
  const bounds = useMemo(() => {
    const { left, top, width } = leonidaAlignment;
    const height = width * manifest.height / manifest.width;
    return latLngBounds(map.unproject(point(left, top), 0), map.unproject(point(left + width, top + height), 0));
  }, [manifest, map]);

  useLayoutEffect(() => {
    const pane = map.getPane(paneName);
    if (pane) pane.style.opacity = String(opacity);
  }, [map, opacity]);

  return (
    <>
      <ImageOverlay
        url={`${leonidaAssetRoot}/preview.webp`}
        bounds={bounds}
        eventHandlers={{
          load: () => onStatusChange("ready"),
          error: () => onStatusChange("unavailable"),
        }}
      />
      <LeonidaTiles
        bounds={bounds}
        manifest={manifest}
        variant={variant}
        enabled={opacity > 0 && status === "ready"}
        onTileError={onTileError}
      />
    </>
  );
}

export default function LeonidaLayer(props: LeonidaLayerProps) {
  return (
    <Pane name={paneName} style={{ zIndex: 220, opacity: 0, pointerEvents: "none" }}>
      <LeonidaImages {...props} />
    </Pane>
  );
}
