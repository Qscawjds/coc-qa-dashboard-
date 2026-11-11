import * as XLSX from 'xlsx';
import type { ProgramTrendPoint, TeacherLoad, DataQualityIssue } from '../types';

export class ExportService {
  /**
   * Helper to download CSV with UTF-8 BOM so Excel opens Thai characters cleanly
   */
  private static downloadCsv(content: string, filename: string) {
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper to download binary Excel (.xlsx) file
   */
  private static downloadXlsx(wb: XLSX.WorkBook, filename: string) {
    const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(wb, cleanFilename);
  }

  /**
   * Export Program Trends (CSV or XLSX)
   */
  static exportProgramTrends(
    data: ProgramTrendPoint[],
    fromYear: number,
    toYear: number,
    byMode: 'year' | 'term',
    format: 'xlsx' | 'csv'
  ) {
    const filename = `coc-ftet-trends-${fromYear}-${toYear}-${byMode}`;
    const rows = data.map((item) => ({
      หลักสูตร: item.program,
      ปีการศึกษา: item.academic_year,
      ภาคเรียน: item.term ? `เทอม ${item.term}` : 'เฉลี่ยทั้งปี',
      'ค่า FTET': Number(item.ftet.toFixed(4)),
      'จำนวนอาจารย์ (ท่าน)': item.teacher_count ?? 'เฉลี่ยคณะ',
      'ชั่วโมงถ่วงน้ำหนักโดยประมาณ (ชม./ภาค)': Number((item.ftet * 525).toFixed(1)),
    }));

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {}).join(',');
      const csvLines = rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(',')
      );
      this.downloadCsv([headers, ...csvLines].join('\n'), filename);
    } else {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Program Trends');
      this.downloadXlsx(wb, filename);
    }
  }

  /**
   * Export Teacher Workload Ranking
   */
  static exportTeacherWorkload(
    teachers: TeacherLoad[],
    programCode: string,
    year: number,
    term: number | null,
    format: 'xlsx' | 'csv'
  ) {
    const filename = `coc-teacher-workload-${programCode}-${year}${term ? `-term${term}` : '-all'}`;
    const rows = teachers.map((t, idx) => {
      const status =
        t.ftet > 0.60
          ? 'ภาระงานสูง (> 0.60)'
          : t.ftet < 0.35
          ? 'ภาระงานต่ำ (< 0.35)'
          : 'ภาระงานสมดุล (0.35 - 0.60)';
      return {
        อันดับ: idx + 1,
        รหัสอาจารย์: t.teacher_id || '-',
        'ชื่อ-สกุล': t.teacher_name,
        หลักสูตร: programCode,
        ปีการศึกษา: year,
        ภาคเรียน: term ? `เทอม ${term}` : 'เฉลี่ยทั้งปี',
        'ค่า FTET': Number(t.ftet.toFixed(4)),
        สถานะภาระงาน: status,
        'ชั่วโมงทำงานเทียบเท่า (ชม./ภาค)': Number((t.ftet * 525).toFixed(1)),
        ประเภท: t.is_primary ? 'อาจารย์ประจำหลักสูตร' : 'อาจารย์สังกัดอื่น/พิเศษ',
      };
    });

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {}).join(',');
      const csvLines = rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(',')
      );
      this.downloadCsv([headers, ...csvLines].join('\n'), filename);
    } else {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Workload ${programCode}`);
      this.downloadXlsx(wb, filename);
    }
  }

  /**
   * Export Data Quality Issues
   */
  static exportDataQuality(issues: DataQualityIssue[], format: 'xlsx' | 'csv') {
    const filename = `coc-qa-data-quality-${new Date().toISOString().split('T')[0]}`;
    const rows = issues.map((i, idx) => ({
      ลำดับ: idx + 1,
      ระดับความสำคัญ: i.severity === 'high' ? 'สูง (High)' : i.severity === 'medium' ? 'ปานกลาง (Medium)' : 'แจ้งเตือน (Low)',
      ประเภทข้อผิดพลาด: i.type,
      รายละเอียด: i.message,
      ชีตต้นทาง: i.source_tab,
      แถวในชีต: i.source_row,
      หลักสูตร: i.program,
      ปีการศึกษา: i.academic_year,
      ภาคเรียน: i.term,
      รหัสวิชา: i.course_code || '-',
      ชื่ออาจารย์: i.teacher_name || i.teacher_name_raw || '-',
    }));

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {}).join(',');
      const csvLines = rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(',')
      );
      this.downloadCsv([headers, ...csvLines].join('\n'), filename);
    } else {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Quality Issues');
      this.downloadXlsx(wb, filename);
    }
  }

  /**
   * Export Comprehensive Multi-Sheet Excel Report
   */
  static exportComprehensiveWorkbook(
    trends: ProgramTrendPoint[],
    teachers: TeacherLoad[],
    issues: DataQualityIssue[],
    programCode: string,
    year: number
  ) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Trends
    const trendRows = trends.map((item) => ({
      หลักสูตร: item.program,
      ปีการศึกษา: item.academic_year,
      ภาคเรียน: item.term ? `เทอม ${item.term}` : 'เฉลี่ยทั้งปี',
      'ค่า FTET': Number(item.ftet.toFixed(4)),
      'จำนวนอาจารย์ (ท่าน)': item.teacher_count ?? 'เฉลี่ยคณะ',
      'ชั่วโมงถ่วงน้ำหนัก (ชม.)': Number((item.ftet * 525).toFixed(1)),
    }));
    const wsTrends = XLSX.utils.json_to_sheet(trendRows);
    XLSX.utils.book_append_sheet(wb, wsTrends, 'แนวโน้มรายหลักสูตร');

    // Sheet 2: Teachers
    const teacherRows = teachers.map((t, idx) => ({
      อันดับ: idx + 1,
      'ชื่อ-สกุล': t.teacher_name,
      หลักสูตร: programCode,
      'ค่า FTET': Number(t.ftet.toFixed(4)),
      สถานะ: t.ftet > 0.60 ? 'สูง (>0.60)' : t.ftet < 0.35 ? 'ต่ำ (<0.35)' : 'สมดุล (0.35-0.60)',
      'ชั่วโมงทำงาน (ชม.)': Number((t.ftet * 525).toFixed(1)),
    }));
    const wsTeachers = XLSX.utils.json_to_sheet(teacherRows);
    XLSX.utils.book_append_sheet(wb, wsTeachers, `ภาระงานอาจารย์ ${programCode}`);

    // Sheet 3: Quality
    const qualityRows = issues.map((i, idx) => ({
      ลำดับ: idx + 1,
      ระดับ: i.severity,
      ประเภท: i.type,
      ข้อความ: i.message,
      ชีต: i.source_tab,
      แถว: i.source_row,
      รหัสวิชา: i.course_code || '-',
      อาจารย์: i.teacher_name || i.teacher_name_raw || '-',
    }));
    const wsQuality = XLSX.utils.json_to_sheet(qualityRows);
    XLSX.utils.book_append_sheet(wb, wsQuality, 'คุณภาพข้อมูล');

    // Sheet 4: Methodology Notes
    const methodRows = [
      { หัวข้อ: 'นิยาม FTET', รายละเอียด: '1 FTET เท่ากับชั่วโมงการสอน 525 ชั่วโมงต่อภาคการศึกษา (สัปดาห์ละ 35 ชม. x 15 สัปดาห์)' },
      { หัวข้อ: 'วิธีที่ 3 ปรับปรุง', รายละเอียด: 'บรรยาย x2.0, ปฏิบัติการ x1.5, โครงงาน 1 ชม./สัปดาห์, สัมมนา x1.5' },
      { หัวข้อ: 'ช่วงเกณฑ์เป้าหมาย QA', รายละเอียด: '0.35 - 0.55 FTET ต่อภาคการศึกษา (ค่าเฉลี่ยคณะ ~0.45 FTET)' },
      { หัวข้อ: 'วิชาเรียนร่วม', รายละเอียด: 'กำหนด FTET เป็น 0 ในแถวซ้ำเพื่อไม่ให้นับซ้ำซ้อน' },
    ];
    const wsMethod = XLSX.utils.json_to_sheet(methodRows);
    XLSX.utils.book_append_sheet(wb, wsMethod, 'เกณฑ์และสูตรคำนวณ');

    this.downloadXlsx(wb, `coc-qa-comprehensive-report-${year}`);
  }

  /**
   * Trigger print window for PDF export
   */
  static printReport() {
    window.print();
  }
}
