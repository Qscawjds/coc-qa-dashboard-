"""CoC FTET Toolkit – Apple Web Design Language Dashboard."""
from __future__ import annotations
import pandas as pd
import streamlit as st

from ftet import (load_summary, load_courses, available_terms, teacher_totals,
                  program_stats, DEFAULT_XLSX, course_ftet)
from ftet.calc import add_calc_column
from ftet import charts_apple as apple_charts

# Page Configuration
st.set_page_config(
    page_title="CoC FTET – Designed by Apple Guidelines",
    page_icon="🍎",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Apple Design System CSS (SF Pro, Cupertino Minimal, Bento Grid, Frosted Glass)
st.markdown("""
<style>
    /* Global Typography & Background */
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');
    
    .stApp {
        background-color: #F5F5F7 !important;
        color: #1D1D1F !important;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    /* Top Floating Apple Header / Banner */
    .apple-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0 20px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        margin-bottom: 24px;
    }
    .apple-logo-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1D1D1F;
        letter-spacing: -0.01em;
    }
    
    /* Hero Typography */
    .apple-eyebrow {
        font-size: 0.85rem;
        font-weight: 600;
        color: #0071E3;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
    }
    .apple-headline {
        font-size: 2.8rem;
        font-weight: 700;
        letter-spacing: -0.035em;
        color: #1D1D1F;
        line-height: 1.12;
        margin-bottom: 8px;
    }
    .apple-subhead {
        font-size: 1.15rem;
        color: #86868B;
        font-weight: 400;
        letter-spacing: -0.015em;
        line-height: 1.45;
        margin-bottom: 28px;
    }
    
    /* Apple Bento Grid KPI Cards */
    .bento-card {
        background: #FFFFFF;
        border-radius: 20px;
        padding: 22px 24px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .bento-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    }
    .bento-category {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #86868B;
        margin-bottom: 8px;
    }
    .bento-value {
        font-size: 2.1rem;
        font-weight: 700;
        color: #1D1D1F;
        letter-spacing: -0.03em;
        line-height: 1.1;
    }
    .bento-pill {
        display: inline-block;
        margin-top: 10px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: -0.01em;
        width: fit-content;
    }
    .pill-blue { background: rgba(0, 113, 227, 0.08); color: #0071E3; }
    .pill-orange { background: rgba(255, 149, 0, 0.1); color: #FF9500; }
    .pill-purple { background: rgba(175, 82, 222, 0.1); color: #AF52DE; }
    .pill-green { background: rgba(52, 199, 89, 0.1); color: #34C759; }

    /* Bento Container for Charts */
    .chart-container {
        background: #FFFFFF;
        border-radius: 22px;
        padding: 24px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
        margin-bottom: 24px;
    }

    /* Apple Segmented Control / Tabs Styling */
    .stTabs [data-baseweb="tab-list"] {
        background: rgba(118, 118, 128, 0.12);
        padding: 4px;
        border-radius: 14px;
        gap: 4px;
        border-bottom: none;
        max-width: fit-content;
        margin-bottom: 24px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 10px;
        padding: 8px 18px;
        color: #1D1D1F;
        background: transparent;
        border: none;
        font-size: 0.88rem;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    .stTabs [aria-selected="true"] {
        background: #FFFFFF !important;
        color: #1D1D1F !important;
        font-weight: 600 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        border-bottom: none !important;
    }

    /* Sidebar Styling (Apple Settings Style) */
    section[data-testid="stSidebar"] {
        background-color: #FFFFFF !important;
        border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
    }
    section[data-testid="stSidebar"] * {
        color: #1D1D1F;
    }
    
    /* Clean inputs & selectboxes */
    .stSelectbox div[data-baseweb="select"] > div {
        background-color: #F5F5F7;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        color: #1D1D1F;
    }
    .stMultiSelect div[data-baseweb="select"] > div {
        background-color: #F5F5F7;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
    }
    
    /* Expander */
    .streamlit-expanderHeader {
        background-color: #FFFFFF !important;
        border-radius: 12px !important;
        color: #1D1D1F !important;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)


# Load Data (Standard default dataset)
@st.cache_data(show_spinner=False)
def _load_data():
    summary_df = load_summary(DEFAULT_XLSX)
    terms_list = available_terms(DEFAULT_XLSX)
    return summary_df, terms_list


@st.cache_data(show_spinner=False)
def _load_term_courses(y, t):
    return add_calc_column(load_courses(DEFAULT_XLSX, y, t))


summary, terms = _load_data()

# ----------------- APPLE SIDEBAR -----------------
with st.sidebar:
    st.markdown("""
    <div style="padding: 10px 0 16px 0;">
        <span style="font-size: 1.3rem;"></span>
        <span style="font-size: 1.05rem; font-weight: 600; color: #1D1D1F; margin-left: 6px;">CoC FTET</span>
        <div style="color: #86868B; font-size: 0.82rem; margin-top: 2px;">Faculty Workload Intelligence</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
    <div style="background: #F5F5F7; padding: 14px 16px; border-radius: 14px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #34C759;"></div>
            <span style="font-size: 0.78rem; font-weight: 600; color: #1D1D1F; text-transform: uppercase; letter-spacing: 0.05em;">ระบบพร้อมทำงาน</span>
        </div>
        <div style="font-size: 0.85rem; color: #1D1D1F; font-weight: 500; margin-top: 8px;">FTET_CoC.xlsx</div>
        <div style="font-size: 0.75rem; color: #86868B;">ครอบคลุมปีการศึกษา 2562–2567</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Overview metrics
    d_avg = summary[summary.term == "AVG"]
    latest_year = d_avg.year.max()
    coc_latest = d_avg[(d_avg.year == latest_year) & (d_avg.program == "CoC")]
    latest_coc_val = coc_latest.ftet.values[0] if len(coc_latest) else d_avg.ftet.mean()
    
    st.markdown(f"""
    <div style="background: #FFFFFF; border: 1px solid rgba(0,0,0,0.06); padding: 14px 16px; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 20px;">
        <div style="font-size: 0.75rem; color: #86868B; font-weight: 500; text-transform: uppercase;">ปีการศึกษาล่าสุด</div>
        <div style="font-size: 1.3rem; font-weight: 700; color: #1D1D1F; margin: 2px 0;">ปี {latest_year}</div>
        <div style="font-size: 0.82rem; color: #0071E3; font-weight: 500;">ค่าเฉลี่ยคณะ: {latest_coc_val:.3f} FTET</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.divider()
    st.markdown("""
    <div style="color: #86868B; font-size: 0.78rem; line-height: 1.5;">
        <b style="color: #1D1D1F;">สูตรคำนวณมาตรฐาน:</b><br>
        ((บรรยาย×2) + (ปฏิบัติการ×1.5) + โครงงาน) × section × สัปดาห์ ÷ 525<br><br>
        <i>*1.0 FTET เทียบเท่า 35 ชม./สัปดาห์ (525 ชม./ภาค)</i>
    </div>
    """, unsafe_allow_html=True)


# ----------------- MAIN CONTENT -----------------
# Header Section (Apple Style)
st.markdown("""
<div class="apple-nav">
    <div class="apple-logo-badge">
        <span style="font-size: 1.1rem;"></span>
        <span>วิทยาลัยการคอมพิวเตอร์ • มหาวิทยาลัยสงขลานครินทร์</span>
    </div>
    <div style="font-size: 0.85rem; color: #86868B;">Academic Quality Assurance</div>
</div>
""", unsafe_allow_html=True)

st.markdown('<div class="apple-eyebrow">Faculty Workload Intelligence</div>', unsafe_allow_html=True)
st.markdown('<div class="apple-headline">FTET. ความเรียบง่ายที่ทรงพลัง.</div>', unsafe_allow_html=True)
st.markdown('<div class="apple-subhead">ระบบวิเคราะห์ภาระงานอาจารย์เชิงคุณภาพ ออกแบบเพื่อความโปร่งใส ความแม่นยำ และการตัดสินใจที่รวดเร็ว</div>', unsafe_allow_html=True)

# ----------------- BENTO GRID KPI CARDS -----------------
avg_summary = summary[summary.term == "AVG"]
total_programs = len([p for p in apple_charts.ORDER[:-1] if p in set(avg_summary.program)])
mean_ftet_overall = avg_summary[avg_summary.program == "CoC"].ftet.mean()
max_prog_row = avg_summary[avg_summary.program != "CoC"].groupby("program")["ftet"].mean().idxmax()
max_prog_val = avg_summary[avg_summary.program != "CoC"].groupby("program")["ftet"].mean().max()

b1, b2, b3, b4 = st.columns(4)
with b1:
    st.markdown(f"""
    <div class="bento-card">
        <div>
            <div class="bento-category">FTET เฉลี่ยทั้งคณะ (CoC)</div>
            <div class="bento-value">{mean_ftet_overall:.3f}</div>
        </div>
        <div class="bento-pill pill-blue">เฉลี่ยรวม 6 ปีการศึกษา</div>
    </div>
    """, unsafe_allow_html=True)

with b2:
    st.markdown(f"""
    <div class="bento-card">
        <div>
            <div class="bento-category">หลักสูตรภาระงานสูงสุด</div>
            <div class="bento-value">{max_prog_row}</div>
        </div>
        <div class="bento-pill pill-orange">เฉลี่ย {max_prog_val:.3f} FTET</div>
    </div>
    """, unsafe_allow_html=True)

with b3:
    st.markdown(f"""
    <div class="bento-card">
        <div>
            <div class="bento-category">หลักสูตรที่วิเคราะห์</div>
            <div class="bento-value">{total_programs} <span style="font-size:1.1rem;font-weight:500;color:#86868B;">สาขา</span></div>
        </div>
        <div class="bento-pill pill-purple">ครอบคลุมทุกระดับชั้น</div>
    </div>
    """, unsafe_allow_html=True)

with b4:
    st.markdown(f"""
    <div class="bento-card">
        <div>
            <div class="bento-category">เกณฑ์มาตรฐาน 1.0 FTET</div>
            <div class="bento-value">525 <span style="font-size:1.1rem;font-weight:500;color:#86868B;">ชม.</span></div>
        </div>
        <div class="bento-pill pill-green">35 ชั่วโมง / สัปดาห์</div>
    </div>
    """, unsafe_allow_html=True)

st.write("")

# ----------------- APPLE SEGMENTED TABS -----------------
tab1, tab2, tab3, tab4 = st.tabs([
    "สถิติรายหลักสูตร",
    "ภาระงานรายอาจารย์",
    "เครื่องมือคำนวณ FTET",
    "ทำเนียบคณาจารย์"
])

# ----- TAB 1: สถิติรายหลักสูตร -----
with tab1:
    st.markdown('<div class="chart-container">', unsafe_allow_html=True)
    c_filt, c_style = st.columns([3, 2])
    with c_filt:
        progs = [p for p in apple_charts.ORDER if p in set(summary.program)]
        sel_progs = st.multiselect("เลือกหลักสูตรที่ต้องการเปรียบเทียบ", progs, default=progs)
    with c_style:
        style_choice = st.selectbox(
            "มุมมองการวิเคราะห์",
            ["แนวโน้มเส้นรายปี (Spline Curve)",
             "เปรียบเทียบแท่งรายปี (Grouped Bars)",
             "เส้นต่อเนื่องรายภาค (Semester Timeline)",
             "เรดาร์วิเคราะห์ศักยภาพ (Radar Comparison)",
             "ความหนาแน่นภาระงาน (Heatmap Matrix)"]
        )
    
    if "Spline Curve" in style_choice:
        fig = apple_charts.fig_year_lines_apple(summary, sel_progs)
    elif "Grouped Bars" in style_choice:
        fig = apple_charts.fig_year_bars_apple(summary, sel_progs)
    elif "Semester Timeline" in style_choice:
        fig = apple_charts.fig_term_lines_apple(summary, sel_progs)
    elif "Radar Comparison" in style_choice:
        fig = apple_charts.fig_radar_apple(summary)
    else:
        fig = apple_charts.fig_heatmap_apple(summary)
        
    st.plotly_chart(fig, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    with st.expander("ตารางข้อมูลสรุปตัวเลข FTET เฉลี่ยรายปี"):
        pv_table = summary[summary.term == "AVG"].pivot(index="program", columns="year", values="ftet").round(3)
        pv_table = pv_table.reindex([p for p in apple_charts.ORDER if p in pv_table.index])
        st.dataframe(pv_table, use_container_width=True)

# ----- TAB 2: ภาระงานรายอาจารย์ -----
with tab2:
    st.markdown('<div class="chart-container">', unsafe_allow_html=True)
    col_term, col_prog = st.columns([1, 2])
    with col_term:
        key = st.selectbox(
            "ปีการศึกษา / ภาคการศึกษา",
            terms,
            index=len(terms) - 1,
            format_func=lambda k: f"ปีการศึกษา {k[0]} / ภาค {k[1]}"
        )
    
    courses_data = _load_term_courses(*key)
    teachers_df = teacher_totals(courses_data)
    
    with col_prog:
        available_pf = sorted(teachers_df.program.dropna().unique())
        selected_pf = st.multiselect("สังกัดหลักสูตร", available_pf, default=available_pf)
        
    filtered_teachers = teachers_df[teachers_df.program.isin(selected_pf)].copy()
    
    # Semester Mini Bento Metrics
    sub_m1, sub_m2, sub_m3 = st.columns(3)
    with sub_m1:
        st.metric("อาจารย์ผู้สอนในภาคนี้", f"{len(filtered_teachers)} ท่าน")
    with sub_m2:
        mean_t = filtered_teachers.ftet.mean() if len(filtered_teachers) else 0.0
        st.metric("FTET เฉลี่ยต่อท่าน", f"{mean_t:.3f}")
    with sub_m3:
        max_t = filtered_teachers.ftet.max() if len(filtered_teachers) else 0.0
        st.metric("ภาระงานสูงสุด", f"{max_t:.3f} FTET")
        
    fig_teachers = apple_charts.fig_teacher_bars_apple(
        filtered_teachers,
        title=f"ภาระงาน FTET รายอาจารย์ ประจำภาคการศึกษา {key[0]}/{key[1]}"
    )
    st.plotly_chart(fig_teachers, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Individual Teacher Drilldown Bento Box
    if len(filtered_teachers) > 0:
        st.markdown('<div class="chart-container">', unsafe_allow_html=True)
        st.markdown('<div style="font-size: 1.15rem; font-weight: 700; color: #1D1D1F; margin-bottom: 12px;">เจาะลึกสัดส่วนภาระงานรายวิชา (Course Breakdown)</div>', unsafe_allow_html=True)
        teacher_map = filtered_teachers.set_index("teacher_id")["teacher"].to_dict()
        selected_tid = st.selectbox(
            "เลือกอาจารย์ที่ต้องการตรวจสอบ",
            filtered_teachers.teacher_id,
            format_func=lambda tid: f"{teacher_map.get(tid, tid)} (ID: {tid})"
        )
        
        col_donut, col_details = st.columns([1, 1])
        with col_donut:
            fig_donut, total_calc = apple_charts.fig_teacher_breakdown_apple(courses_data, selected_tid)
            st.plotly_chart(fig_donut, use_container_width=True)
            
        with col_details:
            t_courses = courses_data[courses_data.teacher_id == selected_tid]
            st.markdown(f"**รายการสอนทั้งหมด ({len(t_courses)} กลุ่ม/วิชา):**")
            detail_cols = ["code", "course", "sections", "lecture", "lab", "project", "ftet_calc"]
            st.dataframe(
                t_courses[detail_cols].rename(columns={
                    "code": "รหัสวิชา",
                    "course": "ชื่อวิชา",
                    "sections": "Sec",
                    "lecture": "บรรยาย",
                    "lab": "ปฏิบัติ",
                    "project": "โครงงาน",
                    "ftet_calc": "FTET คำนวณ"
                }).round(3),
                use_container_width=True
            )
        st.markdown('</div>', unsafe_allow_html=True)

# ----- TAB 3: เครื่องมือคำนวณ FTET -----
with tab3:
    st.markdown("""
    <div class="chart-container">
        <div style="font-size: 1.3rem; font-weight: 700; color: #1D1D1F; margin-bottom: 4px;">Smart Workload Simulator</div>
        <div style="color: #86868B; font-size: 0.92rem; margin-bottom: 24px;">
            จำลองและคำนวณภาระงานล่วงหน้า โดยปรับตัวแปรตามเกณฑ์มาตรฐาน เกจวัดสไตล์ Apple จะประเมินระดับภาระงานทันที
        </div>
    """, unsafe_allow_html=True)
    
    col_inputs, col_gauge = st.columns([3, 2])
    with col_inputs:
        st.markdown("**กำหนดพารามิเตอร์ของรายวิชา:**")
        c1, c2 = st.columns(2)
        with c1:
            lec = st.slider("ชั่วโมงบรรยายต่อสัปดาห์ (น้ำหนัก × 2.0)", 0.0, 15.0, 3.0, 0.5)
            lab = st.slider("ชั่วโมงปฏิบัติการต่อสัปดาห์ (น้ำหนัก × 1.5)", 0.0, 15.0, 0.0, 0.5)
            prj = st.slider("จำนวนนักศึกษาโครงงาน (ชม./สัปดาห์)", 0.0, 30.0, 0.0, 1.0)
        with c2:
            sec = st.number_input("จำนวนกลุ่มเรียน (Sections)", min_value=1, max_value=20, value=1)
            wk = st.number_input("จำนวนสัปดาห์ที่สอนในภาค", min_value=1, max_value=20, value=15)
            
        calculated_val = course_ftet(lec, lab, prj, sec, wk)
        
        st.markdown(f"""
        <div style="background: #F5F5F7; padding: 18px 20px; border-radius: 16px; margin-top: 15px;">
            <div style="color: #86868B; font-size: 0.78rem; text-transform: uppercase; font-weight: 600;">ผลการคำนวณ FTET รายวิชานี้</div>
            <div style="color: #1D1D1F; font-size: 2.2rem; font-weight: 700; margin-top: 4px;">{calculated_val:.4f} <span style="font-size: 1.1rem; color: #86868B; font-weight: 500;">FTET</span></div>
            <div style="color: #0071E3; font-size: 0.88rem; font-weight: 500; margin-top: 4px;">
                เทียบเท่า {calculated_val * 525:.1f} ชั่วโมงภาระงานต่อภาคการศึกษา (จากฐาน 525 ชม.)
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col_gauge:
        fig_speedometer = apple_charts.fig_gauge_apple(calculated_val)
        st.plotly_chart(fig_speedometer, use_container_width=True)
        
    st.markdown('</div>', unsafe_allow_html=True)

# ----- TAB 4: ทำเนียบคณาจารย์ -----
with tab4:
    st.markdown('<div class="chart-container">', unsafe_allow_html=True)
    st.markdown('<div style="font-size: 1.3rem; font-weight: 700; color: #1D1D1F; margin-bottom: 6px;">ทำเนียบคณาจารย์ วิทยาลัยการคอมพิวเตอร์</div>', unsafe_allow_html=True)
    st.markdown('<div style="color: #86868B; font-size: 0.88rem; margin-bottom: 20px;">รายชื่ออาจารย์จำแนกตามหลักสูตรสังกัด</div>', unsafe_allow_html=True)
    try:
        staff_df = pd.read_csv("data/staff.csv")
        st.dataframe(
            staff_df,
            use_container_width=True,
            column_config={
                "staff_id": st.column_config.NumberColumn("รหัส", format="%d"),
                "name": "ชื่อ-สกุล",
                "program": "หลักสูตรสังกัด"
            }
        )
    except FileNotFoundError:
        st.info("ไม่พบไฟล์ data/staff.csv")
    st.markdown('</div>', unsafe_allow_html=True)
