package com.danangairport.service;

import com.danangairport.dto.CapNhatTrangThaiThongBaoRequest;
import com.danangairport.dto.ChiTietLichSuCapNhatDto;
import com.danangairport.dto.ChiTietThongBaoDto;
import com.danangairport.dto.LichSuCapNhatDto;
import com.danangairport.dto.TaoThongBaoThuCongRequest;
import com.danangairport.dto.ThongBaoDto;
import com.danangairport.dto.ThongBaoOptionDto;
import com.danangairport.dto.ThongKeThongBaoLichSuDto;
import com.danangairport.repository.ThongBaoLichSuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class ThongBaoLichSuService {
    private static final Set<String> PHUONG_THUC_GUI_HOP_LE = Set.of("Email", "SMS", "Ứng dụng", "Hệ thống");
    private static final Set<String> TRANG_THAI_GUI_HOP_LE = Set.of("Chờ gửi", "Đã gửi", "Lỗi gửi");
    private static final Set<String> TRANG_THAI_CHUYEN_BAY_HOP_LE = Set.of(
            "Đã lên lịch",
            "Đang làm thủ tục",
            "Đang bay",
            "Đã hạ cánh",
            "Hoàn thành",
            "Chậm chuyến",
            "Hủy chuyến",
            "Đã xóa"
    );

    private final ThongBaoLichSuRepository repository;

    public ThongBaoLichSuService(ThongBaoLichSuRepository repository) {
        this.repository = repository;
    }

    public ThongKeThongBaoLichSuDto layThongKe() {
        return repository.thongKe();
    }

    public List<ThongBaoDto> layDanhSachThongBao(String keyword, String trangThaiGui, String phuongThucGui,
                                                  String trangThaiMoi, LocalDate tuNgay, LocalDate denNgay) {
        validateTrangThaiGuiNeuCo(trangThaiGui);
        validatePhuongThucGuiNeuCo(phuongThucGui);
        validateTrangThaiChuyenBayNeuCo(trangThaiMoi);
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layDanhSachThongBao(keyword, trangThaiGui, phuongThucGui, trangThaiMoi, tuNgay, denNgay);
    }

    public ChiTietThongBaoDto layChiTietThongBao(String maThongBao) {
        return repository.layChiTietThongBao(maThongBao)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo."));
    }

    @Transactional
    public ChiTietThongBaoDto capNhatTrangThaiThongBao(String maThongBao, CapNhatTrangThaiThongBaoRequest request) {
        if (!repository.tonTaiThongBao(maThongBao)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo.");
        }
        validateTrangThaiGui(request.trangThaiGui());
        repository.capNhatTrangThaiThongBao(maThongBao, request.trangThaiGui().trim());
        return layChiTietThongBao(maThongBao);
    }

    @Transactional
    public ChiTietThongBaoDto taoThongBao(TaoThongBaoThuCongRequest request) {
        validateTaoThongBao(request);
        String maThongBao = repository.taoMaThongBaoMoi();
        repository.taoThongBao(maThongBao, request);
        return layChiTietThongBao(maThongBao);
    }

    public List<LichSuCapNhatDto> layDanhSachLichSu(String keyword, String maTaiKhoan, String trangThaiMoi,
                                                    LocalDate tuNgay, LocalDate denNgay) {
        validateTrangThaiChuyenBayNeuCo(trangThaiMoi);
        validateKhoangNgay(tuNgay, denNgay);
        return repository.layDanhSachLichSu(keyword, maTaiKhoan, trangThaiMoi, tuNgay, denNgay);
    }

    public ChiTietLichSuCapNhatDto layChiTietLichSu(String maLichSuCapNhat) {
        return repository.layChiTietLichSu(maLichSuCapNhat)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch sử cập nhật."));
    }

    public List<String> layPhuongThucGui() {
        return List.of("Email", "SMS", "Ứng dụng", "Hệ thống");
    }

    public List<String> layTrangThaiGui() {
        return List.of("Chờ gửi", "Đã gửi", "Lỗi gửi");
    }

    public List<String> layTrangThaiChuyenBay() {
        return List.of(
                "Đã lên lịch",
                "Đang làm thủ tục",
                "Đang bay",
                "Đã hạ cánh",
                "Hoàn thành",
                "Chậm chuyến",
                "Hủy chuyến",
                "Đã xóa"
        );
    }

    public List<ThongBaoOptionDto> layTaiKhoanOptions() {
        return repository.layTaiKhoanOptions();
    }

    public List<ThongBaoOptionDto> layLichTrinhOptions() {
        return repository.layLichTrinhOptions();
    }

    public List<ThongBaoOptionDto> layCongOptions() {
        return repository.layCongOptions();
    }

    public List<ThongBaoOptionDto> layBangChuyenOptions() {
        return repository.layBangChuyenOptions();
    }

    private void validateTaoThongBao(TaoThongBaoThuCongRequest request) {
        if (!repository.tonTaiLichTrinh(request.maLichTrinh().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lịch trình không tồn tại.");
        }
        if (!repository.tonTaiTaiKhoan(request.maTaiKhoan().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản không tồn tại.");
        }
        String maCong = trimToNull(request.maCong());
        if (maCong != null && !repository.tonTaiCong(maCong)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cổng không tồn tại.");
        }
        String maBangChuyen = trimToNull(request.maBangChuyenHanhLy());
        if (maBangChuyen != null && !repository.tonTaiBangChuyen(maBangChuyen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Băng chuyền không tồn tại.");
        }
        validateTrangThaiChuyenBay(request.trangThaiMoi());
        validatePhuongThucGui(request.phuongThucGui());
        validateTrangThaiGui(request.trangThaiGui());
    }

    private void validateKhoangNgay(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay != null && denNgay != null && denNgay.isBefore(tuNgay)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đến ngày không được nhỏ hơn từ ngày.");
        }
    }

    private void validateTrangThaiGuiNeuCo(String value) {
        if (hasText(value)) {
            validateTrangThaiGui(value);
        }
    }

    private void validateTrangThaiGui(String value) {
        if (value == null || !TRANG_THAI_GUI_HOP_LE.contains(value.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái gửi không hợp lệ.");
        }
    }

    private void validatePhuongThucGuiNeuCo(String value) {
        if (hasText(value)) {
            validatePhuongThucGui(value);
        }
    }

    private void validatePhuongThucGui(String value) {
        if (value == null || !PHUONG_THUC_GUI_HOP_LE.contains(value.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương thức gửi không hợp lệ.");
        }
    }

    private void validateTrangThaiChuyenBayNeuCo(String value) {
        if (hasText(value)) {
            validateTrangThaiChuyenBay(value);
        }
    }

    private void validateTrangThaiChuyenBay(String value) {
        if (value == null || !TRANG_THAI_CHUYEN_BAY_HOP_LE.contains(value.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái chuyến bay không hợp lệ.");
        }
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
