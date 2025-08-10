import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, FeatureGroup, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

function App() {
  const [odcBoundary, setOdcBoundary] = useState([]);
  const [odcPoint, setOdcPoint] = useState(null);
  const [odpPoints, setOdpPoints] = useState([]);
  const featureGroupRef = useRef(null);

  const onCreated = (e) => {
    if (e.layerType === 'polygon') {
      const latlngs = e.layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
      setOdcBoundary(latlngs);
    }
    if (e.layerType === 'marker') {
      setOdcPoint({ lat: e.layer.getLatLng().lat, lng: e.layer.getLatLng().lng });
    }
  };

  const sendData = async () => {
    const res = await fetch("https://special-couscous-5jj4wwrvg4j24q7r-8000.app.github.dev/design-odc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        odc_boundary: odcBoundary,
        odc_point: odcPoint
      })
    });

    const data = await res.json();
    alert("Backend response: " + data.message);
    if (data.odp_points) {
      setOdpPoints(data.odp_points);
    }
  };

  return (
    <div>
      <h1>FTTH AutoDesigner</h1>
      <button onClick={sendData}>Kirim Data ke Backend</button>

      <MapContainer center={[-6.2, 106.8]} zoom={15} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position='topright'
            onCreated={onCreated}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: false
            }}
          />
        </FeatureGroup>

        {odpPoints.map((odp, i) => (
          <Marker key={i} position={[odp.lat, odp.lng]} />
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
