from typing import List, Optional, Dict, Any
from shapely.geometry import shape, LineString

def parse_roads_from_geojson(geojson: Dict[str, Any]) -> List[LineString]:
    """Ambil semua LineString dari GeoJSON (Feature atau FeatureCollection)."""
    out: List[LineString] = []
    if not geojson:
        return out

    if geojson.get("type") == "FeatureCollection":
        feats = geojson.get("features", [])
        for f in feats:
            geom = f.get("geometry")
            if not geom:
                continue
            g = shape(geom)
            if isinstance(g, LineString):
                out.append(g)
            elif hasattr(g, "geoms"):
                out.extend([ls for ls in g.geoms if isinstance(ls, LineString)])
    elif geojson.get("type") == "Feature":
        g = shape(geojson.get("geometry"))
        if isinstance(g, LineString):
            out.append(g)
        elif hasattr(g, "geoms"):
            out.extend([ls for ls in g.geoms if isinstance(ls, LineString)])
    return out
