export type UserRole = 'national' | 'provincial' | 'municipal' | 'hospital_admin' | 'infection_control' | 'pharmacy' | 'department';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  level: string;
  provinceId?: string;
  cityId?: string;
  hospitalId?: string;
  departmentId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  level: 'tertiary' | 'secondary' | 'primary';
  provinceId: string;
  cityId: string;
  address: string;
  infectionRate?: number;
  usageIntensity?: number;
}

export interface Province {
  id: string;
  name: string;
  infectionRate: number;
  hospitalCount: number;
}

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  type: string;
}

export interface InfectionCase {
  id: string;
  hospitalId: string;
  departmentId: string;
  date: string;
  infectionType: string;
  caseCount: number;
  totalPatients: number;
}

export interface DrugUsage {
  id: string;
  hospitalId: string;
  departmentId: string;
  drugCategory: string;
  date: string;
  dosage: number;
  intensity: number;
}

export interface BacteriaCulture {
  id: string;
  hospitalId: string;
  bacteriaType: string;
  antibiotic: string;
  date: string;
  totalTests: number;
  positiveCount: number;
  sensitiveCount: number;
}

export type WarningLevel = 1 | 2;
export type WarningType = 'infection' | 'usage';
export type WarningStatus = 'pending' | 'processing' | 'resolved';

export interface Warning {
  id: string;
  hospitalId: string;
  hospitalName: string;
  departmentId?: string;
  departmentName?: string;
  level: WarningLevel;
  type: WarningType;
  thresholdValue: number;
  actualValue: number;
  status: WarningStatus;
  triggeredAt: string;
  resolvedAt?: string;
  description: string;
}

export type ApprovalStep = 'department' | 'infection_control' | 'health_commission';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRecord {
  id: string;
  warningId: string;
  step: ApprovalStep;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment: string;
  createdAt: string;
}

export interface WarningDetail extends Warning {
  approvals: ApprovalRecord[];
  rectificationPlan?: string;
  historyData: { date: string; value: number }[];
}

export interface ProcurementPlan {
  id: string;
  hospitalId: string;
  hospitalName: string;
  year: number;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  itemCount: number;
  totalAmount: number;
}

export interface ProcurementItem {
  id: string;
  planId: string;
  drugName: string;
  category: string;
  plannedQuantity: number;
  actualQuantity: number;
  deviation: number;
}

export interface DeviationAnalysis {
  planId: string;
  totalItems: number;
  abnormalItems: number;
  items: ProcurementItem[];
}

export type ReportType = 'weekly' | 'monthly' | 'yearly';

export interface Report {
  id: string;
  hospitalId: string;
  hospitalName: string;
  type: ReportType;
  period: string;
  generatedAt: string;
  summary: {
    infectionRate: number;
    infectionRateYoY: number;
    infectionRateMoM: number;
    drugSusceptibilityRate: number;
    usageIntensity: number;
  };
}

export interface ReportDetail extends Report {
  content: {
    infectionTrend: { date: string; value: number }[];
    drugRanking: { name: string; value: number }[];
    departmentRanking: { name: string; infectionRate: number }[];
    suggestions: string[];
    trainingFocus: string[];
  };
}

export interface DashboardOverview {
  infectionRate: number;
  infectionRateYoY: number;
  infectionRateMoM: number;
  drugSusceptibilityRate: number;
  usageIntensity: number;
  usageIntensityYoY: number;
  warningCount: number;
  level1WarningCount: number;
  level2WarningCount: number;
}

export interface TrendData {
  date: string;
  infectionRate: number;
  usageIntensity: number;
}

export interface DrugCategory {
  name: string;
  value: number;
  percentage: number;
}

export interface HospitalRank {
  rank: number;
  id: string;
  name: string;
  level: string;
  province: string;
  value: number;
}
