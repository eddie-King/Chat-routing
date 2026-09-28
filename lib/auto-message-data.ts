export interface WaitTimeSlaConfig {
  enabled: boolean;
  standardWaitMinutes: number; // Mặc định: 10 phút
  standardMessage: string;
  vipWaitMinutes: number; // Mặc định: 3 phút
  vipMessage: string;
  channels: string[]; // Các kênh áp dụng
}

export interface QueueOverloadConfig {
  enabled: boolean;
  maxWaitingThreshold: number; // Ngưỡng số lượng khách chờ kích hoạt quá tải (VD: 20 người)
  message: string; // Tin nhắn thông báo khi hàng đợi quá tải
  channels: string[]; // Các kênh áp dụng
}

export interface InactivityCloseConfig {
  enabled: boolean;
  inactivityMinutes: number; // Thời gian không tương tác (VD: 15 phút)
  message: string; // Tin nhắn xác nhận đóng phiên chat
  channels: string[]; // Các kênh áp dụng
}

export interface AutoMessageConfig {
  id: string;
  name: string;
  scope: 'TOAN_HE_THONG' | 'THEO_HANG_DOI';
  queueId?: string;
  queueName?: string;
  updatedAt: string;
  updatedBy: string;
  waitTimeSla: WaitTimeSlaConfig;
  queueOverload: QueueOverloadConfig;
  inactivityClose: InactivityCloseConfig;
}

export const INITIAL_AUTO_MESSAGE_CONFIG: AutoMessageConfig = {
  id: 'auto-msg-default',
  name: 'Cấu hình Tự động gửi tin nhắn SLA Chờ, Quá tải & Đóng phiên (Toàn hệ thống)',
  scope: 'TOAN_HE_THONG',
  updatedAt: '28/09/2026 00:18:00',
  updatedBy: 'Admin Hệ Thống',
  waitTimeSla: {
    enabled: true,
    standardWaitMinutes: 10,
    standardMessage: 'Kính chào {TEN_KHACH_HANG}, hiện tại tất cả tư vấn viên của chúng tôi đều đang bận hỗ trợ khách hàng. Hệ thống đã ghi nhận yêu cầu của bạn và sẽ kết nối ngay khi có tư vấn viên sẵn sàng. Xin vui lòng giữ kết nối trong giây lát. Trân trọng cảm ơn!',
    vipWaitMinutes: 3,
    vipMessage: 'Kính chào Quý khách VIP {TEN_KHACH_HANG}, hệ thống đã ghi nhận yêu cầu của quý khách và đang ưu tiên kết nối với tư vấn viên. Xin quý khách vui lòng giữ kết nối trong giây lát. Trân trọng cảm ơn!',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat', 'ZBS', 'SMS']
  },
  queueOverload: {
    enabled: true,
    maxWaitingThreshold: 20,
    message: 'Kính chào {TEN_KHACH_HANG}, hiện tại hàng đợi {TEN_HANG_DOI} đang trong giờ cao điểm với {SO_LUONG_DANG_CHO} khách hàng đang chờ (dự kiến ~{THOI_GIAN_DU_KIEN} phút). Xin vui lòng kiên nhẫn giữ kết nối để được hỗ trợ. Trân trọng cảm ơn!',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat', 'ZBS', 'SMS']
  },
  inactivityClose: {
    enabled: true,
    inactivityMinutes: 15,
    message: 'Chào {TEN_KHACH_HANG}, đã qua {THOI_GIAN_KHONG_TUONG_TAC} phút kể từ phản hồi gần nhất, hệ thống chưa nhận được tin nhắn mới từ bạn. Hệ thống xin phép được tự động xác nhận đóng phiên hỗ trợ. Cảm ơn bạn đã liên hệ!',
    channels: ['Facebook', 'Zalo OA', 'Website LiveChat', 'ZBS']
  }
};

export const AVAILABLE_VARIABLES_WAIT_SLA = [
  { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng' },
  { code: '{THOI_GIAN_CHO}', label: 'Thời gian đã chờ' },
  { code: '{TEN_HANG_DOI}', label: 'Tên hàng đợi' }
];

export const AVAILABLE_VARIABLES_OVERLOAD = [
  { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng' },
  { code: '{SO_LUONG_DANG_CHO}', label: 'Số lượng khách đang chờ' },
  { code: '{THOI_GIAN_DU_KIEN}', label: 'Thời gian dự kiến chờ' },
  { code: '{TEN_HANG_DOI}', label: 'Tên hàng đợi' },
  { code: '{HOTLINE}', label: 'Số hotline tổng đài' }
];

export const AVAILABLE_VARIABLES_INACTIVITY = [
  { code: '{TEN_KHACH_HANG}', label: 'Tên khách hàng' },
  { code: '{THOI_GIAN_KHONG_TUONG_TAC}', label: 'Thời gian không tương tác' },
  { code: '{TEN_AGENT}', label: 'Tên tư vấn viên phụ trách' }
];
