#!/usr/bin/env python3
"""Self-check for where slides/export-pptx.py finds its prerequisites: the data folder,
the playwright folder (DECK_NODE_ROOT), and the re-run under the installed venv.
No pytest: python3 tests/test_export_env.py. Needs python-pptx. Every case runs against a
temporary HOME and XDG_DATA_HOME, never the real data folder.
"""
import json
import os
import site
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).parent.parent
EXPORTER = REPO / "slides" / "export-pptx.py"

PROBE = """
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("x", sys.argv[1])
sys.argv = ["export-pptx.py", "--deck", sys.argv[2]]
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
print(json.dumps({"data": str(m.data_dir()), "node": str(m.node_root())}))
"""


def env_for(root: Path, **extra) -> dict:
    env = {k: v for k, v in os.environ.items()
           if k not in ("XDG_DATA_HOME", "XDG_CONFIG_HOME", "DECK_NODE_ROOT",
                        "PEAKSTATE_DECK_REEXEC", "DECK_THEME")}
    # A temp HOME hides a user-site python-pptx, so keep the real user base.
    env.setdefault("PYTHONUSERBASE", site.getuserbase())
    env.update(HOME=str(root / "home"), XDG_CONFIG_HOME=str(root / "cfg"), **extra)
    return env


def deck(root: Path) -> Path:
    """The exporter only checks the deck exists at import time, so a stub will do."""
    f = root / "deck" / "index.html"
    f.parent.mkdir()
    f.write_text("<!doctype html>\n")
    return f


def probe(root: Path, **extra) -> dict:
    r = subprocess.run([sys.executable, "-c", PROBE, str(EXPORTER), str(deck(root))],
                       env=env_for(root, **extra), capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout)


def case(fn):
    with tempfile.TemporaryDirectory() as t:
        fn(Path(t).resolve())
    print(f"ok  {fn.__name__}")


@case
def data_under_home_when_xdg_unset(root):
    got = probe(root)
    assert got["data"] == str(root / "home" / ".local" / "share" / "peakstate-deck"), got
    assert got["node"] == "/tmp", got


@case
def data_under_xdg_and_node_found_there(root):
    (root / "xdg" / "peakstate-deck" / "node" / "node_modules" / "playwright").mkdir(parents=True)
    got = probe(root, XDG_DATA_HOME=str(root / "xdg"))
    assert got["data"] == str(root / "xdg" / "peakstate-deck"), got
    assert got["node"] == str(root / "xdg" / "peakstate-deck" / "node"), got


@case
def explicit_node_root_wins(root):
    (root / "xdg" / "peakstate-deck" / "node" / "node_modules" / "playwright").mkdir(parents=True)
    got = probe(root, XDG_DATA_HOME=str(root / "xdg"), DECK_NODE_ROOT=str(root / "mine"))
    assert got["node"] == str(root / "mine"), got


def hide_pptx_and_fake_venv(root: Path) -> dict:
    """A PYTHONPATH entry whose pptx fails to import, and a venv python that reports its args."""
    (root / "hide" / "pptx").mkdir(parents=True)
    (root / "hide" / "pptx" / "__init__.py").write_text("raise ImportError('hidden')\n")
    py = root / "xdg" / "peakstate-deck" / "venv" / "bin" / "python"
    py.parent.mkdir(parents=True)
    py.write_text('#!/bin/sh\necho "REEXEC $PEAKSTATE_DECK_REEXEC $*"\n')
    py.chmod(0o755)
    return {"PYTHONPATH": str(root / "hide"), "XDG_DATA_HOME": str(root / "xdg")}


@case
def reruns_under_installed_venv(root):
    env = env_for(root, **hide_pptx_and_fake_venv(root))
    r = subprocess.run([sys.executable, str(EXPORTER), "--deck", "/x/index.html"],
                       env=env, capture_output=True, text=True)
    assert r.stdout.strip() == f"REEXEC 1 {EXPORTER} --deck /x/index.html", (r.stdout, r.stderr)


@case
def no_second_rerun(root):
    env = env_for(root, **hide_pptx_and_fake_venv(root), PEAKSTATE_DECK_REEXEC="1")
    r = subprocess.run([sys.executable, str(EXPORTER), "--deck", "/x/index.html"],
                       env=env, capture_output=True, text=True)
    assert r.returncode != 0 and "REEXEC" not in r.stdout, (r.stdout, r.stderr)
    assert "PowerPoint export prerequisites" in r.stderr, r.stderr
