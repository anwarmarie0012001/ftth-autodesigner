import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, GeoJSON, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css"; 

import logoODC from '/src/assets/LogoODC.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickEventHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick(e);
        },
    });
    return null;
}

export default function MapView() {
  const [boundary, setBoundary] = useState(null);
  const [odcMarker, setOdcMarker] = useState(null);
  const [odpClusters, setOdpClusters] = useState([]);
  const featureGroupRef = useRef();

  const odcIcon = new L.Icon({
    iconUrl: logoODC,
    iconSize: [30, 30],
  });

  const odpIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
    iconSize: [20, 20],
  });

  const handleCreated = (e) => {
    const layer = e.layer;
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
    const geojson = layer.toGeoJSON();
    setBoundary(geojson.geometry);
    setOdpClusters([]);
    setOdcMarker(null);
  };

  const handleMapClick = (e) => {
    if (boundary) {
      setOdcMarker([e.latlng.lat, e.latlng.lng]);
    }
  };
  
  const handleSaveODC = async () => {
    if (!boundary || !odcMarker) {
      alert("Gambar boundary ODC dan pilih titik ODC dulu.");
      return;
    }
    console.log("Boundary:", boundary);
    console.log("ODC Marker:", odcMarker);
    alert("ODC berhasil disimpan (dummy).");
  };

  const handleGenerateODP = async () => {
    if (!boundary) {
      alert("Gambar boundary ODC dulu.");
      return;
    }
    try {
      // [FIX] Gunakan URL publik Codespaces untuk backend secara langsung
      const backendUrl = "https://ominous-parakeet-6qqrjj5vvg7355j9-8000.app.github.dev/odp/generate";
      
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boundary: boundary }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setOdpClusters(data.clusters || []);
      } else {
        alert("Gagal generate ODP: " + data.message);
      }
    } catch (err) {
      alert("Error saat menghubungi backend: " + err.message);
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
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
        />
        
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topleft"
            onCreated={handleCreated}
            draw={{
              rectangle: true,
              polygon: true,
              circle: false,
              marker: false,
              circlemarker: false,
              polyline: false,
            }}
            edit={{
                edit: false,
                remove: true
            }}
          />
        </FeatureGroup>

        <ClickEventHandler onClick={handleMapClick} />

        {odcMarker && (
          <Marker position={odcMarker} icon={odcIcon}>
            <Popup>ODC</Popup>
          </Marker>
        )}

        {odpClusters.map((cluster) => (
          <React.Fragment key={cluster.odp_id}>
            <GeoJSON data={cluster.boundary} style={{ color: 'blue', weight: 2 }} />
            <Marker position={[cluster.location[1], cluster.location[0]]} icon={odpIcon}>
              <Popup>
                <b>{cluster.odp_id}</b><br/>
                Jumlah Rumah: {cluster.house_count}
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}