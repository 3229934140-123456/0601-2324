import { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp, TrendingDown, Download, Plus, ChevronRight, BarChart3, Activity, Pill } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { reportsApi } from '@/api';
import type { Report, ReportDetail, ReportType } from '@shared/types';
import { cn } from '@/lib/utils';

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState<ReportType | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    loadReports();
  }, [type]);

  const loadReports = async () => {
    try {
      const result = await reportsApi.getList({ type, page: 1, size: 10 });
      setReports(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('加载报告列表失败:', error);
    }
  };

  const loadReportDetail = async (report: Report) => {
    try {
      const detail = await reportsApi.getDetail(report.id);
      setSelectedReport(detail);
    } catch (error) {
      console.error('加载报告详情失败:', error);
    }
  };

  const getTypeText = (type: ReportType) => {
    const map = {
      weekly: '周报',
      monthly: '月报',
      yearly: '年报',
    };
    return map[type];
  };

  const getTypeColor = (type: ReportType) => {
    const map = {
      weekly: 'bg-primary-100 text-primary-600',
      monthly: 'bg-success-100 text-success-600',
      yearly: 'bg-warning-100 text-warning-600',
    };
    return map[type];
  };

  const trendOption = selectedReport ? {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: selectedReport.content.infectionTrend.map(d => d.date),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '感染率(%)',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C', fontSize: 11 },
    },
    series: [
      {
        name: '感染发生率',
        type: 'line',
        smooth: true,
        data: selectedReport.content.infectionTrend.map(d => d.value),
        lineStyle: { color: '#165DFF', width: 2 },
        itemStyle: { color: '#165DFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.2)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.02)' },
            ],
          },
        },
      },
    ],
  } : {};

  const drugRankingOption = selectedReport ? {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
    },
    grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: selectedReport.content.drugRanking.map(d => d.name),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#4E5969', fontSize: 11 },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: selectedReport.content.drugRanking.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: i === 0 ? '#F53F3F' : i === 1 ? '#FF7D00' : i === 2 ? '#FFC743' : '#165DFF',
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 16,
      },
    ],
  } : {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-700">报告中心</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            <button
              onClick={() => setType(undefined)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                !type ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              全部
            </button>
            <button
              onClick={() => setType('weekly')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                type === 'weekly' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              周报
            </button>
            <button
              onClick={() => setType('monthly')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                type === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              月报
            </button>
            <button
              onClick={() => setType('yearly')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                type === 'yearly' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              年报
            </button>
          </div>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            生成报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-neutral-500 mb-1">报告总数</div>
          <div className="text-2xl font-bold text-neutral-700">{total}</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
          <div className="text-sm text-primary-600 mb-1">本周周报</div>
          <div className="text-2xl font-bold text-primary-600">
            {reports.filter(r => r.type === 'weekly').length}
          </div>
        </div>
        <div className="bg-success-50 rounded-lg p-4 border border-success-200">
          <div className="text-sm text-success-600 mb-1">本月月报</div>
          <div className="text-2xl font-bold text-success-600">
            {reports.filter(r => r.type === 'monthly').length}
          </div>
        </div>
        <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
          <div className="text-sm text-warning-600 mb-1">本年报告</div>
          <div className="text-2xl font-bold text-warning-600">
            {reports.filter(r => r.type === 'yearly').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => loadReportDetail(report)}
              className={cn(
                'bg-white rounded-lg shadow-card p-4 cursor-pointer transition-all hover:shadow-card-hover',
                selectedReport?.id === report.id && 'ring-2 ring-primary-500',
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-700">{report.period}</div>
                    <div className="text-xs text-neutral-400">{report.hospitalName}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(report.type)}`}>
                  {getTypeText(report.type)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-neutral-50 rounded p-2">
                  <div className="text-xs text-neutral-400">感染率</div>
                  <div className="text-base font-semibold text-neutral-700">
                    {report.summary.infectionRate.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-neutral-50 rounded p-2">
                  <div className="text-xs text-neutral-400">达标率</div>
                  <div className="text-base font-semibold text-success-500">
                    {report.summary.drugSusceptibilityRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.generatedAt).toLocaleDateString()}
                </span>
                <button className="text-primary-500 text-xs flex items-center gap-1 hover:text-primary-600">
                  查看详情
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedReport ? (
            <div className="bg-white rounded-lg shadow-card p-5 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-700">
                    {selectedReport.period}院感诊断报告
                  </h3>
                  <p className="text-sm text-neutral-400">{selectedReport.hospitalName}</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors">
                  <Download className="w-4 h-4" />
                  下载报告
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-primary-600 mb-2">
                    <Activity className="w-4 h-4" />
                    感染发生率
                  </div>
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {selectedReport.summary.infectionRate.toFixed(2)}%
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    selectedReport.summary.infectionRateYoY > 0 ? 'text-danger-500' : 'text-success-500'
                  }`}>
                    {selectedReport.summary.infectionRateYoY > 0
                      ? <TrendingUp className="w-3 h-3" />
                      : <TrendingDown className="w-3 h-3" />
                    }
                    同比 {selectedReport.summary.infectionRateYoY > 0 ? '+' : ''}
                    {selectedReport.summary.infectionRateYoY.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-success-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-success-600 mb-2">
                    <Pill className="w-4 h-4" />
                    药敏达标率
                  </div>
                  <div className="text-2xl font-bold text-success-600 mb-1">
                    {selectedReport.summary.drugSusceptibilityRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-success-500">高于全国平均水平</div>
                </div>
                <div className="bg-warning-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-warning-600 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    使用强度
                  </div>
                  <div className="text-2xl font-bold text-warning-600 mb-1">
                    {selectedReport.summary.usageIntensity.toFixed(1)} DDDs
                  </div>
                  <div className="text-xs text-warning-500">需关注重点药物</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium text-neutral-700 mb-3">感染趋势分析</h4>
                  <ReactECharts option={trendOption} style={{ height: '200px' }} />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-700 mb-3">药物使用排名</h4>
                  <ReactECharts option={drugRankingOption} style={{ height: '200px' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary-500" />
                    优化用药策略建议
                  </h4>
                  <ul className="space-y-2">
                    {selectedReport.content.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                        <span className="text-primary-500 mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-warning-50 rounded-lg p-4">
                  <h4 className="font-medium text-warning-700 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    培训重点推荐
                  </h4>
                  <ul className="space-y-2">
                    {selectedReport.content.trainingFocus.map((focus, idx) => (
                      <li key={idx} className="text-sm text-warning-700 flex items-start gap-2">
                        <span className="text-warning-500 mt-0.5">•</span>
                        {focus}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card p-12 h-full flex flex-col items-center justify-center text-neutral-400">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p>请选择左侧报告查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[450px] p-6">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">生成报告</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-2">报告类型</label>
                <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                  <option value="weekly">周报告</option>
                  <option value="monthly">月报告</option>
                  <option value="yearly">年报告</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-2">报告周期</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowGenerate(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowGenerate(false)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
              >
                生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
