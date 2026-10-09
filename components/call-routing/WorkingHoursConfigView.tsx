'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { 
  WorkingScheduleItem, 
  DayWorkingSchedule, 
  ShiftSlot,
  INITIAL_WORKING_SCHEDULES,
  EXACT_IMAGE_WEEK_DAYS
} from '@/lib/working-hours-data';

interface WorkingHoursConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatRouting?: () => void;
}

// Green pill switch matching the exact toggle in image.png
function GreenToggle({ 
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
        checked ? 'bg-[#059669]' : 'bg-[#cbd5e1]'
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
      <div className="inline-flex items-center justify-between h-8 px-2 rounded-md border border-[#ea580c] bg-white text-xs text-slate-800 w-28 shadow-2xs">
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
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
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

export function WorkingHoursConfigView({
  onSwitchToCallRouting,
  onSwitchToChatRouting
}: WorkingHoursConfigViewProps) {
  // Schedules List state backed by localStorage
  const [schedules, setSchedules] = useState<WorkingScheduleItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_working_schedules_image_v1');
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

  const [newHolidayText, setNewHolidayText] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Persist to localStorage
  const persistSchedules = (next: WorkingScheduleItem[]) => {
    setSchedules(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('unispace_working_schedules_image_v1', JSON.stringify(next));
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

  // Clear shifts for a day
  const handleClearDayShifts = (dayKey: string) => {
    handleToggleDay(dayKey, false);
  };

  // Add holiday
  const handleAddHoliday = () => {
    if (!newHolidayText.trim()) return;
    updateActiveSchedule(prev => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        { id: `h-${Date.now()}`, name: newHolidayText.trim() }
      ]
    }));
    setNewHolidayText('');
  };

  // Remove holiday
  const handleRemoveHoliday = (holidayId: string) => {
    updateActiveSchedule(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h.id !== holidayId)
    }));
  };

  // Save title edit
  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim() && activeSchedule) {
      updateActiveSchedule(prev => ({ ...prev, name: titleDraft.trim() }));
    }
  };

  if (!activeSchedule) return null;

  return (
    <div className="p-6 sm:p-8 max-w-[1300px] mx-auto min-h-screen font-sans text-slate-800">
      
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

        {/* Nút + Tạo lịch màu cam burnt orange đúng như ảnh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNewSchedule}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#c2410c] hover:bg-[#9a3412] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
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
                className={`w-full p-3.5 rounded-xl bg-white cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'border border-[#ea580c] shadow-2xs'
                    : 'border border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 truncate leading-snug">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {item.subtitle || 'Dùng bởi Chưa dùng'}
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: Bảng chi tiết giờ làm việc & Ngày lễ */}
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
                  className="text-base font-bold text-slate-900 border-b border-[#ea580c] outline-none px-1 py-0.5 w-full bg-transparent"
                />
              </div>
            ) : (
              <h2 
                onClick={handleStartEditTitle}
                title="Bấm để đổi tên lịch"
                className="text-base font-bold text-slate-900 cursor-pointer hover:text-[#ea580c] transition-colors inline-block"
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
              <div className="flex-1">CA LÀM VIỆC</div>
            </div>

            {/* Table Rows (Thứ Hai đến Chủ nhật) */}
            <div className="divide-y divide-slate-100">
              {activeSchedule.days.map((day) => {
                const shift1 = day.shifts[0];
                const shift2 = day.shifts[1];

                return (
                  <div key={day.dayKey} className="py-2.5 sm:py-3 flex items-center">
                    
                    {/* Tên Ngày */}
                    <div className="w-24 sm:w-28 shrink-0 text-xs font-semibold text-slate-800">
                      {day.day}
                    </div>

                    {/* Switch Bật/Tắt Làm việc */}
                    <div className="w-20 shrink-0 flex items-center">
                      <GreenToggle
                        checked={day.enabled}
                        onChange={(val) => handleToggleDay(day.dayKey, val)}
                      />
                    </div>

                    {/* Cột Ca làm việc */}
                    <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                      {!day.enabled ? (
                        <span className="text-xs text-slate-400 italic">
                          Nghỉ
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Ca 1 */}
                          {shift1 && (
                            <div className="flex items-center gap-1.5">
                              <TimeBox
                                value={shift1.start}
                                onChange={(val) => handleUpdateShiftTime(day.dayKey, 0, 'start', val)}
                              />
                              <span className="text-slate-400 text-xs">–</span>
                              <TimeBox
                                value={shift1.end}
                                onChange={(val) => handleUpdateShiftTime(day.dayKey, 0, 'end', val)}
                              />
                            </div>
                          )}

                          {/* Dấu gạch đứng phân cách giữa 2 ca */}
                          {shift1 && shift2 && (
                            <span className="text-slate-300 mx-1 select-none">|</span>
                          )}

                          {/* Ca 2 */}
                          {shift2 && (
                            <div className="flex items-center gap-1.5">
                              <TimeBox
                                value={shift2.start}
                                onChange={(val) => handleUpdateShiftTime(day.dayKey, 1, 'start', val)}
                              />
                              <span className="text-slate-400 text-xs">–</span>
                              <TimeBox
                                value={shift2.end}
                                onChange={(val) => handleUpdateShiftTime(day.dayKey, 1, 'end', val)}
                              />
                            </div>
                          )}

                          {/* Nút ✕ xóa ca ngày này */}
                          <button
                            type="button"
                            onClick={() => handleClearDayShifts(day.dayKey)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors ml-2 cursor-pointer"
                            title="Tắt ca làm việc ngày này"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* KHỐI DƯỚI: NGÀY LỄ 2026 & NGÀY LÀM BÙ */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Cột trái: Ngày lễ 2026 */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 mb-3 select-none">
                Ngày lễ 2026
              </h3>

              <div className="space-y-1.5">
                {activeSchedule.holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between px-3 py-2 bg-[#f8fafc] rounded-md text-xs text-slate-700"
                  >
                    <span>{holiday.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(holiday.id)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors cursor-pointer"
                      title="Xóa ngày lễ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Ô nhập thêm ngày lễ mới */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newHolidayText}
                  onChange={(e) => setNewHolidayText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHoliday()}
                  placeholder="VD: 24/12 · Giáng sinh"
                  className="flex-1 h-8.5 px-3 rounded-md border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="px-4 h-8.5 rounded-md border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 bg-white transition-colors cursor-pointer shrink-0"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Cột phải: Ngày làm bù */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 mb-3 select-none">
                Ngày làm bù
              </h3>
              <p className="text-xs text-slate-400">
                Chưa có ngày làm bù.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
