export type SocialChannel = 'Facebook' | 'Zalo OA' | 'ZBS' | 'SMS' | 'Chatbot';

export interface SocialAccountItem {
  id: string;
  channel: SocialChannel;
  pageId: string; // Page ID / OA ID / Account ID / Sender ID
  pageName: string; // Tên Fanpage / Tên OA / Tên Brandname
  appSecret: string; // Khóa bí mật
  appId: string; // Khóa ứng dụng
  token: string; // Token
  service: string; // Dịch vụ định tuyến (VD: Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố)
  branchDepartment: string; // Chi nhánh phòng ban (VD: Chi nhánh Hà Nội - Phòng CSKH)
  connectedDate: string; // Ngày kết nối (VD: 24/09/2026 16:43:52)
  chatbotIntegrated: boolean; // Tích hợp chatbot (true: Có, false: Không)
  status?: 'Hoạt động' | 'Tạm dừng';
}

export const SOCIAL_SERVICES = [
  'Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố',
  'Hàng đợi Tư vấn Gói cước & Bán hàng',
  'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
  'Hàng đợi Tra soát Cước & Khiếu nại dịch vụ',
  'Tất cả dịch vụ (Omnichannel Routing Pool)'
] as const;

export const SOCIAL_BRANCH_DEPARTMENTS = [
  'Toàn quốc / Hội sở chính',
  'Chi nhánh Hà Nội - Phòng CSKH',
  'Chi nhánh Hà Nội - Phòng Kỹ thuật',
  'Chi nhánh TP. Hồ Chí Minh - Phòng CSKH',
  'Chi nhánh TP. Hồ Chí Minh - Phòng Kinh doanh',
  'Chi nhánh Đà Nẵng - Trung tâm hỗ trợ',
  'Chi nhánh Cần Thơ',
  'Chi nhánh Hải Phòng',
  'Chi nhánh Bình Dương'
] as const;

export const INITIAL_SOCIAL_ACCOUNTS: SocialAccountItem[] = [
  // Facebook
  {
    id: 'soc-fb-1',
    channel: 'Facebook',
    pageId: '350408238159135',
    pageName: 'UCX Customer Support',
    appSecret: '7c69c7864dfa87b2257b5bdf54c380eb',
    appId: '493321482970834',
    token: 'EAAHArFvAptIBSqpLt0Fim9lxGpLKKtuSP23SW4hnkKgpDwxwe816Ryo2otvSKp9...',
    service: 'Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố',
    branchDepartment: 'Chi nhánh Hà Nội - Phòng CSKH',
    connectedDate: '24/09/2026 16:43:52',
    chatbotIntegrated: false,
    status: 'Hoạt động'
  },
  {
    id: 'soc-fb-2',
    channel: 'Facebook',
    pageId: '482190341829012',
    pageName: 'UniSpace Tư vấn Bán hàng & Dịch vụ',
    appSecret: '9e8a7123bc45def67890123456789abc',
    appId: '512039485721904',
    token: 'EAAHJkLmNopQRS4TuvWxyz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz...',
    service: 'Hàng đợi Tư vấn Gói cước & Bán hàng',
    branchDepartment: 'Chi nhánh TP. Hồ Chí Minh - Phòng Kinh doanh',
    connectedDate: '20/09/2026 11:15:30',
    chatbotIntegrated: true,
    status: 'Hoạt động'
  },

  // Zalo OA
  {
    id: 'soc-zalo-1',
    channel: 'Zalo OA',
    pageId: '293847102938475',
    pageName: 'UniSpace Official Account VIP',
    appSecret: 'za_sec_89dfa12b3c456789e0123456789',
    appId: '293847102938475',
    token: 'zalo_access_token_88921a8f90b12c34d56e78f90a12b34c56d78e90...',
    service: 'Hàng đợi Chăm sóc Khách hàng Đặc quyền VIP',
    branchDepartment: 'Chi nhánh TP. Hồ Chí Minh - Phòng CSKH',
    connectedDate: '18/09/2026 09:20:15',
    chatbotIntegrated: true,
    status: 'Hoạt động'
  },
  {
    id: 'soc-zalo-2',
    channel: 'Zalo OA',
    pageId: '109283746501928',
    pageName: 'Trung tâm CSKH UniSpace Toàn quốc',
    appSecret: 'za_sec_45bc67de89fa0123456789bcdef',
    appId: '109283746501928',
    token: 'zalo_access_token_3344556677889900aabbccddeeff0011223344...',
    service: 'Tất cả dịch vụ (Omnichannel Routing Pool)',
    branchDepartment: 'Toàn quốc / Hội sở chính',
    connectedDate: '15/09/2026 14:05:00',
    chatbotIntegrated: false,
    status: 'Hoạt động'
  },

  // ZBS (Zalo Business Solution)
  {
    id: 'soc-zbs-1',
    channel: 'ZBS',
    pageId: 'ZBS_APP_VN_ENTERPRISE',
    pageName: 'ZBS Tin nhắn thông báo & CSKH UniSpace',
    appSecret: 'zbs_secret_99887766554433221100aabbccd',
    appId: 'ZBS_APP_VN_ENTERPRISE',
    token: 'zbs_token_live_prod_882910394857201938475620193847...',
    service: 'Hàng đợi Tra soát Cước & Khiếu nại dịch vụ',
    branchDepartment: 'Chi nhánh Đà Nẵng - Trung tâm hỗ trợ',
    connectedDate: '12/09/2026 08:30:22',
    chatbotIntegrated: true,
    status: 'Hoạt động'
  },

  // SMS
  {
    id: 'soc-sms-1',
    channel: 'SMS',
    pageId: 'BRAND_UNISPACE_OTP',
    pageName: 'UNISPACE - Brandname SMS Xác thực & OTP',
    appSecret: 'sms_partner_secret_1122334455667788',
    appId: 'VNPT_VIETTEL_SMS_GW',
    token: 'sms_gw_auth_token_7788990011223344556677889900aabb...',
    service: 'Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố',
    branchDepartment: 'Chi nhánh Hà Nội - Phòng Kỹ thuật',
    connectedDate: '10/09/2026 10:00:00',
    chatbotIntegrated: false,
    status: 'Hoạt động'
  },

  // Chatbot
  {
    id: 'soc-bot-1',
    channel: 'Chatbot',
    pageId: 'UNIBOT_AI_V3',
    pageName: 'UniBot AI - Trợ lý thông minh đa kênh',
    appSecret: 'bot_ai_engine_secret_3344556677889900',
    appId: 'BOT_CORE_ORCHESTRATOR_ID',
    token: 'bot_jwt_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    service: 'Tất cả dịch vụ (Omnichannel Routing Pool)',
    branchDepartment: 'Toàn quốc / Hội sở chính',
    connectedDate: '05/09/2026 15:40:12',
    chatbotIntegrated: true,
    status: 'Hoạt động'
  }
];
