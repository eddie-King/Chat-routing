'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  StarOff, 
  Trash2, 
  Edit3, 
  Eye, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Check, 
  X,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { 
  CustomerSegmentItem, 
  SampleCustomerRecord, 
  SAMPLE_VIP_CUSTOMERS_PREVIEW,
  getCustomerSegments, 
  saveAllCustomerSegments, 
  toggleCustomerSegmentVip, 
  bulkSetCustomerSegmentsVip, 
  upsertCustomerSegment, 
  deleteCustomerSegment, 
  resetCustomerSegmentsToDefault,
  subscribeCustomerSegments 
} from '@/lib/customer-segment-data';

interface CustomerSegmentViewProps {
  onNavigateToChatRouting?: () => void;
}

export function CustomerSegmentView({ onNavigateToChatRouting }: CustomerSegmentViewProps) {
  const [segments, setSegments] = useState<CustomerSegmentItem[]>(() => getCustomerSegments());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'vip' | 'standard'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegmentItem | null>(null);
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSegment, setPreviewSegment] = useState<CustomerSegmentItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSegment, setDeletingSegment] = useState<CustomerSegmentItem | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCriteria, setFormCriteria] = useState('');
  const [formCustomerCount, setFormCustomerCount] = useState<number>(1000);
  const [formSource, setFormSource] = useState<CustomerSegmentItem['source']>('CRM');
  const [formIsVip, setFormIsVip] = useState(true);
  const [formStatus, setFormStatus] = useState<'Hoạt động' | 'Tạm dừng'>('Hoạt động');

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = subscribeCustomerSegments((updated) => {
      setSegments(updated);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Stats
  const totalCount = segments.length;
  const vipSegments = useMemo(() => segments.filter(s => s.isVip && s.status === 'Hoạt động'), [segments]);
  const vipCount = vipSegments.length;
  const totalVipCustomers = useMemo(() => {
    return vipSegments.reduce((sum, item) => sum + (item.customerCount || 0), 0);
  }, [vipSegments]);

  // Filtering
  const filteredSegments = useMemo(() => {
    return segments.filter(item => {
      // Tab filter
      if (activeTab === 'vip' && !item.isVip) return false;
      if (activeTab === 'standard' && item.isVip) return false;

      // Source filter
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCriteria = item.criteria.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchDesc && !matchCriteria) return false;
      }

      return true;
    });
  }, [segments, activeTab, sourceFilter, searchTerm]);

  // Toggle single VIP status
  const handleToggleVip = (id: string, currentVip: boolean, name: string) => {
    const nextVip = !currentVip;
    toggleCustomerSegmentVip(id, nextVip);
    if (nextVip) {
      showToast(`⭐ Đã thêm "${name}" vào danh sách tệp VIP (sẵn sàng làm input cho Chat Routing)`);
    } else {
      showToast(`Đã bỏ "${name}" khỏi danh sách tệp VIP`);
    }
  };

  // Bulk actions
  const handleBulkSetVip = (setVip: boolean) => {
    if (selectedIds.length === 0) return;
    bulkSetCustomerSegmentsVip(selectedIds, setVip);
    showToast(setVip ? `⭐ Đã đặt ${selectedIds.length} tệp đã chọn thành tệp VIP` : `Đã bỏ trạng thái VIP của ${selectedIds.length} tệp`);
    setSelectedIds([]);
  };

  // Open edit modal
  const handleOpenEdit = (seg: CustomerSegmentItem) => {
    setEditingSegment(seg);
    setFormName(seg.name);
    setFormCode(seg.code);
    setFormDescription(seg.description);
    setFormCriteria(seg.criteria);
    setFormCustomerCount(seg.customerCount);
    setFormSource(seg.source);
    setFormIsVip(seg.isVip);
    setFormStatus(seg.status);
    setIsUpsertModalOpen(true);
  };

  // Open create modal
  const handleOpenCreate = () => {
    setEditingSegment(null);
    setFormName('');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormCode(`TEP_VIP_CUSTOM_${randomSuffix}`);
    setFormDescription('');
    setFormCriteria('Khách hàng thỏa mãn tiêu chí ưu tiên đặc quyền VIP');
    setFormCustomerCount(500);
    setFormSource('CRM');
    setFormIsVip(true); // default VIP
    setFormStatus('Hoạt động');
    setIsUpsertModalOpen(true);
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên tệp khách hàng');
      return;
    }

    const saved = upsertCustomerSegment({
      id: editingSegment?.id,
      code: formCode.trim() || `TEP_${Date.now().toString().slice(-6)}`,
      name: formName.trim(),
      description: formDescription.trim(),
      criteria: formCriteria.trim(),
      customerCount: Number(formCustomerCount) || 0,
      source: formSource,
      isVip: formIsVip,
      status: formStatus
    });

    setIsUpsertModalOpen(false);
    showToast(editingSegment ? `Đã cập nhật tệp "${saved.name}"` : `Đã tạo mới tệp khách hàng "${saved.name}"`);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (deletingSegment) {
      deleteCustomerSegment(deletingSegment.id);
      showToast(`Đã xóa tệp "${deletingSegment.name}"`);
      setDeletingSegment(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Bạn có chắc muốn khôi phục danh sách tệp khách hàng mẫu ban đầu?')) {
      resetCustomerSegmentsToDefault();
      showToast('Đã khôi phục dữ liệu tệp khách hàng mặc định');
    }
  };

  // Select all checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSegments.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-bottom duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-orange-100 text-[#f25621]">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#f25621] uppercase tracking-wide">
                QUẢN LÝ TỆP KHÁCH HÀNG &amp; TẬP KHÁCH HÀNG VIP
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Nơi quản lý các phân khúc khách hàng. Các tệp được đánh dấu <span className="font-semibold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">Tệp VIP</span> sẽ tự động tập hợp thành danh sách (List) làm giá trị lựa chọn cho trường <strong>Tập khách hàng VIP</strong> trong cấu hình định tuyến Chat (Chat Routing VIP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToChatRouting && (
              <button
                onClick={onNavigateToChatRouting}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 transition-colors cursor-pointer"
                title="Đến cấu hình định tuyến Chat để áp dụng danh sách VIP này"
              >
                <span>Xem trong Cấu hình Chat Routing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Excel/CSV</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo tệp khách hàng</span>
            </button>
          </div>
        </div>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tổng số tệp</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{totalCount} <span className="text-xs font-normal text-slate-500">tệp</span></div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 rounded-lg p-3.5 flex items-center justify-between relative overflow-hidden">
            <div>
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Tệp VIP (Input Chat Routing)
              </div>
              <div className="text-xl font-bold text-[#f25621] mt-0.5">
                {vipCount} <span className="text-xs font-semibold text-amber-700">tệp trong List</span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              Active Routing
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tổng khách hàng VIP</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">
                {totalVipCustomers.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">KH</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-[#f25621]">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Đồng bộ Chat Modal</div>
              <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Đang kết nối Realtime
              </div>
            </div>
            <button 
              onClick={handleResetDefault}
              title="Khôi phục tệp mặc định"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tip Box on how it works */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Cơ chế kết nối Input:</strong> Khi bật công tắc <span className="font-semibold text-amber-700">&quot;Áp dụng VIP&quot;</span> (hoặc biểu tượng ngôi sao ⭐) cho một tệp khách hàng, tệp đó sẽ lập tức xuất hiện trong dropdown chọn <strong>&quot;Tập khách hàng VIP&quot;</strong> của modal cấu hình định tuyến Chat (Chat Routing). Nhân viên cấu hình không cần phải gõ lại tên tệp thủ công.
          </div>
        </div>

        {/* Filters and Tabs Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả tệp ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('vip')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vip'
                  ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${activeTab === 'vip' ? 'fill-white' : 'fill-amber-500 text-amber-500'}`} />
              Tệp VIP ({vipCount})
            </button>
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'standard'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tệp thường ({totalCount - vipCount})
            </button>
          </div>

          {/* Search & Source Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã tệp, tên, tiêu chí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 md:w-64 h-8 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả nguồn dữ liệu</option>
              <option value="CRM">CRM</option>
              <option value="Core Banking">Core Banking</option>
              <option value="Excel/CSV">Excel/CSV</option>
              <option value="Thủ công">Thủ công</option>
              <option value="Hệ thống tự động">Hệ thống tự động</option>
            </select>
          </div>
        </div>

        {/* Batch action bar when rows selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-md text-xs text-amber-900">
            <div className="font-medium">
              Đang chọn <strong>{selectedIds.length}</strong> tệp khách hàng:
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkSetVip(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <Star className="w-3 h-3 fill-white" />
                Đặt làm Tệp VIP (Đưa vào Chat Routing)
              </button>
              <button
                onClick={() => handleBulkSetVip(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs cursor-pointer"
              >
                <StarOff className="w-3 h-3 text-slate-500" />
                Bỏ chọn VIP
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-500 hover:text-slate-800 text-xs ml-2 underline"
              >
                Hủy chọn
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold select-none">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredSegments.length > 0 && selectedIds.length === filteredSegments.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-40 text-center font-bold text-[#f25621]">
                  Áp dụng VIP (Input Chat)
                </th>
                <th className="py-3 px-3 w-36">Mã tệp</th>
                <th className="py-3 px-3 min-w-[220px]">Tên tệp khách hàng</th>
                <th className="py-3 px-3 min-w-[240px]">Tiêu chí phân khúc</th>
                <th className="py-3 px-3 w-28 text-right">Số lượng KH</th>
                <th className="py-3 px-3 w-32">Nguồn dữ liệu</th>
                <th className="py-3 px-3 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-3 w-28">Cập nhật</th>
                <th className="py-3 px-3 w-24 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSegments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Không tìm thấy tệp khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredSegments.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors hover:bg-slate-50/80 ${
                        item.isVip ? 'bg-amber-50/20' : ''
                      } ${isSelected ? 'bg-amber-100/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(item.id)}
                          className="rounded border-slate-300 text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                        />
                      </td>

                      {/* VIP Toggle switch for Chat Routing Input */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleVip(item.id, item.isVip, item.name)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.isVip ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            title={item.isVip ? 'Bỏ khỏi danh sách VIP Chat Routing' : 'Chọn làm tệp VIP cho Chat Routing'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                item.isVip ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          {item.isVip ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              VIP List
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Thường
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-600">
                        {item.code}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {item.name}
                          {item.isVip && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                          )}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Criteria */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="line-clamp-2 text-[11px]" title={item.criteria}>
                          {item.criteria}
                        </div>
                      </td>

                      {/* Count */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {item.customerCount.toLocaleString('vi-VN')}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {item.source}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.status === 'Hoạt động' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {item.updatedAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setPreviewSegment(item);
                              setIsPreviewModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Xem mẫu danh sách khách hàng trong tệp"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Chỉnh sửa tệp"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingSegment(item);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa tệp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Hiển thị <strong>{filteredSegments.length}</strong> trên tổng số <strong>{totalCount}</strong> tệp khách hàng.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Đang có <strong>{vipCount}</strong> tệp được kích hoạt làm <strong>Tập khách hàng VIP</strong> cho định tuyến Chat</span>
          </div>
        </div>

      </div>

      {/* ================= MODAL: CREATE / EDIT CUSTOMER SEGMENT ================= */}
      {isUpsertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-orange-100 text-[#f25621]">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingSegment ? 'CHỈNH SỬA TỆP KHÁCH HÀNG' : 'TẠO MỚI TỆP KHÁCH HÀNG'}
                </h3>
              </div>
              <button 
                onClick={() => setIsUpsertModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên tệp khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khách hàng Diamond & Priority"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-8.5 px-3 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Tên này sẽ hiển thị trực tiếp trong dropdown &quot;Tập khách hàng VIP&quot; tại Chat Routing
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã tệp (Code)</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full h-8.5 px-3 font-mono bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quy mô (Số lượng KH)</label>
                  <input
                    type="number"
                    min="0"
                    value={formCustomerCount}
                    onChange={(e) => setFormCustomerCount(Number(e.target.value))}
                    className="w-full h-8.5 px-3 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu chí phân khúc / Điều kiện lọc</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Số dư CASA > 1 tỷ hoặc doanh số giao dịch > 200tr/tháng"
                  value={formCriteria}
                  onChange={(e) => setFormCriteria(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm về mục đích của tệp"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full h-8.5 px-3 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nguồn dữ liệu</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full h-8.5 px-2.5 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none cursor-pointer"
                  >
                    <option value="CRM">CRM</option>
                    <option value="Core Banking">Core Banking</option>
                    <option value="Excel/CSV">Excel/CSV</option>
                    <option value="Thủ công">Thủ công</option>
                    <option value="Hệ thống tự động">Hệ thống tự động</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full h-8.5 px-2.5 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none cursor-pointer"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                  </select>
                </div>
              </div>

              {/* VIP Checkbox Highlight */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-md">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVip}
                    onChange={(e) => setFormIsVip(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      Đặt làm Tệp khách hàng VIP (Input cho Chat Routing)
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Tệp này sẽ ngay lập tức có mặt trong dropdown <strong>&quot;Tập khách hàng VIP&quot;</strong> khi bạn tạo hoặc chỉnh sửa quy tắc hàng đợi Chat.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUpsertModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#f25621] hover:bg-[#e04815] text-white rounded transition-colors shadow-2xs"
                >
                  {editingSegment ? 'Lưu thay đổi' : 'Tạo tệp khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW CUSTOMERS IN SEGMENT ================= */}
      {isPreviewModalOpen && previewSegment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>CHI TIẾT TỆP: {previewSegment.name}</span>
                  {previewSegment.isVip && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                      VIP CHAT ROUTING
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mã: {previewSegment.code} • Nguồn: {previewSegment.source} • Quy mô: {previewSegment.customerCount.toLocaleString('vi-VN')} khách hàng
                </p>
              </div>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1">Tiêu chí phân khúc:</span>
                <p className="text-slate-600">{previewSegment.criteria}</p>
              </div>

              <div>
                <div className="font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Mẫu danh sách khách hàng đại diện trong tệp (Sample 5 khách hàng):</span>
                  <span className="text-[11px] text-slate-400 font-normal">Cập nhật tự động từ {previewSegment.source}</span>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                        <th className="p-2">Mã KH</th>
                        <th className="p-2">Họ &amp; Tên</th>
                        <th className="p-2">Số điện thoại</th>
                        <th className="p-2">Hạng VIP</th>
                        <th className="p-2">Kênh tương tác gần nhất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {SAMPLE_VIP_CUSTOMERS_PREVIEW.default.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="p-2 font-mono text-[11px] text-slate-600">{c.customerId}</td>
                          <td className="p-2 font-semibold text-slate-800">{c.fullName}</td>
                          <td className="p-2 font-mono text-[11px] text-slate-600">{c.phone}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-[10px] border border-amber-200">
                              {c.tier}
                            </span>
                          </td>
                          <td className="p-2 text-slate-500 text-[11px]">{c.lastInteraction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {isDeleteModalOpen && deletingSegment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full p-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Xác nhận xóa tệp khách hàng</h3>
            <p className="text-xs text-slate-600 mb-4">
              Bạn có chắc chắn muốn xóa tệp <strong>&quot;{deletingSegment.name}&quot;</strong>? 
              {deletingSegment.isVip && (
                <span className="block text-amber-700 font-semibold mt-1">
                  ⚠️ Tệp này đang thuộc danh sách VIP của Chat Routing!
                </span>
              )}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setDeletingSegment(null);
                  setIsDeleteModalOpen(false);
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPORT EXCEL / CSV ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                NHẬP TỆP KHÁCH HÀNG TỪ EXCEL / CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#f25621] transition-colors cursor-pointer bg-slate-50/50 mb-4">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <div className="font-semibold text-slate-700">Kéo thả file Excel (.xlsx, .csv) vào đây</div>
              <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ file danh sách khách hàng VIP hoặc tập phân khúc</p>
            </div>

            <div className="space-y-2 mb-4 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
              <div className="font-semibold text-slate-700">Yêu cầu cấu trúc cột trong file:</div>
              <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                <li>Cột A: Mã khách hàng / ID</li>
                <li>Cột B: Họ và tên</li>
                <li>Cột C: Số điện thoại (bắt buộc)</li>
                <li>Cột D: Hạng thẻ / Tiêu chí VIP</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  // Simulate import
                  const newSeg = upsertCustomerSegment({
                    name: `Tệp VIP Import Excel (${new Date().toLocaleDateString('vi-VN')})`,
                    code: `TEP_IMPORT_${Date.now().toString().slice(-4)}`,
                    description: 'Danh sách khách hàng VIP nhập từ file Excel',
                    criteria: 'Được tải lên từ file bảng tính nghiệp vụ',
                    customerCount: 1250,
                    source: 'Excel/CSV',
                    isVip: true,
                    status: 'Hoạt động'
                  });
                  setIsImportModalOpen(false);
                  showToast(`Đã import thành công tệp "${newSeg.name}" vào danh sách VIP!`);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-2xs"
              >
                Tải lên &amp; Tự động kích hoạt VIP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
