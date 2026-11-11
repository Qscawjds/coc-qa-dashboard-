import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { FilterBar } from './components/layout/FilterBar';
import type { DashboardTab } from './components/layout/FilterBar';
import { MetricCard } from './components/charts/MetricCard';
import { ProgramTrendChart } from './components/charts/ProgramTrendChart';
import { TeacherWorkloadChart } from './components/charts/TeacherWorkloadChart';
import { WorkloadDistributionChart } from './components/charts/WorkloadDistributionChart';
import { TeachingTypeCompositionChart } from './components/charts/TeachingTypeCompositionChart';
import { FormulaSimulator } from './components/charts/FormulaSimulator';
import { DataQualityView } from './components/charts/DataQualityView';
import { TeacherDetailModal } from './components/modals/TeacherDetailModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ApiService } from './services/api';
import type {
  Program,
  ProgramTrendPoint,
  TeacherLoad,
  DataQualityIssue,
} from './types';
import {
  GraduationCap,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<DashboardTab>('trends');
  const [yearFrom, setYearFrom] = useState<number>(2562);
  const [yearTo, setYearTo] = useState<number>(2567);
  const [byMode, setByMode] = useState<'year' | 'term'>('year');
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('Comp');

  // Metadata & Options
  const [availableYears, setAvailableYears] = useState<number[]>([2567, 2566, 2565, 2564, 2563, 2562]);
  const [programs, setPrograms] = useState<Program[]>([
    { code: 'Comp', name: 'Computer Science' },
    { code: 'DE', name: 'Digital Engineering' },
    { code: 'DBiz', name: 'Digital Business' },
    { code: 'MsComp', name: 'M.Sc. Computing' },
    { code: 'AISE', name: 'AI & Software Eng.' },
  ]);
  const [cocPrograms, setCocPrograms] = useState<string[]>(['Comp', 'DE', 'DBiz', 'MsComp']);

  // Data states
  const [trendPoints, setTrendPoints] = useState<ProgramTrendPoint[]>([]);
  const [teachers, setTeachers] = useState<TeacherLoad[]>([]);
  const [qualityIssues, setQualityIssues] = useState<DataQualityIssue[]>([]);

  // Connectivity & Modal states
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(ApiService.isDemoMode());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Load Metadata
  const loadMeta = useCallback(async () => {
    try {
      const res = await ApiService.getMeta();
      setIsLive(res.isLive);
      if (res.data.academic_years?.length) {
        setAvailableYears(res.data.academic_years);
      }
      if (res.data.programs?.length) {
        setPrograms(res.data.programs);
      }
      if (res.data.coc_programs?.length) {
        setCocPrograms(res.data.coc_programs);
      }
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  }, []);

  // Load Main Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Load Trends
      const trendsRes = await ApiService.getProgramTrends(yearFrom, yearTo, byMode);
      setTrendPoints(trendsRes.data.data || []);
      setIsLive(trendsRes.isLive);

      // 2. Load Teachers for selected program
      const teachersRes = await ApiService.getProgramTeachers(selectedProgram, yearTo, selectedTerm);
      setTeachers(teachersRes.data.data || []);

      // 3. Load Data Quality
      const qualityRes = await ApiService.getDataQuality();
      setQualityIssues(qualityRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [yearFrom, yearTo, byMode, selectedProgram, yearTo, selectedTerm]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Top KPIs
  const kpis = useMemo(() => {
    // Current CoC Average
    const latestCoCPoint = trendPoints
      .filter((p) => p.program === 'CoC' && p.academic_year === yearTo)
      .slice(-1)[0];
    const cocFtet = latestCoCPoint ? latestCoCPoint.ftet : 0.461;

    // Sparkline trend for CoC
    const cocSparkline = trendPoints
      .filter((p) => p.program === 'CoC')
      .map((p) => p.ftet);

    // Total teachers count across active program
    const totalTeachers = teachers.length;

    // Faculty Workload Health (% in 0.35 - 0.60 FTET)
    const inRangeCount = teachers.filter((t) => t.ftet >= 0.35 && t.ftet <= 0.60).length;
    const balanceRate = totalTeachers ? Math.round((inRangeCount / totalTeachers) * 100) : 85;

    return {
      cocFtet,
      cocSparkline,
      totalTeachers,
      balanceRate,
      issueCount: qualityIssues.length,
    };
  }, [trendPoints, teachers, qualityIssues, yearTo]);

  // Handle Export
  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    const url = ApiService.getExportUrl('programs', format, {
      from: yearFrom,
      to: yearTo,
      by: byMode,
    });
    window.open(url, '_blank');
  };

  const handleToggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    ApiService.setDemoMode(next);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        isLive={isLive}
        onToggleDemoMode={handleToggleDemoMode}
        onRefreshData={loadData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLoading={isLoading}
      />

      {/* Filter and Tab Navigation Bar */}
      <FilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        yearFrom={yearFrom}
        yearTo={yearTo}
        availableYears={availableYears}
        onYearFromChange={setYearFrom}
        onYearToChange={setYearTo}
        byMode={byMode}
        onByModeChange={setByMode}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
        selectedProgram={selectedProgram}
        onProgramChange={setSelectedProgram}
        programs={programs}
        onExport={handleExport}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Executive KPI Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="FTET เฉลี่ยรวม CoC"
            value={kpis.cocFtet.toFixed(3)}
            unit="FTET/ท่าน"
            subtitle={`ปีการศึกษา ${yearTo}`}
            delta={{ value: 26.3, label: 'เทียบปีก่อน', isGood: true }}
            benchmarkStatus="optimal"
            benchmarkText="ในเกณฑ์มาตรฐาน (0.35–0.55)"
            icon={GraduationCap}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-600"
            sparklineData={kpis.cocSparkline}
          />
          <MetricCard
            title="อาจารย์ในหลักสูตรที่เลือก"
            value={kpis.totalTeachers}
            unit="ท่าน"
            subtitle={`หลักสูตร ${selectedProgram}`}
            benchmarkStatus="optimal"
            benchmarkText="อาจารย์ประจำและพิเศษ"
            icon={Users}
            iconBgColor="bg-cyan-50"
            iconColor="text-cyan-600"
          />
          <MetricCard
            title="ดัชนีความสมดุลภาระงาน"
            value={`${kpis.balanceRate}%`}
            subtitle="สัดส่วนอาจารย์ในเกณฑ์เป้าหมาย"
            delta={{ value: 4.8, label: 'ความสมดุลดีขึ้น', isGood: true }}
            benchmarkStatus={kpis.balanceRate >= 75 ? 'optimal' : 'warning'}
            benchmarkText={kpis.balanceRate >= 75 ? 'สมดุลดีเยี่ยม' : 'ควรเฝ้าระวัง'}
            icon={CheckCircle}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <MetricCard
            title="การตรวจสอบคุณภาพข้อมูล"
            value={kpis.issueCount}
            unit="ประเด็น"
            subtitle="ตรวจพบใน Google Sheets"
            benchmarkStatus={kpis.issueCount <= 3 ? 'optimal' : 'warning'}
            benchmarkText={kpis.issueCount <= 3 ? 'ข้อมูลพร้อมใช้งาน' : 'ต้องการการตรวจทาน'}
            icon={AlertTriangle}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
        </section>

        {/* Dynamic Views by Active Tab */}
        {activeTab === 'trends' && (
          <section className="space-y-6">
            <ProgramTrendChart
              data={trendPoints}
              byMode={byMode}
              cocPrograms={cocPrograms}
            />

            {/* Teaching Composition Preview on trends page */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <TeachingTypeCompositionChart />
              </div>
              <div className="lg:col-span-4">
                <WorkloadDistributionChart
                  teachers={teachers}
                  programCode={selectedProgram}
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'teachers' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <TeacherWorkloadChart
                teachers={teachers}
                programCode={selectedProgram}
                academicYear={yearTo}
                term={selectedTerm}
                onSelectTeacher={(id) => setSelectedTeacherId(id)}
              />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <WorkloadDistributionChart
                teachers={teachers}
                programCode={selectedProgram}
              />
            </div>
          </section>
        )}

        {activeTab === 'composition' && (
          <section className="space-y-6">
            <TeachingTypeCompositionChart />
          </section>
        )}

        {activeTab === 'simulator' && (
          <section className="space-y-6">
            <FormulaSimulator />
          </section>
        )}

        {activeTab === 'quality' && (
          <section className="space-y-6">
            <DataQualityView issues={qualityIssues} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">CoC QA FTET Analytics</span>
            <span>•</span>
            <span>วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยสงขลานครินทร์ (PSU CoC)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI Backend + React Vite Dashboard</span>
            <span>สูตร FTET ตามเกณฑ์มาตรฐาน QA</span>
          </div>
        </div>
      </footer>

      {/* Individual Teacher Drill-Down Modal */}
      <TeacherDetailModal
        teacherId={selectedTeacherId}
        onClose={() => setSelectedTeacherId(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onRefreshData={loadData}
      />
    </div>
  );
};

export default App;
