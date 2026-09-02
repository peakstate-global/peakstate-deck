#!/usr/bin/env python3
"""Self-check for export-pptx.py's presenter_notes() — ticket #28.
No pytest, no fixtures: python3 tests/test_presenter_notes.py.
"""
import importlib.util
import sys
from pathlib import Path

HERE = Path(__file__).parent
spec = importlib.util.spec_from_file_location("export_pptx", HERE.parent / "slides" / "export-pptx.py")
# The module runs its top-level --deck check on import, so give it a real fixture.
sys.argv = ["export-pptx.py", "--deck", str(HERE / "fixtures" / "deck-minted.html")]
export_pptx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export_pptx)

presenter_notes = export_pptx.presenter_notes

# No script: byte-identical to today's plain note.
assert presenter_notes(None, "Turn here.") == "Turn here."
assert presenter_notes("", "Turn here.") == "Turn here."
assert presenter_notes("", "") == ""

# Script present: script, rule, notes — in that order.
out = presenter_notes("Say the headline slowly.", "Turn here.")
assert out == "SCRIPT:\nSay the headline slowly.\n\n---\n\nNOTES:\nTurn here."
assert out.index("SCRIPT:") < out.index("---") < out.index("NOTES:")

# Script with no note still gets the NOTES: label, empty.
out2 = presenter_notes("Say it.", None)
assert out2 == "SCRIPT:\nSay it.\n\n---\n\nNOTES:\n"

print("presenter_notes: 5 checks passed")
