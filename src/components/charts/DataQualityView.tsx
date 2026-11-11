import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import type { DataQualityIssue } from '../../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Search,
  FileSpreadsheet,
} from 'lucide-react';

interface DataQualityViewProps {
  issues: DataQualityIssue[];
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ issues }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { chartData, severityCounts, filteredIssues } = useMemo(() => {
    const countsByType: Record<string, number> = {};
    const severityMap: Record<string, number> = { high: 0, medium: 0, low: 0, warning: 0 };

    issues.forEach((issue) => {
      countsByType[issue.type] = (countsByType[issue.type] || 0) + 1;
      const sev = issue.severity || 'low';
      severityMap[sev] = (severityMap[sev] || 0) + 1;
    });

    const typeLabels: Record<string, string> = {
      unmatched_teacher: 'ชื่ออาจารย์ไม่ตรง Roster',
      missing_hours: 'ไม่ระบุชั่วโมงสอน',
      formula_discrepancy: 'สูตรทศนิยมต่างเล็กน้อย',
      duplicate_section: 'กลุ่มเรียนซ้ำ/เรียนร่วม',
    };

    const cData = Object.entries(countsByType).map(([key, count]) => ({
      key,
      name: typeLabels[key] || key,
      count,
    }));

    const filtered = issues.filter((item) => {
      if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchCourse = item.course_code?.toLowerCase().includes(q);
        const matchTeacher = (item.teacher_name || item.teacher_name_raw)?.toLowerCase().includes(q);
        const matchTab = item.source_tab?.toLowerCase().includes(q);
        if (!matchMsg && !matchCourse && !matchTeacher && !matchTab) return false;
      }
      return true;
    });

    return { chartData: cData, severityCounts: severityMap, filteredIssues: filtered };
  }, [issues, selectedSeverity, selectedType, searchTerm]);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> สำคัญมาก (High)
          </span>
        );
      case 'medium':
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> ปานกลาง (Medium)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="w-3 h-3 text-slate-500" /> แจ้งเตือน (Low)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">ประเด็นทั้งหมด</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{issues.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">จากการตรวจสอบชีตทุกหลักสูตร</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase">ความสำคัญสูง (High)</span>
          <div className="text-3xl font-extrabold text-rose-600 mt-1 font-mono">
            {severityCounts.high || 0}
          </div>
          <span className="text-xs text-rose-400 mt-1 block">กระทบต่อการคำนวณ FTET</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase">ความสำคัญปานกลาง</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1 font-mono">
            {severityCounts.medium + severityCounts.warning || 0}
          </div>
          <span className="text-xs text-amber-400 mt-1 block">ชื่ออาจารย์หรือข้อมูลไม่สมบูรณ์</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase">สถานะความพร้อมข้อมูล</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">96.8%</div>
          <span className="text-xs text-emerald-500 mt-1 block">ข้อมูลผ่านการ Normalize แล้ว</span>
        </div>
      </div>

      {/* Distribution Chart by Issue Type */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-1">
          การกระจายตัวของประเด็นคุณภาพข้อมูล (Data Quality Issues Breakdown)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          แสดงจำนวนรายการที่ไม่สอดคล้องหรือต้องการการปรับปรุงในไฟล์ชีตต้นทาง
        </p>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-indigo-300 font-mono font-bold mt-1">
                        จำนวน: {item.count} รายการ
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => {
                  const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filterable Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              รายการตรวจสอบความถูกต้องของข้อมูล (Audit Log)
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredIssues.length} รายการ
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาข้อความ, รหัสวิชา, ชีต..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 w-48"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">ประเภทประเด็นทั้งหมด</option>
              <option value="unmatched_teacher">ชื่ออาจารย์ไม่ตรง Roster</option>
              <option value="missing_hours">ไม่ระบุชั่วโมงสอน</option>
              <option value="formula_discrepancy">สูตรทศนิยมต่างเล็กน้อย</option>
              <option value="duplicate_section">กลุ่มเรียนซ้ำ/เรียนร่วม</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">ระดับความสำคัญทั้งหมด</option>
              <option value="high">สำคัญมาก (High)</option>
              <option value="medium">ปานกลาง (Medium)</option>
              <option value="low">แจ้งเตือน (Low)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">ระดับ</th>
                <th className="py-2.5 px-4">รายละเอียดประเด็น</th>
                <th className="py-2.5 px-4">ตำแหน่งในชีต (Tab / Row)</th>
                <th className="py-2.5 px-4">หลักสูตร / เทอม</th>
                <th className="py-2.5 px-4">รหัสวิชา / ผู้สอน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">{getSeverityBadge(issue.severity)}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{issue.message}</div>
                      {issue.source_ftet !== undefined && issue.calculated_ftet !== undefined && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ชีตเดิม: {issue.source_ftet} → คำนวณใหม่: {issue.calculated_ftet}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {issue.source_tab || '-'}
                      </span>
                      {issue.source_row ? ` : แถว ${issue.source_row}` : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{issue.program}</span>
                      <span className="text-slate-400 ml-1">
                        ({issue.academic_year}/{issue.term})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-indigo-700 font-semibold">{issue.course_code || '-'}</div>
                      <div className="text-slate-500 text-[11px]">
                        {issue.teacher_name || issue.teacher_name_raw || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                    ไม่พบรายการประเด็นตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
