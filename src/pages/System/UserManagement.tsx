import { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Shield } from 'lucide-react';

const mockUsers = [
  { id: '1', username: 'admin', name: '国家级管理员', role: 'national', level: '国家级', status: 'active' },
  { id: '2', username: 'province_beijing', name: '北京市管理员', role: 'provincial', level: '省级', province: '北京市', status: 'active' },
  { id: '3', username: 'hospital_001', name: '北京第一人民医院管理员', role: 'hospital_admin', level: '医院级', hospital: '北京第一人民医院', status: 'active' },
  { id: '4', username: 'infection_001', name: '院感科张主任', role: 'infection_control', level: '医院级', hospital: '北京第一人民医院', status: 'active' },
  { id: '5', username: 'pharmacy_001', name: '药剂科李主任', role: 'pharmacy', level: '医院级', hospital: '北京第一人民医院', status: 'active' },
  { id: '6', username: 'dept_001', name: '外科王主任', role: 'department', level: '科室级', hospital: '北京第一人民医院', department: '外科', status: 'active' },
];

const roleMap: Record<string, string> = {
  national: '国家级管理员',
  provincial: '省级管理员',
  municipal: '市级管理员',
  hospital_admin: '医院管理员',
  infection_control: '院感科主任',
  pharmacy: '药剂科主任',
  department: '科室主任',
};

export default function UserManagement() {
  const [users] = useState(mockUsers);
  const [searchText, setSearchText] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-700">用户管理</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增用户
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索用户名/姓名"
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm w-64 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500">
            <option value="">全部角色</option>
            {Object.entries(roleMap).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">用户名</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">姓名</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">角色</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">级别</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">所属单位</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">状态</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 text-sm text-neutral-700">{user.username}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{user.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs">
                    <Shield className="w-3 h-3" />
                    {roleMap[user.role] || user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{user.level}</td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {(user as any).hospital || (user as any).province || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-50 text-success-600 rounded text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    正常
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-primary-500 hover:text-primary-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-danger-500 hover:text-danger-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
