package com.danangairport.repository;

import com.danangairport.dto.CustomerFlightDto;
import com.danangairport.dto.CustomerNotificationDto;
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
public class CustomerFlightRepository {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private static final String DELETED_STATUS = "\u0110\u00e3 x\u00f3a";
    private static final String ARRIVAL_TYPE = "\u0110\u1ebfn";

    private final JdbcTemplate jdbcTemplate;

    public CustomerFlightRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CustomerFlightDto> layDanhSach(String keyword, String loaiChuyenBay, String trangThai, LocalDate ngayBay) {
        QueryParts query = buildFlightQuery("WHERE lt.TrangThaiHienTai <> ?\n");
        List<Object> params = new ArrayList<>();
        params.add(DELETED_STATUS);

        if (hasText(keyword)) {
            query.sql.append("""
                     AND (
                        cb.SoHieuChuyenBay LIKE ?
                        OR hh.TenHangHangKhong LIKE ?
                        OR cb.DiemDi LIKE ?
                        OR cb.DiemDen LIKE ?
                        OR c.TenCong LIKE ?
                     )
                    """);
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (hasText(loaiChuyenBay)) {
            query.sql.append(" AND cb.LoaiChuyenBay = ?");
            params.add(loaiChuyenBay.trim());
        }
        if (hasText(trangThai)) {
            query.sql.append(" AND lt.TrangThaiHienTai = ?");
            params.add(trangThai.trim());
        }
        if (ngayBay != null) {
            query.sql.append(" AND CAST(lt.NgayBay AS DATE) = ?");
            params.add(Date.valueOf(ngayBay));
        }

        query.sql.append("""
                 ORDER BY lt.NgayBay DESC,
                          COALESCE(lt.GioUocTinhKhoiHanh, lt.GioDuKienKhoiHanh) DESC
                """);
        return jdbcTemplate.query(query.sql.toString(), this::mapFlight, params.toArray());
    }

    public Optional<CustomerFlightDto> layChiTiet(String identifier) {
        QueryParts query = buildFlightQuery("""
                WHERE lt.TrangThaiHienTai <> ?
                  AND (lt.MaLichTrinh = ? OR cb.SoHieuChuyenBay = ?)
                """);
        query.sql.append("""
                 ORDER BY CASE WHEN lt.MaLichTrinh = ? THEN 0 ELSE 1 END,
                          lt.NgayBay DESC,
                          COALESCE(lt.GioUocTinhKhoiHanh, lt.GioDuKienKhoiHanh) DESC
                """);
        List<CustomerFlightDto> rows = jdbcTemplate.query(
                query.sql.toString(),
                this::mapFlight,
                DELETED_STATUS,
                identifier,
                identifier,
                identifier
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<CustomerNotificationDto> layThongBao(List<String> flightNos) {
        StringBuilder sql = new StringBuilder("""
                SELECT TOP 50
                    tb.MaThongBao,
                    cb.SoHieuChuyenBay,
                    lt.MaLichTrinh,
                    tb.NoiDungThongBao,
                    tb.TrangThaiMoi,
                    tb.ThoiGianGui
                FROM THONGBAO tb
                JOIN LICHTRINH lt ON tb.MaLichTrinh = lt.MaLichTrinh
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                WHERE lt.TrangThaiHienTai <> ?
                """);
        List<Object> params = new ArrayList<>();
        params.add(DELETED_STATUS);

        if (flightNos != null && !flightNos.isEmpty()) {
            List<String> cleanFlightNos = flightNos.stream()
                    .filter(this::hasText)
                    .map(String::trim)
                    .distinct()
                    .toList();
            if (!cleanFlightNos.isEmpty()) {
                sql.append(" AND cb.SoHieuChuyenBay IN (");
                sql.append("?,".repeat(cleanFlightNos.size()));
                sql.setLength(sql.length() - 1);
                sql.append(")");
                params.addAll(cleanFlightNos);
            }
        }

        sql.append(" ORDER BY tb.ThoiGianGui DESC");
        return jdbcTemplate.query(sql.toString(), this::mapNotification, params.toArray());
    }

    private QueryParts buildFlightQuery(String whereClause) {
        return new QueryParts(new StringBuilder("""
                SELECT
                    cb.MaChuyenBay,
                    lt.MaLichTrinh,
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
                    c.TenCong,
                    c.TenNhaGa,
                    bc.TenBangChuyenHanhLy,
                    bc.TenNhaGaBangChuyen
                FROM LICHTRINH lt
                JOIN CHUYENBAY cb ON lt.MaChuyenBay = cb.MaChuyenBay
                JOIN HANGHANGKHONG hh ON cb.MaHangHangKhong = hh.MaHangHangKhong
                OUTER APPLY (
                    SELECT TOP 1
                        cg.TenCong,
                        ng.TenNhaGa
                    FROM PHANCONGCONG pcc
                    JOIN CONG cg ON pcc.MaCong = cg.MaCong
                    JOIN NHAGA ng ON cg.MaNhaGa = ng.MaNhaGa
                    WHERE pcc.MaLichTrinh = lt.MaLichTrinh
                      AND pcc.DangHienHanh = 1
                    ORDER BY pcc.ThoiGianBatDauSuDung DESC
                ) c
                OUTER APPLY (
                    SELECT TOP 1
                        bchl.TenBangChuyenHanhLy,
                        ngbc.TenNhaGa AS TenNhaGaBangChuyen
                    FROM PHANCONGBANGCHUYEN pcbc
                    JOIN BANGCHUYENHANHLY bchl ON pcbc.MaBangChuyenHanhLy = bchl.MaBangChuyenHanhLy
                    JOIN NHAGA ngbc ON bchl.MaNhaGa = ngbc.MaNhaGa
                    WHERE pcbc.MaLichTrinh = lt.MaLichTrinh
                      AND pcbc.DangHienHanh = 1
                    ORDER BY pcbc.ThoiGianBatDauSuDung DESC
                ) bc
                """).append(whereClause));
    }

    private CustomerFlightDto mapFlight(ResultSet rs, int rowNum) throws SQLException {
        String typeText = rs.getString("LoaiChuyenBay");
        boolean arrival = ARRIVAL_TYPE.equals(typeText);
        String statusText = rs.getString("TrangThaiHienTai");
        String note = rs.getString("LyDoChamHoacHuy");
        if (!hasText(note)) {
            note = "Thong tin duoc cap nhat truc tiep tu he thong san bay.";
        }

        return new CustomerFlightDto(
                rs.getString("MaLichTrinh"),
                rs.getString("MaLichTrinh"),
                rs.getString("MaChuyenBay"),
                rs.getString("SoHieuChuyenBay"),
                rs.getString("TenHangHangKhong"),
                arrival ? "DEN" : "DI",
                typeText,
                rs.getString("DiemDi"),
                rs.getString("DiemDen"),
                formatDate(rs.getDate("NgayBay")),
                arrival ? formatTime(rs.getTimestamp("GioDuKienHaCanh")) : formatTime(rs.getTimestamp("GioDuKienKhoiHanh")),
                arrival ? firstTime(rs.getTimestamp("GioUocTinhHaCanh"), rs.getTimestamp("GioDuKienHaCanh"))
                        : firstTime(rs.getTimestamp("GioUocTinhKhoiHanh"), rs.getTimestamp("GioDuKienKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioDuKienKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioDuKienHaCanh")),
                formatTimestamp(rs.getTimestamp("GioUocTinhKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioUocTinhHaCanh")),
                formatTimestamp(rs.getTimestamp("GioThucTeKhoiHanh")),
                formatTimestamp(rs.getTimestamp("GioThucTeHaCanh")),
                rs.getString("TenCong"),
                rs.getString("TenNhaGa"),
                rs.getString("TenBangChuyenHanhLy"),
                rs.getString("TenNhaGaBangChuyen"),
                toStatusCode(statusText),
                statusText,
                toInteger(rs.getObject("SoPhutCham")),
                note
        );
    }

    private CustomerNotificationDto mapNotification(ResultSet rs, int rowNum) throws SQLException {
        String flightNo = rs.getString("SoHieuChuyenBay");
        String statusText = rs.getString("TrangThaiMoi");
        return new CustomerNotificationDto(
                rs.getString("MaThongBao"),
                flightNo,
                rs.getString("MaLichTrinh"),
                "Cap nhat chuyen bay " + flightNo,
                rs.getString("NoiDungThongBao"),
                toStatusCode(statusText),
                statusText,
                formatTimestamp(rs.getTimestamp("ThoiGianGui"))
        );
    }

    private String toStatusCode(String statusText) {
        if (statusText == null) {
            return "UNKNOWN";
        }
        return switch (statusText) {
            case "\u0110\u00e3 l\u00ean l\u1ecbch" -> "SCHEDULED";
            case "\u0110ang l\u00e0m th\u1ee7 t\u1ee5c" -> "CHECKIN";
            case "\u0110ang l\u00ean m\u00e1y bay" -> "BOARDING";
            case "\u0110\u00e3 kh\u1edfi h\u00e0nh" -> "DEPARTED";
            case "\u0110ang bay" -> "IN_AIR";
            case "\u0110\u00e3 h\u1ea1 c\u00e1nh" -> "LANDED";
            case "Ho\u00e0n th\u00e0nh" -> "COMPLETED";
            case "Ch\u1eadm chuy\u1ebfn" -> "DELAYED";
            case "H\u1ee7y chuy\u1ebfn" -> "CANCELLED";
            default -> "UNKNOWN";
        };
    }

    private String formatDate(Date date) {
        return date == null ? null : date.toLocalDate().format(DATE_FORMATTER);
    }

    private String firstTime(Timestamp preferred, Timestamp fallback) {
        String value = formatTime(preferred);
        return value != null ? value : formatTime(fallback);
    }

    private String formatTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().format(TIME_FORMATTER);
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

    private record QueryParts(StringBuilder sql) {
    }
}
