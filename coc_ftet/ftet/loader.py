"""Read the FTET Excel workbook into tidy pandas DataFrames."""
from __future__ import annotations
import re
from functools import lru_cache
from pathlib import Path
import pandas as pd
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

DEFAULT_XLSX = Path(__file__).resolve().parent.parent / "data" / "FTET_CoC.xlsx"

SUMMARY_SHEET = "62-67 สรุป FTE-All -เทอม"
TOTAL_MARK = "จำนวนเต็มเวลาของอาจารย์ในหลักสูตร"

# (academic year, term) -> sheet with all CoC teachers (same column layout)
COURSE_SHEETS = {
    (2562, 1): "FTET_1-2562", (2562, 2): "FTET_2-2562",
    (2563, 1): "FTET_1-2563", (2563, 2): "FTE_2_2563",
    (2567, 1): "FTET_1-2567", (2567, 2): "FTET_2-2567",
}
# per-programme sheets (2567) used to cross-check the summary table
PROGRAM_SHEETS = {
    (2567, 1): {"Comp": "FTET_1-2567 Comp", "DE": "FTET_1-2567-DE", "DBiz": "FTET_1-2567-DBiz",
                "AISE": "FTET_1-2567-AISE", "MsComp": "FTET_1-2567_MsComp"},
    (2567, 2): {"Comp": "FTET_2-2567 Comp", "DE": "FTET_2-2567-DE", "DBiz": "FTET_2-2567-DBiz",
                "AISE": "FTET_2-2567-AISE", "MsComp": "FTET_2-2567_MsComp"},
}
PROGRAM_ALIASES = {"comp": "Comp", "de": "DE", "dbiz": "DBiz", "aise": "AISE",
                   "mscomp": "MsComp", "coc": "CoC"}


def norm_program(x):
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return None
    s = str(x).strip()
    return PROGRAM_ALIASES.get(s.lower(), s) or None


def clean_name(x) -> str:
    """Remove '*', '(ผู้ประสานงาน)', '(OOP)' and repeated spaces from a teacher name."""
    s = re.sub(r"\(.*?\)", "", str(x or ""))
    s = s.replace("*", "")
    return re.sub(r"\s+", " ", s).strip()


@lru_cache(maxsize=4)
def _wb_cached(path: str, mtime: float):
    return load_workbook(path, data_only=True)


def _wb(xlsx):
    """Open workbook (cached per file+mtime; accepts a path or an uploaded file object)."""
    if hasattr(xlsx, "read"):          # e.g. Streamlit UploadedFile
        return load_workbook(xlsx, data_only=True)
    path = Path(xlsx or DEFAULT_XLSX)
    return _wb_cached(str(path), path.stat().st_mtime)


def available_terms(xlsx=None):
    """List of (year, term) that have a course-level sheet in this workbook."""
    names = set(_wb(xlsx).sheetnames)
    return sorted(k for k, v in COURSE_SHEETS.items() if v in names)


def load_summary(xlsx=None) -> pd.DataFrame:
    """Summary table in tidy form: program, year, term ('1','2','AVG'), ftet."""
    ws = _wb(xlsx)[SUMMARY_SHEET]
    header_row = next(r for r in ws.iter_rows(min_row=1, max_row=20)
                      if any(c.value == "หลักสูตรของวิทยาลัย" for c in r))
    cols = {c.column: str(c.value) for c in header_row
            if c.value and re.fullmatch(r"(\d{4}_[12]|AVG_\d{4})", str(c.value))}
    rows = []
    for r in ws.iter_rows(min_row=header_row[0].row + 1, max_row=header_row[0].row + 20):
        label = r[1].value  # column B
        if not label:
            continue
        prog = norm_program(label)
        for c in r:
            if c.column in cols and isinstance(c.value, (int, float)):
                h = cols[c.column]
                if h.startswith("AVG_"):
                    year, term = int(h[4:]), "AVG"
                else:
                    year, term = int(h[:4]), h[5]
                rows.append((prog, year, term, float(c.value)))
    return pd.DataFrame(rows, columns=["program", "year", "term", "ftet"])


def _read_course_sheet(ws, year, term):
    rows, teacher_id, total, last_name = [], 0, None, ""

    for r in ws.iter_rows(min_row=10, max_row=min(ws.max_row, 400)):
        v = {get_column_letter(c.column): c.value for c in r if hasattr(c, 'column')}
        b = v.get("B")
        if isinstance(b, str) and TOTAL_MARK in b:
            total = v.get("L")
            break
        if not (v.get("C") or v.get("D")):
            continue
        if not b:            # continuation row: same teacher as the row above
            b = last_name
        if not b:
            continue
        last_name = b
        a = v.get("A")
        if isinstance(a, (int, float)):
            teacher_id = int(a)
        rows.append({
            "year": year, "term": term, "teacher_id": teacher_id,
            "teacher": clean_name(b), "code": v.get("C"), "course": v.get("D"),
            "credits": v.get("E"), "group": v.get("F"),
            "sections": v.get("G"), "lecture": v.get("H"), "lab": v.get("I"),
            "project": v.get("J"), "weeks": v.get("K"),
            "ftet_sheet": v.get("L"), "ftets_sheet": v.get("M"),
            "program": norm_program(v.get("N")),
        })
    df = pd.DataFrame(rows)
    # 'lecture' may hold text such as 'เรียนร่วมกับ ...' (shared class -> counts 0)
    df["note"] = [x if isinstance(x, str) and not x.strip().replace('.', '', 1).isdigit() else None
                  for x in df["lecture"]]
    for c in ["sections", "ftet_sheet", "ftets_sheet", "weeks", "project", "lecture", "lab"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    return df, (float(total) if isinstance(total, (int, float)) else None)


def load_courses(xlsx=None, year: int = 2567, term: int = 1) -> pd.DataFrame:
    """Course-level rows (one row per teacher x course x group) for one term."""
    key = (year, term)
    if key not in COURSE_SHEETS:
        raise KeyError(f"no course sheet for {key}; available: {available_terms(xlsx)}")
    df, _ = _read_course_sheet(_wb(xlsx)[COURSE_SHEETS[key]], year, term)
    return df


def load_program_totals(xlsx=None, year: int = 2567, term: int = 1) -> pd.DataFrame:
    """Per-programme sheet totals (mean FTET per teacher) – used to cross-check the summary."""
    wb = _wb(xlsx)
    out = []
    for prog, sheet in PROGRAM_SHEETS.get((year, term), {}).items():
        if sheet in wb.sheetnames:
            df, total = _read_course_sheet(wb[sheet], year, term)
            out.append((prog, year, term, total, df["teacher_id"].nunique()))
    return pd.DataFrame(out, columns=["program", "year", "term", "sheet_total", "teachers"])
