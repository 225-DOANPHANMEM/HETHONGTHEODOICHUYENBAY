package com.danangairport.repository;

import com.danangairport.dto.DashboardChuyenBayCanChuYDto;
import com.danangairport.dto.DashboardLichSuCapNhatDto;
import com.danangairport.dto.DashboardThongBaoDto;
import com.danangairport.dto.DashboardTongQuanResponseDto;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Repository
public class AdminDashboardRepository {

    private final JdbcTemplate jdbcTemplate;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public AdminDashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardTongQuanResponseDto layTongQuan() {
        long tongChuyenBay = dem("SELECT COUNT(*) FROM CHUYENBAY");
        long soChuyenBayDen = dem("SELECT COUNT(*) FROM CHUYENBAY WHERE LoaiChuyenBay = N'Đến'");
        long soChuyenBayDi = dem("SELECT COUNT(*) FROM CHUYENBAY WHERE LoaiChuyenBay = N'Đi'");
        long soDangLamThuTuc = dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Đang làm thủ tục'");
        long soDangBay = dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Đang bay'");
        long soChamChuyen = dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Chậm chuyến'");
        long soHuyChuyen = dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Hủy chuyến'");
        long soHoanThanh = dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Hoàn thành'");
        long soCongDangDung = dem("SELECT COUNT(*) FROM PHANCONGCONG WHERE DangHienHanh = 1");
        long soBangChuyenDangDung = dem("SELECT COUNT(*) FROM PHANCONGBANGCHUYEN WHERE DangHienHanh = 1");

        return new DashboardTongQuanResponseDto(
                tongChuyenBay,
                soChuyenBayDen,
                soChuyenBayDi,
                soDangLamThuTuc,
                soDangBay,
                soChamChuyen,
                soHuyChuyen,
                soHoanThanh,
                soCongDangDung,
                soBangChuyenDangDung,
                layChuyenBayCanChuY(),
                layThongBaoGanDay(),
                layLichSuCapNhatGanDay()
        );
    }

    private long dem(String sql) {
        try {
            Long value = jdbcTemplate.queryForObject(sql, Long.class);
            return value == null ? 0L : value;
        } catch (DataAccessException ex) {
            return 0L;
        }
    }

    private List<DashboardChuyenBayCanChuYDto> layChuyenBayCanChuY() {
        String sql = """
                SELECT TOP 5
                    cb.MaChuyenBay,
                    lt.MaLichTrinh,
                    cb.SoHieuChuyenBay,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    lt.NgayBay,
                    lt.TrangThaiHienTai,
                    lt.SoPhutCham,
                    lt.LyDoChamHoacHuy
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                WHERE lt.TrangThaiHienTai IN (
                    N'Chậm chuyến',
                    N'Hủy chuyến',
                    N'Đang làm thủ tục',
                    N'Đang bay',
                    N'Đã lên lịch'
                )
                ORDER BY
                    CASE
                        WHEN lt.TrangThaiHienTai = N'Hủy chuyến' THEN 1
                        WHEN lt.TrangThaiHienTai = N'Chậm chuyến' THEN 2
                        WHEN lt.TrangThaiHienTai = N'Đang bay' THEN 3
                        WHEN lt.TrangThaiHienTai = N'Đang làm thủ tục' THEN 4
                        ELSE 5
                    END,
                    lt.NgayBay DESC,
                    lt.GioDuKienKhoiHanh DESC
                """;

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                String trangThai = rs.getString("TrangThaiHienTai");
                return new DashboardChuyenBayCanChuYDto(
                        rs.getString("MaChuyenBay"),
                        rs.getString("MaLichTrinh"),
                        rs.getString("SoHieuChuyenBay"),
                        rs.getString("TenHangHangKhong"),
                        rs.getString("LoaiChuyenBay"),
                        rs.getString("DiemDi"),
                        rs.getString("DiemDen"),
                        formatTimestamp(rs.getTimestamp("NgayBay")),
                        trangThai,
                        laySoNguyen(rs.getObject("SoPhutCham")),
                        rs.getString("LyDoChamHoacHuy"),
                        taoCanhBao(trangThai)
                );
            });
        } catch (DataAccessException ex) {
            return Collections.emptyList();
        }
    }

    private List<DashboardThongBaoDto> layThongBaoGanDay() {
        String sql = """
                SELECT TOP 5
                    tb.MaThongBao,
                    cb.SoHieuChuyenBay,
                    tb.NoiDungThongBao,
                    tb.TrangThaiMoi,
                    tb.PhuongThucGui,
                    tb.TrangThaiGui,
                    tb.ThoiGianGui
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                ORDER BY tb.ThoiGianGui DESC
                """;

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> new DashboardThongBaoDto(
                    rs.getString("MaThongBao"),
                    rs.getString("SoHieuChuyenBay"),
                    rs.getString("NoiDungThongBao"),
                    rs.getString("TrangThaiMoi"),
                    rs.getString("PhuongThucGui"),
                    rs.getString("TrangThaiGui"),
                    formatTimestamp(rs.getTimestamp("ThoiGianGui"))
            ));
        } catch (DataAccessException ex) {
            return Collections.emptyList();
        }
    }

    private List<DashboardLichSuCapNhatDto> layLichSuCapNhatGanDay() {
        String sql = """
                SELECT TOP 5
                    ls.MaLichSuCapNhat,
                    cb.SoHieuChuyenBay,
                    tk.TenDangNhap,
                    ls.TrangThaiCu,
                    ls.TrangThaiMoi,
                    ls.SoPhutChamMoi,
                    ls.LyDoCapNhat,
                    ls.NoiDungCapNhat,
                    ls.ThoiGianCapNhat
                FROM LICHSUCAPNHAT ls
                JOIN LICHTRINH lt ON ls.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN TAIKHOAN tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
                ORDER BY ls.ThoiGianCapNhat DESC
                """;

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> new DashboardLichSuCapNhatDto(
                    rs.getString("MaLichSuCapNhat"),
                    rs.getString("SoHieuChuyenBay"),
                    rs.getString("TenDangNhap"),
                    rs.getString("TrangThaiCu"),
                    rs.getString("TrangThaiMoi"),
                    laySoNguyen(rs.getObject("SoPhutChamMoi")),
                    rs.getString("LyDoCapNhat"),
                    rs.getString("NoiDungCapNhat"),
                    formatTimestamp(rs.getTimestamp("ThoiGianCapNhat"))
            ));
        } catch (DataAccessException ex) {
            return Collections.emptyList();
        }
    }

    private String taoCanhBao(String trangThai) {
        if (trangThai == null) {
            return "Cần theo dõi";
        }
        return switch (trangThai) {
            case "Hủy chuyến" -> "Chuyến bay đã hủy";
            case "Chậm chuyến" -> "Chuyến bay bị chậm";
            case "Đang bay" -> "Đang trong hành trình";
            case "Đang làm thủ tục" -> "Đang làm thủ tục";
            default -> "Cần theo dõi";
        };
    }

    private Integer laySoNguyen(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private String formatTimestamp(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime().format(TIME_FORMATTER);
    }
}
