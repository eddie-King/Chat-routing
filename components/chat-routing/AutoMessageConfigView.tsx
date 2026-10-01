'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Clock, 
  MessageSquare, 
  Check, 
  PhoneCall, 
  Share2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Copy, 
  Filter, 
  ChevronDown
} from 'lucide-react';
import { 
  AutoMessageCaseItem, 
  AutoMessageTriggerType,
  INITIAL_AUTO_MESSAGE_CASES,
  AUTO_MESSAGE_CATEGORIES,
  ALL_AUTO_MESSAGE_CHANNELS,
  TRIGGER_TYPE_OPTIONS,
  COMMON_AUTO_MESSAGE_VARIABLES
} from '@/lib/auto-message-data';

interface AutoMessageConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatRouting?: () => void;
  onSwitchToChatInputRouting?: () => void;
  onSwitchToSocialMedia?: () => void;
}

function ToggleSwitch({ 
  checked, 
  onChange, 
  size = 'md' 
}: { 
  checked: boolean; 
  onChange: (v: boolean) => void; 
  size?: 'sm' | 'md';
}) {
  const isSm = size === 'sm';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
        isSm ? 'h-4 w-7' : 'h-5 w-9'
      } ${checked ? 'bg-[#f25621]' : 'bg-slate-300'}`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          isSm ? (checked ? 'h-3 w-3 translate-x-3' : 'h-3 w-3 translate-x-0') : (checked ? 'h-4 w-4 translate-x-4' : 'h-4 w-4 translate-x-0')
        }`}
      />
    </button>
  );
}

export function AutoMessageConfigView({
  onSwitchToCallRouting,
  onSwitchToChatRouting,
  onSwitchToChatInputRouting,
  onSwitchToSocialMedia
}: AutoMessageConfigViewProps) {
  // Chỉ lưu và hiển thị đúng 3 data sample theo yêu cầu
  const [cases, setCases] = useState<AutoMessageCaseItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_auto_messages_v3_clean');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Giới hạn dữ liệu mẫu cũ nếu vượt quá 3
            if (parsed.length > 3 && parsed.some(p => p.id === 'CSAT_SURVEY' || p.id === 'QUEUE_OVERLOAD' || p.id === 'AUTO_CLOSE')) {
              const trimmed = INITIAL_AUTO_MESSAGE_CASES.slice(0, 3);
              localStorage.setItem('unispace_auto_messages_v3_clean', JSON.stringify(trimmed));
              return trimmed;
            }
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_AUTO_MESSAGE_CASES.slice(0, 3);
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    return INITIAL_AUTO_MESSAGE_CASES[0]?.id || 'WELCOME_MSG';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal thêm kịch bản mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseCategory, setNewCaseCategory] = useState<string>(AUTO_MESSAGE_CATEGORIES[1]);
  const [newCaseTriggerType, setNewCaseTriggerType] = useState<AutoMessageTriggerType>('WAIT_TIMEOUT');
  const [newCaseTriggerValue, setNewCaseTriggerValue] = useState<number>(5);
  const [newCaseTriggerUnit, setNewCaseTriggerUnit] = useState<'giây' | 'phút' | 'giờ' | 'khách'>('phút');
  const [newCaseTimeFrom, setNewCaseTimeFrom] = useState('22:00');
  const [newCaseTimeTo, setNewCaseTimeTo] = useState('08:00');
  const [newCaseChannels, setNewCaseChannels] = useState<string[]>(['Facebook', 'Zalo OA', 'Website LiveChat']);
  const [newCaseMessage, setNewCaseMessage] = useState('Xin chào {TEN_KHACH_HANG}, hệ thống đã nhận được tin nhắn của bạn.');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedCase = useMemo(() => {
    const found = cases.find(c => c.id === selectedCaseId);
    return found || cases[0] || null;
  }, [cases, selectedCaseId]);

  const persistCases = (updatedCases: AutoMessageCaseItem[]) => {
    setCases(updatedCases);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('unispace_auto_messages_v3_clean', JSON.stringify(updatedCases));
      } catch {
        // ignore
      }
    }
  };

  const updateCurrentCase = (updater: (prev: AutoMessageCaseItem) => AutoMessageCaseItem) => {
    if (!selectedCase) return;
    const nextCases = cases.map(c => c.id === selectedCase.id ? updater(c) : c);
    persistCases(nextCases);
  };

  const handleToggleCase = (id: string, newEnabled: boolean) => {
    const nextCases = cases.map(c => c.id === id ? { ...c, enabled: newEnabled } : c);
    persistCases(nextCases);
    showToast(newEnabled ? 'Đã kích hoạt' : 'Đã tạm dừng');
  };

  const handleDeleteCase = (id: string, name: string) => {
    if (cases.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 kịch bản!');
      return;
    }
    if (confirm(`Xóa kịch bản "${name}"?`)) {
      const nextCases = cases.filter(c => c.id !== id);
      persistCases(nextCases);
      if (selectedCaseId === id) {
        setSelectedCaseId(nextCases[0]?.id || '');
      }
      showToast('Đã xóa kịch bản');
    }
  };

  const handleDuplicateCase = (caseItem: AutoMessageCaseItem) => {
    const newId = `CASE_${Date.now()}`;
    const duplicated: AutoMessageCaseItem = {
      ...caseItem,
      id: newId,
      code: `AUTO_${Date.now().toString(36).toUpperCase()}`,
      name: `${caseItem.name} (Bản sao)`,
      priority: cases.length + 1,
      isCustom: true
    };
    const nextCases = [...cases, duplicated];
    persistCases(nextCases);
    setSelectedCaseId(newId);
    showToast('Đã nhân bản kịch bản');
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục về 3 kịch bản mặc định?')) {
      const resetList = INITIAL_AUTO_MESSAGE_CASES.slice(0, 3);
      persistCases(resetList);
      setSelectedCaseId(resetList[0]?.id || 'WELCOME_MSG');
      showToast('Đã khôi phục 3 kịch bản mẫu');
    }
  };

  const handleInsertVariable = (variableCode: string) => {
    if (!selectedCase) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = selectedCase.message;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + variableCode + after;
      updateCurrentCase(c => ({ ...c, message: newText }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableCode.length, start + variableCode.length);
      }, 50);
    } else {
      updateCurrentCase(c => ({ ...c, message: c.message + ' ' + variableCode }));
    }
  };

  const handleToggleChannel = (channel: string) => {
    if (!selectedCase) return;
    const exists = selectedCase.channels.includes(channel);
    const updatedChannels = exists
      ? selectedCase.channels.filter(ch => ch !== channel)
      : [...selectedCase.channels, channel];
    
    if (updatedChannels.length === 0) {
      showToast('Cần chọn ít nhất 1 kênh!');
      return;
    }
    updateCurrentCase(c => ({ ...c, channels: updatedChannels }));
  };

  const handleCreateNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseName.trim()) {
      showToast('Vui lòng nhập tên kịch bản!');
      return;
    }

    const typeConfig = TRIGGER_TYPE_OPTIONS.find(t => t.type === newCaseTriggerType);
    let summary = typeConfig?.label || 'Kích hoạt theo cấu hình';
    if (newCaseTriggerType === 'WAIT_TIMEOUT' || newCaseTriggerType === 'INACTIVITY_REMINDER' || newCaseTriggerType === 'AUTO_CLOSE') {
      summary = `Sau ${newCaseTriggerValue} ${newCaseTriggerUnit}`;
    } else if (newCaseTriggerType === 'QUEUE_OVERLOAD') {
      summary = `Hàng đợi quá tải (tự động tính)`;
    } else if (newCaseTriggerType === 'OFF_HOURS') {
      summary = `Ngoài giờ: ${newCaseTimeFrom} - ${newCaseTimeTo}`;
    }

    const newId = `CASE_${Date.now()}`;
    const newCaseItem: AutoMessageCaseItem = {
      id: newId,
      code: `AUTO_${Date.now().toString(36).toUpperCase()}`,
      name: newCaseName.trim(),
      description: newCaseName.trim(),
      category: newCaseCategory,
      enabled: true,
      priority: cases.length + 1,
      isCustom: true,
      trigger: {
        type: newCaseTriggerType,
        typeLabel: typeConfig?.label || 'Tùy chọn',
        value: newCaseTriggerValue,
        unit: newCaseTriggerUnit,
        timeFrom: newCaseTimeFrom,
        timeTo: newCaseTimeTo,
        summaryText: summary
      },
      message: newCaseMessage.trim() || 'Xin chào {TEN_KHACH_HANG}, hệ thống đã nhận được tin nhắn.',
      channels: newCaseChannels.length > 0 ? newCaseChannels : ['Facebook', 'Zalo OA', 'Website LiveChat'],
      variables: COMMON_AUTO_MESSAGE_VARIABLES.slice(0, 3)
    };

    const nextCases = [...cases, newCaseItem];
    persistCases(nextCases);
    setSelectedCaseId(newId);
    setIsAddModalOpen(false);
    setNewCaseName('');
    showToast('Đã thêm kịch bản mới');
  };

  const filteredCases = useMemo(() => {
    return cases.filter(item => {
      if (selectedCategory !== 'Tất cả' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return item.name.toLowerCase().includes(q) || 
               item.message.toLowerCase().includes(q) || 
               item.trigger.summaryText.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cases, selectedCategory, searchQuery]);

  const previewRenderedMessage = useMemo(() => {
    if (!selectedCase) return '';
    let text = selectedCase.message;
    text = text.replace(/{TEN_KHACH_HANG}/g, 'Nguyễn Văn An');
    text = text.replace(/{TEN_AGENT}/g, 'Lê Thanh Trúc');
    text = text.replace(/{TEN_HANG_DOI}/g, 'Hỗ trợ Kỹ thuật');
    text = text.replace(/{THOI_GIAN_CHO}/g, `${selectedCase.trigger.value || 5} phút`);
    text = text.replace(/{GIO_LAM_VIEC}/g, '08:00 - 22:00');
    text = text.replace(/{HOTLINE}/g, '1900 6868');
    return text;
  }, [selectedCase]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-150">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Card with Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f25621]">
            <Clock className="w-5 h-5" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            CẤU HÌNH TIN NHẮN TỰ ĐỘNG
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f25621] hover:bg-[#d94412] text-white text-xs font-semibold rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm kịch bản</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm kịch bản..."
            className="w-full h-8.5 pl-8 pr-3 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-[#f25621] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {AUTO_MESSAGE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap cursor-pointer border transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white border-slate-800 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 shrink-0">
          Tổng: <span className="font-semibold text-slate-800">{cases.length}</span> kịch bản
        </div>
      </div>

      {/* Bố cục 2 cột: Danh sách (Trái) & Chi tiết (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* CỘT TRÁI (40%): Danh sách kịch bản gọn gàng */}
        <div className="lg:col-span-5 space-y-2">
          {filteredCases.map((item, idx) => {
            const isSelected = selectedCase?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedCaseId(item.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#f25621] ring-1 ring-[#f25621] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Dòng 1: STT, Tên kịch bản & Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <ToggleSwitch
                      size="sm"
                      checked={item.enabled}
                      onChange={(val) => handleToggleCase(item.id, val)}
                    />
                  </div>
                </div>

                {/* Dòng 2: Điều kiện kích hoạt & Thao tác */}
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {item.trigger.summaryText}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCase(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Nhân bản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCase(item.id, item.name)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2 border border-dashed border-slate-300 hover:border-[#f25621] hover:bg-orange-50/20 text-slate-600 hover:text-[#f25621] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#f25621]" />
            <span>Thêm kịch bản (+)</span>
          </button>
        </div>

        {/* CỘT PHẢI (60%): Chi tiết & Form chỉnh sửa tinh gọn */}
        <div className="lg:col-span-7">
          {selectedCase && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
              
              {/* Header chi tiết */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    {selectedCase.name}
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                    {selectedCase.code}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={selectedCase.enabled}
                    onChange={(val) => handleToggleCase(selectedCase.id, val)}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCase(selectedCase.id, selectedCase.name)}
                    className="p-1.5 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Xóa kịch bản"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tên & Danh mục */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên kịch bản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedCase.name}
                    onChange={(e) => updateCurrentCase(c => ({ ...c, name: e.target.value }))}
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCase.category}
                      onChange={(e) => updateCurrentCase(c => ({ ...c, category: e.target.value }))}
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none appearance-none cursor-pointer"
                    >
                      {AUTO_MESSAGE_CATEGORIES.filter(c => c !== 'Tất cả').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Điều kiện kích hoạt */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Điều kiện kích hoạt <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCase.trigger.type}
                      onChange={(e) => {
                        const newType = e.target.value as AutoMessageTriggerType;
                        const opt = TRIGGER_TYPE_OPTIONS.find(t => t.type === newType);
                        updateCurrentCase(c => {
                          let summary = opt?.label || 'Kích hoạt theo cấu hình';
                          if (newType === 'WAIT_TIMEOUT' || newType === 'INACTIVITY_REMINDER' || newType === 'AUTO_CLOSE') {
                            summary = `Sau ${c.trigger.value || 5} ${c.trigger.unit || 'phút'}`;
                          } else if (newType === 'OFF_HOURS') {
                            summary = `Ngoài giờ: ${c.trigger.timeFrom || '22:00'} - ${c.trigger.timeTo || '08:00'}`;
                          } else if (newType === 'QUEUE_OVERLOAD') {
                            summary = `Hàng đợi quá tải (tự động tính)`;
                          }
                          return {
                            ...c,
                            trigger: {
                              ...c.trigger,
                              type: newType,
                              typeLabel: opt?.label || newType,
                              summaryText: summary
                            }
                          };
                        });
                      }}
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none appearance-none cursor-pointer"
                    >
                      {TRIGGER_TYPE_OPTIONS.map(opt => (
                        <option key={opt.type} value={opt.type}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Tham số chi tiết: Tách dòng rõ ràng theo từng loại điều kiện */}
                {/* 1. Nhóm cần THỜI GIAN CHỜ (SLA, Không tương tác, Tự đóng phiên) */}
                {(selectedCase.trigger.type === 'WAIT_TIMEOUT' || 
                  selectedCase.trigger.type === 'INACTIVITY_REMINDER' || 
                  selectedCase.trigger.type === 'AUTO_CLOSE') && (
                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-medium">
                      Thời gian chờ kích hoạt:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={3600}
                        value={selectedCase.trigger.value || 5}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          updateCurrentCase(c => ({
                            ...c,
                            trigger: {
                              ...c.trigger,
                              value: val,
                              summaryText: `Sau ${val} ${c.trigger.unit || 'phút'}`
                            }
                          }));
                        }}
                        className="w-16 h-8 text-center text-xs font-semibold bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                      />
                      <select
                        value={selectedCase.trigger.unit || 'phút'}
                        onChange={(e) => {
                          const unit = e.target.value as any;
                          updateCurrentCase(c => ({
                            ...c,
                            trigger: {
                              ...c.trigger,
                              unit,
                              summaryText: `Sau ${c.trigger.value || 5} ${unit}`
                            }
                          }));
                        }}
                        className="h-8 px-2 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none cursor-pointer"
                      >
                        <option value="giây">giây</option>
                        <option value="phút">phút</option>
                        <option value="giờ">giờ</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. Nhóm HÀNG ĐỢI QUÁ TẢI (Hệ thống tự động tính toán, không cần cấu hình số khách) */}
                {selectedCase.trigger.type === 'QUEUE_OVERLOAD' && (
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
                    <span>Quy tắc:</span>
                    <span className="font-medium text-slate-700">
                      Hệ thống tự động tính toán và kích hoạt khi hàng đợi vượt quá dung lượng tiếp nhận
                    </span>
                  </div>
                )}

                {/* 3. Nhóm NGOÀI GIỜ LÀM VIỆC (Dựa trên khung giờ) */}
                {selectedCase.trigger.type === 'OFF_HOURS' && (
                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-medium">
                      Khung giờ ngoài ca trực:
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>Từ</span>
                      <input
                        type="text"
                        value={selectedCase.trigger.timeFrom || '22:00'}
                        onChange={(e) => {
                          const from = e.target.value;
                          updateCurrentCase(c => ({
                            ...c,
                            trigger: {
                              ...c.trigger,
                              timeFrom: from,
                              summaryText: `Ngoài giờ: ${from} - ${c.trigger.timeTo || '08:00'}`
                            }
                          }));
                        }}
                        className="w-16 h-8 px-1.5 text-center text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-medium"
                        placeholder="22:00"
                      />
                      <span>đến</span>
                      <input
                        type="text"
                        value={selectedCase.trigger.timeTo || '08:00'}
                        onChange={(e) => {
                          const to = e.target.value;
                          updateCurrentCase(c => ({
                            ...c,
                            trigger: {
                              ...c.trigger,
                              timeTo: to,
                              summaryText: `Ngoài giờ: ${c.trigger.timeFrom || '22:00'} - ${to}`
                            }
                          }));
                        }}
                        className="w-16 h-8 px-1.5 text-center text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-medium"
                        placeholder="08:00"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Nhóm SỰ KIỆN TỨC THÌ (Lời chào ban đầu, Kết thúc phiên chat) */}
                {(selectedCase.trigger.type === 'IMMEDIATE' || selectedCase.trigger.type === 'SESSION_CLOSED') && (
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
                    <span>Quy tắc:</span>
                    <span className="font-medium text-slate-700">Kích hoạt tức thì khi sự kiện xảy ra (Không cần thời gian chờ)</span>
                  </div>
                )}
              </div>

              {/* Kênh áp dụng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kênh áp dụng <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {ALL_AUTO_MESSAGE_CHANNELS.map(channel => {
                    const isChecked = selectedCase.channels.includes(channel);
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => handleToggleChannel(channel)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-slate-100 border-slate-300 text-slate-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#f25621] focus:ring-[#f25621] h-3 w-3 pointer-events-none accent-[#f25621]"
                        />
                        <span>{channel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nội dung tin nhắn */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedCase.message.length} ký tự
                  </span>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={selectedCase.message}
                  onChange={(e) => updateCurrentCase(c => ({ ...c, message: e.target.value }))}
                  className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  placeholder="Nhập nội dung tin nhắn tự động..."
                />

                {/* Biến chèn */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="text-slate-400 mr-1">Chèn biến:</span>
                  {COMMON_AUTO_MESSAGE_VARIABLES.map(v => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => handleInsertVariable(v.code)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] border border-slate-200 cursor-pointer"
                      title={v.label}
                    >
                      {v.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Xem trước thực tế */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                  Xem trước:
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs max-w-md leading-relaxed">
                  {previewRenderedMessage}
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Đã lưu kịch bản')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#f25621] hover:bg-[#d94412] text-white text-xs font-semibold rounded transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Modal Thêm Kịch Bản Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Thêm kịch bản tin nhắn tự động
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCase} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên kịch bản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  placeholder="VD: Thông báo bảo trì hệ thống"
                  className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCaseCategory}
                    onChange={(e) => setNewCaseCategory(e.target.value)}
                    className="w-full h-8.5 px-2 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  >
                    {AUTO_MESSAGE_CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điều kiện kích hoạt <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCaseTriggerType}
                    onChange={(e) => setNewCaseTriggerType(e.target.value as AutoMessageTriggerType)}
                    className="w-full h-8.5 px-2 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  >
                    {TRIGGER_TYPE_OPTIONS.map(opt => (
                      <option key={opt.type} value={opt.type}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(newCaseTriggerType === 'WAIT_TIMEOUT' || newCaseTriggerType === 'INACTIVITY_REMINDER' || newCaseTriggerType === 'AUTO_CLOSE') && (
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">Thời gian chờ kích hoạt:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={newCaseTriggerValue}
                      onChange={(e) => setNewCaseTriggerValue(Number(e.target.value) || 1)}
                      className="w-16 h-7.5 text-center text-xs bg-white border border-slate-300 rounded font-semibold"
                    />
                    <select
                      value={newCaseTriggerUnit}
                      onChange={(e) => setNewCaseTriggerUnit(e.target.value as any)}
                      className="h-7.5 px-2 text-xs bg-white border border-slate-300 rounded cursor-pointer"
                    >
                      <option value="giây">giây</option>
                      <option value="phút">phút</option>
                      <option value="giờ">giờ</option>
                    </select>
                  </div>
                </div>
              )}

              {newCaseTriggerType === 'QUEUE_OVERLOAD' && (
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  <span>Quy tắc:</span>
                  <span className="font-medium text-slate-700">
                    Hệ thống tự động tính toán khi hàng đợi quá tải
                  </span>
                </div>
              )}

              {newCaseTriggerType === 'OFF_HOURS' && (
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-600 font-medium">Khung giờ ngoài ca trực:</span>
                  <div className="flex items-center gap-1">
                    <span>Từ</span>
                    <input
                      type="text"
                      value={newCaseTimeFrom}
                      onChange={(e) => setNewCaseTimeFrom(e.target.value)}
                      className="w-16 h-7.5 text-center text-xs bg-white border border-slate-300 rounded"
                      placeholder="22:00"
                    />
                    <span>đến</span>
                    <input
                      type="text"
                      value={newCaseTimeTo}
                      onChange={(e) => setNewCaseTimeTo(e.target.value)}
                      className="w-16 h-7.5 text-center text-xs bg-white border border-slate-300 rounded"
                      placeholder="08:00"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung tin nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCaseMessage}
                  onChange={(e) => setNewCaseMessage(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn tự động..."
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#f25621] hover:bg-[#d94412] text-white text-xs font-semibold rounded shadow-2xs cursor-pointer"
                >
                  Tạo kịch bản
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
