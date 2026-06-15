import { useState, useEffect } from 'react';
import { FileText, Upload, Download, AlertTriangle, TrendingUp, ChevronRight, Search } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { procurementApi } from '@/api';
import type { ProcurementPlan, ProcurementItem, DeviationAnalysis } from '@shared/types';

export default function Procurement() {
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [year, setYear] = useState(2024);
  const [selectedPlan, setSelectedPlan] = useState<ProcurementPlan | null>(null);
  const [planItems, setPlanItems] = useState<ProcurementItem[]>([]);
  const [deviation, setDeviation] = useState<DeviationAnalysis | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [year]);

  const loadPlans = async () => {
    try {
      const result = await procurementApi.getList({ year, page: 1, size: 10 });
      setPlans(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('加载采购计划失败:', error);
    }
  };

  const loadPlanDetail = async (plan: ProcurementPlan) => {
    setSelectedPlan(plan);
    try {
      const [items, dev] = await Promise.all([
        procurementApi.getItems(plan.id),
        procurementApi.getDeviation(plan.id),
      ]);
      setPlanItems(items);
      setDeviation(dev);
    } catch (error) {
      console.error('加载计划详情失败:', error);
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      draft: '草稿',
      submitted: '已提交',
      approved: '已批准',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-neutral-100 text-neutral-600',
      submitted: 'bg-warning-100 text-warning-600',
      approved: 'bg-success-100 text-success-600',
    };
    return map[status] || 'bg-neutral-100 text-neutral-600';
  };

  const deviationOption = deviation ? {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
      textStyle: { color: '#4E5969' },
    },
    legend: {
      data: ['计划数量', '实际数量'],
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
      data: deviation.items.slice(0, 8).map(i => i.drugName),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 10, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C', fontSize: 11 },
    },
    series: [
      {
        name: '计划数量',
        type: 'bar',
        data: deviation.items.slice(0, 8).map(i => i.plannedQuantity),
        itemStyle: { color: '#165DFF', borderRadius: [4, 4, 0, 0] },
        barWidth: 12,
      },
      {
        name: '实际数量',
        type: 'bar',
        data: deviation.items.slice(0, 8).map(i => i.actualQuantity),
        itemStyle: { color: '#00B42A', borderRadius: [4, 4, 0, 0] },
        barWidth: 12,
      },
    ],
  } : {};

  const categoryOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        data: [
          { value: 35, name: '头孢菌素类', itemStyle: { color: '#165DFF' } },
          { value: 25, name: '喹诺酮类', itemStyle: { color: '#00B42A' } },
          { value: 15, name: '青霉素类', itemStyle: { color: '#FF7D00' } },
          { value: 12, name: '大环内酯类', itemStyle: { color: '#F53F3F' } },
          { value: 13, name: '其他', itemStyle: { color: '#722ED1' } },
        ],
        label: { show: false },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-700">采购计划管理</h2>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500"
          >
            {[2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            上传采购计划
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-neutral-500 mb-1">采购计划总数</div>
          <div className="text-2xl font-bold text-neutral-700">{total}</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
          <div className="text-sm text-primary-600 mb-1">异常偏差数</div>
          <div className="text-2xl font-bold text-primary-600">
            {deviation?.abnormalItems || 12}
          </div>
        </div>
        <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
          <div className="text-sm text-warning-600 mb-1">待审核计划</div>
          <div className="text-2xl font-bold text-warning-600">
            {plans.filter(p => p.status === 'submitted').length}
          </div>
        </div>
        <div className="bg-success-50 rounded-lg p-4 border border-success-200">
          <div className="text-sm text-success-600 mb-1">已执行计划</div>
          <div className="text-2xl font-bold text-success-600">
            {plans.filter(p => p.status === 'approved').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              采购计划列表
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">医院名称</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">年度</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">药品数</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">总金额</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">状态</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className={`border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${
                    selectedPlan?.id === plan.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => loadPlanDetail(plan)}
                >
                  <td className="px-4 py-3 text-sm text-neutral-700">{plan.hospitalName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{plan.year}年</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{plan.itemCount}种</td>
                  <td className="px-4 py-3 text-sm text-neutral-700 font-medium">
                    ¥{plan.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {getStatusText(plan.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1">
                      查看
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h3 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              偏差预警提示
            </h3>
            <div className="space-y-2">
              {[
                { drug: '头孢曲松', deviation: 18.5, hospital: '北京第一人民医院' },
                { drug: '左氧氟沙星', deviation: -22.3, hospital: '上海中心医院' },
                { drug: '万古霉素', deviation: 16.7, hospital: '广东协和医院' },
                { drug: '美罗培南', deviation: -18.2, hospital: '四川华西医院' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-danger-50 rounded-lg">
                  <div>
                    <div className="text-sm text-neutral-700">{item.drug}</div>
                    <div className="text-xs text-neutral-400">{item.hospital}</div>
                  </div>
                  <span className={`text-sm font-semibold ${item.deviation > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                    {item.deviation > 0 ? '+' : ''}{item.deviation}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-5">
            <h3 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              药物类别占比
            </h3>
            <ReactECharts option={categoryOption} style={{ height: '180px' }} />
          </div>
        </div>
      </div>

      {selectedPlan && deviation && (
        <div className="bg-white rounded-lg shadow-card p-5">
          <h3 className="font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            {selectedPlan.hospitalName} - 偏差分析
          </h3>
          <ReactECharts option={deviationOption} style={{ height: '300px' }} />

          <div className="mt-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">异常药品明细</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left px-3 py-2 text-neutral-500 font-medium">药品名称</th>
                    <th className="text-left px-3 py-2 text-neutral-500 font-medium">类别</th>
                    <th className="text-right px-3 py-2 text-neutral-500 font-medium">计划数量</th>
                    <th className="text-right px-3 py-2 text-neutral-500 font-medium">实际数量</th>
                    <th className="text-right px-3 py-2 text-neutral-500 font-medium">偏差率</th>
                  </tr>
                </thead>
                <tbody>
                  {planItems.slice(0, 5).map((item) => (
                    <tr key={item.id} className="border-b border-neutral-100">
                      <td className="px-3 py-2 text-neutral-700">{item.drugName}</td>
                      <td className="px-3 py-2 text-neutral-500">{item.category}</td>
                      <td className="px-3 py-2 text-right text-neutral-600">{item.plannedQuantity}</td>
                      <td className="px-3 py-2 text-right text-neutral-600">{item.actualQuantity}</td>
                      <td className={`px-3 py-2 text-right font-medium ${
                        Math.abs(item.deviation) > 15
                          ? item.deviation > 0 ? 'text-danger-500' : 'text-warning-500'
                          : 'text-success-500'
                      }`}>
                        {item.deviation > 0 ? '+' : ''}{item.deviation.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] p-6">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">上传采购计划</h3>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center mb-4 hover:border-primary-400 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-600 mb-1">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-neutral-400">支持 .xlsx, .xls 格式</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-primary-500 hover:text-primary-600 flex items-center gap-1">
                <Download className="w-4 h-4" />
                下载模板
              </a>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
