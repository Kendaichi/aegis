import { useEffect } from "react";
import { useMap } from "./map";

const BASE_URL = import.meta.env.VITE_PROVINCE_BOUNDARIES_URL;

const PROVINCES = [
  { id: "agusan-norte",  file: "Agusan_del_Norte.geojson",   color: "#3b82f6" },
  { id: "agusan-sur",    file: "Agusan_del_Sur.geojson",     color: "#8b5cf6" },
  { id: "dinagat",       file: "Dinagat_Islands.geojson",    color: "#06b6d4" },
  { id: "surigao-norte", file: "Surigao_del_Norte.geojson",  color: "#10b981" },
  { id: "surigao-sur",   file: "Surigao_del_Sur.geojson",    color: "#f59e0b" },
];

export default function ProvinceLayers() {
  const map = useMap();

  useEffect(() => {
    if (!BASE_URL) {
      console.warn("VITE_PROVINCE_BOUNDARIES_URL is not set; province layers disabled.");
      return;
    }

    function add() {
      for (const p of PROVINCES) {
        if (map.getSource(p.id)) continue;
        map.addSource(p.id, { type: "geojson", data: `${BASE_URL}/${p.file}` });
        map.addLayer({
          id: `${p.id}-fill`,
          type: "fill",
          source: p.id,
          paint: { "fill-color": p.color, "fill-opacity": 0.15 },
        });
        map.addLayer({
          id: `${p.id}-line`,
          type: "line",
          source: p.id,
          paint: { "line-color": p.color, "line-width": 1.5, "line-opacity": 0.7 },
        });
      }
    }

    if (map.isStyleLoaded()) {
      add();
    } else {
      map.once("load", add);
    }

    return () => {
      map.off("load", add);
      if (!map.getStyle()) return;
      for (const p of PROVINCES) {
        if (map.getLayer(`${p.id}-line`)) map.removeLayer(`${p.id}-line`);
        if (map.getLayer(`${p.id}-fill`)) map.removeLayer(`${p.id}-fill`);
        if (map.getSource(p.id)) map.removeSource(p.id);
      }
    };
  }, [map]);

  return null;
}
