'use client';

import React, { useState } from 'react';
import { Plus, ShieldAlert, Star, PhoneOff, PhoneForwarded, Search, Trash2 } from 'lucide-react';
import { INITIAL_SPECIAL_NUMBERS, SpecialNumberItem } from '@/lib/routing-data';

export function SpecialNumberView() {
  const [numbers, setNumbers] = useState<SpecialNumberItem[]>(INITIAL_SPECIAL_NUMBERS);
  const [activeTab, setActiveTab] = useState<'Tất cả' | 'VIP' | 'Blacklist' | 'Ưu tiên khẩn cấp'>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNum, setNewNum] = useState({ phoneNumber: '', customerName: '', type: 'VIP' as const, routingRule: 'Định tuyến ngay tới 9003 - VIP_Direct', note: '' });

  const filtered = numbers.filter(item => {
    const matchTab = activeTab === 'Tất cả' || item.type === activeTab;
    const matchSearch = item.phoneNumber.includes(searchTerm) || item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNum.phoneNumber) return;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const added: SpecialNumberItem = {
      id: `sp-${Date.now()}`,
      phoneNumber: newNum.phoneNumber,
      customerName: newNum.customerName || 'Khách hàng đặc biệt',
      type: newNum.type,
      routingRule: newNum.routingRule,
      note: newNum.note,
      addedDate: dateStr
    };
    setNumbers(prev => [added, ...prev]);
    setIsModalOpen(false);
    setNewNum({ phoneNumber: '', customerName: '', type: 'VIP', routingRule: 'Định tuyến ngay tới 9003 - VIP_Direct', note: '' });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#f25621] uppercase tracking-wide">
              QUẢN LÝ TẬP SỐ ĐẶC BIỆT
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Định tuyến riêng cho danh sách số VIP, số khẩn cấp hoặc chặn danh sách đen (Blacklist)
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm số đặc biệt</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {(['Tất cả', 'VIP', 'Blacklist', 'Ưu tiên khẩn cấp'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-20">Hành động</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Khách hàng / Đơn vị</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Quy tắc định tuyến áp dụng</th>
                <th className="py-3 px-4">Ghi chú</th>
                <th className="py-3 px-4">Ngày thêm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors text-slate-600">
                  <td className="py-2.5 px-4">
                    <button 
                      onClick={() => setNumbers(prev => prev.filter(x => x.id !== item.id))}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{item.phoneNumber}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{item.customerName}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      item.type === 'VIP' ? 'bg-amber-100 text-amber-800' :
                      item.type === 'Blacklist' ? 'bg-rose-100 text-rose-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type === 'VIP' && <Star className="w-3 h-3 text-amber-600 fill-amber-500" />}
                      {item.type === 'Blacklist' && <PhoneOff className="w-3 h-3 text-rose-600" />}
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-indigo-700">{item.routingRule}</td>
                  <td className="py-2.5 px-4 text-slate-500">{item.note}</td>
                  <td className="py-2.5 px-4">{item.addedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Thêm số điện thoại đặc biệt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  placeholder="VD: 0909123456"
                  value={newNum.phoneNumber}
                  onChange={(e) => setNewNum(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                  className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên khách hàng / Tổ chức</label>
                <input
                  type="text"
                  placeholder="VD: Tập đoàn ABC"
                  value={newNum.customerName}
                  onChange={(e) => setNewNum(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phân loại</label>
                <select
                  value={newNum.type}
                  onChange={(e) => setNewNum(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                >
                  <option value="VIP">VIP (Khách hàng ưu tiên cao cấp)</option>
                  <option value="Blacklist">Blacklist (Chặn cuộc gọi làm phiền)</option>
                  <option value="Ưu tiên khẩn cấp">Ưu tiên khẩn cấp</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quy tắc xử lý cuộc gọi</label>
                <input
                  type="text"
                  value={newNum.routingRule}
                  onChange={(e) => setNewNum(prev => ({ ...prev, routingRule: e.target.value }))}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Lý do thêm vào danh sách"
                  value={newNum.note}
                  onChange={(e) => setNewNum(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
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
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
