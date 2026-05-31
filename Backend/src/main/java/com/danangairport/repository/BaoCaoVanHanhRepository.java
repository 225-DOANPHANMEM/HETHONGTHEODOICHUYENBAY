package com.danangairport.repository;

import com.danangairport.dto.BaoCaoHangHangKhongDto;
import com.danangairport.dto.BaoCaoLichSuCapNhatDto;
import com.danangairport.dto.BaoCaoTaiNguyenDto;
import com.danangairport.dto.BaoCaoTheoNgayDto;
import com.danangairport.dto.BaoCaoThongBaoDto;
import com.danangairport.dto.BaoCaoTongQuanDto;
import com.danangairport.dto.BaoCaoTrangThaiDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@SuppressWarnings("java:S2077")
public class BaoCaoVanHanhRepository {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final JdbcTemplate jdbcTemplate;

    public BaoCaoVanHanhRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public BaoCaoTongQuanDto layTongQuan(LocalDate tuNgay, LocalDate denNgay) {
        long tongChuyenBay = demChuyenBay(tuNgay, denNgay);
        long tongLichTrinh = demLichTrinh(tuNgay, denNgay);
        long soChuyenBayDen = demLichTrinhTheoLoai("Đến", tuNgay, denNgay);
        long soChuyenBayDi = demLichTrinhTheoLoai("Đi", tuNgay, denNgay);
        Map<String, Long> trangThai = demTheoTrangThai(tuNgay, denNgay);
        DelaySummary delay = layThongKeChamChuyen(tuNgay, denNgay);

        return new BaoCaoTongQuanDto(
                tongChuyenBay,
                tongLichTrinh,
                soChuyenBayDen,
                soChuyenBayDi,
                trangThai.getOrDefault("Đã lên lịch", 0L),
                trangThai.getOrDefault("Đang làm thủ tục", 0L),
                trangThai.getOrDefault("Đang bay", 0L),
                trangThai.getOrDefault("Đã hạ cánh", 0L),
                trangThai.getOrDefault("Hoàn thành", 0L),
                trangThai.getOrDefault("Chậm chuyến", 0L),
                trangThai.getOrDefault("Hủy chuyến", 0L),
                trangThai.getOrDefault("Đã xóa", 0L),
                delay.tongSoPhutCham(),
                delay.soPhutChamTrungBinh(),
                demThongBao(tuNgay, denNgay),
                demLichSuCapNhat(tuNgay, denNgay),
                demCongDangDung(tuNgay, denNgay),
                demBangChuyenDangDung(tuNgay, denNgay)
        );
    }

    public List<BaoCaoTheoNgayDto> layTheoNgay(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT
                    lt.NgayBay,
                    COUNT(*) AS TongLichTrinh,
                    SUM(CASE WHEN cb.LoaiChuyenBay = N'Đến' THEN 1 ELSE 0 END) AS SoChuyenBayDen,
                    SUM(CASE WHEN cb.LoaiChuyenBay = N'Đi' THEN 1 ELSE 0 END) AS SoChuyenBayDi,
                    SUM(CASE WHEN lt.TrangThaiHienTai = N'Chậm chuyến' THEN 1 ELSE 0 END) AS SoChamChuyen,
                    SUM(CASE WHEN lt.TrangThaiHienTai = N'Hủy chuyến' THEN 1 ELSE 0 END) AS SoHuyChuyen,
                    SUM(CASE WHEN lt.TrangThaiHienTai = N'Hoàn thành' THEN 1 ELSE 0 END) AS SoHoanThanh,
                    COALESCE(SUM(lt.SoPhutCham), 0) AS TongSoPhutCham
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        query.sql().append("""
                GROUP BY lt.NgayBay
                ORDER BY lt.NgayBay
                """);
        return jdbcTemplate.query(query.sql().toString(), (rs, rowNum) -> new BaoCaoTheoNgayDto(
                formatDate(rs.getDate("NgayBay")),
                rs.getLong("TongLichTrinh"),
                rs.getLong("SoChuyenBayDen"),
                rs.getLong("SoChuyenBayDi"),
                rs.getLong("SoChamChuyen"),
                rs.getLong("SoHuyChuyen"),
                rs.getLong("SoHoanThanh"),
                rs.getLong("TongSoPhutCham")
        ), query.params().toArray());
    }

    public List<BaoCaoTrangThaiDto> layTheoTrangThai(LocalDate tuNgay, LocalDate denNgay) {
        long total = demLichTrinh(tuNgay, denNgay);
        QueryParts query = new QueryParts("""
                SELECT TrangThaiHienTai AS TrangThai, COUNT(*) AS SoLuong
                FROM LICHTRINH
                WHERE 1 = 1
                """);
        appendDateFilter(query, "NgayBay", tuNgay, denNgay);
        query.sql().append("""
                GROUP BY TrangThaiHienTai
                ORDER BY SoLuong DESC
                """);
        return jdbcTemplate.query(query.sql().toString(), (rs, rowNum) -> {
            long soLuong = rs.getLong("SoLuong");
            double tyLe = total == 0 ? 0 : soLuong * 100.0 / total;
            return new BaoCaoTrangThaiDto(rs.getString("TrangThai"), soLuong, tyLe);
        }, query.params().toArray());
    }

    public List<BaoCaoHangHangKhongDto> layTheoHangHangKhong(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT
                    hh.MaHangHangKhong,
                    hh.MaHang,
                    hh.TenHangHangKhong,
                    COUNT(*) AS TongChuyenBay,
                    SUM(CASE WHEN cb.LoaiChuyenBay = N'Đến' THEN 1 ELSE 0 END) AS SoChuyenBayDen,
                    SUM(CASE WHEN cb.LoaiChuyenBay = N'Đi' THEN 1 ELSE 0 END) AS SoChuyenBayDi,
                    SUM(CASE WHEN lt.TrangThaiHienTai = N'Chậm chuyến' THEN 1 ELSE 0 END) AS SoChamChuyen,
                    SUM(CASE WHEN lt.TrangThaiHienTai = N'Hủy chuyến' THEN 1 ELSE 0 END) AS SoHuyChuyen,
                    SUM(CASE WHEN lt.TrangThaiHienTai = N'Hoàn thành' THEN 1 ELSE 0 END) AS SoHoanThanh,
                    COALESCE(SUM(lt.SoPhutCham), 0) AS TongSoPhutCham,
                    COALESCE(AVG(CAST(lt.SoPhutCham AS FLOAT)), 0) AS SoPhutChamTrungBinh
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        query.sql().append("""
                GROUP BY hh.MaHangHangKhong, hh.MaHang, hh.TenHangHangKhong
                ORDER BY TongChuyenBay DESC
                """);
        return jdbcTemplate.query(query.sql().toString(), (rs, rowNum) -> new BaoCaoHangHangKhongDto(
                rs.getString("MaHangHangKhong"),
                rs.getString("MaHang"),
                rs.getString("TenHangHangKhong"),
                rs.getLong("TongChuyenBay"),
                rs.getLong("SoChuyenBayDen"),
                rs.getLong("SoChuyenBayDi"),
                rs.getLong("SoChamChuyen"),
                rs.getLong("SoHuyChuyen"),
                rs.getLong("SoHoanThanh"),
                rs.getLong("TongSoPhutCham"),
                rs.getDouble("SoPhutChamTrungBinh")
        ), query.params().toArray());
    }

    public BaoCaoTaiNguyenDto layTaiNguyen(LocalDate tuNgay, LocalDate denNgay) {
        return new BaoCaoTaiNguyenDto(layBaoCaoCong(tuNgay, denNgay), layBaoCaoBangChuyen(tuNgay, denNgay));
    }

    public BaoCaoThongBaoDto layThongBao(LocalDate tuNgay, LocalDate denNgay) {
        long tong = demThongBao(tuNgay, denNgay);
        Map<String, Long> theoTrangThai = demThongBaoTheoTrangThai(tuNgay, denNgay);
        List<BaoCaoThongBaoDto.TheoPhuongThuc> theoPhuongThuc = layThongBaoTheoPhuongThuc(tuNgay, denNgay);
        return new BaoCaoThongBaoDto(
                tong,
                theoTrangThai.getOrDefault("Chờ gửi", 0L),
                theoTrangThai.getOrDefault("Đã gửi", 0L),
                theoTrangThai.getOrDefault("Lỗi gửi", 0L),
                theoPhuongThuc
        );
    }

    public BaoCaoLichSuCapNhatDto layLichSuCapNhat(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT TOP 5
                    tk.MaTaiKhoan,
                    tk.TenDangNhap,
                    tk.VaiTro,
                    COUNT(*) AS SoLanCapNhat
                FROM LICHSUCAPNHAT ls
                JOIN TAIKHOAN tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
                JOIN LICHTRINH lt ON ls.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        query.sql().append("""
                GROUP BY tk.MaTaiKhoan, tk.TenDangNhap, tk.VaiTro
                ORDER BY SoLanCapNhat DESC
                """);
        List<BaoCaoLichSuCapNhatDto.TopTaiKhoanCapNhat> top = jdbcTemplate.query(
                query.sql().toString(),
                (rs, rowNum) -> new BaoCaoLichSuCapNhatDto.TopTaiKhoanCapNhat(
                        rs.getString("MaTaiKhoan"),
                        rs.getString("TenDangNhap"),
                        rs.getString("VaiTro"),
                        rs.getLong("SoLanCapNhat")
                ),
                query.params().toArray());
        return new BaoCaoLichSuCapNhatDto(demLichSuCapNhat(tuNgay, denNgay), top);
    }

    private List<BaoCaoTaiNguyenDto.Cong> layBaoCaoCong(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts assignment = new QueryParts("""
                SELECT pcc.MaCong, COUNT(*) AS SoLanPhanCong
                FROM PHANCONGCONG pcc
                JOIN LICHTRINH lt ON pcc.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(assignment, "lt.NgayBay", tuNgay, denNgay);
        assignment.sql().append(" GROUP BY pcc.MaCong");

        String sql = """
                SELECT
                    c.MaCong,
                    c.TenCong,
                    ng.TenNhaGa,
                    c.TrangThaiCong,
                    COALESCE(pc.SoLanPhanCong, 0) AS SoLanPhanCong
                FROM CONG c
                JOIN NHAGA ng ON c.MaNhaGa = ng.MaNhaGa
                LEFT JOIN (
                """ + assignment.sql() + """
                ) pc ON c.MaCong = pc.MaCong
                ORDER BY SoLanPhanCong DESC, c.MaCong
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new BaoCaoTaiNguyenDto.Cong(
                rs.getString("MaCong"),
                rs.getString("TenCong"),
                rs.getString("TenNhaGa"),
                rs.getString("TrangThaiCong"),
                rs.getLong("SoLanPhanCong")
        ), assignment.params().toArray());
    }

    private List<BaoCaoTaiNguyenDto.BangChuyen> layBaoCaoBangChuyen(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts assignment = new QueryParts("""
                SELECT pcbc.MaBangChuyenHanhLy, COUNT(*) AS SoLanPhanCong
                FROM PHANCONGBANGCHUYEN pcbc
                JOIN LICHTRINH lt ON pcbc.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(assignment, "lt.NgayBay", tuNgay, denNgay);
        assignment.sql().append(" GROUP BY pcbc.MaBangChuyenHanhLy");

        String sql = """
                SELECT
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    ng.TenNhaGa,
                    bc.TrangThaiBangChuyen,
                    COALESCE(pc.SoLanPhanCong, 0) AS SoLanPhanCong
                FROM BANGCHUYENHANHLY bc
                JOIN NHAGA ng ON bc.MaNhaGa = ng.MaNhaGa
                LEFT JOIN (
                """ + assignment.sql() + """
                ) pc ON bc.MaBangChuyenHanhLy = pc.MaBangChuyenHanhLy
                ORDER BY SoLanPhanCong DESC, bc.MaBangChuyenHanhLy
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new BaoCaoTaiNguyenDto.BangChuyen(
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("TenNhaGa"),
                rs.getString("TrangThaiBangChuyen"),
                rs.getLong("SoLanPhanCong")
        ), assignment.params().toArray());
    }

    private long demChuyenBay(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT COUNT(DISTINCT cb.MaChuyenBay)
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    public long demLichTrinh(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("SELECT COUNT(*) FROM LICHTRINH WHERE 1 = 1");
        appendDateFilter(query, "NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    private long demLichTrinhTheoLoai(String loaiChuyenBay, LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT COUNT(*)
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                WHERE cb.LoaiChuyenBay = ?
                """);
        query.params().add(loaiChuyenBay);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    private Map<String, Long> demTheoTrangThai(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT TrangThaiHienTai, COUNT(*) AS SoLuong
                FROM LICHTRINH
                WHERE 1 = 1
                """);
        appendDateFilter(query, "NgayBay", tuNgay, denNgay);
        query.sql().append(" GROUP BY TrangThaiHienTai");
        return jdbcTemplate.query(query.sql().toString(), (rs, rowNum) -> Map.entry(
                rs.getString("TrangThaiHienTai"),
                rs.getLong("SoLuong")
        ), query.params().toArray()).stream().collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private DelaySummary layThongKeChamChuyen(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT
                    COALESCE(SUM(SoPhutCham), 0) AS TongSoPhutCham,
                    COALESCE(AVG(CAST(SoPhutCham AS FLOAT)), 0) AS SoPhutChamTrungBinh
                FROM LICHTRINH
                WHERE 1 = 1
                """);
        appendDateFilter(query, "NgayBay", tuNgay, denNgay);
        return jdbcTemplate.queryForObject(query.sql().toString(), (rs, rowNum) -> new DelaySummary(
                rs.getLong("TongSoPhutCham"),
                rs.getDouble("SoPhutChamTrungBinh")
        ), query.params().toArray());
    }

    private long demThongBao(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT COUNT(*)
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    private long demLichSuCapNhat(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT COUNT(*)
                FROM LICHSUCAPNHAT ls
                JOIN LICHTRINH lt ON ls.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    private long demCongDangDung(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT COUNT(*)
                FROM PHANCONGCONG pcc
                JOIN LICHTRINH lt ON pcc.MaLichTrinh = lt.MaLichTrinh
                WHERE pcc.DangHienHanh = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    private long demBangChuyenDangDung(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT COUNT(*)
                FROM PHANCONGBANGCHUYEN pcbc
                JOIN LICHTRINH lt ON pcbc.MaLichTrinh = lt.MaLichTrinh
                WHERE pcbc.DangHienHanh = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        return dem(query);
    }

    private Map<String, Long> demThongBaoTheoTrangThai(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT tb.TrangThaiGui, COUNT(*) AS SoLuong
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        query.sql().append(" GROUP BY tb.TrangThaiGui");
        return jdbcTemplate.query(query.sql().toString(), (rs, rowNum) -> Map.entry(
                rs.getString("TrangThaiGui"),
                rs.getLong("SoLuong")
        ), query.params().toArray()).stream().collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private List<BaoCaoThongBaoDto.TheoPhuongThuc> layThongBaoTheoPhuongThuc(LocalDate tuNgay, LocalDate denNgay) {
        QueryParts query = new QueryParts("""
                SELECT tb.PhuongThucGui, COUNT(*) AS SoLuong
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                WHERE 1 = 1
                """);
        appendDateFilter(query, "lt.NgayBay", tuNgay, denNgay);
        query.sql().append(" GROUP BY tb.PhuongThucGui ORDER BY SoLuong DESC");
        return jdbcTemplate.query(query.sql().toString(), (rs, rowNum) -> new BaoCaoThongBaoDto.TheoPhuongThuc(
                rs.getString("PhuongThucGui"),
                rs.getLong("SoLuong")
        ), query.params().toArray());
    }

    private long dem(QueryParts query) {
        Long value = jdbcTemplate.queryForObject(query.sql().toString(), Long.class, query.params().toArray());
        return value == null ? 0L : value;
    }

    private void appendDateFilter(QueryParts query, String column, LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay != null) {
            query.sql().append(" AND ").append(column).append(" >= ?");
            query.params().add(Date.valueOf(tuNgay));
        }
        if (denNgay != null) {
            query.sql().append(" AND ").append(column).append(" <= ?");
            query.params().add(Date.valueOf(denNgay));
        }
    }

    private String formatDate(Date date) {
        return date == null ? null : date.toLocalDate().format(DATE_FORMATTER);
    }

    private record QueryParts(StringBuilder sql, List<Object> params) {
        QueryParts(String sql) {
            this(new StringBuilder(sql), new ArrayList<>());
        }
    }

    private record DelaySummary(long tongSoPhutCham, double soPhutChamTrungBinh) {
    }
}
