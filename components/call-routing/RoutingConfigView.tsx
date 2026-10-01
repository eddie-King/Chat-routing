'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Info, 
  Pencil, 
  Trash2, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Calendar,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  RoutingConfigItem, 
  INITIAL_ROUTING_CONFIGS, 
  EXTENSION_OPTIONS, 
  FALLBACK_OPTIONS 
} from '@/lib/routing-data';
import { RoutingModal } from './RoutingModal';
import { RoutingDetailModal } from './RoutingDetailModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PhoneCall, MessageSquare } from 'lucide-react';

interface RoutingConfigViewProps {
  onSwitchToChatRouting?: () => void;
}

export function RoutingConfigView({ onSwitchToChatRouting }: RoutingConfigViewProps = {}) {
  const [dataList, setDataList] = useState<RoutingConfigItem[]>(INITIAL_ROUTING_CONFIGS);

  // Filter states
  const [filterExt, setFilterExt] = useState<string>('Tất cả');
  const [filterVIP, setFilterVIP] = useState<string>('Tất cả');
  const [filterStandard, setFilterStandard] = useState<string>('Tất cả');
  const [filterFallback, setFilterFallback] = useState<string>('Tất cả');
  const [filterDate, setFilterDate] = useState<string>('');

  // Sorting
  type SortField = 'extNumber' | 'routingVIP' | 'routingStandard' | 'fallbackExt' | 'createdAt';
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RoutingConfigItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<RoutingConfigItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<RoutingConfigItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterExt('Tất cả');
    setFilterVIP('Tất cả');
    setFilterStandard('Tất cả');
    setFilterFallback('Tất cả');
    setFilterDate('');
    setCurrentPage(1);
    showToast('Đã làm mới bộ lọc tìm kiếm');
  };

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return dataList.filter(item => {
      if (filterExt !== 'Tất cả' && item.extNumber !== filterExt) return false;
      if (filterVIP !== 'Tất cả' && item.routingVIP !== filterVIP) return false;
      if (filterStandard !== 'Tất cả' && item.routingStandard !== filterStandard) return false;
      if (filterFallback !== 'Tất cả' && item.fallbackExt !== filterFallback) return false;
      if (filterDate.trim()) {
        const query = filterDate.trim().toLowerCase();
        const dateMatch = item.createdAt.toLowerCase().includes(query);
        if (!dateMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'createdAt') {
        // format: DD/MM/YYYY HH:mm:ss
        const parseDate = (dStr: string) => {
          const [datePart, timePart] = dStr.split(' ');
          const [d, m, y] = datePart.split('/');
          const [hh, mm, ss] = (timePart || '00:00:00').split(':');
          return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)).getTime();
        };
        const timeA = parseDate(a.createdAt);
        const timeB = parseDate(b.createdAt);
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dataList, filterExt, filterVIP, filterStandard, filterFallback, filterDate, sortField, sortDirection]);

  // Paginated Data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Save (Create or Edit)
  const handleSaveItem = (savedItem: RoutingConfigItem) => {
    if (selectedItem) {
      // update
      setDataList(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      showToast(`Đã cập nhật cấu hình ${savedItem.extNumber}`);
    } else {
      // create new
      setDataList(prev => [savedItem, ...prev]);
      showToast(`Đã thêm mới cấu hình định tuyến cho ${savedItem.extNumber}`);
    }
    setIsCreateEditOpen(false);
    setSelectedItem(null);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    setDataList(prev => prev.filter(item => item.id !== deleteItem.id));
    showToast(`Đã xóa cấu hình định tuyến ${deleteItem.extNumber}`);
    setIsDeleteOpen(false);
    setDeleteItem(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        
        {/* Top Header: Title and "+ Tạo mới" Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#f25621] tracking-wide uppercase flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#f25621]" />
              CẤU HÌNH ĐỊNH TUYẾN THOẠI (CALL ROUTING)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý quy tắc phân bổ cuộc gọi thoại vào hệ thống tổng đài theo đầu số Ext
            </p>
          </div>

          <button
            id="btn-create-new-routing"
            onClick={() => {
              setSelectedItem(null);
              setIsCreateEditOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo mới</span>
          </button>
        </div>

        {/* Filter / Search Form */}
        <div className="space-y-4">
          
          {/* Row 1: 4 Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Đầu số Ext */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Đầu số Ext
              </label>
              <div className="relative">
                <select
                  id="filter-ext"
                  value={filterExt}
                  onChange={(e) => {
                    setFilterExt(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                >
                  <option value="Tất cả">Tất cả</option>
                  {EXTENSION_OPTIONS.map((ext) => (
                    <option key={ext} value={ext}>{ext}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Routing VIP */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Routing VIP
              </label>
              <div className="relative">
                <select
                  id="filter-vip"
                  value={filterVIP}
                  onChange={(e) => {
                    setFilterVIP(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Có">Có</option>
                  <option value="Không">Không</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Routing thường */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Routing thường
              </label>
              <div className="relative">
                <select
                  id="filter-standard"
                  value={filterStandard}
                  onChange={(e) => {
                    setFilterStandard(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Có">Có</option>
                  <option value="Không">Không</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Đầu số Ext (Fallback) */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Đầu số Ext (Fallback)
              </label>
              <div className="relative">
                <select
                  id="filter-fallback"
                  value={filterFallback}
                  onChange={(e) => {
                    setFilterFallback(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                >
                  <option value="Tất cả">Tất cả</option>
                  {FALLBACK_OPTIONS.map((fb) => (
                    <option key={fb} value={fb}>{fb}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Row 2: Ngày tạo + Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Ngày tạo */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Ngày tạo
              </label>
              <div className="relative">
                <input
                  id="filter-date"
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-slate-400 shadow-2xs"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons: Tìm kiếm & Làm mới */}
            <div className="sm:col-span-1 lg:col-span-3 flex items-center gap-2 pt-1">
              <button
                id="btn-search"
                onClick={() => setCurrentPage(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-medium rounded transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tìm kiếm</span>
              </button>

              <button
                id="btn-reset-filter"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Làm mới</span>
              </button>
            </div>

          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
                
                {/* Hoạt động */}
                <th className="py-3 px-4 font-semibold text-slate-700 w-28">
                  Hoạt động
                </th>

                {/* Đầu số Ext */}
                <th 
                  onClick={() => handleSort('extNumber')}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Đầu số Ext</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Routing VIP */}
                <th 
                  onClick={() => handleSort('routingVIP')}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Routing VIP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Routing thường */}
                <th 
                  onClick={() => handleSort('routingStandard')}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Routing thường</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Đầu số Ext (Fallback) */}
                <th 
                  onClick={() => handleSort('fallbackExt')}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Đầu số Ext (Fallback)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Ngày tạo */}
                <th 
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ngày tạo</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/70 transition-colors text-slate-600"
                  >
                    {/* Hoạt động: Info, Edit, Delete buttons */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Info button */}
                        <button
                          onClick={() => {
                            setDetailItem(item);
                            setIsDetailOpen(true);
                          }}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsCreateEditOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            setDeleteItem(item);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Xóa cấu hình"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Đầu số Ext */}
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {item.extNumber}
                    </td>

                    {/* Routing VIP */}
                    <td className="py-2.5 px-4">
                      {item.routingVIP}
                    </td>

                    {/* Routing thường */}
                    <td className="py-2.5 px-4">
                      {item.routingStandard}
                    </td>

                    {/* Đầu số Ext (Fallback) */}
                    <td className="py-2.5 px-4">
                      {item.fallbackExt}
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {item.createdAt}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <span>Không tìm thấy dữ liệu cấu hình định tuyến phù hợp</span>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-orange-600 hover:underline mt-1"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-600 select-none">
          
          {/* Left: Page size + Record count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Hiển thị</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-300 rounded px-2.5 py-1 pr-6 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span>mục</span>
            </div>

            <span className="text-slate-400">•</span>

            <span className="text-slate-500">
              {totalItems > 0
                ? `Hiển thị từ ${startIndex + 1} đến ${endIndex} trong ${totalItems} mục`
                : 'Hiển thị 0 mục'}
            </span>
          </div>

          {/* Right: Pagination Controls */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded transition-colors ${
                currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              Trang đầu
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded transition-colors ${
                currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              Trang trước
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#1e293b] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-2 py-1 rounded transition-colors ${
                currentPage === totalPages || totalPages === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              Trang kế
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-2 py-1 rounded transition-colors ${
                currentPage === totalPages || totalPages === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              Trang cuối
            </button>
          </div>

        </div>

      </div>

      {/* Create / Edit Modal */}
      <RoutingModal
        isOpen={isCreateEditOpen}
        onClose={() => {
          setIsCreateEditOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveItem}
        initialData={selectedItem}
      />

      {/* Detail Modal */}
      <RoutingDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        data={detailItem}
        onEdit={(item) => {
          setSelectedItem(item);
          setIsCreateEditOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteItem(null);
        }}
        onConfirm={handleConfirmDelete}
        item={deleteItem}
      />

    </div>
  );
}
