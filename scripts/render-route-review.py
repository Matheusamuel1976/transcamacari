import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "data/geography/0302-ida-candidate.geojson.json",
    ROOT / "data/geography/0302-volta-candidate.geojson.json",
]
OUTPUT = ROOT / "tmp/0302-route-review.png"


def project(point, bounds, width, height, margin):
    lon, lat = point
    min_lon, min_lat, max_lon, max_lat = bounds
    x = margin + (lon - min_lon) / (max_lon - min_lon) * (width - 2 * margin)
    y = height - margin - (lat - min_lat) / (max_lat - min_lat) * (height - 2 * margin)
    return round(x), round(y)


routes = [json.loads(path.read_text(encoding="utf-8")) for path in FILES]
coordinates = [point for route in routes for point in route["geometry"]["coordinates"]]
lons = [point[0] for point in coordinates]
lats = [point[1] for point in coordinates]
bounds = (min(lons), min(lats), max(lons), max(lats))

width, height, margin = 1500, 760, 80
image = Image.new("RGB", (width, height), "#f7f7f4")
draw = ImageDraw.Draw(image)
font_path = Path("C:/Windows/Fonts/arial.ttf")
font = ImageFont.truetype(font_path, 20)
small = ImageFont.truetype(font_path, 16)

colors = {"ida": "#152b9b", "volta": "#d16b32"}
for route in routes:
    direction = route["direction"]
    points = [project(point, bounds, width, height, margin) for point in route["geometry"]["coordinates"]]
    draw.line(points, fill=colors[direction], width=5)

for waypoint in routes[0]["waypoints"]:
    x, y = project((waypoint["lon"], waypoint["lat"]), bounds, width, height, margin)
    draw.ellipse((x - 7, y - 7, x + 7, y + 7), fill="#ffffff", outline="#111111", width=3)

draw.text((30, 24), "0302 — revisão geométrica esquemática", fill="#111111", font=font)
draw.text((30, 52), "Azul: ida | Laranja: volta | círculos: pontos de evidência", fill="#444444", font=small)
draw.text((30, height - 42), "Trajeto estimado — percurso sujeito a validação.", fill="#444444", font=small)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUTPUT)
print(OUTPUT)
