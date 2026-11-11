import type {
  MetaData,
  ProgramTrendResponse,
  ProgramTeachersResponse,
  TeacherDetailResponse,
  MethodologyResponse,
  DataQualityResponse,
} from '../types';
import {
  mockMeta,
  getMockTrends,
  getMockTeachers,
  getMockTeacherDetail,
  mockMethodology,
  mockDataQuality,
} from './mockData';

const BASE_URL = '/api';

export class ApiService {
  private static token: string = localStorage.getItem('coc_qa_token') || 'qa-demo-token';
  private static forceDemo: boolean = localStorage.getItem('coc_qa_demo_mode') === 'true';

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem('coc_qa_token', token);
  }

  static getToken(): string {
    return this.token;
  }

  static setDemoMode(enabled: boolean) {
    this.forceDemo = enabled;
    localStorage.setItem('coc_qa_demo_mode', String(enabled));
  }

  static isDemoMode(): boolean {
    return this.forceDemo;
  }

  private static async request<T>(endpoint: string, fallbackData: () => T): Promise<{ data: T; isLive: boolean }> {
    if (this.forceDemo) {
      return { data: fallbackData(), isLive: false };
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        console.warn(`API returned ${response.status} for ${endpoint}. Falling back to mock data.`);
        return { data: fallbackData(), isLive: false };
      }

      const json = await response.json();
      return { data: json as T, isLive: true };
    } catch (err) {
      console.warn(`API connection error on ${endpoint}:`, err);
      return { data: fallbackData(), isLive: false };
    }
  }

  static async getMeta(): Promise<{ data: MetaData; isLive: boolean }> {
    return this.request<MetaData>('/meta', () => mockMeta);
  }

  static async getProgramTrends(
    yearFrom: number = 2562,
    yearTo: number = 2567,
    by: 'year' | 'term' = 'year'
  ): Promise<{ data: ProgramTrendResponse; isLive: boolean }> {
    return this.request<ProgramTrendResponse>(
      `/ftet/programs?from=${yearFrom}&to=${yearTo}&by=${by}`,
      () => getMockTrends(yearFrom, yearTo, by)
    );
  }

  static async getProgramTeachers(
    code: string,
    year: number,
    term: number | null = null
  ): Promise<{ data: ProgramTeachersResponse; isLive: boolean }> {
    const termQuery = term !== null ? `&term=${term}` : '';
    return this.request<ProgramTeachersResponse>(
      `/ftet/programs/${code}/teachers?year=${year}${termQuery}`,
      () => getMockTeachers(code, year, term)
    );
  }

  static async getTeacherDetail(teacherId: string): Promise<{ data: TeacherDetailResponse; isLive: boolean }> {
    return this.request<TeacherDetailResponse>(
      `/ftet/teachers/${teacherId}`,
      () => getMockTeacherDetail(teacherId)
    );
  }

  static async getMethodology(): Promise<{ data: MethodologyResponse; isLive: boolean }> {
    return this.request<MethodologyResponse>('/ftet/method', () => mockMethodology);
  }

  static async getDataQuality(): Promise<{ data: DataQualityResponse; isLive: boolean }> {
    return this.request<DataQualityResponse>('/data-quality', () => mockDataQuality);
  }

  static getExportUrl(
    type: 'programs' | 'teachers' | 'data-quality',
    format: 'xlsx' | 'csv' | 'pdf',
    extraParams?: Record<string, any>
  ): string {
    const searchParams = new URLSearchParams({ format, ...extraParams });
    return `${BASE_URL}/exports/ftet/${type}?${searchParams.toString()}`;
  }
}
