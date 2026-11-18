"use client";

import type { LatLng, LatLngTuple, LeafletKeyboardEvent, LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import { isValidMapLocation, mapLocationParams, type MapLocation } from "@/lib/map-location";

type Selection = MapLocation & { key: number; focusAction: boolean };

function LocationActions({ location, onClose }: { location: Selection; onClose: () => void }) {
  const map = useMap();
  const params = mapLocationParams(location);
  const position = useMemo<LatLngTuple>(() => [location.y, location.x], [location.x, location.y]);
  const [status, setStatus] = useState<{ copied: true } | { copied: false; url: string } | null>(null);
  const focusFirstAction = useCallback((link: HTMLAnchorElement | null) => {
    if (location.focusAction) link?.focus({ preventScroll: true });
  }, [location.focusAction]);

  async function copyLocation() {
    const url = new URL(`/?${params}`, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setStatus({ copied: true });
    } catch {
      setStatus({ copied: false, url });
    }
  }

  return (
    <Popup
      position={position}
      className="map-location-popup"
      closeButton={false}
      offset={[0, -12]}
      autoPanPaddingTopLeft={[16, 152]}
      autoPanPaddingBottomRight={[16, 96]}
      eventHandlers={{ remove: onClose }}
    >
      <div
        className="map-location-actions"
        role="group"
        aria-label="Akce pro vybrané místo"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            map.closePopup();
            map.getContainer().focus();
          }
        }}
      >
        <a ref={focusFirstAction} href={`/navrhnout-misto?${params}`}>Navrhnout místo</a>
        <button type="button" onClick={copyLocation}>Zkopírovat odkaz</button>
        {status?.copied && <span role="status">Odkaz zkopírován.</span>}
        {status && !status.copied && (
          <label>
            Odkaz ke zkopírování
            <input readOnly value={status.url} onFocus={(event) => event.currentTarget.select()} />
          </label>
        )}
      </div>
    </Popup>
  );
}

export default function MapLocationMenu({ sharedLocation }: { sharedLocation: MapLocation | null }) {
  const map = useMap();
  const [selection, setSelection] = useState<Selection | null>(null);
  const nextKey = useRef(0);
  const lastPointer = useRef("");

  useEffect(() => {
    const container = map.getContainer();
    function rememberPointer(event: PointerEvent) {
      lastPointer.current = event.pointerType;
    }
    function clearMenuOnReturn(event: PageTransitionEvent) {
      if (event.persisted) setSelection(null);
    }
    container.addEventListener("pointerdown", rememberPointer, true);
    window.addEventListener("pageshow", clearMenuOnReturn);
    return () => {
      container.removeEventListener("pointerdown", rememberPointer, true);
      window.removeEventListener("pageshow", clearMenuOnReturn);
    };
  }, [map]);

  function openAt({ lat, lng }: LatLng, focusAction = false) {
    const location = { x: lng, y: lat, zoom: map.getZoom() };
    if (isValidMapLocation(location)) setSelection({ ...location, key: nextKey.current++, focusAction });
  }

  useMapEvents({
    contextmenu(event: LeafletMouseEvent) {
      openAt(event.latlng);
    },
    click(event: LeafletMouseEvent) {
      const reportedPointer = "pointerType" in event.originalEvent ? event.originalEvent.pointerType : null;
      const pointer = reportedPointer || lastPointer.current;
      lastPointer.current = "";
      if (pointer === "touch" || pointer === "pen") openAt(event.latlng);
    },
    keydown({ originalEvent }: LeafletKeyboardEvent) {
      if (originalEvent.target !== map.getContainer()) return;
      if (originalEvent.key === "ContextMenu" || (originalEvent.shiftKey && originalEvent.key === "F10")) {
        originalEvent.preventDefault();
        openAt(map.getCenter(), true);
      }
    },
    dragstart: () => setSelection(null),
    zoomstart: () => setSelection(null),
  });

  const marker = selection ?? sharedLocation;
  return (
    <>
      {marker && (
        <CircleMarker
          center={[marker.y, marker.x]}
          radius={8}
          className="map-location-marker"
          interactive={false}
          color="#fff"
          fillOpacity={1}
          weight={2}
        />
      )}
      {selection && (
        <LocationActions
          key={selection.key}
          location={selection}
          onClose={() => setSelection((current) => current?.key === selection.key ? null : current)}
        />
      )}
    </>
  );
}
