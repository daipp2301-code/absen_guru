import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  radius?: number;
  posisiSaya?: { lat: number; lng: number } | null;
  className?: string;
  onPilih?: (lat: number, lng: number) => void;
};

export default function MapView({
  lat,
  lng,
  radius = 0,
  posisiSaya,
  className,
  onPilih,
}: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current).setView([lat, lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    if (onPilih) {
      map.current.on("click", (e: L.LeafletMouseEvent) =>
        onPilih(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))),
      );
    }
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [lat, lng, onPilih]);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    L.circleMarker([lat, lng], {
      radius: 8,
      color: "#2d7a4f",
      fillColor: "#2d7a4f",
      fillOpacity: 0.9,
    })
      .bindTooltip("Lokasi Sekolah")
      .addTo(layer.current);
    if (radius > 0) {
      L.circle([lat, lng], {
        radius,
        color: "#2d7a4f",
        fillColor: "#2d7a4f",
        fillOpacity: 0.12,
      }).addTo(layer.current);
    }
    if (posisiSaya) {
      L.circleMarker([posisiSaya.lat, posisiSaya.lng], {
        radius: 7,
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.9,
      })
        .bindTooltip("Posisi Anda")
        .addTo(layer.current);
    }
    map.current.setView([lat, lng], map.current.getZoom());
  }, [lat, lng, radius, posisiSaya]);

  return <div ref={el} className={className ?? "h-64 w-full rounded-xl"} />;
}
