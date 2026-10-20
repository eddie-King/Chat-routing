// lib/customer-segment-data.ts
// Quản lý tệp khách hàng & danh sách tệp khách hàng VIP làm input cho Chat Routing

export interface CustomerSegmentItem {
  id: string;
  code: string;
  name: string;
  description: string;
  isVip: boolean; // Đánh dấu tệp này thuộc danh sách VIP được dùng cho Chat Routing
  customerCount: number;
  criteria: string;
  source: 'CRM' | 'Core Banking' | 'Excel/CSV' | 'Thủ công' | 'Hệ thống tự động';
  status: 'Hoạt động' | 'Tạm dừng';
  updatedAt: string;
}

export interface SampleCustomerRecord {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  tier: string;
  totalSpend: string;
  lastInteraction: string;
}

export const INITIAL_CUSTOMER_SEGMENTS: CustomerSegmentItem[] = [
  {
    id: 'seg-1',
    code: 'TEP_VIP_ALL',
    name: 'Tất cả khách hàng VIP',
    description: 'Toàn bộ khách hàng định danh cấp độ VIP trong toàn hệ thống',
    isVip: true,
    customerCount: 15420,
    criteria: 'Cấp độ phân hạng >= Hạng Vàng hoặc tổng chi tiêu năm > 100tr',
    source: 'CRM',
    status: 'Hoạt động',
    updatedAt: '15/10/2026'
  },
  {
    id: 'seg-2',
    code: 'TEP_VIP_DIAMOND',
    name: 'Khách hàng Diamond & Priority',
    description: 'Khách hàng phân khúc cao cấp Priority Banking & Kim Cương',
    isVip: true,
    customerCount: 2350,
    criteria: 'Số dư tiền gửi > 2 tỷ VND hoặc tài sản đầu tư danh mục Priority',
    source: 'Core Banking',
    status: 'Hoạt động',
    updatedAt: '12/10/2026'
  },
  {
    id: 'seg-3',
    code: 'TEP_VIP_SME',
    name: 'Khách hàng Doanh nghiệp SME VIP',
    description: 'Chủ doanh nghiệp nhỏ và vừa có doanh thu tài khoản cao',
    isVip: true,
    customerCount: 1840,
    criteria: 'Doanh số giao dịch tài khoản DN > 10 tỷ/quý',
    source: 'Core Banking',
    status: 'Hoạt động',
    updatedAt: '10/10/2026'
  },
  {
    id: 'seg-4',
    code: 'TEP_VIP_PLATINUM_CARD',
    name: 'Khách hàng Thẻ tín dụng Bạch Kim',
    description: 'Chủ sở hữu thẻ tín dụng Platinum / Black Signature',
    isVip: true,
    customerCount: 4620,
    criteria: 'Hạn mức thẻ tín dụng >= 200 triệu VND',
    source: 'CRM',
    status: 'Hoạt động',
    updatedAt: '08/10/2026'
  },
  {
    id: 'seg-5',
    code: 'TEP_VIP_PRIVATE_WEALTH',
    name: 'Khách hàng Private Banking Đặc Quyền',
    description: 'Khách hàng quản lý tài sản cá nhân siêu giàu (UHNWI)',
    isVip: true,
    customerCount: 680,
    criteria: 'Tài sản quản lý (AUM) > 10 tỷ VND hoặc có chuyên viên quản lý riêng',
    source: 'CRM',
    status: 'Hoạt động',
    updatedAt: '05/10/2026'
  },
  {
    id: 'seg-6',
    code: 'TEP_MASS_AFFLUENT',
    name: 'Khách hàng Tiềm năng Mass Affluent',
    description: 'Khách hàng có thu nhập ổn định cao chuẩn bị nâng hạng VIP',
    isVip: false,
    customerCount: 28900,
    criteria: 'Thu nhập chuyển khoản lương > 30 triệu/tháng',
    source: 'Hệ thống tự động',
    status: 'Hoạt động',
    updatedAt: '01/10/2026'
  },
  {
    id: 'seg-7',
    code: 'TEP_ECOMMERCE_HIGH_FREQ',
    name: 'Khách hàng Mua sắm Tần suất Cao',
    description: 'Tương tác và giao dịch qua Zalo OA/Facebook Shop > 10 lần/tháng',
    isVip: false,
    customerCount: 9400,
    criteria: 'Số đơn hàng > 10 hoặc giá trị tích lũy > 15 triệu',
    source: 'Excel/CSV',
    status: 'Hoạt động',
    updatedAt: '28/09/2026'
  },
  {
    id: 'seg-8',
    code: 'TEP_CORPORATE_KEY_ACCOUNT',
    name: 'Đối tác Chiến lược Doanh nghiệp Lớn',
    description: 'Tài khoản đại diện các tập đoàn và tổng công ty ký hợp đồng khung',
    isVip: true,
    customerCount: 320,
    criteria: 'Hợp đồng dịch vụ B2B cấp tập đoàn',
    source: 'Thủ công',
    status: 'Hoạt động',
    updatedAt: '20/09/2026'
  }
];

export const SAMPLE_VIP_CUSTOMERS_PREVIEW: Record<string, SampleCustomerRecord[]> = {
  default: [
    { id: 'c-1', customerId: 'CUST-00912', fullName: 'Trần Đình Quang', phone: '0912***888', email: 'quang.td@vinamail.com', tier: 'Diamond VIP', totalSpend: '450.000.000 đ', lastInteraction: 'Zalo OA (Hôm nay 09:30)' },
    { id: 'c-2', customerId: 'CUST-00913', fullName: 'Nguyễn Thị Bích Ngọc', phone: '0988***999', email: 'bichngoc.nt@goldstar.vn', tier: 'Priority Platinum', totalSpend: '820.000.000 đ', lastInteraction: 'Facebook Messenger (Hôm qua)' },
    { id: 'c-3', customerId: 'CUST-00914', fullName: 'Vũ Minh Tuấn (CTY Tân Hưng)', phone: '0903***666', email: 'tuan.vm@tanhungcorp.com', tier: 'SME VIP Star', totalSpend: '2.400.000.000 đ', lastInteraction: 'Livechat Web (2 ngày trước)' },
    { id: 'c-4', customerId: 'CUST-00915', fullName: 'Lê Hoàng Yến', phone: '0977***777', email: 'hoangyen.le@privatelux.com', tier: 'Private Banking', totalSpend: '5.100.000.000 đ', lastInteraction: 'Zalo OA (10/10/2026)' },
    { id: 'c-5', customerId: 'CUST-00916', fullName: 'Đặng Quốc Huy', phone: '0933***555', email: 'huy.dq@vietgroup.vn', tier: 'Black Card VIP', totalSpend: '320.000.000 đ', lastInteraction: 'Zalo OA (08/10/2026)' }
  ]
};

const STORAGE_KEY = 'unispace_customer_segments_data';
const EVENT_NAME = 'unispace_customer_segments_updated';

// Lấy danh sách toàn bộ tệp khách hàng
export function getCustomerSegments(): CustomerSegmentItem[] {
  if (typeof window === 'undefined') return INITIAL_CUSTOMER_SEGMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMER_SEGMENTS));
      return INITIAL_CUSTOMER_SEGMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CUSTOMER_SEGMENTS;
  } catch {
    return INITIAL_CUSTOMER_SEGMENTS;
  }
}

// Lấy danh sách tên các tệp khách hàng VIP (Chỉ các tệp có isVip: true và status: 'Hoạt động')
// Dùng làm nguồn input cho trường "Tập khách hàng VIP" trong modal cấu hình định tuyến Chat (từ Quản lý tập số đặc biệt)
export function getVipCustomerGroups(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('unispace_customer_groups');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: { groupName: string }) => g.groupName);
        }
      }
    } catch {
      // ignore
    }
  }

  return [
    'Kenk chat',
    'Test group phone',
    'Tất cả khách hàng VIP',
    'Khách hàng Diamond & Priority'
  ];
}

// Lưu toàn bộ danh sách tệp
export function saveAllCustomerSegments(list: CustomerSegmentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
  } catch (err) {
    console.error('Error saving customer segments:', err);
  }
}

// Bật / Tắt trạng thái VIP của một tệp (chọn tệp thành phần của list VIP input)
export function toggleCustomerSegmentVip(id: string, isVip: boolean): void {
  const current = getCustomerSegments();
  const updated = current.map(item => item.id === id ? { ...item, isVip, updatedAt: getTodayDateString() } : item);
  saveAllCustomerSegments(updated);
}

// Bật / Tắt VIP hàng loạt
export function bulkSetCustomerSegmentsVip(ids: string[], isVip: boolean): void {
  const current = getCustomerSegments();
  const updated = current.map(item => ids.includes(item.id) ? { ...item, isVip, updatedAt: getTodayDateString() } : item);
  saveAllCustomerSegments(updated);
}

// Thêm mới hoặc chỉnh sửa 1 tệp khách hàng
export function upsertCustomerSegment(segment: Partial<CustomerSegmentItem> & { name: string }): CustomerSegmentItem {
  const current = getCustomerSegments();
  const nowStr = getTodayDateString();

  if (segment.id) {
    const existingIndex = current.findIndex(i => i.id === segment.id);
    if (existingIndex >= 0) {
      const updatedItem: CustomerSegmentItem = {
        ...current[existingIndex],
        ...segment,
        updatedAt: nowStr
      };
      current[existingIndex] = updatedItem;
      saveAllCustomerSegments(current);
      return updatedItem;
    }
  }

  // Create new
  const newItem: CustomerSegmentItem = {
    id: segment.id || `seg-${Date.now()}`,
    code: segment.code || `TEP_${Date.now().toString().slice(-6)}`,
    name: segment.name,
    description: segment.description || '',
    isVip: segment.isVip ?? true,
    customerCount: segment.customerCount || 0,
    criteria: segment.criteria || 'Thiết lập thủ công',
    source: segment.source || 'Thủ công',
    status: segment.status || 'Hoạt động',
    updatedAt: nowStr
  };

  const updated = [newItem, ...current];
  saveAllCustomerSegments(updated);
  return newItem;
}

// Xóa tệp khách hàng
export function deleteCustomerSegment(id: string): void {
  const current = getCustomerSegments();
  const filtered = current.filter(item => item.id !== id);
  saveAllCustomerSegments(filtered);
}

// Reset về dữ liệu mẫu ban đầu
export function resetCustomerSegmentsToDefault(): CustomerSegmentItem[] {
  saveAllCustomerSegments(INITIAL_CUSTOMER_SEGMENTS);
  return INITIAL_CUSTOMER_SEGMENTS;
}

// Lắng nghe sự kiện cập nhật để component phản ứng tức thì
export function subscribeCustomerSegments(callback: (list: CustomerSegmentItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handler = () => {
    callback(getCustomerSegments());
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

function getTodayDateString(): string {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
}
