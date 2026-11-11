#!/usr/bin/env python3
"""Self-check: an <img> of an SVG reaches python-pptx as a PNG, never as SVG text.
No pytest, no fixtures: python3 tests/test_raster_svg_img.py.
"""
import base64
import importlib.util
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
spec = importlib.util.spec_from_file_location("export_pptx", HERE.parent / "slides" / "export-pptx.py")
sys.argv = ["export-pptx.py", "--deck", str(HERE / "fixtures" / "deck-minted.html")]
export_pptx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export_pptx)

is_svg, raster = export_pptx.is_svg, export_pptx.raster

# svg_styles lifts the rules for every class the SVG uses, with var() resolved.
with tempfile.TemporaryDirectory() as d:
    deck = Path(d) / "index.html"
    deck.write_text("<style>:root{--ink:#123456}</style><style>.map .ct{fill:none;stroke:var(--ink)}"
                    ".other{fill:red}.hc7 .cv{stroke:#ABCDEF}.ladder .ct{display:none}</style>"
                    '<div class="hc7"><svg class="map"><path class="ct" d="M0 0 L10 10 L20 20 L30 30 L40 40"/></svg></div>', encoding="utf-8")
    real_deck, export_pptx.DECK = export_pptx.DECK, deck
    css = export_pptx.svg_styles('<svg class="map"><path class="ct" d="M0 0 L10 10 L20 20 L30 30 L40 40"></path>'
                                 '<path class="cv"/></svg>')
    export_pptx.DECK = real_deck
assert "fill:none" in css and "#123456" in css and "var(" not in css, css
assert ".other" not in css, css
assert "display:none" not in css, css  # .ladder is not around this SVG
assert ".hc7" not in css and ".cv{stroke:#ABCDEF}" in css.replace(" ", ""), css

export_pptx.svg_styles = lambda markup="": ""  # the fixture deck carries no <style>
SVG = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#000"/></svg>'
PNG = b"\x89PNG\r\n\x1a\n"

assert is_svg("assets/qr.svg", b"")
assert is_svg("data:image/svg+xml;base64,AAAA", b"")
assert is_svg("blob", SVG)
assert is_svg("blob", b'<?xml version="1.0"?>' + SVG)
assert not is_svg("assets/photo.png", PNG)
assert not is_svg("data:image/png;base64,AAAA", PNG)

with tempfile.TemporaryDirectory() as d:
    tmp = Path(d)
    for src in ("data:image/svg+xml;base64," + base64.b64encode(SVG).decode(),
                "data:image/svg+xml," + SVG.decode().replace("#", "%23")):
        out = raster({"type": "img", "src": src, "w": 40, "h": 40}, tmp, "qr")
        assert out.read_bytes()[:8] == PNG, f"not a PNG for {src[:30]}"
    # A 10px file drawn in a 40px box fills the box, not one corner.
    from PIL import Image
    small = SVG.replace(b'viewBox', b'width="10" height="10" viewBox')
    out = raster({"type": "img", "src": "data:image/svg+xml;base64," + base64.b64encode(small).decode(),
                  "w": 40, "h": 40}, tmp, "qr2")
    assert Image.open(out).convert("RGBA").getpixel((70, 70))[3] > 0, "SVG drawn at natural size"

# No path data: no ancestors, never the first xmlns in the deck.
assert export_pptx.svg_ancestors('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>') == set()

print("raster svg img: 14 checks passed")
