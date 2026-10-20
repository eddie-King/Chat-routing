'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  PhoneCall, 
  MessageSquare, 
  Upload, 
  Trash2, 
  Users, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { 
  CustomerItem, 
  CustomerGroupItem, 
  ExternalMemberItem,
  INITIAL_CUSTOMERS 
} from '@/lib/customer-group-data';

interface CustomerGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: CustomerGroupItem | null;
  onSaveMembers: (groupId: string, customerIds: string[], externalMembers?: ExternalMemberItem[]) => void;
  allCustomers?: CustomerItem[];
}

interface InnerProps {
  onClose: () => void;
  group: CustomerGroupItem;
  onSaveMembers: (groupId: string, customerIds: string[], externalMembers?: ExternalMemberItem[]) => void;
  allCustomers: CustomerItem[];
}

// Helper render tag màu cho từng phân hạng khách hàng
function renderTierTag(tier?: string) {
  switch (tier) {
    case 'Kim cương':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          Kim cương
        </span>
      );
    case 'Vàng':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
          Vàng
        </span>
      );
    case 'Bạc':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          Bạc
        </span>
      );
    case 'Đồng':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
          Đồng
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {tier || 'Tiêu chuẩn'}
        </span>
      );
  }
}

function CustomerGroupMemberModalInner({
  onClose,
  group,
  onSaveMembers,
  allCustomers
}: InnerProps) {
  // Navigation Tabs: Khách hàng trong hệ thống VS Import thủ công
  const [modalTab, setModalTab] = useState<'internal' | 'external'>('internal');

  // Internal customers selection state
  const [selectedIds, setSelectedIds] = useState<string[]>(() => group.customerIds || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'selected' | 'unselected'>('all');

  // External / Manual customers import state
  const [externalMembers, setExternalMembers] = useState<ExternalMemberItem[]>(
    () => group.externalMembers || []
  );

  // Manual input fields for Tab 2
  const [manualPhone, setManualPhone] = useState('');
  const [manualSenderId, setManualSenderId] = useState('');

  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const isCallChannel = group.channel === 'Call';

  // Filtered customer list (4 thuộc tính chính: Mã KH, Số điện thoại, Hạng KH, Email - Không filter theo Hạng KH)
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(cust => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch = !query || 
        cust.customerCode.toLowerCase().includes(query) ||
        cust.fullName.toLowerCase().includes(query) ||
        cust.phone.includes(query) ||
        cust.email.toLowerCase().includes(query) ||
        (cust.tier && cust.tier.toLowerCase().includes(query));

      const isSelected = selectedIds.includes(cust.customerCode);
      if (filterTab === 'selected' && !isSelected) return false;
      if (filterTab === 'unselected' && isSelected) return false;

      return matchSearch;
    });
  }, [allCustomers, searchTerm, filterTab, selectedIds]);

  const handleToggleCustomer = (customerCode: string) => {
    setSelectedIds(prev => {
      if (prev.includes(customerCode)) {
        return prev.filter(c => c !== customerCode);
      } else {
        return [...prev, customerCode];
      }
    });
  };

  const handleToggleAllVisible = () => {
    const visibleCodes = filteredCustomers.map(c => c.customerCode);
    const allSelected = visibleCodes.length > 0 && visibleCodes.every(code => selectedIds.includes(code));
    if (allSelected) {
      const visibleSet = new Set(visibleCodes);
      setSelectedIds(prev => prev.filter(c => !visibleSet.has(c)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleCodes])));
    }
  };

  const handleClearAllInternal = () => {
    setSelectedIds([]);
  };

  // --- External / Manual Member Handlers ---
  const handleRemoveExternal = (id: string) => {
    setExternalMembers(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllExternal = () => {
    setExternalMembers([]);
  };

  // Thêm thủ công trực tiếp từng bản ghi
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (isCallChannel) {
      const phone = manualPhone.trim().replace(/[\s\.\-_]/g, '');
      if (!phone || phone.length < 8) {
        setImportFeedback('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8-11 chữ số).');
        return;
      }
      if (externalMembers.some(m => m.phone === phone)) {
        setImportFeedback(`Số điện thoại ${phone} đã tồn tại trong danh sách import thủ công.`);
        return;
      }

      setExternalMembers(prev => [
        {
          id: `manual-phone-${Date.now()}`,
          type: 'phone',
          phone,
          importedAt: formattedDate
        },
        ...prev
      ]);
      setManualPhone('');
      setImportFeedback(`Đã thêm số điện thoại ${phone} vào danh sách.`);
    } else {
      // Kênh Chat: chỉ cần nhập senderId (bỏ Ghi chú và Nền tảng)
      const userId = manualSenderId.trim();
      if (!userId || userId.length < 2) {
        setImportFeedback('Vui lòng nhập senderId hợp lệ.');
        return;
      }
      if (externalMembers.some(m => m.userId?.toLowerCase() === userId.toLowerCase())) {
        setImportFeedback(`senderId "${userId}" đã tồn tại trong danh sách.`);
        return;
      }

      setExternalMembers(prev => [
        {
          id: `manual-sender-${Date.now()}`,
          type: 'chat_user',
          userId,
          importedAt: formattedDate
        },
        ...prev
      ]);
      setManualSenderId('');
      setImportFeedback(`Đã thêm senderId "${userId}" vào danh sách.`);
    }
  };

  const handleSave = () => {
    onSaveMembers(group.id, selectedIds, externalMembers);
    onClose();
  };

  const isAllVisibleSelected = filteredCustomers.length > 0 && 
    filteredCustomers.every(c => selectedIds.includes(c.customerCode));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 flex flex-col h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white select-none">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <span>CẤU HÌNH KHÁCH HÀNG TRONG TẬP:</span>
              <span className="text-[#f25621] uppercase font-bold">{group.groupName}</span>
              <span className="text-slate-400 font-mono text-xs">({group.groupCode})</span>
            </h2>

            {/* Badge kênh áp dụng */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
              isCallChannel 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isCallChannel ? <PhoneCall className="w-3 h-3 text-blue-600" /> : <MessageSquare className="w-3 h-3 text-emerald-600" />}
              <span>{isCallChannel ? 'Kênh Call' : 'Kênh Chat'}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs: Khách hàng trong hệ thống VS Import thủ công */}
        <div className="flex items-center px-5 border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setModalTab('internal')}
            className={`flex items-center gap-2 py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              modalTab === 'internal'
                ? 'border-[#f25621] text-[#f25621] font-semibold bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Khách hàng trong hệ thống</span>
            <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {selectedIds.length}
            </span>
          </button>

          <button
            onClick={() => setModalTab('external')}
            className={`flex items-center gap-2 py-2 px-3 border-b-2 transition-colors cursor-pointer ml-1 ${
              modalTab === 'external'
                ? 'border-[#f25621] text-[#f25621] font-semibold bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import thủ công</span>
            <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {externalMembers.length}
            </span>
          </button>
        </div>

        {/* Feedback message banner */}
        {importFeedback && (
          <div className="bg-blue-50 border-b border-blue-200 text-blue-800 px-5 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{importFeedback}</span>
            </div>
            <button
              onClick={() => setImportFeedback(null)}
              className="text-blue-500 hover:text-blue-700 font-bold ml-2 text-xs"
            >
              ×
            </button>
          </div>
        )}

        {/* TAB 1: KHÁCH HÀNG TRONG HỆ THỐNG */}
        {modalTab === 'internal' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter & Search Bar - Đã bỏ filter Hạng KH và nút Chọn tất cả trang này */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo Mã KH, Tên KH, Số điện thoại, Email, Hạng KH..."
                    className="w-full h-8.5 pl-9 pr-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                  />
                </div>

                {/* Tab filter theo tình trạng chọn */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      filterTab === 'all'
                        ? 'bg-slate-700 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({allCustomers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('selected')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      filterTab === 'selected'
                        ? 'bg-slate-700 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Đã chọn ({selectedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('unselected')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      filterTab === 'unselected'
                        ? 'bg-slate-700 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Chưa chọn ({Math.max(0, allCustomers.length - selectedIds.length)})
                  </button>

                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllInternal}
                      className="text-xs text-red-500 hover:underline cursor-pointer ml-2"
                    >
                      Bỏ chọn tất cả
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Table List - 4 ATTRIBUTES: Mã KH, Số điện thoại, Hạng KH, Email */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#eef3f7] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllVisibleSelected}
                        onChange={handleToggleAllVisible}
                        className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                        title="Chọn / Bỏ chọn danh sách hiển thị"
                      />
                    </th>
                    <th className="py-2.5 px-3 w-32">Mã KH</th>
                    <th className="py-2.5 px-3 w-40">Số điện thoại</th>
                    <th className="py-2.5 px-3 w-32 text-center">Hạng KH</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(cust => {
                      const isChecked = selectedIds.includes(cust.customerCode);
                      return (
                        <tr
                          key={cust.id}
                          onClick={() => handleToggleCustomer(cust.customerCode)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${
                            isChecked ? 'bg-orange-50/30' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCustomer(cust.customerCode)}
                              className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {cust.customerCode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {cust.phone}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {renderTierTag(cust.tier)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {cust.email}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Không tìm thấy khách hàng nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT THỦ CÔNG */}
        {modalTab === 'external' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 bg-white text-xs">
            
            {/* Form nhập tay trực tiếp */}
            <form onSubmit={handleAddManualItem} className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                {isCallChannel ? <PhoneCall className="w-4 h-4 text-blue-600" /> : <MessageSquare className="w-4 h-4 text-emerald-600" />}
                <span>
                  {isCallChannel 
                    ? 'Nhập thủ công Số điện thoại cho tập' 
                    : 'Nhập thủ công senderId cho tập'}
                </span>
              </div>

              {isCallChannel ? (
                /* Kênh Call: Chỉ cần nhập Số điện thoại, Bỏ Ghi chú */
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="VD: 0903123456"
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full h-8 flex items-center justify-center gap-1.5 px-3 bg-[#f25621] hover:bg-[#d94816] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm số</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Kênh Chat: Chỉ cần nhập senderId, Bỏ Ghi chú và Nền tảng */
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      senderId <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualSenderId}
                      onChange={(e) => setManualSenderId(e.target.value)}
                      placeholder="VD: user_100234 hoặc 889900..."
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full h-8 flex items-center justify-center gap-1.5 px-3 bg-[#f25621] hover:bg-[#d94816] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm senderId</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Bảng danh sách các thành viên import thủ công */}
            <div className="space-y-2 pt-1 flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-800 text-xs">
                  Danh sách import thủ công ({externalMembers.length} bản ghi):
                </div>
                {externalMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllExternal}
                    className="text-xs text-red-500 hover:underline cursor-pointer font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded overflow-hidden flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#eef3f7] border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">STT</th>
                      {isCallChannel ? (
                        <th className="py-2 px-3 min-w-[200px]">Số điện thoại</th>
                      ) : (
                        <th className="py-2 px-3 min-w-[220px]">senderId</th>
                      )}
                      <th className="py-2 px-3 w-36">Thời gian import</th>
                      <th className="py-2 px-3 w-16 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {externalMembers.length > 0 ? (
                      externalMembers.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-500">
                            {idx + 1}
                          </td>
                          {isCallChannel ? (
                            <td className="py-2 px-3 font-mono font-medium text-slate-800">
                              {item.phone}
                            </td>
                          ) : (
                            <td className="py-2 px-3 font-mono font-medium text-slate-800">
                              {item.userId}
                            </td>
                          )}
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {item.importedAt}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveExternal(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isCallChannel ? 5 : 4} className="py-8 text-center text-slate-400">
                          Chưa có {isCallChannel ? 'số điện thoại' : 'senderId'} nào được import thủ công cho tập này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <div>
              Trong hệ thống: <span className="font-bold text-slate-800">{selectedIds.length}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              Import thủ công: <span className="font-bold text-slate-800">{externalMembers.length}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              Tổng cộng: <span className="font-bold text-[#f25621]">{selectedIds.length + externalMembers.length}</span> thành viên
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              Lưu danh sách
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function CustomerGroupMemberModal({
  isOpen,
  onClose,
  group,
  onSaveMembers,
  allCustomers = INITIAL_CUSTOMERS
}: CustomerGroupMemberModalProps) {
  if (!isOpen || !group) return null;

  return (
    <CustomerGroupMemberModalInner
      key={group.id}
      group={group}
      onClose={onClose}
      onSaveMembers={onSaveMembers}
      allCustomers={allCustomers}
    />
  );
}
