"""FTET calculation (method 3 in the workbook).

FTET(course) = ((lecture_h * 2) + (lab_h * 1.5) + project) * sections * weeks / 525
  - 525 h = 35 h/week * 15 weeks  -> 1 FTET
  - lecture hour counts 2 (teach + prepare); lab hour counts 1.5
  - project counts 1 h/week per project
"""
from __future__ import annotations
import pandas as pd

HOURS_PER_TERM = 525.0
LECTURE_W, LAB_W = 2.0, 1.5


def course_ftet(lecture=0.0, lab=0.0, project=0.0, sections=1.0, weeks=15.0):
    """FTET of one course row. Missing / non-numeric values count as 0."""
    def n(x):
        try:
            return float(x)
        except (TypeError, ValueError):
            return 0.0
    hours_per_week = n(lecture) * LECTURE_W + n(lab) * LAB_W + n(project)
    return hours_per_week * n(sections) * n(weeks) / HOURS_PER_TERM


def _num(s):
    return pd.to_numeric(s, errors="coerce").fillna(0.0)


def add_calc_column(df: pd.DataFrame) -> pd.DataFrame:
    """Return df with a recomputed `ftet_calc` column."""
    out = df.copy()
    out["ftet_calc"] = (
        (_num(out["lecture"]) * LECTURE_W + _num(out["lab"]) * LAB_W + _num(out["project"]))
        * _num(out["sections"]) * _num(out["weeks"]) / HOURS_PER_TERM
    )
    return out


def validate_courses(df: pd.DataFrame, tol: float = 1e-6) -> pd.DataFrame:
    """Rows where the recomputed FTET differs from the value stored in the sheet."""
    d = add_calc_column(df)
    d["diff"] = d["ftet_calc"] - d["ftet_sheet"].fillna(0.0)
    return d[d["diff"].abs() > tol]


def teacher_totals(df: pd.DataFrame) -> pd.DataFrame:
    """One row per teacher: total FTET (recomputed), sheet total, #courses, programme."""
    d = add_calc_column(df)
    g = d.groupby("teacher_id", sort=True)
    out = pd.DataFrame({
        "teacher": g["teacher"].first(),
        "program": g["program"].agg(lambda s: s.dropna().mode().iat[0] if s.notna().any() else None),
        "n_courses": g["code"].count(),
        "ftet": g["ftet_calc"].sum(),
        "ftet_sheet": g["ftets_sheet"].max(),
    }).reset_index()
    return out


def program_stats(teachers: pd.DataFrame) -> pd.DataFrame:
    """Mean / median / min / max FTET per programme (home programme of teacher)."""
    s = teachers.groupby("program")["ftet"].agg(["count", "mean", "median", "min", "max"])
    return s.round(4).reset_index().rename(columns={"count": "teachers"})
