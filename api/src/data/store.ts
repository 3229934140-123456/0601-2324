import {
  generateHospitals,
  generateProvinces,
  generateDepartments,
  generateWarnings,
  generateApprovalRecords,
  generateProcurementPlans,
  generateReports,
  generateTrendDataByHospital,
  generateDrugCategoriesByHospital,
  generateHospitalRanking,
  getDashboardOverview,
  users,
  calculateLevelAverages,
  getProvinceName,
  drugCategoriesList,
} from './mockData.js';
import type {
  User, Hospital, Province, Department, Warning, WarningDetail,
  ApprovalRecord, ProcurementPlan, ProcurementItem, Report, ReportDetail,
  DashboardOverview, TrendData, DrugCategory, HospitalRank, WarningLevel, WarningType, WarningStatus, ReportType,
} from '../../../shared/types.js';
import type { HospitalWithData } from './mockData.js';

class DataStore {
  private users: User[] = users;
  private hospitals: HospitalWithData[] = [];
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

  private filterHospitalsByUser(user: User | undefined): HospitalWithData[] {
    if (!user) return [];

    switch (user.role) {
      case 'national':
      case 'admin':
        return this.hospitals;
      case 'provincial':
        if (user.provinceId) {
          return this.hospitals.filter(h => h.provinceId === user.provinceId);
        }
        return [];
      case 'hospital_admin':
      case 'infection_control':
      case 'pharmacy':
        if (user.hospitalId) {
          return this.hospitals.filter(h => h.id === user.hospitalId);
        }
        return [];
      case 'department':
        if (user.hospitalId) {
          return this.hospitals.filter(h => h.id === user.hospitalId);
        }
        return [];
      default:
        return [];
    }
  }

  private filterWarningsByUser(warnings: Warning[], user: User | undefined): Warning[] {
    if (!user) return [];

    const userHospitals = this.filterHospitalsByUser(user);
    const hospitalIds = userHospitals.map(h => h.id);

    return warnings.filter(w => hospitalIds.includes(w.hospitalId));
  }

  private filterPlansByUser(plans: ProcurementPlan[], user: User | undefined): ProcurementPlan[] {
    if (!user) return [];

    const userHospitals = this.filterHospitalsByUser(user);
    const hospitalIds = userHospitals.map(h => h.id);

    return plans.filter(p => hospitalIds.includes(p.hospitalId));
  }

  private filterReportsByUser(reports: Report[], user: User | undefined): Report[] {
    if (!user) return [];

    const userHospitals = this.filterHospitalsByUser(user);
    const hospitalIds = userHospitals.map(h => h.id);

    return reports.filter(r => hospitalIds.includes(r.hospitalId));
  }

  findUser(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getDashboardOverview(user?: User): DashboardOverview {
    const filteredHospitals = this.filterHospitalsByUser(user);
    const filteredWarnings = this.filterWarningsByUser(this.warnings, user);
    return getDashboardOverview(filteredHospitals, filteredWarnings);
  }

  getProvinces(user?: User): Province[] {
    if (user?.role === 'provincial' && user.provinceId) {
      return this.provinces.filter(p => p.id === user.provinceId);
    }
    if (user?.role === 'hospital_admin' || user?.role === 'infection_control' ||
        user?.role === 'pharmacy' || user?.role === 'department') {
      if (user.hospitalId) {
        const hospital = this.hospitals.find(h => h.id === user.hospitalId);
        if (hospital) {
          return this.provinces.filter(p => p.id === hospital.provinceId);
        }
      }
      return [];
    }
    return this.provinces;
  }

  getHospitals(provinceId?: string, user?: User): Hospital[] {
    let hospitals = this.filterHospitalsByUser(user);
    if (provinceId) {
      hospitals = hospitals.filter(h => h.provinceId === provinceId);
    }
    return hospitals;
  }

  getHospitalRanking(type: 'infection' | 'usage', page: number, size: number, user?: User): { list: HospitalRank[]; total: number } {
    const filteredHospitals = this.filterHospitalsByUser(user);
    const all = generateHospitalRanking(filteredHospitals, type);
    const start = (page - 1) * size;
    const list = all.slice(start, start + size);
    return { list, total: all.length };
  }

  getTrendData(days: number, provinceId?: string, hospitalId?: string, user?: User): TrendData[] {
    let hospitals = this.filterHospitalsByUser(user);

    if (provinceId) {
      hospitals = hospitals.filter(h => h.provinceId === provinceId);
    }

    if (hospitalId) {
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (hospital) {
        return generateTrendDataByHospital(hospital, days);
      }
      return [];
    }

    if (hospitals.length === 0) return [];

    const allTrendData = hospitals.map(h => generateTrendDataByHospital(h, days));

    const result: TrendData[] = [];
    for (let i = 0; i < days; i++) {
      const sumInfection = allTrendData.reduce((sum, data) => sum + (data[i]?.infectionRate || 0), 0);
      const sumUsage = allTrendData.reduce((sum, data) => sum + (data[i]?.usageIntensity || 0), 0);

      result.push({
        date: allTrendData[0][i]?.date || '',
        infectionRate: parseFloat((sumInfection / hospitals.length).toFixed(2)),
        usageIntensity: parseFloat((sumUsage / hospitals.length).toFixed(2)),
      });
    }

    return result;
  }

  getDrugCategories(provinceId?: string, hospitalId?: string, user?: User): DrugCategory[] {
    let hospitals = this.filterHospitalsByUser(user);

    if (provinceId) {
      hospitals = hospitals.filter(h => h.provinceId === provinceId);
    }

    if (hospitalId) {
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (hospital) {
        return generateDrugCategoriesByHospital(hospital);
      }
      return [];
    }

    if (hospitals.length === 0) return [];

    const totalByCategory: Record<string, number> = {};
    drugCategoriesList.forEach(cat => { totalByCategory[cat] = 0; });

    hospitals.forEach(h => {
      Object.entries(h.drugUsageByCategory).forEach(([cat, val]) => {
        totalByCategory[cat] = (totalByCategory[cat] || 0) + val;
      });
    });

    const totalValue = Object.values(totalByCategory).reduce((sum, v) => sum + v, 0);

    return Object.entries(totalByCategory).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentage: parseFloat(((value / totalValue) * 100).toFixed(2)),
    }));
  }

  getWarnings(
    level?: WarningLevel,
    status?: WarningStatus,
    page: number = 1,
    size: number = 10,
    user?: User,
  ): { list: Warning[]; total: number } {
    let filtered = this.filterWarningsByUser(this.warnings, user);

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

  getWarningDetail(id: string, user?: User): WarningDetail | null {
    const warning = this.warnings.find(w => w.id === id);
    if (!warning) return null;

    if (user) {
      const allowedHospitals = this.filterHospitalsByUser(user);
      if (!allowedHospitals.find(h => h.id === warning.hospitalId)) {
        return null;
      }
    }

    const approvals = this.approvals.filter(a => a.warningId === id);

    const hospital = this.hospitals.find(h => h.id === warning.hospitalId);
    const historyData = hospital?.monthlyData.map(m => ({
      date: m.yearMonth,
      value: warning.type === 'infection' ? m.infectionRate : m.usageIntensity,
    })) || [];

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
      existingApproval.createdAt = new Date().toISOString();
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
    }

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
        const hasHealthCommission = this.approvals.find(
          a => a.warningId === warningId && a.step === 'health_commission',
        );
        if (!hasHealthCommission) {
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

      if (approved && warning.level === 1) {
        warning.status = 'resolved';
        warning.resolvedAt = new Date().toISOString();
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

  getProcurementPlans(year?: number, page: number = 1, size: number = 10, user?: User): { list: ProcurementPlan[]; total: number } {
    let filtered = this.filterPlansByUser(this.procurementPlans, user);

    if (year) {
      filtered = filtered.filter(p => p.year === year);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);
    return { list, total: filtered.length };
  }

  getProcurementItems(planId: string, user?: User): ProcurementItem[] {
    const plan = this.procurementPlans.find(p => p.id === planId);
    if (!plan) return [];

    if (user) {
      const allowedHospitals = this.filterHospitalsByUser(user);
      if (!allowedHospitals.find(h => h.id === plan.hospitalId)) {
        return [];
      }
    }

    return this.procurementItems.filter(item => item.planId === planId);
  }

  getDeviationAnalysis(planId: string, user?: User) {
    const items = this.getProcurementItems(planId, user);
    const abnormalItems = items.filter(item => Math.abs(item.deviation) > 15);

    return {
      planId,
      totalItems: items.length,
      abnormalItems: abnormalItems.length,
      items: abnormalItems,
    };
  }

  uploadProcurementPlan(hospitalId: string, hospitalName: string, year: number, itemsData: Array<{
    drugName: string;
    category: string;
    plannedQuantity: number;
  }>): ProcurementPlan | null {
    const hospital = this.hospitals.find(h => h.id === hospitalId);
    if (!hospital) return null;

    const planId = `p${Date.now().toString().slice(-6)}`;

    let totalAmount = 0;
    const newItems: ProcurementItem[] = itemsData.map((item, idx) => {
      const actualQuantity = item.plannedQuantity * (0.9 + Math.random() * 0.2);
      const deviation = ((actualQuantity - item.plannedQuantity) / item.plannedQuantity) * 100;

      totalAmount += item.plannedQuantity * (20 + Math.random() * 100);

      return {
        id: `pi${Date.now()}${idx.toString().padStart(4, '0')}`,
        planId,
        drugName: item.drugName,
        category: item.category,
        plannedQuantity: parseFloat(item.plannedQuantity.toFixed(2)),
        actualQuantity: parseFloat(actualQuantity.toFixed(2)),
        deviation: parseFloat(deviation.toFixed(2)),
      };
    });

    this.procurementItems = [...this.procurementItems, ...newItems];

    const plan: ProcurementPlan = {
      id: planId,
      hospitalId,
      hospitalName,
      year,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      itemCount: newItems.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };

    this.procurementPlans = [plan, ...this.procurementPlans];

    return plan;
  }

  getReports(type?: ReportType, page: number = 1, size: number = 10, user?: User): { list: Report[]; total: number } {
    let filtered = this.filterReportsByUser(this.reports, user);

    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }

    filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);
    return { list, total: filtered.length };
  }

  getReportDetail(id: string, user?: User): ReportDetail | null {
    const detail = this.reportDetails.find(r => r.id === id);
    if (!detail) return null;

    if (user) {
      const allowedHospitals = this.filterHospitalsByUser(user);
      if (!allowedHospitals.find(h => h.id === detail.hospitalId)) {
        return null;
      }
    }

    return detail;
  }

  getDepartments(hospitalId?: string): Department[] {
    if (hospitalId) {
      return this.departments.filter(d => d.hospitalId === hospitalId);
    }
    return this.departments;
  }

  getLevelAverages() {
    return calculateLevelAverages(this.hospitals);
  }

  getProvinceNameById(id: string): string {
    return getProvinceName(id);
  }
}

export const dataStore = new DataStore();
