import type { User, Hospital, Province, Department, Warning, WarningDetail, ApprovalRecord, ProcurementPlan, ProcurementItem, Report, ReportDetail, DashboardOverview, TrendData, DrugCategory, HospitalRank } from '../../../shared/types.js';

const provinceData = [
  { id: '110000', name: '北京市' },
  { id: '120000', name: '天津市' },
  { id: '130000', name: '河北省' },
  { id: '140000', name: '山西省' },
  { id: '150000', name: '内蒙古自治区' },
  { id: '210000', name: '辽宁省' },
  { id: '220000', name: '吉林省' },
  { id: '230000', name: '黑龙江省' },
  { id: '310000', name: '上海市' },
  { id: '320000', name: '江苏省' },
  { id: '330000', name: '浙江省' },
  { id: '340000', name: '安徽省' },
  { id: '350000', name: '福建省' },
  { id: '360000', name: '江西省' },
  { id: '370000', name: '山东省' },
  { id: '410000', name: '河南省' },
  { id: '420000', name: '湖北省' },
  { id: '430000', name: '湖南省' },
  { id: '440000', name: '广东省' },
  { id: '450000', name: '广西壮族自治区' },
  { id: '460000', name: '海南省' },
  { id: '500000', name: '重庆市' },
  { id: '510000', name: '四川省' },
  { id: '520000', name: '贵州省' },
  { id: '530000', name: '云南省' },
  { id: '540000', name: '西藏自治区' },
  { id: '610000', name: '陕西省' },
  { id: '620000', name: '甘肃省' },
  { id: '630000', name: '青海省' },
  { id: '640000', name: '宁夏回族自治区' },
  { id: '650000', name: '新疆维吾尔自治区' },
];

const departmentNames = [
  '内科', '外科', '儿科', '妇产科', '骨科', '神经内科',
  '心血管内科', '呼吸内科', '消化内科', 'ICU', '急诊科',
  '肿瘤科', '泌尿外科', '神经外科', '普外科'
];

export const drugCategoriesList = [
  '青霉素类', '头孢菌素类', '喹诺酮类', '大环内酯类',
  '氨基糖苷类', '四环素类', '糖肽类', '碳青霉烯类',
  '抗真菌药', '抗病毒药'
];

const hospitalPrefixes = ['第一', '第二', '第三', '中心', '人民', '协和', '同济', '华西', '湘雅', '齐鲁'];
const hospitalSuffixes = ['医院', '人民医院', '中心医院', '附属医院', '中医医院'];

const drugNameMap: Record<string, string[]> = {
  '青霉素类': ['青霉素G', '阿莫西林', '氨苄西林', '哌拉西林'],
  '头孢菌素类': ['头孢唑林', '头孢呋辛', '头孢曲松', '头孢吡肟'],
  '喹诺酮类': ['左氧氟沙星', '莫西沙星', '环丙沙星', '诺氟沙星'],
  '大环内酯类': ['阿奇霉素', '红霉素', '克拉霉素', '罗红霉素'],
  '氨基糖苷类': ['庆大霉素', '阿米卡星', '妥布霉素', '依替米星'],
  '四环素类': ['多西环素', '米诺环素', '四环素', '土霉素'],
  '糖肽类': ['万古霉素', '去甲万古霉素', '替考拉宁'],
  '碳青霉烯类': ['亚胺培南', '美罗培南', '厄他培南', '比阿培南'],
  '抗真菌药': ['氟康唑', '伊曲康唑', '伏立康唑', '卡泊芬净'],
  '抗病毒药': ['阿昔洛韦', '更昔洛韦', '奥司他韦', '利巴韦林'],
};

function seededRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function randomInt(min: number, max: number, seed?: number): number {
  if (seed !== undefined) {
    return Math.floor(seededRandom(seed)() * (max - min + 1)) + min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2, seed?: number): number {
  const rand = seed !== undefined ? seededRandom(seed)() : Math.random();
  return parseFloat((rand * (max - min) + min).toFixed(decimals));
}

function pickRandom<T>(arr: T[], seed?: number): T {
  const idx = seed !== undefined
    ? Math.floor(seededRandom(seed)() * arr.length)
    : Math.floor(Math.random() * arr.length);
  return arr[idx];
}

export interface MonthlyData {
  yearMonth: string;
  infectionRate: number;
  usageIntensity: number;
}

export interface HospitalWithData extends Hospital {
  monthlyData: MonthlyData[];
  drugUsageByCategory: Record<string, number>;
}

export function generateHospitals(): HospitalWithData[] {
  const hospitals: HospitalWithData[] = [];
  let id = 1;

  const levelBaseRates = {
    tertiary: { infection: 4.0, usage: 52 },
    secondary: { infection: 3.2, usage: 42 },
    primary: { infection: 2.3, usage: 32 },
  };

  const targetUsageByLevel = {
    tertiary: 50,
    secondary: 40,
    primary: 30,
  };

  provinceData.forEach((province) => {
    const hospitalCount = 2 + (id % 4);
    for (let i = 0; i < hospitalCount; i++) {
      const seed = id * 1000 + i;
      const levelArr = ['tertiary', 'secondary', 'primary'] as const;
      const level = pickRandom(levelArr, seed);
      const prefix = pickRandom(hospitalPrefixes, seed + 1);
      const suffix = pickRandom(hospitalSuffixes, seed + 2);
      const name = `${province.name}${prefix}${suffix}`;

      const baseInfection = levelBaseRates[level].infection;
      const baseUsage = levelBaseRates[level].usage;

      const isHighOutlier = seededRandom(seed + 99)() < 0.25;
      const infectionMultiplier = isHighOutlier ? 1.5 : 1.0;
      const usageMultiplier = isHighOutlier ? 1.35 : 1.0;

      const monthlyData: MonthlyData[] = [];
      const today = new Date();
      for (let m = 5; m >= 0; m--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - m);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        const infectionVariation = randomFloat(-0.5, 1.2, 2, seed + m * 10);
        const usageVariation = randomFloat(-6, 10, 2, seed + m * 10 + 5);

        const baseInfectionAdj = (baseInfection + infectionVariation) * infectionMultiplier;
        const baseUsageAdj = (baseUsage + usageVariation) * usageMultiplier;

        monthlyData.push({
          yearMonth,
          infectionRate: parseFloat(baseInfectionAdj.toFixed(2)),
          usageIntensity: parseFloat(baseUsageAdj.toFixed(2)),
        });
      }

      const drugUsageByCategory: Record<string, number> = {};
      drugCategoriesList.forEach((cat, idx) => {
        drugUsageByCategory[cat] = randomFloat(15, 80, 2, seed + idx * 7);
      });

      const lastMonth = monthlyData[monthlyData.length - 1];

      hospitals.push({
        id: `h${id.toString().padStart(4, '0')}`,
        name,
        level,
        provinceId: province.id,
        cityId: `${province.id}01`,
        address: `${province.name}某某市某某区某某路${randomInt(1, 999, seed + 100)}号`,
        infectionRate: lastMonth.infectionRate,
        usageIntensity: lastMonth.usageIntensity,
        monthlyData,
        drugUsageByCategory,
      });
      id++;
    }
  });

  return hospitals;
}

export function generateProvinces(hospitals: HospitalWithData[]): Province[] {
  return provinceData.map(p => {
    const provinceHospitals = hospitals.filter(h => h.provinceId === p.id);
    const avgRate = provinceHospitals.length > 0
      ? provinceHospitals.reduce((sum, h) => sum + (h.infectionRate || 0), 0) / provinceHospitals.length
      : 3.5;

    return {
      id: p.id,
      name: p.name,
      infectionRate: parseFloat(avgRate.toFixed(2)),
      hospitalCount: provinceHospitals.length,
    };
  });
}

export function generateDepartments(hospitals: Hospital[]): Department[] {
  const departments: Department[] = [];
  let id = 1;

  hospitals.forEach((hospital, hIdx) => {
    const count = 5 + (hIdx % 6);
    const selected = [...departmentNames].sort(() => 0.5 - Math.random()).slice(0, count);

    selected.forEach((name, dIdx) => {
      departments.push({
        id: `d${id.toString().padStart(6, '0')}`,
        hospitalId: hospital.id,
        name,
        type: dIdx < 3 ? '重点科室' : '临床科室',
      });
      id++;
    });
  });

  return departments;
}

export const users: User[] = [
  {
    id: 'u0001',
    username: 'admin',
    name: '国家级管理员',
    role: 'national',
    level: '国家级',
  },
  {
    id: 'u0002',
    username: 'province',
    name: '北京市管理员',
    role: 'provincial',
    level: '省级',
    provinceId: '110000',
  },
  {
    id: 'u0003',
    username: 'hospital',
    name: '医院管理员',
    role: 'hospital_admin',
    level: '医院级',
    hospitalId: 'h0001',
  },
  {
    id: 'u0004',
    username: 'infection',
    name: '院感科主任',
    role: 'infection_control',
    level: '医院级',
    hospitalId: 'h0001',
  },
  {
    id: 'u0005',
    username: 'pharmacy',
    name: '药剂科主任',
    role: 'pharmacy',
    level: '医院级',
    hospitalId: 'h0001',
  },
  {
    id: 'u0006',
    username: 'dept',
    name: '科室主任',
    role: 'department',
    level: '科室级',
    hospitalId: 'h0001',
    departmentId: 'd000001',
  },
];

export function calculateLevelAverages(hospitals: HospitalWithData[]) {
  const levelGroups: Record<string, HospitalWithData[]> = {};

  hospitals.forEach(h => {
    if (!levelGroups[h.level]) {
      levelGroups[h.level] = [];
    }
    levelGroups[h.level].push(h);
  });

  const result: Record<string, { avgInfectionRate: number; avgUsageIntensity: number; targetUsage: number }> = {};

  const targetUsageByLevel: Record<string, number> = {
    tertiary: 50,
    secondary: 40,
    primary: 30,
  };

  Object.entries(levelGroups).forEach(([level, list]) => {
    const avgInfection = list.reduce((sum, h) => {
      const lastMonth = h.monthlyData[h.monthlyData.length - 1];
      return sum + lastMonth.infectionRate;
    }, 0) / list.length;

    const avgUsage = list.reduce((sum, h) => {
      const lastMonth = h.monthlyData[h.monthlyData.length - 1];
      return sum + lastMonth.usageIntensity;
    }, 0) / list.length;

    result[level] = {
      avgInfectionRate: parseFloat(avgInfection.toFixed(2)),
      avgUsageIntensity: parseFloat(avgUsage.toFixed(2)),
      targetUsage: targetUsageByLevel[level] || 40,
    };
  });

  return result;
}

export function generateWarnings(
  hospitals: HospitalWithData[],
  departments: Department[],
): Warning[] {
  const warnings: Warning[] = [];
  const levelAverages = calculateLevelAverages(hospitals);

  let id = 1;

  hospitals.forEach((hospital, hIdx) => {
    const levelStats = levelAverages[hospital.level];
    if (!levelStats) return;

    const infectionThreshold = levelStats.avgInfectionRate * 1.2;
    const usageTarget = levelStats.targetUsage;
    const usageThreshold = usageTarget * 1.3;

    const monthlyData = hospital.monthlyData;

    if (monthlyData.length >= 3) {
      const last3 = monthlyData.slice(-3);
      const allAboveInfection = last3.every(m => m.infectionRate > infectionThreshold);
      const allAboveUsage = last3.every(m => m.usageIntensity > usageThreshold);

      const firstMonth = last3[0];
      const triggeredAt = new Date(firstMonth.yearMonth + '-01');
      triggeredAt.setMonth(triggeredAt.getMonth() + 1);

      const hospitalDepts = departments.filter(d => d.hospitalId === hospital.id);

      if (allAboveInfection) {
        const monthDiff = (new Date().getFullYear() - triggeredAt.getFullYear()) * 12
          + (new Date().getMonth() - triggeredAt.getMonth());
        const isLevel2 = monthDiff > 1;
        const level: 1 | 2 = isLevel2 ? 2 : 1;
        const status = isLevel2 ? 'processing' : 'pending';

        const dept = hospitalDepts[hIdx % hospitalDepts.length] || null;

        warnings.push({
          id: `w${id.toString().padStart(5, '0')}`,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          departmentId: dept?.id,
          departmentName: dept?.name,
          level,
          type: 'infection',
          thresholdValue: parseFloat(infectionThreshold.toFixed(2)),
          actualValue: last3[last3.length - 1].infectionRate,
          status,
          triggeredAt: triggeredAt.toISOString(),
          resolvedAt: undefined,
          description: `${hospital.name}${dept ? `（${dept.name}）` : ''}连续3个月感染发生率（${last3[last3.length - 1].infectionRate}%）高于同级医院均值（${levelStats.avgInfectionRate.toFixed(2)}%）20%以上，${isLevel2 ? '已超过1个月未改善，升级为二级预警' : '触发一级预警'}`,
        });
        id++;
      }

      if (allAboveUsage) {
        const monthDiff = (new Date().getFullYear() - triggeredAt.getFullYear()) * 12
          + (new Date().getMonth() - triggeredAt.getMonth());
        const isLevel2 = monthDiff > 1;
        const level: 1 | 2 = isLevel2 ? 2 : 1;
        const status = isLevel2 ? 'processing' : 'pending';

        const dept = hospitalDepts[(hIdx + 2) % hospitalDepts.length] || null;

        warnings.push({
          id: `w${id.toString().padStart(5, '0')}`,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          departmentId: dept?.id,
          departmentName: dept?.name,
          level,
          type: 'usage',
          thresholdValue: parseFloat(usageThreshold.toFixed(2)),
          actualValue: last3[last3.length - 1].usageIntensity,
          status,
          triggeredAt: triggeredAt.toISOString(),
          resolvedAt: undefined,
          description: `${hospital.name}${dept ? `（${dept.name}）` : ''}连续3个月抗菌药物使用强度（${last3[last3.length - 1].usageIntensity} DDDs）超过目标值（${usageTarget} DDDs）30%以上，${isLevel2 ? '已超过1个月未改善，升级为二级预警' : '触发一级预警'}`,
        });
        id++;
      }
    }
  });

  return warnings;
}

export function generateApprovalRecords(warnings: Warning[]): ApprovalRecord[] {
  const records: ApprovalRecord[] = [];
  let id = 1;

  warnings.forEach(warning => {
    if (warning.status === 'pending') {
      records.push({
        id: `a${id.toString().padStart(6, '0')}`,
        warningId: warning.id,
        step: 'department',
        approverId: '',
        approverName: '',
        status: 'pending',
        comment: '',
        createdAt: warning.triggeredAt,
      });
      id++;
    } else if (warning.status === 'processing') {
      records.push({
        id: `a${id.toString().padStart(6, '0')}`,
        warningId: warning.id,
        step: 'department',
        approverId: 'u0006',
        approverName: '科室主任',
        status: 'approved',
        comment: '已确认整改方案，将加强院感管理工作，严格控制抗菌药物使用。',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
      id++;

      if (warning.level === 2) {
        records.push({
          id: `a${id.toString().padStart(6, '0')}`,
          warningId: warning.id,
          step: 'infection_control',
          approverId: 'u0004',
          approverName: '院感科主任',
          status: 'approved',
          comment: '复核通过，整改方案合理可行，请认真落实。',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
        id++;
        records.push({
          id: `a${id.toString().padStart(6, '0')}`,
          warningId: warning.id,
          step: 'health_commission',
          approverId: '',
          approverName: '',
          status: 'pending',
          comment: '',
          createdAt: new Date().toISOString(),
        });
        id++;
      } else {
        records.push({
          id: `a${id.toString().padStart(6, '0')}`,
          warningId: warning.id,
          step: 'infection_control',
          approverId: '',
          approverName: '',
          status: 'pending',
          comment: '',
          createdAt: new Date().toISOString(),
        });
        id++;
      }
    }
  });

  return records;
}

export function generateProcurementPlans(hospitals: HospitalWithData[]): { plans: ProcurementPlan[]; items: ProcurementItem[] } {
  const plans: ProcurementPlan[] = [];
  const items: ProcurementItem[] = [];
  let planId = 1;
  let itemId = 1;

  const selectedHospitals = hospitals.filter(h => h.level === 'tertiary').slice(0, 8);

  selectedHospitals.forEach((hospital, hIdx) => {
    const year = 2024;
    const itemCount = 18 + (hIdx % 8);
    let totalAmount = 0;

    const planIdStr = `p${planId.toString().padStart(5, '0')}`;

    drugCategoriesList.slice(0, 8).forEach((category, catIdx) => {
      const drugsInCat = drugNameMap[category] || ['未知药物'];
      const countInCat = Math.ceil(itemCount / 8);

      for (let i = 0; i < countInCat && itemId < 1000; i++) {
        const drugName = drugsInCat[i % drugsInCat.length];
        const seed = hIdx * 100 + catIdx * 10 + i;
        const plannedQuantity = randomFloat(200, 1500, 2, seed);
        const actualDeviation = randomFloat(-0.25, 0.35, 4, seed + 50);
        const actualQuantity = parseFloat((plannedQuantity * (1 + actualDeviation)).toFixed(2));
        const deviation = parseFloat(((actualQuantity - plannedQuantity) / plannedQuantity * 100).toFixed(2));

        items.push({
          id: `pi${itemId.toString().padStart(6, '0')}`,
          planId: planIdStr,
          drugName,
          category,
          plannedQuantity: parseFloat(plannedQuantity.toFixed(2)),
          actualQuantity,
          deviation,
        });

        totalAmount += plannedQuantity * randomFloat(20, 150, 2, seed + 30);
        itemId++;
      }
    });

    plans.push({
      id: planIdStr,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      year,
      status: hIdx % 3 === 0 ? 'approved' : hIdx % 3 === 1 ? 'submitted' : 'draft',
      createdAt: new Date(Date.now() - (hIdx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      itemCount: Math.min(itemCount, items.filter(i => i.planId === planIdStr).length),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });
    planId++;
  });

  return { plans, items };
}

export function generateReports(hospitals: HospitalWithData[]): { reports: Report[]; details: ReportDetail[] } {
  const reports: Report[] = [];
  const details: ReportDetail[] = [];
  let id = 1;

  const selectedHospitals = hospitals.slice(0, 6);

  selectedHospitals.forEach((hospital, hIdx) => {
    const types: Array<'weekly' | 'monthly' | 'yearly'> = ['weekly', 'weekly', 'monthly', 'yearly'];

    types.forEach((type, idx) => {
      const lastMonth = hospital.monthlyData[hospital.monthlyData.length - 1];
      const infectionRate = lastMonth.infectionRate;
      const infectionRateYoY = randomFloat(-15, 10, 2, hIdx * 100 + idx * 10);
      const infectionRateMoM = randomFloat(-8, 6, 2, hIdx * 100 + idx * 10 + 1);
      const drugSusceptibilityRate = randomFloat(72, 88, 1, hIdx * 100 + idx * 10 + 2);
      const usageIntensity = lastMonth.usageIntensity;

      const reportId = `r${id.toString().padStart(5, '0')}`;
      const period = type === 'weekly'
        ? `2024年第${20 + idx}周`
        : type === 'monthly'
          ? `2024年${idx + 1}月`
          : '2024年度';

      const infectionTrend = Array.from({ length: type === 'weekly' ? 7 : type === 'monthly' ? 30 : 12 }, (_, i) => ({
        date: type === 'yearly' ? `${i + 1}月` : `${i + 1}日`,
        value: parseFloat((infectionRate + randomFloat(-1.5, 1.5, 2, hIdx * 50 + i)).toFixed(2)),
      }));

      const drugRanking = Object.entries(hospital.drugUsageByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const deptNames = departmentNames.slice(0, 6);
      const departmentRanking = deptNames.map((name, dIdx) => ({
        name,
        infectionRate: parseFloat((infectionRate * (0.6 + dIdx * 0.15)).toFixed(2)),
      })).sort((a, b) => b.infectionRate - a.infectionRate);

      const suggestions = [
        `加强${departmentRanking[0].name}院感防控措施，当前感染率偏高`,
        '优化抗菌药物使用结构，适当减少头孢菌素类使用比例',
        '重点关注外科手术部位感染预防，严格执行无菌操作',
        '加强微生物送检率管理，提高病原学诊断水平',
      ];

      const trainingFocus = [
        '手卫生规范与依从性培训',
        '抗菌药物分级管理与合理使用培训',
        '多重耐药菌识别与防控措施',
        '医院感染暴发应急处置演练',
      ];

      reports.push({
        id: reportId,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        type,
        period,
        generatedAt: new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toISOString(),
        summary: {
          infectionRate,
          infectionRateYoY,
          infectionRateMoM,
          drugSusceptibilityRate,
          usageIntensity,
        },
      });

      details.push({
        id: reportId,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        type,
        period,
        generatedAt: new Date().toISOString(),
        summary: {
          infectionRate,
          infectionRateYoY,
          infectionRateMoM,
          drugSusceptibilityRate,
          usageIntensity,
        },
        content: {
          infectionTrend,
          drugRanking,
          departmentRanking,
          suggestions,
          trainingFocus,
        },
      });

      id++;
    });
  });

  return { reports, details };
}

export function generateTrendDataByHospital(hospital: HospitalWithData, days: number): TrendData[] {
  const data: TrendData[] = [];
  const today = new Date();
  const lastMonth = hospital.monthlyData[hospital.monthlyData.length - 1];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayVariation = Math.sin(i * 0.5) * 0.3 + (Math.random() - 0.5) * 0.4;

    data.push({
      date: date.toISOString().split('T')[0],
      infectionRate: parseFloat((lastMonth.infectionRate + dayVariation).toFixed(2)),
      usageIntensity: parseFloat((lastMonth.usageIntensity + dayVariation * 5).toFixed(2)),
    });
  }

  return data;
}

export function generateDrugCategoriesByHospital(hospital: HospitalWithData): DrugCategory[] {
  const totalValue = Object.values(hospital.drugUsageByCategory).reduce((sum, v) => sum + v, 0);

  return Object.entries(hospital.drugUsageByCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    percentage: parseFloat(((value / totalValue) * 100).toFixed(2)),
  }));
}

export function generateHospitalRanking(hospitals: HospitalWithData[], type: 'infection' | 'usage'): HospitalRank[] {
  const sorted = [...hospitals].sort((a, b) => {
    const aVal = type === 'infection' ? (a.infectionRate || 0) : (a.usageIntensity || 0);
    const bVal = type === 'infection' ? (b.infectionRate || 0) : (b.usageIntensity || 0);
    return type === 'infection' ? bVal - aVal : bVal - aVal;
  });

  const provinceMap: Record<string, string> = {};
  provinceData.forEach(p => { provinceMap[p.id] = p.name; });

  return sorted.map((h, idx) => ({
    rank: idx + 1,
    id: h.id,
    name: h.name,
    level: h.level,
    province: provinceMap[h.provinceId] || '未知',
    value: type === 'infection' ? (h.infectionRate || 0) : (h.usageIntensity || 0),
  }));
}

export function getDashboardOverview(hospitals: HospitalWithData[], warnings: Warning[]): DashboardOverview {
  const avgInfectionRate = hospitals.reduce((sum, h) => sum + (h.infectionRate || 0), 0) / hospitals.length;
  const avgUsageIntensity = hospitals.reduce((sum, h) => sum + (h.usageIntensity || 0), 0) / hospitals.length;

  const pendingWarnings = warnings.filter(w => w.status !== 'resolved');
  const level1 = warnings.filter(w => w.level === 1 && w.status !== 'resolved').length;
  const level2 = warnings.filter(w => w.level === 2 && w.status !== 'resolved').length;

  const lastMonth = hospitals[0]?.monthlyData[hospitals[0].monthlyData.length - 1];
  const prevMonth = hospitals[0]?.monthlyData[hospitals[0].monthlyData.length - 2];

  const infectionRateMoM = lastMonth && prevMonth
    ? ((lastMonth.infectionRate - prevMonth.infectionRate) / prevMonth.infectionRate) * 100
    : 0;

  return {
    infectionRate: parseFloat(avgInfectionRate.toFixed(2)),
    infectionRateYoY: parseFloat(infectionRateMoM.toFixed(1)),
    infectionRateMoM: parseFloat(infectionRateMoM.toFixed(1)),
    drugSusceptibilityRate: 80.5,
    usageIntensity: parseFloat(avgUsageIntensity.toFixed(2)),
    usageIntensityYoY: 3.2,
    warningCount: pendingWarnings.length,
    level1WarningCount: level1,
    level2WarningCount: level2,
  };
}

export function getProvinceName(id: string): string {
  const p = provinceData.find(p => p.id === id);
  return p?.name || '未知';
}
