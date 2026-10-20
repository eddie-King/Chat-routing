export interface CustomerItem {
  id: string;
  customerCode: string; // Mã KH
  fullName: string;     // Tên KH
  phone: string;        // Số điện thoại
  email: string;        // Email
  tier: 'Kim cương' | 'Vàng' | 'Bạc' | 'Đồng'; // Hạng khách hàng (Vàng, Bạc, Kim cương, Đồng)
  gender: 'Nam' | 'Nữ'; // Giới tính
  birthDate: string;    // Ngày sinh (DD/MM/YYYY)
  address?: string;
  notes?: string;
}

export interface ExternalMemberItem {
  id: string;
  type: 'phone' | 'chat_user';
  phone?: string;
  platform?: 'Zalo' | 'Facebook';
  userId?: string;
  note?: string;
  importedAt: string;
}

export interface CustomerGroupItem {
  id: string;
  groupCode: string;    // Mã tập khách hàng VIP (VD: V_20260921105024)
  groupName: string;    // Tên tập khách hàng VIP (VD: Kenk chat, Test group phone)
  channel: 'Call' | 'Chat'; // Kênh áp dụng: Kênh Call hoặc Kênh Chat
  createdAt: string;    // Ngày tạo (VD: 21/09/2026 10:50:24)
  updatedAt?: string;   // Ngày cập nhật (VD: 25/09/2026 11:07:05)
  customerIds: string[]; // Danh sách Mã KH hoặc id của khách hàng thuộc tập này
  externalMembers?: ExternalMemberItem[]; // Danh sách khách hàng ngoài hệ thống import vào
  description?: string;
}

export const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: 'cust-1',
    customerCode: 'KH10001',
    fullName: 'Nguyễn Văn An',
    phone: '0903123456',
    email: 'an.nguyen@vipcrm.vn',
    tier: 'Kim cương',
    gender: 'Nam',
    birthDate: '15/05/1988',
    address: 'Hà Nội'
  },
  {
    id: 'cust-2',
    customerCode: 'KH10002',
    fullName: 'Trần Thị Mai',
    phone: '0988776655',
    email: 'mai.tran@gmail.com',
    tier: 'Vàng',
    gender: 'Nữ',
    birthDate: '22/11/1992',
    address: 'Hồ Chí Minh'
  },
  {
    id: 'cust-3',
    customerCode: 'KH10003',
    fullName: 'Lê Hoàng Long',
    phone: '0912348899',
    email: 'long.le@vinafinance.com',
    tier: 'Vàng',
    gender: 'Nam',
    birthDate: '08/03/1985',
    address: 'Đà Nẵng'
  },
  {
    id: 'cust-4',
    customerCode: 'KH10004',
    fullName: 'Phạm Thu Trang',
    phone: '0934567890',
    email: 'trang.pham@retail.vn',
    tier: 'Bạc',
    gender: 'Nữ',
    birthDate: '14/09/1995',
    address: 'Hà Nội'
  },
  {
    id: 'cust-5',
    customerCode: 'KH10005',
    fullName: 'Vũ Minh Đức',
    phone: '0977654321',
    email: 'duc.vu@techcorp.io',
    tier: 'Kim cương',
    gender: 'Nam',
    birthDate: '30/01/1990',
    address: 'Hải Phòng'
  },
  {
    id: 'cust-6',
    customerCode: 'KH10006',
    fullName: 'Đỗ Hồng Nhung',
    phone: '0966554433',
    email: 'nhung.do@luxurytravel.com',
    tier: 'Bạc',
    gender: 'Nữ',
    birthDate: '19/07/1993',
    address: 'Hồ Chí Minh'
  },
  {
    id: 'cust-7',
    customerCode: 'KH10007',
    fullName: 'Bùi Anh Tuấn',
    phone: '0945112233',
    email: 'tuan.bui@megagroup.vn',
    tier: 'Đồng',
    gender: 'Nam',
    birthDate: '05/12/1987',
    address: 'Cần Thơ'
  },
  {
    id: 'cust-8',
    customerCode: 'KH10008',
    fullName: 'Hoàng Thị Lan',
    phone: '0989223344',
    email: 'lan.hoang@fashionhouse.vn',
    tier: 'Vàng',
    gender: 'Nữ',
    birthDate: '11/04/1996',
    address: 'Hà Nội'
  },
  {
    id: 'cust-9',
    customerCode: 'KH10009',
    fullName: 'Ngô Quang Hải',
    phone: '0918334455',
    email: 'hai.ngo@consulting.com',
    tier: 'Kim cương',
    gender: 'Nam',
    birthDate: '27/08/1989',
    address: 'Hồ Chí Minh'
  },
  {
    id: 'cust-10',
    customerCode: 'KH10010',
    fullName: 'Đặng Mỹ Linh',
    phone: '0908445566',
    email: 'linh.dang@globaledu.vn',
    tier: 'Bạc',
    gender: 'Nữ',
    birthDate: '03/10/1994',
    address: 'Đà Nẵng'
  },
  {
    id: 'cust-11',
    customerCode: 'KH10011',
    fullName: 'Dương Quốc Cường',
    phone: '0938556677',
    email: 'cuong.duong@investvn.com',
    tier: 'Vàng',
    gender: 'Nam',
    birthDate: '16/06/1986',
    address: 'Hà Nội'
  },
  {
    id: 'cust-12',
    customerCode: 'KH10012',
    fullName: 'Lý Kiều Oanh',
    phone: '0979667788',
    email: 'oanh.ly@pharmahealth.vn',
    tier: 'Đồng',
    gender: 'Nữ',
    birthDate: '25/02/1991',
    address: 'Hồ Chí Minh'
  },
  {
    id: 'cust-13',
    customerCode: 'KH10013',
    fullName: 'Trịnh Văn Quyết',
    phone: '0968778899',
    email: 'quyet.trinh@construction.vn',
    tier: 'Kim cương',
    gender: 'Nam',
    birthDate: '12/10/1984',
    address: 'Bình Dương'
  },
  {
    id: 'cust-14',
    customerCode: 'KH10014',
    fullName: 'Đinh Bảo Ngọc',
    phone: '0949889900',
    email: 'ngoc.dinh@designstudio.vn',
    tier: 'Bạc',
    gender: 'Nữ',
    birthDate: '07/09/1997',
    address: 'Hà Nội'
  },
  {
    id: 'cust-15',
    customerCode: 'KH10015',
    fullName: 'Hồ Thanh Tùng',
    phone: '0919990011',
    email: 'tung.ho@autotrade.vn',
    tier: 'Đồng',
    gender: 'Nam',
    birthDate: '20/01/1983',
    address: 'Hồ Chí Minh'
  }
];

export const INITIAL_CUSTOMER_GROUPS: CustomerGroupItem[] = [
  {
    id: 'grp-1',
    groupCode: 'V_20260921105024',
    groupName: 'Kenk chat',
    channel: 'Chat',
    createdAt: '21/09/2026 10:50:24',
    updatedAt: '25/09/2026 11:07:05',
    customerIds: ['KH10001', 'KH10002', 'KH10005', 'KH10008'],
    externalMembers: [
      { id: 'ext-1', type: 'chat_user', platform: 'Zalo', userId: 'zalo_88991203', note: 'Khách hàng VIP Zalo OA', importedAt: '21/09/2026 10:55:00' },
      { id: 'ext-2', type: 'chat_user', platform: 'Facebook', userId: 'fb_1000928374619', note: 'Khách hàng VIP Fanpage', importedAt: '21/09/2026 10:56:00' }
    ],
    description: 'Tập khách hàng ưu tiên tiếp nhận kênh chat'
  },
  {
    id: 'grp-2',
    groupCode: 'V_20260828104034',
    groupName: 'Test group phone',
    channel: 'Call',
    createdAt: '28/08/2026 10:40:34',
    updatedAt: '',
    customerIds: ['KH10003', 'KH10004', 'KH10007'],
    externalMembers: [
      { id: 'ext-3', type: 'phone', phone: '0989123456', note: 'Hotline ưu tiên tổng giám đốc', importedAt: '28/08/2026 10:45:00' },
      { id: 'ext-4', type: 'phone', phone: '0908889999', note: 'Đối tác chiến lược VIP', importedAt: '28/08/2026 10:45:00' }
    ],
    description: 'Nhóm thử nghiệm số điện thoại hotline VIP'
  }
];
