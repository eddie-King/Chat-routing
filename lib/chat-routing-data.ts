export type ChatRoutingInputType = 'Nguồn' | 'Page' | 'Kênh tiếp nhận';

export interface ChatRoutingInputFilterItem {
  id: string;
  type: ChatRoutingInputType; // Cột 1: Type (Nguồn, Page...)
  values: string[]; // Cột 2: Value (Cho phép chọn nhiều)
  output: string; // Cột 3: Output (Tên bộ lọc / giá trị cung cấp cho trường Input)
  description?: string;
  createdAt: string;
  status: 'Hoạt động' | 'Tạm dừng';
}

export interface ChatRoutingInputRule {
  id: string;
  source: 'Zalo' | 'Facebook' | string;
  values: string[]; // Cho phép chọn nhiều Page / OA / Giá trị
  output: string;   // Đích tiếp nhận / Đầu ra
}

export interface ChatRoutingConfigItem {
  id: string;
  queueName: string; // Tên hàng đợi Chat (VD: Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố)
  queueCode: string; // Mã hàng đợi Chat (VD: QUEUE_TECH_SUPPORT)
  
  // Trường Input: Điều kiện tiếp nhận phiên chat (3 trường: Nguồn, Value - cho phép chọn nhiều, Output)
  inputSource?: 'Zalo' | 'Facebook' | string; // Nguồn tiếp nhận: Zalo, Facebook
  inputValues?: string[]; // Danh sách các Page / OA / Giá trị được chọn (cho phép chọn nhiều)
  inputPage?: string; // Tên Page hoặc OA (tương thích)
  inputPageId?: string; // ID của Page hoặc OA
  inputOutput?: string; // Đích đến / Hàng đợi Output
  inputRules?: ChatRoutingInputRule[];
  branch?: string; // Bỏ trường chi nhánh (giữ optional để tránh lỗi tham chiếu cũ nếu có)

  chatSources: string[]; // Nguồn tiếp nhận chat (Tương thích: Facebook, Zalo,...)
  nluIntents?: string[]; // Tương thích cũ
  intakeChannels?: string[]; // Mặc định tất cả các kênh tiếp nhận
  channel?: string; // Tương thích hiển thị: 'Tất cả kênh'
  name?: string; // Tên hiển thị tương thích

  // Working Schedule & Queue Wait Time (Chung cho cấu hình)
  workingSchedule?: string;
  queueWaitTime?: number; // phút - Thời gian chờ hàng đợi chung (không phân biệt VIP/thường)

  // VIP Routing
  routingVIP: 'Có' | 'Không';
  vipCustomerGroup?: string;
  vipRoutingMethod?: string;
  vipSkillName?: string;
  vipRecentAgent?: boolean;
  vipRecentScope?: string;
  vipRecentHours?: number;
  vipFallbackAction?: string; // Hành động Fallback VIP
  // Cấu hình hàng đợi VIP riêng
  vipQueueSize?: number; // phiên chat
  vipQueueWaitTime?: number; // phút
  vipAgentTimeoutMin?: number; // phút - Thời gian chờ Agent phản hồi
  vipCustomerTimeoutSec?: number; // phút
  vipMaxConcurrentChats?: number; // phiên/agent
  vipAssignedAgents?: string[];

  // Standard Routing
  routingStandard: 'Có' | 'Không';
  stdRoutingMethod?: string;
  stdSkillName?: string;
  stdRecentAgent?: boolean;
  stdRecentScope?: string;
  stdRecentHours?: number;
  stdFallbackAction?: string; // Hành động Fallback Thường
  // Cấu hình hàng đợi Thường riêng
  stdQueueSize?: number; // phiên chat
  stdQueueWaitTime?: number; // phút
  stdAgentTimeoutMin?: number; // phút - Thời gian chờ Agent phản hồi
  stdCustomerTimeoutSec?: number; // phút
  stdMaxConcurrentChats?: number; // phiên/agent
  stdAssignedAgents?: string[];

  // Fallback chung (tương thích)
  fallbackAction: string;

  // Shared / fallback compatibility fields
  queueSize?: number;
  agentTimeoutMin?: number;
  customerTimeoutSec?: number;
  maxConcurrentChats?: number;
  assignedAgents?: string[];

  strategy: 'Skill-based' | 'Capacity-based' | 'Round Robin' | 'Sticky Agent';
  skillGroup: string;
  slaFirstResponseSec: number; // SLA First Response Time in seconds
  autoGreeting: boolean;
  status: 'Hoạt động' | 'Tạm dừng';
  createdAt: string;
  description?: string;
  note?: string;
}

export const CHAT_SOURCES = [
  'Facebook',
  'Zalo',
  'Website LiveChat',
  'Telegram',
  'Viber',
  'Instagram',
  'In-App Mobile SDK',
  'Email'
] as const;

export const CHAT_INPUT_SOURCES = [
  'Zalo',
  'Facebook'
] as const;

export interface ChatPageItem {
  id: string;
  name: string;
}

export const CHAT_PAGES_BY_SOURCE: Record<'Zalo' | 'Facebook', ChatPageItem[]> = {
  Zalo: [
    { id: 'ALL_ZALO', name: 'Tất cả Zalo Official Account' },
    { id: '293847102938475', name: 'UniSpace Official Account VIP' },
    { id: '109283746501928', name: 'Trung tâm CSKH UniSpace Toàn quốc' },
    { id: '839201948572019', name: 'UniSpace Tech Support OA' },
    { id: '647382910482910', name: 'UniSpace Zalo CSKH Miền Nam' }
  ],
  Facebook: [
    { id: 'ALL_FB', name: 'Tất cả Fanpage Facebook' },
    { id: '350408238159135', name: 'UCX Customer Support' },
    { id: '482190341829012', name: 'UniSpace Tư vấn Bán hàng & Dịch vụ' },
    { id: '981240182749102', name: 'UniSpace Fanpage Toàn quốc' },
    { id: '712039485721901', name: 'UniSpace Tech & Dev Support' }
  ]
};

// Dữ liệu mẫu ban đầu cho Cấu hình Input Chat Routing (Type, Value [chọn nhiều], Output)
export const INITIAL_CHAT_INPUT_FILTERS: ChatRoutingInputFilterItem[] = [
  {
    id: 'flt-1',
    type: 'Page',
    values: ['UCX Customer Support', 'UniSpace Fanpage Toàn quốc'],
    output: 'INPUT_FB_TECH_SUPPORT',
    description: 'Điều kiện tiếp nhận phiên chat từ các Fanpage hỗ trợ kỹ thuật và thông tin',
    createdAt: '28/08/2026 09:30:15',
    status: 'Hoạt động'
  },
  {
    id: 'flt-2',
    type: 'Page',
    values: ['UniSpace Official Account VIP'],
    output: 'INPUT_ZALO_VIP_DESK',
    description: 'Điều kiện tiếp nhận từ Zalo OA khách hàng đặc quyền VIP',
    createdAt: '28/08/2026 10:15:20',
    status: 'Hoạt động'
  },
  {
    id: 'flt-3',
    type: 'Page',
    values: ['UniSpace Tư vấn Bán hàng & Dịch vụ'],
    output: 'INPUT_FB_SALES_ADVISORY',
    description: 'Điều kiện tiếp nhận từ Fanpage tư vấn bán hàng và dịch vụ trực tuyến',
    createdAt: '28/08/2026 11:00:45',
    status: 'Hoạt động'
  }
];

export const CHAT_BRANCHES = [
  'Chi nhánh Hà Nội',
  'Chi nhánh TP. Hồ Chí Minh',
  'Chi nhánh Đà Nẵng',
  'Chi nhánh Cần Thơ',
  'Chi nhánh Hải Phòng',
  'Chi nhánh Bình Dương',
  'Chi nhánh Đồng Nai',
  'Chi nhánh Nha Trang'
] as const;

export const OMNICHANNEL_INTAKE_CHANNELS = [
  'Facebook',
  'Zalo',
  'Website LiveChat',
  'Telegram',
  'Viber',
  'In-App Mobile SDK'
] as const;

export const AVAILABLE_NLU_INTENTS = [
  '#bao_loi_ky_thuat',
  '#huong_dan_cai_dat',
  '#su_co_he_thong',
  '#tu_van_goi_cuoc',
  '#bao_gia_san_pham',
  '#khuyen_mai_uu_dai',
  '#khieu_nai_dich_vu',
  '#tra_soat_cuoc_phi',
  '#yeu_cau_hoan_tien',
  '#tra_cuu_tai_khoan',
  '#doi_mat_khau_otp',
  '#yeu_cau_gap_tong_dai_vien'
];

export const CHAT_QUEUE_PRESETS = [
  {
    code: 'QUEUE_TECH_SUPPORT',
    name: 'Hàng đợi Hỗ trợ Kỹ thuật & Sự cố hệ thống',
    defaultIntents: ['#bao_loi_ky_thuat', '#huong_dan_cai_dat', '#su_co_he_thong']
  },
  {
    code: 'QUEUE_SALES_ADVISORY',
    name: 'Hàng đợi Tư vấn Gói cước & Bán hàng',
    defaultIntents: ['#tu_van_goi_cuoc', '#bao_gia_san_pham', '#khuyen_mai_uu_dai']
  },
  {
    code: 'QUEUE_BILLING_DISPUTE',
    name: 'Hàng đợi Tra soát Cước & Khiếu nại dịch vụ',
    defaultIntents: ['#khieu_nai_dich_vu', '#tra_soat_cuoc_phi', '#yeu_cau_hoan_tien']
  },
  {
    code: 'QUEUE_ACCOUNT_SERVICES',
    name: 'Hàng đợi Quản lý Tài khoản & Bảo mật',
    defaultIntents: ['#tra_cuu_tai_khoan', '#doi_mat_khau_otp']
  },
  {
    code: 'QUEUE_VIP_CARE',
    name: 'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
    defaultIntents: ['#yeu_cau_gap_tong_dai_vien']
  }
];

export const CHAT_OUTPUT_OPTIONS = [
  'Hàng đợi mặc định theo cấu hình (Mặc định)',
  'QUEUE_TECH_SUPPORT - Hàng đợi Hỗ trợ Kỹ thuật & Sự cố',
  'QUEUE_SALES_ADVISORY - Hàng đợi Tư vấn Gói cước & Bán hàng',
  'QUEUE_BILLING_DISPUTE - Hàng đợi Tra soát Cước & Khiếu nại',
  'QUEUE_ACCOUNT_SERVICES - Hàng đợi Quản lý Tài khoản & Bảo mật',
  'QUEUE_VIP_CARE - Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
  'BOT_UNIBOT_AI - Trợ lý ảo AI tiếp nhận tự động (Bot Assistant)',
  'DIRECT_AGENT - Phân bổ trực tiếp tới Tư vấn viên (Sticky Agent)',
  'FALLBACK_OFFLINE - Chuyển sang Ticket Offline / Gửi email'
] as const;

export const CHAT_FALLBACK_OPTIONS = [
  'AI Bot Assistant (UniBot AI)',
  'Chuyển Ticket Offline (Form liên hệ)',
  'Hàng đợi tràn (QUEUE_CHAT_OVERFLOW)',
  'Gửi thông báo ngoài giờ làm việc',
  'Chuyển sang Tổng đài viên Call'
];

export const CHAT_VIP_GROUPS = [
  'Tất cả khách hàng VIP',
  'Khách hàng Diamond & Priority',
  'Khách hàng Doanh nghiệp SME VIP',
  'Khách hàng Thẻ tín dụng Bạch Kim'
];

export const CHAT_ROUTING_METHODS = [
  'Kỹ năng',
  'Nhóm kỹ năng'
];

export const CHAT_SKILL_NAMES = [
  'Hỗ trợ Kỹ thuật Web & App',
  'Tư vấn Dịch vụ & Chốt đơn Chat',
  'Chăm sóc Khách hàng Đặc quyền VIP',
  'Hỗ trợ Thanh toán & Hóa đơn',
  'Tiếng Anh Giao tiếp Chuyên sâu'
];

export const CHAT_AGENT_SCOPE_OPTIONS = [
  'Tất cả',
  'Cùng nhóm kỹ năng Chat',
  'Cùng ca trực hiện tại'
];

export const CHAT_AVAILABLE_AGENTS = [
  '201 - Lê Thanh Trúc (Web Lead)',
  '202 - Trần Đình Trọng (Zalo Specialist)',
  '203 - Hoàng Kim Oanh (FB Support)',
  '204 - Đặng Mai Hương (VIP Desk)',
  '205 - Nguyễn Bảo Ngọc (Omni Agent)',
  '206 - Phan Văn Huy (Tech Helpdesk)'
];

export const CHAT_STRATEGY_OPTIONS = [
  'Skill-based',
  'Capacity-based',
  'Round Robin',
  'Sticky Agent'
] as const;

export const CHAT_SKILL_GROUPS = [
  'Hỗ trợ KH - Chat Kỹ thuật',
  'Tư vấn Dịch vụ & Bán hàng Online',
  'Chăm sóc KH Doanh nghiệp VIP',
  'Thanh toán & Hóa đơn điện tử',
  'Hỗ trợ Đa ngôn ngữ (English/Vietnamese)'
];

export const INITIAL_CHAT_ROUTING_CONFIGS: ChatRoutingConfigItem[] = [
  {
    id: 'chat-cfg-1',
    queueName: 'Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố',
    queueCode: 'QUEUE_TECH_SUPPORT',
    name: 'Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố',
    inputSource: 'Facebook',
    inputValues: ['UCX Customer Support', 'UniSpace Fanpage Toàn quốc'],
    inputPage: 'UCX Customer Support',
    inputPageId: '350408238159135',
    inputOutput: 'INPUT_FB_TECH_SUPPORT',
    branch: '',
    chatSources: ['Facebook'],
    nluIntents: ['#bao_loi_ky_thuat', '#huong_dan_cai_dat', '#su_co_he_thong'],
    intakeChannels: ['Facebook'],
    channel: 'Facebook - UCX Customer Support (+1)',
    
    // Lịch làm việc chung
    workingSchedule: 'Giờ hành chính tiêu chuẩn (T2 - T6: 08:00 - 17:30, T7 sáng)',

    // VIP Routing & Queue VIP
    routingVIP: 'Có',
    vipCustomerGroup: 'Tất cả khách hàng VIP',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Hỗ trợ Kỹ thuật Web & App',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 2,
    vipFallbackAction: 'AI Bot Assistant (UniBot AI)',
    vipQueueSize: 15,
    vipQueueWaitTime: 2,
    vipAgentTimeoutMin: 2,
    vipCustomerTimeoutSec: 3,
    vipMaxConcurrentChats: 3,
    vipAssignedAgents: ['204 - Đặng Mai Hương (VIP Desk)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],

    // Standard Routing & Queue Thường
    routingStandard: 'Có',
    stdRoutingMethod: 'Kỹ năng',
    stdSkillName: 'Hỗ trợ Kỹ thuật Web & App',
    stdRecentAgent: false,
    stdRecentScope: 'Tất cả',
    stdRecentHours: 1,
    stdFallbackAction: 'Chuyển Ticket Offline (Form liên hệ)',
    stdQueueSize: 30,
    stdQueueWaitTime: 5,
    stdAgentTimeoutMin: 3,
    stdCustomerTimeoutSec: 5,
    stdMaxConcurrentChats: 4,
    stdAssignedAgents: ['201 - Lê Thanh Trúc (Web Lead)', '206 - Phan Văn Huy (Tech Helpdesk)'],

    fallbackAction: 'AI Bot Assistant (UniBot AI)',
    queueSize: 30,
    queueWaitTime: 5,
    agentTimeoutMin: 3,
    customerTimeoutSec: 5,
    maxConcurrentChats: 4,
    assignedAgents: ['201 - Lê Thanh Trúc (Web Lead)', '205 - Nguyễn Bảo Ngọc (Omni Agent)', '206 - Phan Văn Huy (Tech Helpdesk)'],
    strategy: 'Skill-based',
    skillGroup: 'Hỗ trợ KH - Chat Kỹ thuật',
    slaFirstResponseSec: 30,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '28/08/2026 10:45:12',
    description: 'Tiếp nhận yêu cầu hỗ trợ kỹ thuật từ Facebook chuyển về queue này',
    note: 'Ưu tiên kết nối agent có kỹ năng IT Support Level 2'
  },
  {
    id: 'chat-cfg-2',
    queueName: 'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
    queueCode: 'QUEUE_VIP_CARE',
    name: 'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
    inputSource: 'Zalo',
    inputValues: ['UniSpace Official Account VIP'],
    inputPage: 'UniSpace Official Account VIP',
    inputPageId: '293847102938475',
    inputOutput: 'INPUT_ZALO_VIP_DESK',
    branch: '',
    chatSources: ['Zalo'],
    nluIntents: ['#yeu_cau_gap_tong_dai_vien'],
    intakeChannels: ['Zalo'],
    channel: 'Zalo - UniSpace Official Account VIP',
    
    // Lịch làm việc chung
    workingSchedule: 'Lịch trực CSKH 24/7 (Toàn thời gian)',

    // VIP Routing & Queue VIP
    routingVIP: 'Có',
    vipCustomerGroup: 'Khách hàng Diamond & Priority',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Chăm sóc Khách hàng Đặc quyền VIP',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 24,
    vipFallbackAction: 'Hàng đợi tràn (QUEUE_CHAT_OVERFLOW)',
    vipQueueSize: 10,
    vipQueueWaitTime: 2,
    vipAgentTimeoutMin: 2,
    vipCustomerTimeoutSec: 4,
    vipMaxConcurrentChats: 2,
    vipAssignedAgents: ['202 - Trần Đình Trọng (Zalo Specialist)', '204 - Đặng Mai Hương (VIP Desk)'],

    // Standard Routing
    routingStandard: 'Không',

    fallbackAction: 'Hàng đợi tràn (QUEUE_CHAT_OVERFLOW)',
    queueSize: 10,
    queueWaitTime: 2,
    agentTimeoutMin: 2,
    customerTimeoutSec: 4,
    maxConcurrentChats: 2,
    assignedAgents: ['202 - Trần Đình Trọng (Zalo Specialist)', '204 - Đặng Mai Hương (VIP Desk)'],
    strategy: 'Sticky Agent',
    skillGroup: 'Chăm sóc KH Doanh nghiệp VIP',
    slaFirstResponseSec: 15,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '27/08/2026 14:22:08',
    description: 'Tiếp nhận phiên chat VIP từ Zalo OA chuyển vào hàng đợi đặc quyền',
    note: 'Ưu tiên kết nối lại với chuyên viên đã tương tác trước đó'
  },
  {
    id: 'chat-cfg-3',
    queueName: 'Hàng đợi Tư vấn Gói cước & Bán hàng',
    queueCode: 'QUEUE_SALES_ADVISORY',
    name: 'Hàng đợi Tư vấn Gói cước & Bán hàng',
    inputSource: 'Facebook',
    inputValues: ['UniSpace Tư vấn Bán hàng & Dịch vụ'],
    inputPage: 'UniSpace Tư vấn Bán hàng & Dịch vụ',
    inputPageId: '482190341829012',
    inputOutput: 'INPUT_FB_SALES_ADVISORY',
    branch: '',
    chatSources: ['Facebook'],
    nluIntents: ['#tu_van_goi_cuoc', '#bao_gia_san_pham', '#khuyen_mai_uu_dai'],
    intakeChannels: ['Facebook'],
    channel: 'Facebook - UniSpace Tư vấn Bán hàng & Dịch vụ',
    
    // Lịch làm việc chung
    workingSchedule: 'Lịch Bán hàng & Tư vấn Online (08:00 - 22:00 Hàng ngày)',

    // VIP Routing
    routingVIP: 'Không',

    // Standard Routing & Queue Thường
    routingStandard: 'Có',
    stdRoutingMethod: 'Nhóm kỹ năng',
    stdSkillName: 'Tư vấn Dịch vụ & Bán hàng Online',
    stdRecentAgent: false,
    stdFallbackAction: 'Chuyển Ticket Offline (Form liên hệ)',
    stdQueueSize: 35,
    stdQueueWaitTime: 5,
    stdAgentTimeoutMin: 3,
    stdCustomerTimeoutSec: 5,
    stdMaxConcurrentChats: 5,
    stdAssignedAgents: ['203 - Hoàng Kim Oanh (FB Support)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],

    fallbackAction: 'Chuyển Ticket Offline (Form liên hệ)',
    queueSize: 35,
    queueWaitTime: 5,
    agentTimeoutMin: 3,
    customerTimeoutSec: 5,
    maxConcurrentChats: 5,
    assignedAgents: ['203 - Hoàng Kim Oanh (FB Support)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],
    strategy: 'Capacity-based',
    skillGroup: 'Tư vấn Dịch vụ & Bán hàng Online',
    slaFirstResponseSec: 45,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '26/08/2026 09:15:40',
    description: 'Tiếp nhận yêu cầu tư vấn mua hàng, báo giá từ Facebook Fanpage',
    note: 'Tự động tạo ticket nếu khách nhắn vào khung giờ ngoài ca trực (sau 22:00)'
  }
];
