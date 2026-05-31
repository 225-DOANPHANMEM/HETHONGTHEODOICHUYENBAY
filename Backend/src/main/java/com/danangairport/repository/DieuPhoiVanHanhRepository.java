package com.danangairport.repository;

import com.danangairport.dto.BangChuyenOptionDto;
import com.danangairport.dto.CongOptionDto;
import com.danangairport.dto.LichTrinhDieuPhoiDto;
import com.danangairport.dto.LichSuCapNhatChuyenBayDto;
import com.danangairport.dto.PhanCongBangChuyenDto;
import com.danangairport.dto.PhanCongCongDto;
import com.danangairport.dto.TaoPhanCongBangChuyenRequest;
import com.danangairport.dto.TaoPhanCongCongRequest;
import com.danangairport.dto.ThongKeDieuPhoiDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@SuppressWarnings("java:S2077")
public class DieuPhoiVanHanhRepository {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final JdbcTemplate jdbcTemplate;

    public DieuPhoiVanHanhRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ThongKeDieuPhoiDto thongKe() {
        return new ThongKeDieuPhoiDto(
                dem("SELECT COUNT(*) FROM LICHTRINH WHERE TrangThaiHienTai <> ?", "Đã xóa"),
                dem("SELECT COUNT(DISTINCT MaLichTrinh) FROM PHANCONGCONG WHERE DangHienHanh = 1"),
                dem("""
                        SELECT COUNT(*)
                        FROM LICHTRINH lt
                        WHERE lt.TrangThaiHienTai <> ?
                          AND NOT EXISTS (
                              SELECT 1 FROM PHANCONGCONG pcc
                              WHERE pcc.MaLichTrinh = lt.MaLichTrinh
                                AND pcc.DangHienHanh = 1
                          )
                        """, "Đã xóa"),
                dem("SELECT COUNT(DISTINCT MaLichTrinh) FROM PHANCONGBANGCHUYEN WHERE DangHienHanh = 1"),
                dem("""
                        SELECT COUNT(*)
                        FROM LICHTRINH lt
                        WHERE lt.TrangThaiHienTai <> ?
                          AND NOT EXISTS (
                              SELECT 1 FROM PHANCONGBANGCHUYEN pcbc
                              WHERE pcbc.MaLichTrinh = lt.MaLichTrinh
                                AND pcbc.DangHienHanh = 1
                          )
                        """, "Đã xóa"),
                dem("SELECT COUNT(*) FROM CONG WHERE TrangThaiCong = ?", "Sẵn sàng"),
                dem("SELECT COUNT(*) FROM CONG WHERE TrangThaiCong = ?", "Đang dùng"),
                dem("SELECT COUNT(*) FROM CONG WHERE TrangThaiCong = ?", "Bảo trì"),
                dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE TrangThaiBangChuyen = ?", "Sẵn sàng"),
                dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE TrangThaiBangChuyen = ?", "Đang dùng"),
                dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE TrangThaiBangChuyen = ?", "Bảo trì")
        );
    }

    public List<LichTrinhDieuPhoiDto> layDanhSachLichTrinh(String keyword, LocalDate ngayBay, String loaiChuyenBay,
                                                            String trangThai, String tinhTrangCong, String tinhTrangBangChuyen) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    lt.MaLichTrinh,
                    cb.MaChuyenBay,
                    cb.SoHieuChuyenBay,
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
                    cong.MaPhanCongCong,
                    cong.MaCong,
                    cong.TenCong,
                    cong.TenNhaGa AS TenNhaGaCong,
                    cong.TrangThaiCong,
                    cong.ThoiGianBatDauSuDung AS ThoiGianBatDauSuDungCong,
                    cong.ThoiGianKetThucSuDung AS ThoiGianKetThucSuDungCong,
                    bc.MaPhanCongBangChuyen,
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    bc.TenNhaGa AS TenNhaGaBangChuyen,
                    bc.TrangThaiBangChuyen,
                    bc.ThoiGianBatDauSuDung AS ThoiGianBatDauSuDungBangChuyen,
                    bc.ThoiGianKetThucSuDung AS ThoiGianKetThucSuDungBangChuyen
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                OUTER APPLY (
                    SELECT TOP 1
                        pcc.MaPhanCongCong,
                        c.MaCong,
                        c.TenCong,
                        ng.TenNhaGa,
                        c.TrangThaiCong,
                        pcc.ThoiGianBatDauSuDung,
                        pcc.ThoiGianKetThucSuDung
                    FROM PHANCONGCONG pcc
                    JOIN CONG c ON pcc.MaCong = c.MaCong
                    JOIN NHAGA ng ON c.MaNhaGa = ng.MaNhaGa
                    WHERE pcc.MaLichTrinh = lt.MaLichTrinh
                      AND pcc.DangHienHanh = 1
                    ORDER BY pcc.ThoiGianBatDauSuDung DESC
                ) cong
                OUTER APPLY (
                    SELECT TOP 1
                        pcbc.MaPhanCongBangChuyen,
                        b.MaBangChuyenHanhLy,
                        b.TenBangChuyenHanhLy,
                        ng.TenNhaGa,
                        b.TrangThaiBangChuyen,
                        pcbc.ThoiGianBatDauSuDung,
                        pcbc.ThoiGianKetThucSuDung
                    FROM PHANCONGBANGCHUYEN pcbc
                    JOIN BANGCHUYENHANHLY b ON pcbc.MaBangChuyenHanhLy = b.MaBangChuyenHanhLy
                    JOIN NHAGA ng ON b.MaNhaGa = ng.MaNhaGa
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
        if (ngayBay != null) {
            sql.append(" AND CAST(lt.NgayBay AS DATE) = ?");
            params.add(Date.valueOf(ngayBay));
        }
        if (hasText(loaiChuyenBay)) {
            sql.append(" AND cb.LoaiChuyenBay = ?");
            params.add(loaiChuyenBay.trim());
        }
        if (hasText(trangThai)) {
            sql.append(" AND lt.TrangThaiHienTai = ?");
            params.add(trangThai.trim());
        }
        if ("da-phan-cong".equals(tinhTrangCong)) {
            sql.append(" AND cong.MaCong IS NOT NULL");
        } else if ("chua-phan-cong".equals(tinhTrangCong)) {
            sql.append(" AND cong.MaCong IS NULL");
        }
        if ("da-phan-cong".equals(tinhTrangBangChuyen)) {
            sql.append(" AND bc.MaBangChuyenHanhLy IS NOT NULL");
        } else if ("chua-phan-cong".equals(tinhTrangBangChuyen)) {
            sql.append(" AND bc.MaBangChuyenHanhLy IS NULL");
        }

        sql.append(" ORDER BY lt.NgayBay DESC, lt.GioDuKienKhoiHanh DESC");
        return jdbcTemplate.query(sql.toString(), this::mapLichTrinh, params.toArray());
    }

    public Optional<LichTrinhDieuPhoiDto> layChiTietLichTrinh(String maLichTrinh) {
        List<LichTrinhDieuPhoiDto> rows = layDanhSachLichTrinh(null, null, null, null, "tat-ca", "tat-ca")
                .stream()
                .filter(row -> row.maLichTrinh().equals(maLichTrinh))
                .toList();
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<PhanCongCongDto> layLichSuPhanCongCong(String maLichTrinh) {
        String sql = """
                SELECT
                    pcc.MaPhanCongCong,
                    pcc.MaLichTrinh,
                    pcc.MaCong,
                    c.TenCong,
                    ng.TenNhaGa,
                    pcc.LoaiCong,
                    pcc.ThoiGianBatDauSuDung,
                    pcc.ThoiGianKetThucSuDung,
                    pcc.DangHienHanh
                FROM PHANCONGCONG pcc
                JOIN CONG c ON pcc.MaCong = c.MaCong
                JOIN NHAGA ng ON c.MaNhaGa = ng.MaNhaGa
                WHERE pcc.MaLichTrinh = ?
                ORDER BY pcc.ThoiGianBatDauSuDung DESC
                """;
        return jdbcTemplate.query(sql, this::mapPhanCongCong, maLichTrinh);
    }

    public List<PhanCongBangChuyenDto> layLichSuPhanCongBangChuyen(String maLichTrinh) {
        String sql = """
                SELECT
                    pcbc.MaPhanCongBangChuyen,
                    pcbc.MaLichTrinh,
                    pcbc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    ng.TenNhaGa,
                    pcbc.ThoiGianBatDauSuDung,
                    pcbc.ThoiGianKetThucSuDung,
                    pcbc.DangHienHanh
                FROM PHANCONGBANGCHUYEN pcbc
                JOIN BANGCHUYENHANHLY bc ON pcbc.MaBangChuyenHanhLy = bc.MaBangChuyenHanhLy
                JOIN NHAGA ng ON bc.MaNhaGa = ng.MaNhaGa
                WHERE pcbc.MaLichTrinh = ?
                ORDER BY pcbc.ThoiGianBatDauSuDung DESC
                """;
        return jdbcTemplate.query(sql, this::mapPhanCongBangChuyen, maLichTrinh);
    }

    public List<LichSuCapNhatChuyenBayDto> layLichSuCapNhat(String maLichTrinh) {
        String sql = """
                SELECT TOP 10
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

    public List<CongOptionDto> layCongKhaDung(LocalDateTime batDau, LocalDateTime ketThuc, String maNhaGa, String maPhanCongBoQua) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    c.MaCong,
                    c.TenCong,
                    c.MaNhaGa,
                    ng.TenNhaGa,
                    ng.LoaiNhaGa,
                    c.TrangThaiCong,
                    CASE
                        WHEN c.TrangThaiCong <> N'Sẵn sàng' THEN 0
                        WHEN EXISTS (
                            SELECT 1
                            FROM PHANCONGCONG pcc
                            WHERE pcc.MaCong = c.MaCong
                              AND pcc.DangHienHanh = 1
                              AND (? < pcc.ThoiGianKetThucSuDung)
                              AND (? > pcc.ThoiGianBatDauSuDung)
                """);
        List<Object> params = new ArrayList<>();
        params.add(Timestamp.valueOf(batDau));
        params.add(Timestamp.valueOf(ketThuc));
        if (hasText(maPhanCongBoQua)) {
            sql.append(" AND pcc.MaPhanCongCong <> ?");
            params.add(maPhanCongBoQua.trim());
        }
        sql.append("""
                        ) THEN 0
                        ELSE 1
                    END AS CoSanSang
                FROM CONG c
                JOIN NHAGA ng ON c.MaNhaGa = ng.MaNhaGa
                WHERE c.TrangThaiCong = N'Sẵn sàng'
                """);
        if (hasText(maNhaGa)) {
            sql.append(" AND c.MaNhaGa = ?");
            params.add(maNhaGa.trim());
        }
        sql.append(" ORDER BY c.MaCong");
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            boolean coSanSang = rs.getInt("CoSanSang") == 1;
            String trangThai = rs.getString("TrangThaiCong");
            return new CongOptionDto(
                    rs.getString("MaCong"),
                    rs.getString("TenCong"),
                    rs.getString("MaNhaGa"),
                    rs.getString("TenNhaGa"),
                    rs.getString("LoaiNhaGa"),
                    trangThai,
                    coSanSang,
                    taoGhiChuTaiNguyen(coSanSang, trangThai)
            );
        }, params.toArray());
    }

    public List<BangChuyenOptionDto> layBangChuyenKhaDung(LocalDateTime batDau, LocalDateTime ketThuc, String maNhaGa, String maPhanCongBoQua) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    bc.MaNhaGa,
                    ng.TenNhaGa,
                    bc.TrangThaiBangChuyen,
                    CASE
                        WHEN bc.TrangThaiBangChuyen <> N'Sẵn sàng' THEN 0
                        WHEN EXISTS (
                            SELECT 1
                            FROM PHANCONGBANGCHUYEN pcbc
                            WHERE pcbc.MaBangChuyenHanhLy = bc.MaBangChuyenHanhLy
                              AND pcbc.DangHienHanh = 1
                              AND (? < pcbc.ThoiGianKetThucSuDung)
                              AND (? > pcbc.ThoiGianBatDauSuDung)
                """);
        List<Object> params = new ArrayList<>();
        params.add(Timestamp.valueOf(batDau));
        params.add(Timestamp.valueOf(ketThuc));
        if (hasText(maPhanCongBoQua)) {
            sql.append(" AND pcbc.MaPhanCongBangChuyen <> ?");
            params.add(maPhanCongBoQua.trim());
        }
        sql.append("""
                        ) THEN 0
                        ELSE 1
                    END AS CoSanSang
                FROM BANGCHUYENHANHLY bc
                JOIN NHAGA ng ON bc.MaNhaGa = ng.MaNhaGa
                WHERE bc.TrangThaiBangChuyen = N'Sẵn sàng'
                """);
        if (hasText(maNhaGa)) {
            sql.append(" AND bc.MaNhaGa = ?");
            params.add(maNhaGa.trim());
        }
        sql.append(" ORDER BY bc.MaBangChuyenHanhLy");
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            boolean coSanSang = rs.getInt("CoSanSang") == 1;
            String trangThai = rs.getString("TrangThaiBangChuyen");
            return new BangChuyenOptionDto(
                    rs.getString("MaBangChuyenHanhLy"),
                    rs.getString("TenBangChuyenHanhLy"),
                    rs.getString("MaNhaGa"),
                    rs.getString("TenNhaGa"),
                    trangThai,
                    coSanSang,
                    taoGhiChuTaiNguyen(coSanSang, trangThai)
            );
        }, params.toArray());
    }

    public void huyCongHienHanhTheoLichTrinh(String maLichTrinh) {
        jdbcTemplate.update("UPDATE PHANCONGCONG SET DangHienHanh = 0 WHERE MaLichTrinh = ? AND DangHienHanh = 1", maLichTrinh);
    }

    public void huyBangChuyenHienHanhTheoLichTrinh(String maLichTrinh) {
        jdbcTemplate.update("UPDATE PHANCONGBANGCHUYEN SET DangHienHanh = 0 WHERE MaLichTrinh = ? AND DangHienHanh = 1", maLichTrinh);
    }

    public void taoPhanCongCong(TaoPhanCongCongRequest request) {
        jdbcTemplate.update("""
                EXEC dbo.sp_PhanCongCongChoChuyenBay
                    @MaPhanCongCong = ?,
                    @MaLichTrinh = ?,
                    @MaCong = ?,
                    @LoaiCong = ?,
                    @ThoiGianBatDauSuDung = ?,
                    @ThoiGianKetThucSuDung = ?
                """,
                trimToNull(request.maPhanCongCong()),
                request.maLichTrinh().trim(),
                request.maCong().trim(),
                request.loaiCong().trim(),
                Timestamp.valueOf(request.thoiGianBatDauSuDung()),
                Timestamp.valueOf(request.thoiGianKetThucSuDung()));
    }

    public void taoPhanCongBangChuyen(TaoPhanCongBangChuyenRequest request) {
        jdbcTemplate.update("""
                EXEC dbo.sp_PhanCongBangChuyenChoChuyenBay
                    @MaPhanCongBangChuyen = ?,
                    @MaLichTrinh = ?,
                    @MaBangChuyenHanhLy = ?,
                    @ThoiGianBatDauSuDung = ?,
                    @ThoiGianKetThucSuDung = ?
                """,
                trimToNull(request.maPhanCongBangChuyen()),
                request.maLichTrinh().trim(),
                request.maBangChuyenHanhLy().trim(),
                Timestamp.valueOf(request.thoiGianBatDauSuDung()),
                Timestamp.valueOf(request.thoiGianKetThucSuDung()));
    }

    public Optional<PhanCongCongDto> layPhanCongCongMoiNhat(String maLichTrinh) {
        List<PhanCongCongDto> rows = layLichSuPhanCongCong(maLichTrinh);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<PhanCongBangChuyenDto> layPhanCongBangChuyenMoiNhat(String maLichTrinh) {
        List<PhanCongBangChuyenDto> rows = layLichSuPhanCongBangChuyen(maLichTrinh);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void huyPhanCongCong(String maPhanCongCong) {
        jdbcTemplate.update("UPDATE PHANCONGCONG SET DangHienHanh = 0 WHERE MaPhanCongCong = ?", maPhanCongCong);
    }

    public void huyPhanCongBangChuyen(String maPhanCongBangChuyen) {
        jdbcTemplate.update("UPDATE PHANCONGBANGCHUYEN SET DangHienHanh = 0 WHERE MaPhanCongBangChuyen = ?", maPhanCongBangChuyen);
    }

    public boolean tonTaiLichTrinh(String maLichTrinh) {
        return dem("SELECT COUNT(*) FROM LICHTRINH WHERE MaLichTrinh = ? AND TrangThaiHienTai <> ?", maLichTrinh, "Đã xóa") > 0;
    }

    public boolean tonTaiCong(String maCong) {
        return dem("SELECT COUNT(*) FROM CONG WHERE MaCong = ?", maCong) > 0;
    }

    public boolean tonTaiBangChuyen(String maBangChuyenHanhLy) {
        return dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE MaBangChuyenHanhLy = ?", maBangChuyenHanhLy) > 0;
    }

    public boolean tonTaiPhanCongCong(String maPhanCongCong) {
        return dem("SELECT COUNT(*) FROM PHANCONGCONG WHERE MaPhanCongCong = ?", maPhanCongCong) > 0;
    }

    public boolean tonTaiPhanCongBangChuyen(String maPhanCongBangChuyen) {
        return dem("SELECT COUNT(*) FROM PHANCONGBANGCHUYEN WHERE MaPhanCongBangChuyen = ?", maPhanCongBangChuyen) > 0;
    }

    public List<Map<String, Object>> layNhaGaOptions() {
        return jdbcTemplate.queryForList("""
                SELECT MaNhaGa AS maNhaGa, TenNhaGa AS tenNhaGa, LoaiNhaGa AS loaiNhaGa
                FROM NHAGA
                ORDER BY MaNhaGa
                """);
    }

    private LichTrinhDieuPhoiDto mapLichTrinh(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        String maCong = rs.getString("MaCong");
        String maBangChuyen = rs.getString("MaBangChuyenHanhLy");
        return new LichTrinhDieuPhoiDto(
                rs.getString("MaLichTrinh"),
                rs.getString("MaChuyenBay"),
                rs.getString("SoHieuChuyenBay"),
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
                rs.getString("MaPhanCongCong"),
                maCong,
                rs.getString("TenCong"),
                rs.getString("TenNhaGaCong"),
                rs.getString("TrangThaiCong"),
                formatTimestamp(rs.getTimestamp("ThoiGianBatDauSuDungCong")),
                formatTimestamp(rs.getTimestamp("ThoiGianKetThucSuDungCong")),
                rs.getString("MaPhanCongBangChuyen"),
                maBangChuyen,
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("TenNhaGaBangChuyen"),
                rs.getString("TrangThaiBangChuyen"),
                formatTimestamp(rs.getTimestamp("ThoiGianBatDauSuDungBangChuyen")),
                formatTimestamp(rs.getTimestamp("ThoiGianKetThucSuDungBangChuyen")),
                taoTrangThaiDieuPhoi(maCong, maBangChuyen)
        );
    }

    private PhanCongCongDto mapPhanCongCong(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new PhanCongCongDto(
                rs.getString("MaPhanCongCong"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaCong"),
                rs.getString("TenCong"),
                rs.getString("TenNhaGa"),
                rs.getString("LoaiCong"),
                formatTimestamp(rs.getTimestamp("ThoiGianBatDauSuDung")),
                formatTimestamp(rs.getTimestamp("ThoiGianKetThucSuDung")),
                rs.getBoolean("DangHienHanh")
        );
    }

    private PhanCongBangChuyenDto mapPhanCongBangChuyen(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new PhanCongBangChuyenDto(
                rs.getString("MaPhanCongBangChuyen"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("TenNhaGa"),
                formatTimestamp(rs.getTimestamp("ThoiGianBatDauSuDung")),
                formatTimestamp(rs.getTimestamp("ThoiGianKetThucSuDung")),
                rs.getBoolean("DangHienHanh")
        );
    }

    private String taoTrangThaiDieuPhoi(String maCong, String maBangChuyen) {
        if (maCong != null && maBangChuyen != null) {
            return "Đã phân công đủ";
        }
        if (maCong != null) {
            return "Thiếu băng chuyền";
        }
        if (maBangChuyen != null) {
            return "Thiếu cổng";
        }
        return "Chưa phân công";
    }

    private String taoGhiChuTaiNguyen(boolean coSanSang, String trangThai) {
        if (coSanSang) {
            return "Có thể phân công";
        }
        if (!"Sẵn sàng".equals(trangThai)) {
            return "Tài nguyên không ở trạng thái sẵn sàng";
        }
        return "Tài nguyên bị trùng lịch trong khoảng thời gian này";
    }

    private Long dem(String sql, Object... params) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, params);
        return value == null ? 0L : value;
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private String formatDate(Date date) {
        return date == null ? null : date.toLocalDate().format(DATE_FORMATTER);
    }

    private String formatTimestamp(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().format(DATE_TIME_FORMATTER);
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
