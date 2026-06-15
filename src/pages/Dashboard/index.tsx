import { useState, useEffect, useMemo } from 'react';
import {
  Activity, Pill, AlertTriangle, Microscope, TrendingUp, MapPin,
  ChevronDown, ChevronUp, Building2, X
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import StatCard from '@/components/StatCard';
import { dashboardApi } from '@/api';
import type {
  DashboardOverview, Province, HospitalRank, TrendData, DrugCategory, Hospital
} from '@shared/types';
import { useAuthStore } from '@/store/auth';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [ranking, setRanking] = useState<HospitalRank[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [drugCategories, setDrugCategories] = useState<DrugCategory[]>([]);
  const [rankType, setRankType] = useState<'infection' | 'usage'>('usage');
  const [trendDays, setTrendDays] = useState(7);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showProvincePanel, setShowProvincePanel] = useState(false);

  const selectedProvinceName = useMemo(() => {
    const p = provinces.find(p => p.id === selectedProvince);
    return p?.name || '';
  }, [provinces, selectedProvince]);

  const selectedHospitalName = useMemo(() => {
    const h = hospitals.find(h => h.id === selectedHospital);
    return h?.name || '';
  }, [hospitals, selectedHospital]);

  useEffect(() => {
    loadOverviewData();
    loadProvinces();
    loadRanking();
  }, [rankType]);

  useEffect(() => {
    if (selectedProvince) {
      loadProvinceDetail(selectedProvince);
    } else {
      loadNationalData();
    }
  }, [selectedProvince, selectedHospital, trendDays]);

  const loadOverviewData = async () => {
    try {
      const data = await dashboardApi.getOverview();
      setOverview(data);
    } catch (error) {
      console.error('加载概览数据失败:', error);
    }
  };

  const loadProvinces = async () => {
    try {
      const data = await dashboardApi.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('加载省份数据失败:', error);
    }
  };

  const loadRanking = async () => {
    try {
      const data = await dashboardApi.getRanking(rankType, 1, 10);
      setRanking(data.list);
    } catch (error) {
      console.error('加载排名数据失败:', error);
    }
  };

  const loadNationalData = async () => {
    try {
      const [trendResult, drugResult] = await Promise.all([
        dashboardApi.getTrend(trendDays),
        dashboardApi.getDrugCategories(),
      ]);
      setTrendData(trendResult);
      setDrugCategories(drugResult);
    } catch (error) {
      console.error('加载全国数据失败:', error);
    }
  };

  const loadProvinceDetail = async (provinceId: string) => {
    try {
      const [hospitalsResult, trendResult, drugResult] = await Promise.all([
        dashboardApi.getHospitals(provinceId),
        dashboardApi.getTrend(trendDays, provinceId, selectedHospital || undefined),
        dashboardApi.getDrugCategories(provinceId, selectedHospital || undefined),
      ]);
      setHospitals(hospitalsResult);
      setTrendData(trendResult);
      setDrugCategories(drugResult);
    } catch (error) {
      console.error('加载省份详情失败:', error);
    }
  };

  const handleProvinceClick = (provinceId: string) => {
    if (selectedProvince === provinceId) {
      setSelectedProvince(null);
      setSelectedHospital(null);
      setShowProvincePanel(false);
    } else {
      setSelectedProvince(provinceId);
      setSelectedHospital(null);
      setShowProvincePanel(true);
    }
  };

  const handleHospitalChange = (hospitalId: string) => {
    if (hospitalId === '') {
      setSelectedHospital(null);
    } else {
      setSelectedHospital(hospitalId);
    }
  };

  const getInfectionColor = (rate: number) => {
    if (rate < 3.5) return 'from-emerald-400 to-emerald-500';
    if (rate < 5) return 'from-lime-400 to-lime-500';
    if (rate < 6.5) return 'from-yellow-400 to-yellow-500';
    if (rate < 7.5) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getInfectionBgColor = (rate: number, selected: boolean) => {
    let base = '';
    if (rate < 3.5) base = 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
    else if (rate < 5) base = 'bg-lime-50 border-lime-200 hover:bg-lime-100';
    else if (rate < 6.5) base = 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    else if (rate < 7.5) base = 'bg-orange-50 border-orange-200 hover:bg-orange-100';
    else base = 'bg-red-50 border-red-200 hover:bg-red-100';

    if (selected) {
      base += ' ring-2 ring-primary-500 ring-offset-1';
    }
    return base;
  };

  const getInfectionTextColor = (rate: number) => {
    if (rate < 3.5) return 'text-emerald-600';
    if (rate < 5) return 'text-lime-600';
    if (rate < 6.5) return 'text-yellow-600';
    if (rate < 7.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const trendOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
      textStyle: { color: '#4E5969' },
    },
    legend: {
      data: ['感染发生率', '抗菌药物使用强度'],
      top: 0,
      textStyle: { color: '#86909C', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(d => d.date.slice(5)),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: '感染率(%)',
        position: 'left',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F2F3F5' } },
        axisLabel: { color: '#86909C', fontSize: 11 },
      },
      {
        type: 'value',
        name: '使用强度(DDDs)',
        position: 'right',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#86909C', fontSize: 11 },
      },
    ],
    series: [
      {
        name: '感染发生率',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.infectionRate),
        lineStyle: { color: '#F53F3F', width: 2 },
        itemStyle: { color: '#F53F3F' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 63, 63, 0.2)' },
              { offset: 1, color: 'rgba(245, 63, 63, 0.02)' },
            ],
          },
        },
      },
      {
        name: '抗菌药物使用强度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: trendData.map(d => d.usageIntensity),
        lineStyle: { color: '#165DFF', width: 2 },
        itemStyle: { color: '#165DFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.15)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.02)' },
            ],
          },
        },
      },
    ],
  }), [trendData]);

  const drugPieOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
      textStyle: { color: '#4E5969' },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#4E5969', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: '药物类别',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: drugCategories.map((d) => ({
          value: d.value,
          name: d.name,
        })),
        color: [
          '#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1',
          '#14C9C9', '#F5319D', '#FF9A2E', '#3491FA', '#66C266',
        ],
      },
    ],
  }), [drugCategories]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="感染发生率"
          value={overview?.infectionRate.toFixed(2) || '--'}
          unit="%"
          change={overview?.infectionRateYoY}
          changeLabel="同比"
          icon={<Activity className="w-6 h-6" />}
          color="danger"
        />
        <StatCard
          title="药敏达标率"
          value={overview?.drugSusceptibilityRate.toFixed(1) || '--'}
          unit="%"
          icon={<Microscope className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="抗菌药物使用强度"
          value={overview?.usageIntensity.toFixed(1) || '--'}
          unit="DDDs"
          change={overview?.usageIntensityYoY}
          changeLabel="同比"
          icon={<Pill className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="待处理预警"
          value={overview?.warningCount || '--'}
          change={undefined}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              {user?.role === 'national' ? '全国感染率分布热力图' : '辖区感染率分布'}
            </h3>
            <div className="text-xs text-neutral-400">
              共 <span className="font-semibold text-primary-500">{provinces.length}</span> 个省份
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
            {provinces.map((province) => (
              <div
                key={province.id}
                className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  getInfectionBgColor(province.infectionRate, selectedProvince === province.id)
                }`}
                onClick={() => handleProvinceClick(province.id)}
                title={`${province.name}: ${province.infectionRate}%（${province.hospitalCount}家医院）`}
              >
                <div className="text-xs text-neutral-700 font-medium leading-tight mb-1 h-8 flex items-center justify-center text-center">
                  {province.name.replace(/省|市|自治区|壮族|回族|维吾尔/g, '')}
                </div>
                <div className={`text-sm font-bold text-center ${getInfectionTextColor(province.infectionRate)}`}>
                  {province.infectionRate}%
                </div>
                <div className="text-[10px] text-neutral-500 text-center mt-0.5">
                  {province.hospitalCount}家医院
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>图例：</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-emerald-400"></span>
              <span>低</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-lime-400"></span>
              <span>较低</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-yellow-400"></span>
              <span>中</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-orange-400"></span>
              <span>较高</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-400"></span>
              <span>高</span>
            </div>
            <div className="w-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              药物使用排名
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setRankType('usage')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  rankType === 'usage'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                使用强度
              </button>
              <button
                onClick={() => setRankType('infection')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  rankType === 'infection'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                感染率
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {ranking.slice(0, 6).map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-yellow-900'
                      : index === 1
                      ? 'bg-neutral-300 text-neutral-700'
                      : index === 2
                      ? 'bg-orange-300 text-orange-900'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-neutral-700 truncate">{item.name}</div>
                  <div className="text-xs text-neutral-400">{item.province}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-neutral-700">
                    {item.value.toFixed(1)}
                    <span className="text-xs font-normal text-neutral-400 ml-1">
                      {rankType === 'infection' ? '%' : 'DDDs'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedProvince && showProvincePanel && (
        <div className="bg-white rounded-lg shadow-card p-5 border-l-4 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-neutral-700">
                {selectedProvinceName} - 详细数据
              </h3>
              <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                {hospitals.length} 家医院
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedProvince(null);
                setSelectedHospital(null);
                setShowProvincePanel(false);
              }}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-500">选择医院：</label>
              <select
                value={selectedHospital || ''}
                onChange={(e) => handleHospitalChange(e.target.value)}
                className="border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="">全省平均</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            {selectedHospital && (
              <div className="text-sm text-neutral-500">
                当前查看：<span className="text-primary-600 font-medium">{selectedHospitalName}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-600 mb-2">近 {trendDays} 天感染趋势</h4>
              <ReactECharts
                option={{
                  ...trendOption,
                  legend: { show: false },
                  series: trendOption.series.filter((_, i) => i === 0),
                  yAxis: [trendOption.yAxis[0]],
                }}
                style={{ height: '200px' }}
              />
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-600 mb-2">抗菌药物类别分布</h4>
              <ReactECharts option={drugPieOption} style={{ height: '200px' }} />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-neutral-600 mb-3">医院列表</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedHospital === hospital.id
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                  }`}
                  onClick={() => handleHospitalChange(
                    selectedHospital === hospital.id ? '' : hospital.id
                  )}
                >
                  <div className="text-sm font-medium text-neutral-700 truncate">{hospital.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-neutral-500">
                      {hospital.level === 'tertiary' ? '三级' : hospital.level === 'secondary' ? '二级' : '一级'}
                    </span>
                    <span className="text-danger-500 font-medium">
                      感染率 {hospital.infectionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              {selectedProvince
                ? `${selectedProvinceName}${selectedHospital ? ` - ${selectedHospitalName}` : ''} 近 ${trendDays} 天趋势`
                : `近 ${trendDays} 天趋势分析`}
            </h3>
            <div className="flex gap-1">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setTrendDays(days)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    trendDays === days
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  近{days}天
                </button>
              ))}
            </div>
          </div>
          <ReactECharts option={trendOption} style={{ height: '280px' }} />
        </div>

        <div className="bg-white rounded-lg shadow-card p-5">
          <h3 className="font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <Pill className="w-4 h-4 text-primary-500" />
            {selectedProvince
              ? `${selectedProvinceName}${selectedHospital ? ` - ${selectedHospitalName}` : ''} 药物分布`
              : '抗菌药物类别分布'}
          </h3>
          <ReactECharts option={drugPieOption} style={{ height: '280px' }} />
        </div>
      </div>
    </div>
  );
}
