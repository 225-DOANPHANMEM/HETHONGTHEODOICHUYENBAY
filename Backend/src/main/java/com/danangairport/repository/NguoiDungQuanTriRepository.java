package com.danangairport.repository;

import com.danangairport.dto.CapNhatNguoiDungRequest;
import com.danangairport.dto.NguoiDungDto;
import com.danangairport.dto.TaoNguoiDungRequest;
import com.danangairport.dto.ThongKeNguoiDungDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@SuppressWarnings("java:S2077")
public class NguoiDungQuanTriRepository {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Map<String, String> LEGACY_TEXT = Map.of(
            "Quản trị", "Quáº£n trá»‹",
            "Điều phối", "Äiá»u phá»‘i",
            "Khách hàng", "KhÃ¡ch hÃ ng",
            "Hoạt động", "Hoáº¡t Ä‘á»™ng",
            "Khóa", "KhÃ³a",
            "Ngừng sử dụng", "Ngá»«ng sá»­ dá»¥ng"
    );
    private final JdbcTemplate jdbcTemplate;

    public NguoiDungQuanTriRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<NguoiDungDto> layDanhSach(String keyword, String vaiTro, String trangThai) {
        StringBuilder sql = new StringBuilder("""
                SELECT MaTaiKhoan, TenDangNhap, SoDienThoai, Email, VaiTro, TrangThaiTaiKhoan, NgayTao
                FROM TAIKHOAN
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            sql.append(" AND (TenDangNhap LIKE ? OR Email LIKE ? OR SoDienThoai LIKE ?)");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (vaiTro != null && !vaiTro.isBlank()) {
            sql.append(" AND VaiTro IN (?, ?)");
            String normalizedRole = vaiTro.trim();
            params.add(normalizedRole);
            params.add(legacyText(normalizedRole));
        }
        if (trangThai != null && !trangThai.isBlank()) {
            sql.append(" AND TrangThaiTaiKhoan IN (?, ?)");
            String normalizedStatus = trangThai.trim();
            params.add(normalizedStatus);
            params.add(legacyText(normalizedStatus));
        }
        sql.append(" ORDER BY NgayTao DESC");

        return jdbcTemplate.query(sql.toString(), this::mapNguoiDungDto, params.toArray());
    }

    public Optional<NguoiDungDto> layChiTiet(String maTaiKhoan) {
        String sql = """
                SELECT MaTaiKhoan, TenDangNhap, SoDienThoai, Email, VaiTro, TrangThaiTaiKhoan, NgayTao
                FROM TAIKHOAN
                WHERE MaTaiKhoan = ?
                """;
        List<NguoiDungDto> rows = jdbcTemplate.query(sql, this::mapNguoiDungDto, maTaiKhoan);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public ThongKeNguoiDungDto thongKe() {
        ThongKeNguoiDungDto dto = new ThongKeNguoiDungDto();
        dto.setTongTaiKhoan(dem("SELECT COUNT(*) FROM TAIKHOAN"));
        dto.setSoHoatDong(demTheoGiaTri("TrangThaiTaiKhoan", "Hoạt động"));
        dto.setSoBiKhoa(demTheoGiaTri("TrangThaiTaiKhoan", "Khóa"));
        dto.setSoNgungSuDung(demTheoGiaTri("TrangThaiTaiKhoan", "Ngừng sử dụng"));
        dto.setSoQuanTri(demTheoGiaTri("VaiTro", "Quản trị"));
        dto.setSoDieuPhoi(demTheoGiaTri("VaiTro", "Điều phối"));
        dto.setSoKhachHang(demTheoGiaTri("VaiTro", "Khách hàng"));
        return dto;
    }

    public boolean tonTaiMaTaiKhoan(String maTaiKhoan) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM TAIKHOAN WHERE MaTaiKhoan = ?", Long.class, maTaiKhoan);
        return count != null && count > 0;
    }

    public boolean tonTaiTenDangNhap(String tenDangNhap) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM TAIKHOAN WHERE TenDangNhap = ?", Long.class, tenDangNhap);
        return count != null && count > 0;
    }

    public boolean tonTaiEmail(String email) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM TAIKHOAN WHERE Email = ?", Long.class, email);
        return count != null && count > 0;
    }

    public boolean tonTaiEmailKhacMa(String email, String maTaiKhoan) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM TAIKHOAN WHERE Email = ? AND MaTaiKhoan <> ?", Long.class, email, maTaiKhoan);
        return count != null && count > 0;
    }

    public String taoMaTaiKhoanMoi() {
        String sql = """
                SELECT TOP 1 MaTaiKhoan
                FROM TAIKHOAN
                WHERE MaTaiKhoan LIKE 'TK%'
                ORDER BY TRY_CAST(SUBSTRING(MaTaiKhoan, 3, LEN(MaTaiKhoan) - 2) AS INT) DESC
                """;
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("MaTaiKhoan"));
        if (rows.isEmpty()) {
            return "TK001";
        }
        String current = rows.get(0);
        int number = Integer.parseInt(current.substring(2));
        return "TK" + String.format("%03d", number + 1);
    }

    public void themNguoiDung(String maTaiKhoan, TaoNguoiDungRequest request, String matKhauLuu) {
        String sql = """
                INSERT INTO TAIKHOAN (MaTaiKhoan, TenDangNhap, MatKhau, SoDienThoai, Email, VaiTro, TrangThaiTaiKhoan, NgayTao)
                VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
                """;
        jdbcTemplate.update(
                sql,
                maTaiKhoan,
                request.getTenDangNhap().trim(),
                matKhauLuu,
                trimToNull(request.getSoDienThoai()),
                trimToNull(request.getEmail()),
                request.getVaiTro().trim(),
                request.getTrangThaiTaiKhoan().trim()
        );
    }

    public void capNhatNguoiDung(String maTaiKhoan, CapNhatNguoiDungRequest request) {
        String sql = """
                UPDATE TAIKHOAN
                SET SoDienThoai = ?, Email = ?, VaiTro = ?, TrangThaiTaiKhoan = ?
                WHERE MaTaiKhoan = ?
                """;
        jdbcTemplate.update(
                sql,
                trimToNull(request.getSoDienThoai()),
                trimToNull(request.getEmail()),
                request.getVaiTro().trim(),
                request.getTrangThaiTaiKhoan().trim(),
                maTaiKhoan
        );
    }

    public void capNhatTrangThai(String maTaiKhoan, String trangThai) {
        jdbcTemplate.update("UPDATE TAIKHOAN SET TrangThaiTaiKhoan = ? WHERE MaTaiKhoan = ?", trangThai, maTaiKhoan);
    }

    public void datLaiMatKhau(String maTaiKhoan, String matKhauMoi) {
        jdbcTemplate.update("UPDATE TAIKHOAN SET MatKhau = ? WHERE MaTaiKhoan = ?", matKhauMoi, maTaiKhoan);
    }

    private Long dem(String sql) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class);
        return value == null ? 0L : value;
    }

    private Long demTheoGiaTri(String column, String value) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM TAIKHOAN WHERE " + column + " IN (?, ?)",
                Long.class,
                value,
                legacyText(value)
        );
        return count == null ? 0L : count;
    }

    private String legacyText(String value) {
        return LEGACY_TEXT.getOrDefault(value, value);
    }

    private NguoiDungDto mapNguoiDungDto(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Timestamp ngayTao = rs.getTimestamp("NgayTao");
        return new NguoiDungDto(
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("SoDienThoai"),
                rs.getString("Email"),
                rs.getString("VaiTro"),
                rs.getString("TrangThaiTaiKhoan"),
                ngayTao == null ? null : ngayTao.toLocalDateTime().format(DATE_TIME_FORMATTER)
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
