# Kế hoạch triển khai: Nâng cấp Quản lý tập số đặc biệt & Import khách hàng ngoài hệ thống

---

## 1. Mục tiêu & Yêu cầu tổng quan (Product Blueprint)

Dựa trên yêu cầu của người dùng và các lựa chọn đã được thống nhất:
1. **Modal Thêm mới / Chỉnh sửa tập khách hàng VIP**:
   - Thêm trường **Kênh áp dụng** với 2 giá trị độc lập: **Kênh Call** hoặc **Kênh Chat** (mỗi tập chọn một kênh áp dụng cụ thể).
   - Cập nhật cấu trúc dữ liệu `CustomerGroupItem` lưu trữ thông tin `channel: 'Call' | 'Chat'`.
   - Hiển thị thông tin kênh áp dụng đồng bộ trên bảng danh sách tập số đặc biệt.

2. **Modal Thêm khách hàng vào tập**:
   - Tinh gọn bảng dữ liệu khách hàng trong hệ thống: **Chỉ hiển thị đúng 4 thuộc tính**:
     - `Mã KH`
     - `Số điện thoại`
     - `Hạng KH` (kèm tag màu đã cấu hình: Kim cương, Vàng, Bạc, Đồng)
     - `Email`
   - Lược bỏ các cột không cần thiết (`Tên KH`, `Giới tính`, `Ngày sinh`).

3. **Tính năng Import khách hàng ngoài hệ thống**:
   - Bổ sung tab/khu vực **Import ngoài hệ thống** trực tiếp trong modal cấu hình khách hàng của tập.
   - Hỗ trợ cả 2 hình thức: **Tải file Excel/CSV theo mẫu** và **Nhập trực tiếp vào khung văn bản**.
   - Tự động thay đổi dữ liệu import theo **Kênh áp dụng** của tập:
     - **Nếu tập áp dụng Kênh Call**: Import trường **Số điện thoại** (chuẩn hóa đầu số 09x, 08x, 03x, 07x...).
     - **Nếu tập áp dụng Kênh Chat**: Import **UserID** với cột phân loại riêng biệt cho **Zalo** và **Facebook** (`Platform`: Zalo / Facebook, `UserID`: chuỗi định danh).
   - Có bảng xem trước (Preview) danh sách đã import trước khi bấm "Lưu vào tập".

---

## 2. Thiết kế Giao diện & Trải nghiệm Người dùng (UX/UI Guidelines)

- **Phong cách đồng nhất**: Giữ nguyên triết lý giao diện hệ thống hiện tại, không sử dụng hiệu ứng màu mè lạ lẫm, tuân thủ bảng màu chuẩn (`#f25621`, slate-100/200/700).
- **Modal Thêm mới tập khách hàng (`CustomerGroupModal`)**:
  - Bổ sung cụm chọn Kênh áp dụng: dạng Radio hoặc Dropdown tiêu chuẩn:
    - `[ ] Kênh Call`
    - `[ ] Kênh Chat`
- **Modal Thêm khách hàng vào tập (`CustomerGroupMemberModal`)**:
  - **Chuyển đổi 2 Tab linh hoạt**:
    - **Tab 1: Khách hàng trong hệ thống**: Bảng danh sách chọn checkbox chỉ có 4 cột: `Mã KH`, `Số điện thoại`, `Hạng KH`, `Email`. Giữ nguyên bộ lọc tìm kiếm và lọc theo hạng.
    - **Tab 2: Import ngoài hệ thống**:
      - Hiển thị thông báo ngữ cảnh theo kênh của tập:
        - Kênh Call: *"Tập khách hàng áp dụng Kênh Call: Import danh sách Số điện thoại"*
        - Kênh Chat: *"Tập khách hàng áp dụng Kênh Chat: Import danh sách UserID (Zalo / Facebook)"*
      - Nút tải file mẫu `.csv` / `.xlsx` tương ứng.
      - Khu vực kéo thả / chọn file import.
      - Khu vực nhập nhanh dạng danh sách text (paste nhiều dòng).
      - Bảng xem trước danh sách kết quả import hợp lệ kèm cảnh báo nếu trùng hoặc sai định dạng.

---

## 3. Cập nhật Mô hình Dữ liệu & Kiến trúc (Data Model & Architecture)

### 3.1. Cập nhật `lib/customer-group-data.ts`
- Cập nhật interface `CustomerGroupItem`:
  ```typescript
  export interface CustomerGroupItem {
    id: string;
    groupCode: string;
    groupName: string;
    channel: 'Call' | 'Chat'; // Trường mới
    createdAt: string;
    updatedAt?: string;
    customerIds: string[]; // Mã KH trong hệ thống
    externalMembers?: ExternalMemberItem[]; // Danh sách import ngoài hệ thống
    description?: string;
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
  ```

### 3.2. Cập nhật `SpecialNumberView.tsx`
- Bổ sung hiển thị `Kênh áp dụng` trên bảng chính (có tag phân biệt nhẹ nhàng giữa Call và Chat).
- Cập nhật bộ lọc tìm kiếm cho phép lọc theo kênh áp dụng nếu cần.

### 3.3. Tối ưu `CustomerGroupMemberModal.tsx`
- Cắt giảm các cột thừa ở bảng khách hàng nội bộ.
- Thêm giao diện Tab "Chọn từ hệ thống" vs "Import ngoài hệ thống".
- Viết parser xử lý file CSV và chuỗi paste text trực tiếp cho cả Call (Số điện thoại) và Chat (Zalo / Facebook UserID).

---

## 4. Các bước triển khai chi tiết

- **Bước 1**: Cập nhật kiểu dữ liệu `CustomerGroupItem` và `ExternalMemberItem` trong `lib/customer-group-data.ts`.
- **Bước 2**: Cập nhật modal tạo/sửa `CustomerGroupModal.tsx` thêm trường chọn Kênh áp dụng (`Call` / `Chat`).
- **Bước 3**: Cập nhật giao diện bảng chính `SpecialNumberView.tsx` hiển thị thông tin Kênh áp dụng.
- **Bước 4**: Cập nhật `CustomerGroupMemberModal.tsx`:
  - Rút gọn bảng chỉ hiển thị 4 thuộc tính: `Mã KH`, `Số điện thoại`, `Hạng KH`, `Email`.
  - Xây dựng tab Import ngoài hệ thống theo kênh (Call: Số điện thoại; Chat: UserID Zalo/Facebook có cột phân loại).
- **Bước 5**: Kiểm tra linter và biên dịch applet bằng `compile_applet`, đảm bảo không có lỗi TypeScript hay build issues.
