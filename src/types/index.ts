export interface Program {
  code: string;
  name: string;
}

export interface MetaData {
  academic_years: number[];
  terms: number[];
  programs: Program[];
  coc_programs: string[];
  source_mode: 'google_sheets' | 'local_xlsx';
  cache_ttl_seconds: number;
}

export interface ProgramTrendPoint {
  program: string;
  academic_year: number;
  term: number | null;
  ftet: number;
  teacher_count: number | null;
  terms_included?: number[];
  based_on?: string[];
}

export interface ProgramTrendResponse {
  metric: string;
  unit: string;
  by: 'year' | 'term';
  from: number;
  to: number;
  coc_programs: string[];
  count: number;
  data: ProgramTrendPoint[];
}

export interface TeacherLoad {
  teacher_id: string | null;
  teacher_name: string;
  name_en: string | null;
  is_primary: boolean;
  ftet: number;
  matched: boolean;
  identity_key?: string;
}

export interface ProgramTeachersResponse {
  program: string;
  academic_year: number;
  term: number | null;
  aggregation: string;
  count: number;
  unmatched_teacher_count: number;
  data: TeacherLoad[];
}

export interface TeacherHistoryItem {
  academic_year: number;
  term: number;
  program: string;
  ftet: number;
}

export interface TeacherCourse {
  academic_year: number;
  term: number;
  program: string;
  teacher_name: string;
  course_code: string;
  course_name: string;
  credits: string;
  student_groups?: string;
  section: number;
  lecture_hours: number;
  lab_hours: number;
  project_hours: number;
  weeks: number;
  co_teach?: boolean;
  calculated_ftet: number;
  source_ftet?: number;
}

export interface TeacherDetailResponse {
  teacher: {
    teacher_id: string;
    name_th: string | null;
    name_en: string;
  };
  history: TeacherHistoryItem[];
  courses: TeacherCourse[];
}

export interface MethodologyConfig {
  hours_per_ftet: number;
  weeks_per_semester: number;
  lecture_multiplier: number;
  lab_multiplier: number;
  coc_programs: string[];
}

export interface MethodologyResponse {
  source_tab: string;
  formula: string;
  config: MethodologyConfig;
  example: {
    course: string;
    credits: string;
    section: number;
    lecture_hours: number;
    lab_hours: number;
    project_hours: number;
    weeks: number;
    calculated_ftet: number;
    teacher_name_th: string;
    academic_year: number;
    term: number;
    teacher_total_example: number;
    teacher_total_note: string;
  };
  source_notes: string[];
}

export interface DataQualityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'warning';
  message: string;
  source_tab: string;
  source_row: number;
  source_column?: string;
  academic_year: number;
  term: number;
  program: string;
  teacher_name?: string;
  teacher_name_raw?: string;
  name_en?: string;
  course_code?: string;
  source_ftet?: number;
  calculated_ftet?: number;
}

export interface DataQualityResponse {
  count: number;
  counts_by_type: Record<string, number>;
  data: DataQualityIssue[];
}
