package com.danangairport.service;

import com.danangairport.dto.CapNhatChuyenBayRequest;
import com.danangairport.dto.CapNhatTinhHinhChuyenBayRequest;
import com.danangairport.dto.ChiTietChuyenBayDto;
import com.danangairport.dto.ChuyenBayDto;
import com.danangairport.dto.ChuyenBayOptionDto;
import com.danangairport.dto.TaoChuyenBayRequest;
import com.danangairport.dto.ThongKeChuyenBayDto;
import com.danangairport.dto.XoaChuyenBayRequest;
import com.danangairport.repository.ChuyenBayQuanTriRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class ChuyenBayQuanTriService {
    private static final Set<String> LOAI_CHUYEN_BAY_HOP_LE = Set.of("Đến", "Đi");
    private static final Set<String> TRANG_THAI_HOP_LE = Set.of(
            "Đã lên lịch",
            "Đang làm thủ tục",
            "Đang bay",
            "Đã hạ cánh",
            "Hoàn thành",
            "Chậm chuyến",
            "Hủy chuyến",
            "Đã xóa"
    );
    private static final Set<String> TRANG_THAI_KHONG_CHO_SUA_THONG_TIN = Set.of("Hoàn thành", "Hủy chuyến", "Đã xóa");

    private final ChuyenBayQuanTriRepository repository;

    public ChuyenBayQuanTriService(ChuyenBayQuanTriRepository repository) {
        this.repository = repository;
    }

    public ThongKeChuyenBayDto layThongKe() {
        return repository.thongKe();
    }

    public List<ChuyenBayDto> layDanhSach(String keyword, String loaiChuyenBay, String trangThai,
                                           String maHangHangKhong, LocalDate tuNgay, LocalDate denNgay) {
        validateLoaiChuyenBayNeuCo(loaiChuyenBay);
        validateTrangThaiNeuCo(trangThai);
        if (tuNgay != null && denNgay != null && denNgay.isBefore(tuNgay)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đến ngày không được nhỏ hơn từ ngày.");
        }
        return repository.layDanhSach(keyword, loaiChuyenBay, trangThai, maHangHangKhong, tuNgay, denNgay);
    }

    public ChiTietChuyenBayDto layChiTiet(String maLichTrinh) {
        ChuyenBayDto thongTin = repository.layChiTietChuyenBay(maLichTrinh)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình chuyến bay."));
        return new ChiTietChuyenBayDto(
                thongTin,
                repository.layLichSuCapNhat(maLichTrinh),
                repository.layThongBao(maLichTrinh)
        );
    }

    @Transactional
    public ChuyenBayDto themChuyenBay(TaoChuyenBayRequest request) {
        validateThongTinChuyenBay(
                request.maHangHangKhong(),
                request.soHieuChuyenBay(),
                request.loaiChuyenBay(),
                request.diemDi(),
                request.diemDen(),
                request.gioDuKienKhoiHanh(),
                request.gioDuKienHaCanh()
        );
        if (repository.tonTaiSoHieuChuyenBay(request.soHieuChuyenBay().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số hiệu chuyến bay đã tồn tại.");
        }

        String maChuyenBay = repository.taoMaChuyenBayMoi();
        String maLichTrinh = repository.taoMaLichTrinhMoi();
        repository.themChuyenBayVaLichTrinh(maChuyenBay, maLichTrinh, request);
        return repository.layChiTietChuyenBay(maLichTrinh)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tải được chuyến bay vừa tạo."));
    }

    @Transactional
    public ChuyenBayDto capNhatChuyenBay(String maLichTrinh, CapNhatChuyenBayRequest request) {
        if (!repository.tonTaiLichTrinh(maLichTrinh)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình chuyến bay.");
        }
        String trangThai = repository.layTrangThaiTheoLichTrinh(maLichTrinh);
        if (TRANG_THAI_KHONG_CHO_SUA_THONG_TIN.contains(trangThai)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể sửa thông tin chuyến bay khi trạng thái là Hoàn thành, Hủy chuyến hoặc Đã xóa.");
        }

        validateThongTinChuyenBay(
                request.maHangHangKhong(),
                request.soHieuChuyenBay(),
                request.loaiChuyenBay(),
                request.diemDi(),
                request.diemDen(),
                request.gioDuKienKhoiHanh(),
                request.gioDuKienHaCanh()
        );

        String maChuyenBay = repository.layMaChuyenBayTheoLichTrinh(maLichTrinh);
        if (repository.tonTaiSoHieuChuyenBayKhac(request.soHieuChuyenBay().trim(), maChuyenBay)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số hiệu chuyến bay đã tồn tại.");
        }

        repository.capNhatChuyenBayVaLichTrinh(maChuyenBay, maLichTrinh, request);
        return repository.layChiTietChuyenBay(maLichTrinh)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình chuyến bay."));
    }

    @Transactional
    public ChuyenBayDto capNhatTinhHinh(String maLichTrinh, CapNhatTinhHinhChuyenBayRequest request) {
        if (!repository.tonTaiLichTrinh(maLichTrinh)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình chuyến bay.");
        }
        validateTrangThai(request.trangThaiMoi());

        String trangThaiMoi = request.trangThaiMoi().trim();
        if (Set.of("Chậm chuyến", "Hủy chuyến").contains(trangThaiMoi) && !hasText(request.lyDoChamHoacHuy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do khi chuyến bay chậm hoặc hủy.");
        }
        if ("Đang bay".equals(trangThaiMoi) && request.gioThucTeKhoiHanh() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập giờ thực tế khởi hành khi chuyển sang trạng thái Đang bay.");
        }
        if ("Hoàn thành".equals(trangThaiMoi) && request.gioThucTeHaCanh() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập giờ thực tế hạ cánh khi hoàn thành chuyến bay.");
        }
        validateCapNhatGio(maLichTrinh, request);

        repository.capNhatTinhHinh(maLichTrinh, request);
        return repository.layChiTietChuyenBay(maLichTrinh)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình chuyến bay."));
    }

    @Transactional
    public void xoaMem(String maLichTrinh, XoaChuyenBayRequest request) {
        if (!repository.tonTaiLichTrinh(maLichTrinh)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình chuyến bay.");
        }
        String trangThai = repository.layTrangThaiTheoLichTrinh(maLichTrinh);
        if ("Đã xóa".equals(trangThai)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lịch trình chuyến bay đã được xóa mềm trước đó.");
        }
        repository.xoaMemLichTrinh(maLichTrinh, request == null ? null : request.lyDoXoa());
    }

    public List<ChuyenBayOptionDto> layHangHangKhongOptions() {
        return repository.layHangHangKhongOptions();
    }

    public List<String> layLoaiChuyenBay() {
        return List.of("Đến", "Đi");
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

    private void validateThongTinChuyenBay(String maHangHangKhong, String soHieuChuyenBay, String loaiChuyenBay,
                                           String diemDi, String diemDen, LocalDateTime gioDuKienKhoiHanh,
                                           LocalDateTime gioDuKienHaCanh) {
        if (!repository.tonTaiHangHangKhong(maHangHangKhong.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hãng hàng không không tồn tại.");
        }
        if (!hasText(soHieuChuyenBay)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số hiệu chuyến bay không được để trống.");
        }
        validateLoaiChuyenBay(loaiChuyenBay);
        if (diemDi.trim().equalsIgnoreCase(diemDen.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Điểm đi phải khác điểm đến.");
        }
        if (!gioDuKienHaCanh.isAfter(gioDuKienKhoiHanh)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ dự kiến hạ cánh phải lớn hơn giờ dự kiến khởi hành.");
        }
    }

    private void validateCapNhatGio(String maLichTrinh, CapNhatTinhHinhChuyenBayRequest request) {
        LocalDateTime gioDuKienKhoiHanh = repository.layGioDuKienKhoiHanh(maLichTrinh);
        LocalDateTime gioDuKienHaCanh = repository.layGioDuKienHaCanh(maLichTrinh);
        if (request.gioUocTinhKhoiHanh() != null && gioDuKienKhoiHanh != null && request.gioUocTinhKhoiHanh().isBefore(gioDuKienKhoiHanh)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ ước tính khởi hành không được nhỏ hơn giờ dự kiến khởi hành.");
        }
        if (request.gioUocTinhHaCanh() != null && gioDuKienHaCanh != null && request.gioUocTinhHaCanh().isBefore(gioDuKienHaCanh)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ ước tính hạ cánh không được nhỏ hơn giờ dự kiến hạ cánh.");
        }
        if (request.gioUocTinhKhoiHanh() != null && request.gioUocTinhHaCanh() != null && !request.gioUocTinhHaCanh().isAfter(request.gioUocTinhKhoiHanh())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ ước tính hạ cánh phải lớn hơn giờ ước tính khởi hành.");
        }
        if (request.gioThucTeKhoiHanh() != null && request.gioThucTeHaCanh() != null && !request.gioThucTeHaCanh().isAfter(request.gioThucTeKhoiHanh())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ thực tế hạ cánh phải lớn hơn giờ thực tế khởi hành.");
        }
    }

    private void validateLoaiChuyenBayNeuCo(String loaiChuyenBay) {
        if (hasText(loaiChuyenBay)) {
            validateLoaiChuyenBay(loaiChuyenBay);
        }
    }

    private void validateLoaiChuyenBay(String loaiChuyenBay) {
        if (loaiChuyenBay == null || !LOAI_CHUYEN_BAY_HOP_LE.contains(loaiChuyenBay.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại chuyến bay không hợp lệ.");
        }
    }

    private void validateTrangThaiNeuCo(String trangThai) {
        if (hasText(trangThai)) {
            validateTrangThai(trangThai);
        }
    }

    private void validateTrangThai(String trangThai) {
        if (trangThai == null || !TRANG_THAI_HOP_LE.contains(trangThai.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái chuyến bay không hợp lệ.");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
