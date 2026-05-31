package com.danangairport.repository;

import com.danangairport.dto.BangChuyenHanhLyDto;
import com.danangairport.dto.CapNhatBangChuyenRequest;
import com.danangairport.dto.CapNhatCongRequest;
import com.danangairport.dto.CapNhatHangHangKhongRequest;
import com.danangairport.dto.CapNhatNhaGaRequest;
import com.danangairport.dto.CongDto;
import com.danangairport.dto.HangHangKhongDto;
import com.danangairport.dto.NhaGaDto;
import com.danangairport.dto.TaoBangChuyenRequest;
import com.danangairport.dto.TaoCongRequest;
import com.danangairport.dto.TaoHangHangKhongRequest;
import com.danangairport.dto.TaoNhaGaRequest;
import com.danangairport.dto.ThongKeDanhMucVanHanhDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@SuppressWarnings("java:S2077")
public class DanhMucVanHanhRepository {
    private final JdbcTemplate jdbcTemplate;

    public DanhMucVanHanhRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ThongKeDanhMucVanHanhDto thongKe() {
        return new ThongKeDanhMucVanHanhDto(
                dem("SELECT COUNT(*) FROM HANGHANGKHONG"),
                dem("SELECT COUNT(*) FROM NHAGA"),
                dem("SELECT COUNT(*) FROM CONG"),
                dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY"),
                demTheoTrangThai("CONG", "TrangThaiCong", "Sẵn sàng"),
                demTheoTrangThai("CONG", "TrangThaiCong", "Đang dùng"),
                demTheoTrangThai("CONG", "TrangThaiCong", "Bảo trì"),
                demTheoTrangThai("CONG", "TrangThaiCong", "Đóng"),
                demTheoTrangThai("BANGCHUYENHANHLY", "TrangThaiBangChuyen", "Sẵn sàng"),
                demTheoTrangThai("BANGCHUYENHANHLY", "TrangThaiBangChuyen", "Đang dùng"),
                demTheoTrangThai("BANGCHUYENHANHLY", "TrangThaiBangChuyen", "Bảo trì"),
                demTheoTrangThai("BANGCHUYENHANHLY", "TrangThaiBangChuyen", "Đóng")
        );
    }

    public List<HangHangKhongDto> layDanhSachHangHangKhong(String keyword, String quocGia) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    hh.MaHangHangKhong,
                    hh.MaHang,
                    hh.TenHangHangKhong,
                    hh.QuocGia,
                    COUNT(cb.MaChuyenBay) AS SoChuyenBay
                FROM HANGHANGKHONG hh
                LEFT JOIN CHUYENBAY cb ON hh.MaHangHangKhong = cb.MaHangHangKhong
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (hasText(keyword)) {
            sql.append(" AND (hh.MaHangHangKhong LIKE ? OR hh.MaHang LIKE ? OR hh.TenHangHangKhong LIKE ? OR hh.QuocGia LIKE ?)");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (hasText(quocGia)) {
            sql.append(" AND hh.QuocGia = ?");
            params.add(quocGia.trim());
        }

        sql.append("""
                GROUP BY hh.MaHangHangKhong, hh.MaHang, hh.TenHangHangKhong, hh.QuocGia
                ORDER BY hh.MaHangHangKhong
                """);
        return jdbcTemplate.query(sql.toString(), this::mapHangHangKhong, params.toArray());
    }

    public Optional<HangHangKhongDto> layChiTietHangHangKhong(String maHangHangKhong) {
        String sql = """
                SELECT
                    hh.MaHangHangKhong,
                    hh.MaHang,
                    hh.TenHangHangKhong,
                    hh.QuocGia,
                    COUNT(cb.MaChuyenBay) AS SoChuyenBay
                FROM HANGHANGKHONG hh
                LEFT JOIN CHUYENBAY cb ON hh.MaHangHangKhong = cb.MaHangHangKhong
                WHERE hh.MaHangHangKhong = ?
                GROUP BY hh.MaHangHangKhong, hh.MaHang, hh.TenHangHangKhong, hh.QuocGia
                """;
        List<HangHangKhongDto> rows = jdbcTemplate.query(sql, this::mapHangHangKhong, maHangHangKhong);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void themHangHangKhong(String maHangHangKhong, TaoHangHangKhongRequest request) {
        String sql = """
                INSERT INTO HANGHANGKHONG (MaHangHangKhong, MaHang, TenHangHangKhong, QuocGia)
                VALUES (?, ?, ?, ?)
                """;
        jdbcTemplate.update(sql, maHangHangKhong, request.maHang().trim(), request.tenHangHangKhong().trim(), trimToNull(request.quocGia()));
    }

    public void capNhatHangHangKhong(String maHangHangKhong, CapNhatHangHangKhongRequest request) {
        String sql = """
                UPDATE HANGHANGKHONG
                SET MaHang = ?, TenHangHangKhong = ?, QuocGia = ?
                WHERE MaHangHangKhong = ?
                """;
        jdbcTemplate.update(sql, request.maHang().trim(), request.tenHangHangKhong().trim(), trimToNull(request.quocGia()), maHangHangKhong);
    }

    public void xoaHangHangKhong(String maHangHangKhong) {
        jdbcTemplate.update("DELETE FROM HANGHANGKHONG WHERE MaHangHangKhong = ?", maHangHangKhong);
    }

    public boolean tonTaiHangHangKhong(String maHangHangKhong) {
        return dem("SELECT COUNT(*) FROM HANGHANGKHONG WHERE MaHangHangKhong = ?", maHangHangKhong) > 0;
    }

    public boolean tonTaiMaHang(String maHang) {
        return dem("SELECT COUNT(*) FROM HANGHANGKHONG WHERE MaHang = ?", maHang) > 0;
    }

    public boolean tonTaiMaHangKhac(String maHang, String maHangHangKhong) {
        return dem("SELECT COUNT(*) FROM HANGHANGKHONG WHERE MaHang = ? AND MaHangHangKhong <> ?", maHang, maHangHangKhong) > 0;
    }

    public long demChuyenBayTheoHang(String maHangHangKhong) {
        return dem("SELECT COUNT(*) FROM CHUYENBAY WHERE MaHangHangKhong = ?", maHangHangKhong);
    }

    public String taoMaHangHangKhongMoi() {
        return taoMaMoi("HHK", "HANGHANGKHONG", "MaHangHangKhong");
    }

    public List<NhaGaDto> layDanhSachNhaGa(String keyword, String loaiNhaGa) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    ng.MaNhaGa,
                    ng.TenNhaGa,
                    ng.LoaiNhaGa,
                    ng.MoTa,
                    COUNT(DISTINCT c.MaCong) AS SoCong,
                    COUNT(DISTINCT bc.MaBangChuyenHanhLy) AS SoBangChuyen
                FROM NHAGA ng
                LEFT JOIN CONG c ON ng.MaNhaGa = c.MaNhaGa
                LEFT JOIN BANGCHUYENHANHLY bc ON ng.MaNhaGa = bc.MaNhaGa
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (hasText(keyword)) {
            sql.append(" AND (ng.MaNhaGa LIKE ? OR ng.TenNhaGa LIKE ? OR ng.LoaiNhaGa LIKE ? OR ng.MoTa LIKE ?)");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (hasText(loaiNhaGa)) {
            sql.append(" AND ng.LoaiNhaGa = ?");
            params.add(loaiNhaGa.trim());
        }

        sql.append("""
                GROUP BY ng.MaNhaGa, ng.TenNhaGa, ng.LoaiNhaGa, ng.MoTa
                ORDER BY ng.MaNhaGa
                """);
        return jdbcTemplate.query(sql.toString(), this::mapNhaGa, params.toArray());
    }

    public Optional<NhaGaDto> layChiTietNhaGa(String maNhaGa) {
        String sql = """
                SELECT
                    ng.MaNhaGa,
                    ng.TenNhaGa,
                    ng.LoaiNhaGa,
                    ng.MoTa,
                    COUNT(DISTINCT c.MaCong) AS SoCong,
                    COUNT(DISTINCT bc.MaBangChuyenHanhLy) AS SoBangChuyen
                FROM NHAGA ng
                LEFT JOIN CONG c ON ng.MaNhaGa = c.MaNhaGa
                LEFT JOIN BANGCHUYENHANHLY bc ON ng.MaNhaGa = bc.MaNhaGa
                WHERE ng.MaNhaGa = ?
                GROUP BY ng.MaNhaGa, ng.TenNhaGa, ng.LoaiNhaGa, ng.MoTa
                """;
        List<NhaGaDto> rows = jdbcTemplate.query(sql, this::mapNhaGa, maNhaGa);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<Map<String, Object>> layNhaGaOptions() {
        return jdbcTemplate.queryForList("""
                SELECT MaNhaGa AS maNhaGa, TenNhaGa AS tenNhaGa, LoaiNhaGa AS loaiNhaGa
                FROM NHAGA
                ORDER BY MaNhaGa
                """);
    }

    public void themNhaGa(String maNhaGa, TaoNhaGaRequest request) {
        String sql = """
                INSERT INTO NHAGA (MaNhaGa, TenNhaGa, LoaiNhaGa, MoTa)
                VALUES (?, ?, ?, ?)
                """;
        jdbcTemplate.update(sql, maNhaGa, request.tenNhaGa().trim(), request.loaiNhaGa().trim(), trimToNull(request.moTa()));
    }

    public void capNhatNhaGa(String maNhaGa, CapNhatNhaGaRequest request) {
        String sql = """
                UPDATE NHAGA
                SET TenNhaGa = ?, LoaiNhaGa = ?, MoTa = ?
                WHERE MaNhaGa = ?
                """;
        jdbcTemplate.update(sql, request.tenNhaGa().trim(), request.loaiNhaGa().trim(), trimToNull(request.moTa()), maNhaGa);
    }

    public void xoaNhaGa(String maNhaGa) {
        jdbcTemplate.update("DELETE FROM NHAGA WHERE MaNhaGa = ?", maNhaGa);
    }

    public boolean tonTaiNhaGa(String maNhaGa) {
        return dem("SELECT COUNT(*) FROM NHAGA WHERE MaNhaGa = ?", maNhaGa) > 0;
    }

    public long demTaiNguyenTheoNhaGa(String maNhaGa) {
        return dem("SELECT COUNT(*) FROM CONG WHERE MaNhaGa = ?", maNhaGa)
                + dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE MaNhaGa = ?", maNhaGa);
    }

    public String taoMaNhaGaMoi() {
        return taoMaMoi("NG", "NHAGA", "MaNhaGa");
    }

    public List<CongDto> layDanhSachCong(String keyword, String maNhaGa, String trangThaiCong) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    c.MaCong,
                    c.MaNhaGa,
                    ng.TenNhaGa,
                    c.TenCong,
                    c.TrangThaiCong,
                    COUNT(pcc.MaPhanCongCong) AS SoLanPhanCong
                FROM CONG c
                JOIN NHAGA ng ON c.MaNhaGa = ng.MaNhaGa
                LEFT JOIN PHANCONGCONG pcc ON c.MaCong = pcc.MaCong
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (hasText(keyword)) {
            sql.append(" AND (c.MaCong LIKE ? OR c.TenCong LIKE ? OR ng.TenNhaGa LIKE ? OR c.TrangThaiCong LIKE ?)");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (hasText(maNhaGa)) {
            sql.append(" AND c.MaNhaGa = ?");
            params.add(maNhaGa.trim());
        }
        if (hasText(trangThaiCong)) {
            sql.append(" AND c.TrangThaiCong = ?");
            params.add(trangThaiCong.trim());
        }

        sql.append("""
                GROUP BY c.MaCong, c.MaNhaGa, ng.TenNhaGa, c.TenCong, c.TrangThaiCong
                ORDER BY c.MaCong
                """);
        return jdbcTemplate.query(sql.toString(), this::mapCong, params.toArray());
    }

    public Optional<CongDto> layChiTietCong(String maCong) {
        String sql = """
                SELECT
                    c.MaCong,
                    c.MaNhaGa,
                    ng.TenNhaGa,
                    c.TenCong,
                    c.TrangThaiCong,
                    COUNT(pcc.MaPhanCongCong) AS SoLanPhanCong
                FROM CONG c
                JOIN NHAGA ng ON c.MaNhaGa = ng.MaNhaGa
                LEFT JOIN PHANCONGCONG pcc ON c.MaCong = pcc.MaCong
                WHERE c.MaCong = ?
                GROUP BY c.MaCong, c.MaNhaGa, ng.TenNhaGa, c.TenCong, c.TrangThaiCong
                """;
        List<CongDto> rows = jdbcTemplate.query(sql, this::mapCong, maCong);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void themCong(String maCong, TaoCongRequest request) {
        String sql = """
                INSERT INTO CONG (MaCong, MaNhaGa, TenCong, TrangThaiCong)
                VALUES (?, ?, ?, ?)
                """;
        jdbcTemplate.update(sql, maCong, request.maNhaGa().trim(), request.tenCong().trim(), request.trangThaiCong().trim());
    }

    public void capNhatCong(String maCong, CapNhatCongRequest request) {
        String sql = """
                UPDATE CONG
                SET MaNhaGa = ?, TenCong = ?, TrangThaiCong = ?
                WHERE MaCong = ?
                """;
        jdbcTemplate.update(sql, request.maNhaGa().trim(), request.tenCong().trim(), request.trangThaiCong().trim(), maCong);
    }

    public void capNhatTrangThaiCong(String maCong, String trangThaiCong) {
        jdbcTemplate.update("UPDATE CONG SET TrangThaiCong = ? WHERE MaCong = ?", trangThaiCong, maCong);
    }

    public void xoaCong(String maCong) {
        jdbcTemplate.update("DELETE FROM CONG WHERE MaCong = ?", maCong);
    }

    public boolean tonTaiCong(String maCong) {
        return dem("SELECT COUNT(*) FROM CONG WHERE MaCong = ?", maCong) > 0;
    }

    public boolean tonTaiTenCong(String tenCong) {
        return dem("SELECT COUNT(*) FROM CONG WHERE LOWER(TenCong) = LOWER(?)", tenCong) > 0;
    }

    public boolean tonTaiTenCongKhac(String tenCong, String maCong) {
        return dem("SELECT COUNT(*) FROM CONG WHERE LOWER(TenCong) = LOWER(?) AND MaCong <> ?", tenCong, maCong) > 0;
    }

    public long demLienKetCong(String maCong) {
        long total = dem("SELECT COUNT(*) FROM PHANCONGCONG WHERE MaCong = ?", maCong);
        if (tonTaiCot("THONGBAO", "MaCong")) {
            total += dem("SELECT COUNT(*) FROM THONGBAO WHERE MaCong = ?", maCong);
        }
        return total;
    }

    public String taoMaCongMoi() {
        return taoMaMoi("G", "CONG", "MaCong");
    }

    public List<BangChuyenHanhLyDto> layDanhSachBangChuyen(String keyword, String maNhaGa, String trangThaiBangChuyen) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    bc.TrangThaiBangChuyen,
                    bc.MaNhaGa,
                    ng.TenNhaGa,
                    COUNT(pcbc.MaPhanCongBangChuyen) AS SoLanPhanCong
                FROM BANGCHUYENHANHLY bc
                JOIN NHAGA ng ON bc.MaNhaGa = ng.MaNhaGa
                LEFT JOIN PHANCONGBANGCHUYEN pcbc ON bc.MaBangChuyenHanhLy = pcbc.MaBangChuyenHanhLy
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (hasText(keyword)) {
            sql.append(" AND (bc.MaBangChuyenHanhLy LIKE ? OR bc.TenBangChuyenHanhLy LIKE ? OR ng.TenNhaGa LIKE ? OR bc.TrangThaiBangChuyen LIKE ?)");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (hasText(maNhaGa)) {
            sql.append(" AND bc.MaNhaGa = ?");
            params.add(maNhaGa.trim());
        }
        if (hasText(trangThaiBangChuyen)) {
            sql.append(" AND bc.TrangThaiBangChuyen = ?");
            params.add(trangThaiBangChuyen.trim());
        }

        sql.append("""
                GROUP BY bc.MaBangChuyenHanhLy, bc.TenBangChuyenHanhLy, bc.TrangThaiBangChuyen, bc.MaNhaGa, ng.TenNhaGa
                ORDER BY bc.MaBangChuyenHanhLy
                """);
        return jdbcTemplate.query(sql.toString(), this::mapBangChuyen, params.toArray());
    }

    public Optional<BangChuyenHanhLyDto> layChiTietBangChuyen(String maBangChuyenHanhLy) {
        String sql = """
                SELECT
                    bc.MaBangChuyenHanhLy,
                    bc.TenBangChuyenHanhLy,
                    bc.TrangThaiBangChuyen,
                    bc.MaNhaGa,
                    ng.TenNhaGa,
                    COUNT(pcbc.MaPhanCongBangChuyen) AS SoLanPhanCong
                FROM BANGCHUYENHANHLY bc
                JOIN NHAGA ng ON bc.MaNhaGa = ng.MaNhaGa
                LEFT JOIN PHANCONGBANGCHUYEN pcbc ON bc.MaBangChuyenHanhLy = pcbc.MaBangChuyenHanhLy
                WHERE bc.MaBangChuyenHanhLy = ?
                GROUP BY bc.MaBangChuyenHanhLy, bc.TenBangChuyenHanhLy, bc.TrangThaiBangChuyen, bc.MaNhaGa, ng.TenNhaGa
                """;
        List<BangChuyenHanhLyDto> rows = jdbcTemplate.query(sql, this::mapBangChuyen, maBangChuyenHanhLy);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void themBangChuyen(String maBangChuyenHanhLy, TaoBangChuyenRequest request) {
        String sql = """
                INSERT INTO BANGCHUYENHANHLY (MaBangChuyenHanhLy, TenBangChuyenHanhLy, TrangThaiBangChuyen, MaNhaGa)
                VALUES (?, ?, ?, ?)
                """;
        jdbcTemplate.update(sql, maBangChuyenHanhLy, request.tenBangChuyenHanhLy().trim(), request.trangThaiBangChuyen().trim(), request.maNhaGa().trim());
    }

    public void capNhatBangChuyen(String maBangChuyenHanhLy, CapNhatBangChuyenRequest request) {
        String sql = """
                UPDATE BANGCHUYENHANHLY
                SET TenBangChuyenHanhLy = ?, TrangThaiBangChuyen = ?, MaNhaGa = ?
                WHERE MaBangChuyenHanhLy = ?
                """;
        jdbcTemplate.update(sql, request.tenBangChuyenHanhLy().trim(), request.trangThaiBangChuyen().trim(), request.maNhaGa().trim(), maBangChuyenHanhLy);
    }

    public void capNhatTrangThaiBangChuyen(String maBangChuyenHanhLy, String trangThaiBangChuyen) {
        jdbcTemplate.update("UPDATE BANGCHUYENHANHLY SET TrangThaiBangChuyen = ? WHERE MaBangChuyenHanhLy = ?", trangThaiBangChuyen, maBangChuyenHanhLy);
    }

    public void xoaBangChuyen(String maBangChuyenHanhLy) {
        jdbcTemplate.update("DELETE FROM BANGCHUYENHANHLY WHERE MaBangChuyenHanhLy = ?", maBangChuyenHanhLy);
    }

    public boolean tonTaiBangChuyen(String maBangChuyenHanhLy) {
        return dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE MaBangChuyenHanhLy = ?", maBangChuyenHanhLy) > 0;
    }

    public boolean tonTaiTenBangChuyen(String tenBangChuyenHanhLy) {
        return dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE LOWER(TenBangChuyenHanhLy) = LOWER(?)", tenBangChuyenHanhLy) > 0;
    }

    public boolean tonTaiTenBangChuyenKhac(String tenBangChuyenHanhLy, String maBangChuyenHanhLy) {
        return dem("SELECT COUNT(*) FROM BANGCHUYENHANHLY WHERE LOWER(TenBangChuyenHanhLy) = LOWER(?) AND MaBangChuyenHanhLy <> ?", tenBangChuyenHanhLy, maBangChuyenHanhLy) > 0;
    }

    public long demLienKetBangChuyen(String maBangChuyenHanhLy) {
        long total = dem("SELECT COUNT(*) FROM PHANCONGBANGCHUYEN WHERE MaBangChuyenHanhLy = ?", maBangChuyenHanhLy);
        if (tonTaiCot("THONGBAO", "MaBangChuyenHanhLy")) {
            total += dem("SELECT COUNT(*) FROM THONGBAO WHERE MaBangChuyenHanhLy = ?", maBangChuyenHanhLy);
        }
        return total;
    }

    public String taoMaBangChuyenMoi() {
        return taoMaMoi("BC", "BANGCHUYENHANHLY", "MaBangChuyenHanhLy");
    }

    private Long dem(String sql, Object... params) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, params);
        return value == null ? 0L : value;
    }

    private Long demTheoTrangThai(String table, String column, String status) {
        return dem("SELECT COUNT(*) FROM " + table + " WHERE " + column + " = ?", status);
    }

    private boolean tonTaiCot(String tableName, String columnName) {
        return dem("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = ? AND COLUMN_NAME = ?
                """, tableName, columnName) > 0;
    }

    private String taoMaMoi(String prefix, String table, String column) {
        int startIndex = prefix.length() + 1;
        String sql = """
                SELECT TOP 1 %s
                FROM %s
                WHERE %s LIKE ?
                ORDER BY TRY_CAST(SUBSTRING(%s, %d, LEN(%s) - %d) AS INT) DESC
                """.formatted(column, table, column, column, startIndex, column, prefix.length());

        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(column), prefix + "%");
        if (rows.isEmpty() || rows.get(0) == null) {
            return prefix + "01";
        }
        String current = rows.get(0);
        String digits = current.substring(prefix.length());
        int number = Integer.parseInt(digits);
        int width = Math.max(2, digits.length());
        return prefix + String.format("%0" + width + "d", number + 1);
    }

    private HangHangKhongDto mapHangHangKhong(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new HangHangKhongDto(
                rs.getString("MaHangHangKhong"),
                rs.getString("MaHang"),
                rs.getString("TenHangHangKhong"),
                rs.getString("QuocGia"),
                rs.getLong("SoChuyenBay")
        );
    }

    private NhaGaDto mapNhaGa(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new NhaGaDto(
                rs.getString("MaNhaGa"),
                rs.getString("TenNhaGa"),
                rs.getString("LoaiNhaGa"),
                rs.getString("MoTa"),
                rs.getLong("SoCong"),
                rs.getLong("SoBangChuyen")
        );
    }

    private CongDto mapCong(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new CongDto(
                rs.getString("MaCong"),
                rs.getString("MaNhaGa"),
                rs.getString("TenNhaGa"),
                rs.getString("TenCong"),
                rs.getString("TrangThaiCong"),
                rs.getLong("SoLanPhanCong")
        );
    }

    private BangChuyenHanhLyDto mapBangChuyen(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new BangChuyenHanhLyDto(
                rs.getString("MaBangChuyenHanhLy"),
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("TrangThaiBangChuyen"),
                rs.getString("MaNhaGa"),
                rs.getString("TenNhaGa"),
                rs.getLong("SoLanPhanCong")
        );
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
