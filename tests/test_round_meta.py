"""The example deck carries deck-round on the line after deck-build-hash.

A later check reads the two metas together, so they must sit side by side and
the round must be one of the three named types. Run: python3 tests/test_round_meta.py
"""
import pathlib
import re
import subprocess
import sys
import tempfile

DECK = pathlib.Path(__file__).resolve().parent.parent / "slides" / "example.html"
ROUNDS = {"first-cut", "comment", "re-outline"}


def main():
    lines = [l.strip() for l in DECK.read_text(encoding="utf-8").splitlines()]
    metas = [(i, re.match(r'<meta name="([\w-]+)" content="([^"]*)">', l)) for i, l in enumerate(lines)]
    metas = {m[1]: (i, m[2]) for i, m in metas if m}
    assert "deck-build-hash" in metas, "no deck-build-hash meta"
    assert "deck-round" in metas, "no deck-round meta"
    assert re.fullmatch(r"[0-9a-f]{12}", metas["deck-build-hash"][1]), "hash is not 12 hex chars"
    assert metas["deck-round"][1] in ROUNDS, f"unknown round {metas['deck-round'][1]!r}"
    assert metas["deck-round"][0] == metas["deck-build-hash"][0] + 1, "deck-round is not beside deck-build-hash"
    deck_py = DECK.parent.parent / "bin" / "deck"
    with tempfile.TemporaryDirectory() as t:
        d = pathlib.Path(t) / "d"
        subprocess.run([sys.executable, str(deck_py), "init", str(d)], check=True, capture_output=True)
        subprocess.run([sys.executable, "build.py", "comment"], cwd=d, check=True, capture_output=True)
        out = [l.strip() for l in (d / "index.html").read_text(encoding="utf-8").splitlines()]
    i = next(i for i, l in enumerate(out) if l.startswith('<meta name="deck-build-hash"'))
    assert re.fullmatch(r'<meta name="deck-build-hash" content="[0-9a-f]{12}">', out[i]), out[i]
    assert out[i + 1] == '<meta name="deck-round" content="comment">', out[i + 1]
    print("2 checks passed")


if __name__ == "__main__":
    main()
