export interface ShiftSlot {
  start: string; // e.g. "08:00 AM"
  end: string;   // e.g. "12:00 PM"
}

export interface DayWorkingSchedule {
  day: 'Thứ Hai' | 'Thứ Ba' | 'Thứ Tư' | 'Thứ Năm' | 'Thứ Sáu' | 'Thứ Bảy' | 'Chủ nhật';
  dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  enabled: boolean;
  shifts: ShiftSlot[];
}

export interface HolidaySchedule {
  id: string;
  name: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  closed?: boolean;
}

export interface MakeUpDaySchedule {
  id: string;
  name: string;
  date?: string;
  shift?: string;
  forHoliday?: string;
}

export interface WorkingScheduleItem {
  id: string;
  name: string;
  code?: string;
  subtitle?: string;
  detailHeaderSubtitle?: string;
  description?: string;
  timezone?: string;
  days: DayWorkingSchedule[];
  holidays: HolidaySchedule[];
  makeUpDays?: MakeUpDaySchedule[];
  afterHoursAction?: string;
  status?: 'Áp dụng' | 'Tạm dừng';
  createdAt?: string;
  updatedAt?: string;
  appliedCount?: number;
}

export const EXACT_IMAGE_WEEK_DAYS: DayWorkingSchedule[] = [
  {
    day: 'Thứ Hai',
    dayKey: 'mon',
    enabled: true,
    shifts: [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
  },
  {
    day: 'Thứ Ba',
    dayKey: 'tue',
    enabled: true,
    shifts: [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
  },
  {
    day: 'Thứ Tư',
    dayKey: 'wed',
    enabled: true,
    shifts: [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
  },
  {
    day: 'Thứ Năm',
    dayKey: 'thu',
    enabled: true,
    shifts: [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
  },
  {
    day: 'Thứ Sáu',
    dayKey: 'fri',
    enabled: true,
    shifts: [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
  },
  {
    day: 'Thứ Bảy',
    dayKey: 'sat',
    enabled: false,
    shifts: []
  },
  {
    day: 'Chủ nhật',
    dayKey: 'sun',
    enabled: true,
    shifts: [{ start: '08:00 AM', end: '12:00 PM' }, { start: '01:30 PM', end: '05:30 PM' }]
  }
];

export const DEFAULT_WEEK_DAYS: DayWorkingSchedule[] = EXACT_IMAGE_WEEK_DAYS;

export const INITIAL_WORKING_SCHEDULES: WorkingScheduleItem[] = [
  {
    id: 'sch-hn',
    name: 'Hành chính – Hà Nội',
    subtitle: 'Dùng bởi 6 SLA · Tin nhắn ngoài giờ',
    detailHeaderSubtitle: 'Múi giờ GMT+7 · dùng bởi 6 SLA · Tin nhắn ngoài giờ',
    code: 'SCH_HN_OFFICE',
    description: 'Giờ làm việc văn phòng Hà Nội',
    timezone: 'GMT+7',
    days: EXACT_IMAGE_WEEK_DAYS,
    holidays: [
      { id: 'h1', name: '01/01 · Tết Dương lịch' },
      { id: 'h2', name: '16/02 – 22/02 · Tết Nguyên đán' },
      { id: 'h3', name: '26/04 · Giỗ Tổ Hùng Vương' },
      { id: 'h4', name: '30/04 – 01/05 · Lễ 30/4 & 1/5' },
      { id: 'h5', name: '01/09 – 02/09 · Quốc khánh' }
    ],
    makeUpDays: [],
    afterHoursAction: 'Tin nhắn ngoài giờ',
    status: 'Áp dụng',
    createdAt: '15/08/2026',
    updatedAt: '25/09/2026',
    appliedCount: 6
  },
  {
    id: 'sch-hcm',
    name: 'Hành chính – HCM',
    subtitle: 'Dùng bởi 1 SLA',
    detailHeaderSubtitle: 'Múi giờ GMT+7 · dùng bởi 1 SLA · Tin nhắn ngoài giờ',
    code: 'SCH_HCM_OFFICE',
    description: 'Giờ làm việc văn phòng TP. Hồ Chí Minh',
    timezone: 'GMT+7',
    days: EXACT_IMAGE_WEEK_DAYS.map(d => d.dayKey === 'sun' ? { ...d, enabled: false, shifts: [] } : d),
    holidays: [
      { id: 'h1', name: '01/01 · Tết Dương lịch' },
      { id: 'h2', name: '16/02 – 22/02 · Tết Nguyên đán' },
      { id: 'h3', name: '26/04 · Giỗ Tổ Hùng Vương' },
      { id: 'h4', name: '30/04 – 01/05 · Lễ 30/4 & 1/5' },
      { id: 'h5', name: '01/09 – 02/09 · Quốc khánh' }
    ],
    makeUpDays: [],
    afterHoursAction: 'Tin nhắn ngoài giờ',
    status: 'Áp dụng',
    createdAt: '18/08/2026',
    updatedAt: '20/09/2026',
    appliedCount: 1
  },
  {
    id: 'sch-24-7',
    name: '24/7',
    subtitle: 'Dùng bởi 5 SLA',
    detailHeaderSubtitle: 'Múi giờ GMT+7 · dùng bởi 5 SLA',
    code: 'SCH_24_7',
    description: 'Trực kỹ thuật và chăm sóc khách hàng 24/7',
    timezone: 'GMT+7',
    days: EXACT_IMAGE_WEEK_DAYS.map(d => ({
      ...d,
      enabled: true,
      shifts: [{ start: '00:00 AM', end: '11:59 PM' }]
    })),
    holidays: [],
    makeUpDays: [],
    afterHoursAction: 'Hàng đợi trực 24/7',
    status: 'Áp dụng',
    createdAt: '20/08/2026',
    updatedAt: '22/09/2026',
    appliedCount: 5
  },
  {
    id: 'sch-new-1',
    name: 'Lịch mới',
    subtitle: 'Dùng bởi Chưa dùng',
    detailHeaderSubtitle: 'Múi giờ GMT+7 · Chưa dùng',
    code: 'SCH_NEW_1',
    description: 'Lịch biểu mới thiết lập',
    timezone: 'GMT+7',
    days: EXACT_IMAGE_WEEK_DAYS,
    holidays: [
      { id: 'h1', name: '01/01 · Tết Dương lịch' },
      { id: 'h2', name: '16/02 – 22/02 · Tết Nguyên đán' }
    ],
    makeUpDays: [],
    afterHoursAction: 'Tin nhắn ngoài giờ',
    status: 'Áp dụng',
    createdAt: '01/09/2026',
    updatedAt: '01/09/2026',
    appliedCount: 0
  },
  {
    id: 'sch-new-2',
    name: 'Lịch mới',
    subtitle: 'Dùng bởi Chưa dùng',
    detailHeaderSubtitle: 'Múi giờ GMT+7 · Chưa dùng',
    code: 'SCH_NEW_2',
    description: 'Lịch biểu mới thiết lập',
    timezone: 'GMT+7',
    days: EXACT_IMAGE_WEEK_DAYS,
    holidays: [
      { id: 'h1', name: '01/01 · Tết Dương lịch' }
    ],
    makeUpDays: [],
    afterHoursAction: 'Tin nhắn ngoài giờ',
    status: 'Áp dụng',
    createdAt: '02/09/2026',
    updatedAt: '02/09/2026',
    appliedCount: 0
  }
];

export const AFTER_HOURS_ACTIONS = [
  'Tin nhắn ngoài giờ',
  'Gửi tin nhắn tự động & Lưu ticket hẹn phản hồi',
  'Chuyển sang Bot AI UniBot tư vấn tự động',
  'Phát âm thông báo ngoài giờ & Ngắt kết nối',
  'Chuyển tiếp sang Hộp thư thoại (Voicemail)',
  'Chuyển tiếp sang Hàng đợi trực dự phòng 24/7'
];

export const WORKING_SCHEDULE_OPTIONS = INITIAL_WORKING_SCHEDULES.map(s => s.name);

export function getAvailableWorkingSchedules(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('unispace_working_schedules_image_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => s.name || s);
        }
      }
    } catch {
      // ignore
    }
  }
  return WORKING_SCHEDULE_OPTIONS;
}
