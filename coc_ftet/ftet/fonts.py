"""Pick a font that can draw Thai so matplotlib charts do not show empty boxes."""
from __future__ import annotations
import matplotlib
from matplotlib import font_manager

THAI_FONTS = ["Sarabun", "TH Sarabun New", "Noto Sans Thai", "Noto Sans Thai UI", "Leelawadee UI",
              "Tahoma", "Thonburi", "Ayuthaya", "Loma", "Garuda", "Norasi", "Kinnari", "Waree",
              "Umpush", "Laksaman", "TlwgTypo", "Tlwg Typo"]
_has_thai = False


def setup_fonts() -> bool:
    """Configure matplotlib font. Returns True when a Thai-capable font was found."""
    global _has_thai
    installed = {f.name for f in font_manager.fontManager.ttflist}
    for name in THAI_FONTS:
        if name in installed:
            matplotlib.rcParams["font.family"] = name
            matplotlib.rcParams["axes.unicode_minus"] = False
            _has_thai = True
            return True
    _has_thai = False
    return False


def has_thai() -> bool:
    return _has_thai


def L(th: str, en: str) -> str:
    """Thai label if a Thai font is available, else English."""
    return th if _has_thai else en
