import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Laptop,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const FormulaSimulator: React.FC = () => {
  const [lectureHours, setLectureHours] = useState<number>(2);
  const [labHours, setLabHours] = useState<number>(2);
  const [projectHours, setProjectHours] = useState<number>(0);
  const [sections, setSections] = useState<number>(1);
  const [weeks, setWeeks] = useState<number>(15);

  const LECTURE_MULT = 2.0;
  const LAB_MULT = 1.5;
  const HOURS_PER_FTET = 525.0;

  // FTET Formula Calculation
  const totalWeeklyWeightedHours =
    lectureHours * LECTURE_MULT + labHours * LAB_MULT + projectHours;
  const totalSemesterWeightedHours = totalWeeklyWeightedHours * sections * weeks;
  const calculatedFtet = totalSemesterWeightedHours / HOURS_PER_FTET;

  // Preset Configurations
  const applyPreset = (preset: 'theory' | 'combo' | 'lab' | 'project') => {
    switch (preset) {
      case 'theory':
        setLectureHours(3);
        setLabHours(0);
        setProjectHours(0);
        setSections(1);
        setWeeks(15);
        break;
      case 'combo':
        setLectureHours(2);
        setLabHours(2);
        setProjectHours(0);
        setSections(1);
        setWeeks(15);
        break;
      case 'lab':
        setLectureHours(0);
        setLabHours(3);
        setProjectHours(0);
        setSections(1);
        setWeeks(15);
        break;
      case 'project':
        setLectureHours(0);
        setLabHours(6);
        setProjectHours(0);
        setSections(1);
        setWeeks(15);
        break;
    }
  };

  const getFtetStatus = (ftet: number) => {
    if (ftet >= 0.35) return { label: 'ภาระงานสูงต่อ 1 วิชา (> 0.35 FTET)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (ftet >= 0.15) return { label: 'ภาระงานปกติของ 1 วิชา (0.15 - 0.30 FTET)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    return { label: 'ภาระงานย่อย (< 0.15 FTET)', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  };

  const status = getFtetStatus(calculatedFtet);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg">
              เครื่องมือจำลองสูตรคำนวณภาระงาน (Interactive FTET Simulator)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              QA Standard Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ปรับแถบเลื่อนตัวแปรชั่วโมงบรรยาย ปฏิบัติการ จำนวนกลุ่ม และสัปดาห์ เพื่อจำลองผลลัพธ์ FTET ทันที
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">แม่แบบวิชา:</span>
          <button
            onClick={() => applyPreset('combo')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            3(2-2-5) ทฤษฎี+แล็บ
          </button>
          <button
            onClick={() => applyPreset('theory')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            3(3-0-6) ทฤษฎีล้วน
          </button>
          <button
            onClick={() => applyPreset('lab')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            1(0-3-2) แล็บล้วน
          </button>
          <button
            onClick={() => applyPreset('project')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            3(0-6-3) โครงงาน
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Visual Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider 1: Lecture Hours */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>ชั่วโมงบรรยาย (Lecture Hours ต่อสัปดาห์)</span>
                <span className="text-[11px] font-normal text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  ตัวคูณ × 2.0
                </span>
              </label>
              <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {lectureHours} ชม.
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={lectureHours}
              onChange={(e) => setLectureHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 ชม.</span>
              <span>ภาระงานถ่วงน้ำหนัก: {lectureHours * 2.0} ชม./สัปดาห์</span>
              <span>10 ชม.</span>
            </div>
          </div>

          {/* Slider 2: Lab Hours */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>ชั่วโมงปฏิบัติการ (Lab Hours ต่อสัปดาห์)</span>
                <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ตัวคูณ × 1.5
                </span>
              </label>
              <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {labHours} ชม.
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={labHours}
              onChange={(e) => setLabHours(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 ชม.</span>
              <span>ภาระงานถ่วงน้ำหนัก: {labHours * 1.5} ชม./สัปดาห์</span>
              <span>10 ชม.</span>
            </div>
          </div>

          {/* Slider 3: Project Hours */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>ชั่วโมงโครงงาน (Project Hours ต่อสัปดาห์)</span>
                <span className="text-[11px] font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  ตัวคูณ × 1.0
                </span>
              </label>
              <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {projectHours} ชม.
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={projectHours}
              onChange={(e) => setProjectHours(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 ชม.</span>
              <span>ภาระงานถ่วงน้ำหนัก: {projectHours * 1.0} ชม./สัปดาห์</span>
              <span>10 ชม.</span>
            </div>
          </div>

          {/* Multipliers & Sections row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>จำนวนกลุ่ม (Section)</span>
                </label>
                <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {sections} กลุ่ม
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={sections}
                onChange={(e) => setSections(Number(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Sec</span>
                <span>6 Sec</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span>จำนวนสัปดาห์ (Weeks)</span>
                </label>
                <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {weeks} สัปดาห์
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="18"
                step="1"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10 สัปดาห์</span>
                <span>18 สัปดาห์</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Mathematical Output (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> ผลลัพธ์การคำนวณ FTET
              </span>
              <span className="text-[11px] text-slate-400">ตัวหาร 525 ชม.</span>
            </div>

            {/* Giant Metric Display */}
            <div className="text-center py-4 bg-slate-800/40 rounded-xl border border-slate-800 mb-4">
              <div className="text-xs text-slate-400 mb-1">ค่า FTET ที่คำนวณได้สำหรับวิชานี้</div>
              <div className="text-5xl font-black font-mono tracking-tight text-white mb-1">
                {calculatedFtet.toFixed(4)}
              </div>
              <div className="text-xs font-medium text-indigo-300">
                คิดเป็น ~{(calculatedFtet * 100).toFixed(1)}% ของภาระงานเต็มเวลา 1 อาจารย์
              </div>
            </div>

            {/* Status Pill */}
            <div className={`p-2.5 rounded-lg border text-xs font-semibold text-center mb-5 ${status.color}`}>
              {status.label}
            </div>

            {/* Live Formula Step-by-Step Breakdown */}
            <div className="space-y-2 text-xs font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-sans font-semibold mb-1 flex items-center gap-1">
                <span>สมการคำนวณ:</span>
              </div>
              <div className="text-slate-300">
                ชั่วโมงถ่วงน้ำหนัก/สัปดาห์ = ({lectureHours} × 2.0) + ({labHours} × 1.5) + ({projectHours} × 1.0)
              </div>
              <div className="text-indigo-400 font-bold">
                = {totalWeeklyWeightedHours.toFixed(1)} ชม./สัปดาห์
              </div>
              <div className="text-slate-300 pt-1 border-t border-slate-800">
                ชั่วโมงรวมทั้งเทอม = {totalWeeklyWeightedHours.toFixed(1)} × {sections} กลุ่ม × {weeks} สัปดาห์
              </div>
              <div className="text-indigo-400 font-bold">
                = {totalSemesterWeightedHours.toFixed(1)} ชม.
              </div>
              <div className="text-slate-300 pt-1 border-t border-slate-800">
                FTET = {totalSemesterWeightedHours.toFixed(1)} ÷ 525
              </div>
              <div className="text-emerald-400 text-sm font-bold">
                = {calculatedFtet.toFixed(4)} FTET
              </div>
            </div>
          </div>

          {/* Reference Footnote */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 mt-4">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              อิงตามเกณฑ์มาตรฐาน CoC Phuket: 1 วันทำงาน 7 ชม. (สัปดาห์ละ 35 ชม.) × 15 สัปดาห์ = 525 ชม./ภาคการศึกษา (วิธีที่ 3 บรรยาย ×2.0, ปฏิบัติการ ×1.5, โครงงาน 1 ชม./สัปดาห์)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
