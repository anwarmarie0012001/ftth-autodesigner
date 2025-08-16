import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const uploadODC = async (odcFeature) => {
  return axios.post(`${BASE}/odc/upload`, odcFeature).then(r => r.data);
};

export const generateODP = async ({ odcFeature, roadsGeoJSON, gridSizeM, snapThresholdM }) => {
  const payload = {
    odc_feature: odcFeature,
    roads_geojson: roadsGeoJSON || null,
    grid_size_m: gridSizeM ?? 60,
    snap_threshold_m: snapThresholdM ?? 8
  };
  return axios.post(`${BASE}/odp/generate`, payload).then(r => r.data);
};
