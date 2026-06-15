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

const drugCategories = [
  '青霉素类', '头孢菌素类', '喹诺酮类', '大环内酯类',
  '氨基糖苷类', '四环素类', '糖肽类', '碳青霉烯类',
  '抗真菌药', '抗病毒药'
];

const hospitalPrefixes = ['第一', '第二', '第三', '中心', '人民', '协和', '同济', '华西', '湘雅', '齐鲁'];
const hospitalSuffixes = ['医院', '人民医院', '中心医院', '附属医院', '中医医院'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateHospitals(): Hospital[] {
  const hospitals: Hospital[] = [];
  let id = 1;

  provinceData.forEach((province, pIdx) => {
    const hospitalCount = randomInt(2, 5);
    for (let i = 0; i < hospitalCount; i++) {
      const level = pickRandom(['tertiary', 'secondary', 'primary'] as const);
      const prefix = pickRandom(hospitalPrefixes);
      const suffix = pickRandom(hospitalSuffixes);
      const name = `${province.name}${prefix}${suffix}`;

      hospitals.push({
        id: `h${id.toString().padStart(4, '0')}`,
        name,
        level,
        provinceId: province.id,
        cityId: `${province.id}01`,
        address: `${province.name}某某市某某区某某路${randomInt(1, 999)}号`,
        infectionRate: randomFloat(2, 8),
        usageIntensity: randomFloat(30, 80),
      });
      id++;
    }
  });

  return hospitals;
}

export function generateProvinces(hospitals: Hospital[]): Province[] {
  return provinceData.map(p => {
    const provinceHospitals = hospitals.filter(h => h.provinceId === p.id);
    const avgRate = provinceHospitals.length > 0
      ? provinceHospitals.reduce((sum, h) => sum + (h.infectionRate || 0), 0) / provinceHospitals.length
      : randomFloat(3, 6);

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

  hospitals.forEach(hospital => {
    const count = randomInt(5, 10);
    const selected = [...departmentNames].sort(() => Math.random() - 0.5).slice(0, count);

    selected.forEach(name => {
      departments.push({
        id: `d${id.toString().padStart(6, '0')}`,
        hospitalId: hospital.id,
        name,
        type: pickRandom(['临床科室', '医技科室', '行政科室']),
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
    name: '省级管理员',
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

export function generateWarnings(hospitals: Hospital[], departments: Department[]): Warning[] {
  const warnings: Warning[] = [];

  const typeConfigs = [
    { type: 'infection' as const, desc: '感染发生率', unit: '%', threshold: 6.0, minVal: 7.0, maxVal: 12.0 },
    { type: 'usage' as const, desc: '抗菌药物使用强度', unit: 'DDDs', threshold: 50, minVal: 55, maxVal: 90 },
  ];

  let id = 1;
  const count = randomInt(15, 25);

  for (let i = 0; i < count; i++) {
    const hospital = pickRandom(hospitals);
    const hospitalDepts = departments.filter(d => d.hospitalId === hospital.id);
    const department = hospitalDepts.length > 0 ? pickRandom(hospitalDepts) : null;
    const config = pickRandom(typeConfigs);
    const level: 1 | 2 = Math.random() > 0.7 ? 2 : 1;
    const statuses: Array<'pending' | 'processing' | 'resolved'> = ['pending', 'processing', 'resolved'];
    const status = pickRandom(statuses);

    const actualValue = randomFloat(config.minVal, config.maxVal);

    warnings.push({
      id: `w${id.toString().padStart(5, '0')}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      departmentId: department?.id,
      departmentName: department?.name,
      level,
      type: config.type,
      thresholdValue: config.threshold,
      actualValue,
      status,
      triggeredAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
      description: `${department?.name || hospital.name}连续3个月${config.desc}${level === 1 ? '高于' : '显著高于'}同级均值，${config.type === 'infection' ? '感染发生率' : '使用强度'}达${actualValue}${config.unit}`,
    });
    id++;
  }

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
        approverId: 'u0006',
        approverName: '科室主任',
        status: 'pending',
        comment: '',
        createdAt: new Date().toISOString(),
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
        comment: '已确认整改方案，将加强院感管理',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
      id++;
      records.push({
        id: `a${id.toString().padStart(6, '0')}`,
        warningId: warning.id,
        step: 'infection_control',
        approverId: 'u0004',
        approverName: '院感科主任',
        status: 'pending',
        comment: '',
        createdAt: new Date().toISOString(),
      });
      id++;
    } else if (warning.status === 'resolved' && warning.level === 2) {
      records.push({
        id: `a${id.toString().padStart(6, '0')}`,
        warningId: warning.id,
        step: 'department',
        approverId: 'u0006',
        approverName: '科室主任',
        status: 'approved',
        comment: '整改方案已确认',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      });
      id++;
      records.push({
        id: `a${id.toString().padStart(6, '0')}`,
        warningId: warning.id,
        step: 'infection_control',
        approverId: 'u0004',
        approverName: '院感科主任',
        status: 'approved',
        comment: '复核通过，同意整改方案',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      });
      id++;
      records.push({
        id: `a${id.toString().padStart(6, '0')}`,
        warningId: warning.id,
        step: 'health_commission',
        approverId: 'u0002',
        approverName: '卫健委',
        status: 'approved',
        comment: '批准执行，请严格落实',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      });
      id++;
    }
  });

  return records;
}

export function generateProcurementPlans(hospitals: Hospital[]): { plans: ProcurementPlan[]; items: ProcurementItem[] } {
  const plans: ProcurementPlan[] = [];
  const items: ProcurementItem[] = [];
  let planId = 1;
  let itemId = 1;

  const selectedHospitals = hospitals.slice(0, 10);

  selectedHospitals.forEach(hospital => {
    const year = 2024;
    const itemCount = randomInt(15, 30);
    let totalAmount = 0;

    const planIdStr = `p${planId.toString().padStart(5, '0')}`;

    for (let i = 0; i < itemCount; i++) {
      const category = pickRandom(drugCategories);
      const drugNames: Record<string, string[]> = {
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

      const drugName = pickRandom(drugNames[category] || ['未知药物']);
      const plannedQuantity = randomFloat(100, 2000);
      const actualQuantity = plannedQuantity * randomFloat(0.7, 1.3);
      const deviation = parseFloat(((actualQuantity - plannedQuantity) / plannedQuantity * 100).toFixed(2));

      items.push({
        id: `pi${itemId.toString().padStart(6, '0')}`,
        planId: planIdStr,
        drugName,
        category,
        plannedQuantity: parseFloat(plannedQuantity.toFixed(2)),
        actualQuantity: parseFloat(actualQuantity.toFixed(2)),
        deviation,
      });

      totalAmount += plannedQuantity * randomFloat(10, 100);
      itemId++;
    }

    plans.push({
      id: planIdStr,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      year,
      status: pickRandom(['draft', 'submitted', 'approved']),
      createdAt: new Date(Date.now() - randomInt(1, 180) * 24 * 60 * 60 * 1000).toISOString(),
      itemCount,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });
    planId++;
  });

  return { plans, items };
}

export function generateReports(hospitals: Hospital[]): { reports: Report[]; details: ReportDetail[] } {
  const reports: Report[] = [];
  const details: ReportDetail[] = [];
  let id = 1;

  const selectedHospitals = hospitals.slice(0, 5);

  selectedHospitals.forEach(hospital => {
    const types: Array<'weekly' | 'monthly' | 'yearly'> = ['weekly', 'weekly', 'monthly', 'yearly'];

    types.forEach((type, idx) => {
      const infectionRate = randomFloat(3, 7);
      const infectionRateYoY = randomFloat(-15, 15);
      const infectionRateMoM = randomFloat(-10, 10);
      const drugSusceptibilityRate = randomFloat(70, 90);
      const usageIntensity = randomFloat(40, 70);

      const reportId = `r${id.toString().padStart(5, '0')}`;
      const period = type === 'weekly'
        ? `2024年第${20 + idx}周`
        : type === 'monthly'
          ? `2024年${idx + 1}月`
          : '2024年';

      const infectionTrend = Array.from({ length: type === 'weekly' ? 7 : type === 'monthly' ? 30 : 12 }, (_, i) => ({
        date: type === 'yearly' ? `${i + 1}月` : `第${i + 1}天`,
        value: parseFloat(randomFloat(2, 8).toFixed(2)),
      }));

      const drugRanking = drugCategories.slice(0, 5).map(name => ({
        name,
        value: randomFloat(20, 80),
      })).sort((a, b) => b.value - a.value);

      const departmentRanking = departmentNames.slice(0, 6).map(name => ({
        name,
        infectionRate: randomFloat(2, 10),
      })).sort((a, b) => b.infectionRate - a.infectionRate);

      const suggestions = [
        '加强ICU病房院感防控措施',
        '优化抗菌药物使用结构，减少三代头孢使用比例',
        '重点关注外科手术部位感染预防',
        '加强微生物送检率管理，提高病原学诊断水平',
      ];

      const trainingFocus = [
        '手卫生规范培训',
        '抗菌药物合理使用培训',
        '多重耐药菌防控培训',
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

export function generateTrendData(days: number): TrendData[] {
  const data: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      infectionRate: randomFloat(3, 6),
      usageIntensity: randomFloat(45, 65),
    });
  }

  return data;
}

export function generateDrugCategories(): DrugCategory[] {
  const totalValue = drugCategories.reduce((sum) => sum + randomFloat(10, 30), 0);

  return drugCategories.map(name => {
    const value = randomFloat(10, 30);
    return {
      name,
      value: parseFloat(value.toFixed(2)),
      percentage: parseFloat(((value / totalValue) * 100).toFixed(2)),
    };
  });
}

export function generateHospitalRanking(hospitals: Hospital[], type: 'infection' | 'usage'): HospitalRank[] {
  const sorted = [...hospitals].sort((a, b) => {
    const aVal = type === 'infection' ? (a.infectionRate || 0) : (a.usageIntensity || 0);
    const bVal = type === 'infection' ? (b.infectionRate || 0) : (b.usageIntensity || 0);
    return type === 'infection' ? aVal - bVal : bVal - aVal;
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

export function getDashboardOverview(hospitals: Hospital[], warnings: Warning[]): DashboardOverview {
  const avgInfectionRate = hospitals.reduce((sum, h) => sum + (h.infectionRate || 0), 0) / hospitals.length;
  const avgUsageIntensity = hospitals.reduce((sum, h) => sum + (h.usageIntensity || 0), 0) / hospitals.length;

  const pendingWarnings = warnings.filter(w => w.status !== 'resolved');
  const level1 = warnings.filter(w => w.level === 1 && w.status !== 'resolved').length;
  const level2 = warnings.filter(w => w.level === 2 && w.status !== 'resolved').length;

  return {
    infectionRate: parseFloat(avgInfectionRate.toFixed(2)),
    infectionRateYoY: randomFloat(-12, 8),
    infectionRateMoM: randomFloat(-8, 5),
    drugSusceptibilityRate: randomFloat(75, 88),
    usageIntensity: parseFloat(avgUsageIntensity.toFixed(2)),
    usageIntensityYoY: randomFloat(-10, 10),
    warningCount: pendingWarnings.length,
    level1WarningCount: level1,
    level2WarningCount: level2,
  };
}
