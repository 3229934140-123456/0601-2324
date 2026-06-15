import { useState, useEffect } from 'react';
import { Activity, Pill, AlertTriangle, Microscope, TrendingUp, MapPin } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import StatCard from '@/components/StatCard';
import { dashboardApi } from '@/api';
import type { DashboardOverview, Province, HospitalRank, TrendData, DrugCategory } from '@shared/types';

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [ranking, setRanking] = useState<HospitalRank[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [drugCategories, setDrugCategories] = useState<DrugCategory[]>([]);
  const [rankType, setRankType] = useState<'infection' | 'usage'>('usage');
  const [trendDays, setTrendDays] = useState(7);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [rankType, trendDays, selectedProvince]);

  const loadData = async () => {
    try {
      const [overviewData, provincesData, rankingData, trendDataResult, drugData] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getProvinces(),
        dashboardApi.getRanking(rankType, 1, 10),
        dashboardApi.getTrend(trendDays, selectedProvince || undefined),
        dashboardApi.getDrugCategories(),
      ]);

      setOverview(overviewData);
      setProvinces(provincesData);
      setRanking(rankingData.list);
      setTrendData(trendDataResult);
      setDrugCategories(drugData);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const getInfectionColor = (rate: number) => {
    if (rate < 3.5) return 'from-emerald-400 to-emerald-500';
    if (rate < 5) return 'from-lime-400 to-lime-500';
    if (rate < 6.5) return 'from-yellow-400 to-yellow-500';
    if (rate < 7.5) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getInfectionBgColor = (rate: number) => {
    if (rate < 3.5) return 'bg-emerald-50 border-emerald-200';
    if (rate < 5) return 'bg-lime-50 border-lime-200';
    if (rate < 6.5) return 'bg-yellow-50 border-yellow-200';
    if (rate < 7.5) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getInfectionTextColor = (rate: number) => {
    if (rate < 3.5) return 'text-emerald-600';
    if (rate < 5) return 'text-lime-600';
    if (rate < 6.5) return 'text-yellow-600';
    if (rate < 7.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const trendOption = {
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
  };

  const drugPieOption = {
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
        data: drugCategories.map((d, i) => ({
          value: d.value,
          name: d.name,
        })),
        color: [
          '#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1',
          '#14C9C9', '#F5319D', '#FF9A2E', '#3491FA', '#66C266',
        ],
      },
    ],
  };

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
              全国感染率分布热力图
            </h3>
            <div className="text-xs text-neutral-400">
              共 {provinces.length} 个省份
            </div>
          </div>

          <div className="grid grid-cols-8 gap-2 mb-4">
            {provinces.slice(0, 24).map((province) => (
              <div
                key={province.id}
                className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getInfectionBgColor(province.infectionRate)}`}
                onClick={() => setSelectedProvince(selectedProvince === province.id ? null : province.id)}
                title={`${province.name}: ${province.infectionRate}%`}
              >
                <div className="text-xs text-neutral-600 truncate">{province.name}</div>
                <div className={`text-lg font-bold ${getInfectionTextColor(province.infectionRate)}`}>
                  {province.infectionRate}%
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
            <div className="w-40" />
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

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              近 {trendDays} 天趋势分析
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
            抗菌药物类别分布
          </h3>
          <ReactECharts option={drugPieOption} style={{ height: '280px' }} />
        </div>
      </div>
    </div>
  );
}
