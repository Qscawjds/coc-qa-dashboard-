"""Matplotlib / seaborn charts. Every function returns a matplotlib Figure."""
from __future__ import annotations
import matplotlib
matplotlib.use("Agg")  # works without a display; Streamlit / scripts both fine
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from .fonts import L, setup_fonts

setup_fonts()
sns.set_theme(style="whitegrid", font=matplotlib.rcParams["font.family"][0])

COLORS = {"Comp": "#2f5bea", "DE": "#e8590c", "DBiz": "#2f9e44", "AISE": "#9c36b5",
          "MsComp": "#e03131", "CoC": "#343a40"}
ORDER = ["Comp", "DE", "DBiz", "AISE", "MsComp", "CoC"]


def _progs(summary, programs):
    have = set(summary["program"])
    return [p for p in ORDER if p in have and (programs is None or p in programs)]


def fig_year_lines(summary: pd.DataFrame, programs=None) -> plt.Figure:
    """FTET average per academic year, one line per programme."""
    d = summary[summary.term == "AVG"]
    fig, ax = plt.subplots(figsize=(9, 5))
    for p in _progs(d, programs):
        s = d[d.program == p].sort_values("year")
        ax.plot(s.year, s.ftet, marker="o", lw=3 if p == "CoC" else 2,
                ls="--" if p == "CoC" else "-", color=COLORS.get(p), label=p)
    ax.set_xticks(sorted(d.year.unique()))
    ax.set_xlabel(L("ปีการศึกษา", "Academic year"))
    ax.set_ylabel(L("FTET เฉลี่ยต่ออาจารย์", "Mean FTET per teacher"))
    ax.set_title(L("ค่า FTET เฉลี่ยรายปีการศึกษา แยกตามหลักสูตร", "Mean FTET per academic year by programme"))
    ax.set_ylim(0, max(0.7, d.ftet.max() * 1.15))
    ax.legend(ncol=3, frameon=False)
    fig.tight_layout()
    return fig


def fig_year_bars(summary: pd.DataFrame, programs=None) -> plt.Figure:
    """Grouped bars: year on x, one bar per programme."""
    d = summary[summary.term == "AVG"]
    d = d[d.program.isin(_progs(d, programs))]
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.barplot(data=d, x="year", y="ftet", hue="program", hue_order=_progs(d, programs),
                palette=COLORS, ax=ax)
    ax.set_xlabel(L("ปีการศึกษา", "Academic year"))
    ax.set_ylabel("FTET")
    ax.set_title(L("เปรียบเทียบ FTET เฉลี่ยรายปี", "Mean FTET by year (grouped)"))
    ax.legend(ncol=6, frameon=False, loc="upper center", bbox_to_anchor=(.5, -.12), title=None)
    fig.tight_layout()
    return fig


def fig_term_lines(summary: pd.DataFrame, programs=None) -> plt.Figure:
    """FTET per term (year/1, year/2)."""
    d = summary[summary.term.isin(["1", "2"])].copy()
    d["label"] = d.year.astype(str) + "/" + d.term
    labels = sorted(d.label.unique())
    fig, ax = plt.subplots(figsize=(11, 5))
    for p in _progs(d, programs):
        s = d[d.program == p].set_index("label").reindex(labels)
        ax.plot(range(len(labels)), s.ftet.values, marker="o", color=COLORS.get(p), label=p)
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=45)
    ax.set_xlabel(L("ปีการศึกษา/ภาค", "Year/term"))
    ax.set_ylabel("FTET")
    ax.set_title(L("ค่า FTET รายภาคการศึกษา", "Mean FTET per term"))
    ax.set_ylim(0, 0.7)
    ax.legend(ncol=5, frameon=False)
    fig.tight_layout()
    return fig


def fig_heatmap(summary: pd.DataFrame) -> plt.Figure:
    """Programme x term heatmap."""
    d = summary[summary.term.isin(["1", "2"])].copy()
    d["label"] = d.year.astype(str) + "/" + d.term
    pv = d.pivot_table(index="program", columns="label", values="ftet")
    pv = pv.reindex([p for p in ORDER if p in pv.index])
    fig, ax = plt.subplots(figsize=(11, 3.8))
    sns.heatmap(pv, annot=True, fmt=".2f", cmap="YlOrRd", vmin=0.25, vmax=0.6,
                linewidths=.5, cbar_kws={"label": "FTET"}, ax=ax)
    ax.set_xlabel(L("ปีการศึกษา/ภาค", "Year/term"))
    ax.set_ylabel("")
    ax.set_title(L("Heatmap FTET หลักสูตร × ภาคการศึกษา", "FTET heatmap: programme × term"))
    fig.tight_layout()
    return fig


def fig_teacher_bars(teachers: pd.DataFrame, title: str = "") -> plt.Figure:
    """Horizontal bar of FTET for each teacher, coloured by home programme."""
    t = teachers.sort_values("ftet")
    fig, ax = plt.subplots(figsize=(9, max(3, 0.32 * len(t) + 1.2)))
    ax.barh(t.teacher, t.ftet, color=[COLORS.get(p, "#868e96") for p in t.program])
    m = t.ftet.mean()
    ax.axvline(m, color="#343a40", ls="--", lw=1.2)
    ax.text(m, len(t) - 0.4, f" mean {m:.2f}", va="bottom", fontsize=9)
    ax.set_xlabel(L("FTET ของอาจารย์ (1.0 = 525 ชม./ภาค)", "Teacher FTET (1.0 = 525 h/term)"))
    ax.set_title(title or L("FTET รายอาจารย์", "FTET per teacher"))
    handles = [plt.Rectangle((0, 0), 1, 1, color=COLORS[p]) for p in ORDER[:-1] if p in set(t.program)]
    ax.legend(handles, [p for p in ORDER[:-1] if p in set(t.program)], loc="lower right", frameon=False)
    fig.tight_layout()
    return fig


def fig_teacher_box(teachers: pd.DataFrame) -> plt.Figure:
    """Distribution of teacher FTET per programme. `teachers` needs program, ftet, (label)."""
    order = [p for p in ORDER[:-1] if p in set(teachers.program)]
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.boxplot(data=teachers, x="program", y="ftet", order=order, palette=COLORS,
                hue="program", legend=False, width=.55, fliersize=0, ax=ax)
    sns.stripplot(data=teachers, x="program", y="ftet", order=order, color="#212529",
                  size=3.5, alpha=.6, ax=ax)
    ax.set_xlabel("")
    ax.set_ylabel(L("FTET รายอาจารย์", "FTET per teacher"))
    ax.set_title(L("การกระจายของ FTET รายอาจารย์ ในแต่ละหลักสูตร", "Distribution of teacher FTET by programme"))
    fig.tight_layout()
    return fig


def fig_teacher_courses(courses: pd.DataFrame, teacher_id: int) -> plt.Figure:
    """Breakdown of one teacher's FTET by course (uses recomputed `ftet_calc`)."""
    c = courses[courses.teacher_id == teacher_id]
    c = c[c.ftet_calc > 0].sort_values("ftet_calc")
    name = c.teacher.iat[0] if len(c) else str(teacher_id)
    fig, ax = plt.subplots(figsize=(9, max(2.5, 0.45 * len(c) + 1.2)))
    labels = (c.code.astype(str) + " " + c.course.astype(str).str.slice(0, 32)).tolist()
    ax.barh(labels, c.ftet_calc, color="#4c6ef5")
    for y, v in enumerate(c.ftet_calc):
        ax.text(v, y, f" {v:.3f}", va="center", fontsize=8)
    ax.set_xlabel("FTET")
    ax.set_title(f"{name} – " + L(f"รวม {c.ftet_calc.sum():.3f} FTET", f"total {c.ftet_calc.sum():.3f} FTET"))
    fig.tight_layout()
    return fig
