#!/usr/bin/env python3
"""Fail if any file in the repository hardcodes a home directory.

    python3 scripts/check-portable.py

A clone has to work on someone else's machine, so an absolute path into a macOS
home directory is a defect. `Path.home()` and `~` are fine and are not matched.
The needle is assembled at runtime, so this file does not exempt itself.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEEDLE = "/" + "Users" + "/"
SKIP_DIRS = {".git", "node_modules", "out", "__pycache__", ".venv"}
SKIP_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".ttf", ".woff", ".woff2",
                 ".pptx", ".pdf", ".ico", ".zip"}


def files():
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() in SKIP_SUFFIXES:
            continue
        if SKIP_DIRS & set(path.relative_to(ROOT).parts):
            continue
        yield path


def main() -> int:
    hits = []
    for path in files():
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for n, line in enumerate(text.splitlines(), 1):
            if NEEDLE in line:
                hits.append(f"{path.relative_to(ROOT)}:{n}: {line.strip()[:110]}")

    if hits:
        print(f"absolute home paths found ({len(hits)}):")
        print("\n".join(hits))
        return 1
    print("no absolute home paths")
    return 0


if __name__ == "__main__":
    sys.exit(main())
