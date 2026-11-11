import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { TeacherDetailResponse } from '../../types';
import { ApiService } from '../../services/api';
import {
  X,
  User,
  BookOpen,
  Calendar,
  Loader2,
} from 'lucide-react';

interface TeacherDetailModalProps {
  teacherId: string | null;
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacherId,
  onClose,
}) => {
  const [data, setData] = useState<TeacherDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!teacherId) {
      setData(null);
      return;
    }

    setLoading(true);
    ApiService.getTeacherDetail(teacherId)
      .then((res) => {
        setData(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teacherId]);

  if (!teacherId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  {loading ? 'กำลังโหลดข้อมูล...' : data?.teacher.name_th || data?.teacher.name_en}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-medium border border-indigo-200">
                  {teacherId}
                </span>
              </div>
              <p className="text-xs text-slate-500">{data?.teacher.name_en}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <span className="text-xs">กำลังดึงข้อมูลประวัติภาระงาน...</span>
          </div>
        ) : data ? (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Historical FTET Trend Chart */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>แนวโน้มภาระงาน FTET ย้อนหลังรายภาคเรียน (Historical FTET)</span>
                </span>
                <span className="text-[11px] text-slate-500">เกณฑ์เป้าหมาย 0.8–1.2 FTET</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.history.map((h) => ({
                      period: `${h.academic_year}/${h.term}`,
                      ftet: h.ftet,
                      program: h.program,
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0.4, 1.6]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg">
                            <div className="font-semibold text-slate-300">ภาคเรียน: {item.period}</div>
                            <div className="text-indigo-400 font-mono font-bold mt-1">
                              FTET: {item.ftet.toFixed(3)}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine y={1.0} stroke="#10b981" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="ftet"
                      stroke="#4f46e5"
                      fill="#818cf8"
                      fillOpacity={0.2}
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Courses Teaching Load Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>รายวิชาที่สอนในภาคการศึกษาล่าสุด</span>
                </h4>
                <span className="text-xs text-slate-500">
                  รวม {data.courses.length} รายวิชา/กลุ่ม
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">รหัสวิชา</th>
                      <th className="py-2.5 px-3">ชื่อรายวิชา</th>
                      <th className="py-2.5 px-3">หน่วยกิต</th>
                      <th className="py-2.5 px-3">กลุ่ม</th>
                      <th className="py-2.5 px-3">ชั่วโมง (บ/ป/ค)</th>
                      <th className="py-2.5 px-3 text-right">FTET</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.courses.map((course, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                          {course.course_code}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{course.course_name}</div>
                          {course.co_teach && (
                            <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1 rounded border border-amber-200">
                              สอนร่วม
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{course.credits}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            Sec {course.section}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {course.lecture_hours}-{course.lab_hours}-{course.project_hours}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {course.calculated_ftet.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-3 text-right text-xs">
                        ผลรวม FTET ภาคเรียนนี้:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-700 text-sm">
                        {data.courses
                          .reduce((acc, c) => acc + c.calculated_ftet, 0)
                          .toFixed(3)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
