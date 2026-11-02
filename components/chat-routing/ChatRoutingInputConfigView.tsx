'use client';

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Plus, 
  Trash2, 
  Check, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown,
  X
} from 'lucide-react';
import { 
  ChatRoutingInputFilterItem, 
  ChatRoutingInputCriterion,
  ChatRoutingInputType,
  CHAT_INPUT_VALUE_OPTIONS,
  INITIAL_CHAT_INPUT_FILTERS,
  getSpecialNumberGroupNames
} from '@/lib/chat-routing-data';

interface ChatRoutingInputConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatRouting?: () => void;
  onSwitchToSocialMedia?: () => void;
  onSwitchToAutoMessages?: () => void;
}

// Danh sách các loại Type hỗ trợ (Đã bỏ Nguồn, thêm Hàng đợi VIP & Hàng đợi Thường)
const TYPE_OPTIONS: { id: ChatRoutingInputType; label: string }[] = [
  { id: 'Hàng đợi VIP', label: 'Hàng đợi VIP' },
  { id: 'Hàng đợi Thường', label: 'Hàng đợi Thường' },
  { id: 'Page', label: 'Page (Fanpage, Zalo OA...)' },
  { id: 'Giới tính', label: 'Giới tính (Nam, Nữ...)' },
  { id: 'Khung giờ', label: 'Khung giờ (Giờ làm việc...)' }
];

// Hàm lấy giá trị hợp lệ theo Type
function getAvailableValues(type: ChatRoutingInputType, specialGroups: string[]): string[] {
  if (type === 'Hàng đợi VIP') {
    return specialGroups.length > 0 ? specialGroups : ['Kenk chat', 'Test group phone'];
  }
  if (type === 'Hàng đợi Thường') {
    return ['Tập khách hàng'];
  }
  return CHAT_INPUT_VALUE_OPTIONS[type] || [];
}

// Hàm chuẩn hóa dữ liệu từ localStorage hoặc dữ liệu mẫu ban đầu
function normalizeFilterItem(item: any, index: number, specialGroups: string[]): ChatRoutingInputFilterItem {
  const validTypes: ChatRoutingInputType[] = ['Hàng đợi VIP', 'Hàng đợi Thường', 'Page', 'Giới tính', 'Khung giờ'];

  if (Array.isArray(item.criteria) && item.criteria.length > 0) {
    const usedTypesInItem: ChatRoutingInputType[] = [];
    const validCriteria = item.criteria.map((c: any, cIdx: number) => {
      let type: ChatRoutingInputType = c.type;
      // Chuyển đổi nếu là type cũ 'Nguồn'
      if (type === 'Nguồn' || !validTypes.includes(type)) {
        type = 'Hàng đợi VIP';
      }

      // Đảm bảo không trùng type giữa các dòng trong cùng 1 bộ điều kiện
      if (usedTypesInItem.includes(type)) {
        const unused = TYPE_OPTIONS.find(t => !usedTypesInItem.includes(t.id));
        if (unused) {
          type = unused.id;
        }
      }
      usedTypesInItem.push(type);

      const validValues = getAvailableValues(type, specialGroups);
      const value = validValues.includes(c.value) ? c.value : (validValues[0] || 'Tập khách hàng');
      return {
        id: c.id || `crit-${Date.now()}-${cIdx}`,
        type,
        value
      };
    });

    return {
      id: item.id || `flt-${index + 1}`,
      output: item.output || `INPUT_BO_DIEU_KIEN_${index + 1}`,
      criteria: validCriteria,
      createdAt: item.createdAt || new Date().toLocaleString('vi-VN'),
      status: item.status || 'Hoạt động'
    };
  }

  // Tương thích ngược: chuyển đổi từ định dạng cũ (item.type, item.values)
  let legacyType: ChatRoutingInputType = item.type;
  if (legacyType === 'Nguồn' || !validTypes.includes(legacyType)) {
    legacyType = 'Hàng đợi VIP';
  }
  const validValues = getAvailableValues(legacyType, specialGroups);
  const legacyValue = (Array.isArray(item.values) && validValues.includes(item.values[0]))
    ? item.values[0]
    : validValues[0];

  return {
    id: item.id || `flt-${index + 1}`,
    output: item.output || `INPUT_BO_DIEU_KIEN_${index + 1}`,
    criteria: [
      {
        id: `crit-${item.id || index}-0`,
        type: legacyType,
        value: legacyValue
      }
    ],
    createdAt: item.createdAt || new Date().toLocaleString('vi-VN'),
    status: item.status || 'Hoạt động'
  };
}

export function ChatRoutingInputConfigView({
  onSwitchToChatRouting
}: ChatRoutingInputConfigViewProps) {
  // Danh sách các tập số từ màn Quản lý tập số đặc biệt (cho Hàng đợi VIP)
  const [specialNumberGroups, setSpecialNumberGroups] = useState<string[]>(() => getSpecialNumberGroupNames());

  useEffect(() => {
    const handleStorageChange = () => {
      setSpecialNumberGroups(getSpecialNumberGroupNames());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper lấy danh sách giá trị theo type
  const getValuesForType = (type: ChatRoutingInputType): string[] => {
    return getAvailableValues(type, specialNumberGroups);
  };

  // Danh sách các bộ điều kiện
  const [conditions, setConditions] = useState<ChatRoutingInputFilterItem[]>(() => {
    const initialSpecialGroups = typeof window !== 'undefined' ? getSpecialNumberGroupNames() : ['Kenk chat', 'Test group phone'];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_chat_input_conditions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => normalizeFilterItem(item, idx, initialSpecialGroups));
          }
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_CHAT_INPUT_FILTERS.map((item, idx) => normalizeFilterItem(item, idx, initialSpecialGroups));
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Thêm 1 bộ điều kiện mới (Card mới)
  const handleAddConditionSet = () => {
    const nextIndex = conditions.length + 1;
    const defaultVipVal = specialNumberGroups[0] || 'Kenk chat';
    const newSet: ChatRoutingInputFilterItem = {
      id: `flt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      output: `INPUT_BO_DIEU_KIEN_${nextIndex}`,
      criteria: [
        {
          id: `crit-${Date.now()}-1`,
          type: 'Hàng đợi VIP',
          value: defaultVipVal
        }
      ],
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'Hoạt động'
    };

    setConditions(prev => [...prev, newSet]);
    showToast(`Đã thêm Bộ điều kiện ${nextIndex}`);
  };

  // 2. Xóa 1 bộ điều kiện
  const handleDeleteConditionSet = (setId: string) => {
    if (conditions.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 bộ điều kiện!');
      return;
    }
    setConditions(prev => prev.filter(c => c.id !== setId));
    showToast('Đã xóa bộ điều kiện.');
  };

  // 3. Thay đổi Output chung của bộ điều kiện
  const handleOutputChange = (setId: string, val: string) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== setId) return c;
      return {
        ...c,
        output: val
      };
    }));
  };

  // 4. Thêm 1 dòng tiêu chí (Type, Value) vào trong bộ điều kiện (không được trùng Type đã chọn)
  const handleAddCriterion = (setId: string) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== setId) return c;
      const currentList = c.criteria || [];
      
      const usedTypes = currentList.map(item => item.type);
      const availableTypes = TYPE_OPTIONS.filter(t => !usedTypes.includes(t.id));

      if (availableTypes.length === 0) {
        showToast('Đã chọn đủ tất cả các loại điều kiện (Hàng đợi VIP, Hàng đợi Thường, Page, Giới tính, Khung giờ)!');
        return c;
      }

      const newType = availableTypes[0].id;
      const validVals = getValuesForType(newType);
      const defaultValue = validVals[0] || (newType === 'Hàng đợi Thường' ? 'Tập khách hàng' : 'Kenk chat');

      const newCriterion: ChatRoutingInputCriterion = {
        id: `crit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: newType,
        value: defaultValue
      };

      return {
        ...c,
        criteria: [...currentList, newCriterion]
      };
    }));
  };

  // 5. Xóa 1 dòng tiêu chí (Type, Value) khỏi bộ điều kiện
  const handleDeleteCriterion = (setId: string, critId: string) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== setId) return c;
      const currentList = c.criteria || [];
      if (currentList.length <= 1) {
        showToast('Mỗi bộ điều kiện phải có ít nhất 1 dòng tiêu chí!');
        return c;
      }
      return {
        ...c,
        criteria: currentList.filter(crit => crit.id !== critId)
      };
    }));
  };

  // 6. Đổi Type của 1 dòng tiêu chí -> chặn trùng lặp và tự động chọn giá trị Value phù hợp đầu tiên
  const handleCriterionTypeChange = (setId: string, critId: string, newType: ChatRoutingInputType) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== setId) return c;

      const isAlreadyUsed = (c.criteria || []).some(crit => crit.id !== critId && crit.type === newType);
      if (isAlreadyUsed) {
        showToast(`Loại điều kiện "${newType}" đã được chọn ở dòng khác trong bộ điều kiện này!`);
        return c;
      }

      const availableVals = getValuesForType(newType);
      const updatedCriteria = (c.criteria || []).map(crit => {
        if (crit.id !== critId) return crit;
        return {
          ...crit,
          type: newType,
          value: availableVals[0] || (newType === 'Hàng đợi Thường' ? 'Tập khách hàng' : '')
        };
      });
      return {
        ...c,
        criteria: updatedCriteria
      };
    }));
  };

  // 7. Đổi Value của 1 dòng tiêu chí (chọn 1 giá trị duy nhất)
  const handleCriterionValueChange = (setId: string, critId: string, newValue: string) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== setId) return c;
      const updatedCriteria = (c.criteria || []).map(crit => {
        if (crit.id !== critId) return crit;
        return {
          ...crit,
          value: newValue
        };
      });
      return {
        ...c,
        criteria: updatedCriteria
      };
    }));
  };

  // 8. Lưu toàn bộ cấu hình
  const handleSaveAll = () => {
    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      if (!c.output.trim()) {
        showToast(`Bộ điều kiện ${i + 1}: Vui lòng nhập giá trị Output!`);
        return;
      }
      if (!c.criteria || c.criteria.length === 0) {
        showToast(`Bộ điều kiện ${i + 1}: Vui lòng thêm ít nhất 1 dòng tiêu chí (Type, Value)!`);
        return;
      }
      for (let j = 0; j < c.criteria.length; j++) {
        if (!c.criteria[j].value.trim()) {
          showToast(`Bộ điều kiện ${i + 1} - Dòng ${j + 1}: Vui lòng chọn giá trị Value!`);
          return;
        }
      }
    }

    // Đồng bộ tương thích ngược (type & values)
    const normalizedToSave = conditions.map(c => ({
      ...c,
      type: c.criteria?.[0]?.type || 'Hàng đợi VIP',
      values: (c.criteria || []).map(item => item.value)
    }));

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('unispace_chat_input_conditions', JSON.stringify(normalizedToSave));
      } catch {
        // ignore
      }
    }

    try {
      INITIAL_CHAT_INPUT_FILTERS.splice(0, INITIAL_CHAT_INPUT_FILTERS.length, ...normalizedToSave);
    } catch {
      // ignore
    }

    showToast(`Đã lưu thành công ${conditions.length} bộ điều kiện Input Chat Routing!`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-150">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f25621] shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              CẤU HÌNH INPUT CHAT ROUTING
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập các bộ điều kiện đầu vào (Type & Value) định tuyến về các cổng tiếp nhận (Output).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
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
            onClick={handleAddConditionSet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#f25621] stroke-[2.5]" />
            <span>Thêm bộ điều kiện</span>
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

      {/* DANH SÁCH CÁC BỘ ĐIỀU KIỆN */}
      <div className="space-y-4">
        {conditions.map((conditionSet, index) => {
          const criteriaList = conditionSet.criteria || [];

          return (
            <div 
              key={conditionSet.id}
              className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
            >
              {/* Header card: Số thứ tự, Tên bộ điều kiện và Nút xóa */}
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center border border-slate-200">
                    {index + 1}
                  </span>
                  <span>Bộ điều kiện {index + 1}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteConditionSet(conditionSet.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Xóa bộ điều kiện này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tiêu đề cột: Type, Value, Xóa, Output ngang hàng nhau trên 1 hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs font-semibold text-slate-700 px-1 mb-2">
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    Type <span className="text-red-500">*</span>
                  </div>
                  <div className="sm:col-span-6">
                    Value <span className="text-red-500">*</span>
                  </div>
                  <div className="sm:col-span-1 text-center hidden sm:block text-slate-400 font-normal">
                    Xóa
                  </div>
                </div>
                <div className="lg:col-span-4 hidden lg:block">
                  Output <span className="text-red-500">*</span>
                </div>
              </div>

              {/* Nội dung bộ điều kiện: Bên trái là các dòng (Type, Value), Bên phải là Ô box Output chỉ căn giữa */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* KHỐI TRÁI (8 CỘT): Danh sách các dòng Type - Value & Nút thêm điều kiện */}
                <div className="lg:col-span-8 space-y-2.5">

                  {/* Danh sách các dòng tiêu chí */}
                  <div className="space-y-2">
                    {criteriaList.map((criterion, critIndex) => {
                      const availableValues = getValuesForType(criterion.type);
                      // Lấy các type đã được chọn ở các dòng KHÁC trong cùng bộ điều kiện này
                      const otherSelectedTypes = criteriaList
                        .filter((_, idx) => idx !== critIndex)
                        .map(c => c.type);

                      return (
                        <div 
                          key={criterion.id} 
                          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/90"
                        >
                          {/* Cột Type (Single Select - Chặn chọn lại các Type đã dùng ở dòng khác) */}
                          <div className="sm:col-span-5 relative">
                            <label className="block text-[10px] text-slate-500 mb-1 sm:hidden font-medium">
                              Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={criterion.type}
                                onChange={(e) => handleCriterionTypeChange(
                                  conditionSet.id, 
                                  criterion.id, 
                                  e.target.value as ChatRoutingInputType
                                )}
                                className="w-full h-9 px-3 pr-8 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer appearance-none shadow-2xs"
                              >
                                {TYPE_OPTIONS.map(opt => {
                                  const isUsedInOtherRow = otherSelectedTypes.includes(opt.id);
                                  return (
                                    <option 
                                      key={opt.id} 
                                      value={opt.id}
                                      disabled={isUsedInOtherRow}
                                      className={isUsedInOtherRow ? 'text-slate-400 bg-slate-100' : ''}
                                    >
                                      {opt.label}{isUsedInOtherRow ? ' — (Đã chọn)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Cột Value (Single Select tương ứng theo Type) */}
                          <div className="sm:col-span-6 relative">
                            <label className="block text-[10px] text-slate-500 mb-1 sm:hidden font-medium">
                              Value <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={criterion.value}
                                onChange={(e) => handleCriterionValueChange(
                                  conditionSet.id, 
                                  criterion.id, 
                                  e.target.value
                                )}
                                className="w-full h-9 px-3 pr-8 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer appearance-none shadow-2xs truncate"
                              >
                                {availableValues.map(val => (
                                  <option key={val} value={val}>
                                    {val}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Nút xóa dòng tiêu chí */}
                          <div className="sm:col-span-1 flex items-center justify-end sm:justify-center">
                            <button
                              type="button"
                              disabled={criteriaList.length <= 1}
                              onClick={() => handleDeleteCriterion(conditionSet.id, criterion.id)}
                              className={`p-1.5 rounded transition-colors ${
                                criteriaList.length <= 1
                                  ? 'text-slate-300 cursor-not-allowed opacity-40'
                                  : 'text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer'
                              }`}
                              title={criteriaList.length <= 1 ? 'Mỗi bộ điều kiện cần ít nhất 1 dòng' : 'Xóa dòng điều kiện này'}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nút thêm dòng tiêu chí (Type, Value) vào bộ điều kiện */}
                  <div className="pt-1 flex items-center gap-2">
                    {criteriaList.length < TYPE_OPTIONS.length ? (
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(conditionSet.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#f25621] hover:text-[#d94412] hover:bg-orange-50 border border-dashed border-[#f25621]/40 rounded-md transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm điều kiện</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic py-1 px-1">
                        (Đã chọn đủ tất cả loại điều kiện: Hàng đợi VIP, Hàng đợi Thường, Page, Giới tính, Khung giờ)
                      </span>
                    )}
                  </div>
                </div>

                {/* KHỐI PHẢI (4 CỘT): Chỉ căn giữa ô box Output thôi */}
                <div className="lg:col-span-4 flex flex-col justify-center my-auto">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 lg:hidden">
                    Output <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={conditionSet.output}
                    onChange={(e) => handleOutputChange(conditionSet.id, e.target.value)}
                    placeholder="VD: INPUT_NGUON_1t-1"
                    className="w-full h-9 px-3 text-xs font-mono font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors shadow-2xs"
                  />
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
