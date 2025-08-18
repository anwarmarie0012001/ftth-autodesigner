import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for ODP
const odpIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);
  return null;
};

function App() {
  const [odcBoundary, setOdcBoundary] = useState(null);
  const [odcMarker, setOdcMarker] = useState(null);
  const [odpData, setOdpData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const featureGroupRef = useRef();

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      setOdcBoundary(layer.toGeoJSON());
      setOdcMarker(null); // Reset marker saat boundary baru dibuat
      setOdpData([]);
    }
  };

  const handleEdited = (e) => {
    e.layers.eachLayer(layer => {
      if (layer instanceof L.Polygon) {
        setOdcBoundary(layer.toGeoJSON());
      }
    });
  };

  const handleDeleted = () => {
    setOdcBoundary(null);
    setOdcMarker(null);
    setOdpData([]);
  };

  const handleMapClick = (e) => {
    if (odcBoundary && featureGroupRef.current) {
        const point = e.latlng;
        const polygonLayer = featureGroupRef.current.getLayers().find(layer => layer instanceof L.Polygon);
        
        // Cek apakah klik berada di dalam polygon
        // Trik sederhana: konversi ke GeoJSON dan gunakan library atau cek manual
        // Untuk Leaflet, cara termudah adalah dengan asumsi jika polygon ada, klik valid
        if (polygonLayer) {
             setOdcMarker(point);
        }
    }
  };

  const handleGenerateODP = async () => {
    if (!odcBoundary) {
      setError("Boundary ODC belum dibuat. Silakan gambar boundary terlebih dahulu.");
      return;
    }
    if (!odcMarker) {
      setError("Lokasi ODC belum ditentukan. Silakan klik di dalam boundary untuk menempatkan ODC.");
      return;
    }

    setIsLoading(true);
    setError('');
    setOdpData([]);

    try {
      const API_URL = "https://ominous-parakeet-6qqrjj5vvg7355j9-8000.app.github.dev"; 
      
      const response = await fetch(`${API_URL}/odp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boundary: odcBoundary.geometry }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Error ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setOdpData(result.odp_data);
      } else {
        throw new Error(result.message || "Gagal menghasilkan ODP.");
      }

    } catch (err) {
      setError(`Gagal generate ODP: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h1>FTTH Autodesigner</h1>
        <button onClick={() => alert("Data ODC disimpan (dummy).")} disabled={!odcBoundary || !odcMarker}>
          Simpan ODC
        </button>
        <button onClick={handleGenerateODP} disabled={!odcBoundary || !odcMarker || isLoading}>
          {isLoading ? 'Generating...' : 'Generate ODP'}
        </button>
        {error && <div style={{ color: 'red', marginLeft: '20px' }}>{error}</div>}
      </div>
      <MapContainer center={[-6.2088, 106.8456]} zoom={15} style={{ flex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false,
              polygon: odcBoundary ? false : { showArea: true },
            }}
          />
        </FeatureGroup>
        
        <MapClickHandler onMapClick={handleMapClick} />
        
        {odcMarker && (
          <Marker position={odcMarker}>
            <Popup>Lokasi ODC</Popup>
            <Tooltip permanent>ODC</Tooltip>
          </Marker>
        )}

        {odpData.map(odp => (
          <React.Fragment key={odp.id}>
            <Polygon 
              pathOptions={{ color: 'green', fillColor: 'lightgreen', weight: 2 }} 
              positions={odp.boundary.coordinates[0].map(coord => [coord[1], coord[0]])}
            >
                <Tooltip sticky>
                    <b>{odp.id}</b><br/>
                    Rumah: {odp.house_count}<br/>
                    Splitter: {odp.splitter}
                </Tooltip>
            </Polygon>
            <Marker position={odp.location} icon={odpIcon}>
               <Popup>
                    <b>{odp.id}</b><br/>
                    Rumah dilayani: {odp.house_count}<br/>
                    Kapasitas Splitter: {odp.splitter}
                </Popup>
            </Marker>
          </React.Fragment>
        ))}

      </MapContainer>
    </div>
  );
}

export default App;
