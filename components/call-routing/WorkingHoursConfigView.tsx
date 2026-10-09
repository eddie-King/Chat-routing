'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  X, 
  Trash2, 
  Plus, 
  Calendar, 
  CalendarDays,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  WorkingScheduleItem, 
  DayWorkingSchedule, 
  ShiftSlot,
  MakeUpDaySchedule,
  INITIAL_WORKING_SCHEDULES,
  EXACT_IMAGE_WEEK_DAYS
} from '@/lib/working-hours-data';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface WorkingHoursConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatRouting?: () => void;
}

// Toggle Switch styled with brand theme #f25621
function ToggleSwitch({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (v: boolean) => void; 
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
        checked ? 'bg-[#f25621]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Editable Time Box with Clock Icon
function TimeBox({
  value,
  onChange
}: {
  value: string;
  onChange: (newVal: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftVal, setDraftVal] = useState(value);

  const startEditing = () => {
    setDraftVal(value);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (draftVal.trim() && draftVal.trim() !== value) {
      onChange(draftVal.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center justify-between h-8 px-2 rounded-md border border-[#f25621] ring-1 ring-[#f25621]/30 bg-white text-xs text-slate-800 w-28 shadow-2xs">
        <input
          autoFocus
          type="text"
          value={draftVal}
          onChange={(e) => setDraftVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="08:00 AM"
          className="w-full text-xs outline-none bg-transparent font-medium"
        />
        <Clock className="w-3.5 h-3.5 text-[#f25621] shrink-0 ml-1" />
      </div>
    );
  }

  return (
    <div 
      onClick={startEditing}
      title="Bấm để chỉnh sửa giờ"
      className="inline-flex items-center justify-between h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 w-28 hover:border-slate-300 cursor-pointer transition-colors select-none"
    >
      <span>{value}</span>
      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
    </div>
  );
}

// Quick Holiday Presets for Vietnamese Calendar
const HOLIDAY_PRESETS = [
  { name: 'Tết Dương lịch', date: '2026-01-01', display: '01/01 · Tết Dương lịch' },
  { name: 'Tết Nguyên đán', date: '2026-02-16', endDate: '2026-02-22', display: '16/02 – 22/02 · Tết Nguyên đán' },
  { name: 'Giỗ Tổ Hùng Vương', date: '2026-04-26', display: '26/04 · Giỗ Tổ Hùng Vương' },
  { name: 'Lễ 30/4 & 1/5', date: '2026-04-30', endDate: '2026-05-01', display: '30/04 – 01/05 · Lễ 30/4 & 1/5' },
  { name: 'Quốc khánh', date: '2026-09-01', endDate: '2026-09-02', display: '01/09 – 02/09 · Quốc khánh' },
  { name: 'Giáng sinh', date: '2026-12-24', display: '24/12 · Giáng sinh' }
];

export function WorkingHoursConfigView({
  onSwitchToCallRouting: _onSwitchToCallRouting,
  onSwitchToChatRouting: _onSwitchToChatRouting
}: WorkingHoursConfigViewProps) {
  // Schedules List state backed by localStorage
  const [schedules, setSchedules] = useState<WorkingScheduleItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_working_schedules_image_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_WORKING_SCHEDULES;
  });

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(() => {
    return INITIAL_WORKING_SCHEDULES[0]?.id || 'sch-hn';
  });

  // Holiday Selection State
  const [holidayDate, setHolidayDate] = useState<string>('');
  const [holidayEndDate, setHolidayEndDate] = useState<string>('');
  const [isRangeHoliday, setIsRangeHoliday] = useState<boolean>(false);
  const [holidayTitle, setHolidayTitle] = useState<string>('');

  // Make-Up Work Day State
  const [makeUpDate, setMakeUpDate] = useState<string>('');
  const [makeUpReason, setMakeUpReason] = useState<string>('');
  const [makeUpShift, setMakeUpShift] = useState<string>('08:00 AM – 05:30 PM');

  // Title edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Delete modal state
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ 
    type: 'schedule' | 'holiday' | 'makeup' | 'shift'; 
    id: string; 
    label: string;
    extra?: any;
  } | null>(null);

  // Success toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Persist to localStorage
  const persistSchedules = (next: WorkingScheduleItem[]) => {
    setSchedules(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('unispace_working_schedules_image_v2', JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  };

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  const handleStartEditTitle = () => {
    if (activeSchedule) {
      setTitleDraft(activeSchedule.name);
      setIsEditingTitle(true);
    }
  };

  // Update active schedule
  const updateActiveSchedule = (updater: (prev: WorkingScheduleItem) => WorkingScheduleItem) => {
    if (!activeSchedule) return;
    const updated = updater(activeSchedule);
    const nextList = schedules.map(s => s.id === updated.id ? updated : s);
    persistSchedules(nextList);
  };

  // Create new schedule (+ Tạo lịch)
  const handleCreateNewSchedule = () => {
    const timestamp = Date.now();
    const newSchedule: WorkingScheduleItem = {
      id: `sch-new-${timestamp}`,
      name: 'Lịch mới',
      subtitle: 'Dùng bởi Chưa dùng',
      detailHeaderSubtitle: 'Múi giờ GMT+7 · Chưa dùng',
      code: `SCH_${timestamp.toString(36).toUpperCase()}`,
      description: 'Lịch làm việc mới tạo',
      timezone: 'GMT+7',
      days: EXACT_IMAGE_WEEK_DAYS.map(d => ({
        ...d,
        shifts: JSON.parse(JSON.stringify(d.shifts))
      })),
      holidays: [
        { id: `h1-${timestamp}`, name: '01/01 · Tết Dương lịch' },
        { id: `h2-${timestamp}`, name: '16/02 – 22/02 · Tết Nguyên đán' }
      ],
      makeUpDays: [],
      status: 'Áp dụng',
      createdAt: 'Hôm nay',
      appliedCount: 0
    };
    const nextList = [...schedules, newSchedule];
    persistSchedules(nextList);
    setSelectedScheduleId(newSchedule.id);
    showToast('Đã tạo mới lịch làm việc');
  };

  // Toggle Day Working Status
  const handleToggleDay = (dayKey: string, enabled: boolean) => {
    updateActiveSchedule(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.dayKey === dayKey) {
          return {
            ...d,
            enabled,
            shifts: enabled && d.shifts.length === 0
              ? [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
              : d.shifts
          };
        }
        return d;
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Update Shift Time
  const handleUpdateShiftTime = (dayKey: string, shiftIndex: number, field: 'start' | 'end', value: string) => {
    updateActiveSchedule(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.dayKey === dayKey) {
          const nextShifts = d.shifts.map((s, idx) => idx === shiftIndex ? { ...s, [field]: value } : s);
          return { ...d, shifts: nextShifts };
        }
        return d;
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Add Shift for Day (Tối đa 2 ca)
  const handleAddShift = (dayKey: string) => {
    updateActiveSchedule(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.dayKey === dayKey) {
          if (d.shifts.length >= 2) return d; // Tối đa 2 ca
          
          let newShift: ShiftSlot;
          if (d.shifts.length === 0) {
            newShift = { start: '08:00 AM', end: '12:00 PM' };
          } else {
            // Already has 1 shift, create second shift
            const existing = d.shifts[0];
            if (existing.end.includes('12:00') || existing.end.includes('AM')) {
              newShift = { start: '01:30 PM', end: '05:30 PM' };
            } else {
              newShift = { start: '06:00 PM', end: '09:30 PM' };
            }
          }
          return {
            ...d,
            enabled: true,
            shifts: [...d.shifts, newShift]
          };
        }
        return d;
      });
      return { ...prev, days: updatedDays };
    });
    showToast('Đã thêm ca làm việc');
  };

  // Delete Shift for Day
  const handleDeleteShift = (dayKey: string, shiftIndex: number) => {
    updateActiveSchedule(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.dayKey === dayKey) {
          const nextShifts = d.shifts.filter((_, idx) => idx !== shiftIndex);
          return {
            ...d,
            shifts: nextShifts
          };
        }
        return d;
      });
      return { ...prev, days: updatedDays };
    });
    showToast('Đã xóa ca làm việc');
  };

  // Clear all shifts for a day
  const handleClearDayShifts = (dayKey: string) => {
    handleToggleDay(dayKey, false);
  };

  // Quick Apply Holiday Preset
  const handleApplyHolidayPreset = (preset: typeof HOLIDAY_PRESETS[0]) => {
    setHolidayTitle(preset.name);
    setHolidayDate(preset.date);
    if (preset.endDate) {
      setIsRangeHoliday(true);
      setHolidayEndDate(preset.endDate);
    } else {
      setIsRangeHoliday(false);
      setHolidayEndDate('');
    }
  };

  // Add Holiday with Date Selection
  const handleAddHolidayWithDate = () => {
    if (!holidayTitle.trim()) {
      showToast('Vui lòng nhập tên ngày lễ');
      return;
    }

    let displayName = holidayTitle.trim();

    if (holidayDate) {
      const formatDayMonth = (dateStr: string) => {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}`;
        }
        return dateStr;
      };

      const startFormatted = formatDayMonth(holidayDate);
      if (isRangeHoliday && holidayEndDate) {
        const endFormatted = formatDayMonth(holidayEndDate);
        displayName = `${startFormatted} – ${endFormatted} · ${holidayTitle.trim()}`;
      } else {
        displayName = `${startFormatted} · ${holidayTitle.trim()}`;
      }
    }

    updateActiveSchedule(prev => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        { 
          id: `h-${Date.now()}`, 
          name: displayName,
          date: holidayDate || undefined,
          startDate: holidayDate || undefined,
          endDate: isRangeHoliday ? holidayEndDate : undefined
        }
      ]
    }));

    // Reset holiday inputs
    setHolidayTitle('');
    setHolidayDate('');
    setHolidayEndDate('');
    setIsRangeHoliday(false);
    showToast('Đã thêm ngày nghỉ lễ thành công');
  };

  // Request remove holiday with confirm modal
  const handleRequestRemoveHoliday = (holidayId: string, holidayName: string) => {
    setDeleteConfirmData({
      type: 'holiday',
      id: holidayId,
      label: holidayName
    });
  };

  // Add Make-Up Day with Date Selection
  const handleAddMakeUpDay = () => {
    if (!makeUpDate) {
      showToast('Vui lòng chọn ngày làm bù');
      return;
    }

    // Format date string from YYYY-MM-DD to DD/MM/YYYY
    const parts = makeUpDate.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : makeUpDate;
    const reasonText = makeUpReason.trim() ? ` · ${makeUpReason.trim()}` : ' · Làm bù ngày lễ';
    const fullName = `${formattedDate}${reasonText}`;

    const newMakeUpItem: MakeUpDaySchedule = {
      id: `mu-${Date.now()}`,
      name: fullName,
      date: makeUpDate,
      shift: makeUpShift,
      forHoliday: makeUpReason.trim() || undefined
    };

    updateActiveSchedule(prev => {
      const currentMakeUps = (prev.makeUpDays || []) as MakeUpDaySchedule[];
      return {
        ...prev,
        makeUpDays: [...currentMakeUps, newMakeUpItem]
      };
    });

    setMakeUpDate('');
    setMakeUpReason('');
    showToast('Đã thêm ngày làm bù thành công');
  };

  // Request remove make-up day with confirm modal
  const handleRequestRemoveMakeUpDay = (makeUpId: string, makeUpName: string) => {
    setDeleteConfirmData({
      type: 'makeup',
      id: makeUpId,
      label: makeUpName
    });
  };

  // Request remove schedule with confirm modal
  const handleRequestRemoveSchedule = (scheduleId: string, scheduleName: string) => {
    if (schedules.length <= 1) return;
    setDeleteConfirmData({
      type: 'schedule',
      id: scheduleId,
      label: scheduleName
    });
  };

  // Confirm delete handler
  const handleConfirmDeleteModal = () => {
    if (!deleteConfirmData) return;
    if (deleteConfirmData.type === 'holiday') {
      updateActiveSchedule(prev => ({
        ...prev,
        holidays: prev.holidays.filter(h => h.id !== deleteConfirmData.id)
      }));
      showToast('Đã xóa ngày lễ');
    } else if (deleteConfirmData.type === 'makeup') {
      updateActiveSchedule(prev => {
        const currentList = (prev.makeUpDays || []) as MakeUpDaySchedule[];
        return {
          ...prev,
          makeUpDays: currentList.filter(m => m.id !== deleteConfirmData.id)
        };
      });
      showToast('Đã xóa ngày làm bù');
    } else if (deleteConfirmData.type === 'schedule') {
      if (schedules.length <= 1) return;
      const nextList = schedules.filter(s => s.id !== deleteConfirmData.id);
      persistSchedules(nextList);
      if (selectedScheduleId === deleteConfirmData.id) {
        setSelectedScheduleId(nextList[0]?.id || '');
      }
      showToast('Đã xóa lịch làm việc');
    }
    setDeleteConfirmData(null);
  };

  // Save title edit
  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim() && activeSchedule) {
      updateActiveSchedule(prev => ({ ...prev, name: titleDraft.trim() }));
      showToast('Đã cập nhật tên lịch làm việc');
    }
  };

  if (!activeSchedule) return null;

  const currentMakeUpDays = (activeSchedule.makeUpDays || []) as MakeUpDaySchedule[];

  return (
    <div className="p-6 sm:p-8 max-w-[1320px] mx-auto min-h-screen font-sans text-slate-800 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6">
        <div>
          <div className="text-xs text-slate-500 font-normal">
            Cấu hình / Chất lượng dịch vụ
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Lịch làm việc
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giờ làm việc, ngày lễ, ngày làm bù — dùng chung cho SLA, định tuyến và tin nhắn tự động.
          </p>
        </div>

        {/* Nút + Tạo lịch đồng bộ màu theme hệ thống #f25621 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNewSchedule}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#f25621] hover:bg-[#d94412] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
          >
            + Tạo lịch
          </button>
        </div>
      </div>

      {/* Main 2-Column Board */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        
        {/* CỘT TRÁI: Danh sách các lịch làm việc */}
        <div className="w-full lg:w-56 shrink-0 space-y-2.5">
          {schedules.map((item) => {
            const isSelected = item.id === activeSchedule.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedScheduleId(item.id)}
                className={`w-full p-3.5 rounded-xl bg-white cursor-pointer transition-all select-none relative ${
                  isSelected
                    ? 'border-[#f25621] ring-1 ring-[#f25621] shadow-xs'
                    : 'border border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="text-xs font-bold text-slate-900 truncate leading-snug">
                    {item.name}
                  </div>
                  {/* Nút thùng rác giữ nguyên không cần hover mới hiện */}
                  {schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestRemoveSchedule(item.id, item.name);
                      }}
                      className="text-slate-400 hover:text-red-500 hover:bg-slate-100 p-1 rounded-sm transition-colors cursor-pointer shrink-0"
                      title="Xóa lịch này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {item.subtitle || 'Dùng bởi Chưa dùng'}
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: Bảng chi tiết giờ làm việc, Ngày lễ & Ngày làm bù */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-2xs">
          
          {/* Header bên phải */}
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  autoFocus
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="text-base font-bold text-slate-900 border-b border-[#f25621] outline-none px-1 py-0.5 w-full bg-transparent"
                />
              </div>
            ) : (
              <h2 
                onClick={handleStartEditTitle}
                title="Bấm để đổi tên lịch"
                className="text-base font-bold text-slate-900 cursor-pointer hover:text-[#f25621] transition-colors inline-block"
              >
                {activeSchedule.name}
              </h2>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSchedule.detailHeaderSubtitle || activeSchedule.subtitle || 'Múi giờ GMT+7'}
            </p>
          </div>

          {/* BẢNG CA LÀM VIỆC THEO NGÀY */}
          <div>
            {/* Table Header */}
            <div className="flex items-center pb-2.5 border-b border-slate-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase select-none">
              <div className="w-24 sm:w-28 shrink-0">NGÀY</div>
              <div className="w-20 shrink-0">LÀM VIỆC</div>
              <div className="flex-1">CA LÀM VIỆC (TỐI ĐA 2 CA)</div>
            </div>

            {/* Table Rows (Thứ Hai đến Chủ nhật) */}
            <div className="divide-y divide-slate-100">
              {activeSchedule.days.map((day) => {
                const shiftCount = day.shifts.length;

                return (
                  <div key={day.dayKey} className="py-2.5 sm:py-3 flex items-center">
                    
                    {/* Tên Ngày */}
                    <div className="w-24 sm:w-28 shrink-0 text-xs font-semibold text-slate-800">
                      {day.day}
                    </div>

                    {/* Switch Bật/Tắt Làm việc */}
                    <div className="w-20 shrink-0 flex items-center">
                      <ToggleSwitch
                        checked={day.enabled}
                        onChange={(val) => handleToggleDay(day.dayKey, val)}
                      />
                    </div>

                    {/* Cột Ca làm việc */}
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      {!day.enabled ? (
                        <span className="text-xs text-slate-400 italic">
                          Nghỉ
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                          
                          {/* Render danh sách ca (Tối đa 2 ca) */}
                          {day.shifts.map((shift, shiftIndex) => (
                            <div 
                              key={shiftIndex} 
                              className="inline-flex items-center gap-1.5 bg-slate-50/70 border border-slate-200/90 rounded-lg px-2 py-1 shadow-2xs"
                            >
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                                Ca {shiftIndex + 1}:
                              </span>
                              <TimeBox
                                value={shift.start}
                                onChange={(val) => handleUpdateShiftTime(day.dayKey, shiftIndex, 'start', val)}
                              />
                              <span className="text-slate-400 text-xs">–</span>
                              <TimeBox
                                value={shift.end}
                                onChange={(val) => handleUpdateShiftTime(day.dayKey, shiftIndex, 'end', val)}
                              />
                              
                              {/* Nút xóa ca làm việc - dấu x theo yêu cầu */}
                              <button
                                type="button"
                                onClick={() => handleDeleteShift(day.dayKey, shiftIndex)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 p-1 rounded-md transition-colors cursor-pointer"
                                title={`Xóa Ca ${shiftIndex + 1}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* Thông báo nếu chưa có ca nào */}
                          {shiftCount === 0 && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-center">
                              Chưa có ca làm việc
                            </span>
                          )}

                          {/* Nút Thêm ca (Chỉ hiển thị khi số ca < 2) */}
                          {shiftCount < 2 && (
                            <button
                              type="button"
                              onClick={() => handleAddShift(day.dayKey)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#f25621] hover:text-[#d94412] bg-[#fff4f0] hover:bg-[#ffece6] border border-[#ffd5c7] rounded-md transition-colors cursor-pointer shadow-2xs shrink-0"
                              title="Thêm ca làm việc (tối đa 2 ca)"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Thêm ca</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* KHỐI DƯỚI: NGÀY LỄ 2026 & NGÀY LÀM BÙ */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Cột trái: Ngày lễ (Chọn ngày & Danh sách) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#f25621]" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider select-none">
                    Ngày nghỉ lễ
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {activeSchedule.holidays.length} ngày đã cấu hình
                </span>
              </div>

              {/* Danh sách ngày lễ */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {activeSchedule.holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between px-3 py-2 bg-[#f8fafc] hover:bg-slate-100/80 rounded-lg text-xs text-slate-700 transition-colors"
                  >
                    <span className="font-medium text-slate-800">{holiday.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRequestRemoveHoliday(holiday.id, holiday.name)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                      title="Xóa ngày lễ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {activeSchedule.holidays.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">Chưa có ngày nghỉ lễ nào.</p>
                )}
              </div>

              {/* Gợi ý chọn nhanh các ngày lễ chuẩn */}
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
                  Chọn nhanh dịp lễ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {HOLIDAY_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyHolidayPreset(preset)}
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-[#fff4f0] hover:text-[#f25621] hover:border-[#ffd5c7] border border-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Chọn ngày nghỉ lễ */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Chọn ngày nghỉ lễ mới:
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRangeHoliday}
                      onChange={(e) => setIsRangeHoliday(e.target.checked)}
                      className="rounded text-[#f25621] accent-[#f25621] focus:ring-0"
                    />
                    <span>Nghỉ nhiều ngày (Khoảng ngày)</span>
                  </label>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">
                      {isRangeHoliday ? 'Từ ngày:' : 'Chọn ngày lễ:'}
                    </label>
                    <input
                      type="date"
                      value={holidayDate}
                      onChange={(e) => setHolidayDate(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-md border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621]"
                    />
                  </div>
                  {isRangeHoliday && (
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">
                        Đến ngày:
                      </label>
                      <input
                        type="date"
                        value={holidayEndDate}
                        onChange={(e) => setHolidayEndDate(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-md border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621]"
                      />
                    </div>
                  )}
                </div>

                {/* Tên ngày lễ & Nút Thêm */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={holidayTitle}
                    onChange={(e) => setHolidayTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHolidayWithDate()}
                    placeholder="Tên ngày lễ (VD: Tết Dương lịch, Quốc khánh...)"
                    className="flex-1 h-8.5 px-3 rounded-md border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHolidayWithDate}
                    className="px-4 h-8.5 rounded-md bg-[#f25621] hover:bg-[#d94412] text-xs font-medium text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    + Thêm ngày lễ
                  </button>
                </div>
              </div>

            </div>

            {/* Cột phải: Ngày làm bù (Chọn ngày & Danh sách) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[#f25621]" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider select-none">
                    Ngày làm bù
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {currentMakeUpDays.length} ngày đã thiết lập
                </span>
              </div>

              {/* Danh sách ngày làm bù */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {currentMakeUpDays.map((makeup) => (
                  <div
                    key={makeup.id}
                    className="flex items-center justify-between px-3 py-2 bg-emerald-50/50 border border-emerald-100/80 rounded-lg text-xs text-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{makeup.name}</span>
                      </div>
                      {makeup.shift && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Giờ làm bù: <span className="font-medium text-slate-700">{makeup.shift}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRequestRemoveMakeUpDay(makeup.id, makeup.name)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer shrink-0"
                      title="Xóa ngày làm bù này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {currentMakeUpDays.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">
                    Chưa có ngày làm bù. Thiết lập bên dưới khi cần làm bù cho các dịp nghỉ lễ.
                  </p>
                )}
              </div>

              {/* Form Chọn ngày làm bù */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-2.5">
                <span className="text-xs font-semibold text-slate-700 block">
                  Chọn ngày làm bù mới:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">
                      Ngày đi làm bù:
                    </label>
                    <input
                      type="date"
                      value={makeUpDate}
                      onChange={(e) => setMakeUpDate(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-md border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">
                      Khung giờ làm việc:
                    </label>
                    <select
                      value={makeUpShift}
                      onChange={(e) => setMakeUpShift(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621]"
                    >
                      <option value="08:00 AM – 05:30 PM">Cả ngày (08:00 AM – 05:30 PM)</option>
                      <option value="08:00 AM – 12:00 PM">Ca sáng (08:00 AM – 12:00 PM)</option>
                      <option value="01:30 PM – 05:30 PM">Ca chiều (01:30 PM – 05:30 PM)</option>
                      <option value="08:00 AM – 05:00 PM">08:00 AM – 05:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Lý do / Làm bù cho dịp lễ nào */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={makeUpReason}
                    onChange={(e) => setMakeUpReason(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMakeUpDay()}
                    placeholder="Lý do / Làm bù cho (VD: Làm bù nghỉ lễ 30/04 & 01/05)"
                    className="flex-1 h-8.5 px-3 rounded-md border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMakeUpDay}
                    className="px-4 h-8.5 rounded-md bg-[#f25621] hover:bg-[#d94412] text-xs font-medium text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    + Thêm ngày làm bù
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Pop up xác nhận xóa chuẩn theo hình ảnh */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmData)}
        onClose={() => setDeleteConfirmData(null)}
        onConfirm={handleConfirmDeleteModal}
        title="Thông báo"
        message="Bạn có chắc chắn muốn xóa?"
        confirmText="Đồng ý"
        cancelText="Hủy bỏ"
      />

    </div>
  );
}
