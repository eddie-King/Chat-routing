'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  Calendar, 
  ChevronDown,
  Info,
  CheckCircle2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Pencil
} from 'lucide-react';
import { 
  SlaPolicyItem, 
  loadSlaPolicies, 
  saveSlaPolicies, 
  formatDurationText, 
  calculateWarningDurationText,
  AVAILABLE_WORKCODES 
} from '@/lib/sla-data';
import { getAvailableWorkingSchedules } from '@/lib/working-hours-data';

interface SlaConfigViewProps {
  onNavigateToWorkingHours?: () => void;
}

export function SlaConfigView({ onNavigateToWorkingHours }: SlaConfigViewProps) {
  const [policies, setPolicies] = useState<SlaPolicyItem[]>(() => loadSlaPolicies());
  const [selectedId, setSelectedId] = useState<string>(() => {
    const loaded = loadSlaPolicies();
    return loaded.length > 0 ? loaded[0].id : '';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableSchedules, setAvailableSchedules] = useState<string[]>(() => getAvailableWorkingSchedules());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial first policy
  const initialFirstPolicy = useMemo(() => {
    return policies.find(p => p.id === selectedId) || policies[0] || null;
  }, [policies, selectedId]);

  // Active policy edit state
  const [editName, setEditName] = useState<string>(() => initialFirstPolicy?.name || '');
  const [editDays, setEditDays] = useState<number>(() => initialFirstPolicy?.days ?? 0);
  const [editHours, setEditHours] = useState<number>(() => initialFirstPolicy?.hours ?? 0);
  const [editMinutes, setEditMinutes] = useState<number>(() => initialFirstPolicy?.minutes ?? 0);
  const [editSchedule, setEditSchedule] = useState<string>(() => initialFirstPolicy?.workingSchedule || '24/7');
  const [editWarningPercent, setEditWarningPercent] = useState<number>(() => initialFirstPolicy?.warningPercent ?? 65);
  const [editWorkcodes, setEditWorkcodes] = useState<string[]>(() => initialFirstPolicy ? [...initialFirstPolicy.workcodes] : []);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

  // Policy List Pagination State (matching image_143886b9.png)
  const [policyPage, setPolicyPage] = useState<number>(1);
  const [policyPageSize, setPolicyPageSize] = useState<number>(10);

  // Modal state for editing a policy (via pencil icon)
  const [editingPolicyModal, setEditingPolicyModal] = useState<SlaPolicyItem | null>(null);
  const [modalEditName, setModalEditName] = useState<string>('');
  const [modalEditDays, setModalEditDays] = useState<number>(0);
  const [modalEditHours, setModalEditHours] = useState<number>(0);
  const [modalEditMinutes, setModalEditMinutes] = useState<number>(0);
  const [modalEditSchedule, setModalEditSchedule] = useState<string>('24/7');
  const [modalEditWarningPercent, setModalEditWarningPercent] = useState<number>(65);

  // Modal state for confirming deletion of a policy (via trash icon)
  const [policyToDelete, setPolicyToDelete] = useState<SlaPolicyItem | null>(null);

  // Main Workcode Table State (in right panel)
  const [tablePage, setTablePage] = useState<number>(1);
  const [tablePageSize, setTablePageSize] = useState<number>(10);
  const [tableSortAsc, setTableSortAsc] = useState<boolean>(true);

  // Modal State for Workcode Selection (image_dcdb028e.png)
  const [isSelectModalOpen, setIsSelectModalOpen] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalPage, setModalPage] = useState<number>(1);
  const [modalPageSize, setModalPageSize] = useState<number>(10);
  const [modalSortAsc, setModalSortAsc] = useState<boolean>(true);
  const [modalSelectedCodes, setModalSelectedCodes] = useState<string[]>([]);
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);

  const loadPolicyIntoForm = (policy: SlaPolicyItem) => {
    setEditName(policy.name);
    setEditDays(policy.days);
    setEditHours(policy.hours);
    setEditMinutes(policy.minutes);
    setEditSchedule(policy.workingSchedule || '24/7');
    setEditWarningPercent(policy.warningPercent ?? 65);
    setEditWorkcodes([...policy.workcodes]);
    setIsEditingTitle(false);
    setTablePage(1);
  };

  // Sync available working schedules when updated externally
  useEffect(() => {
    const handleWorkingHoursUpdate = () => {
      setAvailableSchedules(getAvailableWorkingSchedules());
    };
    window.addEventListener('storage', handleWorkingHoursUpdate);
    window.addEventListener('unispace_working_schedules_updated', handleWorkingHoursUpdate);

    return () => {
      window.removeEventListener('storage', handleWorkingHoursUpdate);
      window.removeEventListener('unispace_working_schedules_updated', handleWorkingHoursUpdate);
    };
  }, []);

  const selectedPolicy = useMemo(() => {
    return policies.find(p => p.id === selectedId) || null;
  }, [policies, selectedId]);

  const handleSelectPolicy = (policy: SlaPolicyItem) => {
    setSelectedId(policy.id);
    loadPolicyIntoForm(policy);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCreateNewSla = () => {
    const newId = `sla-${Date.now()}`;
    const defaultSchedule = availableSchedules[0] || '24/7';
    const newPolicy: SlaPolicyItem = {
      id: newId,
      name: `SLA mới #${policies.length + 1}`,
      days: 1,
      hours: 0,
      minutes: 0,
      workingSchedule: defaultSchedule,
      warningPercent: 65,
      workcodes: [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [newPolicy, ...policies];
    setPolicies(updated);
    saveSlaPolicies(updated);
    setSelectedId(newId);
    loadPolicyIntoForm(newPolicy);
    setIsEditingTitle(true);
    showToast('Đã tạo chính sách SLA mới');
  };

  const handleSaveCurrentPolicy = () => {
    if (!selectedId) return;

    const trimmedName = editName.trim() || 'SLA chưa đặt tên';
    const updated = policies.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          name: trimmedName,
          days: Math.max(0, Number(editDays) || 0),
          hours: Math.max(0, Math.min(23, Number(editHours) || 0)),
          minutes: Math.max(0, Math.min(59, Number(editMinutes) || 0)),
          workingSchedule: editSchedule,
          warningPercent: Math.max(1, Math.min(100, Number(editWarningPercent) || 65)),
          workcodes: editWorkcodes,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }
      return p;
    });

    setPolicies(updated);
    saveSlaPolicies(updated);
    setIsEditingTitle(false);
    showToast('Đã lưu cấu hình SLA thành công');
  };

  const handleDeletePolicy = () => {
    if (!selectedId) return;
    if (confirm(`Bạn có chắc chắn muốn xóa chính sách SLA "${editName}"?`)) {
      const remaining = policies.filter(p => p.id !== selectedId);
      setPolicies(remaining);
      saveSlaPolicies(remaining);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        loadPolicyIntoForm(remaining[0]);
      } else {
        setSelectedId('');
      }
      showToast('Đã xóa chính sách SLA');
    }
  };

  // Policy Edit and Delete handlers for left panel items
  const handleOpenEditPolicyModal = (policy: SlaPolicyItem) => {
    setEditingPolicyModal(policy);
    setModalEditName(policy.name);
    setModalEditDays(policy.days);
    setModalEditHours(policy.hours);
    setModalEditMinutes(policy.minutes);
    setModalEditSchedule(policy.workingSchedule || '24/7');
    setModalEditWarningPercent(policy.warningPercent ?? 65);
  };

  const handleSaveModalEditPolicy = () => {
    if (!editingPolicyModal) return;
    const trimmed = modalEditName.trim() || 'SLA chưa đặt tên';
    const updatedPolicies = policies.map(p => {
      if (p.id === editingPolicyModal.id) {
        return {
          ...p,
          name: trimmed,
          days: modalEditDays,
          hours: modalEditHours,
          minutes: modalEditMinutes,
          workingSchedule: modalEditSchedule,
          warningPercent: modalEditWarningPercent,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }
      return p;
    });
    setPolicies(updatedPolicies);
    saveSlaPolicies(updatedPolicies);
    if (selectedId === editingPolicyModal.id) {
      setEditName(trimmed);
      setEditDays(modalEditDays);
      setEditHours(modalEditHours);
      setEditMinutes(modalEditMinutes);
      setEditSchedule(modalEditSchedule);
      setEditWarningPercent(modalEditWarningPercent);
    }
    setEditingPolicyModal(null);
    showToast(`Đã cập nhật thông tin SLA "${trimmed}"`);
  };

  const handleRequestDeletePolicy = (policy: SlaPolicyItem) => {
    setPolicyToDelete(policy);
  };

  const handleConfirmDeletePolicy = () => {
    if (!policyToDelete) return;
    const remaining = policies.filter(p => p.id !== policyToDelete.id);
    setPolicies(remaining);
    saveSlaPolicies(remaining);
    if (selectedId === policyToDelete.id) {
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        loadPolicyIntoForm(remaining[0]);
      } else {
        setSelectedId('');
      }
    }
    showToast(`Đã xóa chính sách SLA "${policyToDelete.name}"`);
    setPolicyToDelete(null);
  };

  const handleDeleteWorkcodeFromTable = (code: string) => {
    setEditWorkcodes(prev => prev.filter(c => c !== code));
    showToast(`Đã xóa workcode "${code}"`);
  };

  // Open Modal and pre-select current workcodes
  const handleOpenSelectModal = () => {
    setModalSelectedCodes([...editWorkcodes]);
    setModalSearch('');
    setModalPage(1);
    setIsSelectModalOpen(true);
  };

  // Filter policies based on search query
  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return policies;
    const q = searchQuery.toLowerCase();
    return policies.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.workingSchedule.toLowerCase().includes(q) ||
      p.workcodes.some(wc => wc.toLowerCase().includes(q))
    );
  }, [policies, searchQuery]);

  // Left Policy List Pagination
  const totalPolicyItems = filteredPolicies.length;
  const totalPolicyPages = Math.ceil(totalPolicyItems / policyPageSize) || 1;
  const pagedPolicies = useMemo(() => {
    const start = (policyPage - 1) * policyPageSize;
    return filteredPolicies.slice(start, start + policyPageSize);
  }, [filteredPolicies, policyPage, policyPageSize]);

  // Warning duration text dynamic calculation
  const warningDurationText = useMemo(() => {
    return calculateWarningDurationText(editDays, editHours, editMinutes, editWarningPercent);
  }, [editDays, editHours, editMinutes, editWarningPercent]);

  // SLA duration text for list & detail
  const currentDurationText = useMemo(() => {
    return formatDurationText(editDays, editHours, editMinutes);
  }, [editDays, editHours, editMinutes]);

  // Workcodes in Main Table sorted
  const sortedTableWorkcodes = useMemo(() => {
    const list = [...editWorkcodes];
    list.sort((a, b) => {
      return tableSortAsc ? a.localeCompare(b, 'vi') : b.localeCompare(a, 'vi');
    });
    return list;
  }, [editWorkcodes, tableSortAsc]);

  // Main Workcode Table Pagination
  const totalTableItems = sortedTableWorkcodes.length;
  const totalTablePages = Math.ceil(totalTableItems / tablePageSize) || 0;
  const pagedTableWorkcodes = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize;
    return sortedTableWorkcodes.slice(start, start + tablePageSize);
  }, [sortedTableWorkcodes, tablePage, tablePageSize]);

  const tableStartRecord = totalTableItems === 0 ? 0 : (tablePage - 1) * tablePageSize + 1;
  const tableEndRecord = totalTableItems === 0 ? 0 : Math.min(tablePage * tablePageSize, totalTableItems);

  // Modal Workcodes filtering and sorting
  const modalFilteredWorkcodes = useMemo(() => {
    let list = [...AVAILABLE_WORKCODES];
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase().trim();
      list = list.filter(w => w.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      return modalSortAsc ? a.localeCompare(b, 'vi') : b.localeCompare(a, 'vi');
    });
    return list;
  }, [modalSearch, modalSortAsc]);

  // Modal Pagination
  const modalTotalItems = modalFilteredWorkcodes.length;
  const modalTotalPages = Math.ceil(modalTotalItems / modalPageSize) || 1;
  const pagedModalWorkcodes = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return modalFilteredWorkcodes.slice(start, start + modalPageSize);
  }, [modalFilteredWorkcodes, modalPage, modalPageSize]);

  const modalStartRecord = modalTotalItems === 0 ? 0 : (modalPage - 1) * modalPageSize + 1;
  const modalEndRecord = modalTotalItems === 0 ? 0 : Math.min(modalPage * modalPageSize, modalTotalItems);

  // Modal Checkbox logic
  const isAllCurrentPageSelected = useMemo(() => {
    if (pagedModalWorkcodes.length === 0) return false;
    return pagedModalWorkcodes.every(w => modalSelectedCodes.includes(w));
  }, [pagedModalWorkcodes, modalSelectedCodes]);

  const handleToggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      // Unselect all on current page
      setModalSelectedCodes(prev => prev.filter(c => !pagedModalWorkcodes.includes(c)));
    } else {
      // Select all on current page
      const newItems = pagedModalWorkcodes.filter(c => !modalSelectedCodes.includes(c));
      setModalSelectedCodes(prev => [...prev, ...newItems]);
    }
  };

  const handleToggleModalItem = (code: string) => {
    setModalSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleConfirmModalSelection = () => {
    setEditWorkcodes([...modalSelectedCodes]);
    setIsSelectModalOpen(false);
    setTablePage(1);
    showToast(`Đã cập nhật ${modalSelectedCodes.length} workcode cho chính sách SLA`);
  };

  const handleRefreshModal = () => {
    setModalSearch('');
    setModalPage(1);
    showToast('Đã làm mới danh sách workcode');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Page Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
          <span>Cấu hình</span>
          <span>/</span>
          <span className="text-slate-600">Chất lượng dịch vụ</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">SLA</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Ngưỡng phản hồi đầu tiên theo kênh và thời hạn xử lý theo workcode.
        </p>
      </div>

      {/* Main Grid: Left Panel (Policies list) & Right Panel (Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Chính sách thời hạn xử lý */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Chính sách thời hạn xử lý</h2>
            <button
              onClick={handleCreateNewSla}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#f25621] hover:bg-orange-50 rounded-md transition-colors cursor-pointer border border-orange-200"
              title="Thêm chính sách SLA mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mới</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mt-3 mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPolicyPage(1);
              }}
              placeholder="Tìm SLA..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPolicyPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Policies Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không tìm thấy chính sách SLA phù hợp
              </div>
            ) : (
              pagedPolicies.map((policy) => {
                const isSelected = policy.id === selectedId;
                const durationLabel = formatDurationText(policy.days, policy.hours, policy.minutes);
                const hasNoWorkcodes = policy.workcodes.length === 0;

                return (
                  <div
                    key={policy.id}
                    onClick={() => handleSelectPolicy(policy)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-[#fff5f0] border-orange-300 shadow-xs ring-1 ring-orange-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div 
                        className="font-semibold text-slate-800 text-[13px] truncate leading-snug flex-1"
                        title={policy.name}
                      >
                        {policy.name}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditPolicyModal(policy);
                          }}
                          className="text-slate-400 hover:text-[#f25621] hover:bg-slate-100 p-1 rounded-sm transition-colors cursor-pointer"
                          title="Chỉnh sửa thông tin SLA"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestDeletePolicy(policy);
                          }}
                          className="text-slate-400 hover:text-red-500 hover:bg-slate-100 p-1 rounded-sm transition-colors cursor-pointer"
                          title="Xóa SLA này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{durationLabel}</span>
                      <span>·</span>
                      <span className="text-slate-600 font-medium">{policy.workingSchedule}</span>
                    </div>

                    {hasNoWorkcodes && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#92400e] border border-amber-200/60">
                          Chưa gắn workcode
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Left Policy List Pagination Bar matching image_143886b9.png */}
          <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 text-xs text-slate-600 select-none">
            <div className="truncate">
              Tổng số: <strong className="text-slate-900 font-bold">{totalPolicyItems}</strong> bản ghi
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500">Số dòng:</span>
                <select
                  value={policyPageSize}
                  onChange={(e) => {
                    setPolicyPageSize(Number(e.target.value));
                    setPolicyPage(1);
                  }}
                  className="h-6 px-1 border border-slate-300 rounded bg-white text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setPolicyPage(1)}
                  disabled={policyPage <= 1 || totalPolicyItems === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Trang đầu"
                >
                  <ChevronsLeft className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyPage(prev => Math.max(1, prev - 1))}
                  disabled={policyPage <= 1 || totalPolicyItems === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                </button>

                <span className="px-1 text-slate-800 font-bold text-xs whitespace-nowrap">
                  {totalPolicyItems === 0 ? '0 / 0' : `${policyPage} / ${totalPolicyPages}`}
                </span>

                <button
                  type="button"
                  onClick={() => setPolicyPage(prev => Math.min(totalPolicyPages, prev + 1))}
                  disabled={policyPage >= totalPolicyPages || totalPolicyItems === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Trang kế tiếp"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyPage(totalPolicyPages)}
                  disabled={policyPage >= totalPolicyPages || totalPolicyItems === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Trang cuối"
                >
                  <ChevronsRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editor Panel */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          {selectedPolicy ? (
            <>
              {/* Policy Header & Title Edit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xl font-bold text-slate-900 border-b-2 border-orange-500 bg-transparent focus:outline-none w-full max-w-md py-0.5"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingTitle(false);
                        }}
                      />
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium cursor-pointer"
                        title="Xác nhận tên"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 
                        onClick={() => setIsEditingTitle(true)}
                        className="text-xl font-bold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer truncate"
                        title="Bấm để đổi tên SLA"
                      >
                        {editName}
                      </h2>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Đổi tên
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDeletePolicy}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa chính sách SLA này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedPolicy) loadPolicyIntoForm(selectedPolicy);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSaveCurrentPolicy}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#f25621] hover:bg-[#e04816] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu cấu hình</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Thời hạn xử lý & Lịch áp dụng (From working hours) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Thời hạn xử lý */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Thời hạn xử lý <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Ngày */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={editDays}
                        onChange={(e) => setEditDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 h-9 px-2 text-center text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 shadow-2xs"
                      />
                      <span className="text-xs text-slate-600">ngày</span>
                    </div>

                    {/* Giờ */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={editHours}
                        onChange={(e) => setEditHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                        className="w-16 h-9 px-2 text-center text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 shadow-2xs"
                      />
                      <span className="text-xs text-slate-600">giờ</span>
                    </div>

                    {/* Phút */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-16 h-9 px-2 text-center text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 shadow-2xs"
                      />
                      <span className="text-xs text-slate-600">phút</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Tổng thời hạn cam kết xử lý: <strong className="text-slate-700">{currentDurationText}</strong>
                  </p>
                </div>

                {/* Lịch áp dụng (Dynamic from working schedules) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Lịch áp dụng <span className="text-red-500">*</span>
                    </label>
                    {onNavigateToWorkingHours && (
                      <button
                        type="button"
                        onClick={onNavigateToWorkingHours}
                        className="text-[11px] text-[#f25621] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Quản lý lịch làm việc</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={editSchedule}
                      onChange={(e) => setEditSchedule(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 appearance-none shadow-2xs cursor-pointer"
                    >
                      {availableSchedules.map((sch) => (
                        <option key={sch} value={sch}>
                          {sch}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Lấy tự động từ danh mục lịch làm việc đã cấu hình.
                  </p>
                </div>
              </div>

              {/* Row 2: Cảnh báo sắp quá hạn (Slider with exact calculation) */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Cảnh báo sắp quá hạn
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="95"
                      step="5"
                      value={editWarningPercent}
                      onChange={(e) => setEditWarningPercent(parseInt(e.target.value) || 65)}
                      className="w-48 sm:w-60 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#f25621]"
                    />
                    <span className="font-bold text-slate-800 text-sm min-w-[42px]">
                      {editWarningPercent}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <span className="text-slate-400">—</span>
                    <span>cảnh báo agent & supervisor sau <strong className="text-slate-900 font-semibold">{warningDurationText}</strong> làm việc</span>
                  </div>
                </div>
              </div>

              {/* Row 3: DANH SÁCH WORKCODE (EXACT MATCH FOR image_f4d8c923.png) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#f25621] tracking-wide uppercase">
                    DANH SÁCH WORKCODE
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenSelectModal}
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-[#f25621] hover:bg-[#e04816] rounded-md transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Chọn</span>
                  </button>
                </div>

                {/* Table matching image_f4d8c923.png */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#eef4f9] border-b border-slate-200 text-slate-700 text-xs font-semibold">
                        <th className="py-2.5 px-4 w-24 text-center border-r border-slate-200/80">
                          Hành động
                        </th>
                        <th className="py-2.5 px-4 w-20 text-center border-r border-slate-200/80">
                          STT
                        </th>
                        <th 
                          onClick={() => setTableSortAsc(prev => !prev)}
                          className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Tên Workcode</span>
                            {tableSortAsc ? (
                              <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {pagedTableWorkcodes.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-400">
                            {/* Empty Inbox icon matching screenshot */}
                            <div className="w-12 h-10 mx-auto mb-2 text-slate-300 flex items-center justify-center">
                              <svg 
                                className="w-10 h-10 stroke-current fill-none stroke-[1.5]"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20 12V8H4V12" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12H16L14 15H10L8 12H4Z" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Không có dữ liệu</span>
                          </td>
                        </tr>
                      ) : (
                        pagedTableWorkcodes.map((code, idx) => {
                          const stt = (tablePage - 1) * tablePageSize + idx + 1;
                          return (
                            <tr key={code} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-4 text-center border-r border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWorkcodeFromTable(code)}
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                                  title="Xóa workcode này"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                              <td className="py-2.5 px-4 text-center font-medium text-slate-600 border-r border-slate-100">
                                {stt}
                              </td>
                              <td className="py-2.5 px-4 font-medium text-slate-800">
                                {code}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Footer matching image_f4d8c923.png */}
                  <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div>
                      Tổng số: <strong className="text-slate-900">{totalTableItems}</strong> bản ghi
                    </div>

                    <div className="flex items-center gap-3 select-none flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span>Số dòng:</span>
                        <select
                          value={tablePageSize}
                          onChange={(e) => {
                            setTablePageSize(Number(e.target.value));
                            setTablePage(1);
                          }}
                          className="h-7 px-2 border border-slate-300 rounded bg-white text-xs font-medium focus:outline-none cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      <div>
                        {tableStartRecord} đến {tableEndRecord} trên <strong className="text-slate-800">{totalTableItems}</strong>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTablePage(1)}
                          disabled={tablePage <= 1 || totalTableItems === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          title="Trang đầu"
                        >
                          <ChevronsLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTablePage(prev => Math.max(1, prev - 1))}
                          disabled={tablePage <= 1 || totalTableItems === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          title="Trang trước"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>

                        <span className="px-1 text-slate-700">
                          Trang <strong className="text-slate-900">{totalTableItems === 0 ? 0 : tablePage}</strong> trên <strong className="text-slate-900">{totalTablePages}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => setTablePage(prev => Math.min(totalTablePages, prev + 1))}
                          disabled={tablePage >= totalTablePages || totalTableItems === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          title="Trang kế tiếp"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTablePage(totalTablePages)}
                          disabled={tablePage >= totalTablePages || totalTableItems === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          title="Trang cuối"
                        >
                          <ChevronsRight className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Example Box matching screenshot */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span>Ví dụ: ticket tạo lúc 16:00 Thứ Sáu &rarr; hạn sau </span>
                  <strong className="text-slate-900 font-semibold">{currentDurationText}</strong>
                  <span> làm việc theo lịch </span>
                  <strong className="text-slate-900 font-semibold">&ldquo;{editSchedule}&rdquo;</strong>
                  <span>, hệ thống tự động bỏ qua giờ ngoài ca làm việc, ngày nghỉ và ngày lễ theo cấu hình.</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Vui lòng chọn hoặc tạo mới một chính sách SLA ở cột bên trái</p>
            </div>
          )}
        </div>
      </div>

      {/* Select Workcode Modal (EXACT MATCH FOR image_dcdb028e.png) */}
      {isSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
            {/* Modal Header Bar with Orange Background */}
            <div className="bg-[#f25621] px-5 py-3 flex items-center justify-between text-white select-none">
              <h3 className="font-semibold text-sm tracking-wide">Danh sách Workcode</h3>
              <button
                type="button"
                onClick={() => setIsSelectModalOpen(false)}
                className="text-white hover:text-white/80 p-1 rounded transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Filter Row: Tên Workcode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên Workcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => {
                      setModalSearch(e.target.value);
                      setModalPage(1);
                    }}
                    placeholder="Tìm kiếm"
                    className="w-full pl-3 pr-10 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#f25621]">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Action Toolbar above Table */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-700">
                  Tổng số: <strong className="text-slate-900">{modalTotalItems}</strong> bản ghi
                </div>

                <div className="flex items-center gap-2 relative">
                  {/* Cột hiển thị Button */}
                  <button
                    type="button"
                    onClick={() => setShowColumnDropdown(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cột hiển thị</span>
                  </button>

                  {/* Popover for Cột hiển thị */}
                  {showColumnDropdown && (
                    <div className="absolute right-10 top-9 w-44 bg-white border border-slate-200 rounded-md shadow-lg p-2.5 z-20 text-xs space-y-2">
                      <div className="font-semibold text-slate-800 pb-1 border-b border-slate-100">Cột hiển thị</div>
                      <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                        <input type="checkbox" checked readOnly className="rounded text-[#f25621] accent-[#f25621]" />
                        <span>Tên Workcode</span>
                      </label>
                    </div>
                  )}

                  {/* Reload / Refresh Button */}
                  <button
                    type="button"
                    onClick={handleRefreshModal}
                    className="p-1.5 text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                    title="Làm mới danh sách"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Modal Table matching image_dcdb028e.png */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#eef4f9] border-b border-slate-200 text-slate-700 text-xs font-semibold select-none">
                      <th className="py-2.5 px-4 w-12 text-center border-r border-slate-200/80">
                        <input
                          type="checkbox"
                          checked={isAllCurrentPageSelected}
                          onChange={handleToggleSelectAllCurrentPage}
                          className="w-4 h-4 rounded border-slate-300 text-[#f25621] focus:ring-orange-500 accent-[#f25621] cursor-pointer align-middle"
                        />
                      </th>
                      <th 
                        onClick={() => setModalSortAsc(prev => !prev)}
                        className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 select-none transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Tên Workcode</span>
                          {modalSortAsc ? (
                            <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {pagedModalWorkcodes.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-10 text-center text-slate-400">
                          Không tìm thấy workcode nào phù hợp với từ khóa &ldquo;{modalSearch}&rdquo;
                        </td>
                      </tr>
                    ) : (
                      pagedModalWorkcodes.map((code) => {
                        const isChecked = modalSelectedCodes.includes(code);
                        return (
                          <tr 
                            key={code} 
                            onClick={() => handleToggleModalItem(code)}
                            className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                              isChecked ? 'bg-orange-50/40' : ''
                            }`}
                          >
                            <td 
                              className="py-2.5 px-4 text-center border-r border-slate-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleModalItem(code)}
                                className="w-4 h-4 rounded border-slate-300 text-[#f25621] focus:ring-orange-500 accent-[#f25621] cursor-pointer align-middle"
                              />
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-800">
                              {code}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Modal Pagination Bar matching image_dcdb028e.png */}
                <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 text-xs text-slate-600 select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Số dòng:</span>
                    <select
                      value={modalPageSize}
                      onChange={(e) => {
                        setModalPageSize(Number(e.target.value));
                        setModalPage(1);
                      }}
                      className="h-7 px-2 border border-slate-300 rounded bg-white text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div>
                    {modalStartRecord} đến {modalEndRecord} trên <strong className="text-slate-800">{modalTotalItems}</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setModalPage(1)}
                      disabled={modalPage <= 1 || modalTotalItems === 0}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Trang đầu"
                    >
                      <ChevronsLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPage(prev => Math.max(1, prev - 1))}
                      disabled={modalPage <= 1 || modalTotalItems === 0}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>

                    <span className="px-1 text-slate-700">
                      Trang <strong className="text-slate-900">{modalTotalItems === 0 ? 0 : modalPage}</strong> trên <strong className="text-slate-900">{modalTotalPages}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setModalPage(prev => Math.min(modalTotalPages, prev + 1))}
                      disabled={modalPage >= modalTotalPages || modalTotalItems === 0}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Trang kế tiếp"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPage(modalTotalPages)}
                      disabled={modalPage >= modalTotalPages || modalTotalItems === 0}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Trang cuối"
                    >
                      <ChevronsRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom-Right Action Button */}
            <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Đã chọn: <strong className="text-[#f25621] font-bold">{modalSelectedCodes.length}</strong> workcode
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSelectModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmModalSelection}
                  className="inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold text-white bg-[#f25621] hover:bg-[#e04816] rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Chọn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal (When clicking Pencil icon) */}
      {editingPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-[#f25621] px-5 py-3 flex items-center justify-between text-white select-none">
              <h3 className="font-semibold text-sm">Chỉnh sửa thông tin SLA</h3>
              <button
                type="button"
                onClick={() => setEditingPolicyModal(null)}
                className="text-white hover:text-white/80 p-1 rounded transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên chính sách SLA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalEditName}
                  onChange={(e) => setModalEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lịch áp dụng <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalEditSchedule}
                  onChange={(e) => setModalEditSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-xs cursor-pointer"
                >
                  {availableSchedules.map(sch => (
                    <option key={sch} value={sch}>{sch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thời hạn xử lý
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={modalEditDays}
                      onChange={(e) => setModalEditDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 h-8 text-center border border-slate-300 rounded-md font-semibold text-slate-800"
                    />
                    <span className="text-slate-600">ngày</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={modalEditHours}
                      onChange={(e) => setModalEditHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                      className="w-14 h-8 text-center border border-slate-300 rounded-md font-semibold text-slate-800"
                    />
                    <span className="text-slate-600">giờ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={modalEditMinutes}
                      onChange={(e) => setModalEditMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-14 h-8 text-center border border-slate-300 rounded-md font-semibold text-slate-800"
                    />
                    <span className="text-slate-600">phút</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Cảnh báo sắp quá hạn
                  </label>
                  <span className="font-bold text-slate-900">{modalEditWarningPercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  step="5"
                  value={modalEditWarningPercent}
                  onChange={(e) => setModalEditWarningPercent(parseInt(e.target.value) || 65)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#f25621]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingPolicyModal(null)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveModalEditPolicy}
                className="px-4 py-1.5 font-semibold text-white bg-[#f25621] hover:bg-[#e04816] rounded-md transition-colors shadow-xs cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (When clicking Trash icon) */}
      {policyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Xóa chính sách SLA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa chính sách SLA <strong className="text-slate-900">&ldquo;{policyToDelete.name}&rdquo;</strong>? Hành động này sẽ gỡ bỏ chính sách và không thể hoàn tác.
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPolicyToDelete(null)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 rounded-md font-medium transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePolicy}
                className="px-4 py-1.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Xóa chính sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
