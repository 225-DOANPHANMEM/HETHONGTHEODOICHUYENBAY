package com.danangairport.service;

import com.danangairport.dto.BaoCaoHangHangKhongDto;
import com.danangairport.dto.BaoCaoLichSuCapNhatDto;
import com.danangairport.dto.BaoCaoTaiNguyenDto;
import com.danangairport.dto.BaoCaoTheoNgayDto;
import com.danangairport.dto.BaoCaoThongBaoDto;
import com.danangairport.dto.BaoCaoTongQuanDto;
import com.danangairport.dto.BaoCaoTrangThaiDto;
import com.danangairport.repository.BaoCaoVanHanhRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class BaoCaoVanHanhService {
    private static final Set<String> EXPORT_TYPES = Set.of(
            "overview",
            "by-date",
            "by-status",
            "by-airline",
            "resources",
            "notifications",
            "update-logs"
    );

    private final BaoCaoVanHanhRepository repository;

    public BaoCaoVanHanhService(BaoCaoVanHanhRepository repository) {
        this.repository = repository;
    }

    public BaoCaoTongQuanDto layTongQuan(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layTongQuan(tuNgay, denNgay);
    }

    public List<BaoCaoTheoNgayDto> layTheoNgay(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layTheoNgay(tuNgay, denNgay);
    }

    public List<BaoCaoTrangThaiDto> layTheoTrangThai(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layTheoTrangThai(tuNgay, denNgay);
    }

    public List<BaoCaoHangHangKhongDto> layTheoHangHangKhong(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layTheoHangHangKhong(tuNgay, denNgay);
    }

    public BaoCaoTaiNguyenDto layTaiNguyen(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layTaiNguyen(tuNgay, denNgay);
    }

    public BaoCaoThongBaoDto layThongBao(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layThongBao(tuNgay, denNgay);
    }

    public BaoCaoLichSuCapNhatDto layLichSuCapNhat(LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layLichSuCapNhat(tuNgay, denNgay);
    }

    public byte[] xuatCsv(String type, LocalDate tuNgay, LocalDate denNgay) {
        validateKhoangNgay(tuNgay, denNgay);
        String normalizedType = type == null || type.isBlank() ? "overview" : type.trim();
        if (!EXPORT_TYPES.contains(normalizedType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại báo cáo không hợp lệ.");
        }

        String csv = switch (normalizedType) {
            case "by-date" -> csvTheoNgay(tuNgay, denNgay);
            case "by-status" -> csvTheoTrangThai(tuNgay, denNgay);
            case "by-airline" -> csvTheoHangBay(tuNgay, denNgay);
            case "resources" -> csvTaiNguyen(tuNgay, denNgay);
            case "notifications" -> csvThongBao(tuNgay, denNgay);
            case "update-logs" -> csvLichSuCapNhat(tuNgay, denNgay);
            default -> csvTongQuan(tuNgay, denNgay);
        };
        return ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
    }

    private String csvTongQuan(LocalDate tuNgay, LocalDate denNgay) {
        BaoCaoTongQuanDto item = repository.layTongQuan(tuNgay, denNgay);
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "Chi so", "Gia tri");
        appendLine(csv, "Tổng chuyến bay", item.tongChuyenBay());
        appendLine(csv, "Tổng lịch trình", item.tongLichTrinh());
        appendLine(csv, "Chuyến bay đến", item.soChuyenBayDen());
        appendLine(csv, "Chuyến bay đi", item.soChuyenBayDi());
        appendLine(csv, "Đã lên lịch", item.soDaLenLich());
        appendLine(csv, "Đang làm thủ tục", item.soDangLamThuTuc());
        appendLine(csv, "Đang bay", item.soDangBay());
        appendLine(csv, "Đã hạ cánh", item.soDaHaCanh());
        appendLine(csv, "Hoàn thành", item.soHoanThanh());
        appendLine(csv, "Chậm chuyến", item.soChamChuyen());
        appendLine(csv, "Hủy chuyến", item.soHuyChuyen());
        appendLine(csv, "Đã xóa", item.soDaXoa());
        appendLine(csv, "Tổng phút chậm", item.tongSoPhutCham());
        appendLine(csv, "Phút chậm trung bình", formatDouble(item.soPhutChamTrungBinh()));
        appendLine(csv, "Tổng thông báo", item.tongThongBao());
        appendLine(csv, "Tổng lịch sử cập nhật", item.tongLichSuCapNhat());
        appendLine(csv, "Cổng đang dùng", item.tongCongDangDung());
        appendLine(csv, "Băng chuyền đang dùng", item.tongBangChuyenDangDung());
        return csv.toString();
    }

    private String csvTheoNgay(LocalDate tuNgay, LocalDate denNgay) {
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "Ngày bay", "Tổng lịch trình", "Chuyến bay đến", "Chuyến bay đi", "Chậm chuyến", "Hủy chuyến", "Hoàn thành", "Tổng phút chậm");
        repository.layTheoNgay(tuNgay, denNgay).forEach(item -> appendLine(csv,
                item.ngayBay(),
                item.tongLichTrinh(),
                item.soChuyenBayDen(),
                item.soChuyenBayDi(),
                item.soChamChuyen(),
                item.soHuyChuyen(),
                item.soHoanThanh(),
                item.tongSoPhutCham()));
        return csv.toString();
    }

    private String csvTheoTrangThai(LocalDate tuNgay, LocalDate denNgay) {
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "Trạng thái", "Số lượng", "Tỷ lệ (%)");
        repository.layTheoTrangThai(tuNgay, denNgay).forEach(item -> appendLine(csv,
                item.trangThai(),
                item.soLuong(),
                formatDouble(item.tyLe())));
        return csv.toString();
    }

    private String csvTheoHangBay(LocalDate tuNgay, LocalDate denNgay) {
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "Mã hãng", "Mã IATA/ICAO", "Tên hãng", "Tổng chuyến bay", "Chuyến bay đến", "Chuyến bay đi", "Chậm chuyến", "Hủy chuyến", "Hoàn thành", "Tổng phút chậm", "Phút chậm trung bình");
        repository.layTheoHangHangKhong(tuNgay, denNgay).forEach(item -> appendLine(csv,
                item.maHangHangKhong(),
                item.maHang(),
                item.tenHangHangKhong(),
                item.tongChuyenBay(),
                item.soChuyenBayDen(),
                item.soChuyenBayDi(),
                item.soChamChuyen(),
                item.soHuyChuyen(),
                item.soHoanThanh(),
                item.tongSoPhutCham(),
                formatDouble(item.soPhutChamTrungBinh())));
        return csv.toString();
    }

    private String csvTaiNguyen(LocalDate tuNgay, LocalDate denNgay) {
        BaoCaoTaiNguyenDto data = repository.layTaiNguyen(tuNgay, denNgay);
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "CỔNG");
        appendLine(csv, "Mã cổng", "Tên cổng", "Nhà ga", "Trạng thái", "Số lần phân công");
        data.cong().forEach(item -> appendLine(csv, item.maCong(), item.tenCong(), item.tenNhaGa(), item.trangThaiCong(), item.soLanPhanCong()));
        appendLine(csv);
        appendLine(csv, "BĂNG CHUYỀN");
        appendLine(csv, "Mã băng chuyền", "Tên băng chuyền", "Nhà ga", "Trạng thái", "Số lần phân công");
        data.bangChuyen().forEach(item -> appendLine(csv, item.maBangChuyenHanhLy(), item.tenBangChuyenHanhLy(), item.tenNhaGa(), item.trangThaiBangChuyen(), item.soLanPhanCong()));
        return csv.toString();
    }

    private String csvThongBao(LocalDate tuNgay, LocalDate denNgay) {
        BaoCaoThongBaoDto data = repository.layThongBao(tuNgay, denNgay);
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "Chi so", "Gia tri");
        appendLine(csv, "Tổng thông báo", data.tongThongBao());
        appendLine(csv, "Chờ gửi", data.soChoGui());
        appendLine(csv, "Đã gửi", data.soDaGui());
        appendLine(csv, "Lỗi gửi", data.soLoiGui());
        appendLine(csv);
        appendLine(csv, "Phương thức gửi", "Số lượng");
        data.theoPhuongThuc().forEach(item -> appendLine(csv, item.phuongThucGui(), item.soLuong()));
        return csv.toString();
    }

    private String csvLichSuCapNhat(LocalDate tuNgay, LocalDate denNgay) {
        BaoCaoLichSuCapNhatDto data = repository.layLichSuCapNhat(tuNgay, denNgay);
        StringBuilder csv = new StringBuilder();
        appendLine(csv, "Tổng lịch sử cập nhật", data.tongLichSuCapNhat());
        appendLine(csv);
        appendLine(csv, "Mã tài khoản", "Tên đăng nhập", "Vai trò", "Số lần cập nhật");
        data.topTaiKhoanCapNhat().forEach(item -> appendLine(csv, item.maTaiKhoan(), item.tenDangNhap(), item.vaiTro(), item.soLanCapNhat()));
        return csv.toString();
    }

    private void validateKhoangNgay(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay != null && denNgay != null && denNgay.isBefore(tuNgay)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đến ngày không được nhỏ hơn từ ngày.");
        }
    }

    private void appendLine(StringBuilder csv, Object... values) {
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                csv.append(',');
            }
            csv.append(escapeCsv(values[i]));
        }
        csv.append("\r\n");
    }

    private String escapeCsv(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        boolean needsQuote = text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r");
        String escaped = text.replace("\"", "\"\"");
        return needsQuote ? "\"" + escaped + "\"" : escaped;
    }

    private String formatDouble(double value) {
        return String.format(java.util.Locale.US, "%.2f", value);
    }
}
