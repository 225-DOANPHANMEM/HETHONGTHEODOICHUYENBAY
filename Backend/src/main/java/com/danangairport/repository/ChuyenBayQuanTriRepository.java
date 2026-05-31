package com.danangairport.repository;

import com.danangairport.dto.CapNhatChuyenBayRequest;
import com.danangairport.dto.CapNhatTinhHinhChuyenBayRequest;
import com.danangairport.dto.ChuyenBayDto;
import com.danangairport.dto.ChuyenBayOptionDto;
import com.danangairport.dto.LichSuCapNhatChuyenBayDto;
import com.danangairport.dto.TaoChuyenBayRequest;
import com.danangairport.dto.ThongBaoChuyenBayDto;
import com.danangairport.dto.ThongKeChuyenBayDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@SuppressWarnings("java:S2077")
public class ChuyenBayQuanTriRepository {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final JdbcTemplate jdbcTemplate;

    public ChuyenBayQuanTriRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ThongKeChuyenBayDto thongKe() {
        return new ThongKeChuyenBayDto(
                dem("SELECT COUNT(DISTINCT cb.MaChuyenBay) FROM LICHTRINH lt JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay WHERE lt.TrangThaiHienTai <> N'Đã xóa'"),
                dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai <> N'Đã xóa'"),
                dem("SELECT COUNT(*) FROM LICHTRINH lt JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay WHERE cb.LoaiChuyenBay = ? AND lt.TrangThaiHienTai <> N'Đã xóa'",
                        "Đến"),
                dem("SELECT COUNT(*) FROM LICHTRINH lt JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay WHERE cb.LoaiChuyenBay = ? AND lt.TrangThaiHienTai <> N'Đã xóa'",
                        "Đi"),
                demTrangThai("Đã lên lịch"),
                demTrangThai("Đang làm thủ tục"),
                demTrangThai("Đang bay"),
                dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai IN (N'Đã lên lịch', N'Đang làm thủ tục', N'Đang bay', N'Chậm chuyến')"),
                demTrangThai("Đã hạ cánh"),
                demTrangThai("Hoàn thành"),
                demTrangThai("Chậm chuyến"),
                demTrangThai("Hủy chuyến"),
                dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai IN (N'Chậm chuyến', N'Hủy chuyến')"),
                demTrangThai("Đã xóa"));
    }

    public List<ChuyenBayDto> layDanhSach(String keyword, String loaiChuyenBay, String trangThai,
            String maHangHangKhong, LocalDate ngayBay, String maCong,
            String maNhaGa, boolean includeArchived) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    cb.MaChuyenBay,
                    lt.MaLichTrinh,
                    cb.SoHieuChuyenBay,
                    cb.MaHangHangKhong,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    lt.NgayBay,
                    lt.GioDuKienKhoiHanh,
                    lt.GioDuKienHaCanh,
                    lt.GioUocTinhKhoiHanh,
                    lt.GioUocTinhHaCanh,
                    lt.GioThucTeKhoiHanh,
                    lt.GioThucTeHaCanh,
                    lt.TrangThaiHienTai,
                    lt.SoPhutCham,
                    lt.LyDoChamHoacHuy,
                    c.MaCong,
                    c.TenCong,
                    c.TenNhaGa,
                    c.ThoiGianBatDauSuDungCong,
                    c.ThoiGianKetThucSuDungCong,
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    bc.TenNhaGaBangChuyen,
                    bc.ThoiGianBatDauSuDungBangChuyen,
                    bc.ThoiGianKetThucSuDungBangChuyen
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                OUTER APPLY (
                    SELECT TOP 1
                        cg.MaCong,
                        cg.TenCong,
                        ng.TenNhaGa,
                        pcc.ThoiGianBatDauSuDung AS ThoiGianBatDauSuDungCong,
                        pcc.ThoiGianKetThucSuDung AS ThoiGianKetThucSuDungCong
                    FROM PHANCONGCONG pcc
                    JOIN CONG cg ON pcc.MaCong = cg.MaCong
                    JOIN NHAGA ng ON cg.MaNhaGa = ng.MaNhaGa
                    WHERE pcc.MaLichTrinh = lt.MaLichTrinh
                      AND pcc.DangHienHanh = 1
                    ORDER BY pcc.ThoiGianBatDauSuDung DESC
                ) c
                OUTER APPLY (
                    SELECT TOP 1
                        bchl.MaBangChuyenHanhLy,
                        bchl.TenBangChuyenHanhLy,
                        ngbc.TenNhaGa AS TenNhaGaBangChuyen,
                        pcbc.ThoiGianBatDauSuDung AS ThoiGianBatDauSuDungBangChuyen,
                        pcbc.ThoiGianKetThucSuDung AS ThoiGianKetThucSuDungBangChuyen
                    FROM PHANCONGBANGCHUYEN pcbc
                    JOIN BANGCHUYENHANHLY bchl ON pcbc.MaBangChuyenHanhLy = bchl.MaBangChuyenHanhLy
                    JOIN NHAGA ngbc ON bchl.MaNhaGa = ngbc.MaNhaGa
                    WHERE pcbc.MaLichTrinh = lt.MaLichTrinh
                      AND pcbc.DangHienHanh = 1
                    ORDER BY pcbc.ThoiGianBatDauSuDung DESC
                ) bc
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (!includeArchived) {
            sql.append(" AND lt.TrangThaiHienTai <> N'Đã xóa'");
        }

        if (hasText(keyword)) {
            sql.append("""
                     AND (
                        cb.SoHieuChuyenBay LIKE ?
                        OR hh.TenHangHangKhong LIKE ?
                        OR cb.DiemDi LIKE ?
                        OR cb.DiemDen LIKE ?
                     )
                    """);
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (hasText(loaiChuyenBay)) {
            sql.append(" AND cb.LoaiChuyenBay = ?");
            params.add(loaiChuyenBay.trim());
        }
        if (hasText(trangThai)) {
            sql.append(" AND lt.TrangThaiHienTai = ?");
            params.add(trangThai.trim());
        }
        if (hasText(maHangHangKhong)) {
            sql.append(" AND cb.MaHangHangKhong = ?");
            params.add(maHangHangKhong.trim());
        }
        if (ngayBay != null) {
            sql.append(" AND CAST(lt.NgayBay AS DATE) = ?");
            params.add(Date.valueOf(ngayBay));
        }
        if (hasText(maCong)) {
            sql.append(" AND c.MaCong = ?");
            params.add(maCong.trim());
        }
        if (hasText(maNhaGa)) {
            sql.append(" AND (c.TenNhaGa = ? OR bc.TenNhaGaBangChuyen = ?)");
            params.add(maNhaGa.trim());
            params.add(maNhaGa.trim());
        }

        sql.append(" ORDER BY lt.NgayBay DESC, lt.GioDuKienKhoiHanh DESC");
        return jdbcTemplate.query(sql.toString(), this::mapChuyenBay, params.toArray());
    }

    public Optional<ChuyenBayDto> layChiTietChuyenBay(String maLichTrinh) {
        String sql = """
                SELECT
                    cb.MaChuyenBay,
                    lt.MaLichTrinh,
                    cb.SoHieuChuyenBay,
                    cb.MaHangHangKhong,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    lt.NgayBay,
                    lt.GioDuKienKhoiHanh,
                    lt.GioDuKienHaCanh,
                    lt.GioUocTinhKhoiHanh,
                    lt.GioUocTinhHaCanh,
                    lt.GioThucTeKhoiHanh,
                    lt.GioThucTeHaCanh,
                    lt.TrangThaiHienTai,
                    lt.SoPhutCham,
                    lt.LyDoChamHoacHuy,
                    c.MaCong,
                    c.TenCong,
                    c.TenNhaGa,
                    c.ThoiGianBatDauSuDungCong,
                    c.ThoiGianKetThucSuDungCong,
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    bc.TenNhaGaBangChuyen,
                    bc.ThoiGianBatDauSuDungBangChuyen,
                    bc.ThoiGianKetThucSuDungBangChuyen
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                OUTER APPLY (
                    SELECT TOP 1
                        cg.MaCong,
                        cg.TenCong,
                        ng.TenNhaGa,
                        pcc.ThoiGianBatDauSuDung AS ThoiGianBatDauSuDungCong,
                        pcc.ThoiGianKetThucSuDung AS ThoiGianKetThucSuDungCong
                    FROM PHANCONGCONG pcc
                    JOIN CONG cg ON pcc.MaCong = cg.MaCong
                    JOIN NHAGA ng ON cg.MaNhaGa = ng.MaNhaGa
                    WHERE pcc.MaLichTrinh = lt.MaLichTrinh AND pcc.DangHienHanh = 1
                    ORDER BY pcc.ThoiGianBatDauSuDung DESC
                ) c
                OUTER APPLY (
                    SELECT TOP 1
                        bchl.MaBangChuyenHanhLy,
                        bchl.TenBangChuyenHanhLy,
                        ngbc.TenNhaGa AS TenNhaGaBangChuyen,
                        pcbc.ThoiGianBatDauSuDung AS ThoiGianBatDauSuDungBangChuyen,
                        pcbc.ThoiGianKetThucSuDung AS ThoiGianKetThucSuDungBangChuyen
                    FROM PHANCONGBANGCHUYEN pcbc
                    JOIN BANGCHUYENHANHLY bchl ON pcbc.MaBangChuyenHanhLy = bchl.MaBangChuyenHanhLy
                    JOIN NHAGA ngbc ON bchl.MaNhaGa = ngbc.MaNhaGa
                    WHERE pcbc.MaLichTrinh = lt.MaLichTrinh AND pcbc.DangHienHanh = 1
                    ORDER BY pcbc.ThoiGianBatDauSuDung DESC
                ) bc
                WHERE lt.MaLichTrinh = ?
                """;
        List<ChuyenBayDto> rows = jdbcTemplate.query(sql, this::mapChuyenBay, maLichTrinh);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<LichSuCapNhatChuyenBayDto> layLichSuCapNhat(String maLichTrinh) {
        String sql = """
                SELECT TOP 5
                    ls.MaLichSuCapNhat,
                    tk.TenDangNhap,
                    ls.TrangThaiCu,
                    ls.TrangThaiMoi,
                    ls.GioUocTinhCu,
                    ls.GioUocTinhMoi,
                    ls.SoPhutChamMoi,
                    ls.LyDoCapNhat,
                    ls.NoiDungCapNhat,
                    ls.ThoiGianCapNhat
                FROM LICHSUCAPNHAT ls
                JOIN TAIKHOAN tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
                WHERE ls.MaLichTrinh = ?
                ORDER BY ls.ThoiGianCapNhat DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new LichSuCapNhatChuyenBayDto(
                rs.getString("MaLichSuCapNhat"),
                rs.getString("TenDangNhap"),
                rs.getString("TrangThaiCu"),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhCu")),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                toInteger(rs.getObject("SoPhutChamMoi")),
                rs.getString("LyDoCapNhat"),
                rs.getString("NoiDungCapNhat"),
                formatTimestamp(rs.getTimestamp("ThoiGianCapNhat"))), maLichTrinh);
    }

    public List<LichSuCapNhatChuyenBayDto> layTatCaLichSuCapNhat(String maLichTrinh) {
        String sql = """
                SELECT
                    ls.MaLichSuCapNhat,
                    tk.TenDangNhap,
                    ls.TrangThaiCu,
                    ls.TrangThaiMoi,
                    ls.GioUocTinhCu,
                    ls.GioUocTinhMoi,
                    ls.SoPhutChamMoi,
                    ls.LyDoCapNhat,
                    ls.NoiDungCapNhat,
                    ls.ThoiGianCapNhat
                FROM LICHSUCAPNHAT ls
                JOIN TAIKHOAN tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
                WHERE ls.MaLichTrinh = ?
                ORDER BY ls.ThoiGianCapNhat DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new LichSuCapNhatChuyenBayDto(
                rs.getString("MaLichSuCapNhat"),
                rs.getString("TenDangNhap"),
                rs.getString("TrangThaiCu"),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhCu")),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                toInteger(rs.getObject("SoPhutChamMoi")),
                rs.getString("LyDoCapNhat"),
                rs.getString("NoiDungCapNhat"),
                formatTimestamp(rs.getTimestamp("ThoiGianCapNhat"))), maLichTrinh);
    }

    public List<ThongBaoChuyenBayDto> layThongBao(String maLichTrinh) {
        String sql = """
                SELECT TOP 5
                    MaThongBao,
                    NoiDungThongBao,
                    TrangThaiMoi,
                    GioUocTinhMoi,
                    PhuongThucGui,
                    TrangThaiGui,
                    ThoiGianGui
                FROM THONGBAO
                WHERE MaLichTrinh = ?
                ORDER BY ThoiGianGui DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ThongBaoChuyenBayDto(
                rs.getString("MaThongBao"),
                rs.getString("NoiDungThongBao"),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                rs.getString("PhuongThucGui"),
                rs.getString("TrangThaiGui"),
                formatTimestamp(rs.getTimestamp("ThoiGianGui"))), maLichTrinh);
    }

    public List<ChuyenBayOptionDto> layHangHangKhongOptions() {
        String sql = """
                SELECT MaHangHangKhong, MaHang, TenHangHangKhong
                FROM HANGHANGKHONG
                ORDER BY TenHangHangKhong
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ChuyenBayOptionDto(
                rs.getString("MaHangHangKhong"),
                rs.getString("MaHang"),
                rs.getString("TenHangHangKhong")));
    }

    public void themChuyenBayVaLichTrinh(String maChuyenBay, String maLichTrinh, TaoChuyenBayRequest request) {
        jdbcTemplate.update("""
                INSERT INTO CHUYENBAY (MaChuyenBay, MaHangHangKhong, SoHieuChuyenBay, LoaiChuyenBay, DiemDen, DiemDi)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                maChuyenBay,
                request.maHangHangKhong().trim(),
                request.soHieuChuyenBay().trim(),
                request.loaiChuyenBay().trim(),
                request.diemDen().trim(),
                request.diemDi().trim());

        jdbcTemplate.update("""
                INSERT INTO LICHTRINH (
                    MaLichTrinh,
                    MaChuyenBay,
                    NgayBay,
                    GioDuKienKhoiHanh,
                    GioDuKienHaCanh,
                    GioUocTinhKhoiHanh,
                    GioUocTinhHaCanh,
                    TrangThaiHienTai,
                    SoPhutCham
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, N'Đã lên lịch', 0)
                """,
                maLichTrinh,
                maChuyenBay,
                Date.valueOf(request.ngayBay()),
                Timestamp.valueOf(request.gioDuKienKhoiHanh()),
                Timestamp.valueOf(request.gioDuKienHaCanh()),
                Timestamp.valueOf(request.gioDuKienKhoiHanh()),
                Timestamp.valueOf(request.gioDuKienHaCanh()));
    }

    public void capNhatChuyenBayVaLichTrinh(String maChuyenBay, String maLichTrinh, CapNhatChuyenBayRequest request) {
        jdbcTemplate.update("""
                UPDATE CHUYENBAY
                SET MaHangHangKhong = ?, SoHieuChuyenBay = ?, LoaiChuyenBay = ?, DiemDen = ?, DiemDi = ?
                WHERE MaChuyenBay = ?
                """,
                request.maHangHangKhong().trim(),
                request.soHieuChuyenBay().trim(),
                request.loaiChuyenBay().trim(),
                request.diemDen().trim(),
                request.diemDi().trim(),
                maChuyenBay);

        jdbcTemplate.update("""
                UPDATE LICHTRINH
                SET NgayBay = ?,
                    GioDuKienKhoiHanh = ?,
                    GioDuKienHaCanh = ?,
                    GioUocTinhKhoiHanh = ?,
                    GioUocTinhHaCanh = ?
                WHERE MaLichTrinh = ?
                """,
                Date.valueOf(request.ngayBay()),
                Timestamp.valueOf(request.gioDuKienKhoiHanh()),
                Timestamp.valueOf(request.gioDuKienHaCanh()),
                toTimestamp(request.gioUocTinhKhoiHanh() == null ? request.gioDuKienKhoiHanh()
                        : request.gioUocTinhKhoiHanh()),
                toTimestamp(
                        request.gioUocTinhHaCanh() == null ? request.gioDuKienHaCanh() : request.gioUocTinhHaCanh()),
                maLichTrinh);
    }

    public void capNhatTinhHinh(String maLichTrinh, CapNhatTinhHinhChuyenBayRequest request) {
        jdbcTemplate.update("""
                EXEC dbo.sp_CapNhatTinhHinhChuyenBay
                    @MaLichTrinh = ?,
                    @MaTaiKhoan = ?,
                    @TrangThaiMoi = ?,
                    @GioUocTinhKhoiHanh = ?,
                    @GioUocTinhHaCanh = ?,
                    @GioThucTeKhoiHanh = ?,
                    @GioThucTeHaCanh = ?,
                    @LyDoChamHoacHuy = ?
                """,
                maLichTrinh,
                request.maTaiKhoan().trim(),
                request.trangThaiMoi().trim(),
                toTimestamp(request.gioUocTinhKhoiHanh()),
                toTimestamp(request.gioUocTinhHaCanh()),
                toTimestamp(request.gioThucTeKhoiHanh()),
                toTimestamp(request.gioThucTeHaCanh()),
                trimToNull(request.lyDoChamHoacHuy()));
        dongBoTinhHinhLichTrinh(maLichTrinh, request);
    }

    private void dongBoTinhHinhLichTrinh(String maLichTrinh, CapNhatTinhHinhChuyenBayRequest request) {
        String trangThaiMoi = request.trangThaiMoi().trim();
        Integer soPhutCham = tinhSoPhutCham(maLichTrinh, request);
        String lyDoChamHoacHuy = laTrangThaiCanLyDo(trangThaiMoi) ? trimToNull(request.lyDoChamHoacHuy()) : null;

        jdbcTemplate.update("""
                UPDATE LICHTRINH
                SET TrangThaiHienTai = ?,
                    GioUocTinhKhoiHanh = COALESCE(?, GioUocTinhKhoiHanh),
                    GioUocTinhHaCanh = COALESCE(?, GioUocTinhHaCanh),
                    GioThucTeKhoiHanh = COALESCE(?, GioThucTeKhoiHanh),
                    GioThucTeHaCanh = COALESCE(?, GioThucTeHaCanh),
                    LyDoChamHoacHuy = ?,
                    SoPhutCham = ?
                WHERE MaLichTrinh = ?
                """,
                trangThaiMoi,
                toTimestamp(request.gioUocTinhKhoiHanh()),
                toTimestamp(request.gioUocTinhHaCanh()),
                toTimestamp(request.gioThucTeKhoiHanh()),
                toTimestamp(request.gioThucTeHaCanh()),
                lyDoChamHoacHuy,
                soPhutCham,
                maLichTrinh);

        jdbcTemplate.update("""
                WITH LichSuMoiNhat AS (
                    SELECT TOP 1 TrangThaiMoi, SoPhutChamMoi, LyDoCapNhat
                    FROM LICHSUCAPNHAT
                    WHERE MaLichTrinh = ?
                    ORDER BY ThoiGianCapNhat DESC
                )
                UPDATE LichSuMoiNhat
                SET TrangThaiMoi = ?,
                    SoPhutChamMoi = ?,
                    LyDoCapNhat = COALESCE(?, LyDoCapNhat)
                """,
                maLichTrinh,
                trangThaiMoi,
                soPhutCham,
                lyDoChamHoacHuy);
    }

    private Integer tinhSoPhutCham(String maLichTrinh, CapNhatTinhHinhChuyenBayRequest request) {
        String trangThaiMoi = request.trangThaiMoi().trim();
        if ("Hủy chuyến".equals(trangThaiMoi)) {
            return 0;
        }

        Map<String, Object> row = jdbcTemplate.queryForMap("""
                SELECT
                    cb.LoaiChuyenBay,
                    lt.GioDuKienKhoiHanh,
                    lt.GioDuKienHaCanh,
                    lt.GioUocTinhKhoiHanh,
                    lt.GioUocTinhHaCanh
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                WHERE lt.MaLichTrinh = ?
                """, maLichTrinh);

        boolean chuyenBayDen = "Đến".equals(row.get("LoaiChuyenBay"));
        LocalDateTime gioDuKien = toLocalDateTime(row.get(chuyenBayDen ? "GioDuKienHaCanh" : "GioDuKienKhoiHanh"));
        LocalDateTime gioUocTinh = chuyenBayDen ? request.gioUocTinhHaCanh() : request.gioUocTinhKhoiHanh();
        if (gioUocTinh == null) {
            gioUocTinh = toLocalDateTime(row.get(chuyenBayDen ? "GioUocTinhHaCanh" : "GioUocTinhKhoiHanh"));
        }

        if (gioDuKien == null || gioUocTinh == null) {
            return 0;
        }

        long soPhut = ChronoUnit.MINUTES.between(gioDuKien, gioUocTinh);
        if (soPhut <= 0) {
            return 0;
        }
        return soPhut > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) soPhut;
    }

    private boolean laTrangThaiCanLyDo(String trangThai) {
        return "Chậm chuyến".equals(trangThai) || "Hủy chuyến".equals(trangThai);
    }

    public void xoaMemLichTrinh(String maLichTrinh, String lyDoXoa) {
        jdbcTemplate.update("""
                INSERT INTO LICHSUCHUYENBAYXOA (
                    MaChuyenBay,
                    MaHangHangKhong,
                    SoHieuChuyenBay,
                    LoaiChuyenBay,
                    DiemDen,
                    DiemDi,
                    ThoiGianXoa,
                    LyDoXoa
                )
                SELECT
                    cb.MaChuyenBay,
                    cb.MaHangHangKhong,
                    cb.SoHieuChuyenBay,
                    cb.LoaiChuyenBay,
                    cb.DiemDen,
                    cb.DiemDi,
                    CURRENT_TIMESTAMP,
                    ?
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                WHERE lt.MaLichTrinh = ?
                """, trimToNull(lyDoXoa), maLichTrinh);

        jdbcTemplate.update("""
                UPDATE LICHTRINH
                SET TrangThaiHienTai = N'Đã xóa',
                    LyDoChamHoacHuy = COALESCE(?, LyDoChamHoacHuy)
                WHERE MaLichTrinh = ?
                """, trimToNull(lyDoXoa), maLichTrinh);
    }

    public boolean tonTaiHangHangKhong(String maHangHangKhong) {
        return dem("SELECT COUNT(*) FROM HANGHANGKHONG WHERE MaHangHangKhong = ?", maHangHangKhong) > 0;
    }

    public boolean tonTaiSoHieuChuyenBay(String soHieuChuyenBay) {
        return dem("SELECT COUNT(*) FROM CHUYENBAY WHERE SoHieuChuyenBay = ?", soHieuChuyenBay) > 0;
    }

    public boolean tonTaiSoHieuChuyenBayKhac(String soHieuChuyenBay, String maChuyenBay) {
        return dem("SELECT COUNT(*) FROM CHUYENBAY WHERE SoHieuChuyenBay = ? AND MaChuyenBay <> ?", soHieuChuyenBay,
                maChuyenBay) > 0;
    }

    public boolean tonTaiLichTrinh(String maLichTrinh) {
        return dem("SELECT COUNT(*) FROM LICHTRINH WHERE MaLichTrinh = ?", maLichTrinh) > 0;
    }

    public String layMaChuyenBayTheoLichTrinh(String maLichTrinh) {
        return jdbcTemplate.queryForObject("SELECT MaChuyenBay FROM LICHTRINH WHERE MaLichTrinh = ?", String.class,
                maLichTrinh);
    }

    public String layTrangThaiTheoLichTrinh(String maLichTrinh) {
        return jdbcTemplate.queryForObject("SELECT TrangThaiHienTai FROM LICHTRINH WHERE MaLichTrinh = ?", String.class,
                maLichTrinh);
    }

    public LocalDateTime layGioDuKienKhoiHanh(String maLichTrinh) {
        Timestamp value = jdbcTemplate.queryForObject("SELECT GioDuKienKhoiHanh FROM LICHTRINH WHERE MaLichTrinh = ?",
                Timestamp.class, maLichTrinh);
        return value == null ? null : value.toLocalDateTime();
    }

    public LocalDateTime layGioDuKienHaCanh(String maLichTrinh) {
        Timestamp value = jdbcTemplate.queryForObject("SELECT GioDuKienHaCanh FROM LICHTRINH WHERE MaLichTrinh = ?",
                Timestamp.class, maLichTrinh);
        return value == null ? null : value.toLocalDateTime();
    }

    public String taoMaChuyenBayMoi() {
        return taoMaMoi("CB", "CHUYENBAY", "MaChuyenBay", 3);
    }

    public String taoMaLichTrinhMoi() {
        return taoMaMoi("LT", "LICHTRINH", "MaLichTrinh", 3);
    }

    private ChuyenBayDto mapChuyenBay(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new ChuyenBayDto(
                rs.getString("MaChuyenBay"),
                rs.getString("MaLichTrinh"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("MaHangHangKhong"),
                rs.getString("TenHangHangKhong"),
                rs.getString("LoaiChuyenBay"),
                rs.getString("DiemDi"),
                rs.getString("DiemDen"),
                formatDate(rs.getDate("NgayBay")),
                formatTimestamp(rs.getTimestamp("GioDuKienKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioDuKienHaCanh")),
                formatTimestamp(rs.getTimestamp("GioUocTinhKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioUocTinhHaCanh")),
                formatTimestamp(rs.getTimestamp("GioThucTeKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioThucTeHaCanh")),
                rs.getString("TrangThaiHienTai"),
                toInteger(rs.getObject("SoPhutCham")),
                rs.getString("LyDoChamHoacHuy"),
                rs.getString("MaCong"),
                rs.getString("TenCong"),
                rs.getString("TenNhaGa"),
                formatTimestamp(rs.getTimestamp("ThoiGianBatDauSuDungCong")),
                formatTimestamp(rs.getTimestamp("ThoiGianKetThucSuDungCong")),
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("TenNhaGaBangChuyen"),
                formatTimestamp(rs.getTimestamp("ThoiGianBatDauSuDungBangChuyen")),
                formatTimestamp(rs.getTimestamp("ThoiGianKetThucSuDungBangChuyen")));
    }

    private Long dem(String sql, Object... params) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, params);
        return value == null ? 0L : value;
    }

    private Long demTrangThai(String trangThai) {
        return dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = ?", trangThai);
    }

    private String taoMaMoi(String prefix, String table, String column, int minWidth) {
        int startIndex = prefix.length() + 1;
        String sql = """
                SELECT TOP 1 %s
                FROM %s
                WHERE %s LIKE ?
                ORDER BY TRY_CAST(SUBSTRING(%s, %d, LEN(%s) - %d) AS INT) DESC
                """.formatted(column, table, column, column, startIndex, column, prefix.length());
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(column), prefix + "%");
        if (rows.isEmpty() || rows.get(0) == null) {
            return prefix + String.format("%0" + minWidth + "d", 1);
        }
        String current = rows.get(0);
        String digits = current.substring(prefix.length());
        int number = Integer.parseInt(digits);
        int width = Math.max(minWidth, digits.length());
        return prefix + String.format("%0" + width + "d", number + 1);
    }

    private String formatDate(Date date) {
        return date == null ? null : date.toLocalDate().format(DATE_FORMATTER);
    }

    private String formatTimestamp(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().format(DATE_TIME_FORMATTER);
    }

    private Timestamp toTimestamp(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        return null;
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
