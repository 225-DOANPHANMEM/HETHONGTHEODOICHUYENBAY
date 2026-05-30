package com.danangairport.repository;

import com.danangairport.dto.ChiTietLichSuCapNhatDto;
import com.danangairport.dto.ChiTietThongBaoDto;
import com.danangairport.dto.LichSuCapNhatDto;
import com.danangairport.dto.TaoThongBaoThuCongRequest;
import com.danangairport.dto.ThongBaoDto;
import com.danangairport.dto.ThongBaoOptionDto;
import com.danangairport.dto.ThongKeThongBaoLichSuDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@SuppressWarnings("java:S2077")
public class ThongBaoLichSuRepository {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final JdbcTemplate jdbcTemplate;

    public ThongBaoLichSuRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ThongKeThongBaoLichSuDto thongKe() {
        return new ThongKeThongBaoLichSuDto(
                dem("SELECT COUNT(*) FROM THONGBAO"),
                dem("SELECT COUNT(*) FROM THONGBAO WHERE TrangThaiGui = N'Chờ gửi'"),
                dem("SELECT COUNT(*) FROM THONGBAO WHERE TrangThaiGui = N'Đã gửi'"),
                dem("SELECT COUNT(*) FROM THONGBAO WHERE TrangThaiGui = N'Lỗi gửi'"),
                dem("SELECT COUNT(*) FROM LICHSUCAPNHAT"),
                dem("""
                        SELECT COUNT(*)
                        FROM LICHSUCAPNHAT
                        WHERE CAST(ThoiGianCapNhat AS DATE) = CAST(GETDATE() AS DATE)
                        """),
                dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Chậm chuyến'"),
                dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai = N'Hủy chuyến'")
        );
    }

    public List<ThongBaoDto> layDanhSachThongBao(String keyword, String trangThaiGui, String phuongThucGui,
                                                  String trangThaiMoi, LocalDate tuNgay, LocalDate denNgay) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    tb.MaThongBao,
                    tb.MaLichTrinh,
                    tb.MaTaiKhoan,
                    tk.TenDangNhap,
                    cb.SoHieuChuyenBay,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    tb.MaCong,
                    c.TenCong,
                    tb.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    tb.NoiDungThongBao,
                    tb.TrangThaiMoi,
                    tb.GioUocTinhMoi,
                    tb.PhuongThucGui,
                    tb.TrangThaiGui,
                    tb.ThoiGianGui
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                LEFT JOIN TAIKHOAN tk ON tb.MaTaiKhoan = tk.MaTaiKhoan
                LEFT JOIN CONG c ON tb.MaCong = c.MaCong
                LEFT JOIN BANGCHUYENHANHLY bc ON tb.MaBangChuyenHanhLy = bc.MaBangChuyenHanhLy
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();
        themBoLocThongBao(sql, params, keyword, trangThaiGui, phuongThucGui, trangThaiMoi, tuNgay, denNgay);
        sql.append(" ORDER BY tb.ThoiGianGui DESC, tb.MaThongBao DESC");
        return jdbcTemplate.query(sql.toString(), this::mapThongBao, params.toArray());
    }

    public Optional<ChiTietThongBaoDto> layChiTietThongBao(String maThongBao) {
        String sql = """
                SELECT
                    tb.MaThongBao,
                    tb.MaLichTrinh,
                    tb.MaTaiKhoan,
                    tk.TenDangNhap,
                    cb.SoHieuChuyenBay,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    lt.NgayBay,
                    tb.TrangThaiMoi,
                    tb.GioUocTinhMoi,
                    tb.NoiDungThongBao,
                    tb.PhuongThucGui,
                    tb.TrangThaiGui,
                    tb.ThoiGianGui,
                    tb.MaCong,
                    c.TenCong,
                    tb.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                LEFT JOIN TAIKHOAN tk ON tb.MaTaiKhoan = tk.MaTaiKhoan
                LEFT JOIN CONG c ON tb.MaCong = c.MaCong
                LEFT JOIN BANGCHUYENHANHLY bc ON tb.MaBangChuyenHanhLy = bc.MaBangChuyenHanhLy
                WHERE tb.MaThongBao = ?
                """;
        List<ChiTietThongBaoDto> rows = jdbcTemplate.query(sql, this::mapChiTietThongBao, maThongBao);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void capNhatTrangThaiThongBao(String maThongBao, String trangThaiGui) {
        jdbcTemplate.update("""
                UPDATE THONGBAO
                SET TrangThaiGui = ?,
                    ThoiGianGui = CASE
                        WHEN ? = N'Đã gửi' THEN CURRENT_TIMESTAMP
                        ELSE ThoiGianGui
                    END
                WHERE MaThongBao = ?
                """, trangThaiGui, trangThaiGui, maThongBao);
    }

    public void taoThongBao(String maThongBao, TaoThongBaoThuCongRequest request) {
        jdbcTemplate.update("""
                INSERT INTO THONGBAO (
                    MaThongBao,
                    MaLichTrinh,
                    MaTaiKhoan,
                    MaCong,
                    MaBangChuyenHanhLy,
                    NoiDungThongBao,
                    TrangThaiMoi,
                    GioUocTinhMoi,
                    PhuongThucGui,
                    TrangThaiGui
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                maThongBao,
                request.maLichTrinh().trim(),
                request.maTaiKhoan().trim(),
                trimToNull(request.maCong()),
                trimToNull(request.maBangChuyenHanhLy()),
                request.noiDungThongBao().trim(),
                request.trangThaiMoi().trim(),
                request.gioUocTinhMoi() == null ? null : Timestamp.valueOf(request.gioUocTinhMoi()),
                request.phuongThucGui().trim(),
                request.trangThaiGui().trim());
    }

    public List<LichSuCapNhatDto> layDanhSachLichSu(String keyword, String maTaiKhoan, String trangThaiMoi,
                                                    LocalDate tuNgay, LocalDate denNgay) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    ls.MaLichSuCapNhat,
                    ls.MaLichTrinh,
                    ls.MaTaiKhoan,
                    tk.TenDangNhap,
                    cb.SoHieuChuyenBay,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    ls.TrangThaiCu,
                    ls.TrangThaiMoi,
                    ls.GioUocTinhCu,
                    ls.GioUocTinhMoi,
                    ls.SoPhutChamMoi,
                    ls.LyDoCapNhat,
                    ls.NoiDungCapNhat,
                    ls.ThoiGianCapNhat
                FROM LICHSUCAPNHAT ls
                JOIN LICHTRINH lt ON ls.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                JOIN TAIKHOAN tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();
        themBoLocLichSu(sql, params, keyword, maTaiKhoan, trangThaiMoi, tuNgay, denNgay);
        sql.append(" ORDER BY ls.ThoiGianCapNhat DESC, ls.MaLichSuCapNhat DESC");
        return jdbcTemplate.query(sql.toString(), this::mapLichSu, params.toArray());
    }

    public Optional<ChiTietLichSuCapNhatDto> layChiTietLichSu(String maLichSuCapNhat) {
        String sql = """
                SELECT
                    ls.MaLichSuCapNhat,
                    ls.MaLichTrinh,
                    ls.MaTaiKhoan,
                    tk.TenDangNhap,
                    cb.SoHieuChuyenBay,
                    hh.TenHangHangKhong,
                    cb.LoaiChuyenBay,
                    cb.DiemDi,
                    cb.DiemDen,
                    lt.NgayBay,
                    ls.TrangThaiCu,
                    ls.TrangThaiMoi,
                    ls.GioUocTinhCu,
                    ls.GioUocTinhMoi,
                    ls.SoPhutChamMoi,
                    ls.LyDoCapNhat,
                    ls.NoiDungCapNhat,
                    ls.ThoiGianCapNhat
                FROM LICHSUCAPNHAT ls
                JOIN LICHTRINH lt ON ls.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                JOIN TAIKHOAN tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
                WHERE ls.MaLichSuCapNhat = ?
                """;
        List<ChiTietLichSuCapNhatDto> rows = jdbcTemplate.query(sql, this::mapChiTietLichSu, maLichSuCapNhat);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<ThongBaoOptionDto> layTaiKhoanOptions() {
        return jdbcTemplate.query("""
                SELECT MaTaiKhoan, TenDangNhap, VaiTro, TrangThaiTaiKhoan
                FROM TAIKHOAN
                ORDER BY TenDangNhap
                """, (rs, rowNum) -> new ThongBaoOptionDto(
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("VaiTro"),
                "account",
                rs.getString("TrangThaiTaiKhoan")
        ));
    }

    public List<ThongBaoOptionDto> layLichTrinhOptions() {
        return jdbcTemplate.query("""
                SELECT lt.MaLichTrinh, cb.SoHieuChuyenBay, hh.TenHangHangKhong, lt.NgayBay, lt.TrangThaiHienTai
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                ORDER BY lt.NgayBay DESC, lt.GioDuKienKhoiHanh DESC
                """, (rs, rowNum) -> new ThongBaoOptionDto(
                rs.getString("MaLichTrinh"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("TenHangHangKhong") + " - " + formatDate(rs.getDate("NgayBay")),
                "schedule",
                rs.getString("TrangThaiHienTai")
        ));
    }

    public List<ThongBaoOptionDto> layCongOptions() {
        return jdbcTemplate.query("""
                SELECT MaCong, TenCong, TrangThaiCong
                FROM CONG
                ORDER BY MaCong
                """, (rs, rowNum) -> new ThongBaoOptionDto(
                rs.getString("MaCong"),
                rs.getString("TenCong"),
                null,
                "gate",
                rs.getString("TrangThaiCong")
        ));
    }

    public List<ThongBaoOptionDto> layBangChuyenOptions() {
        return jdbcTemplate.query("""
                SELECT MaBangChuyenHanhLy, TenBangChuyenHanhLy, TrangThaiBangChuyen
                FROM BANGCHUYENHANHLY
                ORDER BY MaBangChuyenHanhLy
                """, (rs, rowNum) -> new ThongBaoOptionDto(
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy"),
                null,
                "baggage",
                rs.getString("TrangThaiBangChuyen")
        ));
    }

    public boolean tonTaiThongBao(String maThongBao) {
        return dem("SELECT COUNT(*) FROM THONGBAO WHERE MaThongBao = ?", maThongBao) > 0;
    }

    public boolean tonTaiLichTrinh(String maLichTrinh) {
        return dem("SELECT COUNT(*) FROM LICHTRINH WHERE MaLichTrinh = ?", maLichTrinh) > 0;
    }

    public boolean tonTaiTaiKhoan(String maTaiKhoan) {
        return dem("SELECT COUNT(*) FROM TAIKHOAN WHERE MaTaiKhoan = ?", maTaiKhoan) > 0;
    }

    public boolean tonTaiCong(String maCong) {
        return dem("SELECT COUNT(*) FROM CONG WHERE MaCong = ?", maCong) > 0;
    }

    public boolean tonTaiBangChuyen(String maBangChuyenHanhLy) {
        return dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE MaBangChuyenHanhLy = ?", maBangChuyenHanhLy) > 0;
    }

    public String taoMaThongBaoMoi() {
        String sql = """
                SELECT TOP 1 MaThongBao
                FROM THONGBAO
                WHERE MaThongBao LIKE 'TB%'
                ORDER BY TRY_CAST(SUBSTRING(MaThongBao, 3, LEN(MaThongBao) - 2) AS INT) DESC
                """;
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("MaThongBao"));
        if (rows.isEmpty() || rows.get(0) == null) {
            return "TB01";
        }
        String current = rows.get(0);
        String digits = current.substring(2);
        int width = Math.max(2, digits.length());
        int number = Integer.parseInt(digits);
        return "TB" + String.format("%0" + width + "d", number + 1);
    }

    private void themBoLocThongBao(StringBuilder sql, List<Object> params, String keyword, String trangThaiGui,
                                   String phuongThucGui, String trangThaiMoi, LocalDate tuNgay, LocalDate denNgay) {
        if (hasText(keyword)) {
            sql.append("""
                     AND (
                        cb.SoHieuChuyenBay LIKE ?
                        OR hh.TenHangHangKhong LIKE ?
                        OR tk.TenDangNhap LIKE ?
                        OR tb.NoiDungThongBao LIKE ?
                        OR cb.DiemDi LIKE ?
                        OR cb.DiemDen LIKE ?
                     )
                    """);
            addLikeParams(params, keyword, 6);
        }
        if (hasText(trangThaiGui)) {
            sql.append(" AND tb.TrangThaiGui = ?");
            params.add(trangThaiGui.trim());
        }
        if (hasText(phuongThucGui)) {
            sql.append(" AND tb.PhuongThucGui = ?");
            params.add(phuongThucGui.trim());
        }
        if (hasText(trangThaiMoi)) {
            sql.append(" AND tb.TrangThaiMoi = ?");
            params.add(trangThaiMoi.trim());
        }
        if (tuNgay != null) {
            sql.append(" AND tb.ThoiGianGui >= ?");
            params.add(Timestamp.valueOf(tuNgay.atStartOfDay()));
        }
        if (denNgay != null) {
            sql.append(" AND tb.ThoiGianGui < ?");
            params.add(Timestamp.valueOf(denNgay.plusDays(1).atStartOfDay()));
        }
    }

    private void themBoLocLichSu(StringBuilder sql, List<Object> params, String keyword, String maTaiKhoan,
                                 String trangThaiMoi, LocalDate tuNgay, LocalDate denNgay) {
        if (hasText(keyword)) {
            sql.append("""
                     AND (
                        cb.SoHieuChuyenBay LIKE ?
                        OR hh.TenHangHangKhong LIKE ?
                        OR tk.TenDangNhap LIKE ?
                        OR ls.LyDoCapNhat LIKE ?
                        OR ls.NoiDungCapNhat LIKE ?
                        OR cb.DiemDi LIKE ?
                        OR cb.DiemDen LIKE ?
                     )
                    """);
            addLikeParams(params, keyword, 7);
        }
        if (hasText(maTaiKhoan)) {
            sql.append(" AND ls.MaTaiKhoan = ?");
            params.add(maTaiKhoan.trim());
        }
        if (hasText(trangThaiMoi)) {
            sql.append(" AND ls.TrangThaiMoi = ?");
            params.add(trangThaiMoi.trim());
        }
        if (tuNgay != null) {
            sql.append(" AND ls.ThoiGianCapNhat >= ?");
            params.add(Timestamp.valueOf(tuNgay.atStartOfDay()));
        }
        if (denNgay != null) {
            sql.append(" AND ls.ThoiGianCapNhat < ?");
            params.add(Timestamp.valueOf(denNgay.plusDays(1).atStartOfDay()));
        }
    }

    private ThongBaoDto mapThongBao(ResultSet rs, int rowNum) throws SQLException {
        return new ThongBaoDto(
                rs.getString("MaThongBao"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("TenHangHangKhong"),
                rs.getString("LoaiChuyenBay"),
                rs.getString("DiemDi"),
                rs.getString("DiemDen"),
                rs.getString("MaCong"),
                rs.getString("TenCong"),
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("NoiDungThongBao"),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                rs.getString("PhuongThucGui"),
                rs.getString("TrangThaiGui"),
                formatTimestamp(rs.getTimestamp("ThoiGianGui"))
        );
    }

    private ChiTietThongBaoDto mapChiTietThongBao(ResultSet rs, int rowNum) throws SQLException {
        return new ChiTietThongBaoDto(
                rs.getString("MaThongBao"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("TenHangHangKhong"),
                rs.getString("LoaiChuyenBay"),
                rs.getString("DiemDi"),
                rs.getString("DiemDen"),
                formatDate(rs.getDate("NgayBay")),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                rs.getString("NoiDungThongBao"),
                rs.getString("PhuongThucGui"),
                rs.getString("TrangThaiGui"),
                formatTimestamp(rs.getTimestamp("ThoiGianGui")),
                rs.getString("MaCong"),
                rs.getString("TenCong"),
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy")
        );
    }

    private LichSuCapNhatDto mapLichSu(ResultSet rs, int rowNum) throws SQLException {
        return new LichSuCapNhatDto(
                rs.getString("MaLichSuCapNhat"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("TenHangHangKhong"),
                rs.getString("LoaiChuyenBay"),
                rs.getString("DiemDi"),
                rs.getString("DiemDen"),
                rs.getString("TrangThaiCu"),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhCu")),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                toInteger(rs.getObject("SoPhutChamMoi")),
                rs.getString("LyDoCapNhat"),
                rs.getString("NoiDungCapNhat"),
                formatTimestamp(rs.getTimestamp("ThoiGianCapNhat"))
        );
    }

    private ChiTietLichSuCapNhatDto mapChiTietLichSu(ResultSet rs, int rowNum) throws SQLException {
        return new ChiTietLichSuCapNhatDto(
                rs.getString("MaLichSuCapNhat"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("TenHangHangKhong"),
                rs.getString("LoaiChuyenBay"),
                rs.getString("DiemDi"),
                rs.getString("DiemDen"),
                formatDate(rs.getDate("NgayBay")),
                rs.getString("TrangThaiCu"),
                rs.getString("TrangThaiMoi"),
                formatTimestamp(rs.getTimestamp("GioUocTinhCu")),
                formatTimestamp(rs.getTimestamp("GioUocTinhMoi")),
                toInteger(rs.getObject("SoPhutChamMoi")),
                rs.getString("LyDoCapNhat"),
                rs.getString("NoiDungCapNhat"),
                formatTimestamp(rs.getTimestamp("ThoiGianCapNhat"))
        );
    }

    private void addLikeParams(List<Object> params, String keyword, int count) {
        String likeKeyword = "%" + keyword.trim() + "%";
        for (int i = 0; i < count; i++) {
            params.add(likeKeyword);
        }
    }

    private Long dem(String sql, Object... params) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, params);
        return value == null ? 0L : value;
    }

    private String formatDate(Date date) {
        return date == null ? null : date.toLocalDate().format(DATE_FORMATTER);
    }

    private String formatTimestamp(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().format(DATE_TIME_FORMATTER);
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
