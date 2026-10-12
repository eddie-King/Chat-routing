export type AutoMessageTriggerType = 
  | 'AUTO_CLOSE'           // Tự động đóng phiên chat
  | 'WAIT_TIMEOUT'         // Quá thời gian chờ tiếp nhận
  | 'OFF_HOURS'            // Ngoài giờ làm việc
  | 'SESSION_CLOSED'       // Kết thúc phiên chat
  | 'IMMEDIATE'            // Dành cho tương thích ngược nếu có
  | 'INACTIVITY_REMINDER'
  | 'QUEUE_OVERLOAD'
  | 'CUSTOM';

export interface AutoMessageTriggerConfig {
  type: AutoMessageTriggerType;
  typeLabel: string;
  value?: number;
  unit?: 'giây' | 'phút' | 'giờ' | 'khách';
  timeFrom?: string;
  timeTo?: string;
  summaryText: string;
}

export interface AutoMessageVariable {
  code: string;
  label: string;
  sampleValue?: string;
}

export interface AutoMessageCaseItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  priority: number;
  trigger: AutoMessageTriggerConfig;
  message: string;
  channels: string[];
  variables: AutoMessageVariable[];
  actionTag?: string;
  isCustom?: boolean;
}

export const AUTO_MESSAGE_CATEGORIES = [
  'Tất cả',
  'Lời chào',
  'SLA & Chờ',
  'Lịch làm việc',
  'Tùy chỉnh'
] as const;

export const ALL_AUTO_MESSAGE_CHANNELS = [
  'Facebook',
  'Zalo OA',
  'Website LiveChat',
  'Telegram',
  'SMS'
] as const;

// CHỈ GIỮ LẠI 4 ĐIỀU KIỆN THEO YÊU CẦU:
// 1. Tự động đóng phiên chat
// 2. Quá thời gian chờ tiếp nhận
// 3. Ngoài giờ làm việc
// 4. Kết thúc phiên chat
export const TRIGGER_TYPE_OPTIONS: { type: AutoMessageTriggerType; label: string; defaultUnit?: 'giây' | 'phút' | 'giờ' | 'khách' }[] = [
  { type: 'AUTO_CLOSE', label: 'Tự động đóng phiên chat', defaultUnit: 'phút' },
  { type: 'WAIT_TIMEOUT', label: 'Quá thời gian chờ tiếp nhận', defaultUnit: 'phút' },
  { type: 'OFF_HOURS', label: 'Ngoài giờ làm việc' },
  { type: 'SESSION_CLOSED', label: 'Kết thúc phiên chat' }
];

export const COMMON_AUTO_MESSAGE_VARIABLES: AutoMessageVariable[] = [
  { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Nguyễn Văn An' },
  { code: '{TEN_AGENT}', label: 'Tên tư vấn viên', sampleValue: 'Lê Thanh Trúc' },
  { code: '{TEN_HANG_DOI}', label: 'Tên hàng đợi', sampleValue: 'Hỗ trợ Kỹ thuật & Sự cố' },
  { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' },
  { code: '{THOI_GIAN_CHO}', label: 'Thời gian chờ', sampleValue: '5 phút' },
  { code: '{GIO_LAM_VIEC}', label: 'Khung giờ làm việc', sampleValue: '08:00 - 22:00' }
];

// DATA MẪU TƯƠNG ỨNG CÁC ĐIỀU KIỆN KÍCH HOẠT HỢP LỆ
export const INITIAL_AUTO_MESSAGE_CASES: AutoMessageCaseItem[] = [
  {
    id: 'AUTO_CLOSE_CASE',
    code: 'AUTO_CLOSE',
    name: 'Tự động đóng phiên chat',
    description: 'Tự động đóng phiên khi khách hàng không tương tác quá thời gian chờ',
    category: 'SLA & Chờ',
    enabled: true,
    priority: 1,
    trigger: {
      type: 'AUTO_CLOSE',
      typeLabel: 'Tự động đóng phiên chat',
      value: 15,
      unit: 'phút',
      summaryText: 'Tự động đóng phiên chat'
    },
    message: 'Phiên trò chuyện đã được tự động kết thúc do hết thời gian chờ phản hồi. Nếu cần hỗ trợ thêm, quý khách vui lòng gửi lại tin nhắn. Hotline: {HOTLINE}.',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: [
      { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Nguyễn Văn An' },
      { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' }
    ],
    actionTag: 'Tự động đóng phiên'
  },
  {
    id: 'WAIT_SLA',
    code: 'AUTO_WAIT_SLA',
    name: 'Quá thời gian chờ tiếp nhận',
    description: 'Gửi khi khách chờ quá 5 phút',
    category: 'SLA & Chờ',
    enabled: true,
    priority: 2,
    trigger: {
      type: 'WAIT_TIMEOUT',
      typeLabel: 'Quá thời gian chờ tiếp nhận',
      value: 5,
      unit: 'phút',
      summaryText: 'Quá thời gian chờ tiếp nhận'
    },
    message: 'Kính chào {TEN_KHACH_HANG}, hệ thống đang sắp xếp tư vấn viên hỗ trợ bạn. Xin vui lòng giữ kết nối trong giây lát. Hotline: {HOTLINE}.',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: [
      { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Nguyễn Văn An' },
      { code: '{THOI_GIAN_CHO}', label: 'Thời gian chờ', sampleValue: '5 phút' },
      { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' }
    ],
    actionTag: 'Duy trì kết nối'
  },
  {
    id: 'OFF_HOURS',
    code: 'AUTO_OFF_HOURS',
    name: 'Ngoài giờ làm việc',
    description: 'Gửi ngoài khung giờ 08:00 - 22:00',
    category: 'Lịch làm việc',
    enabled: true,
    priority: 3,
    trigger: {
      type: 'OFF_HOURS',
      typeLabel: 'Ngoài giờ làm việc',
      timeFrom: '22:00',
      timeTo: '08:00',
      summaryText: 'Ngoài giờ làm việc'
    },
    message: 'Kính chào {TEN_KHACH_HANG}, hiện tại đã hết giờ làm việc trực tuyến ({GIO_LAM_VIEC}). Chuyên viên sẽ phản hồi vào đầu ca sáng mai. Hotline: {HOTLINE}.',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: [
      { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Phạm Thu Trang' },
      { code: '{GIO_LAM_VIEC}', label: 'Khung giờ làm việc', sampleValue: '08:00 - 22:00' },
      { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' }
    ],
    actionTag: 'Tạo phiếu Offline'
  },
  {
    id: 'SESSION_CLOSED_CASE',
    code: 'AUTO_SESSION_CLOSED',
    name: 'Kết thúc phiên chat',
    description: 'Gửi lời cảm ơn khi kết thúc phiên chat',
    category: 'Lời chào',
    enabled: true,
    priority: 4,
    trigger: {
      type: 'SESSION_CLOSED',
      typeLabel: 'Kết thúc phiên chat',
      summaryText: 'Kết thúc phiên chat'
    },
    message: 'Cảm ơn quý khách {TEN_KHACH_HANG} đã liên hệ với UniSpace. Chúc quý khách một ngày làm việc hiệu quả và vui vẻ! Hotline: {HOTLINE}.',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: [
      { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Nguyễn Văn An' },
      { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' }
    ],
    actionTag: 'Kết thúc phiên chat'
  }
];
