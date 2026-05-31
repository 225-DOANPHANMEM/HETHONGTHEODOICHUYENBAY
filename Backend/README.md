# Backend — Hệ thống Theo dõi Chuyến bay Đà Nẵng

## Cài đặt và chạy

```bash
# 1. Vào thư mục Backend
cd Backend

# 2. Cài dependencies (chỉ cần làm 1 lần)
npm install

# 3. Khởi động server
npm run dev       # dùng nodemon (tự reload khi sửa code)
# hoặc
npm start         # dùng node thường
```

Server chạy tại: **http://localhost:3001**

---

## Yêu cầu

- Node.js >= 18
- SQL Server đang chạy với instance: `LAPTOP-FILDQM8N\MSSQLSERVER01`
- Database `QL_ChuyenBay_DaNang` đã tồn tại trên SQL Server
- SQL Server Authentication đang bật. Mặc định Express dùng `sa/kin2112005`, hoặc có thể đổi bằng biến môi trường `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

---

## Danh sách API

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập (Admin/Staff) |

### Flights (Chuyến bay)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/flights` | Danh sách chuyến bay (lọc theo `date`, `type`, `status`) |
| GET | `/api/flights/search?q=...` | Tìm kiếm chuyến bay |
| GET | `/api/flights/:soHieu` | Chi tiết theo số hiệu (VD: VN101) |

### Schedules (Lịch trình)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| PUT | `/api/schedules/:maLichTrinh/status` | Cập nhật trạng thái (gọi SP) |
| GET | `/api/schedules/:maLichTrinh/history` | Lịch sử cập nhật |

### Users (Tài khoản)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users` | Danh sách tài khoản |
| POST | `/api/users` | Thêm tài khoản |
| PUT | `/api/users/:maTaiKhoan` | Cập nhật tài khoản |
| PATCH | `/api/users/:maTaiKhoan/status` | Đổi trạng thái tài khoản |

### Dispatch (Điều phối)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/dispatch/gates` | Danh sách cổng |
| GET | `/api/dispatch/belts` | Danh sách băng chuyền |
| GET | `/api/dispatch/gate-assignments` | Phân công cổng hiện tại |
| POST | `/api/dispatch/gate-assignments` | Phân công cổng mới |
| GET | `/api/dispatch/belt-assignments` | Phân công băng chuyền hiện tại |
| POST | `/api/dispatch/belt-assignments` | Phân công băng chuyền mới |

### Notifications (Thông báo)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications?maTaiKhoan=...` | Thông báo của một tài khoản |
| GET | `/api/notifications/history` | Lịch sử thông báo (admin) |

### Follow (Theo dõi chuyến bay)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/follow/:maTaiKhoan` | Danh sách chuyến bay đang theo dõi |
| POST | `/api/follow` | Đăng ký theo dõi |
| DELETE | `/api/follow` | Hủy theo dõi |

### Catalog (Danh mục)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/catalog/airlines` | Danh sách hãng hàng không |
| GET | `/api/catalog/terminals` | Danh sách nhà ga |
| GET | `/api/catalog/flights` | Danh mục chuyến bay |
| POST | `/api/catalog/flights` | Thêm chuyến bay mới |
| POST | `/api/catalog/schedules` | Thêm lịch trình mới |

### Reports (Báo cáo)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/reports/summary?date=...` | Tổng quan thống kê theo ngày |
| GET | `/api/reports/by-airline?date=...` | Thống kê theo hãng bay |
| GET | `/api/reports/update-history?date=...` | Lịch sử cập nhật |

---

## Tài khoản mẫu (từ database)

| Tên đăng nhập | Mật khẩu | Vai trò |
|---------------|----------|---------|
| admin01 | 123456_hash | Quản trị |
| dieuphoi01 | 123456_hash | Điều phối |
| dieuphoi02 | 123456_hash | Điều phối |
