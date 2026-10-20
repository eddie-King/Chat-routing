# Kế hoạch điều chỉnh Màn Quản lý tập số đặc biệt & Pop-up Import

Tài liệu kế hoạch chi tiết cho việc tinh chỉnh giao diện và luồng nghiệp vụ Quản lý tập số đặc biệt theo các ảnh chụp thực tế và yêu cầu mới nhất từ người dùng.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Tóm tắt các quyết định đã xác nhận theo yêu cầu người dùng và ảnh đính kèm:**
> 1. **Nút Import trên bảng danh sách chính**: Thay thế icon/hành động Export thành nút Import (icon xanh lá `TrayArrowDown/Download` theo `image_e3e42c9a.png`). Khi click, mở popup Modal Import dữ liệu chuyên dụng theo chuẩn giao diện `image_cd98ca7a.png`.
> 2. **Kênh Call vs Kênh Chat trong Popup Import**:
>    - Kênh Call: Import danh sách Số điện thoại chủ gọi (Caller ID).
>    - Kênh Chat: Import danh sách senderId của khách hàng (kèm phân biệt nền tảng Zalo / Facebook).
> 3. **Modal cấu hình khách hàng trong tập (icon răng cưa)**:
>    - Bỏ dropdown filter Hạng khách hàng và cụm tag lọc hạng (theo `image_b21c70f3.png`).
>    - Bỏ nút "Chọn tất cả trang này" (theo `image_b21c70f3.png`).
>    - Đổi tên tab "Import ngoài hệ thống" thành **"Import thủ công"** (theo `image_71a24a98.png`). Tab này quản lý số điện thoại (với kênh Call) và senderId (với kênh Chat).

---

## 1. Tổng quan & Luồng nghiệp vụ

Hệ thống quản lý tập số đặc biệt (VIP Routing) cho phép phân loại và định tuyến ưu tiên các thuê bao hoặc người dùng chat. Người dùng cần hai cách thức đưa dữ liệu vào tập:
- **Cách 1 - Cấu hình khách hàng trong tập (Nút Răng cưa)**: Chọn khách hàng có sẵn trong hệ thống (chọn từng dòng, tìm kiếm nhanh) hoặc xem/nhập danh sách thủ công (Tab "Import thủ công").
- **Cách 2 - Import hàng loạt theo file (Nút Import trên bảng)**: Mở popup Import file Excel/CSV độc lập, cho phép kiểm tra tính hợp lệ trước khi nạp vào hệ thống, thống kê số lượng thành công/thất bại và xuất file lỗi.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       QUẢN LÝ TẬP SỐ ĐẶC BIỆT                               │
│  [+ Tạo mới]   [Bộ lọc tìm kiếm: Mã, Tên, Ngày, Kênh...]                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bảng danh sách tập:                                                         │
│   - Thao tác: [Sửa] [Cấu hình/Răng cưa] [Import/Khay xanh] [Xóa]            │
│   - Kênh áp dụng: [Kênh Call] hoặc [Kênh Chat]                              │
└──────┬─────────────────────────────────────┬────────────────────────────────┘
       │                                     │
       ▼ (Bấm Răng cưa)                      ▼ (Bấm Import)
┌─────────────────────────────────────┐  ┌────────────────────────────────────┐
│ Modal: CẤU HÌNH KHÁCH HÀNG TRONG TẬP│  │ Modal: IMPORT FILE CHUYÊN DỤNG     │
├─────────────────────────────────────┤  ├────────────────────────────────────┤
│ • Tab 1: Khách hàng trong hệ thống  │  │ • Header cam chuẩn nhận diện       │
│   - Giữ lại: Tìm kiếm từ khóa       │  │ • Hướng dẫn: Sheet 1, ô A1         │
│   - BỎ: Filter Hạng khách hàng      │  │ • Link: [Tải file mẫu]             │
│   - BỎ: Nút "Chọn tất cả trang này" │  │ • Input file: [Choose File]        │
│   - Checkbox từng dòng khách hàng   │  │ • Nút: [Tải lên] [Import dữ liệu]  │
│                                     │  │ • Thống kê: Tổng tải / Hợp lệ / Lỗi│
│ • Tab 2: "Import thủ công"          │  │ • Bảng "DANH SÁCH KHÔNG HỢP LỆ"    │
│   - Kênh Call: Nhập số điện thoại   │  │   - Cột: Số ĐT / senderId | Lỗi    │
│   - Kênh Chat: Nhập senderId        │  │ • Nút: [Xuất file lỗi]             │
└─────────────────────────────────────┘  └────────────────────────────────────┘
```

---

## 2. Chi tiết thiết kế giao diện theo ảnh đính kèm

### 2.1. Nút Thao tác trên Bảng chính (Theo `image_e3e42c9a.png`)
- Thay nút Export cũ bằng nút **Import** màu xanh lá (`text-emerald-600 hover:text-emerald-700`), sử dụng icon tải vào khay (`Download`/`Inbox`/`FolderInput`).
- Tooltip gợi ý:
  - Kênh Call: *"Import danh sách số điện thoại cho tập"*
  - Kênh Chat: *"Import danh sách senderId cho tập"*

### 2.2. Modal Import chuyên dụng (Theo `image_cd98ca7a.png`)
- **Header**: Nền cam nhận diện thương hiệu `#f25621` / `#ea580c`, chữ in đậm màu trắng, icon dấu `✕` đóng modal góc phải.
  - Tiêu đề kênh Call: `Import số chủ gọi cho tập khách hàng VIP`
  - Tiêu đề kênh Chat: `Import senderId cho tập khách hàng VIP` (kèm tên tập khách hàng)
- **Hướng dẫn file**:
  - Dòng text xám nhẹ: `Dữ liệu chỉ được nhập nếu ở sheet đầu tiên và bắt đầu ở ô A1`
  - Link góc phải: `Tải file mẫu` (tải file mẫu `.csv`/`.xlsx` tương ứng: cột Số điện thoại cho Call; cột Nền tảng + senderId cho Chat).
- **Khu vực tải file**:
  - Nhãn `File`
  - Khung chọn file tiêu chuẩn có nút `Choose File` và nhãn hiển thị tên file đã chọn (`No file chosen`).
  - Cụm nút bấm bên dưới:
    - `[📤 Tải lên]` (nền cam đậm `#f25621`, chữ trắng, icon upload).
    - `[📥 Import dữ liệu]` (nền cam san hô `#f38865`, chữ trắng, icon import).
- **Khối "KẾT QUẢ UPLOAD"**:
  - Tiêu đề chữ in hoa màu cam đậm.
  - Hàng thống kê 3 chỉ số rõ ràng:
    `Tổng số tải lên: 0` | `Tổng số hợp lệ: 0` | `Tổng số lỗi: 0`
- **Khối "DANH SÁCH KHÔNG HỢP LỆ"**:
  - Tiêu đề in hoa màu cam đậm.
  - Nút góc phải: `[📄 Xuất file lỗi]` (màu cam đất/san hô `#ea7a52`, có icon tài liệu/excel, dùng để xuất danh sách các dòng bị sai định dạng để người dùng chỉnh sửa).
  - Bảng danh sách lỗi:
    - Kênh Call: Cột `Số điện thoại ⇅` và `Nội dung lỗi ⇅`
    - Kênh Chat: Cột `senderId ⇅` (hoặc `senderId / Kênh ⇅`) và `Nội dung lỗi ⇅`
    - Dòng trạng thái khi rỗng: `Không có dữ liệu trong bảng`.

### 2.3. Modal Cấu hình khách hàng trong tập (Theo `image_b21c70f3.png` & `image_71a24a98.png`)
- **Tab 1: Khách hàng trong hệ thống**:
  - **LOẠI BỎ hoàn toàn**:
    1. Dropdown bộ lọc `Hạng khách hàng: [Tất cả ⌄]`
    2. Cụm nút lọc nhanh theo hạng (Kim cương, Vàng, Bạc, Đồng)
    3. Nút chữ màu cam `Chọn tất cả trang này`
  - **GIỮ LẠI**: Ô tìm kiếm linh hoạt (Mã KH, Tên, SĐT, Email), bảng danh sách với ô checkbox từng dòng, bộ lọc trạng thái chọn (`Tất cả`, `Đã chọn trong tập`, `Chưa chọn`).
- **Tab 2: Đổi tên thành "Import thủ công"**:
  - Thay nhãn tab `Import ngoài hệ thống` thành `Import thủ công`.
  - Phù hợp với kênh:
    - Kênh Call: Cho phép nhập/thêm thủ công từng số điện thoại hoặc import file nhanh danh sách số.
    - Kênh Chat: Cho phép nhập/thêm thủ công từng senderId (Zalo / Facebook) hoặc import file nhanh danh sách senderId.
  - Hiển thị danh sách các số/senderId đã import thủ công với nút xóa từng mục.

---

## 3. Kiến trúc Component & Quản lý State

```
components/call-routing/
├── SpecialNumberView.tsx          // Màn hình chính, bảng quản lý tập số đặc biệt
│   ├── Nút Import trên từng dòng bảng -> mở SpecialNumberImportModal
│   └── Nút Cog (Răng cưa) -> mở CustomerGroupMemberModal
├── SpecialNumberImportModal.tsx   // [MỚI] Modal Import số chủ gọi / senderId chuẩn image_cd98ca7a
└── CustomerGroupMemberModal.tsx   // Modal cấu hình tập:
    ├── Tab 1: Khách hàng trong hệ thống (Đã bỏ filter Hạng KH & nút Chọn tất cả trang này)
    └── Tab 2: "Import thủ công" (Số ĐT cho Call, senderId cho Chat)
```

### Xử lý dữ liệu & Validation
- **Kiểm tra dữ liệu số điện thoại (Call)**: Phải là chuỗi số, độ dài hợp lệ (9-11 số), loại bỏ khoảng trắng và ký tự đặc biệt. Dòng trùng hoặc sai định dạng sẽ được ghi nhận vào `DANH SÁCH KHÔNG HỢP LỆ`.
- **Kiểm tra senderId (Chat)**: Không được để trống, định dạng hợp lệ của Zalo OA ID hoặc Facebook PSID.
- **Lưu dữ liệu**: Khi nhấn `Import dữ liệu`, các bản ghi hợp lệ được gộp vào danh sách thành viên của tập tương ứng, đồng bộ vào `localStorage` và cập nhật ngày giờ `updatedAt`.

---

## 4. Kế hoạch triển khai (Verification & Build)

1. **Tạo component mới `SpecialNumberImportModal.tsx`**:
   - Thiết kế chuẩn 100% theo ảnh `image_cd98ca7a.png`.
   - Đầy đủ state: chọn file, phân tích dữ liệu, đếm số hợp lệ/lỗi, xuất file lỗi, lưu dữ liệu vào tập.
2. **Cập nhật `CustomerGroupMemberModal.tsx`**:
   - Xóa dropdown Hạng khách hàng và các nút pill lọc hạng.
   - Xóa nút "Chọn tất cả trang này".
   - Đổi tên tab 2 thành "Import thủ công".
   - Cập nhật nhãn và trường nhập cho kênh Call (Số điện thoại) và kênh Chat (senderId).
3. **Cập nhật `SpecialNumberView.tsx`**:
   - Thay đổi nút Export thành nút Import (icon xanh lá theo `image_e3e42c9a.png`).
   - Kết nối mở `SpecialNumberImportModal` khi click nút Import.
4. **Kiểm tra Linting & Biên dịch (`lint_applet` & `compile_applet`)**:
   - Đảm bảo 0 lỗi TypeScript và dev server hoạt động mượt mà.
