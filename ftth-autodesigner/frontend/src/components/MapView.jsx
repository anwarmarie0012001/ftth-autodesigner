import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { generateODP } from "../api.js";
import ODPLogo from "@/assets/LogoODP.png";

const odpIcon = L.icon({
  iconUrl: ODPLogo,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Simple polygon drawer (klik beberapa titik, Enter untuk selesai, Backspace untuk undo)
function PolygonDrawer({ onDone }) {
  const [points, setPoints] = useState([]);
  useMapEvents({
    click(e) {
      setPoints(p => [...p, [e.latlng.lat, e.latlng.lng]]);
    },
    keydown(e) {
      if (e.originalEvent.key === "Enter" && points.length >= 3) {
        onDone(points);
      }
      if (e.originalEvent.key === "Backspace") {
        setPoints(p => p.slice(0, -1));
      }
    }
  });
  return points.length ? <Polygon positions={points} color="red" /> : null;
}

export default function MapView() {
  const [odc, setOdc] = useState(null); // [[lat,lng],...]
  const [odpBoundaries, setOdpBoundaries] = useState([]); // array of polygons (GeoJSON)
  const [odpPoints, setOdpPoints] = useState([]); // array of Points (GeoJSON)

  const [gridSize, setGridSize] = useState(60);
  const [snapTh, setSnapTh] = useState(8);
  const roadsRef = useRef(null);

  const handleFinishDraw = async (latlngs) => {
    setOdc(latlngs);
  };

  const handleGenerate = async () => {
    if (!odc) return;

    // siapkan Feature GeoJSON Polygon dari ODC
    const coords = odc.map(([lat, lng]) => [lng, lat]); // GeoJSON (lon,lat)
    const feature = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[...coords, coords[0]]] },
      properties: {}
    };

    // optional roads (user upload file GeoJSON di input file)
    let roadsGeoJSON = null;
    if (roadsRef.current?.files?.[0]) {
      const txt = await roadsRef.current.files[0].text();
      roadsGeoJSON = JSON.parse(txt);
    }

    const res = await generateODP({
      odcFeature: feature,
      roadsGeoJSON,
      gridSizeM: Number(gridSize),
      snapThresholdM: Number(snapTh)
    });

    setOdpBoundaries(res.odp_boundaries || []);
    setOdpPoints(res.odp_points || []);
  };

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "56px 1fr" }}>
      <div style={{ padding: "8px", display: "flex", gap: 8, alignItems: "center", background: "#f6f6f6" }}>
        <span><b>Draw ODC:</b> klik di peta untuk titik, <i>Enter</i> untuk selesai, <i>Backspace</i> untuk undo.</span>
        <label>Grid (m): <input type="number" value={gridSize} onChange={e=>setGridSize(e.target.value)} style={{width:70}}/></label>
        <label>Snap≤ (m): <input type="number" value={snapTh} onChange={e=>setSnapTh(e.target.value)} style={{width:70}}/></label>
        <label>Roads GeoJSON: <input ref={roadsRef} type="file" accept=".json,.geojson" /></label>
        <button onClick={handleGenerate}>Generate ODP</button>
      </div>

      <MapContainer
        center={[-6.2, 106.85]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => {
          // enable keyboard capture for drawer
          map.getContainer().tabIndex = "0";
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!odc && <PolygonDrawer onDone={handleFinishDraw} />}

        {odc && <Polygon positions={odc} pathOptions={{ color: "red" }} />}

        {odpBoundaries.map((g, i) => {
          // g adalah GeoJSON Polygon {type:'Polygon', coordinates: [[[lon,lat],...]]}
          const latlngs = g.coordinates[0].map(([lon, lat]) => [lat, lon]);
          return <Polygon key={i} positions={latlngs} pathOptions={{ color: "blue" }} />;
        })}

        {odpPoints.map((g, i) => {
          const [lon, lat] = g.coordinates;
          return <Marker key={i} position={[lat, lon]} icon={odpIcon} />;
        })}
      </MapContainer>
    </div>
  );
}
