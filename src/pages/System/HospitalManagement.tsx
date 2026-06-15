import { useState } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';

const mockHospitals = [
  { id: '1', name: '北京第一人民医院', level: '三级甲等', province: '北京市', city: '北京市', type: '综合医院', status: 'active' },
  { id: '2', name: '北京协和医院', level: '三级甲等', province: '北京市', city: '北京市', type: '综合医院', status: 'active' },
  { id: '3', name: '上海第一人民医院', level: '三级甲等', province: '上海市', city: '上海市', type: '综合医院', status: 'active' },
  { id: '4', name: '广东人民医院', level: '三级甲等', province: '广东省', city: '广州市', type: '综合医院', status: 'active' },
  { id: '5', name: '四川华西医院', level: '三级甲等', province: '四川省', city: '成都市', type: '综合医院', status: 'active' },
  { id: '6', name: '浙江第一医院', level: '三级乙等', province: '浙江省', city: '杭州市', type: '综合医院', status: 'active' },
];

export default function HospitalManagement() {
  const [hospitals] = useState(mockHospitals);
  const [searchText, setSearchText] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-700">医院管理</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增医院
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
              placeholder="搜索医院名称"
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm w-64 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500">
            <option value="">全部等级</option>
            <option value="tertiary">三级医院</option>
            <option value="secondary">二级医院</option>
            <option value="primary">一级医院</option>
          </select>
          <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500">
            <option value="">全部省份</option>
            <option value="beijing">北京市</option>
            <option value="shanghai">上海市</option>
            <option value="guangdong">广东省</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">医院名称</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">等级</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">类型</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">所在地区</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">状态</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital) => (
              <tr key={hospital.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary-500" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{hospital.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs">
                    {hospital.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{hospital.type}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-sm text-neutral-600">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {hospital.province} {hospital.city}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-50 text-success-600 rounded text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    正常接入
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
