"""High-Tech & Minimalist Plotly Visualizations for CoC FTET Toolkit."""
from __future__ import annotations
import copy
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Minimalist High-Tech Color Palette
TECH_COLORS = {
    "Comp": "#00F2FE",    # Cyber Neon Cyan
    "DE": "#FF8C00",      # Electric Neon Amber
    "DBiz": "#00E676",    # Vivid Emerald
    "AISE": "#D946EF",    # Neon Purple/Magenta
    "MsComp": "#FF3366",  # Coral Crimson
    "CoC": "#F8FAFC",     # Bright Platinum
}
ORDER = ["Comp", "DE", "DBiz", "AISE", "MsComp", "CoC"]

BASE_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(10,14,23,0.5)",
    font=dict(family="sans-serif", size=13, color="#94A3B8"),
    title_font=dict(family="sans-serif", size=16, color="#F8FAFC"),
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="center",
        x=0.5,
        font=dict(color="#CBD5E1", size=12),
        bgcolor="rgba(15,23,42,0.6)",
        bordercolor="rgba(255,255,255,0.08)",
        borderwidth=1
    ),
    margin=dict(l=40, r=30, t=50, b=40),
    hoverlabel=dict(
        bgcolor="#0F172A",
        font_size=13,
        font_color="#F8FAFC",
        bordercolor="#38BDF8"
    ),
    xaxis=dict(
        gridcolor="rgba(255,255,255,0.06)",
        zerolinecolor="rgba(255,255,255,0.1)",
        showline=True,
        linecolor="rgba(255,255,255,0.15)",
        tickfont=dict(color="#94A3B8")
    ),
    yaxis=dict(
        gridcolor="rgba(255,255,255,0.06)",
        zerolinecolor="rgba(255,255,255,0.1)",
        showline=True,
        linecolor="rgba(255,255,255,0.15)",
        tickfont=dict(color="#94A3B8")
    )
)


def _apply_layout(fig: go.Figure, **kwargs):
    cfg = copy.deepcopy(BASE_LAYOUT)
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


def fig_year_lines_hightech(summary: pd.DataFrame, programs=None) -> go.Figure:
    """Cyber Spline Line chart with glowing fills and clean grid."""
    d = summary[summary.term == "AVG"].sort_values("year")
    fig = go.Figure()
    
    progs = _filtered_programs(d, programs)
    for p in progs:
        s = d[d.program == p]
        color = TECH_COLORS.get(p, "#38BDF8")
        is_coc = (p == "CoC")
        
        # Line with glowing spline
        fig.add_trace(go.Scatter(
            x=s.year,
            y=s.ftet,
            mode="lines+markers",
            name=p,
            line=dict(
                color=color,
                width=3.5 if is_coc else 2.2,
                dash="dash" if is_coc else "solid",
                shape="spline"
            ),
            marker=dict(
                size=8 if is_coc else 7,
                symbol="diamond" if is_coc else "circle",
                color=color,
                line=dict(width=1.5, color="#0F172A")
            ),
            hovertemplate=f"<b>{p}</b><br>ปีการศึกษา: %{{x}}<br>FTET เฉลี่ย: <b>%{{y:.3f}}</b><extra></extra>"
        ))

    _apply_layout(
        fig,
        title="📈 แนวโน้มค่า FTET เฉลี่ยรายปี (Spline Glow)",
        xaxis_title="ปีการศึกษา",
        yaxis_title="FTET เฉลี่ย",
        hovermode="x unified"
    )
    return fig


def fig_year_bars_hightech(summary: pd.DataFrame, programs=None) -> go.Figure:
    """Minimalist Bar comparison with modern gradient palette."""
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
                color=TECH_COLORS.get(p, "#38BDF8"),
                opacity=0.88,
                line=dict(width=1, color="rgba(255,255,255,0.2)")
            ),
            hovertemplate=f"<b>{p}</b><br>ปีการศึกษา: %{{x}}<br>FTET: <b>%{{y:.3f}}</b><extra></extra>"
        ))

    _apply_layout(
        fig,
        barmode="group",
        title="📊 เปรียบเทียบ FTET แต่ละหลักสูตรรายปี",
        xaxis_title="ปีการศึกษา",
        yaxis_title="FTET",
    )
    return fig


def fig_term_lines_hightech(summary: pd.DataFrame, programs=None) -> go.Figure:
    """High-Tech Semester Trends with area fills."""
    d = summary[summary.term.isin(["1", "2"])].copy()
    d["label"] = d.year.astype(str) + "/" + d.term
    d = d.sort_values(["year", "term"])
    labels = d["label"].drop_duplicates().tolist()
    
    progs = _filtered_programs(d, programs)
    fig = go.Figure()
    
    for p in progs:
        s = d[d.program == p].set_index("label").reindex(labels).reset_index()
        color = TECH_COLORS.get(p, "#38BDF8")
        fig.add_trace(go.Scatter(
            x=s["label"],
            y=s.ftet,
            mode="lines+markers",
            name=p,
            line=dict(color=color, width=2.5, shape="spline"),
            marker=dict(size=6, color=color),
            hovertemplate=f"<b>{p}</b><br>ภาคการศึกษา: %{{x}}<br>FTET: <b>%{{y:.3f}}</b><extra></extra>"
        ))

    _apply_layout(
        fig,
        title="⚡ FTET ต่อเนื่องรายภาคการศึกษา (Timeline)",
        xaxis_title="ปีการศึกษา / ภาค",
        yaxis_title="FTET",
        hovermode="x unified"
    )
    return fig


def fig_radar_hightech(summary: pd.DataFrame) -> go.Figure:
    """Futuristic Radar / Spider Chart comparing core program metrics."""
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
        
        color = TECH_COLORS.get(p, "#38BDF8")
        fig.add_trace(go.Scatterpolar(
            r=vals,
            theta=metrics + [metrics[0]],
            fill="toself",
            name=p,
            line=dict(color=color, width=2),
            opacity=0.45,
            hovertemplate=f"<b>{p}</b><br>%{{theta}}: %{{r:.3f}}<extra></extra>"
        ))
        
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="sans-serif", size=12, color="#94A3B8"),
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 0.7], gridcolor="rgba(255,255,255,0.08)", linecolor="rgba(255,255,255,0.1)"),
            angularaxis=dict(gridcolor="rgba(255,255,255,0.08)", linecolor="rgba(255,255,255,0.1)"),
            bgcolor="rgba(10,14,23,0.5)"
        ),
        title=dict(text="🎯 Cyber Radar: วิเคราะห์ศักยภาพรอบด้านแต่ละหลักสูตร", font=dict(color="#F8FAFC", size=16)),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.05,
            xanchor="center",
            x=0.5,
            font=dict(color="#CBD5E1")
        ),
        margin=dict(l=40, r=40, t=60, b=40)
    )
    return fig


def fig_heatmap_hightech(summary: pd.DataFrame) -> go.Figure:
    """Cyber Neon Heatmap with refined gradient colorscale."""
    d = summary[summary.term.isin(["1", "2"])].copy()
    d["label"] = d.year.astype(str) + "/" + d.term
    pv = d.pivot_table(index="program", columns="label", values="ftet")
    pv = pv.reindex([p for p in ORDER if p in pv.index])
    
    colorscale = [
        [0.0, "#0B132B"],
        [0.3, "#1C2541"],
        [0.6, "#0077B6"],
        [0.85, "#00F2FE"],
        [1.0, "#F8FAFC"]
    ]
    
    fig = go.Figure(data=go.Heatmap(
        z=pv.values,
        x=pv.columns,
        y=pv.index,
        colorscale=colorscale,
        text=np.round(pv.values, 2),
        texttemplate="%{text}",
        textfont=dict(color="#FFFFFF", size=11),
        colorbar=dict(
            title=dict(text="FTET", font=dict(color="#94A3B8")),
            tickfont=dict(color="#94A3B8"),
            len=0.9
        ),
        hoverongaps=False,
        hovertemplate="หลักสูตร: <b>%{y}</b><br>ภาคการศึกษา: %{x}<br>FTET: <b>%{z:.3f}</b><extra></extra>"
    ))
    
    _apply_layout(
        fig,
        title="🔥 Cyber Heatmap: ภาระงานหลักสูตร × ภาคการศึกษา",
        xaxis_title="ปีการศึกษา / ภาค",
        yaxis_title=""
    )
    return fig


def fig_teacher_bars_hightech(teachers: pd.DataFrame, title: str = "") -> go.Figure:
    """Interactive horizontal bar with workload color indicators and mean line."""
    t = teachers.sort_values("ftet").copy()
    mean_val = float(t.ftet.mean()) if len(t) else 0.0
    
    colors = [TECH_COLORS.get(p, "#38BDF8") for p in t.program]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        y=t.teacher,
        x=t.ftet,
        orientation="h",
        marker=dict(
            color=colors,
            opacity=0.88,
            line=dict(color="rgba(255,255,255,0.15)", width=1)
        ),
        customdata=t[["program", "n_courses"]].values,
        hovertemplate="<b>%{y}</b><br>หลักสูตร: %{customdata[0]}<br>จำนวนวิชา: %{customdata[1]} วิชา<br>FTET รวม: <b>%{x:.3f}</b><extra></extra>"
    ))
    
    # High-tech Benchmark Line for Mean
    fig.add_vline(
        x=mean_val,
        line_width=2,
        line_dash="dot",
        line_color="#FACC15",
        annotation_text=f"ค่าเฉลี่ย: {mean_val:.2f}",
        annotation_position="top right",
        annotation_font=dict(color="#FACC15", size=12)
    )
    
    height = max(420, 24 * len(t) + 90)
    _apply_layout(
        fig,
        height=height,
        title=f"👨‍🏫 {title or 'FTET รายอาจารย์ (Interactive Hierarchy)'}",
        xaxis_title="FTET รวม (1.0 = 525 ชม./ภาค)",
        yaxis=dict(
            dtick=1,
            gridcolor="rgba(255,255,255,0.03)",
            tickfont=dict(size=11, color="#E2E8F0")
        )
    )
    return fig


def fig_teacher_breakdown_hightech(courses: pd.DataFrame, teacher_id: int) -> tuple[go.Figure, float]:
    """Breakdown of single teacher FTET: Donut Chart & Detailed Subject Bars."""
    c = courses[courses.teacher_id == teacher_id].copy()
    c = c[c.ftet_calc > 0].sort_values("ftet_calc", ascending=True)
    
    total_ftet = float(c.ftet_calc.sum()) if len(c) else 0.0
    teacher_name = c.teacher.iat[0] if len(c) else f"ID {teacher_id}"
    
    # Donut Chart for proportions
    donut = go.Figure(data=[go.Pie(
        labels=c.code.astype(str) + " " + c.course.astype(str),
        values=c.ftet_calc,
        hole=0.62,
        marker=dict(colors=px.colors.sequential.Tealgrn_r),
        textinfo="percent",
        hoverinfo="label+value+percent",
        hovertemplate="<b>%{label}</b><br>FTET: <b>%{value:.3f}</b> (%{percent})<extra></extra>"
    )])
    
    donut.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="sans-serif", color="#CBD5E1"),
        title=dict(text=f"สัดส่วนรายวิชา: {teacher_name}", font=dict(color="#F8FAFC", size=15)),
        annotations=[dict(
            text=f"<b>{total_ftet:.3f}</b><br><span style='font-size:11px;color:#94A3B8'>FTET</span>",
            x=0.5, y=0.5,
            font_size=18,
            font_color="#00F2FE",
            showarrow=False
        )],
        legend=dict(
            orientation="v",
            x=1.02,
            y=0.5,
            font=dict(size=11, color="#CBD5E1"),
            bgcolor="rgba(15,23,42,0.6)"
        ),
        margin=dict(l=20, r=20, t=50, b=20),
        height=320
    )
    
    return donut, total_ftet


def fig_gauge_ftet(ftet_val: float) -> go.Figure:
    """High-tech Neon Workload Speedometer / Gauge."""
    # Determine color zone
    if ftet_val < 0.4:
        accent = "#00F2FE"  # Cyan (Light)
        status = "ภาระงานเบา (Light Load)"
    elif ftet_val <= 1.0:
        accent = "#00E676"  # Green (Optimal)
        status = "ภาระงานมาตรฐาน (Optimal Range)"
    else:
        accent = "#EF4444"  # Red (Overload)
        status = "ภาระงานสูงเกินเกณฑ์ (Overload)"
        
    gauge = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=ftet_val,
        domain={'x': [0, 1], 'y': [0, 1]},
        delta={'reference': 1.0, 'position': "bottom", 'increasing': {'color': "#EF4444"}, 'decreasing': {'color': "#00E676"}},
        number={'suffix': " FTET", 'font': {'size': 28, 'color': accent, 'family': "sans-serif"}},
        gauge={
            'axis': {'range': [0, 1.5], 'tickwidth': 1, 'tickcolor': "#94A3B8", 'tickfont': {'color': "#94A3B8"}},
            'bar': {'color': accent, 'thickness': 0.28},
            'bgcolor': "rgba(15,23,42,0.8)",
            'borderwidth': 1,
            'bordercolor': "rgba(255,255,255,0.1)",
            'steps': [
                {'range': [0, 0.4], 'color': 'rgba(0, 242, 254, 0.12)'},
                {'range': [0.4, 1.0], 'color': 'rgba(0, 230, 118, 0.12)'},
                {'range': [1.0, 1.5], 'color': 'rgba(239, 68, 68, 0.15)'}
            ],
            'threshold': {
                'line': {'color': "#EF4444", 'width': 3},
                'thickness': 0.8,
                'value': 1.0
            }
        }
    ))
    
    gauge.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font={'color': "#F8FAFC", 'family': "sans-serif"},
        margin=dict(l=30, r=30, t=30, b=20),
        height=260,
        title={'text': f"⚡ {status}", 'font': {'size': 14, 'color': "#94A3B8"}, 'y': 0.95}
    )
    return gauge
