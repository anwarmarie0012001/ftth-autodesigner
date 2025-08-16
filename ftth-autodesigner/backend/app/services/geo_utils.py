from shapely.geometry import Polygon, MultiPolygon, base
import math

def meters_to_deg_lat(meters: float) -> float:
    # ~111_320 m per degree latitude
    return meters / 111_320.0

def meters_to_deg_lon(meters: float, lat_deg: float) -> float:
    # skala longitude tergantung latitude
    return meters / (111_320.0 * max(math.cos(math.radians(lat_deg)), 1e-6))

def ensure_polygon(g: base.BaseGeometry) -> Polygon:
    if isinstance(g, Polygon):
        return g
    if isinstance(g, MultiPolygon):
        # ambil yang area-nya terbesar
        max_poly = max(list(g.geoms), key=lambda x: x.area)
        return max_poly
    raise ValueError("Geometry is not a Polygon/MultiPolygon")
