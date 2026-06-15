import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { username: 'admin', name: '国家级管理员', desc: '查看全国数据' },
    { username: 'province', name: '省级管理员', desc: '查看本省数据' },
    { username: 'hospital', name: '医院管理员', desc: '查看本院数据' },
    { username: 'infection', name: '院感科主任', desc: '处理预警审批' },
    { username: 'pharmacy', name: '药剂科主任', desc: '管理采购计划' },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Shield className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">全国医院感染监测平台</h1>
              <p className="text-primary-100 mt-1">Hospital Infection Monitoring System</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">实时监测·智能预警·科学决策</h2>
          <p className="text-primary-100 leading-relaxed">
            接入全国各级医院感染病例、抗菌药物使用及细菌培养数据，
            通过智能分析与预警机制，辅助院感管理决策，
            提升抗菌药物合理使用水平。
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">31</div>
              <div className="text-primary-200 text-sm mt-1">覆盖省份</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">2000+</div>
              <div className="text-primary-200 text-sm mt-1">接入医院</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">实时</div>
              <div className="text-primary-200 text-sm mt-1">数据更新</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[480px] bg-white flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-neutral-700 mb-2">欢迎登录</h2>
          <p className="text-neutral-400 mb-8">请输入您的账号信息</p>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger-500 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-2">账号</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-50 transition-colors"
                  placeholder="请输入账号"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-500 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-50 transition-colors"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-500">
                <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                记住我
              </label>
              <a href="#" className="text-primary-500 hover:text-primary-600">忘记密码？</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 bg-primary-500 text-white rounded-lg font-medium',
                'hover:bg-primary-600 active:bg-primary-700 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {isLoading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-neutral-400 mb-3">测试账号（任意密码均可登录）：</p>
            <div className="space-y-2">
              {testAccounts.map((account) => (
                <button
                  key={account.username}
                  onClick={() => setUsername(account.username)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border text-left',
                    'transition-all hover:border-primary-300 hover:bg-primary-50',
                    username === account.username
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200',
                  )}
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-700">{account.name}</div>
                    <div className="text-xs text-neutral-400">{account.desc}</div>
                  </div>
                  <span className="text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded">
                    {account.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
