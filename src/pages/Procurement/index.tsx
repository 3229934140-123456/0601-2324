import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, AlertTriangle, TrendingUp, ChevronRight, X, CheckCircle, XCircle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';
import { procurementApi, dashboardApi } from '@/api';
import type { ProcurementPlan, ProcurementItem, DeviationAnalysis, Hospital } from '@shared/types';
import { useAuthStore } from '@/store/auth';

export default function Procurement() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [year, setYear] = useState(2024);
  const [selectedPlan, setSelectedPlan] = useState<ProcurementPlan | null>(null);
  const [planItems, setPlanItems] = useState<ProcurementItem[]>([]);
  const [deviation, setDeviation] = useState<DeviationAnalysis | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<Array<{ drugName: string; category: string; plannedQuantity: number }>>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPlans();
    loadHospitals();
  }, [year]);

  const loadHospitals = async () => {
    try {
      const data = await dashboardApi.getHospitals();
      setHospitals(data);
      if (data.length > 0 && user?.hospitalId) {
        setSelectedHospitalId(user.hospitalId);
      } else if (data.length > 0) {
        setSelectedHospitalId(data[0].id);
      }
    } catch (error) {
      console.error('加载医院列表失败:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const result = await procurementApi.getList({ year, page: 1, size: 10 });
      setPlans(result.list);
      setTotal(result.total);
      if (result.list.length > 0) {
        loadPlanDetail(result.list[0]);
      }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    parseExcel(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请上传 Excel 文件（.xlsx 或 .xls 格式）');
      return;
    }
    setUploadFile(file);
    parseExcel(file);
  };

  const parseExcel = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>;

      const items = jsonData
        .filter(row => row['药品名称'] || row['drugName'])
        .map(row => ({
          drugName: String(row['药品名称'] || row['drugName'] || ''),
          category: String(row['类别'] || row['category'] || '其他'),
          plannedQuantity: parseFloat(String(row['计划数量'] || row['plannedQuantity'] || '0')),
        }))
        .filter(item => item.drugName && item.plannedQuantity > 0);

      setParsedItems(items);
    } catch (error) {
      console.error('解析 Excel 失败:', error);
      alert('Excel 解析失败，请检查文件格式');
    }
  };

  const handleUpload = async () => {
    if (parsedItems.length === 0 || !selectedHospitalId) {
      alert('请选择医院并确保 Excel 文件中有有效数据');
      return;
    }

    setUploading(true);
    try {
      const hospital = hospitals.find(h => h.id === selectedHospitalId);
      const result = await procurementApi.uploadPlan({
        hospitalId: selectedHospitalId,
        hospitalName: hospital?.name || '',
        year,
        items: parsedItems,
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setShowUpload(false);
        setUploadSuccess(false);
        setUploadFile(null);
        setParsedItems([]);
        loadPlans();
      }, 1500);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = () => {
    setShowUpload(true);
    setUploadFile(null);
    setParsedItems([]);
    setUploadSuccess(false);
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

  const abnormalItems = planItems.filter(item => Math.abs(item.deviation) > 15);

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
        data: planItems.length > 0
          ? (() => {
              const catMap: Record<string, number> = {};
              planItems.forEach(item => {
                catMap[item.category] = (catMap[item.category] || 0) + item.plannedQuantity;
              });
              return Object.entries(catMap).map(([name, value]) => ({ name, value }));
            })()
          : [
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
            onClick={openUploadModal}
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
          <div className="text-sm text-primary-600 mb-1">异常偏差药品</div>
          <div className="text-2xl font-bold text-primary-600">
            {deviation?.abnormalItems || 0}
          </div>
        </div>
        <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
          <div className="text-sm text-warning-600 mb-1">待审核计划</div>
          <div className="text-2xl font-bold text-warning-600">
            {plans.filter(p => p.status === 'submitted').length}
          </div>
        </div>
        <div className="bg-success-50 rounded-lg p-4 border border-success-200">
          <div className="text-sm text-success-600 mb-1">已批准计划</div>
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
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {abnormalItems.length > 0 ? (
                abnormalItems.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-danger-50 rounded-lg">
                    <div>
                      <div className="text-sm text-neutral-700">{item.drugName}</div>
                      <div className="text-xs text-neutral-400">{item.category}</div>
                    </div>
                    <span className={`text-sm font-semibold ${item.deviation > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                      {item.deviation > 0 ? '+' : ''}{item.deviation.toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-neutral-400">
                  暂无异常偏差数据
                </div>
              )}
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
            <h4 className="text-sm font-medium text-neutral-700 mb-2">异常药品明细（偏差超过 15%）</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left px-3 py-2 text-neutral-500 font-medium">药品名称</th>
                    <th className="text-left px-3 py-2 text-neutral-500 font-medium">类别</th>
                    <th className="text-right px-3 py-2 text-neutral-500 font-medium">计划数量</th>
                    <th className="text-right px-3 py-2 text-neutral-500 font-medium">实际数量</th>
                    <th className="text-right px-3 py-2 text-neutral-500 font-medium">偏差率</th>
                    <th className="text-center px-3 py-2 text-neutral-500 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {abnormalItems.slice(0, 10).map((item) => (
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
                      <td className="px-3 py-2 text-center">
                        {Math.abs(item.deviation) > 15 ? (
                          <span className="text-danger-500 text-xs">异常</span>
                        ) : (
                          <span className="text-success-500 text-xs">正常</span>
                        )}
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
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">上传采购计划</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-neutral-700">上传成功</p>
                <p className="text-sm text-neutral-500 mt-2">
                  共导入 {parsedItems.length} 条药品数据
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">
                      选择医院
                    </label>
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    >
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-neutral-50"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                    {uploadFile ? (
                      <>
                        <p className="text-sm text-neutral-600 mb-1 font-medium">{uploadFile.name}</p>
                        <p className="text-xs text-success-500">已解析 {parsedItems.length} 条数据</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-neutral-600 mb-1">点击或拖拽文件到此处上传</p>
                        <p className="text-xs text-neutral-400">支持 .xlsx, .xls 格式</p>
                      </>
                    )}
                  </div>

                  {parsedItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-600">
                          药品明细（{parsedItems.length} 条）
                        </span>
                      </div>
                      <div className="border border-neutral-200 rounded-lg max-h-[200px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-neutral-50 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 text-neutral-500 font-medium text-xs">药品名称</th>
                              <th className="text-left px-3 py-2 text-neutral-500 font-medium text-xs">类别</th>
                              <th className="text-right px-3 py-2 text-neutral-500 font-medium text-xs">计划数量</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedItems.slice(0, 20).map((item, idx) => (
                              <tr key={idx} className="border-t border-neutral-100">
                                <td className="px-3 py-1.5 text-neutral-700">{item.drugName}</td>
                                <td className="px-3 py-1.5 text-neutral-500">{item.category}</td>
                                <td className="px-3 py-1.5 text-right text-neutral-600">{item.plannedQuantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <a
                      href="#"
                      className="text-primary-500 hover:text-primary-600 flex items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        const wb = XLSX.utils.book_new();
                        const wsData = [
                          ['药品名称', '类别', '计划数量'],
                          ['头孢曲松', '头孢菌素类', 1000],
                          ['左氧氟沙星', '喹诺酮类', 800],
                          ['万古霉素', '糖肽类', 200],
                        ];
                        const ws = XLSX.utils.aoa_to_sheet(wsData);
                        XLSX.utils.book_append_sheet(wb, ws, '采购计划');
                        XLSX.writeFile(wb, '采购计划模板.xlsx');
                      }}
                    >
                      <Download className="w-4 h-4" />
                      下载模板
                    </a>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-2">
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || parsedItems.length === 0}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? '上传中...' : '确认导入'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
