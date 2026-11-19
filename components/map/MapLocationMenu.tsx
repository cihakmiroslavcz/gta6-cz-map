"use client";

import type { LatLng, LatLngTuple, LeafletKeyboardEvent, LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import SuggestionForm from "@/app/navrhnout-misto/SuggestionForm";
import { isValidMapLocation, mapLocationParams, type MapLocation } from "@/lib/map-location";
import AddPointForm from "./AddPointForm";
import MobileMapDialog from "./MobileMapDialog";
import type { MapPoint } from "./map-points";

type Selection = MapLocation & { key: number; focusAction: boolean };
type MobileDialog = { kind: "add" | "suggest"; location: MapLocation };

function usesMobileDialog() {
  return window.matchMedia("(pointer: coarse), (max-width: 640px)").matches;
}

type LocationActionsProps = {
  location: Selection;
  canManagePoints: boolean;
  onPointAdded: (point: MapPoint) => void;
  onOpenMobileDialog: (dialog: MobileDialog) => void;
  onClose: () => void;
};

function LocationActions({ location, canManagePoints, onPointAdded, onOpenMobileDialog, onClose }: LocationActionsProps) {
  const map = useMap();
  const params = mapLocationParams(location);
  const position = useMemo<LatLngTuple>(() => [location.y, location.x], [location.x, location.y]);
  const [status, setStatus] = useState<{ copied: true } | { copied: false; url: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const focusFirstAction = useCallback((control: HTMLElement | null) => {
    if (location.focusAction) control?.focus({ preventScroll: true });
  }, [location.focusAction]);
  const handlePointAdded = useCallback((point: MapPoint) => {
    map.closePopup();
    onPointAdded(point);
  }, [map, onPointAdded]);

  function openMobileDialog(kind: MobileDialog["kind"]) {
    onOpenMobileDialog({ kind, location });
    map.closePopup();
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      map.closePopup();
      map.getContainer().focus();
    }
  }

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
      offset={[0, -12]}
      autoPanPaddingTopLeft={[16, 152]}
      autoPanPaddingBottomRight={[16, 96]}
      eventHandlers={{ remove: onClose }}
    >
      {editing && canManagePoints ? (
        <div onKeyDown={closeOnEscape}>
          <AddPointForm location={location} onAdded={handlePointAdded} />
        </div>
      ) : (
        <div className="map-location-actions" role="group" aria-label="Akce pro vybrané místo" onKeyDown={closeOnEscape}>
          {canManagePoints && (
            <button
              ref={focusFirstAction}
              type="button"
              onClick={(event) => {
                // The menu unmounts on this click. Keep Leaflet from also handling it as a map click.
                event.stopPropagation();
                if (usesMobileDialog()) {
                  openMobileDialog("add");
                } else {
                  setEditing(true);
                }
              }}
            >
              Přidat bod
            </button>
          )}
          <a
            ref={canManagePoints ? undefined : focusFirstAction}
            href={`/navrhnout-misto?${params}`}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !usesMobileDialog()) return;
              event.preventDefault();
              event.stopPropagation();
              openMobileDialog("suggest");
            }}
          >
            Navrhnout místo
          </a>
          <button type="button" onClick={copyLocation}>Zkopírovat odkaz</button>
          {status?.copied && <span role="status">Odkaz zkopírován.</span>}
          {status && !status.copied && (
            <label>
              Odkaz ke zkopírování
              <input readOnly value={status.url} onFocus={(event) => event.currentTarget.select()} />
            </label>
          )}
        </div>
      )}
    </Popup>
  );
}

export default function MapLocationMenu({ sharedLocation, canManagePoints, onPointAdded }: {
  sharedLocation: MapLocation | null;
  canManagePoints: boolean;
  onPointAdded: (point: MapPoint) => void;
}) {
  const map = useMap();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mobileDialog, setMobileDialog] = useState<MobileDialog | null>(null);
  const nextKey = useRef(0);
  const lastPointer = useRef("");

  useEffect(() => {
    const container = map.getContainer();
    function rememberPointer(event: PointerEvent) {
      lastPointer.current = event.pointerType;
    }
    function clearMenuOnReturn(event: PageTransitionEvent) {
      if (event.persisted) {
        setSelection(null);
        setMobileDialog(null);
      }
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

  const activeDialog = mobileDialog?.kind === "add" && !canManagePoints ? null : mobileDialog;
  const marker = activeDialog?.location ?? selection ?? sharedLocation;
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
          canManagePoints={canManagePoints}
          onPointAdded={onPointAdded}
          onOpenMobileDialog={setMobileDialog}
          onClose={() => setSelection((current) => current?.key === selection.key ? null : current)}
        />
      )}
      {activeDialog && (
        <MobileMapDialog
          title={activeDialog.kind === "add" ? "Přidat bod" : "Navrhnout místo"}
          onClose={() => setMobileDialog(null)}
        >
          {activeDialog.kind === "add" ? (
            <AddPointForm
              location={activeDialog.location}
              inDialog
              onAdded={(point) => {
                setMobileDialog(null);
                onPointAdded(point);
              }}
            />
          ) : (
            <SuggestionForm location={activeDialog.location} inDialog />
          )}
        </MobileMapDialog>
      )}
    </>
  );
}
