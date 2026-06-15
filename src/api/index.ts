import { api } from './request';
import type {
  User,
  Hospital,
  DashboardOverview,
  Province,
  HospitalRank,
  TrendData,
  DrugCategory,
  Warning,
  WarningDetail,
  ProcurementPlan,
  ProcurementItem,
  DeviationAnalysis,
  Report,
  ReportDetail,
  WarningLevel,
  WarningStatus,
  ReportType,
} from '@shared/types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { username, password }),

  getMe: () =>
    api.get<{ user: User }>('/auth/me'),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),
};

export const dashboardApi = {
  getOverview: () =>
    api.get<DashboardOverview>('/dashboard/overview'),

  getProvinces: () =>
    api.get<Province[]>('/dashboard/provinces'),

  getHospitals: (provinceId?: string) =>
    api.get<Hospital[]>('/dashboard/hospitals', { provinceId }),

  getRanking: (type: 'infection' | 'usage', page = 1, size = 10) =>
    api.get<{ list: HospitalRank[]; total: number }>('/dashboard/ranking', { type, page, size }),

  getTrend: (days = 7, provinceId?: string, hospitalId?: string) =>
    api.get<TrendData[]>('/dashboard/trend', { days, provinceId, hospitalId }),

  getDrugCategories: (provinceId?: string, hospitalId?: string) =>
    api.get<DrugCategory[]>('/dashboard/drug-categories', { provinceId, hospitalId }),
};

export const warningsApi = {
  getList: (params?: { level?: WarningLevel; status?: WarningStatus; page?: number; size?: number }) =>
    api.get<{ list: Warning[]; total: number }>('/warnings', params),

  getDetail: (id: string) =>
    api.get<WarningDetail>(`/warnings/${id}`),

  submitRectification: (id: string, plan: string) =>
    api.post<{ message: string }>(`/warnings/${id}/rectification`, { plan }),

  review: (id: string, approved: boolean, comment: string) =>
    api.post<{ message: string }>(`/warnings/${id}/review`, { approved, comment }),

  approve: (id: string, approved: boolean, comment: string) =>
    api.post<{ message: string }>(`/warnings/${id}/approve`, { approved, comment }),
};

export const procurementApi = {
  getList: (params?: { year?: number; page?: number; size?: number }) =>
    api.get<{ list: ProcurementPlan[]; total: number }>('/procurement', params),

  getItems: (planId: string) =>
    api.get<ProcurementItem[]>(`/procurement/${planId}/items`),

  getDeviation: (planId: string) =>
    api.get<DeviationAnalysis>(`/procurement/deviation/${planId}`),

  uploadPlan: (data: { hospitalId: string; hospitalName: string; year: number; items: { drugName: string; category: string; plannedQuantity: number }[] }) =>
    api.post<{ plan: ProcurementPlan; analysis: DeviationAnalysis }>('/procurement/upload', data),
};

export const reportsApi = {
  getList: (params?: { type?: ReportType; page?: number; size?: number }) =>
    api.get<{ list: Report[]; total: number }>('/reports', params),

  getDetail: (id: string) =>
    api.get<ReportDetail>(`/reports/${id}`),

  generate: (type: string, period: string) =>
    api.post<{ reportId: string }>('/reports/generate', { type, period }),
};
