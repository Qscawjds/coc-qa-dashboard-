import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { TeacherLoad } from '../../types';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface WorkloadDistributionChartProps {
  teachers: TeacherLoad[];
  programCode: string;
}

export const WorkloadDistributionChart: React.FC<WorkloadDistributionChartProps> = ({
  teachers,
  programCode,
}) => {
  const { chartData, stats, healthScore } = useMemo(() => {
    if (!teachers.length) {
      return {
        chartData: [],
        stats: { balanced: 0, overload: 0, underload: 0, total: 0 },
        healthScore: 100,
      };
    }

    let balanced = 0;
    let overload = 0;
    let underload = 0;

    teachers.forEach((t) => {
      if (t.ftet > 0.6) overload++;
      else if (t.ftet >= 0.35) balanced++;
      else underload++;
    });

    const total = teachers.length;
    const balancedPct = Math.round((balanced / total) * 100);
    const overloadPct = Math.round((overload / total) * 100);
    const underloadPct = Math.round((underload / total) * 100);

    const data = [
      { name: 'ภาระงานสมดุล (0.35 - 0.60)', value: balanced, percent: balancedPct, color: '#10b981' },
      { name: 'ภาระงานสูง (> 0.60)', value: overload, percent: overloadPct, color: '#ef4444' },
      { name: 'ภาระงานต่ำ (< 0.35)', value: underload, percent: underloadPct, color: '#f59e0b' },
    ];

    // Health score: 100 max, penalized by deviations
    const score = Math.max(0, Math.min(100, Math.round(balancedPct + (100 - overloadPct * 1.5 - underloadPct * 0.8) * 0.2)));

    return {
      chartData: data,
      stats: { balanced, overload, underload, total },
      healthScore: score,
    };
  }, [teachers]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
        <div className="font-semibold text-slate-200 mb-1">{item.name}</div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">จำนวนอาจารย์:</span>
          <span className="font-bold font-mono">{item.value} ท่าน ({item.percent}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            ดัชนีความสมดุลภาระงาน (Workload Health)
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {programCode}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          การกระจายตัวของภาระงานอาจารย์ในหลักสูตรตามเกณฑ์ QA
        </p>

        {/* Health Score Pill */}
        <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-800 dark:to-indigo-950/30 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">คะแนนความสมดุลกำลังคน</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">ประเมินจากสัดส่วนอาจารย์ในเกณฑ์เป้าหมาย</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{healthScore}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500"> / 100</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="h-52 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">{stats.total}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">อาจารย์ทั้งหมด</span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="space-y-2 mt-2">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.value} ท่าน</span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">({item.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QA Insight Recommendation */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {stats.overload > 0 ? (
          <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              มีอาจารย์ {stats.overload} ท่านภาระงานเกิน 0.60 FTET แนะนำให้ตรวจสอบวิชาสอนร่วมหรือกระจายภาระงาน
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              หลักสูตรมีการจัดสรรภาระงานที่สมดุลดี ไม่มีอาจารย์ที่มีภาระงานเกินเกณฑ์วิกฤต
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
