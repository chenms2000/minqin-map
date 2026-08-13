#!/usr/bin/env python3
"""Build a local, documentary-toned Sentinel-2 surface PMTiles archive.

This offline-only preparation script reads the B04/B03/B02 Cloud-Optimized
GeoTIFFs published by Element 84 on AWS Open Data, crops them to Minqin, and
packs color-graded JPEG tiles into PMTiles. It adds no production dependency
and never creates a runtime network request.

Preparation environment (kept outside the production bundle):
  uv venv --python 3.12 .surface-venv
  uv pip install --python .surface-venv/Scripts/python.exe \
    rasterio==1.4.3 mercantile==1.2.1 pillow==11.3.0 numpy==2.2.6
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import math
import os
import platform
import re
import shutil
import sqlite3
import subprocess
import tarfile
import tempfile
import time
import urllib.request
import urllib.parse
import zipfile
from pathlib import Path

os.environ.setdefault("CPL_VSIL_CURL_USE_HEAD", "NO")
os.environ.setdefault("GDAL_HTTP_VERSION", "1.1")
os.environ.setdefault("GDAL_HTTP_UNSAFESSL", "YES")

import mercantile
import numpy as np
import rasterio
from PIL import Image, ImageEnhance
from rasterio.transform import from_origin
from rasterio.warp import Resampling, reproject, transform_bounds


ACQUIRED_AT = "2026-08-13"
SCENE_DATE = "2026-08-06"
MAP_BOUNDS = [102.45, 37.8, 103.75, 39.35]
PROTOTYPE_BOUNDS = [102.70, 38.35, 103.55, 39.02]
RENDER_CONTEXT_BOUNDS = [102.12890625, 37.474858084971025, 104.0625, 39.67337039176559]
FULL_BOUNDS = RENDER_CONTEXT_BOUNDS
MIN_ZOOM = 7
MAX_ZOOM = 13
WORKING_RESOLUTION_METRES = 30
JPEG_QUALITY = 80
PMTILES_VERSION = "1.31.2"
PMTILES_RELEASE_BASE = f"https://github.com/protomaps/go-pmtiles/releases/download/v{PMTILES_VERSION}"
STAC_ROOT = "https://earth-search.aws.element84.com/v1"
STAC_BASE = f"{STAC_ROOT}/collections/sentinel-2-c1-l2a/items"

PMTILES_RELEASES = {
    ("Windows", "AMD64"): (
        f"go-pmtiles_{PMTILES_VERSION}_Windows_x86_64.zip",
        "a658baa4d7e55020aef6ca17bd9ff9faa1582671266b36f58c52db0ac8e785a1",
    ),
    ("Windows", "ARM64"): (
        f"go-pmtiles_{PMTILES_VERSION}_Windows_arm64.zip",
        "8780a17453c63af757917a694cbbb50b943db89cc3f1b07e6fd62c1ff8e6963b",
    ),
    ("Linux", "x86_64"): (
        f"go-pmtiles_{PMTILES_VERSION}_Linux_x86_64.tar.gz",
        "3ed7dbf4ec2e6dfe5e25b6f70d1ffc932729f93c86db353bf514dd71010a312f",
    ),
    ("Linux", "aarch64"): (
        f"go-pmtiles_{PMTILES_VERSION}_Linux_arm64.tar.gz",
        "f8bd47e7ea866863489cad588fbaf2f31f42e5821f7a03f009b3769f05801cb1",
    ),
    ("Darwin", "x86_64"): (
        f"go-pmtiles-{PMTILES_VERSION}_Darwin_x86_64.zip",
        "40528f7f616e05b63d0e04cb3ca776c47668a4c8619085531d53caac3e956d67",
    ),
    ("Darwin", "arm64"): (
        f"go-pmtiles-{PMTILES_VERSION}_Darwin_arm64.zip",
        "40528f7f616fcbf91207cd48c8fc023d213f6d86c0cbf1f748732803d1880f3d",
    ),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fetch_json(request: urllib.request.Request) -> dict:
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response)
        except Exception:
            if attempt == 3:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise AssertionError("unreachable")


def discover_scenes(bounds: list[float]) -> list[dict]:
    query = urllib.parse.urlencode({
        "collections": "sentinel-2-c1-l2a",
        "bbox": ",".join(map(str, bounds)),
        "datetime": f"{SCENE_DATE}T00:00:00Z/{SCENE_DATE}T23:59:59Z",
        "limit": "100",
    })
    request = urllib.request.Request(f"{STAC_ROOT}/search?{query}", headers={"User-Agent": "minqin-surface-prep/2026"})
    features = fetch_json(request)["features"]
    scenes = []
    for item in features:
        scene_id = item["id"]
        is_primary_pass = scene_id.startswith("S2A_T48") and "_20260806T040209_" in scene_id
        is_secondary_fill = scene_id.startswith(("S2B_T48SUG", "S2B_T48SVG")) and "_20260806T03" in scene_id
        if not (is_primary_pass or is_secondary_fill):
            continue
        properties = item["properties"]
        mgrs_tile = f"{properties['mgrs:utm_zone']}{properties['mgrs:latitude_band']}{properties['mgrs:grid_square']}"
        scenes.append({"id": scene_id, "mgrsTile": mgrs_tile, "cloudCover": properties["eo:cloud_cover"]})
    if not scenes:
        raise RuntimeError("No coherent Sentinel-2A 2026-08-06 scene set covered the requested bounds")
    return sorted(scenes, key=lambda scene: scene["id"])


def focus_bounds_from_story_points(path: Path, buffer_km: float = 2.5) -> list[float]:
    text = path.read_text(encoding="utf-8")
    coordinates = [
        (float(match.group(1)), float(match.group(2)))
        for match in re.finditer(r'coordinates:\s*\[([\d.]+),\s*([\d.]+)\].*?accuracy:\s*"GPS实拍点"', text)
    ]
    if not coordinates:
        raise RuntimeError("No GPS实拍点 coordinates were found in content/story-points.ts")
    mean_latitude = sum(latitude for _, latitude in coordinates) / len(coordinates)
    longitude_buffer = buffer_km / (111.32 * math.cos(math.radians(mean_latitude)))
    latitude_buffer = buffer_km / 110.574
    raw_bounds = [
        min(longitude for longitude, _ in coordinates) - longitude_buffer,
        min(latitude for _, latitude in coordinates) - latitude_buffer,
        max(longitude for longitude, _ in coordinates) + longitude_buffer,
        max(latitude for _, latitude in coordinates) + latitude_buffer,
    ]
    west_tile, south_tile = mercantile.tile(raw_bounds[0], raw_bounds[1], MAX_ZOOM).x, mercantile.tile(raw_bounds[0], raw_bounds[1], MAX_ZOOM).y
    east_tile, north_tile = mercantile.tile(raw_bounds[2], raw_bounds[3], MAX_ZOOM).x, mercantile.tile(raw_bounds[2], raw_bounds[3], MAX_ZOOM).y
    west = mercantile.bounds(mercantile.Tile(west_tile, south_tile, MAX_ZOOM)).west
    south = mercantile.bounds(mercantile.Tile(west_tile, south_tile, MAX_ZOOM)).south
    east = mercantile.bounds(mercantile.Tile(east_tile, north_tile, MAX_ZOOM)).east
    north = mercantile.bounds(mercantile.Tile(east_tile, north_tile, MAX_ZOOM)).north
    return [west, south, east, north]


def fetch_scene(scene_id: str) -> dict:
    request = urllib.request.Request(f"{STAC_BASE}/{scene_id}", headers={"User-Agent": "minqin-surface-prep/2026"})
    return fetch_json(request)


def read_scene_tci(
    scene: dict,
    bounds: list[float],
    width: int,
    height: int,
    transform,
) -> tuple[dict, np.ndarray] | None:
    item = fetch_scene(scene["id"])
    visual_href = item["assets"]["visual"]["href"]
    scene_channels = np.zeros((3, height, width), dtype=np.uint16)
    with rasterio.Env(
        GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
        CPL_VSIL_CURL_USE_HEAD="NO",
        CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
        GDAL_HTTP_VERSION="1.1",
        GDAL_HTTP_UNSAFESSL="YES",
        GDAL_HTTP_MULTIRANGE="YES",
        GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES",
        GDAL_HTTP_CONNECTTIMEOUT="20",
        GDAL_HTTP_TIMEOUT="180",
        GDAL_HTTP_MAX_RETRY="3",
        GDAL_HTTP_RETRY_DELAY="2",
    ):
        with rasterio.open(f"/vsicurl/{visual_href}") as source:
            source_bounds = transform_bounds(source.crs, "EPSG:4326", *source.bounds, densify_pts=21)
            if source_bounds[2] <= bounds[0] or source_bounds[0] >= bounds[2] or source_bounds[3] <= bounds[1] or source_bounds[1] >= bounds[3]:
                return None
            for channel_index in range(3):
                reproject(
                    source=rasterio.band(source, channel_index + 1),
                    destination=scene_channels[channel_index],
                    src_transform=source.transform,
                    src_crs=source.crs,
                    src_nodata=source.nodata or 0,
                    dst_transform=transform,
                    dst_crs="EPSG:3857",
                    dst_nodata=0,
                    resampling=Resampling.bilinear,
                )
    record = {
        **scene,
        "datetime": item["properties"]["datetime"],
        "platform": item["properties"]["platform"],
        "visualAsset": visual_href,
        "sourceBandAssets": {name: item["assets"][name]["href"] for name in ("red", "green", "blue")},
    }
    print(f"Read {scene['id']} ({scene['cloudCover']:.2f}% cloud)", flush=True)
    return record, scene_channels


def build_rgb(bounds: list[float]) -> tuple[Image.Image, tuple[float, float, float, float], list[dict]]:
    west, south, east, north = transform_bounds("EPSG:4326", "EPSG:3857", *bounds, densify_pts=21)
    width = math.ceil((east - west) / WORKING_RESOLUTION_METRES)
    height = math.ceil((north - south) / WORKING_RESOLUTION_METRES)
    transform = from_origin(west, north, WORKING_RESOLUTION_METRES, WORKING_RESOLUTION_METRES)
    channels = np.zeros((3, height, width), dtype=np.uint16)
    scene_records: list[dict] = []
    scenes = discover_scenes(bounds)
    print(f"Reading {len(scenes)} Sentinel-2 official TCI scenes (B04/B03/B02) into {width} x {height} pixels at {WORKING_RESOLUTION_METRES} m...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, len(scenes))) as executor:
        futures = [executor.submit(read_scene_tci, scene, bounds, width, height, transform) for scene in scenes]
        while futures:
            try:
                result = futures.pop(0).result()
            except Exception as error:
                print(f"Skipped one Sentinel scene after a COG range failure: {error}", flush=True)
                continue
            if result is None:
                continue
            record, scene_channels = result
            for channel_index in range(3):
                valid_channel = (scene_channels[channel_index] > 0) & (channels[channel_index] == 0)
                channels[channel_index][valid_channel] = scene_channels[channel_index][valid_channel]
            scene_records.append(record)

    valid = np.all(channels > 0, axis=0)
    if not valid.any():
        raise RuntimeError("Sentinel-2 scenes did not cover the requested crop")
    coverage_percent = float(valid.mean() * 100)
    if coverage_percent < 99.99:
        raise RuntimeError(f"Real Sentinel coverage is incomplete inside the render context ({coverage_percent:.4f}%); refusing solid-color fill")
    sampled = channels[:, valid][:, :: max(1, int(valid.sum() / 1_000_000))]
    low = np.percentile(sampled, 1.2, axis=1)
    high = np.percentile(sampled, 98.8, axis=1)
    normalized = np.empty_like(channels, dtype=np.float32)
    for index in range(3):
        normalized[index] = np.clip((channels[index] - low[index]) / max(1.0, high[index] - low[index]), 0, 1)

    rgb = np.moveaxis(normalized, 0, 2)
    rgb = np.power(rgb, 0.92)
    luminance = rgb[..., 0] * 0.30 + rgb[..., 1] * 0.59 + rgb[..., 2] * 0.11
    rgb = luminance[..., None] + (rgb - luminance[..., None]) * 0.62
    rgb[..., 0] *= 1.045
    rgb[..., 1] *= 0.985
    rgb[..., 2] *= 0.90
    rgb = np.clip(18 + rgb * 214, 18, 232).astype(np.uint8)
    image = Image.fromarray(rgb)
    image = ImageEnhance.Contrast(image).enhance(1.10)
    image = ImageEnhance.Color(image).enhance(0.82)
    print(f"Display percentiles: low={low.round(1).tolist()}, high={high.round(1).tolist()}")
    return image, (west, south, east, north), scene_records


def tile_bytes(image: Image.Image, image_bounds: tuple[float, float, float, float], tile: mercantile.Tile) -> bytes:
    west, south, east, north = image_bounds
    tile_bounds = mercantile.xy_bounds(tile)
    tile_west, tile_south, tile_east, tile_north = tile_bounds.left, tile_bounds.bottom, tile_bounds.right, tile_bounds.top
    result = Image.new("RGB", (256, 256), (212, 197, 158))
    overlap_west, overlap_south = max(west, tile_west), max(south, tile_south)
    overlap_east, overlap_north = min(east, tile_east), min(north, tile_north)
    if overlap_west < overlap_east and overlap_south < overlap_north:
        source_box = (
            (overlap_west - west) / (east - west) * image.width,
            (north - overlap_north) / (north - south) * image.height,
            (overlap_east - west) / (east - west) * image.width,
            (north - overlap_south) / (north - south) * image.height,
        )
        destination_box = (
            round((overlap_west - tile_west) / (tile_east - tile_west) * 256),
            round((tile_north - overlap_north) / (tile_north - tile_south) * 256),
            round((overlap_east - tile_west) / (tile_east - tile_west) * 256),
            round((tile_north - overlap_south) / (tile_north - tile_south) * 256),
        )
        resized = image.crop(source_box).resize(
            (max(1, destination_box[2] - destination_box[0]), max(1, destination_box[3] - destination_box[1])),
            Image.Resampling.LANCZOS,
        )
        result.paste(resized, destination_box[:2])
    with tempfile.SpooledTemporaryFile(max_size=256 * 1024) as output:
        result.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True, subsampling="4:2:0")
        output.seek(0)
        return output.read()


def write_mbtiles(path: Path, image: Image.Image, image_bounds: tuple[float, float, float, float], bounds: list[float]) -> int:
    tiles = [tile for zoom in range(MIN_ZOOM, MAX_ZOOM + 1) for tile in mercantile.tiles(*bounds, zooms=[zoom])]
    connection = sqlite3.connect(path)
    try:
        connection.executescript(
            """
            PRAGMA journal_mode=OFF;
            PRAGMA synchronous=OFF;
            CREATE TABLE metadata (name TEXT, value TEXT);
            CREATE TABLE tiles (zoom_level INTEGER, tile_column INTEGER, tile_row INTEGER, tile_data BLOB);
            CREATE UNIQUE INDEX tile_index ON tiles (zoom_level, tile_column, tile_row);
            """
        )
        metadata = {
            "name": "Minqin Sentinel-2 surface 2026",
            "type": "overlay",
            "version": "1",
            "description": "Documentary-toned real surface texture for local vector-map fusion",
            "format": "jpg",
            "bounds": ",".join(map(str, bounds)),
            "center": "103.16,38.72,9",
            "minzoom": str(MIN_ZOOM),
            "maxzoom": str(MAX_ZOOM),
            "attribution": "Contains modified Copernicus Sentinel data 2026; COG distribution by Element 84",
        }
        connection.executemany("INSERT INTO metadata (name, value) VALUES (?, ?)", metadata.items())
        for index, tile in enumerate(tiles, start=1):
            connection.execute(
                "INSERT INTO tiles (zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)",
                (tile.z, tile.x, (1 << tile.z) - 1 - tile.y, tile_bytes(image, image_bounds, tile)),
            )
            if index % 250 == 0:
                print(f"Rendered {index}/{len(tiles)} raster tiles...")
        connection.commit()
    finally:
        connection.close()
    return len(tiles)


def prepare_converter(workdir: Path) -> Path:
    key = (platform.system(), platform.machine())
    if key not in PMTILES_RELEASES:
        raise RuntimeError(f"Unsupported platform for pinned go-pmtiles: {key[0]} {key[1]}")
    archive_name, expected_sha256 = PMTILES_RELEASES[key]
    archive_path = workdir / archive_name
    request = urllib.request.Request(
        f"{PMTILES_RELEASE_BASE}/{archive_name}", headers={"User-Agent": "minqin-surface-prep/2026"}
    )
    with urllib.request.urlopen(request, timeout=180) as response, archive_path.open("wb") as target:
        shutil.copyfileobj(response, target)
    if sha256(archive_path) != expected_sha256:
        raise RuntimeError("go-pmtiles checksum mismatch")
    extract_dir = workdir / "pmtiles"
    if archive_name.endswith(".zip"):
        with zipfile.ZipFile(archive_path) as archive:
            archive.extractall(extract_dir)
    else:
        with tarfile.open(archive_path, "r:gz") as archive:
            archive.extractall(extract_dir, filter="data")
    executable_name = "pmtiles.exe" if platform.system() == "Windows" else "pmtiles"
    matches = list(extract_dir.rglob(executable_name))
    if not matches:
        raise RuntimeError(f"{executable_name} missing from verified release")
    matches[0].chmod(0o755)
    return matches[0]


def write_provenance(path: Path, archive: Path, bounds: list[float], scope: str, tile_count: int, scenes: list[dict]) -> None:
    record = {
        "asset": archive.name,
        "assetBytes": archive.stat().st_size,
        "assetSha256": sha256(archive),
        "provider": "European Union Copernicus programme; distributed as COGs by Element 84 via AWS Open Data",
        "dataset": "Sentinel-2 Collection 1 Level-2A Cloud-Optimized GeoTIFFs",
        "license": "Copernicus Sentinel Data Licence: free, full and open access; reproduction, distribution, communication, adaptation, modification and combination are permitted with source notice.",
        "redistributionNotice": "Contains modified Copernicus Sentinel data 2026",
        "acquiredAt": ACQUIRED_AT,
        "sceneDate": SCENE_DATE,
        "cloudCoveragePercent": [scene["cloudCover"] for scene in scenes],
        "bands": ["B04 red", "B03 green", "B02 blue"],
        "sourceEncoding": "Official Sentinel-2 TCI GeoTIFF composed from B04/B03/B02",
        "originalResolution": "10 metres per pixel",
        "workingResolution": f"{WORKING_RESOLUTION_METRES} metres per pixel",
        "mapBounds": MAP_BOUNDS,
        "cropBounds": bounds,
        "renderContextBounds": RENDER_CONTEXT_BOUNDS if scope == "full" else None,
        "focusBoundsDerivedFrom": "content/story-points.ts storyPoints where accuracy === GPS实拍点" if scope == "focus" else None,
        "focusBufferKilometres": 2.5 if scope == "focus" else None,
        "scope": scope,
        "minZoom": MIN_ZOOM,
        "maxZoom": MAX_ZOOM,
        "overzoomTo": 14,
        "tileCount": tile_count,
        "archiveEncoding": "PMTiles v3 raster archive with documentary-toned JPEG tiles",
        "processing": ["crop", "Web Mercator reprojection", f"{WORKING_RESOLUTION_METRES} m working grid", "complete real-imagery coverage check", "percentile contrast", "warm low-saturation color grade", "JPEG raster tiling", "PMTiles packing"],
        "scenes": scenes,
        "references": {
            "registry": "https://registry.opendata.aws/sentinel-2-l2a-cogs/",
            "stac": "https://earth-search.aws.element84.com/v1",
            "earthSearch": "https://github.com/Element84/earth-search",
            "license": "https://cds.climate.copernicus.eu/licences/ec-sentinel",
        },
    }
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    global MIN_ZOOM, MAX_ZOOM, WORKING_RESOLUTION_METRES, JPEG_QUALITY
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=("prototype", "full", "focus"), default="prototype")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--provenance", type=Path)
    args = parser.parse_args()
    if args.scope == "focus":
        MIN_ZOOM, MAX_ZOOM, WORKING_RESOLUTION_METRES, JPEG_QUALITY = 12, 14, 10, 88
        bounds = focus_bounds_from_story_points(Path("content/story-points.ts"))
        default_output = Path("public/maps/minqin-surface-focus-2026.pmtiles")
        default_provenance = Path("public/maps/minqin-surface-focus-2026.json")
    else:
        MIN_ZOOM, MAX_ZOOM, WORKING_RESOLUTION_METRES, JPEG_QUALITY = 7, 13, 30, 80
        bounds = PROTOTYPE_BOUNDS if args.scope == "prototype" else FULL_BOUNDS
        default_output = Path("public/maps/minqin-surface-2026.pmtiles")
        default_provenance = Path("public/maps/minqin-surface-2026.json")
    output = (args.output or default_output).resolve()
    provenance = (args.provenance or default_provenance).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    provenance.parent.mkdir(parents=True, exist_ok=True)

    image, image_bounds, scenes = build_rgb(bounds)
    with tempfile.TemporaryDirectory(prefix="minqin-surface-") as temporary:
        workdir = Path(temporary)
        mbtiles = workdir / "minqin-surface.mbtiles"
        tile_count = write_mbtiles(mbtiles, image, image_bounds, bounds)
        converter = prepare_converter(workdir)
        temporary_output = workdir / output.name
        subprocess.run([str(converter), "convert", str(mbtiles), str(temporary_output)], check=True)
        shutil.copyfile(temporary_output, output)

    write_provenance(provenance, output, bounds, args.scope, tile_count, scenes)
    print(f"Wrote {output} ({output.stat().st_size:,} bytes, {tile_count} tiles)")
    print(f"Wrote {provenance}")


if __name__ == "__main__":
    main()
