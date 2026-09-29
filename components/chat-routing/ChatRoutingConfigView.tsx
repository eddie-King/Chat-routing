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
  Check,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  Bot,
  Layers,
  Calendar,
  Share2,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  ChatRoutingConfigItem, 
  INITIAL_CHAT_ROUTING_CONFIGS, 
  CHAT_FALLBACK_OPTIONS,
  CHAT_SOURCES,
  CHAT_OUTPUT_OPTIONS
} from '@/lib/chat-routing-data';
import { ChatRoutingModal } from './ChatRoutingModal';
import { ChatRoutingDetailModal } from './ChatRoutingDetailModal';
import { DeleteConfirmModal } from '../call-routing/DeleteConfirmModal';

interface ChatRoutingConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatInputRouting?: () => void;
  onSwitchToSocialMedia?: () => void;
  onSwitchToAutoMessages?: () => void;
}

export function ChatRoutingConfigView({ 
  onSwitchToCallRouting, 
  onSwitchToChatInputRouting,
  onSwitchToSocialMedia,
  onSwitchToAutoMessages
}: ChatRoutingConfigViewProps) {
  const [dataList, setDataList] = useState<ChatRoutingConfigItem[]>(INITIAL_CHAT_ROUTING_CONFIGS);

  // Filter states
  const [filterQueue, setFilterQueue] = useState<string>('Tất cả');
  const [filterSource, setFilterSource] = useState<string>('Tất cả');
  const [filterOutput, setFilterOutput] = useState<string>('Tất cả');
  const [filterVIP, setFilterVIP] = useState<string>('Tất cả');
  const [filterStandard, setFilterStandard] = useState<string>('Tất cả');
  const [filterFallback, setFilterFallback] = useState<string>('Tất cả');
  const [filterDate, setFilterDate] = useState<string>('');

  // Sorting
  type SortField = 'queueName' | 'queueCode' | 'inputOutput' | 'routingVIP' | 'routingStandard' | 'fallbackAction' | 'createdAt';
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChatRoutingConfigItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ChatRoutingConfigItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ChatRoutingConfigItem | null>(null);

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
    setFilterQueue('Tất cả');
    setFilterSource('Tất cả');
    setFilterOutput('Tất cả');
    setFilterVIP('Tất cả');
    setFilterStandard('Tất cả');
    setFilterFallback('Tất cả');
    setFilterDate('');
    setCurrentPage(1);
    showToast('Đã làm mới bộ lọc tìm kiếm Chat Routing');
  };

  // Distinct queue list for filter
  const uniqueQueueNames = useMemo(() => {
    return Array.from(new Set(dataList.map(item => item.queueName || item.name || item.queueCode)));
  }, [dataList]);

  // Distinct input outcome list for filter
  const uniqueInputOptions = useMemo(() => {
    const set = new Set<string>();
    dataList.forEach(item => {
      if (item.inputOutput) set.add(item.inputOutput);
    });
    return Array.from(set);
  }, [dataList]);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return dataList.filter(item => {
      const qName = item.queueName || item.name || '';
      if (filterQueue !== 'Tất cả' && qName !== filterQueue) return false;
      if (filterSource !== 'Tất cả') {
        const itemSources = item.chatSources || item.intakeChannels || [];
        if (!itemSources.includes(filterSource)) return false;
      }
      if (filterOutput !== 'Tất cả') {
        const itemOutput = item.inputOutput || '';
        if (!itemOutput.includes(filterOutput)) return false;
      }
      if (filterVIP !== 'Tất cả' && item.routingVIP !== filterVIP) return false;
      if (filterStandard !== 'Tất cả' && item.routingStandard !== filterStandard) return false;
      if (filterFallback !== 'Tất cả' && item.fallbackAction !== filterFallback) return false;
      if (filterDate.trim()) {
        const query = filterDate.trim().toLowerCase();
        const dateMatch = item.createdAt.toLowerCase().includes(query);
        if (!dateMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = (a[sortField] || (a as any).name || '') as string;
      let valB = (b[sortField] || (b as any).name || '') as string;

      if (sortField === 'createdAt') {
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
  }, [dataList, filterQueue, filterSource, filterOutput, filterVIP, filterStandard, filterFallback, filterDate, sortField, sortDirection]);

  // Paginated Data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Save (Create or Edit)
  const handleSaveItem = (savedItem: ChatRoutingConfigItem) => {
    if (selectedItem) {
      setDataList(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      showToast(`Đã cập nhật hàng đợi ${savedItem.queueName} (${savedItem.queueCode})`);
    } else {
      setDataList(prev => [savedItem, ...prev]);
      showToast(`Đã tạo hàng đợi Chat mới: ${savedItem.queueName}`);
    }
    setIsCreateEditOpen(false);
    setSelectedItem(null);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    setDataList(prev => prev.filter(item => item.id !== deleteItem.id));
    showToast(`Đã xóa cấu hình Hàng đợi ${deleteItem.queueCode}`);
    setIsDeleteOpen(false);
    setDeleteItem(null);
  };

  // Sort Icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#f25621] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#f25621] ml-1 inline" />
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation Submenu Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:px-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Định tuyến đa kênh /</span>
          <span className="font-semibold text-slate-700">Cấu hình định tuyến</span>
        </div>

        {/* Submenu Switcher Buttons */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
          <button
            onClick={onSwitchToCallRouting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            <span>Call Routing (Thoại)</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#f25621] bg-white shadow-2xs transition-colors cursor-default"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#f25621]" />
            <span>Chat Routing (Tin nhắn)</span>
            <span className="w-2 h-2 rounded-full bg-[#f25621] ml-0.5 animate-pulse" />
          </button>
          {onSwitchToChatInputRouting && (
            <button
              onClick={onSwitchToChatInputRouting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
              title="Cấu hình Input Chat Routing (Type, Value, Output)"
            >
              <Filter className="w-3.5 h-3.5 text-[#f25621]" />
              <span>Cấu hình Input Chat</span>
            </button>
          )}
          {onSwitchToSocialMedia && (
            <button
              onClick={onSwitchToSocialMedia}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Kênh Mạng Xã Hội</span>
            </button>
          )}
          {onSwitchToAutoMessages && (
            <button
              onClick={onSwitchToAutoMessages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
              title="Cấu hình tin nhắn tự động khi quá thời gian chờ và tự động đóng phiên"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Tin nhắn tự động (SLA)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-md shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
        
        {/* Top Header: Title and Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#f25621] tracking-wide uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#f25621]" />
              CẤU HÌNH ĐỊNH TUYẾN CHAT (CHAT ROUTING)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý quy tắc phân bổ phiên chat vào hệ thống theo hàng đợi tiếp nhận
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onSwitchToChatInputRouting && (
              <button
                type="button"
                onClick={onSwitchToChatInputRouting}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                title="Cấu hình điều kiện Input (Type, Value, Output)"
              >
                <Filter className="w-3.5 h-3.5 text-[#f25621]" />
                <span>Cấu hình Input Chat</span>
              </button>
            )}
            <button
              id="btn-create-new-chat-routing"
              onClick={() => {
                setSelectedItem(null);
                setIsCreateEditOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo mới</span>
            </button>
          </div>
        </div>

        {/* Filter / Search Form */}
        <div className="space-y-4">
          
          {/* Row 1: Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Lọc Hàng đợi Chat */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Hàng đợi Chat (Queue)
              </label>
              <div className="relative">
                <select
                  value={filterQueue}
                  onChange={(e) => {
                    setFilterQueue(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] cursor-pointer shadow-2xs truncate"
                >
                  <option value="Tất cả">Tất cả hàng đợi</option>
                  {uniqueQueueNames.map((qn) => (
                    <option key={qn} value={qn}>{qn}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Lọc theo Nguồn tiếp nhận chat */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Nguồn tiếp nhận chat
              </label>
              <div className="relative">
                <select
                  value={filterSource}
                  onChange={(e) => {
                    setFilterSource(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] cursor-pointer shadow-2xs truncate"
                >
                  <option value="Tất cả">Tất cả nguồn chat</option>
                  {CHAT_SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Lọc theo Input */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Input
              </label>
              <div className="relative">
                <select
                  value={filterOutput}
                  onChange={(e) => {
                    setFilterOutput(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] cursor-pointer shadow-2xs truncate"
                >
                  <option value="Tất cả">Tất cả Input</option>
                  {uniqueInputOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
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
                  value={filterVIP}
                  onChange={(e) => {
                    setFilterVIP(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] cursor-pointer shadow-2xs"
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
                  value={filterStandard}
                  onChange={(e) => {
                    setFilterStandard(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] cursor-pointer shadow-2xs"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Có">Có</option>
                  <option value="Không">Không</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Row 2: Fallback + Ngày tạo + Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            
            {/* Hành động Fallback */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Fallback
              </label>
              <div className="relative">
                <select
                  value={filterFallback}
                  onChange={(e) => {
                    setFilterFallback(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] cursor-pointer shadow-2xs truncate"
                >
                  <option value="Tất cả">Tất cả fallback</option>
                  {CHAT_FALLBACK_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Ngày tạo */}
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Ngày tạo
              </label>
              <div className="relative">
                <input
                  id="filter-date-chat-routing"
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white text-xs text-slate-700 border border-slate-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#f25621] shadow-2xs"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons: Tìm kiếm & Làm mới */}
            <div className="sm:col-span-1 lg:col-span-3 flex items-center gap-2 pt-1">
              <button
                id="btn-search-chat-routing"
                onClick={() => setCurrentPage(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-medium rounded transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tìm kiếm</span>
              </button>

              <button
                id="btn-reset-filter-chat-routing"
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
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none whitespace-nowrap">
                <th className="py-2.5 px-3 text-center w-20">Thao tác</th>
                
                <th 
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors group min-w-[220px]"
                  onClick={() => handleSort('queueName')}
                >
                  <div className="flex items-center">
                    <span>Hàng đợi Chat (Queue Name & Code)</span>
                    {renderSortIcon('queueName')}
                  </div>
                </th>

                <th 
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors group min-w-[200px]"
                  onClick={() => handleSort('inputOutput')}
                >
                  <div className="flex items-center">
                    <span>Input</span>
                    {renderSortIcon('inputOutput')}
                  </div>
                </th>

                <th 
                  className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors group w-20"
                  onClick={() => handleSort('routingVIP')}
                >
                  <div className="flex items-center justify-center">
                    <span>VIP</span>
                    {renderSortIcon('routingVIP')}
                  </div>
                </th>

                <th 
                  className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors group w-20"
                  onClick={() => handleSort('routingStandard')}
                >
                  <div className="flex items-center justify-center">
                    <span>Thường</span>
                    {renderSortIcon('routingStandard')}
                  </div>
                </th>

                <th 
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors group min-w-[160px]"
                  onClick={() => handleSort('fallbackAction')}
                >
                  <div className="flex items-center">
                    <span>Hành động Fallback</span>
                    {renderSortIcon('fallbackAction')}
                  </div>
                </th>

                <th className="py-2.5 px-3 min-w-[170px]">
                  <span>Hàng đợi VIP / Thường</span>
                </th>

                <th 
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors group w-36"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    <span>Ngày tạo</span>
                    {renderSortIcon('createdAt')}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Actions: Info, Edit, Delete */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setDetailItem(item);
                            setIsDetailOpen(true);
                          }}
                          title="Xem chi tiết hàng đợi Chat"
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsCreateEditOpen(true);
                          }}
                          title="Chỉnh sửa hàng đợi"
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem(item);
                            setIsDeleteOpen(true);
                          }}
                          title="Xóa hàng đợi"
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Hàng đợi Chat & Mã Queue */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 text-xs">
                        {item.queueName || item.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-[#f25621] bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                          {item.queueCode}
                        </span>
                      </div>
                    </td>

                    {/* Cột Input - hiển thị 1 giá trị outcome ví dụ: INPUT_FB_TECH_SUPPORT */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {item.inputOutput || 'INPUT_FB_TECH_SUPPORT'}
                      </span>
                    </td>

                    {/* Routing VIP */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.routingVIP === 'Có' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.routingVIP}
                      </span>
                    </td>

                    {/* Routing thường */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.routingStandard === 'Có' ? 'bg-orange-50 text-[#f25621] border border-orange-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.routingStandard}
                      </span>
                    </td>

                    {/* Hành động Fallback */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-700 text-xs font-medium flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#f25621] shrink-0" />
                        <span className="truncate max-w-[160px]" title={item.fallbackAction}>{item.fallbackAction}</span>
                      </span>
                    </td>

                    {/* Hàng đợi VIP / Thường */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.routingVIP === 'Có' && (
                        <div className="text-[11px] text-slate-800 font-medium">
                          <span className="font-semibold text-[#f25621]">VIP:</span> Queue {item.vipQueueSize ?? 15} • Chờ {item.vipQueueWaitTime ?? 25}s
                        </div>
                      )}
                      {item.routingStandard === 'Có' && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-700">Thường:</span> Queue {item.stdQueueSize ?? 30} • Chờ {item.stdQueueWaitTime ?? 45}s
                        </div>
                      )}
                      {item.routingVIP !== 'Có' && item.routingStandard !== 'Có' && (
                        <div className="text-[11px] text-slate-400 italic">
                          Chưa bật luồng định tuyến
                        </div>
                      )}
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {item.createdAt}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <span>Không tìm thấy bản ghi cấu hình Chat Routing phù hợp</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          
          {/* Items count & Per Page Selector */}
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>/ trang. Tổng số: <strong className="text-slate-800">{totalItems}</strong> hàng đợi</span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1 select-none">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-xs"
              title="Trang đầu"
            >
              «
            </button>

            {/* Prev */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-xs"
              title="Trang trước"
            >
              ‹
            </button>

            {/* Page indicator */}
            <span className="px-3 py-1 font-medium text-slate-700">
              Trang {currentPage} / {totalPages}
            </span>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-xs"
              title="Trang tiếp"
            >
              ›
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-xs"
              title="Trang cuối"
            >
              »
            </button>
          </div>

        </div>

      </div>

      {/* Chat Routing Create/Edit Modal */}
      <ChatRoutingModal
        isOpen={isCreateEditOpen}
        onClose={() => {
          setIsCreateEditOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveItem}
        initialData={selectedItem}
        onNavigateToInputConfig={onSwitchToChatInputRouting}
      />

      {/* Chat Routing Detail Modal */}
      <ChatRoutingDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        item={detailItem}
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
        itemLabel={deleteItem ? `${deleteItem.queueName || deleteItem.name} (${deleteItem.queueCode})` : ''}
      />

    </div>
  );
}
