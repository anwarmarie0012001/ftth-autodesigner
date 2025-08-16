import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import axios from "axios";
import LogoODC from "/src/assets/LogoODC.png";   // pastikan path bener

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

const MapView = () => {
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const [drawing, setDrawing] = useState(false);
  const [odcBoundary, setOdcBoundary] = useState(null);
  const [placingODC, setPlacingODC] = useState(false);
  const [odcMarker, setOdcMarker] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([-6.2, 106.8], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
      }).addTo(mapRef.current);
      drawnItemsRef.current.addTo(mapRef.current);
    }
  }, []);

  // Mulai gambar boundary ODC
  const startDrawBoundary = () => {
    if (!mapRef.current) return;
    setDrawing(true);
    const drawControl = new L.Draw.Polygon(mapRef.current, {
      allowIntersection: false,
      showArea: true,
      shapeOptions: { color: "blue" },
    });
    drawControl.enable();

    mapRef.current.once(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);
      const coords = layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]);

      if (coords.length < 4) {
        alert("Boundary ODC minimal 4 titik!");
        return;
      }

      setOdcBoundary(coords);
      api.post("/odc/boundary", { boundary: coords })
        .then(() => alert("Boundary ODC berhasil disimpan"))
        .catch((err) => console.error("Gagal simpan boundary:", err));

      setDrawing(false);
    });
  };

  // Mode penempatan ODC marker
  const enableODCMarkerPlacement = () => {
    if (!odcBoundary) {
      alert("Boundary ODC harus dibuat dulu!");
      return;
    }
    setPlacingODC(true);
    alert("Klik pada map untuk menempatkan ODC marker");
  };

  // Klik map untuk pasang marker ODC
  useEffect(() => {
    if (!mapRef.current) return;

    const handleClick = (e) => {
      if (!placingODC) return;

      if (odcMarker) {
        mapRef.current.removeLayer(odcMarker);
      }

      const customIcon = L.icon({
        iconUrl: LogoODC,
        iconSize: [32, 32], // dibuat kecil
        iconAnchor: [16, 16],
      });

      const marker = L.marker(e.latlng, { icon: customIcon }).addTo(mapRef.current);
      setOdcMarker(marker);

      api.post("/odc/marker", {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      })
        .then(() => alert("Marker ODC berhasil disimpan"))
        .catch((err) => console.error("Gagal set ODC marker:", err));

      setPlacingODC(false);
    };

    mapRef.current.on("click", handleClick);
    return () => {
      mapRef.current.off("click", handleClick);
    };
  }, [placingODC, odcMarker]);

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={startDrawBoundary} disabled={drawing}>
          Gambar Boundary ODC
        </button>
        <button onClick={enableODCMarkerPlacement}>
          Set ODC Marker
        </button>
      </div>
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
};

export default MapView;
