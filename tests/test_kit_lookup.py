#!/usr/bin/env python3
"""Self-check for brand-kit lookup in bin/deck and slides/export-pptx.py.
No pytest, no fixtures beyond tests/fixtures/kit: python3 tests/test_kit_lookup.py.
Needs python-pptx (the exporter imports it). Every case runs against a temporary
HOME and XDG_CONFIG_HOME, never the real config folder.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
REPO = HERE.parent
KIT = HERE / "fixtures" / "kit"


def env_for(root: Path, **extra) -> dict:
    env = {k: v for k, v in os.environ.items()
           if k not in ("DECK_THEME", "DECK_FONT_DIR", "XDG_CONFIG_HOME")}
    env.update(HOME=str(root / "home"), XDG_CONFIG_HOME=str(root / "xdg"), **extra)
    return env


def install_kit(root: Path, name="tidewell", fonts_ok=False) -> Path:
    dst = root / "xdg" / "peakstate-deck" / "themes" / name
    shutil.copytree(KIT, dst)
    if fonts_ok:
        (dst / "fonts").mkdir()
        (dst / "fonts" / "Kit-Regular.ttf").write_bytes(b"x")
        meta = json.loads((dst / "theme.json").read_text())
        meta["fontsRedistributable"] = True
        (dst / "theme.json").write_text(json.dumps(meta))
    return dst


def init(root: Path, *args) -> subprocess.CompletedProcess:
    deck = root / "deck"
    return subprocess.run([sys.executable, str(REPO / "bin" / "deck"), "init", str(deck), *args],
                          env=env_for(root), capture_output=True, text=True)


def config(root: Path, text: str) -> None:
    f = root / "xdg" / "peakstate-deck" / "config.json"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(text)


PROBE = """
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("x", sys.argv[1])
sys.argv = ["export-pptx.py"] + sys.argv[2:]
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
print(json.dumps({"name": m.THEME.get("name"), "fonts": m._THEME_FONTS, "out": str(m.OUT),
                  "face": m.face('-apple-system, BlinkMacSystemFont, "Inter", sans-serif'),
                  "dirs": [str(d) for d in m.font_dirs()]}))
"""


def probe(root: Path, deck: Path, *args, **extra) -> dict:
    r = subprocess.run([sys.executable, "-c", PROBE, str(REPO / "slides" / "export-pptx.py"),
                        "--deck", str(deck), *args],
                       env=env_for(root, **extra), capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout)


def case(fn):
    with tempfile.TemporaryDirectory() as t:
        fn(Path(t))
    print(f"ok  {fn.__name__}")


def deck_head(root: Path) -> str:
    return (root / "deck" / "build.py").read_text()


@case
def no_config_gives_default(root):
    r = init(root)
    assert r.returncode == 0, r.stderr
    assert not (root / "deck" / "theme.json").exists()
    assert "colors_and_type.css" not in deck_head(root)
    assert "--theme" not in (root / "deck" / "BUILD.md").read_text()


@case
def theme_by_name_from_config(root):
    install_kit(root)
    r = init(root, "--theme", "tidewell")
    assert r.returncode == 0, r.stderr
    deck = root / "deck"
    assert json.loads((deck / "theme.json").read_text())["name"] == "tidewell"
    assert (deck / "assets" / "mark.svg").is_file()
    assert not (deck / "fonts").exists()          # not redistributable
    head = deck_head(root)
    assert head.index("deck.css") < head.index("colors_and_type.css")
    md = (deck / "BUILD.md").read_text()
    assert "tidewell" in md and "--theme" not in md


@case
def theme_by_path(root):
    r = init(root, "--theme", str(KIT))
    assert r.returncode == 0, r.stderr
    assert (root / "deck" / "theme.json").is_file()


@case
def active_kit_used_and_none_forces_default(root):
    install_kit(root)
    config(root, '{"active": "tidewell"}')
    assert init(root).returncode == 0
    assert (root / "deck" / "theme.json").is_file()
    shutil.rmtree(root / "deck")
    assert init(root, "--theme", "none").returncode == 0
    assert not (root / "deck" / "theme.json").exists()


@case
def redistributable_fonts_are_copied(root):
    install_kit(root, fonts_ok=True)
    assert init(root, "--theme", "tidewell").returncode == 0
    assert (root / "deck" / "fonts" / "Kit-Regular.ttf").is_file()


@case
def bad_config_warns_and_defaults(root):
    for text, warns in (("{}", False), ("", True), ("{not json", True)):
        config(root, text)
        shutil.rmtree(root / "deck", ignore_errors=True)
        r = init(root)
        assert r.returncode == 0, r.stderr
        assert not (root / "deck" / "theme.json").exists()
        assert ("config.json" in r.stderr) == warns, (text, r.stderr)


@case
def unknown_theme_names_places_tried(root):
    r = init(root, "--theme", "nope")
    assert r.returncode != 0
    assert "peakstate-deck" in r.stderr and "themes" in r.stderr
    assert str(REPO / "themes") not in r.stderr               # the clone ships no themes
    deck = root / "d" / "index.html"
    deck.parent.mkdir()
    deck.write_text("<html></html>")
    r = subprocess.run([sys.executable, "-c", PROBE, str(REPO / "slides" / "export-pptx.py"),
                        "--deck", str(deck), "--theme", "nope"],
                       env=env_for(root), capture_output=True, text=True)
    assert r.returncode != 0 and "Tried:" in r.stderr, r.stderr
    assert str(REPO / "themes") not in r.stderr, r.stderr


@case
def exporter_default_names_inter(root):
    deck = root / "d" / "index.html"
    deck.parent.mkdir()
    deck.write_text("<html></html>")
    for args in ((), ("--theme", "none")):
        p = probe(root, deck, *args)
        assert p["fonts"]["embed"] == {"Inter": "Inter-{}.ttf"}, p
        assert p["face"] == "Inter"
        assert Path(p["out"]).parent == deck.parent           # beside the deck
    p = probe(root, deck, DECK_FONT_DIR=str(root / "f"))
    assert p["dirs"][0] == str(root / "f")
    assert p["dirs"][1] == str(deck.parent / "fonts")
    # No font folder in another skill under the Claude skills folder; this skill's own
    # fonts/ may sit there when it is installed as a skill.
    assert not any("/.claude/skills/" in d and not d.startswith(str(REPO) + "/") for d in p["dirs"]), p


@case
def exporter_finds_theme_beside_deck_and_by_name(root):
    install_kit(root)
    deck = root / "d" / "index.html"
    deck.parent.mkdir()
    deck.write_text("<html></html>")
    assert probe(root, deck, "--theme", "tidewell")["name"] == "tidewell"
    assert probe(root, deck, DECK_THEME="tidewell")["name"] == "tidewell"
    shutil.copy2(KIT / "theme.json", deck.parent / "theme.json")
    p = probe(root, deck)
    assert p["name"] == "tidewell"
    assert p["fonts"] == {} and p["face"] == "-apple-system"  # no fonts key: trust the deck
    assert str(root / "xdg" / "peakstate-deck" / "themes" / "tidewell" / "fonts") in p["dirs"]


@case
def kit_title_fragment_used(root):
    kit = install_kit(root)
    assert init(root, "--theme", "tidewell").returncode == 0
    assert "class=\"dark\"" not in (root / "deck" / "slides" / "01-title.html").read_text()
    shutil.rmtree(root / "deck")
    (kit / "title.html").write_text('<section class="dark"><span data-slide-number></span></section>\n')
    assert init(root, "--theme", "tidewell").returncode == 0
    assert (root / "deck" / "slides" / "01-title.html").read_text() == (kit / "title.html").read_text()


@case
def bare_name_is_not_a_cwd_path(root):
    install_kit(root)
    (root / "tidewell").mkdir()
    (root / "tidewell" / "theme.json").write_text('{"name": "wrong"}')
    r = subprocess.run([sys.executable, str(REPO / "bin" / "deck"), "init", str(root / "deck"),
                        "--theme", "tidewell"], env=env_for(root), cwd=root,
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    assert json.loads((root / "deck" / "theme.json").read_text())["name"] == "tidewell"
    deck = root / "d" / "index.html"
    deck.parent.mkdir()
    deck.write_text("<html></html>")
    r = subprocess.run([sys.executable, "-c", PROBE, str(REPO / "slides" / "export-pptx.py"),
                        "--deck", str(deck), "--theme", "tidewell"],
                       env=env_for(root), cwd=root, capture_output=True, text=True)
    assert json.loads(r.stdout)["name"] == "tidewell", r.stderr


@case
def theme_as_last_argument_is_a_usage_error(root):
    r = subprocess.run([sys.executable, str(REPO / "bin" / "deck"), "init", str(root / "deck"),
                        "--theme"], env=env_for(root), cwd=root, capture_output=True, text=True)
    assert r.returncode == 2 and "Traceback" not in r.stderr and "--theme" in r.stderr, r.stderr


@case
def kit_fonts_folder_is_the_kit_folder(root):
    install_kit(root, name="brand")       # folder "brand", theme.json name "tidewell"
    deck = root / "d" / "index.html"
    deck.parent.mkdir()
    deck.write_text("<html></html>")
    dirs = probe(root, deck, "--theme", "brand")["dirs"]
    assert str(root / "xdg" / "peakstate-deck" / "themes" / "brand" / "fonts") in dirs, dirs


@case
def active_not_a_string_warns(root):
    config(root, '{"active": 3}')
    r = init(root)
    assert r.returncode == 0, r.stderr
    assert "config.json" in r.stderr and "Traceback" not in r.stderr
    assert not (root / "deck" / "theme.json").exists()
