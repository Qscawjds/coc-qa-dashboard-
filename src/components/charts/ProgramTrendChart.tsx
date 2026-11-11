import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import type { ProgramTrendPoint } from '../../types';
import { LineChart as LineIcon, BarChart2, AreaChart as AreaIcon, Info, Eye, EyeOff } from 'lucide-react';

interface ProgramTrendChartProps {
  data: ProgramTrendPoint[];
  byMode: 'year' | 'term';
  cocPrograms: string[];
}

const PROGRAM_COLORS: Record<string, string> = {
  CoC: '#4f46e5', // Indigo (Main Faculty Average)
  Comp: '#06b6d4', // Cyan
  DE: '#10b981', // Emerald
  DBiz: '#f59e0b', // Amber
  MsComp: '#8b5cf6', // Violet
  AISE: '#ec4899', // Pink (Independent)
};

export const ProgramTrendChart: React.FC<ProgramTrendChartProps> = ({
  data,
  byMode,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [hiddenPrograms, setHiddenPrograms] = useState<Set<string>>(new Set());
  const [showBenchmarkZone, setShowBenchmarkZone] = useState<boolean>(true);

  // Group data by period (e.g. "2562" or "2562/1")
  const { chartData, programsList } = useMemo(() => {
    const periodMap = new Map<string, Record<string, any>>();
    const programsSet = new Set<string>();

    data.forEach((item) => {
      const periodKey =
        byMode === 'term' && item.term !== null
          ? `${item.academic_year}/${item.term}`
          : `${item.academic_year}`;

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          academic_year: item.academic_year,
          term: item.term,
        });
      }

      const row = periodMap.get(periodKey)!;
      row[item.program] = item.ftet;
      programsSet.add(item.program);
    });

    const sortedPeriods = Array.from(periodMap.values()).sort((a, b) => {
      if (a.academic_year !== b.academic_year) {
        return a.academic_year - b.academic_year;
      }
      return (a.term || 0) - (b.term || 0);
    });

    // Make sure CoC is first, then rest
    const list = Array.from(programsSet).sort((a, b) => {
      if (a === 'CoC') return -1;
      if (b === 'CoC') return 1;
      return a.localeCompare(b);
    });

    return { chartData: sortedPeriods, programsList: list };
  }, [data, byMode]);

  const toggleProgramVisibility = (prog: string) => {
    setHiddenPrograms((prev) => {
      const next = new Set(prev);
      if (next.has(prog)) {
        next.delete(prog);
      } else {
        next.add(prog);
      }
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px]">
        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
          <span>{byMode === 'term' ? `ปีการศึกษา/ภาคเรียน: ${label}` : `ปีการศึกษา: ${label}`}</span>
          <span className="text-[10px] text-slate-400 font-normal">เป้าหมาย: 0.35–0.55</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((entry: any) => {
            const isCoC = entry.dataKey === 'CoC';
            const val = Number(entry.value);
            const status =
              val > 0.55 ? 'ภาระงานสูง' : val < 0.35 ? 'ภาระงานต่ำ' : 'ในเกณฑ์';

            return (
              <div
                key={entry.dataKey}
                className={`flex items-center justify-between gap-3 py-0.5 ${
                  isCoC ? 'font-bold text-indigo-300 border-t border-slate-800 pt-1' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.dataKey}:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{val.toFixed(3)}</span>
                  <span
                    className={`text-[10px] px-1 rounded ${
                      status === 'ในเกณฑ์'
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : status === 'ภาระงานสูง'
                        ? 'bg-rose-900/60 text-rose-300'
                        : 'bg-amber-900/60 text-amber-300'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
      {/* Header & Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              แนวโน้มค่า FTET เฉลี่ยเปรียบเทียบระหว่างหลักสูตร
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              หน่วย: FTET ต่ออาจารย์ 1 ท่าน
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            เปรียบเทียบภาระงานของแต่ละหลักสูตรกับค่าเฉลี่ยคณะ (CoC Average) และเกณฑ์มาตรฐานประกันคุณภาพ
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Target Zone Toggle */}
          <button
            onClick={() => setShowBenchmarkZone(!showBenchmarkZone)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              showBenchmarkZone
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
            title="แสดงแถบเกณฑ์เป้าหมายมาตรฐาน QA (0.35 - 0.55 FTET)"
          >
            <span>แถบเกณฑ์มาตรฐาน (0.35–0.55)</span>
          </button>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Line Chart (กราฟเส้น)"
            >
              <LineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Bar Chart (กราฟแท่งเปรียบเทียบ)"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Area Chart (กราฟพื้นที่)"
            >
              <AreaIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Program Toggle Legend Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>คลิกเพื่อซ่อน/แสดงหลักสูตร:</span>
        </span>
        {programsList.map((prog) => {
          const isHidden = hiddenPrograms.has(prog);
          const color = PROGRAM_COLORS[prog] || '#64748b';
          const isCoC = prog === 'CoC';

          return (
            <button
              key={prog}
              onClick={() => toggleProgramVisibility(prog)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border ${
                isHidden
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
                  : isCoC
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isHidden ? '#cbd5e1' : color }}
              />
              <span>{isCoC ? 'CoC (เฉลี่ยคณะ)' : prog}</span>
              {isHidden ? <EyeOff className="w-3 h-3 ml-0.5" /> : <Eye className="w-3 h-3 ml-0.5 opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Main Chart Container */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                domain={[0.2, 0.7]}
                ticks={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Standard Target Range Band (0.35 - 0.55) */}
              {showBenchmarkZone && (
                <ReferenceArea
                  y1={0.35}
                  y2={0.55}
                  fill="#10b981"
                  fillOpacity={0.06}
                  stroke="#10b981"
                  strokeOpacity={0.2}
                  strokeDasharray="4 4"
                />
              )}

              {/* Standard Benchmark Line at 0.45 */}
              <ReferenceLine
                y={0.45}
                stroke="#059669"
                strokeDasharray="4 4"
                label={{
                  value: 'เกณฑ์มาตรฐาน (0.45 FTET)',
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 11,
                }}
              />

              {programsList.map((prog) => {
                if (hiddenPrograms.has(prog)) return null;
                const isCoC = prog === 'CoC';
                const color = PROGRAM_COLORS[prog] || '#64748b';

                return (
                  <Line
                    key={prog}
                    type="monotone"
                    dataKey={prog}
                    name={isCoC ? 'CoC (เฉลี่ยคณะ)' : prog}
                    stroke={color}
                    strokeWidth={isCoC ? 3.5 : 2}
                    dot={{ r: isCoC ? 5 : 3.5, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                );
              })}
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                domain={[0, 0.7]}
                ticks={[0, 0.2, 0.35, 0.45, 0.55, 0.7]}
              />
              <Tooltip content={<CustomTooltip />} />

              {showBenchmarkZone && (
                <ReferenceArea
                  y1={0.35}
                  y2={0.55}
                  fill="#10b981"
                  fillOpacity={0.06}
                  stroke="#10b981"
                  strokeOpacity={0.2}
                  strokeDasharray="4 4"
                />
              )}
              <ReferenceLine y={0.45} stroke="#059669" strokeDasharray="4 4" />

              {programsList.map((prog) => {
                if (hiddenPrograms.has(prog)) return null;
                const color = PROGRAM_COLORS[prog] || '#64748b';

                return (
                  <Bar
                    key={prog}
                    dataKey={prog}
                    name={prog}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                  />
                );
              })}
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0.2, 0.7]} />
              <Tooltip content={<CustomTooltip />} />

              {programsList.map((prog) => {
                if (hiddenPrograms.has(prog)) return null;
                const isCoC = prog === 'CoC';
                const color = PROGRAM_COLORS[prog] || '#64748b';

                return (
                  <Area
                    key={prog}
                    type="monotone"
                    dataKey={prog}
                    name={prog}
                    stroke={color}
                    fill={color}
                    fillOpacity={isCoC ? 0.2 : 0.08}
                    strokeWidth={isCoC ? 3 : 1.5}
                  />
                );
              })}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Insight */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700" />
            <span>ช่วงเกณฑ์เหมาะสม (0.35 - 0.55 FTET)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-600 font-bold" />
            <span className="font-medium text-slate-700 dark:text-slate-300">CoC: เฉลี่ยถ่วงน้ำหนักเฉพาะหลักสูตรใน CoC (ไม่รวม AISE)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          สูตรคำนวณ: ผลรวมภาระงานของรายวิชา ÷ จำนวนอาจารย์ประจำในหลักสูตร
        </span>
      </div>
    </div>
  );
};
