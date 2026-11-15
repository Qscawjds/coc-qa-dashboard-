"""Apple-inspired minimalist visualizations for CoC FTET Toolkit.
Designed in accordance with Apple Human Interface Guidelines:
Refined typography, SF Pro styling, subtle hierarchy, and iconic Apple color palettes.
"""
from __future__ import annotations
import copy
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Iconic Apple Color Palette
APPLE_COLORS = {
    "Comp": "#0071E3",    # Apple Signature Blue
    "DE": "#FF9500",      # Apple Orange
    "DBiz": "#34C759",    # Apple Green
    "AISE": "#AF52DE",    # Apple Purple
    "MsComp": "#FF2D55",  # Apple Pink / Crimson
    "CoC": "#1D1D1F",     # Apple Deep Space Gray
}
ORDER = ["Comp", "DE", "DBiz", "AISE", "MsComp", "CoC"]

APPLE_LAYOUT = dict(
    paper_bgcolor="rgba(255, 255, 255, 0)",
    plot_bgcolor="rgba(255, 255, 255, 0)",
    font=dict(
        family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
        size=13,
        color="#86868B"
    ),
    title_font=dict(
        family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        size=17,
        color="#1D1D1F"
    ),
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="center",
        x=0.5,
        font=dict(color="#1D1D1F", size=12),
        bgcolor="rgba(255, 255, 255, 0.8)",
        bordercolor="rgba(0, 0, 0, 0.06)",
        borderwidth=1
    ),
    margin=dict(l=40, r=30, t=50, b=40),
    hoverlabel=dict(
        bgcolor="rgba(255, 255, 255, 0.96)",
        font_size=13,
        font_family="-apple-system, BlinkMacSystemFont, sans-serif",
        font_color="#1D1D1F",
        bordercolor="rgba(0, 0, 0, 0.1)"
    ),
    xaxis=dict(
        gridcolor="rgba(0, 0, 0, 0.05)",
        zerolinecolor="rgba(0, 0, 0, 0.08)",
        showline=False,
        tickfont=dict(color="#86868B", size=12)
    ),
    yaxis=dict(
        gridcolor="rgba(0, 0, 0, 0.05)",
        zerolinecolor="rgba(0, 0, 0, 0.08)",
        showline=False,
        tickfont=dict(color="#86868B", size=12)
    )
)


def _apply_layout(fig: go.Figure, **kwargs):
    cfg = copy.deepcopy(APPLE_LAYOUT)
    for k, v in kwargs.items():
        if isinstance(v, dict) and k in cfg and isinstance(cfg[k], dict):
            cfg[k].update(v)
        else:
            cfg[k] = v
    fig.update_layout(**cfg)
    return fig


def _filtered_programs(summary: pd.DataFrame, programs=None):
    have = set(summary["program"])
    return [p for p in ORDER if p in have and (programs is None or p in programs)]


def fig_year_lines_apple(summary: pd.DataFrame, programs=None) -> go.Figure:
    """Apple-styled Spline Line chart with subtle area tints."""
    d = summary[summary.term == "AVG"].sort_values("year")
    fig = go.Figure()
    
    progs = _filtered_programs(d, programs)
    for p in progs:
        s = d[d.program == p]
        color = APPLE_COLORS.get(p, "#0071E3")
        is_coc = (p == "CoC")
        
        fig.add_trace(go.Scatter(
            x=s.year,
            y=s.ftet,
            mode="lines+markers",
            name=p,
            line=dict(
                color=color,
                width=3.2 if is_coc else 2.2,
                dash="dash" if is_coc else "solid",
                shape="spline"
            ),
            marker=dict(
                size=8 if is_coc else 7,
                color="#FFFFFF",
                line=dict(width=2.5, color=color)
            ),
            hovertemplate=f"<b>{p}</b><br>ปีการศึกษา %{{x}}<br>FTET เฉลี่ย: <b>%{{y:.3f}}</b><extra></extra>"
        ))

    _apply_layout(
        fig,
        title=dict(text="แนวโน้มภาระงานเฉลี่ยรายปีการศึกษา", font=dict(color="#1D1D1F", size=17)),
        xaxis_title="ปีการศึกษา",
        yaxis_title="FTET เฉลี่ย",
        hovermode="x unified"
    )
    return fig


def fig_year_bars_apple(summary: pd.DataFrame, programs=None) -> go.Figure:
    """Apple Bento Grouped Bars with smooth corners and pure aesthetics."""
    d = summary[summary.term == "AVG"].sort_values("year")
    progs = _filtered_programs(d, programs)
    d = d[d.program.isin(progs)]
    
    fig = go.Figure()
    for p in progs:
        sub = d[d.program == p]
        fig.add_trace(go.Bar(
            x=sub.year,
            y=sub.ftet,
            name=p,
            marker=dict(
                color=APPLE_COLORS.get(p, "#0071E3"),
                line=dict(width=0)
            ),
            hovertemplate=f"<b>{p}</b><br>ปีการศึกษา %{{x}}<br>FTET: <b>%{{y:.3f}}</b><extra></extra>"
        ))

    _apply_layout(
        fig,
        barmode="group",
        title=dict(text="เปรียบเทียบ FTET แต่ละหลักสูตรรายปี", font=dict(color="#1D1D1F", size=17)),
        xaxis_title="ปีการศึกษา",
        yaxis_title="FTET",
    )
    return fig


def fig_term_lines_apple(summary: pd.DataFrame, programs=None) -> go.Figure:
    """Apple Continuous Semester Timeline."""
    d = summary[summary.term.isin(["1", "2"])].copy()
    d["label"] = d.year.astype(str) + "/" + d.term
    d = d.sort_values(["year", "term"])
    labels = d["label"].drop_duplicates().tolist()
    
    progs = _filtered_programs(d, programs)
    fig = go.Figure()
    
    for p in progs:
        s = d[d.program == p].set_index("label").reindex(labels).reset_index()
        color = APPLE_COLORS.get(p, "#0071E3")
        fig.add_trace(go.Scatter(
            x=s["label"],
            y=s.ftet,
            mode="lines+markers",
            name=p,
            line=dict(color=color, width=2.2, shape="spline"),
            marker=dict(size=6, color=color),
            hovertemplate=f"<b>{p}</b><br>ภาคการศึกษา: %{{x}}<br>FTET: <b>%{{y:.3f}}</b><extra></extra>"
        ))

    _apply_layout(
        fig,
        title=dict(text="สถิติ FTET ต่อเนื่องรายภาคการศึกษา", font=dict(color="#1D1D1F", size=17)),
        xaxis_title="ปีการศึกษา / ภาค",
        yaxis_title="FTET",
        hovermode="x unified"
    )
    return fig


def fig_radar_apple(summary: pd.DataFrame) -> go.Figure:
    """Apple-styled Minimalist Spider / Radar Comparison."""
    d = summary[summary.term == "AVG"]
    progs = [p for p in ORDER[:-1] if p in set(d.program)]
    metrics = ["ค่าเฉลี่ยรวม", "ค่าสูงสุด", "ค่าต่ำสุด", "ปีล่าสุด (2567)", "ความสม่ำเสมอ"]
    
    fig = go.Figure()
    for p in progs:
        sub = d[d.program == p]
        avg_v = float(sub.ftet.mean()) if len(sub) else 0.0
        max_v = float(sub.ftet.max()) if len(sub) else 0.0
        min_v = float(sub.ftet.min()) if len(sub) else 0.0
        latest_row = sub[sub.year == 2567]
        latest_v = float(latest_row.ftet.values[0]) if len(latest_row) else avg_v
        std_v = float(sub.ftet.std()) if len(sub) > 1 else 0.0
        consistency = max(0.0, 1.0 - (std_v * 2.0))
        
        vals = [avg_v, max_v, min_v, latest_v, consistency * 0.6]
        vals.append(vals[0])
        
        color = APPLE_COLORS.get(p, "#0071E3")
        fig.add_trace(go.Scatterpolar(
            r=vals,
            theta=metrics + [metrics[0]],
            fill="toself",
            name=p,
            line=dict(color=color, width=1.8),
            opacity=0.35,
            hovertemplate=f"<b>{p}</b><br>%{{theta}}: %{{r:.3f}}<extra></extra>"
        ))
        
    fig.update_layout(
        paper_bgcolor="rgba(255,255,255,0)",
        plot_bgcolor="rgba(255,255,255,0)",
        font=dict(family="-apple-system, BlinkMacSystemFont, sans-serif", size=12, color="#86868B"),
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 0.7], gridcolor="rgba(0, 0, 0, 0.06)", linecolor="rgba(0, 0, 0, 0.08)"),
            angularaxis=dict(gridcolor="rgba(0, 0, 0, 0.06)", linecolor="rgba(0, 0, 0, 0.08)"),
            bgcolor="rgba(245, 245, 247, 0.5)"
        ),
        title=dict(text="มิติเปรียบเทียบศักยภาพแต่ละหลักสูตร (Radar Overview)", font=dict(color="#1D1D1F", size=17)),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.05,
            xanchor="center",
            x=0.5,
            font=dict(color="#1D1D1F")
        ),
        margin=dict(l=40, r=40, t=60, b=40)
    )
    return fig


def fig_heatmap_apple(summary: pd.DataFrame) -> go.Figure:
    """Apple-styled Heatmap with monochromatic blue shades."""
    d = summary[summary.term.isin(["1", "2"])].copy()
    d["label"] = d.year.astype(str) + "/" + d.term
    pv = d.pivot_table(index="program", columns="label", values="ftet")
    pv = pv.reindex([p for p in ORDER if p in pv.index])
    
    # Apple Blue Gradient
    colorscale = [
        [0.0, "#F5F5F7"],
        [0.3, "#D0E2FF"],
        [0.6, "#78A9FF"],
        [0.85, "#0071E3"],
        [1.0, "#00438F"]
    ]
    
    fig = go.Figure(data=go.Heatmap(
        z=pv.values,
        x=pv.columns,
        y=pv.index,
        colorscale=colorscale,
        text=np.round(pv.values, 2),
        texttemplate="%{text}",
        textfont=dict(color="#1D1D1F", size=11, family="-apple-system, sans-serif"),
        colorbar=dict(
            title=dict(text="FTET", font=dict(color="#86868B")),
            tickfont=dict(color="#86868B"),
            len=0.9
        ),
        hoverongaps=False,
        hovertemplate="หลักสูตร: <b>%{y}</b><br>ภาคการศึกษา: %{x}<br>FTET: <b>%{z:.3f}</b><extra></extra>"
    ))
    
    _apply_layout(
        fig,
        title=dict(text="ความหนาแน่นของภาระงาน (Heatmap Matrix)", font=dict(color="#1D1D1F", size=17)),
        xaxis_title="ปีการศึกษา / ภาค",
        yaxis_title=""
    )
    return fig


def fig_teacher_bars_apple(teachers: pd.DataFrame, title: str = "") -> go.Figure:
    """Apple-styled Horizontal Bar Chart with refined typography and soft benchmark."""
    t = teachers.sort_values("ftet").copy()
    mean_val = float(t.ftet.mean()) if len(t) else 0.0
    colors = [APPLE_COLORS.get(p, "#0071E3") for p in t.program]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        y=t.teacher,
        x=t.ftet,
        orientation="h",
        marker=dict(
            color=colors,
            opacity=0.92,
            line=dict(width=0)
        ),
        customdata=t[["program", "n_courses"]].values,
        hovertemplate="<b>%{y}</b><br>หลักสูตร: %{customdata[0]}<br>จำนวนรายวิชา: %{customdata[1]} วิชา<br>FTET: <b>%{x:.3f}</b><extra></extra>"
    ))
    
    # Apple benchmark indicator line
    fig.add_vline(
        x=mean_val,
        line_width=2,
        line_dash="dot",
        line_color="#1D1D1F",
        annotation_text=f"ค่าเฉลี่ย {mean_val:.2f}",
        annotation_position="top right",
        annotation_font=dict(color="#1D1D1F", size=12, family="-apple-system, sans-serif")
    )
    
    height = max(420, 24 * len(t) + 90)
    _apply_layout(
        fig,
        height=height,
        title=dict(text=title or "ภาระงาน FTET รายอาจารย์", font=dict(color="#1D1D1F", size=17)),
        xaxis_title="FTET รวม (เกณฑ์มาตรฐาน 1.0 = 525 ชม./ภาค)",
        yaxis=dict(
            dtick=1,
            gridcolor="rgba(0, 0, 0, 0.03)",
            tickfont=dict(size=11, color="#1D1D1F")
        )
    )
    return fig


def fig_teacher_breakdown_apple(courses: pd.DataFrame, teacher_id: int) -> tuple[go.Figure, float]:
    """Apple-styled Clean Donut breakdown for individual instructor."""
    c = courses[courses.teacher_id == teacher_id].copy()
    c = c[c.ftet_calc > 0].sort_values("ftet_calc", ascending=True)
    
    total_ftet = float(c.ftet_calc.sum()) if len(c) else 0.0
    teacher_name = c.teacher.iat[0] if len(c) else f"ID {teacher_id}"
    
    apple_donut_palette = ["#0071E3", "#34C759", "#FF9500", "#AF52DE", "#5856D6", "#FF2D55", "#00C7BE"]
    
    donut = go.Figure(data=[go.Pie(
        labels=c.code.astype(str) + " " + c.course.astype(str),
        values=c.ftet_calc,
        hole=0.68,
        marker=dict(colors=apple_donut_palette[:len(c)]),
        textinfo="percent",
        hoverinfo="label+value+percent",
        hovertemplate="<b>%{label}</b><br>FTET: <b>%{value:.3f}</b> (%{percent})<extra></extra>"
    )])
    
    donut.update_layout(
        paper_bgcolor="rgba(255, 255, 255, 0)",
        plot_bgcolor="rgba(255, 255, 255, 0)",
        font=dict(family="-apple-system, BlinkMacSystemFont, sans-serif", color="#1D1D1F"),
        title=dict(text=f"สัดส่วนภาระงาน: {teacher_name}", font=dict(color="#1D1D1F", size=15)),
        annotations=[dict(
            text=f"<b style='font-size:24px; color:#1D1D1F;'>{total_ftet:.3f}</b><br><span style='font-size:11px; color:#86868B;'>TOTAL FTET</span>",
            x=0.5, y=0.5,
            showarrow=False
        )],
        legend=dict(
            orientation="v",
            x=1.02,
            y=0.5,
            font=dict(size=11, color="#86868B"),
            bgcolor="rgba(255, 255, 255, 0.7)"
        ),
        margin=dict(l=20, r=20, t=50, b=20),
        height=320
    )
    
    return donut, total_ftet


def fig_gauge_apple(ftet_val: float) -> go.Figure:
    """Apple Activity Ring-inspired Minimalist Workload Gauge."""
    if ftet_val < 0.4:
        accent = "#0071E3"  # Apple Blue (Light Load)
        status = "ภาระงานเบา (Light Workload)"
    elif ftet_val <= 1.0:
        accent = "#34C759"  # Apple Green (Optimal Workload)
        status = "ภาระงานมาตรฐาน (Optimal)"
    else:
        accent = "#FF3B30"  # Apple Red (Exceeds Standard)
        status = "เกินเกณฑ์มาตรฐาน (Overload)"
        
    gauge = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=ftet_val,
        domain={'x': [0, 1], 'y': [0, 1]},
        delta={'reference': 1.0, 'position': "bottom", 'increasing': {'color': "#FF3B30"}, 'decreasing': {'color': "#34C759"}},
        number={'suffix': " FTET", 'font': {'size': 32, 'color': "#1D1D1F", 'family': "-apple-system, BlinkMacSystemFont, sans-serif"}},
        gauge={
            'axis': {'range': [0, 1.5], 'tickwidth': 1, 'tickcolor': "#86868B", 'tickfont': {'color': "#86868B", 'size': 11}},
            'bar': {'color': accent, 'thickness': 0.3},
            'bgcolor': "rgba(0, 0, 0, 0.04)",
            'borderwidth': 0,
            'steps': [
                {'range': [0, 0.4], 'color': 'rgba(0, 113, 227, 0.08)'},
                {'range': [0.4, 1.0], 'color': 'rgba(52, 199, 89, 0.1)'},
                {'range': [1.0, 1.5], 'color': 'rgba(255, 59, 48, 0.12)'}
            ],
            'threshold': {
                'line': {'color': "#FF3B30", 'width': 3},
                'thickness': 0.8,
                'value': 1.0
            }
        }
    ))
    
    gauge.update_layout(
        paper_bgcolor="rgba(255, 255, 255, 0)",
        plot_bgcolor="rgba(255, 255, 255, 0)",
        font={'color': "#1D1D1F", 'family': "-apple-system, BlinkMacSystemFont, sans-serif"},
        margin=dict(l=30, r=30, t=30, b=20),
        height=260,
        title={'text': status, 'font': {'size': 14, 'color': accent}, 'y': 0.95}
    )
    return gauge
