'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Filter, 
  Plus, 
  Trash2, 
  Check, 
  PhoneCall, 
  MessageSquare, 
  Share2, 
  Clock, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';
import { 
  ChatRoutingInputFilterItem, 
  ChatRoutingInputType,
  INITIAL_CHAT_INPUT_FILTERS, 
  CHAT_SOURCES, 
  CHAT_PAGES_BY_SOURCE,
  OMNICHANNEL_INTAKE_CHANNELS
} from '@/lib/chat-routing-data';

interface ChatRoutingInputConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatRouting?: () => void;
  onSwitchToSocialMedia?: () => void;
  onSwitchToAutoMessages?: () => void;
}

export function ChatRoutingInputConfigView({
  onSwitchToCallRouting,
  onSwitchToChatRouting,
  onSwitchToSocialMedia,
  onSwitchToAutoMessages
}: ChatRoutingInputConfigViewProps) {
  // Danh sách các dòng điều kiện (Mỗi dòng là 1 điều kiện gồm 3 cột: Type - Value - Output)
  const [conditions, setConditions] = useState<ChatRoutingInputFilterItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_chat_input_conditions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (parsed.length > 3 && parsed.some(p => p.id === 'flt-4' || p.id === 'flt-5' || p.id === 'flt-6')) {
              const cleaned = parsed.filter(p => !['flt-4', 'flt-5', 'flt-6'].includes(p.id)).slice(0, 3);
              localStorage.setItem('unispace_chat_input_conditions', JSON.stringify(cleaned));
              return cleaned;
            }
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_CHAT_INPUT_FILTERS.slice(0, 3);
  });

  // Quản lý việc mở popover chọn Value của từng dòng
  const [openDropdownRowId, setOpenDropdownRowId] = useState<string | null>(null);
  const [customValueText, setCustomValueText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownRowId(null);
        setCustomValueText('');
      }
    }
    if (openDropdownRowId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownRowId]);

  // Danh sách các giá trị có thể chọn dựa theo Type
  const getAvailableOptions = (type: ChatRoutingInputType) => {
    if (type === 'Nguồn') {
      return [...CHAT_SOURCES];
    }
    if (type === 'Page') {
      const fbPages = (CHAT_PAGES_BY_SOURCE.Facebook || []).map(p => p.name);
      const zaloPages = (CHAT_PAGES_BY_SOURCE.Zalo || []).map(p => p.name);
      return Array.from(new Set([...fbPages, ...zaloPages]));
    }
    return [...OMNICHANNEL_INTAKE_CHANNELS];
  };

  // Thêm 1 dòng điều kiện bên dưới
  const handleAddConditionRow = () => {
    const nextIndex = conditions.length + 1;
    const defaultPages = (CHAT_PAGES_BY_SOURCE.Facebook || []).slice(0, 2).map(p => p.name);
    const newRow: ChatRoutingInputFilterItem = {
      id: `input-flt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'Page',
      values: defaultPages.length > 0 ? defaultPages : ['UCX Customer Support'],
      output: `INPUT_FILTER_${nextIndex}`,
      description: 'Điều kiện tiếp nhận lọc theo Page',
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'Hoạt động'
    };

    setConditions(prev => [...prev, newRow]);
    showToast('Đã thêm 1 dòng điều kiện mới bên dưới.');
  };

  // Xóa 1 dòng điều kiện
  const handleDeleteRow = (id: string) => {
    if (conditions.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 dòng điều kiện!');
      return;
    }
    setConditions(prev => prev.filter(item => item.id !== id));
    showToast('Đã xóa dòng điều kiện.');
  };

  // Đổi Type của 1 dòng
  const handleTypeChange = (id: string, newType: ChatRoutingInputType) => {
    setConditions(prev => prev.map(item => {
      if (item.id !== id) return item;

      let newValues: string[] = [];
      let newOutput = item.output;

      if (newType === 'Nguồn') {
        newValues = ['Facebook', 'Zalo'];
        if (!item.output || item.output.startsWith('INPUT_')) {
          newOutput = `INPUT_NGUON_${item.id.slice(-4)}`;
        }
      } else if (newType === 'Page') {
        const pages = (CHAT_PAGES_BY_SOURCE.Facebook || []).slice(0, 2).map(p => p.name);
        newValues = pages;
        if (!item.output || item.output.startsWith('INPUT_')) {
          newOutput = `INPUT_PAGE_${item.id.slice(-4)}`;
        }
      } else {
        newValues = ['Facebook', 'Zalo'];
        if (!item.output || item.output.startsWith('INPUT_')) {
          newOutput = `INPUT_KENH_${item.id.slice(-4)}`;
        }
      }

      return {
        ...item,
        type: newType,
        values: newValues,
        output: newOutput
      };
    }));
  };

  // Toggle chọn một giá trị trong danh sách Value của dòng
  const handleToggleValue = (id: string, val: string) => {
    setConditions(prev => prev.map(item => {
      if (item.id !== id) return item;
      const isExist = item.values.includes(val);
      const nextVals = isExist 
        ? item.values.filter(v => v !== val)
        : [...item.values, val];
      return {
        ...item,
        values: nextVals
      };
    }));
  };

  // Chọn tất cả các giá trị của dòng
  const handleSelectAllValues = (id: string, type: ChatRoutingInputType) => {
    const all = getAvailableOptions(type);
    setConditions(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        values: [...all]
      };
    }));
  };

  // Bỏ chọn tất cả của dòng
  const handleClearAllValues = (id: string) => {
    setConditions(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        values: []
      };
    }));
  };

  // Thêm custom value vào dòng đang mở
  const handleAddCustomValue = (id: string) => {
    const trimmed = customValueText.trim();
    if (!trimmed) return;
    setConditions(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (item.values.includes(trimmed)) return item;
      return {
        ...item,
        values: [...item.values, trimmed]
      };
    }));
    setCustomValueText('');
  };

  // Thay đổi Output của 1 dòng
  const handleOutputChange = (id: string, val: string) => {
    const formatted = val.toUpperCase().replace(/\s+/g, '_');
    setConditions(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        output: formatted
      };
    }));
  };

  // Lưu toàn bộ cấu hình
  const handleSaveAll = () => {
    // Validate
    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      if (!c.output.trim()) {
        showToast(`Dòng ${i + 1}: Vui lòng nhập tên cho Output!`);
        return;
      }
      if (c.values.length === 0) {
        showToast(`Dòng ${i + 1}: Vui lòng chọn ít nhất 1 giá trị trong cột Value!`);
        return;
      }
    }

    // Persist
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('unispace_chat_input_conditions', JSON.stringify(conditions));
      } catch {
        // ignore
      }
    }

    // Sync in-memory global array
    try {
      INITIAL_CHAT_INPUT_FILTERS.splice(0, INITIAL_CHAT_INPUT_FILTERS.length, ...conditions);
    } catch {
      // ignore
    }

    showToast(`Đã lưu thành công ${conditions.length} dòng điều kiện Input Chat Routing!`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-150">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f25621]">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              CẤU HÌNH INPUT CHAT ROUTING
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onSwitchToChatRouting && (
            <button
              type="button"
              onClick={onSwitchToChatRouting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Định tuyến Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddConditionRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#f25621] stroke-[2.5]" />
            <span>Thêm dòng điều kiện</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#d94412] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>

      {/* DANH SÁCH CÁC DÒNG ĐIỀU KIỆN */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
        {conditions.map((row, index) => {
          const availableOptions = getAvailableOptions(row.type);
          const isDropdownOpen = openDropdownRowId === row.id;

          return (
            <div 
              key={row.id}
              className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors relative"
            >
              {/* Header row: STT and Delete button */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center border border-slate-200">
                    {index + 1}
                  </span>
                  <span>Điều kiện {index + 1}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteRow(row.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Xóa dòng điều kiện"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Cột: Type - Value - Output */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* CỘT 1: Type */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={row.type}
                      onChange={(e) => handleTypeChange(row.id, e.target.value as ChatRoutingInputType)}
                      className="w-full h-9.5 px-3 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer appearance-none shadow-2xs"
                    >
                      <option value="Page">Page (Fanpage, Zalo OA...)</option>
                      <option value="Nguồn">Nguồn (Facebook, Zalo...)</option>
                      <option value="Kênh tiếp nhận">Kênh tiếp nhận (Omnichannel)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* CỘT 2: Value */}
                <div className="lg:col-span-5 relative" ref={isDropdownOpen ? dropdownRef : undefined}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Value <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleSelectAllValues(row.id, row.type)}
                        className="text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleClearAllValues(row.id)}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {/* Tag preview + selector */}
                  <div 
                    onClick={() => setOpenDropdownRowId(isDropdownOpen ? null : row.id)}
                    className={`w-full min-h-9.5 px-2.5 py-1.5 bg-white border ${
                      isDropdownOpen ? 'border-[#f25621] ring-1 ring-[#f25621]' : 'border-slate-300 hover:border-slate-400'
                    } rounded cursor-pointer transition-colors shadow-2xs flex flex-wrap items-center gap-1.5 justify-between`}
                  >
                    <div className="flex flex-wrap items-center gap-1 overflow-hidden flex-1">
                      {row.values.length === 0 ? (
                        <span className="text-xs text-slate-400">Chọn giá trị...</span>
                      ) : (
                        row.values.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            <span className="truncate max-w-[150px]">{val}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleValue(row.id, val);
                              }}
                              className="hover:text-red-700 text-slate-400 ml-0.5 cursor-pointer font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {row.values.length}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px]">
                        <span className="font-semibold text-slate-700">
                          {row.type === 'Nguồn' ? 'Nguồn chat' : 'Page / OA'}:
                        </span>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownRowId(null)}
                          className="text-slate-500 hover:text-slate-800 text-[11px] font-medium cursor-pointer"
                        >
                          Đóng
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {availableOptions.map((opt) => {
                          const isChecked = row.values.includes(opt);
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                                isChecked
                                  ? 'bg-slate-100 text-slate-900 font-medium'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleValue(row.id, opt)}
                                className="rounded text-[#f25621] focus:ring-[#f25621] h-3.5 w-3.5 cursor-pointer accent-[#f25621]"
                              />
                              <span className="truncate">{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Custom value input */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={customValueText}
                          onChange={(e) => setCustomValueText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomValue(row.id);
                            }
                          }}
                          placeholder={`+ Thêm ${row.type}...`}
                          className="h-7 px-2 text-[11px] border border-slate-200 rounded flex-1 focus:border-[#f25621] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomValue(row.id)}
                          disabled={!customValueText.trim()}
                          className="h-7 px-2 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded cursor-pointer"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* CỘT 3: Output */}
                <div className="lg:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Output <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={row.output}
                    onChange={(e) => handleOutputChange(row.id, e.target.value)}
                    placeholder="VD: INPUT_FB_SUPPORT"
                    className="w-full h-9.5 px-3 text-xs font-mono font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors shadow-2xs"
                  />
                </div>

              </div>

            </div>
          );
        })}

        {/* NÚT THÊM DÒNG ĐIỀU KIỆN BÊN DƯỚI */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddConditionRow}
            className="w-full py-2.5 border border-dashed border-slate-300 hover:border-[#f25621] hover:bg-orange-50/20 text-slate-600 hover:text-[#f25621] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#f25621]" />
            <span>Thêm dòng điều kiện</span>
          </button>
        </div>

        {/* Thanh nút Lưu cấu hình bên dưới */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleAddConditionRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#f25621] stroke-[2.5]" />
            <span>Thêm dòng</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#f25621] hover:bg-[#d94412] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Lưu cấu hình</span>
          </button>
        </div>

      </div>

    </div>
  );
}
