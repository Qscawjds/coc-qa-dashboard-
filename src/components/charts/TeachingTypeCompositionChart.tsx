import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BookOpen, Laptop, Briefcase } from 'lucide-react';

export const TeachingTypeCompositionChart: React.FC = () => {
  // Realistic comparative teaching load composition by program
  const compositionData = [
    { program: 'Comp', lecture: 42, lab: 48, project: 10, totalHours: 1240 },
    { program: 'DE', lecture: 35, lab: 55, project: 10, totalHours: 1180 },
    { program: 'DBiz', lecture: 58, lab: 32, project: 10, totalHours: 890 },
    { program: 'MsComp', lecture: 45, lab: 25, project: 30, totalHours: 420 },
    { program: 'AISE', lecture: 38, lab: 52, project: 10, totalHours: 760 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px]">
        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-2">
          หลักสูตร: {label} (ชั่วโมงรวม ~{item.totalHours.toLocaleString()} ชม.)
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-indigo-300">
            <span>บรรยาย (Lecture ×2.0):</span>
            <span className="font-mono font-bold">{item.lecture}%</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300">
            <span>ปฏิบัติการ (Lab ×1.5):</span>
            <span className="font-mono font-bold">{item.lab}%</span>
          </div>
          <div className="flex items-center justify-between text-amber-300">
            <span>โครงงาน (Project ×1.0):</span>
            <span className="font-mono font-bold">{item.project}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            สัดส่วนโครงสร้างภาระงานสอนตามประเภทรายวิชา (Teaching Type Composition)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            เปรียบเทียบสัดส่วนชั่วโมงบรรยาย (น้ำหนัก 2x), ปฏิบัติการ (น้ำหนัก 1.5x) และโครงงาน
          </p>
        </div>

        {/* Multiplier Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> บรรยาย × 2.0
          </span>
          <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5" /> ปฏิบัติการ × 1.5
          </span>
          <span className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> โครงงาน × 1.0
          </span>
        </div>
      </div>

      {/* Stacked 100% Bar Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={compositionData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="program" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              unit="%"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {value === 'lecture'
                    ? 'ชั่วโมงบรรยาย (Lecture ×2)'
                    : value === 'lab'
                    ? 'ชั่วโมงปฏิบัติการ (Lab ×1.5)'
                    : 'โครงงาน/ค้นคว้าอิสระ (Project)'}
                </span>
              )}
            />
            <Bar dataKey="lecture" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="lab" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="project" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">วิทยาการคอมฯ &amp; วิศวกรรมดิจิทัล (Comp / DE)</div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px]">
            มีสัดส่วนชั่วโมง Lab สูงกว่า 48–55% เนื่องจากเป็นสายปฏิบัติการและ Coding ทำให้ได้รับตัวคูณ 1.5x อย่างมีนัยสำคัญ
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">ธุรกิจดิจิทัล (DBiz)</div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px]">
            เน้นชั่วโมงบรรยายและกรณีศึกษา (58% Lecture) ทำให้ได้ตัวคูณ 2.0x สำหรับการเตรียมการสอนเชิงทฤษฎีและการประยุกต์
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">ระดับบัณฑิตศึกษา (MsComp)</div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px]">
            มีสัดส่วนชั่วโมง Project / วิทยานิพนธ์และการค้นคว้าอิสระสูงถึง 30% ซึ่งสะท้อนบริบทของการวิจัยขั้นสูง
          </p>
        </div>
      </div>
    </div>
  );
};
