#!/usr/bin/env python3
"""Self-check: a backstage slide exports to PowerPoint as a HIDDEN slide.
Runs the real exporter on tests/fixtures/deck-backstage.html and reads the .pptx.
No pytest: python3 tests/test_backstage_export.py

Needs the export prerequisites: python-pptx for this interpreter, and playwright
for node (DECK_NODE_ROOT, else tests/node_modules). Without them it says so and
exits 0, because CI runs the browser half (specs/backstage.spec.mjs) only.
"""
import importlib.util
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent

node_root = os.environ.get("DECK_NODE_ROOT")
if importlib.util.find_spec("pptx") is None or not (
        node_root or (HERE / "node_modules" / "playwright").exists()):
    print("backstage export: SKIPPED, export prerequisites missing (python-pptx, playwright)")
    sys.exit(0)

with tempfile.TemporaryDirectory() as d:
    d = Path(d)
    deck = d / "deck" / "index.html"
    deck.parent.mkdir()
    shutil.copy(HERE / "fixtures" / "deck-backstage.html", deck)
    shutil.copy(HERE / "fixtures" / "deck.css", deck.parent)
    for js in ("deck-stage.js", "deck-tools.js"):
        shutil.copy(ROOT / "slides" / js, deck.parent)
    shutil.copy(ROOT / "assets" / "deck-comments.js", deck.parent)
    if not node_root:  # a fresh folder: tests/package.json would make the runner an ES module
        node_root = d / "node"
        node_root.mkdir()
        (node_root / "node_modules").symlink_to((HERE / "node_modules").resolve())
    env = {**os.environ, "DECK_NODE_ROOT": str(node_root)}
    r = subprocess.run([sys.executable, str(ROOT / "slides" / "export-pptx.py"), "--deck", str(deck)],
                       capture_output=True, text=True, env=env)
    assert r.returncode == 0, r.stdout[-800:] + r.stderr[-800:]
    out = deck.parent / "deck-editable.pptx"
    assert out.exists(), r.stdout[-800:]

    with zipfile.ZipFile(out) as z:
        order = re.findall(r'<p:sldId [^>]*r:id="(rId\d+)"', z.read("ppt/presentation.xml").decode())
        rels = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="(slides/slide\d+\.xml)"',
                               z.read("ppt/_rels/presentation.xml.rels").decode()))
        hidden = [re.search(r'<p:sld\b[^>]*\sshow="0"', z.read("ppt/" + rels[rid]).decode()) is not None
                  for rid in order]

# Two presented slides, then the planning and numbers slides from the backstage layer.
assert hidden == [False, False, True, True], hidden
print("backstage export: 1 check passed")
