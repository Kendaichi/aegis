/**
 * MapLibre GL map primitives (MapCN-style: own the code, Tailwind-friendly).
 * Built on maplibre-gl — no Leaflet.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/** CARTO Dark Matter — no API key */
export const DEFAULT_MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const MapContext = createContext<maplibregl.Map | null>(null);

export function useMap(): maplibregl.Map {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error("useMap must be used inside <Map>");
  }
  return map;
}

interface MapProps {
  /** [lng, lat] per MapLibre */
  center: [number, number];
  zoom: number;
  className?: string;
  children?: ReactNode;
}

export function Map({ center, zoom, className, children }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_MAP_STYLE,
      center,
      zoom,
    });

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    setMap(m);
    return () => {
      m.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per mount
  }, []);

  useEffect(() => {
    if (!map || !containerRef.current) return;
    const el = containerRef.current;
    const resize = () => {
      map.resize();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  useEffect(() => {
    if (!map) return;
    map.flyTo({ center, zoom, duration: 700, essential: true });
  }, [map, center[0], center[1], zoom]);

  return (
    <MapContext.Provider value={map}>
      <div className={`relative h-full min-h-[200px] w-full overflow-hidden rounded-lg ${className ?? ""}`}>
        <div ref={containerRef} className="maplibregl-map h-full w-full" />
        {map ? children : null}
      </div>
    </MapContext.Provider>
  );
}

interface FitBoundsProps {
  /** [lng, lat] pairs */
  points: [number, number][];
  /** Bump to re-run fitBounds after e.g. temporary fly-to focus is cleared. */
  revision?: number;
}

export function FitBounds({ points, revision = 0 }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    points.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 40, maxZoom: 9, duration: 0 });
  }, [map, points, revision]);

  return null;
}

interface MarkerProps {
  lngLat: [number, number];
  children: ReactNode;
  popupHtml?: string;
}

export function Marker({ lngLat, children, popupHtml }: MarkerProps) {
  const map = useMap();
  const [container] = useState(() => {
    const div = document.createElement("div");
    div.className = "flex items-center justify-center";
    return div;
  });
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    const marker = new maplibregl.Marker({ element: container }).setLngLat(lngLat).addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
      popupRef.current = null;
    };
  }, [map, container]);

  useEffect(() => {
    markerRef.current?.setLngLat(lngLat);
  }, [lngLat[0], lngLat[1]]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (!popupHtml) {
      popupRef.current?.remove();
      popupRef.current = null;
      return;
    }
    if (popupRef.current) {
      popupRef.current.setHTML(popupHtml);
      return;
    }
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);
    marker.setPopup(popup);
    popupRef.current = popup;
  }, [popupHtml]);

  return createPortal(children, container);
}

/** Dot marker for severity overlays */
export function SeverityDot({
  color,
  selected,
}: {
  color: string;
  /** Highlights the active incident when selecting from the side panel */
  selected?: boolean;
}) {
  return (
    <div
      className={`rounded-full border-2 border-white/90 shadow-md ${
        selected ? "h-4 w-4 ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0f172a]" : "h-3 w-3"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}
