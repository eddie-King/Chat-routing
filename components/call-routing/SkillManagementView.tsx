'use client';

import React, { useState } from 'react';
import { Plus, Search, RotateCcw, Award, CheckCircle, XCircle, Pencil, Trash2, Check } from 'lucide-react';
import { INITIAL_SKILLS, SkillItem } from '@/lib/routing-data';

export function SkillManagementView() {
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ code: '', name: '', category: 'Nghiệp vụ', levelRange: 'Cấp 1 - 5' });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSkills = skills.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'Tất cả' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.code || !newSkill.name) return;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const added: SkillItem = {
      id: `sk-${Date.now()}`,
      code: newSkill.code.toUpperCase(),
      name: newSkill.name,
      category: newSkill.category,
      levelRange: newSkill.levelRange,
      agentCount: 0,
      status: 'Kích hoạt',
      updatedAt: dateStr
    };
    setSkills(prev => [added, ...prev]);
    setIsModalOpen(false);
    setNewSkill({ code: '', name: '', category: 'Nghiệp vụ', levelRange: 'Cấp 1 - 5' });
    showToast(`Đã thêm kỹ năng mới: ${added.name}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#f25621] uppercase tracking-wide">
              QUẢN LÝ KỸ NĂNG (SKILL MANAGEMENT)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh mục kỹ năng gán cho Agent để phục vụ thuật toán Skill-based Routing
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm kỹ năng mới</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã kỹ năng, tên kỹ năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded px-3 py-2 pl-8 focus:outline-none focus:border-slate-400 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer"
            >
              <option value="Tất cả">Phân loại: Tất cả</option>
              <option value="Ngôn ngữ">Ngôn ngữ</option>
              <option value="Nghiệp vụ">Nghiệp vụ</option>
              <option value="Kỹ thuật">Kỹ thuật</option>
              <option value="Kinh doanh">Kinh doanh</option>
            </select>
          </div>

          <button
            onClick={() => { setSearchTerm(''); setCategoryFilter('Tất cả'); }}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-24">Hoạt động</th>
                <th className="py-3 px-4">Mã kỹ năng</th>
                <th className="py-3 px-4">Tên kỹ năng</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Khung cấp độ</th>
                <th className="py-3 px-4">Số Agent sở hữu</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSkills.map(sk => (
                <tr key={sk.id} className="hover:bg-slate-50/70 transition-colors text-slate-600">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded" title="Chỉnh sửa">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setSkills(prev => prev.filter(x => x.id !== sk.id))}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" 
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">{sk.code}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{sk.name}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {sk.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">{sk.levelRange}</td>
                  <td className="py-2.5 px-4 font-semibold text-blue-600">{sk.agentCount} nhân sự</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {sk.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{sk.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Thêm kỹ năng tổng đài mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddSkill} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã kỹ năng (Code) *</label>
                <input
                  type="text"
                  placeholder="VD: SK_BILLING_VN"
                  value={newSkill.code}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, code: e.target.value }))}
                  required
                  className="w-full border border-slate-300 rounded p-2 text-xs uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên kỹ năng *</label>
                <input
                  type="text"
                  placeholder="VD: Nghiệp vụ Đối soát Cước & Hoàn tiền"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                  >
                    <option value="Nghiệp vụ">Nghiệp vụ</option>
                    <option value="Kỹ thuật">Kỹ thuật</option>
                    <option value="Ngôn ngữ">Ngôn ngữ</option>
                    <option value="Kinh doanh">Kinh doanh</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khung cấp độ</label>
                  <select
                    value={newSkill.levelRange}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, levelRange: e.target.value }))}
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                  >
                    <option value="Cấp 1 - 5">Cấp 1 - 5</option>
                    <option value="Cấp 1 - 3">Cấp 1 - 3</option>
                    <option value="Đạt / Không đạt">Đạt / Không đạt</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f25621] text-white rounded hover:bg-[#e04815] font-medium"
                >
                  Lưu kỹ năng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
