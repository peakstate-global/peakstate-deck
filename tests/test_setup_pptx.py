#!/usr/bin/env python3
"""Self-check for the .pptx brand reader in reference/setup.md.

The reader is a snippet in the doc, not a script, so this test runs the doc's own
snippet: a change to the doc that breaks it fails here. Standard library only.

    python3 tests/test_setup_pptx.py [any.pptx]

With a path, it also prints what the reader finds in that file.
"""
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).parent
DOC = (HERE.parent / "reference" / "setup.md").read_text()

m = re.search(r"<!-- pptx-reader -->\s*```python\n(.*?)```", DOC, re.S)
assert m, "reference/setup.md has no python block after <!-- pptx-reader -->"
SNIPPET = m.group(1)
assert not re.search(r"^\s*(import|from)\s+pptx\b", SNIPPET, re.M), \
    "the reader must not import python-pptx"

THEME = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Test">
<a:themeElements>
<a:clrScheme name="Test">
<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="12372A"/></a:dk2>
<a:lt2><a:srgbClr val="F4F1EA"/></a:lt2>
<a:accent1><a:srgbClr val="E4572E"/></a:accent1>
</a:clrScheme>
<a:fontScheme name="Test">
<a:majorFont><a:latin typeface="Fraunces"/><a:ea typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="Source Sans 3"/><a:ea typeface=""/></a:minorFont>
</a:fontScheme>
</a:themeElements>
</a:theme>
"""


def run(pptx: Path) -> str:
    return subprocess.run([sys.executable, "-c", SNIPPET, str(pptx)],
                          capture_output=True, text=True, check=True).stdout


with tempfile.TemporaryDirectory() as tmp:
    pptx = Path(tmp) / "brand.pptx"
    with zipfile.ZipFile(pptx, "w") as z:
        z.writestr("ppt/theme/theme1.xml", THEME)
    out = run(pptx)
    for line in ("dk1 #000000", "lt1 #FFFFFF", "dk2 #12372A", "lt2 #F4F1EA",
                 "accent1 #E4572E", "major Fraunces", "minor Source Sans 3"):
        assert line in out.splitlines(), f"missing {line!r} in:\n{out}"

if len(sys.argv) > 1:
    print(run(Path(sys.argv[1])), end="")
print("ok: setup.md pptx reader")
