import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const api = axios.create({ baseURL: API_BASE });

// ---- ODC ----
export const setODCBoundary = async (latlngArray) => {
  const boundary = latlngArray.map(p => [p.lng, p.lat]);
  const { data } = await api.post("/odc/boundary", { boundary });
  return data;
};

export const setODCMarker = async ({ lat, lng }) => {
  const { data } = await api.post("/odc/marker", { marker: { lat, lng } });
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
  const { data } = await api.post("/odp/generate", payload);
  return data;
};
