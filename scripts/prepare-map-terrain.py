#!/usr/bin/env python3
"""Build the small, local Minqin terrain PMTiles archive from real elevation tiles.

The source is Mapzen Terrain Tiles on AWS Open Data. The Minqin crop uses SRTM
1 Arc-Second Global at useful reading zooms and GMTED2010 in low-zoom composites.
Both USGS datasets are public domain; Mapzen and USGS attribution is retained in
the generated metadata and the runtime MapLibre source.

No runtime dependency is added. This script uses Python's standard library and
a pinned, checksum-verified release of the official go-pmtiles converter.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import math
import os
import platform
import shutil
import sqlite3
import subprocess
import tarfile
import tempfile
import time
import urllib.request
import zipfile
from dataclasses import dataclass
from pathlib import Path


ACQUIRED_AT = "2026-08-13"
MAP_BOUNDS = [102.45, 37.8, 103.75, 39.35]
RENDER_CONTEXT_BOUNDS = [102.12890625, 37.474858084971025, 104.0625, 39.67337039176559]
TERRAIN_BOUNDS = RENDER_CONTEXT_BOUNDS
MIN_ZOOM = 7
MAX_ZOOM = 12
TILE_TEMPLATE = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
PMTILES_VERSION = "1.31.2"
PMTILES_RELEASE_BASE = f"https://github.com/protomaps/go-pmtiles/releases/download/v{PMTILES_VERSION}"

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
        "1f0dc02eee6c58312dd6c509faee1b5c32f0596568af1bf51f1b034e7a88a65b",
    ),
    ("Darwin", "arm64"): (
        f"go-pmtiles-{PMTILES_VERSION}_Darwin_arm64.zip",
        "40528f7f616fcbf91207cd48c8fc023d213f6d86c0cbf1f748732803d1880f3d",
    ),
}


@dataclass(frozen=True)
class Tile:
    z: int
    x: int
    y: int


def lon_to_x(lon: float, zoom: int) -> int:
    return math.floor((lon + 180.0) / 360.0 * (1 << zoom))


def lat_to_y(lat: float, zoom: int) -> int:
    lat_radians = math.radians(lat)
    return math.floor((1.0 - math.asinh(math.tan(lat_radians)) / math.pi) / 2.0 * (1 << zoom))


def tiles_for_bounds() -> list[Tile]:
    west, south, east, north = TERRAIN_BOUNDS
    result: list[Tile] = []
    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        min_x, max_x = lon_to_x(west, zoom), lon_to_x(east, zoom)
        min_y, max_y = lat_to_y(north, zoom), lat_to_y(south, zoom)
        result.extend(Tile(zoom, x, y) for x in range(min_x, max_x + 1) for y in range(min_y, max_y + 1))
    return result


def download_tile(tile: Tile) -> tuple[Tile, bytes, str]:
    url = TILE_TEMPLATE.format(z=tile.z, x=tile.x, y=tile.y)
    request = urllib.request.Request(url, headers={"User-Agent": "minqin-terrain-prep/2026"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                data = response.read()
                if len(data) < 100 or not data.startswith(b"\x89PNG\r\n\x1a\n"):
                    raise RuntimeError(f"Unexpected terrain response for {url}")
                imagery_sources = response.headers.get(
                    "X-Amz-Meta-X-Imagery-Sources",
                    response.headers.get("X-Imagery-Sources", ""),
                )
                return tile, data, imagery_sources
        except Exception:
            if attempt == 3:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise AssertionError("unreachable")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def prepare_converter(workdir: Path) -> Path:
    system = platform.system()
    machine = platform.machine()
    key = (system, machine)
    if key not in PMTILES_RELEASES:
        raise RuntimeError(f"Unsupported platform for pinned go-pmtiles: {system} {machine}")
    archive_name, expected_sha256 = PMTILES_RELEASES[key]
    archive_path = workdir / archive_name
    url = f"{PMTILES_RELEASE_BASE}/{archive_name}"
    print(f"Downloading pinned go-pmtiles v{PMTILES_VERSION}…")
    curl = shutil.which("curl")
    if curl:
        subprocess.run(
            [curl, "--fail", "--location", "--retry", "3", "--output", str(archive_path), url],
            check=True,
        )
    else:
        request = urllib.request.Request(url, headers={"User-Agent": "minqin-terrain-prep/2026"})
        with urllib.request.urlopen(request, timeout=120) as response, archive_path.open("wb") as target:
            shutil.copyfileobj(response, target)
    actual_sha256 = sha256(archive_path)
    if actual_sha256 != expected_sha256:
        raise RuntimeError(f"go-pmtiles checksum mismatch: {actual_sha256}")
    if archive_name.endswith(".zip"):
        with zipfile.ZipFile(archive_path) as archive:
            archive.extractall(workdir / "pmtiles")
    else:
        with tarfile.open(archive_path, "r:gz") as archive:
            archive.extractall(workdir / "pmtiles", filter="data")
    executable_name = "pmtiles.exe" if system == "Windows" else "pmtiles"
    matches = list((workdir / "pmtiles").rglob(executable_name))
    if not matches:
        raise RuntimeError(f"{executable_name} was not present in the verified release archive")
    matches[0].chmod(0o755)
    return matches[0]


def write_mbtiles(path: Path, downloaded: list[tuple[Tile, bytes, str]]) -> None:
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
        attribution = "Mapzen; global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey"
        metadata = {
            "name": "Minqin terrain 2026",
            "type": "baselayer",
            "version": "1",
            "description": "Local Terrarium DEM crop for subtle hillshade progressive enhancement",
            "format": "png",
            "bounds": ",".join(map(str, TERRAIN_BOUNDS)),
            "center": "103.1,38.6,9",
            "minzoom": str(MIN_ZOOM),
            "maxzoom": str(MAX_ZOOM),
            "attribution": attribution,
        }
        connection.executemany("INSERT INTO metadata (name, value) VALUES (?, ?)", metadata.items())
        connection.executemany(
            "INSERT INTO tiles (zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)",
            ((tile.z, tile.x, (1 << tile.z) - 1 - tile.y, data) for tile, data, _ in downloaded),
        )
        connection.commit()
    finally:
        connection.close()


def write_provenance(path: Path, archive_path: Path, downloaded: list[tuple[Tile, bytes, str]]) -> None:
    imagery_sources = sorted(
        {source.strip() for _, _, header in downloaded for source in header.split(",") if source.strip()}
    )
    record = {
        "asset": archive_path.name,
        "assetBytes": archive_path.stat().st_size,
        "assetSha256": sha256(archive_path),
        "provider": "Mapzen, a Linux Foundation project, via the AWS Open Data Registry",
        "dataset": "Mapzen Terrain Tiles",
        "sourceDatasets": [
            {
                "name": "USGS SRTM 1 Arc-Second Global",
                "resolution": "1 arc-second (approximately 30 metres)",
                "range": "global land coverage from 60° N to 56° S",
                "license": "Public domain; USGS credit requested for redistribution and publication",
            },
            {
                "name": "USGS GMTED2010",
                "resolution": "7.5 arc-seconds (approximately 250 metres) in Mapzen low-zoom composites",
                "range": "global",
                "license": "Public domain; subject to the USGS standard disclaimer and requested credit",
            },
        ],
        "redistribution": "Retain Mapzen hosted-service attribution and credit SRTM/GMTED2010 to the U.S. Geological Survey.",
        "acquiredAt": ACQUIRED_AT,
        "mapBounds": MAP_BOUNDS,
        "cropBounds": TERRAIN_BOUNDS,
        "renderContextBounds": RENDER_CONTEXT_BOUNDS,
        "safetyMarginDegrees": 0.30,
        "minZoom": MIN_ZOOM,
        "maxZoom": MAX_ZOOM,
        "tileCount": len(downloaded),
        "sourceEncoding": "Terrarium RGB PNG (elevation = red*256 + green + blue/256 - 32768)",
        "archiveEncoding": "PMTiles v3 raster archive; PNG tile payloads; no tile compression",
        "generationTool": f"go-pmtiles v{PMTILES_VERSION}",
        "imagerySourcesReportedByTiles": imagery_sources,
        "references": {
            "registry": "https://registry.opendata.aws/terrain-tiles/",
            "dataSources": "https://github.com/tilezen/joerd/blob/master/docs/data-sources.md",
            "attribution": "https://github.com/tilezen/joerd/blob/master/docs/attribution.md",
            "srtm": "https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-shuttle-radar-topography-mission-srtm-1",
            "srtmDoi": "https://doi.org/10.5066/F7PR7TFT",
        },
    }
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("public/maps/minqin-terrain-2026.pmtiles"))
    parser.add_argument("--provenance", type=Path, default=Path("public/maps/minqin-terrain-2026.json"))
    parser.add_argument("--workers", type=int, default=min(12, (os.cpu_count() or 4) * 2))
    args = parser.parse_args()
    output = args.output.resolve()
    provenance = args.provenance.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    provenance.parent.mkdir(parents=True, exist_ok=True)

    tiles = tiles_for_bounds()
    print(f"Downloading {len(tiles)} terrain tiles for {TERRAIN_BOUNDS}, z{MIN_ZOOM}–{MAX_ZOOM}…")
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        downloaded = list(executor.map(download_tile, tiles))
    downloaded.sort(key=lambda item: (item[0].z, item[0].x, item[0].y))

    with tempfile.TemporaryDirectory(prefix="minqin-terrain-") as temporary:
        workdir = Path(temporary)
        mbtiles = workdir / "minqin-terrain.mbtiles"
        write_mbtiles(mbtiles, downloaded)
        converter = prepare_converter(workdir)
        temporary_output = workdir / output.name
        subprocess.run([str(converter), "convert", str(mbtiles), str(temporary_output)], check=True)
        shutil.copyfile(temporary_output, output)

    write_provenance(provenance, output, downloaded)
    print(f"Wrote {output} ({output.stat().st_size:,} bytes)")
    print(f"Wrote {provenance}")


if __name__ == "__main__":
    main()
