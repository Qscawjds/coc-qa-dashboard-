import React from 'react';
import {
  Calendar,
  Layers,
  Download,
  Filter,
} from 'lucide-react';
import type { Program } from '../../types';

export type DashboardTab = 'trends' | 'teachers' | 'composition' | 'simulator' | 'quality';

interface FilterBarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  yearFrom: number;
  yearTo: number;
  availableYears: number[];
  onYearFromChange: (year: number) => void;
  onYearToChange: (year: number) => void;
  byMode: 'year' | 'term';
  onByModeChange: (mode: 'year' | 'term') => void;
  selectedTerm: number | null;
  onTermChange: (term: number | null) => void;
  selectedProgram: string;
  onProgramChange: (program: string) => void;
  programs: Program[];
  onOpenExportModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  onTabChange,
  yearFrom,
  yearTo,
  availableYears,
  onYearFromChange,
  onYearToChange,
  byMode,
  onByModeChange,
  selectedTerm,
  onTermChange,
  selectedProgram,
  onProgramChange,
  programs,
  onOpenExportModal,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none py-2 gap-2">
          <nav className="flex space-x-1" aria-label="Tabs">
            <button
              onClick={() => onTabChange('trends')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'trends'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>📈 ภาพรวมและแนวโน้ม</span>
            </button>
            <button
              onClick={() => onTabChange('teachers')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'teachers'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>👥 วิเคราะห์ภาระงานอาจารย์</span>
            </button>
            <button
              onClick={() => onTabChange('composition')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'composition'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>📊 สัดส่วนประเภทชั่วโมงสอน</span>
            </button>
            <button
              onClick={() => onTabChange('simulator')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>🧮 เครื่องมือจำลองสูตร FTET</span>
            </button>
            <button
              onClick={() => onTabChange('quality')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'quality'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>🛡️ ตรวจสอบคุณภาพข้อมูล</span>
            </button>
          </nav>

          {/* Export Button -> Triggers ExportModal */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs"
              title="ส่งออกรายงาน Excel, CSV หรือ PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออกรายงาน</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Range */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">ปีการศึกษา:</span>
              <select
                value={yearFrom}
                onChange={(e) => onYearFromChange(Number(e.target.value))}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer dark:bg-slate-800"
              >
                {availableYears.map((y) => (
                  <option key={`from-${y}`} value={y} className="dark:bg-slate-800 dark:text-slate-200">
                    {y}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">ถึง</span>
              <select
                value={yearTo}
                onChange={(e) => onYearToChange(Number(e.target.value))}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer dark:bg-slate-800"
              >
                {availableYears.map((y) => (
                  <option key={`to-${y}`} value={y} className="dark:bg-slate-800 dark:text-slate-200">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Aggregation Mode (By Year vs By Term) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onByModeChange('year')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  byMode === 'year'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ภาพรวมรายปี
              </button>
              <button
                onClick={() => onByModeChange('term')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  byMode === 'term'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                แยกรายภาคเรียน (เทอม)
              </button>
            </div>

            {/* Term Filter (when in term mode or teachers tab) */}
            {(byMode === 'term' || activeTab === 'teachers') && (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 font-medium">ภาคเรียน:</span>
                <select
                  value={selectedTerm === null ? 'all' : selectedTerm}
                  onChange={(e) => onTermChange(e.target.value === 'all' ? null : Number(e.target.value))}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer dark:bg-slate-800"
                >
                  <option value="all" className="dark:bg-slate-800 dark:text-slate-200">เฉลี่ยทั้งปี (All Semesters)</option>
                  <option value="1" className="dark:bg-slate-800 dark:text-slate-200">ภาคเรียนที่ 1 (Term 1)</option>
                  <option value="2" className="dark:bg-slate-800 dark:text-slate-200">ภาคเรียนที่ 2 (Term 2)</option>
                </select>
              </div>
            )}

            {/* Program Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">หลักสูตร:</span>
              <select
                value={selectedProgram}
                onChange={(e) => onProgramChange(e.target.value)}
                className="bg-transparent font-semibold text-indigo-700 dark:text-indigo-400 focus:outline-hidden cursor-pointer dark:bg-slate-800"
              >
                {programs.map((p) => (
                  <option key={p.code} value={p.code} className="dark:bg-slate-800 dark:text-slate-200">
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Context Summary */}
          <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span>
              แสดงข้อมูล {yearFrom} - {yearTo} • เกณฑ์เป้าหมาย 0.35 - 0.55 FTET (เฉลี่ย CoC ~0.45 FTET)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
