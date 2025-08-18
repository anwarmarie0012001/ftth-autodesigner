import axios from "axios";

// Ganti sesuai URL backend kamu di GitHub Codespaces
export const API_BASE = import.meta.env.VITE_API_BASE || "https://<workspace-id>-8000.app.github.dev";

export const api = axios.create({ baseURL: API_BASE });

// ---- ODC ----
export const setODCBoundary = async (latlngArray) => {
  const boundary = latlngArray.map(p => [p.lng, p.lat]);
  const { data } = await api.post("/api/odc/boundary", { boundary });
  return data;
};

export const setODCMarker = async ({ lat, lng }) => {
  const { data } = await api.post("/api/odc/marker", { marker: { lat, lng } });
  return data;
};

// ---- ODP ----
export const generateODP = async ({ housesGeoJSON, roadsGeoJSON, minH = 8, maxH = 16 }) => {
  const payload = {
    min_houses: minH,
    max_houses: maxH,
    road_merge_threshold_m: 8,
    houses: housesGeoJSON || null,
    roads: roadsGeoJSON || null,
  };
  const { data } = await api.post("/api/odp/generate", payload);
  return data;
};
