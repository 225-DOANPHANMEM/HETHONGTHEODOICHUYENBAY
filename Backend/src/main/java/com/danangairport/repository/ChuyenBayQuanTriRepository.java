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
import java.util.ArrayList;
import java.util.List;
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
                dem("SELECT COUNT(*) FROM CHUYENBAY"),
                dem("SELECT COUNT(*) FROM LICHTRINH"),
                dem("SELECT COUNT(*) FROM CHUYENBAY WHERE LoaiChuyenBay = ?", "Đến"),
                dem("SELECT COUNT(*) FROM CHUYENBAY WHERE LoaiChuyenBay = ?", "Đi"),
                demTrangThai("Đã lên lịch"),
                demTrangThai("Đang làm thủ tục"),
                demTrangThai("Đang bay"),
                demTrangThai("Đã hạ cánh"),
                demTrangThai("Hoàn thành"),
                demTrangThai("Chậm chuyến"),
                demTrangThai("Hủy chuyến"),
                demTrangThai("Đã xóa")
        );
    }

    public List<ChuyenBayDto> layDanhSach(String keyword, String loaiChuyenBay, String trangThai,
                                           String maHangHangKhong, LocalDate tuNgay, LocalDate denNgay) {
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
                    c.TenCong,
                    bc.TenBangChuyenHanhLy
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                OUTER APPLY (
                    SELECT TOP 1 cg.TenCong
                    FROM PHANCONGCONG pcc
                    JOIN CONG cg ON pcc.MaCong = cg.MaCong
                    WHERE pcc.MaLichTrinh = lt.MaLichTrinh
                      AND pcc.DangHienHanh = 1
                    ORDER BY pcc.ThoiGianBatDauSuDung DESC
                ) c
                OUTER APPLY (
                    SELECT TOP 1 bchl.TenBangChuyenHanhLy
                    FROM PHANCONGBANGCHUYEN pcbc
                    JOIN BANGCHUYENHANHLY bchl ON pcbc.MaBangChuyenHanhLy = bchl.MaBangChuyenHanhLy
                    WHERE pcbc.MaLichTrinh = lt.MaLichTrinh
                      AND pcbc.DangHienHanh = 1
                    ORDER BY pcbc.ThoiGianBatDauSuDung DESC
                ) bc
                WHERE lt.TrangThaiHienTai <> N'Đã xóa'
                """);
        List<Object> params = new ArrayList<>();

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
        if (tuNgay != null) {
            sql.append(" AND CAST(lt.NgayBay AS DATE) >= ?");
            params.add(Date.valueOf(tuNgay));
        }
        if (denNgay != null) {
            sql.append(" AND CAST(lt.NgayBay AS DATE) <= ?");
            params.add(Date.valueOf(denNgay));
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
                    c.TenCong,
                    bc.TenBangChuyenHanhLy
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                OUTER APPLY (
                    SELECT TOP 1 cg.TenCong
                    FROM PHANCONGCONG pcc
                    JOIN CONG cg ON pcc.MaCong = cg.MaCong
                    WHERE pcc.MaLichTrinh = lt.MaLichTrinh AND pcc.DangHienHanh = 1
                    ORDER BY pcc.ThoiGianBatDauSuDung DESC
                ) c
                OUTER APPLY (
                    SELECT TOP 1 bchl.TenBangChuyenHanhLy
                    FROM PHANCONGBANGCHUYEN pcbc
                    JOIN BANGCHUYENHANHLY bchl ON pcbc.MaBangChuyenHanhLy = bchl.MaBangChuyenHanhLy
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
                formatTimestamp(rs.getTimestamp("ThoiGianCapNhat"))
        ), maLichTrinh);
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
                formatTimestamp(rs.getTimestamp("ThoiGianGui"))
        ), maLichTrinh);
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
                rs.getString("TenHangHangKhong")
        ));
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
                SET NgayBay = ?, GioDuKienKhoiHanh = ?, GioDuKienHaCanh = ?
                WHERE MaLichTrinh = ?
                """,
                Date.valueOf(request.ngayBay()),
                Timestamp.valueOf(request.gioDuKienKhoiHanh()),
                Timestamp.valueOf(request.gioDuKienHaCanh()),
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
    }

    public void xoaMemLichTrinh(String maLichTrinh, String lyDoXoa) {
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
        return dem("SELECT COUNT(*) FROM CHUYENBAY WHERE SoHieuChuyenBay = ? AND MaChuyenBay <> ?", soHieuChuyenBay, maChuyenBay) > 0;
    }

    public boolean tonTaiLichTrinh(String maLichTrinh) {
        return dem("SELECT COUNT(*) FROM LICHTRINH WHERE MaLichTrinh = ?", maLichTrinh) > 0;
    }

    public String layMaChuyenBayTheoLichTrinh(String maLichTrinh) {
        return jdbcTemplate.queryForObject("SELECT MaChuyenBay FROM LICHTRINH WHERE MaLichTrinh = ?", String.class, maLichTrinh);
    }

    public String layTrangThaiTheoLichTrinh(String maLichTrinh) {
        return jdbcTemplate.queryForObject("SELECT TrangThaiHienTai FROM LICHTRINH WHERE MaLichTrinh = ?", String.class, maLichTrinh);
    }

    public LocalDateTime layGioDuKienKhoiHanh(String maLichTrinh) {
        Timestamp value = jdbcTemplate.queryForObject("SELECT GioDuKienKhoiHanh FROM LICHTRINH WHERE MaLichTrinh = ?", Timestamp.class, maLichTrinh);
        return value == null ? null : value.toLocalDateTime();
    }

    public LocalDateTime layGioDuKienHaCanh(String maLichTrinh) {
        Timestamp value = jdbcTemplate.queryForObject("SELECT GioDuKienHaCanh FROM LICHTRINH WHERE MaLichTrinh = ?", Timestamp.class, maLichTrinh);
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
                rs.getString("TenCong"),
                rs.getString("TenBangChuyenHanhLy")
        );
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
