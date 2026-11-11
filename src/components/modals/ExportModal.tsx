import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Layers,
  Users,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { ExportService } from '../../services/exportService';
import type { ProgramTrendPoint, TeacherLoad, DataQualityIssue } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendsData: ProgramTrendPoint[];
  teachersData: TeacherLoad[];
  qualityIssues: DataQualityIssue[];
  selectedProgram: string;
  yearFrom: number;
  yearTo: number;
  byMode: 'year' | 'term';
  selectedTerm: number | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  trendsData,
  teachersData,
  qualityIssues,
  selectedProgram,
  yearFrom,
  yearTo,
  byMode,
  selectedTerm,
}) => {
  const [reportType, setReportType] = useState<'trends' | 'teachers' | 'quality' | 'comprehensive'>('comprehensive');
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(null);

    setTimeout(() => {
      try {
        if (format === 'pdf') {
          ExportService.printReport();
          setExportSuccess('เปิดหน้าต่างสำหรับพิมพ์หรือบันทึกเป็น PDF เรียบร้อย');
        } else if (reportType === 'trends') {
          ExportService.exportProgramTrends(trendsData, yearFrom, yearTo, byMode, format);
          setExportSuccess(`ส่งออกรายงานแนวโน้ม FTET (.${format}) เรียบร้อย`);
        } else if (reportType === 'teachers') {
          ExportService.exportTeacherWorkload(teachersData, selectedProgram, yearTo, selectedTerm, format);
          setExportSuccess(`ส่งออกรายงานภาระงานอาจารย์ ${selectedProgram} (.${format}) เรียบร้อย`);
        } else if (reportType === 'quality') {
          ExportService.exportDataQuality(qualityIssues, format);
          setExportSuccess(`ส่งออกรายงานคุณภาพข้อมูล (.${format}) เรียบร้อย`);
        } else if (reportType === 'comprehensive') {
          ExportService.exportComprehensiveWorkbook(trendsData, teachersData, qualityIssues, selectedProgram, yearTo);
          setExportSuccess(`ส่งออกชุดรายงานสรุปภาพรวมครบชุด (.xlsx) เรียบร้อย`);
        }
      } catch (err) {
        console.error('Export error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">ส่งออกรายงาน (Export Reports)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">เลือกประเภทรายงานและรูปแบบไฟล์ที่ต้องการ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* 1. Report Type Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              1. เลือกประเภทรายงานที่ต้องการส่งออก
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setReportType('comprehensive')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  reportType === 'comprehensive'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">แนะนำ</span>
                </div>
                <div className="font-bold text-xs">ชุดรายงานสมบูรณ์ครบชุด</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">รวมแนวโน้ม ภาระงาน และคุณภาพข้อมูล (4 ชีต)</div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('trends')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  reportType === 'trends'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="font-bold text-xs">แนวโน้มรายหลักสูตร</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ข้อมูล FTET {yearFrom}-{yearTo} ({byMode === 'year' ? 'รายปี' : 'รายเทอม'})</div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('teachers')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  reportType === 'teachers'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="font-bold text-xs">ภาระงานอาจารย์รายบุคคล</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">หลักสูตร {selectedProgram} ({teachersData.length} ท่าน)</div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('quality')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  reportType === 'quality'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="font-bold text-xs">การตรวจสอบคุณภาพข้อมูล</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">รายการความผิดปกติในชีต ({qualityIssues.length} รายการ)</div>
              </button>
            </div>
          </div>

          {/* 2. File Format Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              2. เลือกรูปแบบไฟล์
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === 'xlsx'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>CSV (UTF-8)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === 'pdf'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Printer className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>พิมพ์ / PDF</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            สร้างและดาวน์โหลดไฟล์ทันทีผ่านเบราว์เซอร์
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'กำลังส่งออก...' : 'ดาวน์โหลดรายงาน'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
