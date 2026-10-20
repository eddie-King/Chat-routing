'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Pencil, 
  Cog, 
  Download, 
  Trash2, 
  ChevronDown, 
  Columns, 
  ArrowDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Check,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { 
  CustomerGroupItem, 
  CustomerItem, 
  ExternalMemberItem,
  INITIAL_CUSTOMER_GROUPS, 
  INITIAL_CUSTOMERS 
} from '@/lib/customer-group-data';
import { CustomerGroupMemberModal } from './CustomerGroupMemberModal';
import { CustomerGroupModal } from './CustomerGroupModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function SpecialNumberView() {
  // Master list of groups
  const [groups, setGroups] = useState<CustomerGroupItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_customer_groups');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CUSTOMER_GROUPS;
  });

  // Master list of customers
  const [customers] = useState<CustomerItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_customers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CUSTOMERS;
  });

  // Filter input states
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('Tất cả');
  const [filterCreatedAt, setFilterCreatedAt] = useState('');
  const [filterUpdatedAt, setFilterUpdatedAt] = useState('');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    code: '',
    name: 'Tất cả',
    createdAt: '',
    updatedAt: ''
  });

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [memberModalGroup, setMemberModalGroup] = useState<CustomerGroupItem | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [createEditGroup, setCreateEditGroup] = useState<CustomerGroupItem | null>(null);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);

  const [deleteGroup, setDeleteGroup] = useState<CustomerGroupItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Columns visibility
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    actions: true,
    groupCode: true,
    groupName: true,
    channel: true,
    createdAt: true,
    updatedAt: true
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct group names for filter dropdown
  const uniqueGroupNames = useMemo(() => {
    return Array.from(new Set(groups.map(g => g.groupName)));
  }, [groups]);

  // Handle Search button
  const handleSearch = () => {
    setAppliedFilters({
      code: filterCode.trim().toLowerCase(),
      name: filterName,
      createdAt: filterCreatedAt.trim().toLowerCase(),
      updatedAt: filterUpdatedAt.trim().toLowerCase()
    });
    setCurrentPage(1);
  };

  // Handle Reset button
  const handleReset = () => {
    setFilterCode('');
    setFilterName('Tất cả');
    setFilterCreatedAt('');
    setFilterUpdatedAt('');
    setAppliedFilters({
      code: '',
      name: 'Tất cả',
      createdAt: '',
      updatedAt: ''
    });
    setCurrentPage(1);
    showToast('Đã làm mới bộ lọc tìm kiếm');
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return groups.filter(item => {
      if (appliedFilters.code && !item.groupCode.toLowerCase().includes(appliedFilters.code)) {
        return false;
      }
      if (appliedFilters.name !== 'Tất cả' && item.groupName !== appliedFilters.name) {
        return false;
      }
      if (appliedFilters.createdAt && !item.createdAt.toLowerCase().includes(appliedFilters.createdAt)) {
        return false;
      }
      if (appliedFilters.updatedAt && !(item.updatedAt || '').toLowerCase().includes(appliedFilters.updatedAt)) {
        return false;
      }
      return true;
    });
  }, [groups, appliedFilters]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Open Cog (Răng cưa) Modal to manage members
  const handleOpenMemberModal = (group: CustomerGroupItem) => {
    setMemberModalGroup(group);
    setIsMemberModalOpen(true);
  };

  // Save members from MemberModal (cả khách trong hệ thống & import ngoài hệ thống)
  const handleSaveMembers = (
    groupId: string, 
    customerIds: string[], 
    externalMembers?: ExternalMemberItem[]
  ) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setGroups(prev => {
      const updated = prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            customerIds,
            externalMembers: externalMembers ?? g.externalMembers ?? [],
            updatedAt: formattedDate
          };
        }
        return g;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('unispace_customer_groups', JSON.stringify(updated));
      }
      return updated;
    });

    const targetGroup = groups.find(g => g.id === groupId);
    const totalCount = customerIds.length + (externalMembers?.length || 0);
    showToast(`Đã cập nhật ${totalCount} khách hàng cho tập ${targetGroup?.groupName || ''}`);
  };

  // Save (Create or Edit) Group
  const handleSaveGroup = (saved: CustomerGroupItem) => {
    setGroups(prev => {
      let updated: CustomerGroupItem[];
      const exists = prev.some(g => g.id === saved.id);
      if (exists) {
        updated = prev.map(g => g.id === saved.id ? saved : g);
        showToast(`Đã cập nhật tập khách hàng ${saved.groupName}`);
      } else {
        updated = [saved, ...prev];
        showToast(`Đã tạo mới tập khách hàng ${saved.groupName}`);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('unispace_customer_groups', JSON.stringify(updated));
      }
      return updated;
    });
    setIsCreateEditOpen(false);
    setCreateEditGroup(null);
  };

  // Delete Group
  const handleConfirmDelete = () => {
    if (!deleteGroup) return;
    setGroups(prev => {
      const updated = prev.filter(g => g.id !== deleteGroup.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('unispace_customer_groups', JSON.stringify(updated));
      }
      return updated;
    });
    showToast(`Đã xóa tập khách hàng ${deleteGroup.groupName}`);
    setIsDeleteOpen(false);
    setDeleteGroup(null);
  };

  // Export CSV of customers in group (cả trong hệ thống và ngoài hệ thống)
  const handleDownloadGroup = (group: CustomerGroupItem) => {
    const groupCustomers = customers.filter(c => (group.customerIds || []).includes(c.customerCode));
    const externalList = group.externalMembers || [];

    if (groupCustomers.length === 0 && externalList.length === 0) {
      showToast(`Tập ${group.groupName} hiện chưa có khách hàng nào`);
      return;
    }

    const isCall = group.channel === 'Call';
    const headers = isCall
      ? ['Nguồn', 'Mã KH', 'Số điện thoại', 'Hạng KH', 'Email', 'Ghi chú']
      : ['Nguồn', 'Nền tảng', 'Mã KH / UserID', 'Số điện thoại', 'Hạng KH', 'Email', 'Ghi chú'];

    const rows: string[][] = [];

    // Khách hàng nội bộ
    groupCustomers.forEach(c => {
      if (isCall) {
        rows.push(['Hệ thống', c.customerCode, `"${c.phone}"`, c.tier || 'Bạc', `"${c.email}"`, 'Khách hàng nội bộ']);
      } else {
        rows.push(['Hệ thống', '-', c.customerCode, `"${c.phone}"`, c.tier || 'Bạc', `"${c.email}"`, 'Khách hàng nội bộ']);
      }
    });

    // Khách hàng ngoài hệ thống
    externalList.forEach(ext => {
      if (isCall) {
        rows.push(['Ngoài hệ thống', '-', `"${ext.phone || ''}"`, '-', '-', `"${ext.note || ''}"`]);
      } else {
        rows.push(['Ngoài hệ thống', ext.platform || 'Zalo', `"${ext.userId || ''}"`, '-', '-', '-', `"${ext.note || ''}"`]);
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${group.groupCode}_${group.groupName.replace(/\s+/g, '_')}_KhachHang.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Đã tải xuống danh sách ${rows.length} khách hàng của tập ${group.groupName}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto text-xs text-slate-700">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs p-5 space-y-4">
        
        {/* Title Bar: QUẢN LÝ TẬP SỐ ĐẶC BIỆT & + Tạo mới */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h1 className="text-sm font-bold text-[#f25621] uppercase tracking-wide">
            QUẢN LÝ TẬP SỐ ĐẶC BIỆT
          </h1>

          <button
            onClick={() => {
              setCreateEditGroup(null);
              setIsCreateEditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-medium rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tạo mới</span>
          </button>
        </div>

        {/* Filter Inputs (4 columns đồng nhất 100% với giao diện ảnh chụp) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* 1. Mã tập khách hàng VIP */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Mã tập khách hàng VIP
            </label>
            <input
              type="text"
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full h-8.5 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
            />
          </div>

          {/* 2. Tên tập khách hàng VIP */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tên tập khách hàng VIP
            </label>
            <div className="relative">
              <select
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full h-8.5 px-3 pr-8 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none appearance-none cursor-pointer"
              >
                <option value="Tất cả"></option>
                {uniqueGroupNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Ngày tạo */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Ngày tạo
            </label>
            <input
              type="text"
              value={filterCreatedAt}
              onChange={(e) => setFilterCreatedAt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="VD: 21/09/2026"
              className="w-full h-8.5 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
            />
          </div>

          {/* 4. Ngày cập nhật */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Ngày cập nhật
            </label>
            <input
              type="text"
              value={filterUpdatedAt}
              onChange={(e) => setFilterUpdatedAt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="VD: 25/09/2026"
              className="w-full h-8.5 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
            />
          </div>
        </div>

        {/* Center Search & Reset Buttons */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-2">
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-medium rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tìm kiếm</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-medium rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Toolbar: Total records & View Column / Refresh icons */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-600">
            Tổng số: <span className="font-bold text-slate-800">{totalItems}</span> bản ghi
          </div>

          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={() => setIsColumnsDropdownOpen(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded transition-colors cursor-pointer"
              title="Cột hiển thị"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              <span>Cột hiển thị</span>
            </button>

            <button
              onClick={() => {
                handleReset();
                showToast('Đã làm mới dữ liệu bảng');
              }}
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded transition-colors cursor-pointer"
              title="Tải lại bảng"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Columns Visibility Dropdown */}
            {isColumnsDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-300 rounded shadow-lg p-2.5 z-20 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-700 pb-1 border-b border-slate-200">
                  Cấu hình cột hiển thị
                </div>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.actions}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, actions: e.target.checked }))}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621]"
                  />
                  <span>Hành động</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.groupCode}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, groupCode: e.target.checked }))}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621]"
                  />
                  <span>Mã tập khách hàng VIP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.groupName}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, groupName: e.target.checked }))}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621]"
                  />
                  <span>Tên tập khách hàng VIP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.channel}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, channel: e.target.checked }))}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621]"
                  />
                  <span>Kênh áp dụng</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.createdAt}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, createdAt: e.target.checked }))}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621]"
                  />
                  <span>Ngày tạo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.updatedAt}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, updatedAt: e.target.checked }))}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621]"
                  />
                  <span>Ngày cập nhật</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eef3f7] border-b border-slate-200 text-slate-700 font-semibold select-none whitespace-nowrap">
                {visibleColumns.actions && (
                  <th className="py-2.5 px-3 w-28 text-left">Hành động</th>
                )}
                {visibleColumns.groupCode && (
                  <th className="py-2.5 px-3 min-w-[170px]">Mã tập khách hàng VIP</th>
                )}
                {visibleColumns.groupName && (
                  <th className="py-2.5 px-3 min-w-[190px]">Tên tập khách hàng VIP</th>
                )}
                {visibleColumns.channel && (
                  <th className="py-2.5 px-3 w-32">Kênh áp dụng</th>
                )}
                {visibleColumns.createdAt && (
                  <th className="py-2.5 px-3 w-44">
                    <div className="flex items-center gap-1">
                      <span>Ngày tạo</span>
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </th>
                )}
                {visibleColumns.updatedAt && (
                  <th className="py-2.5 px-3 w-44">Ngày cập nhật</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors text-slate-700">
                    
                    {/* Action Column: Pencil, Cog (Răng cưa), Download, Trash */}
                    {visibleColumns.actions && (
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {/* 1. Sửa (Pencil) */}
                          <button
                            onClick={() => {
                              setCreateEditGroup(item);
                              setIsCreateEditOpen(true);
                            }}
                            title="Chỉnh sửa tập khách hàng"
                            className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Răng cưa (Cog) -> POPUP THÊM KHÁCH HÀNG VÀO TẬP */}
                          <button
                            onClick={() => handleOpenMemberModal(item)}
                            title="Thêm khách hàng vào tập (Cấu hình danh sách khách hàng)"
                            className="text-slate-600 hover:text-[#f25621] transition-colors cursor-pointer"
                          >
                            <Cog className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Tải xuống (Download) */}
                          <button
                            onClick={() => handleDownloadGroup(item)}
                            title="Tải danh sách khách hàng (.csv)"
                            className="text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Xóa (Trash2) */}
                          <button
                            onClick={() => {
                              setDeleteGroup(item);
                              setIsDeleteOpen(true);
                            }}
                            title="Xóa tập khách hàng"
                            className="text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Mã tập khách hàng VIP */}
                    {visibleColumns.groupCode && (
                      <td className="py-2.5 px-3 font-normal text-slate-700">
                        {item.groupCode}
                      </td>
                    )}

                    {/* Tên tập khách hàng VIP */}
                    {visibleColumns.groupName && (
                      <td className="py-2.5 px-3 font-normal text-slate-700">
                        {item.groupName}
                      </td>
                    )}

                    {/* Kênh áp dụng */}
                    {visibleColumns.channel && (
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          item.channel === 'Call'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.channel === 'Call' ? <PhoneCall className="w-3 h-3 text-blue-600" /> : <MessageSquare className="w-3 h-3 text-emerald-600" />}
                          <span>{item.channel === 'Call' ? 'Kênh Call' : 'Kênh Chat'}</span>
                        </span>
                      </td>
                    )}

                    {/* Ngày tạo */}
                    {visibleColumns.createdAt && (
                      <td className="py-2.5 px-3 text-slate-700">
                        {item.createdAt}
                      </td>
                    )}

                    {/* Ngày cập nhật */}
                    {visibleColumns.updatedAt && (
                      <td className="py-2.5 px-3 text-slate-700">
                        {item.updatedAt || ''}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không có bản ghi nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar at the bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
          {/* Số dòng */}
          <div className="flex items-center gap-1.5">
            <span>Số dòng:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 pr-6 border border-slate-300 rounded bg-white text-xs text-slate-700 appearance-none cursor-pointer focus:border-[#f25621] outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Record range & page navigation */}
          <div className="flex items-center gap-4">
            <div>
              {totalItems > 0 ? (
                <>
                  <span className="font-semibold text-slate-800">{startIndex + 1}</span> đến{' '}
                  <span className="font-semibold text-slate-800">{endIndex}</span> trên{' '}
                  <span className="font-semibold text-slate-800">{totalItems}</span>
                </>
              ) : (
                '0 bản ghi'
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* First page */}
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev page */}
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 select-none">
                Trang <span className="font-semibold text-slate-800">{currentPage}</span> trên{' '}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </span>

              {/* Next page */}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last page */}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* POPUP RĂNG CƯA: THÊM KHÁCH HÀNG VÀO TẬP */}
      <CustomerGroupMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberModalGroup(null);
        }}
        group={memberModalGroup}
        onSaveMembers={handleSaveMembers}
        allCustomers={customers}
      />

      {/* Create / Edit Customer Group Modal */}
      <CustomerGroupModal
        isOpen={isCreateEditOpen}
        onClose={() => {
          setIsCreateEditOpen(false);
          setCreateEditGroup(null);
        }}
        onSave={handleSaveGroup}
        initialData={createEditGroup}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteGroup(null);
        }}
        onConfirm={handleConfirmDelete}
        itemLabel={deleteGroup ? `${deleteGroup.groupName} (${deleteGroup.groupCode})` : ''}
      />

    </div>
  );
}
