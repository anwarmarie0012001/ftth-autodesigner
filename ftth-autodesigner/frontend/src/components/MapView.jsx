import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import LogoODC from "../assets/LogoODC.png";
import LogoODP from "../assets/LogoODP.png";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

const MapView = () => {
  const [odcBoundary, setOdcBoundary] = useState([]);
  const [drawingOdc, setDrawingOdc] = useState(false);
  const [odcMarker, setOdcMarker] = useState(null);

  const [odpBoundaries, setOdpBoundaries] = useState([]);
  const [odpMarkers, setOdpMarkers] = useState([]);

  const mapRef = useRef();

  const odcIcon = new L.Icon({
    iconUrl: LogoODC,
    iconSize: [30, 30], // kecil
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const odpIcon = new L.Icon({
    iconUrl: LogoODP,
    iconSize: [20, 20], // lebih kecil lagi
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
  });

  const handleMapClick = (e) => {
    if (drawingOdc) {
      const newBoundary = [...odcBoundary, [e.latlng.lat, e.latlng.lng]];
      setOdcBoundary(newBoundary);
    }
  };

  const startDrawing = () => {
    setOdcBoundary([]);
    setOdcMarker(null);
    setOdpBoundaries([]);
    setOdpMarkers([]);
    setDrawingOdc(true);
  };

  const finishDrawing = async () => {
    if (odcBoundary.length < 4) {
      alert("Minimal 4 titik untuk boundary ODC!");
      return;
    }
    setDrawingOdc(false);

    try {
      console.log("Kirim boundary ke backend:", odcBoundary);
      const res = await api.post("/odc/set", { boundary: odcBoundary });

      setOdcMarker(res.data.odc_marker);
      setOdpBoundaries(res.data.odp_boundaries);
      setOdpMarkers(res.data.odp_markers);

      console.log("ODP Boundaries:", res.data.odp_boundaries);
      console.log("ODP Markers:", res.data.odp_markers);
    } catch (err) {
      console.error("Gagal simpan boundary:", err);
    }
  };

  return (
    <div>
      <button onClick={startDrawing}>Gambar Boundary ODC</button>
      <button onClick={finishDrawing}>Selesai Boundary</button>

      <MapContainer
        center={[-6.2, 106.8]}
        zoom={15}
        style={{ height: "90vh", width: "100%" }}
        whenCreated={(map) => {
          mapRef.current = map;
          map.on("click", handleMapClick);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {odcBoundary.length > 0 && (
          <Polygon positions={odcBoundary} color="blue" />
        )}

        {odcMarker && (
          <Marker position={odcMarker} icon={odcIcon}>
            <Popup>ODC</Popup>
          </Marker>
        )}

        {odpBoundaries.map((boundary, i) => (
          <Polygon key={i} positions={boundary} color="green" />
        ))}

        {odpMarkers.map((pos, i) => (
          <Marker key={i} position={pos} icon={odpIcon}>
            <Popup>ODP {i + 1}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
