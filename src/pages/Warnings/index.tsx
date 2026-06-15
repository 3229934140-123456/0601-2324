import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight, Filter } from 'lucide-react';
import { warningsApi } from '@/api';
import type { Warning, WarningLevel, WarningStatus } from '@shared/types';
import { cn } from '@/lib/utils';
import WarningDetailModal from './WarningDetailModal';

export default function Warnings() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState<WarningLevel | undefined>(undefined);
  const [status, setStatus] = useState<WarningStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadWarnings();
  }, [level, status, page]);

  const loadWarnings = async () => {
    try {
      const result = await warningsApi.getList({ level, status, page, size: pageSize });
      setWarnings(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('加载预警列表失败:', error);
    }
  };

  const getLevelText = (level: WarningLevel) => {
    return level === 1 ? '一级预警' : '二级预警';
  };

  const getLevelColor = (level: WarningLevel) => {
    return level === 1 ? 'bg-warning-500' : 'bg-danger-500';
  };

  const getLevelBgColor = (level: WarningLevel) => {
    return level === 1 ? 'bg-warning-50 border-warning-200' : 'bg-danger-50 border-danger-200';
  };

  const getLevelTextColor = (level: WarningLevel) => {
    return level === 1 ? 'text-warning-600' : 'text-danger-600';
  };

  const getStatusText = (status: WarningStatus) => {
    const map = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
    };
    return map[status];
  };

  const getStatusIcon = (status: WarningStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />;
      case 'processing':
        return <AlertTriangle className="w-4 h-4 text-primary-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleViewDetail = (warning: Warning) => {
    setSelectedWarning(warning);
    setShowDetail(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-700">预警中心</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <Filter className="w-4 h-4" />
            筛选：
          </div>
          <select
            value={level || ''}
            onChange={(e) => {
              setLevel(e.target.value ? (parseInt(e.target.value) as WarningLevel) : undefined);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500"
          >
            <option value="">全部级别</option>
            <option value="1">一级预警</option>
            <option value="2">二级预警</option>
          </select>
          <select
            value={status || ''}
            onChange={(e) => {
              setStatus(e.target.value as WarningStatus || undefined);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500"
          >
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="resolved">已解决</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-neutral-500 mb-1">预警总数</div>
          <div className="text-2xl font-bold text-neutral-700">{total}</div>
        </div>
        <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
          <div className="text-sm text-warning-600 mb-1">一级预警</div>
          <div className="text-2xl font-bold text-warning-600">
            {warnings.filter(w => w.level === 1).length || '...'}
          </div>
        </div>
        <div className="bg-danger-50 rounded-lg p-4 border border-danger-200">
          <div className="text-sm text-danger-600 mb-1">二级预警</div>
          <div className="text-2xl font-bold text-danger-600">
            {warnings.filter(w => w.level === 2).length || '...'}
          </div>
        </div>
        <div className="bg-success-50 rounded-lg p-4 border border-success-200">
          <div className="text-sm text-success-600 mb-1">已解决</div>
          <div className="text-2xl font-bold text-success-600">
            {warnings.filter(w => w.status === 'resolved').length || '...'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">预警级别</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">类型</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">医院/科室</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">预警值</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">阈值</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">触发时间</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">状态</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {warnings.map((warning) => (
              <tr
                key={warning.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                      getLevelBgColor(warning.level),
                      getLevelTextColor(warning.level),
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', getLevelColor(warning.level))} />
                    {getLevelText(warning.level)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {warning.type === 'infection' ? '感染率' : '使用强度'}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-neutral-700">{warning.hospitalName}</div>
                  {warning.departmentName && (
                    <div className="text-xs text-neutral-400">{warning.departmentName}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-danger-500">
                  {warning.actualValue.toFixed(2)}
                  {warning.type === 'infection' ? '%' : ' DDDs'}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {warning.thresholdValue.toFixed(2)}
                  {warning.type === 'infection' ? '%' : ' DDDs'}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {formatDate(warning.triggeredAt)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-sm">
                    {getStatusIcon(warning.status)}
                    <span className="text-neutral-600">{getStatusText(warning.status)}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleViewDetail(warning)}
                    className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
          <div className="text-sm text-neutral-500">
            共 {total} 条记录，第 {page} / {totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) {
                pageNum = page - 2 + i;
              }
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'w-8 h-8 text-sm rounded transition-colors',
                    page === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {showDetail && selectedWarning && (
        <WarningDetailModal
          warningId={selectedWarning.id}
          onClose={() => setShowDetail(false)}
          onUpdated={loadWarnings}
        />
      )}
    </div>
  );
}
