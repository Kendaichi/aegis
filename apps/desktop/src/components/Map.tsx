import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Report } from "../lib/api";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  report: Report | null;
}

export default function MapView({ report }: Props) {
  const center: [number, number] = report?.location
    ? [report.location.lat, report.location.lng]
    : [20, 0];
  const zoom = report?.location ? 14 : 2;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {report?.location && (
        <Marker position={[report.location.lat, report.location.lng]}>
          <Popup>
            <strong>Severity:</strong> {report.overall_severity}
            <br />
            {report.summary}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
