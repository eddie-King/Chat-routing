export interface SlaPolicyItem {
  id: string;
  name: string;
  days: number;
  hours: number;
  minutes: number;
  workingSchedule: string;
  warningPercent: number; // default e.g. 65
  workcodes: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_SLA_POLICIES: SlaPolicyItem[] = [
  {
    id: 'sla-1',
    name: 'BGT_Giao dịch lỗi đã trừ tiền',
    days: 1,
    hours: 0,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: ['BGT_Giao dịch lỗi đã trừ tiền'],
    createdAt: '2026-08-15',
    updatedAt: '2026-09-20'
  },
  {
    id: 'sla-2',
    name: 'BGT_Terminal không in được vé',
    days: 0,
    hours: 4,
    minutes: 0,
    workingSchedule: 'Hành chính – Hà Nội',
    warningPercent: 65,
    workcodes: ['BGT_Terminal không in được vé'],
    createdAt: '2026-08-16',
    updatedAt: '2026-09-21'
  },
  {
    id: 'sla-3',
    name: 'BGT_Thay đổi thông tin đại lý',
    days: 2,
    hours: 0,
    minutes: 0,
    workingSchedule: 'Hành chính – Hà Nội',
    warningPercent: 65,
    workcodes: ['BGT_Thay đổi thông tin đại lý'],
    createdAt: '2026-08-18',
    updatedAt: '2026-09-21'
  },
  {
    id: 'sla-4',
    name: 'Hỗ trợ khách hàng',
    days: 1,
    hours: 0,
    minutes: 0,
    workingSchedule: 'Hành chính – HCM',
    warningPercent: 65,
    workcodes: ['Hỗ trợ khách hàng'],
    createdAt: '2026-08-20',
    updatedAt: '2026-09-22'
  },
  {
    id: 'sla-5',
    name: 'Khách hàng',
    days: 3,
    hours: 0,
    minutes: 0,
    workingSchedule: 'Hành chính – Hà Nội',
    warningPercent: 65,
    workcodes: ['Khách hàng'],
    createdAt: '2026-08-22',
    updatedAt: '2026-09-22'
  },
  {
    id: 'sla-6',
    name: 'SLA tạo mới',
    days: 0,
    hours: 8,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: [],
    createdAt: '2026-09-01',
    updatedAt: '2026-09-01'
  },
  {
    id: 'sla-7',
    name: '11',
    days: 0,
    hours: 1,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: [],
    createdAt: '2026-09-05',
    updatedAt: '2026-09-05'
  },
  {
    id: 'sla-8',
    name: '123',
    days: 0,
    hours: 2,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: [],
    createdAt: '2026-09-10',
    updatedAt: '2026-09-10'
  },
  {
    id: 'sla-9',
    name: 'BGT_Tra soát hoá đơn điện tử',
    days: 1,
    hours: 0,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: ['BGT_Tra soát hoá đơn điện tử'],
    createdAt: '2026-09-11',
    updatedAt: '2026-09-11'
  },
  {
    id: 'sla-10',
    name: 'BGT_Cập nhật số điện thoại OTP',
    days: 0,
    hours: 2,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: ['BGT_Cập nhật số điện thoại nhận mã OTP'],
    createdAt: '2026-09-12',
    updatedAt: '2026-09-12'
  },
  {
    id: 'sla-11',
    name: 'Kỹ thuật POS / SmartPOS',
    days: 0,
    hours: 4,
    minutes: 0,
    workingSchedule: 'Hành chính – Hà Nội',
    warningPercent: 65,
    workcodes: ['Kỹ thuật POS / SmartPOS'],
    createdAt: '2026-09-12',
    updatedAt: '2026-09-12'
  },
  {
    id: 'sla-12',
    name: 'Khiếu nại dịch vụ khách hàng',
    days: 2,
    hours: 0,
    minutes: 0,
    workingSchedule: 'Hành chính – HCM',
    warningPercent: 65,
    workcodes: [],
    createdAt: '2026-09-13',
    updatedAt: '2026-09-13'
  },
  {
    id: 'sla-13',
    name: 'Yêu cầu hoàn tiền giao dịch thẻ',
    days: 3,
    hours: 0,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: [],
    createdAt: '2026-09-14',
    updatedAt: '2026-09-14'
  },
  {
    id: 'sla-14',
    name: 'Kích hoạt dịch vụ E-Banking',
    days: 0,
    hours: 1,
    minutes: 0,
    workingSchedule: '24/7',
    warningPercent: 65,
    workcodes: ['BANKING SERVICE > Kích hoạt dịch vụ E-Banking'],
    createdAt: '2026-09-15',
    updatedAt: '2026-09-15'
  },
  {
    id: 'sla-15',
    name: 'Tư vấn bảo hiểm & thẻ tín dụng',
    days: 1,
    hours: 0,
    minutes: 0,
    workingSchedule: 'Hành chính – Hà Nội',
    warningPercent: 65,
    workcodes: ['BANKING SERVICE > Bảo hiểm > Tư vấn dịch vụ > KH có nhu cầu đăng ký sử dụng dịch vụ'],
    createdAt: '2026-09-16',
    updatedAt: '2026-09-16'
  },
  {
    id: 'sla-16',
    name: 'Hỗ trợ kết nối API & Webhook',
    days: 0,
    hours: 8,
    minutes: 0,
    workingSchedule: 'Hành chính – Hà Nội',
    warningPercent: 65,
    workcodes: [],
    createdAt: '2026-09-17',
    updatedAt: '2026-09-17'
  }
];

export const AVAILABLE_WORKCODES: string[] = [
  '1 WC 06082026',
  'BANKING SERVICE > Bảo hiểm > Hỗ trợ dịch vụ',
  'BANKING SERVICE > Bảo hiểm > Tư vấn dịch vụ > KH có nhu cầu đăng ký sử dụng dịch vụ',
  'BANKING SERVICE > Bảo hiểm > Tư vấn dịch vụ > KH tham khảo thông tin',
  'BANKING SERVICE > Cardless',
  'BANKING SERVICE > Cuộc gọi từ chi nhánh',
  'BANKING SERVICE > Dịch vụ chuyển tiền/ thanh toán',
  'BANKING SERVICE > Dịch vụ ngân hàng ưu tiên',
  'BANKING SERVICE > Điểm giao dịch',
  'BANKING SERVICE > Fast | bank',
  'BANKING SERVICE > Gửi tiết kiệm online',
  'BANKING SERVICE > Hạn mức giao dịch trực tuyến',
  'BANKING SERVICE > Khiếu nại giao dịch ATM',
  'BANKING SERVICE > Khóa/ Mở khóa thẻ tạm thời',
  'BANKING SERVICE > Kích hoạt dịch vụ E-Banking',
  'BANKING SERVICE > Mở tài khoản số đẹp',
  'BANKING SERVICE > Phí thường niên & Biểu phí',
  'BANKING SERVICE > Phát hành lại mã PIN/ OTP',
  'BANKING SERVICE > Quản lý người thụ hưởng',
  'BANKING SERVICE > SMS Banking > Đăng ký & Huỷ dịch vụ',
  'BANKING SERVICE > Thẻ tín dụng > Tra soát sao kê',
  'BANKING SERVICE > Thẻ tín dụng > Trả góp 0%',
  'BANKING SERVICE > Thẻ tín dụng > Yêu cầu nâng hạn mức',
  'BANKING SERVICE > Tín chấp tiêu dùng',
  'BANKING SERVICE > Tra soát giao dịch Napas 24/7',
  'BANKING SERVICE > Vay mua nhà & Xe ô tô',
  'BGT_Giao dịch lỗi đã trừ tiền',
  'BGT_Terminal không in được vé',
  'BGT_Thay đổi thông tin đại lý',
  'BGT_Tra soát hoá đơn điện tử',
  'BGT_Cập nhật số điện thoại nhận mã OTP',
  'Hỗ trợ khách hàng',
  'Khách hàng',
  'Kỹ thuật POS / SmartPOS'
];

const STORAGE_KEY = 'unispace_sla_policies_v1';

export function loadSlaPolicies(): SlaPolicyItem[] {
  if (typeof window === 'undefined') return INITIAL_SLA_POLICIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (parsed.length < INITIAL_SLA_POLICIES.length) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const extra = INITIAL_SLA_POLICIES.filter(p => !existingIds.has(p.id));
          const merged = [...parsed, ...extra];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load SLA policies from storage:', err);
  }
  return INITIAL_SLA_POLICIES;
}

export function saveSlaPolicies(policies: SlaPolicyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    window.dispatchEvent(new Event('unispace_sla_updated'));
  } catch (err) {
    console.error('Failed to save SLA policies:', err);
  }
}

export function formatDurationText(days: number, hours: number, minutes: number): string {
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (parts.length === 0) return '0 phút';
  return parts.join(' ');
}

export function calculateWarningDurationText(
  days: number,
  hours: number,
  minutes: number,
  percent: number
): string {
  const totalMinutes = (Number(days) || 0) * 24 * 60 + (Number(hours) || 0) * 60 + (Number(minutes) || 0);
  if (totalMinutes <= 0) return '0 phút';

  const warningMinutes = Math.round(totalMinutes * ((Number(percent) || 0) / 100));
  if (warningMinutes <= 0) return '0 phút';

  const wDays = Math.floor(warningMinutes / (24 * 60));
  const remMinutes = warningMinutes % (24 * 60);
  const wHours = Math.floor(remMinutes / 60);
  const wMins = remMinutes % 60;

  const parts: string[] = [];
  if (wDays > 0) parts.push(`${wDays} ngày`);
  if (wHours > 0) parts.push(`${wHours} giờ`);
  if (wMins > 0) parts.push(`${wMins} phút`);

  return parts.length > 0 ? parts.join(' ') : '0 phút';
}
