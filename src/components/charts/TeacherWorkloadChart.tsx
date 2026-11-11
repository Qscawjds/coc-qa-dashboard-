import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { TeacherLoad } from '../../types';
import { Search, UserCheck, AlertTriangle, ArrowUpDown, ExternalLink } from 'lucide-react';

interface TeacherWorkloadChartProps {
  teachers: TeacherLoad[];
  programCode: string;
  academicYear: number;
  term: number | null;
  onSelectTeacher: (teacherId: string) => void;
}

export const TeacherWorkloadChart: React.FC<TeacherWorkloadChartProps> = ({
  teachers,
  programCode,
  academicYear,
  term,
  onSelectTeacher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredTeachers = useMemo(() => {
    return teachers
      .filter((t) => {
        if (primaryOnly && !t.is_primary) return false;
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTh = t.teacher_name?.toLowerCase().includes(query);
          const matchEn = t.name_en?.toLowerCase().includes(query);
          if (!matchTh && !matchEn) return false;
        }
        return true;
      })
      .sort((a, b) => (sortOrder === 'desc' ? b.ftet - a.ftet : a.ftet - b.ftet));
  }, [teachers, primaryOnly, searchTerm, sortOrder]);

  const stats = useMemo(() => {
    if (!teachers.length) return { avg: 0, max: 0, min: 0, overloadCount: 0, balancedCount: 0, underloadCount: 0 };
    const values = teachers.map((t) => t.ftet);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / teachers.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    const overloadCount = teachers.filter((t) => t.ftet > 0.6).length;
    const balancedCount = teachers.filter((t) => t.ftet >= 0.35 && t.ftet <= 0.6).length;
    const underloadCount = teachers.filter((t) => t.ftet < 0.35).length;

    return { avg, max, min, overloadCount, balancedCount, underloadCount };
  }, [teachers]);

  const getColor = (ftet: number) => {
    if (ftet > 0.6) return '#ef4444'; // Red (Overload)
    if (ftet >= 0.35) return '#10b981'; // Emerald (Balanced Target)
    return '#f59e0b'; // Amber (Underload)
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const teacher: TeacherLoad = payload[0].payload;
    const val = teacher.ftet;
    const statusText =
      val > 0.6 ? 'ภาระงานสูงกว่าเกณฑ์ (> 0.60)' : val < 0.35 ? 'ภาระงานต่ำกว่าเกณฑ์ (< 0.35)' : 'ภาระงานสมดุล (0.35 - 0.60)';
    const statusColor =
      val > 0.6 ? 'text-rose-400 bg-rose-950/60' : val < 0.35 ? 'text-amber-400 bg-amber-950/60' : 'text-emerald-400 bg-emerald-950/60';

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs">
        <div className="font-semibold text-slate-100 mb-1">{teacher.teacher_name}</div>
        {teacher.name_en && <div className="text-[11px] text-slate-400 mb-2">{teacher.name_en}</div>}

        <div className="flex items-center justify-between border-t border-slate-800 pt-2 mb-2">
          <span className="text-slate-400">ค่า FTET:</span>
          <span className="text-base font-bold font-mono text-white">{val.toFixed(3)}</span>
        </div>

        <div className={`px-2 py-1 rounded text-[11px] font-medium text-center ${statusColor}`}>
          {statusText}
        </div>

        <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ExternalLink className="w-3 h-3" />
          <span>คลิกที่แท่งเพื่อดูรายวิชาที่สอน</span>
        </div>
      </div>
    );
  };

  const chartHeight = Math.max(380, filteredTeachers.length * 36);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              การจัดอันดับภาระงานอาจารย์ (Faculty Workload Ranking)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              หลักสูตร {programCode} • {academicYear} {term ? `(เทอม ${term})` : '(เฉลี่ยทั้งปี)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            แสดงภาระงาน FTET รายบุคคล พร้อมจำแนกกลุ่มสมดุล ภาระงานสูง และภาระงานต่ำ
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่ออาจารย์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 w-40 sm:w-48 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Primary Faculty Filter */}
          <button
            onClick={() => setPrimaryOnly(!primaryOnly)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              primaryOnly
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>เฉพาะอาจารย์ประจำหลักสูตร</span>
          </button>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            title="สลับการเรียงลำดับ"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Program Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">FTET เฉลี่ยหลักสูตร</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{stats.avg.toFixed(3)}</div>
        </div>
        <div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">ภาระงานสมดุล (0.35–0.60)</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.balancedCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ท่าน</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">ภาระงานสูง (&gt; 0.60)</span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
            {stats.overloadCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ท่าน</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">ภาระงานต่ำ (&lt; 0.35)</span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
            {stats.underloadCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ท่าน</span>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>ภาระงานสมดุล (0.35 - 0.60 FTET)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>ภาระงานสูง (&gt; 0.60 FTET)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>ภาระงานต่ำ (&lt; 0.35 FTET)</span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto hidden sm:inline">
          💡 คลิกที่แท่งกราฟของอาจารย์เพื่อดูรายละเอียดรายวิชา
        </span>
      </div>

      {/* Horizontal Bar Chart Container */}
      <div style={{ height: `${chartHeight}px` }} className="w-full overflow-y-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredTeachers}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 1.0]}
              ticks={[0, 0.2, 0.35, 0.45, 0.6, 0.8, 1.0]}
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="teacher_name"
              width={180}
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              tickFormatter={(name) => (name.length > 25 ? `${name.substring(0, 24)}...` : name)}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Target Guidelines */}
            <ReferenceLine
              x={0.35}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: '0.35 (ต่ำสุด)', position: 'insideTopLeft', fill: '#10b981', fontSize: 10 }}
            />
            <ReferenceLine
              x={0.6}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: '0.60 (สูงสุด)', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10 }}
            />
            <ReferenceLine
              x={0.45}
              stroke="#64748b"
              strokeDasharray="2 2"
            />

            <Bar
              dataKey="ftet"
              radius={[0, 6, 6, 0]}
              cursor="pointer"
              onClick={(data: any) => {
                if (data && data.teacher_id) {
                  onSelectTeacher(data.teacher_id);
                }
              }}
            >
              {filteredTeachers.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.ftet)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Notice */}
      {teachers.some((t) => !t.matched) && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            พบอาจารย์/ผู้สอนที่ยังไม่สามารถจับคู่กับ Roster ประจำคณะ ({teachers.filter((t) => !t.matched).length} ท่าน) ข้อมูลจะแสดงเป็นอาจารย์พิเศษ
          </span>
        </div>
      )}
    </div>
  );
};
