import {
  generateHospitals,
  generateProvinces,
  generateDepartments,
  generateWarnings,
  generateApprovalRecords,
  generateProcurementPlans,
  generateReports,
  generateTrendData,
  generateDrugCategories,
  generateHospitalRanking,
  getDashboardOverview,
  users,
} from './mockData.js';
import type {
  User, Hospital, Province, Department, Warning, WarningDetail,
  ApprovalRecord, ProcurementPlan, ProcurementItem, Report, ReportDetail,
  DashboardOverview, TrendData, DrugCategory, HospitalRank, WarningLevel, WarningType, WarningStatus, ReportType,
} from '../../../shared/types.js';

class DataStore {
  private users: User[] = users;
  private hospitals: Hospital[] = [];
  private provinces: Province[] = [];
  private departments: Department[] = [];
  private warnings: Warning[] = [];
  private approvals: ApprovalRecord[] = [];
  private procurementPlans: ProcurementPlan[] = [];
  private procurementItems: ProcurementItem[] = [];
  private reports: Report[] = [];
  private reportDetails: ReportDetail[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    this.hospitals = generateHospitals();
    this.provinces = generateProvinces(this.hospitals);
    this.departments = generateDepartments(this.hospitals);
    this.warnings = generateWarnings(this.hospitals, this.departments);
    this.approvals = generateApprovalRecords(this.warnings);
    const { plans, items } = generateProcurementPlans(this.hospitals);
    this.procurementPlans = plans;
    this.procurementItems = items;
    const { reports, details } = generateReports(this.hospitals);
    this.reports = reports;
    this.reportDetails = details;
  }

  findUser(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getDashboardOverview(): DashboardOverview {
    return getDashboardOverview(this.hospitals, this.warnings);
  }

  getProvinces(): Province[] {
    return this.provinces;
  }

  getHospitals(provinceId?: string): Hospital[] {
    if (provinceId) {
      return this.hospitals.filter(h => h.provinceId === provinceId);
    }
    return this.hospitals;
  }

  getHospitalRanking(type: 'infection' | 'usage', page: number, size: number): { list: HospitalRank[]; total: number } {
    const all = generateHospitalRanking(this.hospitals, type);
    const start = (page - 1) * size;
    const list = all.slice(start, start + size);
    return { list, total: all.length };
  }

  getTrendData(days: number, provinceId?: string): TrendData[] {
    return generateTrendData(days);
  }

  getDrugCategories(): DrugCategory[] {
    return generateDrugCategories();
  }

  getWarnings(
    level?: WarningLevel,
    status?: WarningStatus,
    page: number = 1,
    size: number = 10,
  ): { list: Warning[]; total: number } {
    let filtered = [...this.warnings];

    if (level) {
      filtered = filtered.filter(w => w.level === level);
    }
    if (status) {
      filtered = filtered.filter(w => w.status === status);
    }

    filtered.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());

    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);
    return { list, total: filtered.length };
  }

  getWarningDetail(id: string): WarningDetail | null {
    const warning = this.warnings.find(w => w.id === id);
    if (!warning) return null;

    const approvals = this.approvals.filter(a => a.warningId === id);
    const historyData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return {
        date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        value: parseFloat((warning.thresholdValue * (0.8 + Math.random() * 0.5)).toFixed(2)),
      };
    });

    return {
      ...warning,
      approvals,
      rectificationPlan: warning.status !== 'pending'
        ? '1. 加强手卫生管理，提高手卫生依从性；\n2. 优化抗菌药物使用方案，实施分级管理；\n3. 加强环境清洁消毒，增加消毒频次；\n4. 开展全员院感知识培训；\n5. 建立每日监测机制，及时发现异常情况。'
        : undefined,
      historyData,
    };
  }

  submitRectification(warningId: string, plan: string): boolean {
    const warning = this.warnings.find(w => w.id === warningId);
    if (!warning) return false;

    warning.status = 'processing';

    const existingApproval = this.approvals.find(
      a => a.warningId === warningId && a.step === 'department',
    );

    if (existingApproval) {
      existingApproval.status = 'approved';
      existingApproval.comment = plan;
    } else {
      this.approvals.push({
        id: `a${Date.now()}`,
        warningId,
        step: 'department',
        approverId: 'u0006',
        approverName: '科室主任',
        status: 'approved',
        comment: plan,
        createdAt: new Date().toISOString(),
      });

      this.approvals.push({
        id: `a${Date.now() + 1}`,
        warningId,
        step: 'infection_control',
        approverId: '',
        approverName: '',
        status: 'pending',
        comment: '',
        createdAt: new Date().toISOString(),
      });
    }

    return true;
  }

  reviewWarning(warningId: string, approved: boolean, comment: string): boolean {
    const warning = this.warnings.find(w => w.id === warningId);
    if (!warning) return false;

    const approval = this.approvals.find(
      a => a.warningId === warningId && a.step === 'infection_control',
    );

    if (approval) {
      approval.status = approved ? 'approved' : 'rejected';
      approval.comment = comment;
      approval.approverId = 'u0004';
      approval.approverName = '院感科主任';

      if (approved && warning.level === 2) {
        this.approvals.push({
          id: `a${Date.now()}`,
          warningId,
          step: 'health_commission',
          approverId: '',
          approverName: '',
          status: 'pending',
          comment: '',
          createdAt: new Date().toISOString(),
        });
      }
    }

    return true;
  }

  approveWarning(warningId: string, approved: boolean, comment: string): boolean {
    const warning = this.warnings.find(w => w.id === warningId);
    if (!warning) return false;

    const approval = this.approvals.find(
      a => a.warningId === warningId && a.step === 'health_commission',
    );

    if (approval) {
      approval.status = approved ? 'approved' : 'rejected';
      approval.comment = comment;
      approval.approverId = 'u0002';
      approval.approverName = '卫健委';

      if (approved) {
        warning.status = 'resolved';
        warning.resolvedAt = new Date().toISOString();
      }
    }

    return true;
  }

  getProcurementPlans(year?: number, page: number = 1, size: number = 10): { list: ProcurementPlan[]; total: number } {
    let filtered = [...this.procurementPlans];

    if (year) {
      filtered = filtered.filter(p => p.year === year);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);
    return { list, total: filtered.length };
  }

  getProcurementItems(planId: string): ProcurementItem[] {
    return this.procurementItems.filter(item => item.planId === planId);
  }

  getDeviationAnalysis(planId: string) {
    const items = this.procurementItems.filter(item => item.planId === planId);
    const abnormalItems = items.filter(item => Math.abs(item.deviation) > 15);

    return {
      planId,
      totalItems: items.length,
      abnormalItems: abnormalItems.length,
      items: abnormalItems,
    };
  }

  getReports(type?: ReportType, page: number = 1, size: number = 10): { list: Report[]; total: number } {
    let filtered = [...this.reports];

    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }

    filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);
    return { list, total: filtered.length };
  }

  getReportDetail(id: string): ReportDetail | null {
    return this.reportDetails.find(r => r.id === id) || null;
  }

  getDepartments(hospitalId?: string): Department[] {
    if (hospitalId) {
      return this.departments.filter(d => d.hospitalId === hospitalId);
    }
    return this.departments;
  }
}

export const dataStore = new DataStore();
