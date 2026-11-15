# CoC FTET Toolkit (Python)

คำนวณและแสดงกราฟค่า **FTET** (Full Time Equivalent Teacher) ของอาจารย์ วิทยาลัยการคอมพิวเตอร์ จากไฟล์ Excel
`data/FTET_CoC.xlsx` (ปีการศึกษา 2562–2567)

FTET = ((ชม.บรรยาย×2) + (ชม.ปฏิบัติการ×1.5) + โครงงาน) × section × สัปดาห์ ÷ 525

## ติดตั้ง
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate      macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt            # พอสำหรับสร้างรายงาน + กราฟ
pip install -r requirements-app.txt        # เพิ่มถ้าจะใช้ dashboard (Streamlit)
```
ต้องใช้ Python 3.9+

## ใช้งาน
| ต้องการ | คำสั่ง |
|---|---|
| สร้างกราฟ PNG + CSV + `report.html` | `python run_report.py` (ผลลัพธ์อยู่ใน `output/`) |
| ใช้ไฟล์ Excel อื่น | `python run_report.py --xlsx ไฟล์.xlsx --out ผลลัพธ์` |
| Dashboard แบบโต้ตอบ | `streamlit run app.py` (เปิด http://localhost:8501) |
| รันชุดทดสอบ | `python -m unittest discover -s tests -v` |

## กราฟที่มี
- เส้น/แท่ง FTET เฉลี่ยรายปี แยกหลักสูตร (Comp, DE, DBiz, AISE, MsComp, CoC)
- เส้นรายภาคการศึกษา + Heatmap หลักสูตร × ภาค
- แท่ง FTET รายอาจารย์ (สีตามหลักสูตร), Boxplot การกระจายต่อหลักสูตร
- แยกรายวิชาของอาจารย์แต่ละคน

## โครงสร้าง
```
ftet/loader.py   อ่าน Excel -> DataFrame (ตารางสรุป + รายวิชารายอาจารย์)
ftet/calc.py     สูตร FTET, รวมต่ออาจารย์, ตรวจสอบกับค่าในไฟล์
ftet/charts.py   กราฟ matplotlib/seaborn
ftet/fonts.py    เลือกฟอนต์ไทยอัตโนมัติ
run_report.py    สร้างรายงาน     app.py  Streamlit dashboard
data/            FTET_CoC.xlsx, staff.csv (รายชื่ออาจารย์แต่ละหลักสูตร)
```

## ข้อมูลที่ครอบคลุม / ข้อสังเกต
- กราฟระดับหลักสูตร (ตารางสรุป) ครบ 2562–2567
- กราฟรายอาจารย์ใช้ได้เฉพาะภาคที่มีชีตรายวิชาในไฟล์: 2562/1-2, 2563/1-2, 2567/1-2 (ไม่มีชีตของ 2564–2566)
- `output/data_issues.csv` แสดงแถวที่ค่า FTET ในไฟล์ไม่ตรงกับสูตร (6 แถว ส่วนใหญ่วิชาโครงงานที่ใส่จำนวนโครงงานไม่ตรงกับค่า FTET)
- ถ้าไม่มีฟอนต์ไทยในเครื่อง กราฟจะเปลี่ยนเป็นข้อความอังกฤษอัตโนมัติ (ชื่ออาจารย์ภาษาไทยอาจแสดงเป็นกล่อง ให้ติดตั้งฟอนต์ Sarabun / Noto Sans Thai)
- เพิ่มปี/ภาคใหม่: ใส่ชีตในรูปแบบเดียวกัน แล้วเพิ่มชื่อชีตใน `COURSE_SHEETS` ที่ `ftet/loader.py`
