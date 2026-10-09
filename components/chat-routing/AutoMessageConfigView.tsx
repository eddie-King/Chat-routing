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

function generateAutoMessageId(): { id: string; code: string } {
  const timestamp = Date.now();
  return {
    id: `CASE_${timestamp}`,
    code: `AUTO_${timestamp.toString(36).toUpperCase()}`
  };
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

  // Chế độ thêm kịch bản mới trực tiếp ở ô bên phải
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draftCase, setDraftCase] = useState<AutoMessageCaseItem>(() => ({
    id: 'NEW',
    code: 'AUTO_NEW',
    name: '',
    description: '',
    category: AUTO_MESSAGE_CATEGORIES.find(c => c !== 'Tất cả') || 'Lời chào',
    enabled: true,
    priority: 1,
    isCustom: true,
    trigger: {
      type: 'IMMEDIATE',
      typeLabel: 'Ngay khi mở phiên chat (Sự kiện tức thì)',
      value: 5,
      unit: 'phút',
      summaryText: 'Ngay khi mở phiên chat'
    },
    message: '',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: COMMON_AUTO_MESSAGE_VARIABLES.slice(0, 3)
  }));

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedCase = useMemo(() => {
    const found = cases.find(c => c.id === selectedCaseId);
    return found || cases[0] || null;
  }, [cases, selectedCaseId]);

  const activeCase = useMemo(() => {
    if (isCreatingNew) return draftCase;
    return selectedCase;
  }, [isCreatingNew, draftCase, selectedCase]);

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

  const updateActiveCase = (updater: (prev: AutoMessageCaseItem) => AutoMessageCaseItem) => {
    if (isCreatingNew) {
      setDraftCase(prev => updater(prev));
    } else if (selectedCase) {
      const updated = updater(selectedCase);
      const nextCases = cases.map(c => c.id === selectedCase.id ? updated : c);
      persistCases(nextCases);
    }
  };

  const handleStartCreateNew = () => {
    const { code } = generateAutoMessageId();
    setDraftCase({
      id: 'NEW',
      code: code,
      name: '',
      description: '',
      category: AUTO_MESSAGE_CATEGORIES.find(c => c !== 'Tất cả') || 'Lời chào',
      enabled: true,
      priority: cases.length + 1,
      isCustom: true,
      trigger: {
        type: 'IMMEDIATE',
        typeLabel: 'Ngay khi mở phiên chat (Sự kiện tức thì)',
        value: 5,
        unit: 'phút',
        summaryText: 'Ngay khi mở phiên chat'
      },
      message: '',
      channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
      variables: COMMON_AUTO_MESSAGE_VARIABLES.slice(0, 3)
    });
    setIsCreatingNew(true);
  };

  const handleCancelCreateNew = () => {
    setIsCreatingNew(false);
  };

  const handleSaveActiveCase = () => {
    if (isCreatingNew) {
      if (!draftCase.name.trim()) {
        showToast('Vui lòng nhập tên kịch bản!');
        return;
      }
      if (!draftCase.message.trim()) {
        showToast('Vui lòng nhập nội dung tin nhắn!');
        return;
      }
      const { id: newId } = generateAutoMessageId();
      const newItem: AutoMessageCaseItem = {
        ...draftCase,
        id: newId,
        name: draftCase.name.trim(),
        description: draftCase.name.trim(),
        message: draftCase.message.trim()
      };
      const nextCases = [...cases, newItem];
      persistCases(nextCases);
      setIsCreatingNew(false);
      setSelectedCaseId(newId);
      showToast('Đã thêm kịch bản mới thành công!');
    } else if (activeCase) {
      if (!activeCase.name.trim()) {
        showToast('Vui lòng nhập tên kịch bản!');
        return;
      }
      if (!activeCase.message.trim()) {
        showToast('Vui lòng nhập nội dung tin nhắn!');
        return;
      }
      persistCases(cases);
      showToast('Đã lưu thay đổi kịch bản!');
    }
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
    const { id: newId, code: newCode } = generateAutoMessageId();
    const duplicated: AutoMessageCaseItem = {
      ...caseItem,
      id: newId,
      code: newCode,
      name: `${caseItem.name} (Bản sao)`,
      priority: cases.length + 1,
      isCustom: true
    };
    const nextCases = [...cases, duplicated];
    persistCases(nextCases);
    setSelectedCaseId(newId);
    setIsCreatingNew(false);
    showToast('Đã nhân bản kịch bản');
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục về 3 kịch bản mặc định?')) {
      const resetList = INITIAL_AUTO_MESSAGE_CASES.slice(0, 3);
      persistCases(resetList);
      setIsCreatingNew(false);
      setSelectedCaseId(resetList[0]?.id || 'WELCOME_MSG');
      showToast('Đã khôi phục 3 kịch bản mẫu');
    }
  };

  const handleInsertVariable = (variableCode: string) => {
    if (!activeCase) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = activeCase.message;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + variableCode + after;
      updateActiveCase(c => ({ ...c, message: newText }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableCode.length, start + variableCode.length);
      }, 50);
    } else {
      updateActiveCase(c => ({ ...c, message: activeCase.message + ' ' + variableCode }));
    }
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
    if (!activeCase) return '';
    let text = activeCase.message;
    text = text.replace(/{TEN_KHACH_HANG}/g, 'Nguyễn Văn An');
    text = text.replace(/{TEN_AGENT}/g, 'Lê Thanh Trúc');
    text = text.replace(/{TEN_HANG_DOI}/g, 'Hỗ trợ Kỹ thuật');
    text = text.replace(/{THOI_GIAN_CHO}/g, `${activeCase.trigger.value || 5} phút`);
    text = text.replace(/{GIO_LAM_VIEC}/g, '08:00 - 22:00');
    text = text.replace(/{HOTLINE}/g, '1900 6868');
    return text;
  }, [activeCase]);

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
            onClick={handleStartCreateNew}
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
                onClick={() => {
                  setIsCreatingNew(false);
                  setSelectedCaseId(item.id);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer bg-white ${
                  !isCreatingNew && isSelected
                    ? 'border-[#f25621] ring-1 ring-[#f25621] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* STT, Tên kịch bản & Thao tác */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCase(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Nhân bản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCase(item.id, item.name)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ToggleSwitch
                      size="sm"
                      checked={item.enabled}
                      onChange={(val) => handleToggleCase(item.id, val)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Item nháp khi đang tạo kịch bản mới */}
          {isCreatingNew && (
            <div className="p-3 rounded-lg border-2 border-dashed border-[#f25621] bg-orange-50/40 text-xs font-semibold text-[#f25621] flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded bg-[#f25621] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  +
                </span>
                <span className="truncate text-slate-900">
                  {draftCase.name.trim() || 'Kịch bản mới (Đang soạn thảo...)'}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-[#f25621] text-white px-2 py-0.5 rounded shadow-2xs">
                MỚI
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartCreateNew}
            className="w-full py-2 border border-dashed border-slate-300 hover:border-[#f25621] hover:bg-orange-50/20 text-slate-600 hover:text-[#f25621] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#f25621]" />
            <span>Thêm kịch bản (+)</span>
          </button>
        </div>

        {/* CỘT PHẢI (60%): Chi tiết & Form chỉnh sửa / Thêm mới kịch bản */}
        <div className="lg:col-span-7">
          {activeCase && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
              
              {/* Header chi tiết */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    {isCreatingNew ? (draftCase.name.trim() || 'Thêm kịch bản mới') : activeCase.name}
                  </h2>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isCreatingNew ? 'bg-orange-100 text-[#f25621] font-bold' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activeCase.code} {isCreatingNew && '• MỚI'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={activeCase.enabled}
                    onChange={(val) => updateActiveCase(c => ({ ...c, enabled: val }))}
                  />
                  {!isCreatingNew && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCase(activeCase.id, activeCase.name)}
                      className="p-1.5 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Xóa kịch bản"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isCreatingNew && (
                    <button
                      type="button"
                      onClick={handleCancelCreateNew}
                      className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded text-xs transition-colors cursor-pointer"
                      title="Hủy thêm kịch bản"
                    >
                      Hủy
                    </button>
                  )}
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
                    value={activeCase.name}
                    onChange={(e) => updateActiveCase(c => ({ ...c, name: e.target.value }))}
                    placeholder={isCreatingNew ? "VD: Thông báo bảo trì hệ thống" : "Nhập tên kịch bản..."}
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                    autoFocus={isCreatingNew}
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={activeCase.category}
                      onChange={(e) => updateActiveCase(c => ({ ...c, category: e.target.value }))}
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điều kiện kích hoạt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={activeCase.trigger.type}
                    onChange={(e) => {
                      const newType = e.target.value as AutoMessageTriggerType;
                      const opt = TRIGGER_TYPE_OPTIONS.find(t => t.type === newType);
                      updateActiveCase(c => ({
                        ...c,
                        trigger: {
                          ...c.trigger,
                          type: newType,
                          typeLabel: opt?.label || newType,
                          summaryText: opt?.label || newType
                        }
                      }));
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

              {/* Nội dung tin nhắn */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {activeCase.message.length} ký tự
                  </span>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={activeCase.message}
                  onChange={(e) => updateActiveCase(c => ({ ...c, message: e.target.value }))}
                  className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none"
                  placeholder={isCreatingNew ? "Nhập nội dung tin nhắn tự động (hoặc bấm chọn biến bên dưới)..." : "Nhập nội dung tin nhắn tự động..."}
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
                <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs max-w-md leading-relaxed min-h-[40px] flex items-center">
                  {previewRenderedMessage || <span className="text-slate-400 italic">Chưa có nội dung xem trước</span>}
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {isCreatingNew && (
                  <button
                    type="button"
                    onClick={handleCancelCreateNew}
                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveActiveCase}
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

    </div>
  );
}
