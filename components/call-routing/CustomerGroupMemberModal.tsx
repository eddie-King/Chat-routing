'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Search, 
  PhoneCall, 
  MessageSquare, 
  Upload, 
  Download, 
  Trash2, 
  Users, 
  AlertCircle,
  FileSpreadsheet
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
  // Navigation Tabs: Khách hàng trong hệ thống VS Import ngoài hệ thống
  const [modalTab, setModalTab] = useState<'internal' | 'external'>('internal');

  // Internal customers selection state
  const [selectedIds, setSelectedIds] = useState<string[]>(() => group.customerIds || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'selected' | 'unselected'>('all');
  const [tierFilter, setTierFilter] = useState<string>('Tất cả');

  // External customers import state
  const [externalMembers, setExternalMembers] = useState<ExternalMemberItem[]>(
    () => group.externalMembers || []
  );

  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCallChannel = group.channel === 'Call';

  // Filtered customer list (chỉ hiển thị 4 thuộc tính: Mã KH, Số điện thoại, Hạng KH, Email)
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(cust => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch = !query || 
        cust.customerCode.toLowerCase().includes(query) ||
        cust.phone.includes(query) ||
        cust.email.toLowerCase().includes(query) ||
        (cust.tier && cust.tier.toLowerCase().includes(query));

      const matchTier = tierFilter === 'Tất cả' || cust.tier === tierFilter;

      const isSelected = selectedIds.includes(cust.customerCode);
      if (filterTab === 'selected' && !isSelected) return false;
      if (filterTab === 'unselected' && isSelected) return false;

      return matchSearch && matchTier;
    });
  }, [allCustomers, searchTerm, tierFilter, filterTab, selectedIds]);

  const handleToggleCustomer = (customerCode: string) => {
    setSelectedIds(prev => {
      if (prev.includes(customerCode)) {
        return prev.filter(c => c !== customerCode);
      } else {
        return [...prev, customerCode];
      }
    });
  };

  const handleSelectAllVisible = () => {
    const visibleCodes = filteredCustomers.map(c => c.customerCode);
    setSelectedIds(prev => Array.from(new Set([...prev, ...visibleCodes])));
  };

  const handleDeselectAllVisible = () => {
    const visibleCodes = new Set(filteredCustomers.map(c => c.customerCode));
    setSelectedIds(prev => prev.filter(c => !visibleCodes.has(c)));
  };

  const handleClearAllInternal = () => {
    setSelectedIds([]);
  };

  // --- External Member File Handlers ---
  const handleRemoveExternal = (id: string) => {
    setExternalMembers(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllExternal = () => {
    setExternalMembers([]);
  };

  // Tải file mẫu CSV theo kênh
  const handleDownloadTemplate = () => {
    if (isCallChannel) {
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
        'Số điện thoại,Ghi chú\n0989123456,Khách hàng ưu tiên gọi thoại\n0908889999,Hợp đồng VIP';
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `Mau_Import_SoDienThoai_${group.groupCode}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
        'Nền tảng,UserID,Ghi chú\nZalo,zalo_user_998877,Khách VIP quan tâm qua Zalo OA\nFacebook,fb_1000882233,Khách hàng thân thiết inbox Fanpage\nZalo,zalo_user_112233,VIP Tier 1';
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `Mau_Import_UserID_Chat_${group.groupCode}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Upload file CSV (Chỉ import qua file)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        setImportFeedback('File không có dữ liệu để import.');
        return;
      }

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newItems: ExternalMemberItem[] = [];

      // Bỏ qua dòng tiêu đề
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (isCallChannel) {
          const phone = cols[0];
          const note = cols[1] || 'Import từ file CSV';
          if (phone && phone.length >= 7) {
            newItems.push({
              id: `ext-file-${Date.now()}-${i}`,
              type: 'phone',
              phone,
              note,
              importedAt: formattedDate
            });
          }
        } else {
          // Chat: Cột 1 = Nền tảng (Zalo / Facebook), Cột 2 = UserID, Cột 3 = Ghi chú
          let platform: 'Zalo' | 'Facebook' = 'Zalo';
          const rawPlatform = (cols[0] || '').toLowerCase();
          if (rawPlatform.includes('fb') || rawPlatform.includes('facebook')) {
            platform = 'Facebook';
          }
          const userId = cols[1];
          const note = cols[2] || `Import ${platform} từ file`;
          if (userId) {
            newItems.push({
              id: `ext-file-${Date.now()}-${i}`,
              type: 'chat_user',
              platform,
              userId,
              note,
              importedAt: formattedDate
            });
          }
        }
      }

      if (newItems.length > 0) {
        setExternalMembers(prev => [...newItems, ...prev]);
        setImportFeedback(`Đã import thành công ${newItems.length} bản ghi từ file ${file.name}.`);
      } else {
        setImportFeedback('Không đọc được bản ghi hợp lệ nào từ file. Vui lòng kiểm tra định dạng mẫu.');
      }
      setTimeout(() => setImportFeedback(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleSave = () => {
    onSaveMembers(group.id, selectedIds, externalMembers);
    onClose();
  };

  const isAllVisibleSelected = filteredCustomers.length > 0 && 
    filteredCustomers.every(c => selectedIds.includes(c.customerCode));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-3 sm:p-5">
      <div className="bg-white rounded border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Cấu hình khách hàng trong tập: <span className="text-[#f25621]">{group.groupName}</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">({group.groupCode})</span>
            
            {/* Badge Kênh áp dụng */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
              isCallChannel 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isCallChannel ? <PhoneCall className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
              <span>{isCallChannel ? 'Kênh Call' : 'Kênh Chat'}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs (Khách hàng hệ thống vs Import ngoài hệ thống) */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/70 px-5 pt-2 text-xs font-medium">
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
            <span>Import ngoài hệ thống</span>
            <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {externalMembers.length}
            </span>
          </button>
        </div>

        {/* Feedback message banner */}
        {importFeedback && (
          <div className="bg-blue-50 border-b border-blue-200 text-blue-800 px-5 py-2 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{importFeedback}</span>
          </div>
        )}

        {/* TAB 1: KHÁCH HÀNG TRONG HỆ THỐNG */}
        {modalTab === 'internal' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo Mã KH, Số điện thoại, Email, Hạng KH..."
                    className="w-full h-8.5 pl-9 pr-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                  />
                </div>

                {/* Hạng khách hàng filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 whitespace-nowrap">Hạng khách hàng:</span>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="h-8.5 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả</option>
                    <option value="Kim cương">Kim cương</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Bạc">Bạc</option>
                    <option value="Đồng">Đồng</option>
                  </select>
                </div>
              </div>

              {/* Quick tabs & selection buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {/* Tab filter theo tình trạng chọn */}
                <div className="flex items-center gap-1.5">
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
                    Đã chọn trong tập ({selectedIds.length})
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
                </div>

                {/* Quick buttons: chọn / bỏ chọn */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={isAllVisibleSelected ? handleDeselectAllVisible : handleSelectAllVisible}
                    className="text-xs text-[#f25621] hover:underline cursor-pointer font-medium"
                  >
                    {isAllVisibleSelected ? 'Bỏ chọn trang này' : 'Chọn tất cả trang này'}
                  </button>
                  {selectedIds.length > 0 && (
                    <>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllInternal}
                        className="text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Bỏ chọn tất cả
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Tag Pills for Hạng khách hàng */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                <span className="text-slate-500 text-[11px] whitespace-nowrap">Lọc nhanh theo hạng:</span>
                {(['Tất cả', 'Kim cương', 'Vàng', 'Bạc', 'Đồng'] as const).map(tier => {
                  const isSelected = tierFilter === tier;
                  let tagStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                  if (isSelected) {
                    if (tier === 'Kim cương') tagStyle = 'bg-sky-100 text-sky-800 border-sky-300 font-semibold ring-1 ring-sky-400';
                    else if (tier === 'Vàng') tagStyle = 'bg-amber-100 text-amber-900 border-amber-300 font-semibold ring-1 ring-amber-400';
                    else if (tier === 'Bạc') tagStyle = 'bg-slate-200 text-slate-800 border-slate-400 font-semibold ring-1 ring-slate-400';
                    else if (tier === 'Đồng') tagStyle = 'bg-orange-100 text-orange-900 border-orange-300 font-semibold ring-1 ring-orange-400';
                    else tagStyle = 'bg-slate-800 text-white border-slate-800 font-medium';
                  } else {
                    if (tier === 'Kim cương') tagStyle = 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
                    else if (tier === 'Vàng') tagStyle = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
                    else if (tier === 'Bạc') tagStyle = 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
                    else if (tier === 'Đồng') tagStyle = 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100';
                  }
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTierFilter(tier)}
                      className={`px-2 py-0.5 rounded text-[11px] border transition-all cursor-pointer whitespace-nowrap ${tagStyle}`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Table List - CHỈ CÓ 4 ATTRIBUTES: Mã KH, Số điện thoại, Hạng KH, Email */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#eef3f7] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllVisibleSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAllVisible();
                          } else {
                            handleDeselectAllVisible();
                          }
                        }}
                        className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3 w-36">Mã KH</th>
                    <th className="py-2.5 px-3 w-40">Số điện thoại</th>
                    <th className="py-2.5 px-3 w-36 text-center">Hạng KH</th>
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

        {/* TAB 2: IMPORT KHÁCH HÀNG NGOÀI HỆ THỐNG (CHỈ IMPORT QUA FILE) */}
        {modalTab === 'external' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 bg-white text-xs">
            
            {/* Thanh công cụ Import file */}
            <div className="p-3.5 rounded border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                {isCallChannel ? <PhoneCall className="w-4 h-4 text-blue-600" /> : <MessageSquare className="w-4 h-4 text-emerald-600" />}
                <span>
                  {isCallChannel 
                    ? 'Import file danh sách Số điện thoại ngoài hệ thống' 
                    : 'Import file danh sách UserID ngoài hệ thống'}
                </span>
              </div>

              {/* Nút tải file mẫu */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs whitespace-nowrap text-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#f25621]" />
                <span>Tải file mẫu ({isCallChannel ? 'SĐT .csv' : 'UserID .csv'})</span>
              </button>
            </div>

            {/* Khu vực Upload file (Chỉ import file, không có cách 2) */}
            <div className="p-4 rounded border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <FileSpreadsheet className="w-4 h-4 text-[#f25621]" />
                  <span>Chọn file Excel/CSV để import</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isCallChannel
                    ? 'Cột file gồm: "Số điện thoại", "Ghi chú"'
                    : 'Cột file gồm: "Nền tảng" (Zalo hoặc Facebook), "UserID", "Ghi chú"'}
                </span>
              </div>

              <div className="pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#f25621] file:text-white hover:file:bg-[#e04815] cursor-pointer"
                />
              </div>
            </div>

            {/* Bảng danh sách các thành viên ngoài hệ thống đã import */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-800 text-xs">
                  Danh sách đã import ({externalMembers.length} bản ghi):
                </div>
                {externalMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllExternal}
                    className="text-xs text-red-500 hover:underline cursor-pointer font-medium"
                  >
                    Xóa tất cả danh sách import
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#eef3f7] border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">STT</th>
                      {isCallChannel ? (
                        <th className="py-2 px-3 min-w-[160px]">Số điện thoại</th>
                      ) : (
                        <>
                          <th className="py-2 px-3 w-32">Nền tảng</th>
                          <th className="py-2 px-3 min-w-[180px]">UserID</th>
                        </>
                      )}
                      <th className="py-2 px-3 min-w-[160px]">Ghi chú</th>
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
                            <>
                              <td className="py-2 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  item.platform === 'Zalo'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}>
                                  {item.platform || 'Zalo'}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-medium text-slate-800">
                                {item.userId}
                              </td>
                            </>
                          )}
                          <td className="py-2 px-3 text-slate-600">
                            {item.note || '-'}
                          </td>
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
                        <td colSpan={isCallChannel ? 5 : 6} className="py-8 text-center text-slate-400">
                          Chưa có khách hàng ngoài hệ thống nào được import cho tập này.
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
              Ngoài hệ thống: <span className="font-bold text-slate-800">{externalMembers.length}</span>
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
