import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

export default function MapView() {
  const mapRef = useRef();
  const [boundary, setBoundary] = useState(null);
  const [odcMarker, setOdcMarker] = useState(null);
  const [odpPoints, setOdpPoints] = useState([]);

  // icon ODC
  const odcIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
  });

  // icon ODP
  const odpIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
    iconSize: [20, 20],
  });

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        rectangle: true,
        marker: false,
        circle: false,
        polyline: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    // event: boundary digambar
    map.on(L.Draw.Event.CREATED, function (e) {
      const layer = e.layer;
      drawnItems.clearLayers(); // cuma boleh 1 boundary
      drawnItems.addLayer(layer);

      const geojson = layer.toGeoJSON();
      setBoundary(geojson.geometry);
    });

    // event: klik map untuk titik ODC
    map.on("click", function (e) {
      setOdcMarker([e.latlng.lat, e.latlng.lng]);
    });
  }, []);

  // Simpan boundary + titik ODC
  const handleSaveODC = async () => {
    if (!boundary || !odcMarker) {
      alert("Gambar boundary ODC dan pilih titik ODC dulu.");
      return;
    }
    console.log("Boundary:", boundary);
    console.log("ODC Marker:", odcMarker);
    alert("ODC berhasil disimpan (dummy).");
  };

  // Generate ODP dari backend
  const handleGenerateODP = async () => {
    if (!boundary) {
      alert("Gambar boundary ODC dulu.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/odp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boundary),
      });
      const data = await res.json();
      if (data.status === "success") {
        setOdpPoints(data.house_coords || []);
      } else {
        alert("Gagal generate ODP: " + data.message);
      }
    } catch (err) {
      alert("Error fetch backend: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleSaveODC} style={{ marginRight: "10px" }}>
          Simpan ODC
        </button>
        <button onClick={handleGenerateODP}>Generate ODP</button>
      </div>

      <MapContainer
        center={[-6.2, 106.8]}
        zoom={15}
        style={{ height: "90vh", width: "100%" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
        />

        {/* Titik ODC */}
        {odcMarker && (
          <Marker position={odcMarker} icon={odcIcon}>
            <Popup>ODC</Popup>
          </Marker>
        )}

        {/* Titik ODP hasil backend */}
        {odpPoints.map((p, i) => (
          <Marker key={i} position={[p[1], p[0]]} icon={odpIcon}>
            <Popup>ODP {i + 1}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
