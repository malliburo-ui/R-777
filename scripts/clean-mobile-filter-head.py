#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageSequence

OUTPUT = Path("public/cases/Mobile/mobile-filter-d-head.gif")
SOURCE = Path("/Users/harakiri/Downloads/ezgif.com-gif-maker-3.gif")
TARGET_WIDTH = 918


def main():
    frames = []
    durations = []

    for frame in ImageSequence.Iterator(Image.open(SOURCE)):
        rgba = frame.convert("RGBA")
        width, height = rgba.size
        target_height = round(height * TARGET_WIDTH / width)
        frames.append(rgba.resize((TARGET_WIDTH, target_height), Image.Resampling.LANCZOS))
        durations.append(frame.info.get("duration", 100))

    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=True,
    )

    print(
        f"Synced {SOURCE} -> {OUTPUT} "
        f"({len(frames)} frames, {frames[0].size[0]}x{frames[0].size[1]})"
    )


if __name__ == "__main__":
    main()
