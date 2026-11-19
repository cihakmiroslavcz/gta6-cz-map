"""Build the Leonida WebP preview and tile levels from an untouched poster."""

import argparse
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageFilter, ImageOps


MAP_DIRECTORY = Path(__file__).resolve().parents[1] / "public/maps/leonida"
TILE_SIZE = 768


def resize(image, factor):
    size = tuple(max(1, int(dimension * factor + 0.5)) for dimension in image.size)
    return image.resize(size, Image.Resampling.LANCZOS)


def save_tiles(image, directory):
    directory.mkdir()
    for row, top in enumerate(range(0, image.height, TILE_SIZE)):
        for column, left in enumerate(range(0, image.width, TILE_SIZE)):
            box = (left, top, min(left + TILE_SIZE, image.width), min(top + TILE_SIZE, image.height))
            with image.crop(box) as tile:
                tile.save(directory / f"{column}-{row}.webp", quality=88, method=5)


def generate(source, directory, upscales, sharpen):
    directory.mkdir()
    with Image.open(source) as original, ImageOps.exif_transpose(original).convert("RGB") as image:
        with resize(image, 0.25) as preview:
            preview.save(directory / "preview.webp", quality=84, method=5)
        with resize(image, 0.5) as reduced:
            save_tiles(reduced, directory / "0.5")
        save_tiles(image, directory / "1")

        for factor in upscales:
            with resize(image, factor) as enlarged:
                if sharpen:
                    with enlarged.filter(ImageFilter.UnsharpMask(radius=1, percent=25, threshold=4)) as sharpened:
                        save_tiles(sharpened, directory / str(factor))
                else:
                    save_tiles(enlarged, directory / str(factor))

        manifest = {
            "version": 1,
            "width": image.width,
            "height": image.height,
            "tileSize": TILE_SIZE,
            "variants": [1, *upscales],
        }
    (directory / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=MAP_DIRECTORY / "Leonida_Map_Poster.jpg")
    parser.add_argument("--upscale", type=int, choices=(1, 2, 3), action="append", default=[])
    parser.add_argument("--sharpen", action="store_true", help="Apply a mild Unsharp Mask to enlarged levels.")
    args = parser.parse_args()

    output = MAP_DIRECTORY / "generated"
    if output.resolve() != output or (output.exists() and not output.is_dir()):
        parser.error(f"Expected a regular output directory at {output}")
    source = args.source.resolve()
    if not source.is_file() or source.is_relative_to(output):
        parser.error("Place the original poster in public/maps/leonida/Leonida_Map_Poster.jpg or pass --source.")

    upscales = sorted(set(args.upscale) - {1})
    with TemporaryDirectory(prefix=".leonida-", dir=MAP_DIRECTORY) as temporary:
        staging = Path(temporary) / "next"
        previous = Path(temporary) / "previous"
        generate(source, staging, upscales, args.sharpen)
        if output.exists():
            output.rename(previous)
        try:
            staging.rename(output)
        except OSError:
            if previous.exists():
                previous.rename(output)
            raise

    print(f"Generated Leonida preview and WebP tiles ({', '.join(f'{factor}x' for factor in (1, *upscales))}).")


if __name__ == "__main__":
    main()
