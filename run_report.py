"""Generate charts (PNG), tidy CSVs and a single-file HTML report.

    python run_report.py                       # uses data/FTET_CoC.xlsx -> output/
    python run_report.py --xlsx my.xlsx --out out_dir
"""
from __future__ import annotations
import argparse, base64, html, io
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt

from ftet import (load_summary, load_courses, available_terms, load_program_totals,
                  teacher_totals, program_stats, validate_courses, DEFAULT_XLSX)
from ftet.calc import add_calc_column
from ftet import charts


def b64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode()


def table(df: pd.DataFrame, floats=3) -> str:
    return df.to_html(index=False, border=0, classes="t",
                      float_format=lambda x: f"{x:.{floats}f}", na_rep="–")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", default=str(DEFAULT_XLSX))
    ap.add_argument("--out", default="output")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

    summary = load_summary(a.xlsx)
    summary.to_csv(out / "summary_tidy.csv", index=False, encoding="utf-8-sig")

    figs = {
        "01_year_lines": charts.fig_year_lines(summary),
        "02_year_bars": charts.fig_year_bars(summary),
        "03_term_lines": charts.fig_term_lines(summary),
        "04_heatmap": charts.fig_heatmap(summary),
    }
    sections, all_teachers, issues = [], [], []
    for year, term in available_terms(a.xlsx):
        c = add_calc_column(load_courses(a.xlsx, year, term))
        t = teacher_totals(c)
        t.insert(0, "label", f"{year}/{term}")
        all_teachers.append(t)
        bad = validate_courses(c)
        if len(bad):
            issues.append(bad.assign(label=f"{year}/{term}")[
                ["label", "teacher", "code", "course", "sections", "lecture", "lab", "project",
                 "weeks", "ftet_sheet", "ftet_calc"]])
        figs[f"05_teachers_{year}_{term}"] = charts.fig_teacher_bars(t, f"FTET {year}/{term}")
        sections.append((year, term, t))
        t.to_csv(out / f"teachers_{year}_{term}.csv", index=False, encoding="utf-8-sig")
        c.to_csv(out / f"courses_{year}_{term}.csv", index=False, encoding="utf-8-sig")
    teachers = pd.concat(all_teachers, ignore_index=True)
    figs["06_box_by_program"] = charts.fig_teacher_box(teachers)

    # cross-check: summary table vs per-programme sheets (2567)
    xs = []
    for term in (1, 2):
        pt = load_program_totals(a.xlsx, 2567, term)
        s = summary[(summary.year == 2567) & (summary.term == str(term))][["program", "ftet"]]
        m = pt.merge(s, on="program", how="left").rename(columns={"ftet": "summary_table"})
        m["diff"] = (m.sheet_total - m.summary_table).abs()
        xs.append(m)
    cross = pd.concat(xs) if xs else pd.DataFrame()

    for name, fig in list(figs.items()):
        if hasattr(fig, "savefig"):
            fig.savefig(out / f"{name}.png", dpi=130, bbox_inches="tight")

    # ---- HTML ----
    parts = ["<!doctype html><meta charset='utf-8'><title>CoC FTET report</title>",
             "<style>body{font-family:'Sarabun','Noto Sans Thai',Tahoma,sans-serif;max-width:1000px;margin:24px auto;padding:0 12px}"
             "img{max-width:100%}table.t{border-collapse:collapse;font-size:13px}"
             "table.t td,table.t th{border-bottom:1px solid #ddd;padding:3px 8px;text-align:right}"
             "table.t td:first-child,table.t th:first-child{text-align:left}h2{margin-top:32px}</style>",
             "<h1>รายงาน FTET อาจารย์ วิทยาลัยการคอมพิวเตอร์</h1>",
             "<p>FTET = ((ชม.บรรยาย×2)+(ชม.ปฏิบัติการ×1.5)+โครงงาน) × section × สัปดาห์ ÷ 525</p>",
             "<h2>1) ค่าเฉลี่ย FTET รายหลักสูตร</h2>"]
    for k in ["01_year_lines", "02_year_bars", "03_term_lines", "04_heatmap"]:
        parts.append(f"<img src='data:image/png;base64,{b64(figs[k])}'>")
    pv = summary[summary.term == "AVG"].pivot(index="program", columns="year", values="ftet").reset_index()
    parts.append(table(pv))
    parts.append("<h2>2) FTET รายอาจารย์</h2>")
    for year, term, t in sections:
        parts.append(f"<h3>ภาคการศึกษา {year}/{term} – {len(t)} คน</h3>")
        parts.append(f"<img src='data:image/png;base64,{b64(figs[f'05_teachers_{year}_{term}'])}'>")
        parts.append(table(program_stats(t)))
    parts.append(f"<h3>การกระจายตามหลักสูตร (ทุกภาค)</h3><img src='data:image/png;base64,{b64(figs['06_box_by_program'])}'>")
    parts.append("<h2>3) ตรวจสอบข้อมูล</h2><h3>แถวที่ค่า FTET ในไฟล์ ≠ ค่าที่คำนวณจากสูตร</h3>")
    parts.append(table(pd.concat(issues), 4) if issues else "<p>ไม่พบ</p>")
    parts.append("<h3>เทียบตารางสรุป กับชีตรายหลักสูตร (2567)</h3>")
    parts.append(table(cross, 4) if len(cross) else "<p>–</p>")
    (out / "report.html").write_text("\n".join(parts), encoding="utf-8")
    (out / "data_issues.csv").write_text(
        (pd.concat(issues).to_csv(index=False) if issues else "none\n"), encoding="utf-8-sig")

    print(f"Done -> {out.resolve()}")
    print(f"  terms with course data : {[f'{y}/{t}' for y, t, _ in sections]}")
    print(f"  rows with data issues  : {sum(len(i) for i in issues)}")
    print(f"  max |summary - sheet|  : {cross['diff'].max():.4f}" if len(cross) else "")


if __name__ == "__main__":
    main()
