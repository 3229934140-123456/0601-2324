import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, User, FileText } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { warningsApi } from '@/api';
import type { WarningDetail, ApprovalRecord, ApprovalStep } from '@shared/types';
import { cn } from '@/lib/utils';

interface WarningDetailModalProps {
  warningId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function WarningDetailModal({ warningId, onClose, onUpdated }: WarningDetailModalProps) {
  const [detail, setDetail] = useState<WarningDetail | null>(null);
  const [rectificationPlan, setRectificationPlan] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [warningId]);

  const loadDetail = async () => {
    try {
      const data = await warningsApi.getDetail(warningId);
      setDetail(data);
      if (data.rectificationPlan) {
        setRectificationPlan(data.rectificationPlan);
      }
    } catch (error) {
      console.error('加载预警详情失败:', error);
    }
  };

  const getStepLabel = (step: ApprovalStep) => {
    const map = {
      department: '科室确认',
      infection_control: '院感科复核',
      health_commission: '卫健委批准',
    };
    return map[step];
  };

  const getStepIndex = (step: ApprovalStep) => {
    const steps: ApprovalStep[] = ['department', 'infection_control', 'health_commission'];
    return steps.indexOf(step);
  };

  const getCurrentStepIndex = () => {
    if (!detail || detail.status === 'resolved') return 3;
    if (detail.level === 1 && detail.status === 'processing') return 1;
    const pendingApproval = detail.approvals.find(a => a.status === 'pending');
    if (pendingApproval) {
      return getStepIndex(pendingApproval.step);
    }
    return 0;
  };

  const handleSubmitRectification = async () => {
    if (!rectificationPlan.trim()) return;
    setIsSubmitting(true);
    try {
      await warningsApi.submitRectification(warningId, rectificationPlan);
      await loadDetail();
      onUpdated();
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await warningsApi.review(warningId, approved, comment);
      await loadDetail();
      onUpdated();
      setComment('');
    } catch (error) {
      console.error('复核失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await warningsApi.approve(warningId, approved, comment);
      await loadDetail();
      onUpdated();
      setComment('');
    } catch (error) {
      console.error('审批失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const trendOption = detail ? {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: detail.historyData.map(d => d.date),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C', fontSize: 10 },
    },
    series: [
      {
        name: detail.type === 'infection' ? '感染率(%)' : '使用强度(DDDs)',
        type: 'line',
        smooth: true,
        data: detail.historyData.map(d => d.value),
        lineStyle: { color: detail.level === 1 ? '#FF7D00' : '#F53F3F', width: 2 },
        itemStyle: { color: detail.level === 1 ? '#FF7D00' : '#F53F3F' },
        markLine: {
          silent: true,
          lineStyle: { color: '#F53F3F', type: 'dashed' },
          data: [{ yAxis: detail.thresholdValue, name: '阈值' }],
        },
      },
    ],
  } : {};

  const steps: ApprovalStep[] = ['department', 'infection_control', 'health_commission'];
  const currentStep = getCurrentStepIndex();

  const canSubmitRectification = detail?.status === 'pending';
  const canReview = detail?.status === 'processing' && detail?.approvals.find(a => a.step === 'infection_control')?.status === 'pending';
  const canApprove = detail?.level === 2 && detail?.approvals.find(a => a.step === 'health_commission')?.status === 'pending';

  if (!detail) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[700px] max-h-[80vh] overflow-auto p-8">
          <div className="text-center text-neutral-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              detail.level === 1 ? 'bg-warning-100' : 'bg-danger-100',
            )}>
              <AlertTriangle className={cn(
                'w-5 h-5',
                detail.level === 1 ? 'text-warning-500' : 'text-danger-500',
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-700">预警详情</h3>
              <p className="text-sm text-neutral-400">
                {detail.hospitalName} - {detail.departmentName || '全院'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="text-sm text-neutral-500 mb-1">预警类型</div>
              <div className="text-lg font-semibold text-neutral-700">
                {detail.type === 'infection' ? '感染率超标' : '使用强度超标'}
              </div>
            </div>
            <div className={cn(
              'rounded-lg p-4',
              detail.level === 1 ? 'bg-warning-50' : 'bg-danger-50',
            )}>
              <div className={`text-sm mb-1 ${detail.level === 1 ? 'text-warning-600' : 'text-danger-600'}`}>
                当前值
              </div>
              <div className={`text-lg font-semibold ${detail.level === 1 ? 'text-warning-600' : 'text-danger-600'}`}>
                {detail.actualValue.toFixed(2)}
                {detail.type === 'infection' ? '%' : ' DDDs'}
              </div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="text-sm text-neutral-500 mb-1">预警阈值</div>
              <div className="text-lg font-semibold text-neutral-700">
                {detail.thresholdValue.toFixed(2)}
                {detail.type === 'infection' ? '%' : ' DDDs'}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              历史趋势
            </h4>
            <ReactECharts option={trendOption} style={{ height: '200px' }} />
          </div>

          <div>
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500" />
              三级审批流程
            </h4>
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const approval = detail.approvals.find(a => a.step === step);
                const isCompleted = approval && approval.status === 'approved';
                const isCurrent = index === currentStep && approval?.status === 'pending';
                const isRejected = approval?.status === 'rejected';

                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                          isCompleted && 'bg-success-500 border-success-500 text-white',
                          isRejected && 'bg-danger-500 border-danger-500 text-white',
                          isCurrent && 'border-primary-500 bg-white text-primary-500',
                          !isCompleted && !isRejected && !isCurrent && 'border-neutral-300 bg-white text-neutral-300',
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isRejected ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={cn(
                        'mt-2 text-xs',
                        isCompleted || isCurrent ? 'text-neutral-600' : 'text-neutral-400',
                      )}>
                        {getStepLabel(step)}
                      </span>
                      {approval && approval.status !== 'pending' && (
                        <span className="text-xs text-neutral-400 mt-1">
                          {approval.approverName}
                        </span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-16 h-0.5 mx-2',
                          isCompleted ? 'bg-success-500' : 'bg-neutral-200',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {detail.approvals.length > 0 && (
              <div className="space-y-2">
                {detail.approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className={cn(
                      'p-3 rounded-lg border',
                      approval.status === 'approved' && 'bg-success-50 border-success-200',
                      approval.status === 'rejected' && 'bg-danger-50 border-danger-200',
                      approval.status === 'pending' && 'bg-neutral-50 border-neutral-200',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700">
                        {getStepLabel(approval.step)}
                      </span>
                      <span className={cn(
                        'text-xs',
                        approval.status === 'approved' && 'text-success-600',
                        approval.status === 'rejected' && 'text-danger-600',
                        approval.status === 'pending' && 'text-neutral-500',
                      )}>
                        {approval.status === 'approved' && '已通过'}
                        {approval.status === 'rejected' && '已驳回'}
                        {approval.status === 'pending' && '待处理'}
                      </span>
                    </div>
                    {approval.comment && (
                      <p className="text-sm text-neutral-600">{approval.comment}</p>
                    )}
                    {approval.approverName && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-neutral-400">
                        <User className="w-3 h-3" />
                        {approval.approverName}
                        {approval.createdAt && ` · ${new Date(approval.createdAt).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {canSubmitRectification && (
            <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
              <h4 className="font-medium text-warning-700 mb-2">提交整改方案</h4>
              <textarea
                value={rectificationPlan}
                onChange={(e) => setRectificationPlan(e.target.value)}
                className="w-full p-3 border border-warning-200 rounded-lg text-sm resize-none focus:outline-none focus:border-warning-400"
                rows={4}
                placeholder="请输入整改方案..."
              />
              <button
                onClick={handleSubmitRectification}
                disabled={!rectificationPlan.trim() || isSubmitting}
                className="mt-3 px-4 py-2 bg-warning-500 text-white rounded-lg text-sm hover:bg-warning-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '提交中...' : '提交整改方案'}
              </button>
            </div>
          )}

          {canReview && (
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
              <h4 className="font-medium text-primary-700 mb-2">院感科复核</h4>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-primary-200 rounded-lg text-sm resize-none focus:outline-none focus:border-primary-400"
                rows={3}
                placeholder="请输入复核意见..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleReview(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600 transition-colors disabled:opacity-50"
                >
                  通过
                </button>
                <button
                  onClick={() => handleReview(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-danger-500 text-white rounded-lg text-sm hover:bg-danger-600 transition-colors disabled:opacity-50"
                >
                  驳回
                </button>
              </div>
            </div>
          )}

          {canApprove && (
            <div className="bg-success-50 rounded-lg p-4 border border-success-200">
              <h4 className="font-medium text-success-700 mb-2">卫健委批准</h4>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-success-200 rounded-lg text-sm resize-none focus:outline-none focus:border-success-400"
                rows={3}
                placeholder="请输入批准意见..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600 transition-colors disabled:opacity-50"
                >
                  批准
                </button>
                <button
                  onClick={() => handleApprove(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-danger-500 text-white rounded-lg text-sm hover:bg-danger-600 transition-colors disabled:opacity-50"
                >
                  驳回
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
