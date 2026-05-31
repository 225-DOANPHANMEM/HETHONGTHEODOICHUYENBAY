package com.danangairport.repository;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Repository
public class AdminAuthRepository {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final JdbcTemplate jdbcTemplate;

    public AdminAuthRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void taoBangKhoiPhucMatKhauNeuChuaCo() {
        jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.TAIKHOAN_KHOIPHUC_MATKHAU', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.TAIKHOAN_KHOIPHUC_MATKHAU (
                        MaYeuCau VARCHAR(20) NOT NULL PRIMARY KEY,
                        MaTaiKhoan VARCHAR(10) NOT NULL,
                        Email VARCHAR(50) NOT NULL,
                        MaXacThuc VARCHAR(10) NOT NULL,
                        TrangThaiYeuCau NVARCHAR(30) NOT NULL,
                        ThoiGianYeuCau DATETIME NOT NULL CONSTRAINT DF_TKKPMK_ThoiGianYeuCau DEFAULT GETDATE(),
                        ThoiGianHetHan DATETIME NOT NULL,
                        ThoiGianSuDung DATETIME NULL,
                        GhiChu NVARCHAR(200) NULL,
                        CONSTRAINT FK_TKKPMK_TAIKHOAN FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TAIKHOAN(MaTaiKhoan)
                    )
                END
                """);
    }

    public Optional<AdminAccountRecord> timTheoTenDangNhapHoacEmail(String usernameOrEmail) {
        String sql = """
                SELECT TOP 1 MaTaiKhoan, TenDangNhap, Email, MatKhau, VaiTro, TrangThaiTaiKhoan
                FROM TAIKHOAN
                WHERE TenDangNhap = ? OR Email = ?
                """;
        List<AdminAccountRecord> rows = jdbcTemplate.query(sql, this::mapAccount, usernameOrEmail, usernameOrEmail);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<AdminAccountRecord> timTheoEmail(String email) {
        String sql = """
                SELECT TOP 1 MaTaiKhoan, TenDangNhap, Email, MatKhau, VaiTro, TrangThaiTaiKhoan
                FROM TAIKHOAN
                WHERE Email = ?
                """;
        List<AdminAccountRecord> rows = jdbcTemplate.query(sql, this::mapAccount, email);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public String taoMaYeuCauMoi() {
        String sql = """
                SELECT TOP 1 MaYeuCau
                FROM TAIKHOAN_KHOIPHUC_MATKHAU
                WHERE MaYeuCau LIKE 'KPMK%'
                ORDER BY TRY_CAST(SUBSTRING(MaYeuCau, 5, LEN(MaYeuCau) - 4) AS INT) DESC
                """;
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("MaYeuCau"));
        if (rows.isEmpty()) {
            return "KPMK000001";
        }
        int number = Integer.parseInt(rows.get(0).substring(4));
        return "KPMK" + String.format("%06d", number + 1);
    }

    public void taoYeuCauKhoiPhuc(String maYeuCau, AdminAccountRecord account, String maXacThuc, LocalDateTime thoiGianHetHan) {
        String sql = """
                INSERT INTO TAIKHOAN_KHOIPHUC_MATKHAU
                    (MaYeuCau, MaTaiKhoan, Email, MaXacThuc, TrangThaiYeuCau, ThoiGianYeuCau, ThoiGianHetHan, GhiChu)
                VALUES (?, ?, ?, ?, ?, GETDATE(), ?, ?)
                """;
        jdbcTemplate.update(
                sql,
                maYeuCau,
                account.maTaiKhoan(),
                account.email(),
                maXacThuc,
                "Đã cấp mã",
                Timestamp.valueOf(thoiGianHetHan),
                "Demo: hệ thống tự cấp mã xác thực, chưa cấu hình SMTP."
        );
    }

    public Optional<PasswordResetRecord> timYeuCauMoiNhatTheoEmailVaMa(String email, String maXacThuc) {
        String sql = """
                SELECT TOP 1 MaYeuCau, MaTaiKhoan, Email, MaXacThuc, TrangThaiYeuCau, ThoiGianHetHan, ThoiGianSuDung
                FROM TAIKHOAN_KHOIPHUC_MATKHAU
                WHERE Email = ? AND MaXacThuc = ?
                ORDER BY ThoiGianYeuCau DESC
                """;
        List<PasswordResetRecord> rows = jdbcTemplate.query(sql, this::mapResetRecord, email, maXacThuc);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void danhDauHetHan(String maYeuCau) {
        jdbcTemplate.update(
                "UPDATE TAIKHOAN_KHOIPHUC_MATKHAU SET TrangThaiYeuCau = ? WHERE MaYeuCau = ? AND ThoiGianSuDung IS NULL",
                "Hết hạn",
                maYeuCau
        );
    }

    public void capNhatMatKhau(String maTaiKhoan, String matKhauMoi) {
        jdbcTemplate.update("UPDATE TAIKHOAN SET MatKhau = ? WHERE MaTaiKhoan = ?", matKhauMoi, maTaiKhoan);
    }

    public void danhDauDaSuDung(String maYeuCau) {
        jdbcTemplate.update(
                "UPDATE TAIKHOAN_KHOIPHUC_MATKHAU SET TrangThaiYeuCau = ?, ThoiGianSuDung = GETDATE() WHERE MaYeuCau = ?",
                "Đã sử dụng",
                maYeuCau
        );
    }

    public String dinhDangThoiGian(LocalDateTime value) {
        return value == null ? null : value.format(DATE_TIME_FORMATTER);
    }

    private AdminAccountRecord mapAccount(ResultSet rs, int rowNum) throws SQLException {
        return new AdminAccountRecord(
                rs.getString("MaTaiKhoan"),
                rs.getString("TenDangNhap"),
                rs.getString("Email"),
                rs.getString("MatKhau"),
                rs.getString("VaiTro"),
                rs.getString("TrangThaiTaiKhoan")
        );
    }

    private PasswordResetRecord mapResetRecord(ResultSet rs, int rowNum) throws SQLException {
        Timestamp hetHan = rs.getTimestamp("ThoiGianHetHan");
        Timestamp suDung = rs.getTimestamp("ThoiGianSuDung");
        return new PasswordResetRecord(
                rs.getString("MaYeuCau"),
                rs.getString("MaTaiKhoan"),
                rs.getString("Email"),
                rs.getString("MaXacThuc"),
                rs.getString("TrangThaiYeuCau"),
                hetHan == null ? null : hetHan.toLocalDateTime(),
                suDung == null ? null : suDung.toLocalDateTime()
        );
    }

    public record AdminAccountRecord(
            String maTaiKhoan,
            String tenDangNhap,
            String email,
            String matKhau,
            String vaiTro,
            String trangThaiTaiKhoan
    ) {
    }

    public record PasswordResetRecord(
            String maYeuCau,
            String maTaiKhoan,
            String email,
            String maXacThuc,
            String trangThaiYeuCau,
            LocalDateTime thoiGianHetHan,
            LocalDateTime thoiGianSuDung
    ) {
    }
}
