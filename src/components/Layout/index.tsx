import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  User,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    path: '/dashboard',
    label: '核心看板',
    icon: LayoutDashboard,
  },
  {
    path: '/warnings',
    label: '预警中心',
    icon: AlertTriangle,
  },
  {
    path: '/procurement',
    label: '采购计划',
    icon: FileText,
  },
  {
    path: '/reports',
    label: '报告中心',
    icon: BarChart3,
  },
  {
    path: '/system',
    label: '系统管理',
    icon: Settings,
    submenu: [
      { path: '/system/users', label: '用户管理' },
      { path: '/system/hospitals', label: '医院管理' },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [systemOpen, setSystemOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    const roleMap: Record<string, string> = {
      national: '国家级管理员',
      provincial: '省级管理员',
      municipal: '市级管理员',
      hospital_admin: '医院管理员',
      infection_control: '院感科主任',
      pharmacy: '药剂科主任',
      department: '科室主任',
    };
    return roleMap[role || ''] || '未知角色';
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-neutral-700">院感监测平台</span>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.path}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setSystemOpen(!systemOpen)}
                    className="w-full flex items-center justify-between px-6 py-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        systemOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {systemOpen && (
                    <div className="bg-neutral-50">
                      {item.submenu.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            cn(
                              'block pl-14 pr-6 py-2 text-sm transition-colors',
                              isActive
                                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-500'
                                : 'text-neutral-500 hover:text-neutral-700',
                            )
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-6 py-3 transition-colors',
                      isActive
                        ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-500'
                        : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-600',
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-4">
          <div className="text-xs text-neutral-400">v1.0.0</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
          <div className="text-neutral-600">
            欢迎使用全国医院感染监测与抗菌药物使用分析平台
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-neutral-500 hover:text-primary-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-neutral-700">
                    {user?.name || '用户'}
                  </div>
                  <div className="text-xs text-neutral-400">{getRoleLabel(user?.role)}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-danger-50 hover:text-danger-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
