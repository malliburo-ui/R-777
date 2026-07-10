#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageSequence

INPUT = Path("public/cases/Mobile/mobile-filter-d-head.gif")
OUTPUT = Path("public/cases/Mobile/mobile-filter-d-head.gif")
SOURCE = Path("/Users/harakiri/Downloads/cyclic_stars_contour_fixed.gif")
BOTTOM_CROP = 36
NEIGHBORS = [
    (-1, 0),
    (1, 0),
    (0, -1),
    (0, 1),
    (-1, -1),
    (1, -1),
    (-1, 1),
    (1, 1),
]


def has_transparent_neighbor(pixels, x, y, width, height):
    for dx, dy in NEIGHBORS:
        nx = x + dx
        ny = y + dy
        if nx < 0 or ny < 0 or nx >= width or ny >= height:
            return True
        if pixels[nx, ny][3] < 20:
            return True
    return False


def defringe(image):
    pixels = image.load()
    width, height = image.size

    for _ in range(4):
        snapshot = image.copy()
        source = snapshot.load()

        for y in range(height):
            for x in range(width):
                red, green, blue, alpha = source[x, y]
                if alpha == 0:
                    continue

                luminance = (red + green + blue) / 3

                if red >= 215 and green >= 215 and blue >= 215:
                    pixels[x, y] = (red, green, blue, 0)
                    continue

                if has_transparent_neighbor(source, x, y, width, height) and luminance >= 145:
                    pixels[x, y] = (red, green, blue, 0)
                    continue

                if alpha < 245 and luminance >= 120:
                    pixels[x, y] = (red, green, blue, 0)


def main():
    source = SOURCE if SOURCE.exists() else INPUT
    frames = []
    durations = []

    for frame in ImageSequence.Iterator(Image.open(source)):
        rgba = frame.convert("RGBA")
        defringe(rgba)
        cropped = rgba.crop((0, 0, rgba.width, rgba.height - BOTTOM_CROP))
        frames.append(cropped)
        durations.append(frame.info.get("duration", 180))

    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=False,
    )

    print(
        f"Cleaned {source} -> {OUTPUT} "
        f"({len(frames)} frames, {frames[0].size[0]}x{frames[0].size[1]}, "
        f"crop bottom {BOTTOM_CROP}px)"
    )


if __name__ == "__main__":
    main()
