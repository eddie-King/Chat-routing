export interface ChatRoutingConfigItem {
  id: string;
  queueName: string; // Tên hàng đợi Chat (VD: Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố)
  queueCode: string; // Mã hàng đợi Chat (VD: QUEUE_TECH_SUPPORT)
  chatSources: string[]; // Nguồn tiếp nhận chat (Facebook, Zalo,...)
  branch?: string; // Chi nhánh (không bắt buộc, VD: Chi nhánh Hà Nội, Chi nhánh TP. Hồ Chí Minh)
  nluIntents?: string[]; // Tương thích cũ
  intakeChannels?: string[]; // Mặc định tất cả các kênh tiếp nhận
  channel?: string; // Tương thích hiển thị: 'Tất cả kênh'
  name?: string; // Tên hiển thị tương thích

  // VIP Routing
  routingVIP: 'Có' | 'Không';
  vipCustomerGroup?: string;
  vipRoutingMethod?: string;
  vipSkillName?: string;
  vipRecentAgent?: boolean;
  vipRecentScope?: string;
  vipRecentHours?: number;
  // Cấu hình hàng đợi VIP riêng
  vipQueueSize?: number; // phiên chat
  vipQueueWaitTime?: number; // giây
  vipCustomerTimeoutSec?: number; // giây
  vipMaxConcurrentChats?: number; // phiên/agent
  vipAssignedAgents?: string[];

  // Standard Routing
  routingStandard: 'Có' | 'Không';
  stdRoutingMethod?: string;
  stdSkillName?: string;
  stdRecentAgent?: boolean;
  stdRecentScope?: string;
  stdRecentHours?: number;
  // Cấu hình hàng đợi Thường riêng
  stdQueueSize?: number; // phiên chat
  stdQueueWaitTime?: number; // giây
  stdCustomerTimeoutSec?: number; // giây
  stdMaxConcurrentChats?: number; // phiên/agent
  stdAssignedAgents?: string[];

  // Fallback
  fallbackAction: string;

  // Shared / fallback compatibility fields
  queueSize?: number;
  queueWaitTime?: number;
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
  'Hạn mức phiên (Capacity-based)',
  'Vòng tròn (Round Robin)',
  'Tư vấn viên trực tiếp'
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
    chatSources: ['Facebook', 'Zalo', 'Website LiveChat'],
    branch: 'Chi nhánh Hà Nội',
    nluIntents: ['#bao_loi_ky_thuat', '#huong_dan_cai_dat', '#su_co_he_thong'],
    intakeChannels: ['Facebook', 'Zalo', 'Website LiveChat'],
    channel: 'Đa kênh (Facebook, Zalo, Web)',
    
    // VIP Routing & Queue VIP
    routingVIP: 'Có',
    vipCustomerGroup: 'Tất cả khách hàng VIP',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Hỗ trợ Kỹ thuật Web & App',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 2,
    vipQueueSize: 15,
    vipQueueWaitTime: 25,
    vipCustomerTimeoutSec: 180,
    vipMaxConcurrentChats: 3,
    vipAssignedAgents: ['204 - Đặng Mai Hương (VIP Desk)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],

    // Standard Routing & Queue Thường
    routingStandard: 'Có',
    stdRoutingMethod: 'Kỹ năng',
    stdSkillName: 'Hỗ trợ Kỹ thuật Web & App',
    stdRecentAgent: false,
    stdRecentScope: 'Tất cả',
    stdRecentHours: 1,
    stdQueueSize: 30,
    stdQueueWaitTime: 45,
    stdCustomerTimeoutSec: 180,
    stdMaxConcurrentChats: 4,
    stdAssignedAgents: ['201 - Lê Thanh Trúc (Web Lead)', '206 - Phan Văn Huy (Tech Helpdesk)'],

    fallbackAction: 'AI Bot Assistant (UniBot AI)',
    queueSize: 30,
    queueWaitTime: 45,
    customerTimeoutSec: 180,
    maxConcurrentChats: 4,
    assignedAgents: ['201 - Lê Thanh Trúc (Web Lead)', '205 - Nguyễn Bảo Ngọc (Omni Agent)', '206 - Phan Văn Huy (Tech Helpdesk)'],
    strategy: 'Skill-based',
    skillGroup: 'Hỗ trợ KH - Chat Kỹ thuật',
    slaFirstResponseSec: 30,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '28/08/2026 10:45:12',
    description: 'Tiếp nhận yêu cầu hỗ trợ kỹ thuật từ Facebook, Zalo và Website LiveChat chuyển về queue này',
    note: 'Ưu tiên kết nối agent có kỹ năng IT Support Level 2'
  },
  {
    id: 'chat-cfg-2',
    queueName: 'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
    queueCode: 'QUEUE_VIP_CARE',
    name: 'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
    chatSources: ['Zalo', 'Viber', 'Website LiveChat'],
    branch: 'Chi nhánh TP. Hồ Chí Minh',
    nluIntents: ['#yeu_cau_gap_tong_dai_vien'],
    intakeChannels: ['Zalo', 'Viber', 'Website LiveChat'],
    channel: 'Zalo, Viber, Web LiveChat',
    
    // VIP Routing & Queue VIP
    routingVIP: 'Có',
    vipCustomerGroup: 'Khách hàng Diamond & Priority',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Chăm sóc Khách hàng Đặc quyền VIP',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 24,
    vipQueueSize: 10,
    vipQueueWaitTime: 20,
    vipCustomerTimeoutSec: 240,
    vipMaxConcurrentChats: 2,
    vipAssignedAgents: ['202 - Trần Đình Trọng (Zalo Specialist)', '204 - Đặng Mai Hương (VIP Desk)'],

    // Standard Routing
    routingStandard: 'Không',

    fallbackAction: 'Hàng đợi tràn (QUEUE_CHAT_OVERFLOW)',
    queueSize: 10,
    queueWaitTime: 20,
    customerTimeoutSec: 240,
    maxConcurrentChats: 2,
    assignedAgents: ['202 - Trần Đình Trọng (Zalo Specialist)', '204 - Đặng Mai Hương (VIP Desk)'],
    strategy: 'Sticky Agent',
    skillGroup: 'Chăm sóc KH Doanh nghiệp VIP',
    slaFirstResponseSec: 15,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '27/08/2026 14:22:08',
    description: 'Tiếp nhận phiên chat VIP từ Zalo OA và Viber chuyển vào hàng đợi đặc quyền',
    note: 'Ưu tiên kết nối lại với chuyên viên đã tương tác trước đó'
  },
  {
    id: 'chat-cfg-3',
    queueName: 'Hàng đợi Tư vấn Gói cước & Bán hàng',
    queueCode: 'QUEUE_SALES_ADVISORY',
    name: 'Hàng đợi Tư vấn Gói cước & Bán hàng',
    chatSources: ['Facebook', 'Instagram', 'Website LiveChat'],
    branch: '',
    nluIntents: ['#tu_van_goi_cuoc', '#bao_gia_san_pham', '#khuyen_mai_uu_dai'],
    intakeChannels: ['Facebook', 'Instagram', 'Website LiveChat'],
    channel: 'Facebook, Instagram, Web LiveChat',
    
    // VIP Routing
    routingVIP: 'Không',

    // Standard Routing & Queue Thường
    routingStandard: 'Có',
    stdRoutingMethod: 'Hạn mức phiên (Capacity-based)',
    stdSkillName: 'Tư vấn Dịch vụ & Chốt đơn Chat',
    stdRecentAgent: false,
    stdQueueSize: 35,
    stdQueueWaitTime: 60,
    stdCustomerTimeoutSec: 300,
    stdMaxConcurrentChats: 5,
    stdAssignedAgents: ['203 - Hoàng Kim Oanh (FB Support)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],

    fallbackAction: 'Chuyển Ticket Offline (Form liên hệ)',
    queueSize: 35,
    queueWaitTime: 60,
    customerTimeoutSec: 300,
    maxConcurrentChats: 5,
    assignedAgents: ['203 - Hoàng Kim Oanh (FB Support)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],
    strategy: 'Capacity-based',
    skillGroup: 'Tư vấn Dịch vụ & Bán hàng Online',
    slaFirstResponseSec: 45,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '26/08/2026 09:15:40',
    description: 'Tiếp nhận yêu cầu tư vấn mua hàng, báo giá từ Facebook Fanpage, Instagram và Website',
    note: 'Tự động tạo ticket nếu khách nhắn vào khung giờ ngoài ca trực (sau 22:00)'
  },
  {
    id: 'chat-cfg-4',
    queueName: 'Hàng đợi Tra soát Cước & Khiếu nại dịch vụ',
    queueCode: 'QUEUE_BILLING_DISPUTE',
    name: 'Hàng đợi Tra soát Cước & Khiếu nại dịch vụ',
    chatSources: ['Facebook', 'Zalo', 'Telegram'],
    branch: 'Chi nhánh Đà Nẵng',
    nluIntents: ['#khieu_nai_dich_vu', '#tra_soat_cuoc_phi', '#yeu_cau_hoan_tien'],
    intakeChannels: ['Facebook', 'Zalo', 'Telegram'],
    channel: 'Facebook, Zalo, Telegram',
    
    // VIP Routing & Queue VIP
    routingVIP: 'Có',
    vipCustomerGroup: 'Tất cả khách hàng VIP',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Hỗ trợ Thanh toán & Hóa đơn',
    vipRecentAgent: true,
    vipRecentScope: 'Cùng nhóm kỹ năng Chat',
    vipRecentHours: 12,
    vipQueueSize: 10,
    vipQueueWaitTime: 20,
    vipCustomerTimeoutSec: 200,
    vipMaxConcurrentChats: 3,
    vipAssignedAgents: ['204 - Đặng Mai Hương (VIP Desk)'],

    // Standard Routing & Queue Thường
    routingStandard: 'Có',
    stdRoutingMethod: 'Kỹ năng',
    stdSkillName: 'Hỗ trợ Thanh toán & Hóa đơn',
    stdRecentAgent: false,
    stdQueueSize: 25,
    stdQueueWaitTime: 45,
    stdCustomerTimeoutSec: 200,
    stdMaxConcurrentChats: 4,
    stdAssignedAgents: ['206 - Phan Văn Huy (Tech Helpdesk)', '205 - Nguyễn Bảo Ngọc (Omni Agent)'],

    fallbackAction: 'AI Bot Assistant (UniBot AI)',
    queueSize: 25,
    queueWaitTime: 45,
    customerTimeoutSec: 200,
    maxConcurrentChats: 4,
    assignedAgents: ['204 - Đặng Mai Hương (VIP Desk)', '206 - Phan Văn Huy (Tech Helpdesk)'],
    strategy: 'Skill-based',
    skillGroup: 'Thanh toán & Hóa đơn điện tử',
    slaFirstResponseSec: 30,
    autoGreeting: true,
    status: 'Hoạt động',
    createdAt: '25/08/2026 16:30:00',
    description: 'Tiếp nhận phản ánh, tra soát cước, hoàn tiền từ Facebook, Zalo, Telegram đưa vào queue xử lý khẩn cấp',
    note: 'SLA phản hồi lần đầu dưới 30 giây'
  }
];
