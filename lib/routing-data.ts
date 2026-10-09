export interface RoutingConfigItem {
  id: string;
  extNumber: string;
  name?: string;
  
  // Working Schedule (Chung cho quy tắc định tuyến)
  workingSchedule?: string;

  // VIP Routing
  routingVIP: 'Có' | 'Không';
  vipCustomerGroup?: string;
  vipRoutingMethod?: string;
  vipSkillName?: string;
  vipRecentAgent?: boolean;
  vipRecentScope?: string;
  vipRecentHours?: number;
  vipFallbackExt?: string; // Fallback riêng cho luồng VIP

  // Standard Routing
  routingStandard: 'Có' | 'Không';
  stdRoutingMethod?: string;
  stdSkillName?: string;
  stdRecentAgent?: boolean;
  stdRecentScope?: string;
  stdRecentHours?: number;
  stdFallbackExt?: string; // Fallback riêng cho luồng Thường

  // Fallback chung (tương thích)
  fallbackExt: string;

  // Queue Configuration
  queueSize?: number; // cuộc gọi
  queueWaitTime?: number; // giây
  ringTime?: number; // giây
  assignedAgents?: string[];

  // Metadata
  createdAt: string;
  strategy?: 'Round Robin' | 'Skill-based' | 'Least Busy' | 'Longest Idle';
  skillGroup?: string;
  maxWaitTime?: number; // in seconds
  status: 'Hoạt động' | 'Tạm dừng';
  description?: string;
  note?: string;
}

export const INITIAL_ROUTING_CONFIGS: RoutingConfigItem[] = [
  {
    id: 'cfg-1',
    extNumber: '9006 - IVR_WaitRouteAgent-CS',
    name: 'Tổng đài Tiếp nhận & Định tuyến Agent Chăm sóc Khách hàng',
    workingSchedule: 'Giờ hành chính tiêu chuẩn (T2 - T6: 08:00 - 17:30, T7 sáng)',
    routingVIP: 'Có',
    vipCustomerGroup: 'Tất cả khách hàng VIP',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'CSKH VIP Priority',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 1,
    vipFallbackExt: '1500 - VIP_Desk',
    routingStandard: 'Có',
    stdRoutingMethod: 'Kỹ năng',
    stdSkillName: 'Chăm sóc khách hàng Tiếng Việt',
    stdRecentAgent: false,
    stdRecentScope: 'Tất cả',
    stdRecentHours: 1,
    stdFallbackExt: '1100 - ACD-1100',
    fallbackExt: '1100 - ACD-1100',
    queueSize: 10,
    queueWaitTime: 30,
    ringTime: 20,
    assignedAgents: ['101 - Nguyễn Văn An', '102 - Trần Thị Bích', '104 - Phạm Minh Tuấn'],
    createdAt: '28/08/2026 10:41:37',
    strategy: 'Skill-based',
    skillGroup: 'Nhóm Điều hướng IVR Cấp 1',
    maxWaitTime: 30,
    status: 'Hoạt động',
    description: 'Định tuyến cuộc gọi đầu vào phân tách luồng VIP ưu tiên',
    note: 'Kịch bản chính ban ngày từ 08:00 - 18:00'
  },
  {
    id: 'cfg-2',
    extNumber: '9000 - IVR_Intro',
    name: 'Tổng đài Chào & Lựa chọn Phím IVR chính',
    workingSchedule: 'Lịch trực CSKH 24/7 (Toàn thời gian)',
    routingVIP: 'Có',
    vipCustomerGroup: 'Tập VIP Diamond & Platinum',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Kỹ năng Phục vụ Khách hàng VIP',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 2,
    vipFallbackExt: '1500 - VIP_Desk',
    routingStandard: 'Không',
    fallbackExt: '1100 - ACD-1100',
    queueSize: 15,
    queueWaitTime: 25,
    ringTime: 15,
    assignedAgents: ['101 - Nguyễn Văn An', '103 - Lê Hoàng Nam'],
    createdAt: '28/08/2026 10:41:37',
    strategy: 'Skill-based',
    skillGroup: 'Nhóm Điều hướng IVR Cấp 1',
    maxWaitTime: 30,
    status: 'Hoạt động',
    description: 'Định tuyến cuộc gọi đầu vào phân tách luồng VIP ưu tiên',
    note: 'Kịch bản chính ban ngày từ 08:00 - 18:00'
  },
  {
    id: 'cfg-3',
    extNumber: '9001 - IVR_Sales',
    name: 'Định tuyến Tư vấn & Bán hàng Trực tuyến',
    workingSchedule: 'Lịch Bán hàng & Tư vấn Online (08:00 - 22:00 Hàng ngày)',
    routingVIP: 'Có',
    vipCustomerGroup: 'Khách hàng Doanh nghiệp SME',
    vipRoutingMethod: 'Kỹ năng',
    vipSkillName: 'Tư vấn Bán hàng & Chốt hợp đồng',
    vipRecentAgent: true,
    vipRecentScope: 'Cùng nhóm',
    vipRecentHours: 3,
    vipFallbackExt: '1500 - VIP_Desk',
    routingStandard: 'Có',
    stdRoutingMethod: 'Kỹ năng',
    stdSkillName: 'Tư vấn Bán hàng & Chốt hợp đồng',
    stdRecentAgent: true,
    stdRecentScope: 'Tất cả',
    stdRecentHours: 1,
    stdFallbackExt: '1200 - Sales_Queue',
    fallbackExt: '1200 - Sales_Queue',
    queueSize: 20,
    queueWaitTime: 25,
    ringTime: 20,
    assignedAgents: ['105 - Đặng Thu Hà', '106 - Vũ Đức Huy'],
    createdAt: '29/08/2026 09:15:20',
    strategy: 'Round Robin',
    skillGroup: 'Nhóm Kinh doanh Telesales',
    maxWaitTime: 25,
    status: 'Hoạt động',
    description: 'Phân bổ đều cuộc gọi quan tâm dịch vụ mới cho tư vấn viên',
    note: 'Tự động đẩy vào hàng đợi sales nếu không ai bắt máy sau 25s'
  },
  {
    id: 'cfg-4',
    extNumber: '9002 - IVR_Support',
    name: 'Hỗ trợ Kỹ thuật & Khiếu nại Dịch vụ',
    routingVIP: 'Không',
    routingStandard: 'Có',
    stdRoutingMethod: 'Kỹ năng',
    stdSkillName: 'Hỗ trợ Kỹ thuật Cấp 1 (Phần mềm)',
    stdRecentAgent: false,
    fallbackExt: '1300 - Support_Queue',
    queueSize: 12,
    queueWaitTime: 40,
    ringTime: 20,
    assignedAgents: ['102 - Trần Thị Bích', '104 - Phạm Minh Tuấn'],
    createdAt: '01/09/2026 14:22:10',
    strategy: 'Longest Idle',
    skillGroup: 'Nhóm CSKH Tier-1',
    maxWaitTime: 40,
    status: 'Hoạt động',
    description: 'Ưu tiên kết nối agent có thời gian rảnh lâu nhất',
    note: 'Có ghi âm 100% cuộc gọi tự động'
  },
  {
    id: 'cfg-5',
    extNumber: '9003 - VIP_Direct',
    name: 'Line Ưu tiên Khách hàng Kim cương & Đối tác',
    routingVIP: 'Có',
    vipCustomerGroup: 'Tập VIP Diamond & Platinum',
    vipRoutingMethod: 'Trực tiếp',
    vipSkillName: 'Kỹ năng Phục vụ Khách hàng VIP',
    vipRecentAgent: true,
    vipRecentScope: 'Tất cả',
    vipRecentHours: 4,
    routingStandard: 'Không',
    fallbackExt: '1500 - VIP_Desk',
    queueSize: 5,
    queueWaitTime: 15,
    ringTime: 10,
    assignedAgents: ['101 - Nguyễn Văn An', '102 - Trần Thị Bích'],
    createdAt: '05/09/2026 08:30:00',
    strategy: 'Skill-based',
    skillGroup: 'Nhóm Chăm sóc Khách hàng Đặc quyền',
    maxWaitTime: 15,
    status: 'Hoạt động',
    description: 'Thời gian chờ < 15 giây, điều hướng trực tiếp Account Manager',
    note: 'Bỏ qua nhạc chờ thông thường'
  }
];

export const EXTENSION_OPTIONS = [
  '9006 - IVR_WaitRouteAgent-CS',
  '9000 - IVR_Intro',
  '9001 - IVR_Sales',
  '9002 - IVR_Support',
  '9003 - VIP_Direct',
  '9004 - AfterHours_Router',
  '9005 - CSKH_Hotline_247',
  '9007 - Billing_Dept',
  '9008 - English_Support'
];

export const VIP_CUSTOMER_GROUPS = [
  'Tất cả khách hàng VIP',
  'Tập VIP Diamond & Platinum',
  'Khách hàng Doanh nghiệp SME',
  'Khách hàng Thẻ tín dụng Signature',
  'Đối tác Chiến lược Toàn quốc'
];

export const ROUTING_METHODS = [
  'Kỹ năng',
  'Nhóm kỹ năng'
];

export const SKILL_NAMES = [
  'CSKH VIP Priority',
  'Chăm sóc khách hàng Tiếng Việt',
  'Kỹ năng Phục vụ Khách hàng VIP',
  'Hỗ trợ Kỹ thuật Cấp 1 (Phần mềm)',
  'Hỗ trợ Kỹ thuật Cấp 2 (Mạng/Hạ tầng)',
  'Tư vấn Bán hàng & Chốt hợp đồng',
  'Tiếng Anh Giao tiếp Chuyên sâu'
];

export const AGENT_SCOPE_OPTIONS = [
  'Tất cả',
  'Cùng nhóm kỹ năng',
  'Cùng phòng ban phụ trách'
];

export const AVAILABLE_AGENTS = [
  '101 - Nguyễn Văn An',
  '102 - Trần Thị Bích',
  '103 - Lê Hoàng Nam',
  '104 - Phạm Minh Tuấn',
  '105 - Đặng Thu Hà',
  '106 - Vũ Đức Huy',
  '107 - Hoàng Mai Linh',
  '108 - Bùi Quốc Bảo'
];

export const FALLBACK_OPTIONS = [
  '1100 - ACD-1100',
  '1200 - Sales_Queue',
  '1300 - Support_Queue',
  '1400 - Billing_Queue',
  '1500 - VIP_Desk',
  '1600 - Voicemail_Ext',
  '1700 - Security_Officer'
];

export const SKILL_GROUPS = [
  'Nhóm Điều hướng IVR Cấp 1',
  'Nhóm Kinh doanh Telesales',
  'Nhóm CSKH Tier-1',
  'Nhóm CSKH Tier-2 (Kỹ thuật)',
  'Nhóm Chăm sóc Khách hàng Đặc quyền',
  'Trực ca Đêm 24/7',
  'Nhóm Xử lý Khiếu nại Khẩn cấp',
  'Nhóm Quốc tế (Tiếng Anh)'
];

export interface SkillItem {
  id: string;
  code: string;
  name: string;
  category: string;
  levelRange: string;
  agentCount: number;
  status: 'Kích hoạt' | 'Khóa';
  updatedAt: string;
}

export const INITIAL_SKILLS: SkillItem[] = [
  { id: 'sk-1', code: 'SK_CSKH_VN', name: 'Chăm sóc khách hàng Tiếng Việt', category: 'Ngôn ngữ', levelRange: 'Cấp 1 - 5', agentCount: 38, status: 'Kích hoạt', updatedAt: '20/09/2026' },
  { id: 'sk-2', code: 'SK_VIP_CARE', name: 'Kỹ năng Phục vụ Khách hàng VIP', category: 'Nghiệp vụ', levelRange: 'Cấp 3 - 5', agentCount: 12, status: 'Kích hoạt', updatedAt: '18/09/2026' },
  { id: 'sk-3', code: 'SK_TECH_L1', name: 'Hỗ trợ Kỹ thuật Cấp 1 (Phần mềm)', category: 'Kỹ thuật', levelRange: 'Cấp 1 - 4', agentCount: 24, status: 'Kích hoạt', updatedAt: '15/09/2026' },
  { id: 'sk-4', code: 'SK_TECH_L2', name: 'Hỗ trợ Kỹ thuật Cấp 2 (Mạng/Hạ tầng)', category: 'Kỹ thuật', levelRange: 'Cấp 3 - 5', agentCount: 8, status: 'Kích hoạt', updatedAt: '12/09/2026' },
  { id: 'sk-5', code: 'SK_SALES_OUT', name: 'Tư vấn Bán hàng & Chốt hợp đồng', category: 'Kinh doanh', levelRange: 'Cấp 1 - 5', agentCount: 30, status: 'Kích hoạt', updatedAt: '19/09/2026' },
  { id: 'sk-6', code: 'SK_ENG_FLUENT', name: 'Tiếng Anh Giao tiếp Chuyên sâu', category: 'Ngôn ngữ', levelRange: 'Cấp 4 - 5', agentCount: 6, status: 'Kích hoạt', updatedAt: '10/09/2026' },
];

export interface SpecialNumberItem {
  id: string;
  phoneNumber: string;
  customerName: string;
  type: 'VIP' | 'Blacklist' | 'Ưu tiên khẩn cấp';
  routingRule: string;
  note: string;
  addedDate: string;
}

export const INITIAL_SPECIAL_NUMBERS: SpecialNumberItem[] = [
  { id: 'sp-1', phoneNumber: '0909123456', customerName: 'Tập đoàn ABC Holdings', type: 'VIP', routingRule: 'Định tuyến ngay tới 9003 - VIP_Direct', note: 'Khách hàng VIP Hạng Kim Cương', addedDate: '01/08/2026' },
  { id: 'sp-2', phoneNumber: '0988776655', customerName: 'Công ty CP Đầu tư Thiên Long', type: 'VIP', routingRule: 'Định tuyến sang Trưởng phòng CSKH', note: 'Hợp đồng chiến lược 10 năm', addedDate: '12/08/2026' },
  { id: 'sp-3', phoneNumber: '02899990000', customerName: 'Số máy tự động spam / quấy rối', type: 'Blacklist', routingRule: 'Từ chối cuộc gọi / Ngắt máy lập tức', note: 'Gây tắc nghẽn tổng đài liên tục', addedDate: '15/08/2026' },
  { id: 'sp-4', phoneNumber: '0912348899', customerName: 'Tổng công ty Viễn Thông Quốc Gia', type: 'Ưu tiên khẩn cấp', routingRule: 'Định tuyến kênh Tech L2 tức thì', note: 'Đối tác hạ tầng viễn thông', addedDate: '02/09/2026' },
];
