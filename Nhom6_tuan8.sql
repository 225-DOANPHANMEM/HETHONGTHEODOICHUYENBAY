USE master;
GO

IF DB_ID(N'QL_ChuyenBay_DaNang') IS NOT NULL
BEGIN
    ALTER DATABASE QL_ChuyenBay_DaNang
    SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

    DROP DATABASE QL_ChuyenBay_DaNang;
END
GO

CREATE DATABASE QL_ChuyenBay_DaNang;
GO

USE QL_ChuyenBay_DaNang;
GO

/* =========================================================
   PHẦN 1: TẠO BẢNG
   ========================================================= */

CREATE TABLE dbo.HANGHANGKHONG
(
    MaHangHangKhong VARCHAR(10) NOT NULL,
    MaHang VARCHAR(10) NOT NULL,
    TenHangHangKhong NVARCHAR(100) NOT NULL,
    QuocGia NVARCHAR(50) NOT NULL,

    CONSTRAINT PK_HANGHANGKHONG PRIMARY KEY (MaHangHangKhong),
    CONSTRAINT UQ_HANGHANGKHONG_MaHang UNIQUE (MaHang),
    CONSTRAINT CK_HANGHANGKHONG_MaHang CHECK (LEN(LTRIM(RTRIM(MaHang))) > 0),
    CONSTRAINT CK_HANGHANGKHONG_Ten CHECK (LEN(LTRIM(RTRIM(TenHangHangKhong))) > 0)
);
GO

CREATE TABLE dbo.NHAGA
(
    MaNhaGa VARCHAR(10) NOT NULL,
    TenNhaGa NVARCHAR(50) NOT NULL,
    LoaiNhaGa NVARCHAR(20) NOT NULL,
    MoTa NVARCHAR(200) NULL,

    CONSTRAINT PK_NHAGA PRIMARY KEY (MaNhaGa),
    CONSTRAINT CK_NHAGA_Loai CHECK (LoaiNhaGa IN (N'Nội địa', N'Quốc tế', N'Hỗn hợp')),
    CONSTRAINT CK_NHAGA_Ten CHECK (LEN(LTRIM(RTRIM(TenNhaGa))) > 0)
);
GO

CREATE TABLE dbo.CONG
(
    MaCong VARCHAR(10) NOT NULL,
    MaNhaGa VARCHAR(10) NOT NULL,
    TenCong NVARCHAR(20) NOT NULL,
    TrangThaiCong NVARCHAR(20) NOT NULL CONSTRAINT DF_CONG_TrangThai DEFAULT (N'Sẵn sàng'),

    CONSTRAINT PK_CONG PRIMARY KEY (MaCong),
    CONSTRAINT FK_CONG_NHAGA FOREIGN KEY (MaNhaGa) REFERENCES dbo.NHAGA(MaNhaGa) ON UPDATE CASCADE,
    CONSTRAINT UQ_CONG_TenCong UNIQUE (TenCong),
    CONSTRAINT CK_CONG_TrangThai CHECK (TrangThaiCong IN (N'Sẵn sàng', N'Đang dùng', N'Bảo trì', N'Đóng'))
);
GO

CREATE TABLE dbo.BANGCHUYENHANHLY
(
    MaBangChuyenHanhLy VARCHAR(10) NOT NULL,
    TenBangChuyenHanhLy NVARCHAR(20) NOT NULL,
    TrangThaiBangChuyen NVARCHAR(20) NOT NULL CONSTRAINT DF_BCHL_TrangThai DEFAULT (N'Sẵn sàng'),
    MaNhaGa VARCHAR(10) NOT NULL,

    CONSTRAINT PK_BANGCHUYENHANHLY PRIMARY KEY (MaBangChuyenHanhLy),
    CONSTRAINT FK_BCHL_NHAGA FOREIGN KEY (MaNhaGa) REFERENCES dbo.NHAGA(MaNhaGa) ON UPDATE CASCADE,
    CONSTRAINT UQ_BCHL_Ten UNIQUE (TenBangChuyenHanhLy),
    CONSTRAINT CK_BCHL_TrangThai CHECK (TrangThaiBangChuyen IN (N'Sẵn sàng', N'Đang dùng', N'Bảo trì', N'Đóng'))
);
GO

CREATE TABLE dbo.CHUYENBAY
(
    MaChuyenBay VARCHAR(10) NOT NULL,
    MaHangHangKhong VARCHAR(10) NOT NULL,
    SoHieuChuyenBay VARCHAR(10) NOT NULL,
    LoaiChuyenBay NVARCHAR(10) NOT NULL,
    DiemDen NVARCHAR(50) NOT NULL,
    DiemDi NVARCHAR(50) NOT NULL,

    CONSTRAINT PK_CHUYENBAY PRIMARY KEY (MaChuyenBay),
    CONSTRAINT FK_CHUYENBAY_HANGHANGKHONG FOREIGN KEY (MaHangHangKhong) REFERENCES dbo.HANGHANGKHONG(MaHangHangKhong) ON UPDATE CASCADE,
    CONSTRAINT UQ_CHUYENBAY_SoHieu UNIQUE (SoHieuChuyenBay),
    CONSTRAINT CK_CHUYENBAY_Loai CHECK (LoaiChuyenBay IN (N'Đến', N'Đi')),
    CONSTRAINT CK_CHUYENBAY_Diem CHECK (DiemDen <> DiemDi)
);
GO

CREATE TABLE dbo.LICHTRINH
(
    MaLichTrinh VARCHAR(10) NOT NULL,
    MaChuyenBay VARCHAR(10) NOT NULL,
    NgayBay DATE NOT NULL,
    GioDuKienKhoiHanh DATETIME NOT NULL,
    GioDuKienHaCanh DATETIME NOT NULL,
    GioUocTinhKhoiHanh DATETIME NULL,
    GioUocTinhHaCanh DATETIME NULL,
    GioThucTeKhoiHanh DATETIME NULL,
    GioThucTeHaCanh DATETIME NULL,
    TrangThaiHienTai NVARCHAR(50) NOT NULL CONSTRAINT DF_LICHTRINH_TrangThai DEFAULT (N'Đã lên lịch'),
    SoPhutCham INT NOT NULL CONSTRAINT DF_LICHTRINH_SoPhutCham DEFAULT (0),
    LyDoChamHoacHuy NVARCHAR(200) NULL,

    CONSTRAINT PK_LICHTRINH PRIMARY KEY (MaLichTrinh),
    CONSTRAINT FK_LICHTRINH_CHUYENBAY FOREIGN KEY (MaChuyenBay) REFERENCES dbo.CHUYENBAY(MaChuyenBay) ON UPDATE CASCADE,
    CONSTRAINT CK_LICHTRINH_DuKien CHECK (GioDuKienHaCanh > GioDuKienKhoiHanh),
    CONSTRAINT CK_LICHTRINH_UocTinhKhoiHanh CHECK (GioUocTinhKhoiHanh IS NULL OR GioUocTinhKhoiHanh >= DATEADD(HOUR, -12, GioDuKienKhoiHanh)),
    CONSTRAINT CK_LICHTRINH_UocTinhHaCanh CHECK (GioUocTinhHaCanh IS NULL OR GioUocTinhHaCanh > ISNULL(GioUocTinhKhoiHanh, GioDuKienKhoiHanh)),
    CONSTRAINT CK_LICHTRINH_ThucTeKhoiHanh CHECK (GioThucTeKhoiHanh IS NULL OR GioThucTeKhoiHanh >= DATEADD(HOUR, -12, GioDuKienKhoiHanh)),
    CONSTRAINT CK_LICHTRINH_ThucTeHaCanh CHECK (GioThucTeHaCanh IS NULL OR GioThucTeHaCanh >= GioDuKienKhoiHanh),
    CONSTRAINT CK_LICHTRINH_TrangThai CHECK 
    (
        TrangThaiHienTai IN 
        (
            N'Đã lên lịch',
            N'Đang làm thủ tục',
            N'Đang bay',
            N'Đã hạ cánh',
            N'Hoàn thành',
            N'Chậm chuyến',
            N'Hủy chuyến',
            N'Đã xóa'
        )
    ),
    CONSTRAINT CK_LICHTRINH_SoPhutCham CHECK (SoPhutCham >= 0)
);
GO

CREATE TABLE dbo.TAIKHOAN
(
    MaTaiKhoan VARCHAR(10) NOT NULL,
    TenDangNhap VARCHAR(20) NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    SoDienThoai VARCHAR(15) NULL,
    Email VARCHAR(50) NULL,
    VaiTro NVARCHAR(30) NOT NULL,
    TrangThaiTaiKhoan NVARCHAR(20) NOT NULL CONSTRAINT DF_TAIKHOAN_TrangThai DEFAULT (N'Hoạt động'),
    NgayTao DATETIME NOT NULL CONSTRAINT DF_TAIKHOAN_NgayTao DEFAULT (GETDATE()),

    CONSTRAINT PK_TAIKHOAN PRIMARY KEY (MaTaiKhoan),
    CONSTRAINT UQ_TAIKHOAN_TenDangNhap UNIQUE (TenDangNhap),
    CONSTRAINT UQ_TAIKHOAN_Email UNIQUE (Email),
    CONSTRAINT CK_TAIKHOAN_VaiTro CHECK (VaiTro IN (N'Quản trị', N'Điều phối', N'Khách hàng')),
    CONSTRAINT CK_TAIKHOAN_TrangThai CHECK (TrangThaiTaiKhoan IN (N'Hoạt động', N'Khóa', N'Ngừng sử dụng'))
);
GO

CREATE TABLE dbo.PHANCONGCONG
(
    MaPhanCongCong VARCHAR(10) NOT NULL,
    MaLichTrinh VARCHAR(10) NOT NULL,
    MaCong VARCHAR(10) NOT NULL,
    LoaiCong NVARCHAR(20) NOT NULL,
    ThoiGianBatDauSuDung DATETIME NOT NULL,
    ThoiGianKetThucSuDung DATETIME NOT NULL,
    DangHienHanh BIT NOT NULL CONSTRAINT DF_PCC_DangHienHanh DEFAULT (1),

    CONSTRAINT PK_PHANCONGCONG PRIMARY KEY (MaPhanCongCong),
    CONSTRAINT FK_PCC_LICHTRINH FOREIGN KEY (MaLichTrinh) REFERENCES dbo.LICHTRINH(MaLichTrinh) ON UPDATE CASCADE,
    CONSTRAINT FK_PCC_CONG FOREIGN KEY (MaCong) REFERENCES dbo.CONG(MaCong) ON UPDATE CASCADE,
    CONSTRAINT CK_PCC_LoaiCong CHECK (LoaiCong IN (N'Nội địa', N'Quốc tế', N'Hỗn hợp')),
    CONSTRAINT CK_PCC_ThoiGian CHECK (ThoiGianKetThucSuDung > ThoiGianBatDauSuDung)
);
GO

CREATE TABLE dbo.PHANCONGBANGCHUYEN
(
    MaPhanCongBangChuyen VARCHAR(10) NOT NULL,
    MaLichTrinh VARCHAR(10) NOT NULL,
    MaBangChuyenHanhLy VARCHAR(10) NOT NULL,
    ThoiGianBatDauSuDung DATETIME NOT NULL,
    ThoiGianKetThucSuDung DATETIME NOT NULL,
    DangHienHanh BIT NOT NULL CONSTRAINT DF_PCBC_DangHienHanh DEFAULT (1),

    CONSTRAINT PK_PHANCONGBANGCHUYEN PRIMARY KEY (MaPhanCongBangChuyen),
    CONSTRAINT FK_PCBC_LICHTRINH FOREIGN KEY (MaLichTrinh) REFERENCES dbo.LICHTRINH(MaLichTrinh) ON UPDATE CASCADE,
    CONSTRAINT FK_PCBC_BANGCHUYEN FOREIGN KEY (MaBangChuyenHanhLy) REFERENCES dbo.BANGCHUYENHANHLY(MaBangChuyenHanhLy) ON UPDATE CASCADE,
    CONSTRAINT CK_PCBC_ThoiGian CHECK (ThoiGianKetThucSuDung > ThoiGianBatDauSuDung)
);
GO

CREATE TABLE dbo.THONGBAO
(
    MaThongBao VARCHAR(10) NOT NULL,
    MaLichTrinh VARCHAR(10) NOT NULL,
    MaTaiKhoan VARCHAR(10) NOT NULL,
    MaCong VARCHAR(10) NULL,
    MaBangChuyenHanhLy VARCHAR(10) NULL,
    NoiDungThongBao NVARCHAR(300) NOT NULL,
    TrangThaiMoi NVARCHAR(50) NULL,
    GioUocTinhMoi DATETIME NULL,
    PhuongThucGui NVARCHAR(20) NOT NULL,
    TrangThaiGui NVARCHAR(20) NOT NULL CONSTRAINT DF_THONGBAO_TrangThaiGui DEFAULT (N'Chờ gửi'),
    ThoiGianGui DATETIME NULL,

    CONSTRAINT PK_THONGBAO PRIMARY KEY (MaThongBao),
    CONSTRAINT FK_THONGBAO_LICHTRINH FOREIGN KEY (MaLichTrinh) REFERENCES dbo.LICHTRINH(MaLichTrinh) ON UPDATE CASCADE,
    CONSTRAINT FK_THONGBAO_TAIKHOAN FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TAIKHOAN(MaTaiKhoan) ON UPDATE CASCADE,
    CONSTRAINT FK_THONGBAO_CONG FOREIGN KEY (MaCong) REFERENCES dbo.CONG(MaCong) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT FK_THONGBAO_BANGCHUYEN FOREIGN KEY (MaBangChuyenHanhLy) REFERENCES dbo.BANGCHUYENHANHLY(MaBangChuyenHanhLy) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_THONGBAO_PhuongThuc CHECK (PhuongThucGui IN (N'Email', N'SMS', N'Ứng dụng', N'Hệ thống')),
    CONSTRAINT CK_THONGBAO_TrangThaiGui CHECK (TrangThaiGui IN (N'Chờ gửi', N'Đã gửi', N'Lỗi gửi'))
);
GO

CREATE TABLE dbo.THEODOICHUYENBAY
(
    MaTheoDoi VARCHAR(10) NOT NULL,
    MaTaiKhoan VARCHAR(10) NOT NULL,
    MaLichTrinh VARCHAR(10) NOT NULL,
    ThoiGianDangKy DATETIME NOT NULL CONSTRAINT DF_TDCB_ThoiGianDangKy DEFAULT (GETDATE()),
    TrangThaiTheoDoi NVARCHAR(20) NOT NULL CONSTRAINT DF_TDCB_TrangThai DEFAULT (N'Đang theo dõi'),

    CONSTRAINT PK_THEODOICHUYENBAY PRIMARY KEY (MaTheoDoi),
    CONSTRAINT FK_TDCB_TAIKHOAN FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TAIKHOAN(MaTaiKhoan) ON UPDATE CASCADE,
    CONSTRAINT FK_TDCB_LICHTRINH FOREIGN KEY (MaLichTrinh) REFERENCES dbo.LICHTRINH(MaLichTrinh) ON UPDATE CASCADE,
    CONSTRAINT UQ_TDCB_TaiKhoan_LichTrinh UNIQUE (MaTaiKhoan, MaLichTrinh),
    CONSTRAINT CK_TDCB_TrangThai CHECK (TrangThaiTheoDoi IN (N'Đang theo dõi', N'Ngừng theo dõi'))
);
GO

CREATE TABLE dbo.LICHSUCAPNHAT
(
    MaLichSuCapNhat VARCHAR(10) NOT NULL,
    MaLichTrinh VARCHAR(10) NOT NULL,
    MaTaiKhoan VARCHAR(10) NOT NULL,
    TrangThaiCu NVARCHAR(50) NULL,
    TrangThaiMoi NVARCHAR(50) NULL,
    GioUocTinhCu DATETIME NULL,
    GioUocTinhMoi DATETIME NULL,
    SoPhutChamMoi INT NULL,
    LyDoCapNhat NVARCHAR(200) NULL,
    NoiDungCapNhat NVARCHAR(300) NULL,
    ThoiGianCapNhat DATETIME NOT NULL CONSTRAINT DF_LSCN_ThoiGian DEFAULT (GETDATE()),

    CONSTRAINT PK_LICHSUCAPNHAT PRIMARY KEY (MaLichSuCapNhat),
    CONSTRAINT FK_LSCN_LICHTRINH FOREIGN KEY (MaLichTrinh) REFERENCES dbo.LICHTRINH(MaLichTrinh) ON UPDATE CASCADE,
    CONSTRAINT FK_LSCN_TAIKHOAN FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TAIKHOAN(MaTaiKhoan) ON UPDATE CASCADE,
    CONSTRAINT CK_LSCN_SoPhutChamMoi CHECK (SoPhutChamMoi IS NULL OR SoPhutChamMoi >= 0)
);
GO

CREATE TABLE dbo.LICHSUCHUYENBAYXOA
(
    MaLichSuChuyenBayXoa INT IDENTITY(1,1) NOT NULL,
    MaChuyenBay VARCHAR(10) NOT NULL,
    MaHangHangKhong VARCHAR(10) NOT NULL,
    SoHieuChuyenBay VARCHAR(10) NOT NULL,
    LoaiChuyenBay NVARCHAR(10) NOT NULL,
    DiemDen NVARCHAR(50) NOT NULL,
    DiemDi NVARCHAR(50) NOT NULL,
    ThoiGianXoa DATETIME NOT NULL CONSTRAINT DF_LSCBX_ThoiGianXoa DEFAULT (GETDATE()),
    LyDoXoa NVARCHAR(200) NULL,

    CONSTRAINT PK_LICHSUCHUYENBAYXOA PRIMARY KEY (MaLichSuChuyenBayXoa)
);
GO

/* =========================================================
   PHẦN 2: INSERT DỮ LIỆU MẪU - MỖI BẢNG 8 DÒNG
   ========================================================= */

INSERT INTO dbo.HANGHANGKHONG
(MaHangHangKhong, MaHang, TenHangHangKhong, QuocGia)
VALUES
('HHK01', 'VN', N'Vietnam Airlines', N'Việt Nam'),
('HHK02', 'VJ', N'Vietjet Air', N'Việt Nam'),
('HHK03', 'QH', N'Bamboo Airways', N'Việt Nam'),
('HHK04', 'SQ', N'Singapore Airlines', N'Singapore'),
('HHK05', 'KE', N'Korean Air', N'Hàn Quốc'),
('HHK06', 'JL', N'Japan Airlines', N'Nhật Bản'),
('HHK07', 'CX', N'Cathay Pacific', N'Hồng Kông'),
('HHK08', 'BR', N'EVA Air', N'Đài Loan');
GO

INSERT INTO dbo.NHAGA
(MaNhaGa, TenNhaGa, LoaiNhaGa, MoTa)
VALUES
('NG01', N'Nhà ga T1', N'Nội địa', N'Phục vụ các chuyến bay nội địa'),
('NG02', N'Nhà ga T2', N'Quốc tế', N'Phục vụ các chuyến bay quốc tế'),
('NG03', N'Nhà ga hỗn hợp A', N'Hỗn hợp', N'Khai thác cả nội địa và quốc tế'),
('NG04', N'Nhà ga mở rộng', N'Nội địa', N'Khu vực mở rộng nội địa'),
('NG05', N'Nhà ga dự phòng', N'Hỗn hợp', N'Dùng khi quá tải'),
('NG06', N'Nhà ga VIP', N'Hỗn hợp', N'Phục vụ khách VIP'),
('NG07', N'Nhà ga hàng hóa nội địa', N'Nội địa', N'Khu hàng hóa nội địa'),
('NG08', N'Nhà ga hàng hóa quốc tế', N'Quốc tế', N'Khu hàng hóa quốc tế');
GO

INSERT INTO dbo.CONG
(MaCong, MaNhaGa, TenCong, TrangThaiCong)
VALUES
('G01', 'NG01', N'Cổng 1', N'Sẵn sàng'),
('G02', 'NG01', N'Cổng 2', N'Sẵn sàng'),
('G03', 'NG02', N'Cổng 3', N'Sẵn sàng'),
('G04', 'NG02', N'Cổng 4', N'Sẵn sàng'),
('G05', 'NG03', N'Cổng 5', N'Sẵn sàng'),
('G06', 'NG03', N'Cổng 6', N'Sẵn sàng'),
('G07', 'NG06', N'Cổng VIP', N'Sẵn sàng'),
('G08', 'NG04', N'Cổng 8', N'Bảo trì');
GO

INSERT INTO dbo.BANGCHUYENHANHLY
(MaBangChuyenHanhLy, TenBangChuyenHanhLy, TrangThaiBangChuyen, MaNhaGa)
VALUES
('BC01', N'Băng chuyền 1', N'Sẵn sàng', 'NG01'),
('BC02', N'Băng chuyền 2', N'Sẵn sàng', 'NG01'),
('BC03', N'Băng chuyền 3', N'Sẵn sàng', 'NG02'),
('BC04', N'Băng chuyền 4', N'Sẵn sàng', 'NG02'),
('BC05', N'Băng chuyền 5', N'Sẵn sàng', 'NG03'),
('BC06', N'Băng chuyền 6', N'Sẵn sàng', 'NG03'),
('BC07', N'Băng chuyền VIP', N'Sẵn sàng', 'NG06'),
('BC08', N'Băng chuyền 8', N'Bảo trì', 'NG04');
GO

INSERT INTO dbo.TAIKHOAN
(MaTaiKhoan, TenDangNhap, MatKhau, SoDienThoai, Email, VaiTro, TrangThaiTaiKhoan)
VALUES
('TK01', 'admin01', '123456_hash', '0901000001', 'admin01@airport.vn', N'Quản trị', N'Hoạt động'),
('TK02', 'dieuphoi01', '123456_hash', '0901000002', 'dieuphoi01@airport.vn', N'Điều phối', N'Hoạt động'),
('TK03', 'dieuphoi02', '123456_hash', '0901000003', 'dieuphoi02@airport.vn', N'Điều phối', N'Hoạt động'),
('TK04', 'khachhang01', '123456_hash', '0901000004', 'khachhang01@airport.vn', N'Khách hàng', N'Hoạt động'),
('TK05', 'khachhang02', '123456_hash', '0901000005', 'khachhang02@airport.vn', N'Khách hàng', N'Hoạt động'),
('TK06', 'khachhang03', '123456_hash', '0901000006', 'khachhang03@airport.vn', N'Khách hàng', N'Hoạt động'),
('TK07', 'admin02', '123456_hash', '0901000007', 'admin02@airport.vn', N'Quản trị', N'Hoạt động'),
('TK08', 'khachhang04', '123456_hash', '0901000008', 'khachhang04@airport.vn', N'Khách hàng', N'Khóa');
GO

INSERT INTO dbo.CHUYENBAY
(MaChuyenBay, MaHangHangKhong, SoHieuChuyenBay, LoaiChuyenBay, DiemDen, DiemDi)
VALUES
('CB001', 'HHK01', 'VN101', N'Đi', N'Hà Nội', N'Đà Nẵng'),
('CB002', 'HHK02', 'VJ203', N'Đến', N'Đà Nẵng', N'TP.HCM'),
('CB003', 'HHK03', 'QH305', N'Đi', N'Singapore', N'Đà Nẵng'),
('CB004', 'HHK04', 'SQ171', N'Đến', N'Đà Nẵng', N'Singapore'),
('CB005', 'HHK05', 'KE462', N'Đi', N'Seoul', N'Đà Nẵng'),
('CB006', 'HHK06', 'JL752', N'Đến', N'Đà Nẵng', N'Tokyo'),
('CB007', 'HHK07', 'CX521', N'Đi', N'Hồng Kông', N'Đà Nẵng'),
('CB008', 'HHK08', 'BR383', N'Đến', N'Đà Nẵng', N'Đài Bắc');
GO

INSERT INTO dbo.LICHTRINH
(MaLichTrinh, MaChuyenBay, NgayBay, GioDuKienKhoiHanh, GioDuKienHaCanh, GioUocTinhKhoiHanh, GioUocTinhHaCanh, TrangThaiHienTai)
VALUES
('LT001', 'CB001', '2026-05-29', '2026-05-29T06:00:00', '2026-05-29T07:20:00', '2026-05-29T06:00:00', '2026-05-29T07:20:00', N'Đã lên lịch'),
('LT002', 'CB002', '2026-05-29', '2026-05-29T08:00:00', '2026-05-29T09:15:00', '2026-05-29T08:00:00', '2026-05-29T09:15:00', N'Đã lên lịch'),
('LT003', 'CB003', '2026-05-29', '2026-05-29T10:30:00', '2026-05-29T13:15:00', '2026-05-29T10:30:00', '2026-05-29T13:15:00', N'Đã lên lịch'),
('LT004', 'CB004', '2026-05-29', '2026-05-29T14:00:00', '2026-05-29T16:40:00', '2026-05-29T14:00:00', '2026-05-29T16:40:00', N'Đã lên lịch'),
('LT005', 'CB005', '2026-05-30', '2026-05-30T18:00:00', '2026-05-30T22:30:00', '2026-05-30T18:00:00', '2026-05-30T22:30:00', N'Đã lên lịch'),
('LT006', 'CB006', '2026-05-30', '2026-05-30T00:05:00', '2026-05-30T06:30:00', '2026-05-30T00:05:00', '2026-05-30T06:30:00', N'Đã lên lịch'),
('LT007', 'CB007', '2026-05-30', '2026-05-30T09:30:00', '2026-05-30T11:45:00', '2026-05-30T09:30:00', '2026-05-30T11:45:00', N'Đã lên lịch'),
('LT008', 'CB008', '2026-05-30', '2026-05-30T12:00:00', '2026-05-30T14:50:00', '2026-05-30T12:00:00', '2026-05-30T14:50:00', N'Đã lên lịch');
GO

INSERT INTO dbo.PHANCONGCONG
(MaPhanCongCong, MaLichTrinh, MaCong, LoaiCong, ThoiGianBatDauSuDung, ThoiGianKetThucSuDung, DangHienHanh)
VALUES
('PCC01', 'LT001', 'G01', N'Nội địa', '2026-05-29T05:30:00', '2026-05-29T07:30:00', 1),
('PCC02', 'LT002', 'G02', N'Nội địa', '2026-05-29T07:30:00', '2026-05-29T09:30:00', 1),
('PCC03', 'LT003', 'G03', N'Quốc tế', '2026-05-29T10:00:00', '2026-05-29T13:30:00', 1),
('PCC04', 'LT004', 'G04', N'Quốc tế', '2026-05-29T13:30:00', '2026-05-29T17:00:00', 1),
('PCC05', 'LT005', 'G05', N'Hỗn hợp', '2026-05-30T17:30:00', '2026-05-30T22:45:00', 1),
('PCC06', 'LT006', 'G06', N'Quốc tế', '2026-05-29T23:30:00', '2026-05-30T07:00:00', 1),
('PCC07', 'LT007', 'G07', N'Hỗn hợp', '2026-05-30T08:30:00', '2026-05-30T12:15:00', 1),
('PCC08', 'LT008', 'G01', N'Quốc tế', '2026-05-30T11:00:00', '2026-05-30T15:15:00', 1);
GO

INSERT INTO dbo.PHANCONGBANGCHUYEN
(MaPhanCongBangChuyen, MaLichTrinh, MaBangChuyenHanhLy, ThoiGianBatDauSuDung, ThoiGianKetThucSuDung, DangHienHanh)
VALUES
('PCBC01', 'LT001', 'BC01', '2026-05-29T07:00:00', '2026-05-29T07:50:00', 1),
('PCBC02', 'LT002', 'BC02', '2026-05-29T09:00:00', '2026-05-29T09:45:00', 1),
('PCBC03', 'LT003', 'BC03', '2026-05-29T12:45:00', '2026-05-29T13:45:00', 1),
('PCBC04', 'LT004', 'BC04', '2026-05-29T16:20:00', '2026-05-29T17:10:00', 1),
('PCBC05', 'LT005', 'BC05', '2026-05-30T22:10:00', '2026-05-30T23:00:00', 1),
('PCBC06', 'LT006', 'BC06', '2026-05-30T06:00:00', '2026-05-30T07:15:00', 1),
('PCBC07', 'LT007', 'BC07', '2026-05-30T09:00:00', '2026-05-30T10:00:00', 1),
('PCBC08', 'LT008', 'BC01', '2026-05-30T14:30:00', '2026-05-30T15:30:00', 1);
GO

INSERT INTO dbo.THEODOICHUYENBAY
(MaTheoDoi, MaTaiKhoan, MaLichTrinh, TrangThaiTheoDoi)
VALUES
('TD01', 'TK04', 'LT001', N'Đang theo dõi'),
('TD02', 'TK05', 'LT002', N'Đang theo dõi'),
('TD03', 'TK06', 'LT003', N'Đang theo dõi'),
('TD04', 'TK04', 'LT004', N'Đang theo dõi'),
('TD05', 'TK05', 'LT005', N'Đang theo dõi'),
('TD06', 'TK06', 'LT006', N'Đang theo dõi'),
('TD07', 'TK02', 'LT007', N'Đang theo dõi'),
('TD08', 'TK03', 'LT008', N'Đang theo dõi');
GO

INSERT INTO dbo.THONGBAO
(MaThongBao, MaLichTrinh, MaTaiKhoan, MaCong, MaBangChuyenHanhLy, NoiDungThongBao, TrangThaiMoi, GioUocTinhMoi, PhuongThucGui, TrangThaiGui, ThoiGianGui)
VALUES
('TB01', 'LT001', 'TK04', 'G01', 'BC01', N'Thông báo lịch bay VN101', N'Đã lên lịch', '2026-05-29T06:00:00', N'Hệ thống', N'Đã gửi', GETDATE()),
('TB02', 'LT002', 'TK05', 'G02', 'BC02', N'Thông báo lịch bay VJ203', N'Đã lên lịch', '2026-05-29T08:00:00', N'Email', N'Đã gửi', GETDATE()),
('TB03', 'LT003', 'TK06', 'G03', 'BC03', N'Thông báo lịch bay QH305', N'Đã lên lịch', '2026-05-29T10:30:00', N'SMS', N'Đã gửi', GETDATE()),
('TB04', 'LT004', 'TK04', 'G04', 'BC04', N'Thông báo lịch bay SQ171', N'Đã lên lịch', '2026-05-29T14:00:00', N'Ứng dụng', N'Đã gửi', GETDATE()),
('TB05', 'LT005', 'TK05', 'G05', 'BC05', N'Thông báo lịch bay KE462', N'Đã lên lịch', '2026-05-30T18:00:00', N'Hệ thống', N'Đã gửi', GETDATE()),
('TB06', 'LT006', 'TK06', 'G06', 'BC06', N'Thông báo lịch bay JL752', N'Đã lên lịch', '2026-05-30T00:05:00', N'Ứng dụng', N'Đã gửi', GETDATE()),
('TB07', 'LT007', 'TK02', 'G07', 'BC07', N'Thông báo lịch bay CX521', N'Đã lên lịch', '2026-05-30T09:30:00', N'Email', N'Đã gửi', GETDATE()),
('TB08', 'LT008', 'TK03', 'G01', 'BC01', N'Thông báo lịch bay BR383', N'Đã lên lịch', '2026-05-30T12:00:00', N'SMS', N'Đã gửi', GETDATE());
GO

INSERT INTO dbo.LICHSUCAPNHAT
(MaLichSuCapNhat, MaLichTrinh, MaTaiKhoan, TrangThaiCu, TrangThaiMoi, GioUocTinhCu, GioUocTinhMoi, SoPhutChamMoi, LyDoCapNhat, NoiDungCapNhat)
VALUES
('LS01', 'LT001', 'TK01', N'Đã lên lịch', N'Đã lên lịch', '2026-05-29T06:00:00', '2026-05-29T06:00:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS02', 'LT002', 'TK02', N'Đã lên lịch', N'Đã lên lịch', '2026-05-29T08:00:00', '2026-05-29T08:00:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS03', 'LT003', 'TK03', N'Đã lên lịch', N'Đã lên lịch', '2026-05-29T10:30:00', '2026-05-29T10:30:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS04', 'LT004', 'TK01', N'Đã lên lịch', N'Đã lên lịch', '2026-05-29T14:00:00', '2026-05-29T14:00:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS05', 'LT005', 'TK02', N'Đã lên lịch', N'Đã lên lịch', '2026-05-30T18:00:00', '2026-05-30T18:00:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS06', 'LT006', 'TK03', N'Đã lên lịch', N'Đã lên lịch', '2026-05-30T00:05:00', '2026-05-30T00:05:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS07', 'LT007', 'TK01', N'Đã lên lịch', N'Đã lên lịch', '2026-05-30T09:30:00', '2026-05-30T09:30:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu'),
('LS08', 'LT008', 'TK02', N'Đã lên lịch', N'Đã lên lịch', '2026-05-30T12:00:00', '2026-05-30T12:00:00', 0, N'Khởi tạo', N'Tạo lịch trình ban đầu');
GO

INSERT INTO dbo.LICHSUCHUYENBAYXOA
(MaChuyenBay, MaHangHangKhong, SoHieuChuyenBay, LoaiChuyenBay, DiemDen, DiemDi, LyDoXoa)
VALUES
('CB901', 'HHK01', 'VN901', N'Đi', N'Hải Phòng', N'Đà Nẵng', N'Hủy do bảo trì tàu bay'),
('CB902', 'HHK02', 'VJ902', N'Đến', N'Đà Nẵng', N'Cần Thơ', N'Thay đổi kế hoạch khai thác'),
('CB903', 'HHK03', 'QH903', N'Đi', N'Bangkok', N'Đà Nẵng', N'Tối ưu lịch bay quốc tế'),
('CB904', 'HHK04', 'SQ904', N'Đến', N'Đà Nẵng', N'Singapore', N'Trùng lịch khai thác'),
('CB905', 'HHK05', 'KE905', N'Đi', N'Busan', N'Đà Nẵng', N'Thay đổi đường bay'),
('CB906', 'HHK06', 'JL906', N'Đến', N'Đà Nẵng', N'Tokyo', N'Lý do kỹ thuật'),
('CB907', 'HHK07', 'CX907', N'Đi', N'Hồng Kông', N'Đà Nẵng', N'Tối ưu tần suất bay'),
('CB908', 'HHK08', 'BR908', N'Đến', N'Đà Nẵng', N'Đài Bắc', N'Thay đổi kế hoạch hãng bay');
GO

/* =========================================================
   PHẦN 3: FUNCTION
   ========================================================= */

CREATE OR ALTER FUNCTION dbo.fn_TinhSoPhutChamDuKien
(
    @GioDuKien DATETIME,
    @GioUocTinh DATETIME
)
RETURNS INT
AS
BEGIN
    DECLARE @SoPhutCham INT = 0;

    IF @GioDuKien IS NOT NULL AND @GioUocTinh IS NOT NULL
    BEGIN
        SET @SoPhutCham = DATEDIFF(MINUTE, @GioDuKien, @GioUocTinh);
    END;

    IF @SoPhutCham < 0
        SET @SoPhutCham = 0;

    RETURN @SoPhutCham;
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_XacDinhTrangThaiChuyenBay
(
    @GioDuKienKhoiHanh DATETIME,
    @GioDuKienHaCanh DATETIME,
    @GioUocTinhKhoiHanh DATETIME,
    @GioUocTinhHaCanh DATETIME,
    @GioThucTeKhoiHanh DATETIME,
    @GioThucTeHaCanh DATETIME,
    @TrangThaiHienTai NVARCHAR(50),
    @ThoiDiemKiemTra DATETIME
)
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @TrangThai NVARCHAR(50);
    DECLARE @SoPhutCham INT;

    IF @TrangThaiHienTai IN (N'Hủy chuyến', N'Đã xóa', N'Đã hạ cánh', N'Hoàn thành')
        RETURN @TrangThaiHienTai;

    SET @SoPhutCham = dbo.fn_TinhSoPhutChamDuKien
    (
        @GioDuKienKhoiHanh,
        ISNULL(@GioUocTinhKhoiHanh, @GioDuKienKhoiHanh)
    );

    IF @GioThucTeHaCanh IS NOT NULL
        SET @TrangThai = N'Hoàn thành';
    ELSE IF @GioThucTeKhoiHanh IS NOT NULL
        SET @TrangThai = N'Đang bay';
    ELSE IF @SoPhutCham > 0
        SET @TrangThai = N'Chậm chuyến';
    ELSE IF @ThoiDiemKiemTra >= DATEADD(HOUR, -2, @GioDuKienKhoiHanh)
         AND @ThoiDiemKiemTra < @GioDuKienKhoiHanh
        SET @TrangThai = N'Đang làm thủ tục';
    ELSE
        SET @TrangThai = N'Đã lên lịch';

    RETURN @TrangThai;
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_KiemTraCongSanSang
(
    @MaCong VARCHAR(10),
    @ThoiGianBatDau DATETIME,
    @ThoiGianKetThuc DATETIME,
    @MaPhanCongBoQua VARCHAR(10) = NULL
)
RETURNS BIT
AS
BEGIN
    DECLARE @KetQua BIT = 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.CONG
        WHERE MaCong = @MaCong
          AND TrangThaiCong = N'Sẵn sàng'
    )
    BEGIN
        RETURN 0;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.PHANCONGCONG
        WHERE MaCong = @MaCong
          AND DangHienHanh = 1
          AND (@MaPhanCongBoQua IS NULL OR MaPhanCongCong <> @MaPhanCongBoQua)
          AND @ThoiGianBatDau < ThoiGianKetThucSuDung
          AND @ThoiGianKetThuc > ThoiGianBatDauSuDung
    )
    BEGIN
        SET @KetQua = 0;
    END;

    RETURN @KetQua;
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_KiemTraBangChuyenSanSang
(
    @MaBangChuyenHanhLy VARCHAR(10),
    @ThoiGianBatDau DATETIME,
    @ThoiGianKetThuc DATETIME,
    @MaPhanCongBoQua VARCHAR(10) = NULL
)
RETURNS BIT
AS
BEGIN
    DECLARE @KetQua BIT = 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.BANGCHUYENHANHLY
        WHERE MaBangChuyenHanhLy = @MaBangChuyenHanhLy
          AND TrangThaiBangChuyen = N'Sẵn sàng'
    )
    BEGIN
        RETURN 0;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.PHANCONGBANGCHUYEN
        WHERE MaBangChuyenHanhLy = @MaBangChuyenHanhLy
          AND DangHienHanh = 1
          AND (@MaPhanCongBoQua IS NULL OR MaPhanCongBangChuyen <> @MaPhanCongBoQua)
          AND @ThoiGianBatDau < ThoiGianKetThucSuDung
          AND @ThoiGianKetThuc > ThoiGianBatDauSuDung
    )
    BEGIN
        SET @KetQua = 0;
    END;

    RETURN @KetQua;
END;
GO

/* =========================================================
   PHẦN 4: STORED PROCEDURE
   ========================================================= */

IF OBJECT_ID(N'dbo.sp_CapNhatTinhHinhChuyenBay', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CapNhatTinhHinhChuyenBay;
GO

CREATE PROCEDURE dbo.sp_CapNhatTinhHinhChuyenBay
    @MaLichTrinh VARCHAR(10),
    @MaTaiKhoan VARCHAR(10),
    @TrangThaiMoi NVARCHAR(50) = NULL,
    @GioUocTinhKhoiHanh DATETIME = NULL,
    @GioUocTinhHaCanh DATETIME = NULL,
    @GioThucTeKhoiHanh DATETIME = NULL,
    @GioThucTeHaCanh DATETIME = NULL,
    @LyDoChamHoacHuy NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra lịch trình tồn tại
    IF NOT EXISTS (SELECT 1 FROM dbo.LICHTRINH WHERE MaLichTrinh = @MaLichTrinh)
    BEGIN
        THROW 50001, N'Lịch trình chuyến bay không tồn tại.', 1;
    END;

    -- 2. Kiểm tra tài khoản hợp lệ
    IF NOT EXISTS (SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan = @MaTaiKhoan AND TrangThaiTaiKhoan = N'Hoạt động')
    BEGIN
        THROW 50002, N'Tài khoản cập nhật không tồn tại hoặc không hoạt động.', 1;
    END;

    -- 3. Kiểm tra trạng thái hợp lệ
    IF @TrangThaiMoi IS NOT NULL AND @TrangThaiMoi NOT IN (
        N'Đã lên lịch', N'Đang làm thủ tục', N'Đang bay', N'Đã hạ cánh', N'Hoàn thành', N'Chậm chuyến', N'Hủy chuyến', N'Đã xóa'
    )
    BEGIN
        THROW 50003, N'Trạng thái chuyến bay không hợp lệ.', 1;
    END;

    -- Thiết lập Session Context để Trigger nhận diện người cập nhật
    EXEC sys.sp_set_session_context @key = N'MaTaiKhoan', @value = @MaTaiKhoan;

    -- 4. Thực hiện cập nhật bảng LICHTRINH (ĐÃ XÓA CHỮ GO SAI VỊ TRÍ)
    UPDATE dbo.LICHTRINH
    SET
        TrangThaiHienTai = ISNULL(@TrangThaiMoi, TrangThaiHienTai),
        GioUocTinhKhoiHanh = ISNULL(@GioUocTinhKhoiHanh, GioUocTinhKhoiHanh),
        GioUocTinhHaCanh = ISNULL(@GioUocTinhHaCanh, GioUocTinhHaCanh),
        GioThucTeKhoiHanh = ISNULL(@GioThucTeKhoiHanh, GioThucTeKhoiHanh),
        GioThucTeHaCanh = ISNULL(@GioThucTeHaCanh, GioThucTeHaCanh),
        LyDoChamHoacHuy = ISNULL(@LyDoChamHoacHuy, LyDoChamHoacHuy)
    WHERE MaLichTrinh = @MaLichTrinh;

    -- 5. LOGIC MỚI BỔ SUNG: Tự động giải phóng cổng và băng chuyền nếu chuyến bay kết thúc/bị hủy (ĐÃ XÓA CHỮ GO SAI VỊ TRÍ)
    IF @TrangThaiMoi IN (N'Hoàn thành', N'Hủy chuyến', N'Đã xóa')
    BEGIN
        -- Giải phóng cổng
        UPDATE dbo.PHANCONGCONG
        SET DangHienHanh = 0
        WHERE MaLichTrinh = @MaLichTrinh AND DangHienHanh = 1;

        -- Giải phóng băng chuyền hành lý
        UPDATE dbo.PHANCONGBANGCHUYEN
        SET DangHienHanh = 0
        WHERE MaLichTrinh = @MaLichTrinh AND DangHienHanh = 1;
    END;
END;
GO 
CREATE OR ALTER PROCEDURE dbo.sp_PhanCongCongChoChuyenBay
    @MaLichTrinh VARCHAR(10),
    @MaCong VARCHAR(10),
    @LoaiCong NVARCHAR(20),
    @ThoiGianBatDauSuDung DATETIME,
    @ThoiGianKetThucSuDung DATETIME,
    @MaPhanCongCong VARCHAR(10) = NULL -- Tham số này có thể truyền vào khi muốn cập nhật lịch cũ
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LICHTRINH WHERE MaLichTrinh = @MaLichTrinh)
    BEGIN
        THROW 50004, N'Lịch trình chuyến bay không tồn tại.', 1;
    END;

    IF @LoaiCong NOT IN (N'Nội địa', N'Quốc tế', N'Hỗn hợp')
    BEGIN
        THROW 50005, N'Loại cổng không hợp lệ.', 1;
    END;

    IF @ThoiGianKetThucSuDung <= @ThoiGianBatDauSuDung
    BEGIN
        THROW 50006, N'Thời gian kết thúc sử dụng cổng phải lớn hơn thời gian bắt đầu.', 1;
    END;

    -- CHỖ SỬA: Thay vì truyền NULL cố định, bạn truyền biến @MaPhanCongCong vào hàm kiểm tra
    IF dbo.fn_KiemTraCongSanSang(@MaCong, @ThoiGianBatDauSuDung, @ThoiGianKetThucSuDung, @MaPhanCongCong) = 0
    BEGIN
        THROW 50007, N'Cổng không sẵn sàng hoặc bị trùng lịch phân công.', 1;
    END;

    -- Tự động sinh mã nếu là thêm mới (INSERT)
    IF @MaPhanCongCong IS NULL
    BEGIN
        SELECT @MaPhanCongCong = 'PCC' + RIGHT('0000000' + CAST(ISNULL(MAX(TRY_CAST(SUBSTRING(MaPhanCongCong, 4, 10) AS INT)), 0) + 1 AS VARCHAR(7)), 7)
        FROM dbo.PHANCONGCONG;
        
        INSERT INTO dbo.PHANCONGCONG (MaPhanCongCong, MaLichTrinh, MaCong, LoaiCong, ThoiGianBatDauSuDung, ThoiGianKetThucSuDung, DangHienHanh)
        VALUES (@MaPhanCongCong, @MaLichTrinh, @MaCong, @LoaiCong, @ThoiGianBatDauSuDung, @ThoiGianKetThucSuDung, 1);
    END;
    ELSE -- Khối bổ sung: Hỗ trợ UPDATE nếu mã đã tồn tại
    BEGIN
        UPDATE dbo.PHANCONGCONG
        SET MaCong = @MaCong,
            LoaiCong = @LoaiCong,
            ThoiGianBatDauSuDung = @ThoiGianBatDauSuDung,
            ThoiGianKetThucSuDung = @ThoiGianKetThucSuDung
        WHERE MaPhanCongCong = @MaPhanCongCong;
    END;

    SELECT * FROM dbo.PHANCONGCONG WHERE MaPhanCongCong = @MaPhanCongCong;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_PhanCongBangChuyenChoChuyenBay
    @MaLichTrinh VARCHAR(10),
    @MaBangChuyenHanhLy VARCHAR(10),
    @ThoiGianBatDauSuDung DATETIME,
    @ThoiGianKetThucSuDung DATETIME,
    @MaPhanCongBangChuyen VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LICHTRINH WHERE MaLichTrinh = @MaLichTrinh)
    BEGIN
        THROW 50008, N'Lịch trình chuyến bay không tồn tại.', 1;
    END;

    IF @ThoiGianKetThucSuDung <= @ThoiGianBatDauSuDung
    BEGIN
        THROW 50009, N'Thời gian kết thúc sử dụng băng chuyền phải lớn hơn thời gian bắt đầu.', 1;
    END;

    -- CHỖ SỬA: Thay vì truyền NULL cố định, bạn truyền biến @MaPhanCongBangChuyen vào hàm kiểm tra
    IF dbo.fn_KiemTraBangChuyenSanSang(@MaBangChuyenHanhLy, @ThoiGianBatDauSuDung, @ThoiGianKetThucSuDung, @MaPhanCongBangChuyen) = 0
    BEGIN
        THROW 50010, N'Băng chuyền không sẵn sàng hoặc bị trùng lịch phân công.', 1;
    END;

    -- Tự động sinh mã nếu là thêm mới (INSERT)
    IF @MaPhanCongBangChuyen IS NULL
    BEGIN
        SELECT @MaPhanCongBangChuyen = 'PCBC' + RIGHT('000000' + CAST(ISNULL(MAX(TRY_CAST(SUBSTRING(MaPhanCongBangChuyen, 5, 10) AS INT)), 0) + 1 AS VARCHAR(6)), 6)
        FROM dbo.PHANCONGBANGCHUYEN;

        INSERT INTO dbo.PHANCONGBANGCHUYEN (MaPhanCongBangChuyen, MaLichTrinh, MaBangChuyenHanhLy, ThoiGianBatDauSuDung, ThoiGianKetThucSuDung, DangHienHanh)
        VALUES (@MaPhanCongBangChuyen, @MaLichTrinh, @MaBangChuyenHanhLy, @ThoiGianBatDauSuDung, @ThoiGianKetThucSuDung, 1);
    END;
    ELSE -- Khối bổ sung: Hỗ trợ UPDATE nếu mã đã tồn tại
    BEGIN
        UPDATE dbo.PHANCONGBANGCHUYEN
        SET MaBangChuyenHanhLy = @MaBangChuyenHanhLy,
            ThoiGianBatDauSuDung = @ThoiGianBatDauSuDung,
            ThoiGianKetThucSuDung = @ThoiGianKetThucSuDung
        WHERE MaPhanCongBangChuyen = @MaPhanCongBangChuyen;
    END;

    SELECT * FROM dbo.PHANCONGBANGCHUYEN WHERE MaPhanCongBangChuyen = @MaPhanCongBangChuyen;
END;
GO

/* =========================================================
   PHẦN 5: TRIGGER
   ========================================================= */

CREATE OR ALTER TRIGGER dbo.trg_LichTrinh_XuLyCapNhat
ON dbo.LICHTRINH
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF TRIGGER_NESTLEVEL() > 1
        RETURN;

    DECLARE @MaTaiKhoan VARCHAR(10);

    SELECT @MaTaiKhoan = CONVERT(VARCHAR(10), SESSION_CONTEXT(N'MaTaiKhoan'));

    IF @MaTaiKhoan IS NULL
       OR NOT EXISTS
       (
            SELECT 1
            FROM dbo.TAIKHOAN
            WHERE MaTaiKhoan = @MaTaiKhoan
       )
    BEGIN
        SET @MaTaiKhoan = 'TK01';
    END;

    ;WITH DuLieuTinh AS
    (
        SELECT
            i.MaLichTrinh,
            dbo.fn_TinhSoPhutChamDuKien
            (
                i.GioDuKienKhoiHanh,
                ISNULL(i.GioUocTinhKhoiHanh, i.GioDuKienKhoiHanh)
            ) AS SoPhutChamTinh,
            dbo.fn_XacDinhTrangThaiChuyenBay
            (
                i.GioDuKienKhoiHanh,
                i.GioDuKienHaCanh,
                i.GioUocTinhKhoiHanh,
                i.GioUocTinhHaCanh,
                i.GioThucTeKhoiHanh,
                i.GioThucTeHaCanh,
                i.TrangThaiHienTai,
                GETDATE()
            ) AS TrangThaiTinh
        FROM inserted i
    )
    UPDATE lt
    SET
        lt.SoPhutCham = d.SoPhutChamTinh,
        lt.TrangThaiHienTai = d.TrangThaiTinh
    FROM dbo.LICHTRINH lt
    INNER JOIN DuLieuTinh d
        ON lt.MaLichTrinh = d.MaLichTrinh
    WHERE lt.SoPhutCham <> d.SoPhutChamTinh
       OR lt.TrangThaiHienTai <> d.TrangThaiTinh;

    DECLARE @MaxLS INT;

    SELECT @MaxLS = ISNULL(MAX(TRY_CAST(SUBSTRING(MaLichSuCapNhat, 3, 10) AS INT)), 0)
    FROM dbo.LICHSUCAPNHAT;

    ;WITH ThayDoi AS
    (
        SELECT
            i.MaLichTrinh,
            d.TrangThaiHienTai AS TrangThaiCu,
            i.TrangThaiHienTai AS TrangThaiMoi,
            d.GioUocTinhKhoiHanh AS GioUocTinhCu,
            i.GioUocTinhKhoiHanh AS GioUocTinhMoi,
            dbo.fn_TinhSoPhutChamDuKien
            (
                i.GioDuKienKhoiHanh,
                ISNULL(i.GioUocTinhKhoiHanh, i.GioDuKienKhoiHanh)
            ) AS SoPhutChamMoi,
            i.LyDoChamHoacHuy,
            ROW_NUMBER() OVER (ORDER BY i.MaLichTrinh) AS STT
        FROM inserted i
        INNER JOIN deleted d
            ON i.MaLichTrinh = d.MaLichTrinh
        WHERE ISNULL(i.TrangThaiHienTai, N'') <> ISNULL(d.TrangThaiHienTai, N'')
           OR ISNULL(i.GioUocTinhKhoiHanh, '19000101') <> ISNULL(d.GioUocTinhKhoiHanh, '19000101')
           OR ISNULL(i.GioUocTinhHaCanh, '19000101') <> ISNULL(d.GioUocTinhHaCanh, '19000101')
           OR ISNULL(i.GioThucTeKhoiHanh, '19000101') <> ISNULL(d.GioThucTeKhoiHanh, '19000101')
           OR ISNULL(i.GioThucTeHaCanh, '19000101') <> ISNULL(d.GioThucTeHaCanh, '19000101')
           OR ISNULL(i.LyDoChamHoacHuy, N'') <> ISNULL(d.LyDoChamHoacHuy, N'')
    )
    INSERT INTO dbo.LICHSUCAPNHAT
    (
        MaLichSuCapNhat,
        MaLichTrinh,
        MaTaiKhoan,
        TrangThaiCu,
        TrangThaiMoi,
        GioUocTinhCu,
        GioUocTinhMoi,
        SoPhutChamMoi,
        LyDoCapNhat,
        NoiDungCapNhat
    )
    SELECT
        'LS' + RIGHT('00000000' + CAST(@MaxLS + STT AS VARCHAR(8)), 8),
        MaLichTrinh,
        @MaTaiKhoan,
        TrangThaiCu,
        TrangThaiMoi,
        GioUocTinhCu,
        GioUocTinhMoi,
        SoPhutChamMoi,
        LyDoChamHoacHuy,
        N'Cập nhật tình hình chuyến bay'
    FROM ThayDoi;

    DECLARE @MaxTB INT;

    SELECT @MaxTB = ISNULL(MAX(TRY_CAST(SUBSTRING(MaThongBao, 3, 10) AS INT)), 0)
    FROM dbo.THONGBAO;

    ;WITH ThongBaoCanTao AS
    (
        SELECT
            i.MaLichTrinh,
            td.MaTaiKhoan,
            cb.SoHieuChuyenBay,
            i.TrangThaiHienTai AS TrangThaiMoi,
            i.GioUocTinhKhoiHanh,
            ROW_NUMBER() OVER (ORDER BY i.MaLichTrinh, td.MaTaiKhoan) AS STT
        FROM inserted i
        INNER JOIN dbo.LICHTRINH lt
            ON i.MaLichTrinh = lt.MaLichTrinh
        INNER JOIN dbo.CHUYENBAY cb
            ON lt.MaChuyenBay = cb.MaChuyenBay
        INNER JOIN dbo.THEODOICHUYENBAY td
            ON i.MaLichTrinh = td.MaLichTrinh
        WHERE td.TrangThaiTheoDoi = N'Đang theo dõi'
    )
    INSERT INTO dbo.THONGBAO
    (
        MaThongBao,
        MaLichTrinh,
        MaTaiKhoan,
        MaCong,
        MaBangChuyenHanhLy,
        NoiDungThongBao,
        TrangThaiMoi,
        GioUocTinhMoi,
        PhuongThucGui,
        TrangThaiGui,
        ThoiGianGui
    )
    SELECT
        'TB' + RIGHT('00000000' + CAST(@MaxTB + tb.STT AS VARCHAR(8)), 8),
        tb.MaLichTrinh,
        tb.MaTaiKhoan,
        pcc.MaCong,
        pcbc.MaBangChuyenHanhLy,
        N'Chuyến bay ' + tb.SoHieuChuyenBay + N' đã thay đổi tình hình.',
        tb.TrangThaiMoi,
        tb.GioUocTinhKhoiHanh,
        N'Hệ thống',
        N'Chờ gửi',
        NULL
    FROM ThongBaoCanTao tb
    OUTER APPLY
    (
        SELECT TOP 1 MaCong
        FROM dbo.PHANCONGCONG
        WHERE MaLichTrinh = tb.MaLichTrinh
          AND DangHienHanh = 1
        ORDER BY ThoiGianBatDauSuDung DESC
    ) pcc
    OUTER APPLY
    (
        SELECT TOP 1 MaBangChuyenHanhLy
        FROM dbo.PHANCONGBANGCHUYEN
        WHERE MaLichTrinh = tb.MaLichTrinh
          AND DangHienHanh = 1
        ORDER BY ThoiGianBatDauSuDung DESC
    ) pcbc;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_PhanCongCong_KiemTraXungDot
ON dbo.PHANCONGCONG
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.PHANCONGCONG pcc
            ON i.MaCong = pcc.MaCong
           AND i.MaPhanCongCong <> pcc.MaPhanCongCong
           AND i.DangHienHanh = 1
           AND pcc.DangHienHanh = 1
           AND i.ThoiGianBatDauSuDung < pcc.ThoiGianKetThucSuDung
           AND i.ThoiGianKetThucSuDung > pcc.ThoiGianBatDauSuDung
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50011, N'Cổng đã được phân công cho chuyến bay khác trong khoảng thời gian này.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_PhanCongBangChuyen_KiemTraXungDot
ON dbo.PHANCONGBANGCHUYEN
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.PHANCONGBANGCHUYEN pcbc
            ON i.MaBangChuyenHanhLy = pcbc.MaBangChuyenHanhLy
           AND i.MaPhanCongBangChuyen <> pcbc.MaPhanCongBangChuyen
           AND i.DangHienHanh = 1
           AND pcbc.DangHienHanh = 1
           AND i.ThoiGianBatDauSuDung < pcbc.ThoiGianKetThucSuDung
           AND i.ThoiGianKetThucSuDung > pcbc.ThoiGianBatDauSuDung
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50012, N'Băng chuyền đã được phân công cho chuyến bay khác trong khoảng thời gian này.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ThongBao_CapNhatThoiGianGui
ON dbo.THONGBAO
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF TRIGGER_NESTLEVEL() > 1
        RETURN;

    UPDATE tb
    SET ThoiGianGui = GETDATE()
    FROM dbo.THONGBAO tb
    INNER JOIN inserted i
        ON tb.MaThongBao = i.MaThongBao
    WHERE i.TrangThaiGui = N'Đã gửi'
      AND tb.ThoiGianGui IS NULL;
END;
GO