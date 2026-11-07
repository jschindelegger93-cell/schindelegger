#!/usr/bin/env python3
"""Bilder für schnelle Ladezeiten aufbereiten.

Lokal ausführen, wenn neue Bilder dazukommen:  python3 scripts/bilder-optimieren.py

- verkleinert Originale auf max. 1600 px Breite (nur wenn die Datei dadurch kleiner wird)
- legt für jedes Bild ab 900 px Breite eine 800-px-Variante an (name-800.webp)
Die Varianten werden beim Build automatisch als srcset eingebaut (astro.config.mjs).
"""
import json
import os
import sys
from pathlib import Path
from PIL import Image

BASIS = Path(__file__).resolve().parent.parent
ROOT = BASIS / 'public' / 'images'
MANIFEST = BASIS / 'src' / 'data' / 'bild-varianten.json'
MAX_W, VAR_W, Q = 1600, 800, 78
EXT = {'.webp', '.jpg', '.jpeg', '.png'}


def save(im, path, fmt):
    if fmt == 'WEBP':
        im.save(path, 'WEBP', quality=Q, method=6)
    elif fmt == 'PNG':
        im.save(path, 'PNG', optimize=True)
    else:
        im.convert('RGB').save(path, 'JPEG', quality=Q, optimize=True, progressive=True)


def main():
    gespart = 0
    varianten = 0
    manifest = {}
    for f in sorted(ROOT.rglob('*')):
        if f.suffix.lower() not in EXT or f.stem.endswith(f'-{VAR_W}'):
            continue
        im = Image.open(f)
        fmt = im.format
        w, h = im.size
        if w > MAX_W:
            klein = im.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS)
            tmp = f.with_suffix(f.suffix + '.tmp')
            save(klein, tmp, fmt)
            if tmp.stat().st_size < f.stat().st_size:
                gespart += f.stat().st_size - tmp.stat().st_size
                os.replace(tmp, f)
                im, (w, h) = klein, klein.size
            else:
                tmp.unlink()
        if w >= 900:
            ziel = f.with_name(f'{f.stem}-{VAR_W}.webp')
            if not ziel.exists() or ziel.stat().st_mtime < f.stat().st_mtime:
                v = im.resize((VAR_W, round(h * VAR_W / w)), Image.LANCZOS)
                if v.mode not in ('RGB', 'RGBA'):
                    v = v.convert('RGBA' if 'A' in v.mode else 'RGB')
                v.save(ziel, 'WEBP', quality=Q, method=6)
                varianten += 1
            pfad = '/' + f.relative_to(BASIS / 'public').as_posix()
            manifest[pfad] = {'w': w, 'v': '/' + ziel.relative_to(BASIS / 'public').as_posix(), 'vw': VAR_W}
    MANIFEST.write_text(json.dumps(manifest, indent=1) + '\n')
    print(f'{varianten} Varianten erstellt, {gespart // 1024} KB bei Originalen gespart')


if __name__ == '__main__':
    sys.exit(main())
