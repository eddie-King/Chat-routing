export type AutoMessageTriggerType = 
  | 'IMMEDIATE'            // Ngay khi khách mở phiên chat / gửi tin nhắn đầu tiên
  | 'WAIT_TIMEOUT'         // Sau khi chờ tiếp nhận quá thời gian (phút/giây)
  | 'OFF_HOURS'            // Khi gửi tin nhắn ngoài khung giờ làm việc
  | 'INACTIVITY_REMINDER'  // Nhắc nhở khi khách không tương tác sau khoảng thời gian
  | 'AUTO_CLOSE'           // Tự động đóng phiên sau khoảng thời gian không phản hồi
  | 'QUEUE_OVERLOAD'       // Khi số lượng khách chờ trong hàng đợi vượt ngưỡng
  | 'SESSION_CLOSED'       // Ngay khi kết thúc phiên chat (Khảo sát CSAT / Lời cảm ơn)
  | 'CUSTOM';              // Điều kiện tùy chỉnh khác

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

export const TRIGGER_TYPE_OPTIONS: { type: AutoMessageTriggerType; label: string; defaultUnit?: 'giây' | 'phút' | 'giờ' | 'khách' }[] = [
  { type: 'IMMEDIATE', label: 'Ngay khi mở phiên chat (Sự kiện tức thì)' },
  { type: 'WAIT_TIMEOUT', label: 'Quá thời gian chờ tiếp nhận (Theo thời gian chờ)', defaultUnit: 'phút' },
  { type: 'OFF_HOURS', label: 'Ngoài giờ làm việc (Theo khung giờ)' },
  { type: 'QUEUE_OVERLOAD', label: 'Hàng đợi quá tải (Hệ thống tự động tính)' },
  { type: 'INACTIVITY_REMINDER', label: 'Khách không tương tác (Theo thời gian chờ)', defaultUnit: 'phút' },
  { type: 'AUTO_CLOSE', label: 'Tự động đóng phiên (Theo thời gian chờ)', defaultUnit: 'phút' },
  { type: 'SESSION_CLOSED', label: 'Khi kết thúc phiên chat (Sự kiện tức thì)' },
  { type: 'CUSTOM', label: 'Điều kiện tùy chỉnh khác' }
];

export const COMMON_AUTO_MESSAGE_VARIABLES: AutoMessageVariable[] = [
  { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Nguyễn Văn An' },
  { code: '{TEN_AGENT}', label: 'Tên tư vấn viên', sampleValue: 'Lê Thanh Trúc' },
  { code: '{TEN_HANG_DOI}', label: 'Tên hàng đợi', sampleValue: 'Hỗ trợ Kỹ thuật & Sự cố' },
  { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' },
  { code: '{THOI_GIAN_CHO}', label: 'Thời gian chờ', sampleValue: '5 phút' },
  { code: '{GIO_LAM_VIEC}', label: 'Khung giờ làm việc', sampleValue: '08:00 - 22:00' }
];

// CHỈ GIỮ LẠI ĐÚNG 3 DATA SAMPLE THEO YÊU CẦU
export const INITIAL_AUTO_MESSAGE_CASES: AutoMessageCaseItem[] = [
  {
    id: 'WELCOME_MSG',
    code: 'AUTO_WELCOME',
    name: 'Lời chào khi bắt đầu chat',
    description: 'Gửi ngay khi khách mở phiên chat',
    category: 'Lời chào',
    enabled: true,
    priority: 1,
    trigger: {
      type: 'IMMEDIATE',
      typeLabel: 'Ngay lập tức',
      summaryText: 'Ngay khi mở phiên chat'
    },
    message: 'Xin chào {TEN_KHACH_HANG}! UniSpace đã nhận được tin nhắn của bạn. Tư vấn viên sẽ phản hồi trong giây lát.',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: [
      { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Nguyễn Văn An' },
      { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' }
    ],
    actionTag: 'Khởi tạo phiên tiếp nhận'
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
      typeLabel: 'Thời gian chờ',
      value: 5,
      unit: 'phút',
      summaryText: 'Sau 5 phút chờ'
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
      typeLabel: 'Ngoài giờ',
      timeFrom: '22:00',
      timeTo: '08:00',
      summaryText: 'Ngoài giờ: 22:00 - 08:00'
    },
    message: 'Kính chào {TEN_KHACH_HANG}, hiện tại đã hết giờ làm việc trực tuyến ({GIO_LAM_VIEC}). Chuyên viên sẽ phản hồi vào đầu ca sáng mai. Hotline: {HOTLINE}.',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat'],
    variables: [
      { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng', sampleValue: 'Phạm Thu Trang' },
      { code: '{GIO_LAM_VIEC}', label: 'Khung giờ làm việc', sampleValue: '08:00 - 22:00' },
      { code: '{HOTLINE}', label: 'Hotline', sampleValue: '1900 6868' }
    ],
    actionTag: 'Tạo phiếu Offline'
  }
];
