package com.danangairport.service;

import com.danangairport.dto.BangChuyenOptionDto;
import com.danangairport.dto.CongOptionDto;
import com.danangairport.dto.DieuPhoiTongQuanDto;
import com.danangairport.dto.LichTrinhDieuPhoiDto;
import com.danangairport.dto.PhanCongBangChuyenDto;
import com.danangairport.dto.PhanCongCongDto;
import com.danangairport.dto.TaoPhanCongBangChuyenRequest;
import com.danangairport.dto.TaoPhanCongCongRequest;
import com.danangairport.dto.ThongKeDieuPhoiDto;
import com.danangairport.repository.DieuPhoiVanHanhRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class DieuPhoiVanHanhService {
    private static final Set<String> LOAI_CHUYEN_BAY_HOP_LE = Set.of("Đến", "Đi");
    private static final Set<String> TRANG_THAI_CHUYEN_BAY_HOP_LE = Set.of(
            "Đã lên lịch",
            "Đang làm thủ tục",
            "Đang bay",
            "Đã hạ cánh",
            "Hoàn thành",
            "Chậm chuyến",
            "Hủy chuyến"
    );
    private static final Set<String> TINH_TRANG_PHAN_CONG_HOP_LE = Set.of("tat-ca", "da-phan-cong", "chua-phan-cong");
    private static final Set<String> LOAI_CONG_HOP_LE = Set.of("Nội địa", "Quốc tế", "Hỗn hợp");

    private final DieuPhoiVanHanhRepository repository;

    public DieuPhoiVanHanhService(DieuPhoiVanHanhRepository repository) {
        this.repository = repository;
    }

    public ThongKeDieuPhoiDto layThongKe() {
        return repository.thongKe();
    }

    public List<LichTrinhDieuPhoiDto> layDanhSachLichTrinh(String keyword, LocalDate ngayBay, String loaiChuyenBay,
                                                            String trangThai, String tinhTrangCong, String tinhTrangBangChuyen) {
        validateLoaiChuyenBayNeuCo(loaiChuyenBay);
        validateTrangThaiChuyenBayNeuCo(trangThai);
        validateTinhTrangPhanCong(tinhTrangCong);
        validateTinhTrangPhanCong(tinhTrangBangChuyen);
        return repository.layDanhSachLichTrinh(
                keyword,
                ngayBay,
                loaiChuyenBay,
                trangThai,
                normalizeTinhTrang(tinhTrangCong),
                normalizeTinhTrang(tinhTrangBangChuyen)
        );
    }

    public DieuPhoiTongQuanDto layChiTiet(String maLichTrinh) {
        LichTrinhDieuPhoiDto lichTrinh = repository.layChiTietLichTrinh(maLichTrinh)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch trình điều phối."));
        List<PhanCongCongDto> lichSuCong = repository.layLichSuPhanCongCong(maLichTrinh);
        List<PhanCongBangChuyenDto> lichSuBangChuyen = repository.layLichSuPhanCongBangChuyen(maLichTrinh);
        LocalDateTime batDau = parseOrNull(lichTrinh.gioUocTinhKhoiHanh(), lichTrinh.gioDuKienKhoiHanh());
        LocalDateTime ketThuc = parseOrNull(lichTrinh.gioUocTinhHaCanh(), lichTrinh.gioDuKienHaCanh());

        List<CongOptionDto> congKhaDung = batDau != null && ketThuc != null
                ? repository.layCongKhaDung(batDau, ketThuc, null, lichTrinh.maPhanCongCong())
                : List.of();
        List<BangChuyenOptionDto> bangChuyenKhaDung = batDau != null && ketThuc != null
                ? repository.layBangChuyenKhaDung(batDau, ketThuc, null, lichTrinh.maPhanCongBangChuyen())
                : List.of();

        return new DieuPhoiTongQuanDto(
                lichTrinh,
                lichSuCong.stream().filter(PhanCongCongDto::dangHienHanh).findFirst().orElse(null),
                lichSuBangChuyen.stream().filter(PhanCongBangChuyenDto::dangHienHanh).findFirst().orElse(null),
                lichSuCong,
                lichSuBangChuyen,
                repository.layLichSuCapNhat(maLichTrinh),
                congKhaDung,
                bangChuyenKhaDung
        );
    }

    public List<CongOptionDto> layCongKhaDung(LocalDateTime thoiGianBatDau, LocalDateTime thoiGianKetThuc,
                                               String maNhaGa, String loaiCong, String maPhanCongBoQua) {
        validateKhoangThoiGian(thoiGianBatDau, thoiGianKetThuc);
        validateLoaiCongNeuCo(loaiCong);
        return repository.layCongKhaDung(thoiGianBatDau, thoiGianKetThuc, maNhaGa, maPhanCongBoQua);
    }

    public List<BangChuyenOptionDto> layBangChuyenKhaDung(LocalDateTime thoiGianBatDau, LocalDateTime thoiGianKetThuc,
                                                           String maNhaGa, String maPhanCongBoQua) {
        validateKhoangThoiGian(thoiGianBatDau, thoiGianKetThuc);
        return repository.layBangChuyenKhaDung(thoiGianBatDau, thoiGianKetThuc, maNhaGa, maPhanCongBoQua);
    }

    @Transactional
    public PhanCongCongDto phanCongCong(TaoPhanCongCongRequest request) {
        validateLichTrinhTonTai(request.maLichTrinh());
        if (!repository.tonTaiCong(request.maCong().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cổng không tồn tại.");
        }
        validateLoaiCong(request.loaiCong());
        validateKhoangThoiGian(request.thoiGianBatDauSuDung(), request.thoiGianKetThucSuDung());
        String maPhanCongCong = trimToNull(request.maPhanCongCong());
        if (maPhanCongCong == null) {
            maPhanCongCong = repository.layChiTietLichTrinh(request.maLichTrinh().trim())
                .map(LichTrinhDieuPhoiDto::maPhanCongCong)
                .orElse(null);
        }
        validateCongKhaDung(request, maPhanCongCong);

        repository.taoPhanCongCong(new TaoPhanCongCongRequest(
                maPhanCongCong,
                request.maLichTrinh(),
                request.maCong(),
                request.loaiCong(),
                request.thoiGianBatDauSuDung(),
                request.thoiGianKetThucSuDung()
        ));
        return repository.layPhanCongCongMoiNhat(request.maLichTrinh().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tải được phân công cổng vừa tạo."));
    }

    @Transactional
    public PhanCongBangChuyenDto phanCongBangChuyen(TaoPhanCongBangChuyenRequest request) {
        validateLichTrinhTonTai(request.maLichTrinh());
        if (!repository.tonTaiBangChuyen(request.maBangChuyenHanhLy().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Băng chuyền không tồn tại.");
        }
        validateKhoangThoiGian(request.thoiGianBatDauSuDung(), request.thoiGianKetThucSuDung());
        String maPhanCongBangChuyen = trimToNull(request.maPhanCongBangChuyen());
        if (maPhanCongBangChuyen == null) {
            maPhanCongBangChuyen = repository.layChiTietLichTrinh(request.maLichTrinh().trim())
                .map(LichTrinhDieuPhoiDto::maPhanCongBangChuyen)
                .orElse(null);
        }
        validateBangChuyenKhaDung(request, maPhanCongBangChuyen);

        repository.taoPhanCongBangChuyen(new TaoPhanCongBangChuyenRequest(
                maPhanCongBangChuyen,
                request.maLichTrinh(),
                request.maBangChuyenHanhLy(),
                request.thoiGianBatDauSuDung(),
                request.thoiGianKetThucSuDung()
        ));
        return repository.layPhanCongBangChuyenMoiNhat(request.maLichTrinh().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tải được phân công băng chuyền vừa tạo."));
    }

    @Transactional
    public void huyPhanCongCong(String maPhanCongCong) {
        if (!repository.tonTaiPhanCongCong(maPhanCongCong)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phân công cổng.");
        }
        repository.huyPhanCongCong(maPhanCongCong);
    }

    @Transactional
    public void huyPhanCongBangChuyen(String maPhanCongBangChuyen) {
        if (!repository.tonTaiPhanCongBangChuyen(maPhanCongBangChuyen)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phân công băng chuyền.");
        }
        repository.huyPhanCongBangChuyen(maPhanCongBangChuyen);
    }

    public List<Map<String, Object>> layNhaGaOptions() {
        return repository.layNhaGaOptions();
    }

    public List<String> layLoaiCong() {
        return List.of("Nội địa", "Quốc tế", "Hỗn hợp");
    }

    public List<String> layLoaiChuyenBay() {
        return List.of("Đến", "Đi");
    }

    public List<String> layTrangThaiChuyenBay() {
        return List.of("Đã lên lịch", "Đang làm thủ tục", "Đang bay", "Chậm chuyến", "Hủy chuyến", "Hoàn thành");
    }

    private void validateLichTrinhTonTai(String maLichTrinh) {
        if (!repository.tonTaiLichTrinh(maLichTrinh.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lịch trình không tồn tại hoặc đã bị xóa.");
        }
    }

    private void validateCongKhaDung(TaoPhanCongCongRequest request, String maPhanCongBoQua) {
        Optional<CongOptionDto> cong = repository.layCongKhaDung(
                        request.thoiGianBatDauSuDung(),
                        request.thoiGianKetThucSuDung(),
                        null,
                        maPhanCongBoQua
                )
                .stream()
                .filter(item -> item.maCong().equals(request.maCong().trim()))
                .findFirst();
        if (cong.isEmpty() || !Boolean.TRUE.equals(cong.get().coSanSang())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể phân công cổng vì cổng không sẵn sàng hoặc bị trùng lịch.");
        }
    }

    private void validateBangChuyenKhaDung(TaoPhanCongBangChuyenRequest request, String maPhanCongBoQua) {
        Optional<BangChuyenOptionDto> bangChuyen = repository.layBangChuyenKhaDung(
                        request.thoiGianBatDauSuDung(),
                        request.thoiGianKetThucSuDung(),
                        null,
                        maPhanCongBoQua
                )
                .stream()
                .filter(item -> item.maBangChuyenHanhLy().equals(request.maBangChuyenHanhLy().trim()))
                .findFirst();
        if (bangChuyen.isEmpty() || !Boolean.TRUE.equals(bangChuyen.get().coSanSang())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể phân công băng chuyền vì băng chuyền không sẵn sàng hoặc bị trùng lịch.");
        }
    }

    private void validateKhoangThoiGian(LocalDateTime batDau, LocalDateTime ketThuc) {
        if (batDau == null || ketThuc == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian bắt đầu và kết thúc không được để trống.");
        }
        if (!ketThuc.isAfter(batDau)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
        }
    }

    private void validateLoaiChuyenBayNeuCo(String loaiChuyenBay) {
        if (hasText(loaiChuyenBay) && !LOAI_CHUYEN_BAY_HOP_LE.contains(loaiChuyenBay.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại chuyến bay không hợp lệ.");
        }
    }

    private void validateTrangThaiChuyenBayNeuCo(String trangThai) {
        if (hasText(trangThai) && !TRANG_THAI_CHUYEN_BAY_HOP_LE.contains(trangThai.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái chuyến bay không hợp lệ.");
        }
    }

    private void validateTinhTrangPhanCong(String tinhTrang) {
        if (hasText(tinhTrang) && !TINH_TRANG_PHAN_CONG_HOP_LE.contains(tinhTrang.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tình trạng phân công không hợp lệ.");
        }
    }

    private void validateLoaiCongNeuCo(String loaiCong) {
        if (hasText(loaiCong)) {
            validateLoaiCong(loaiCong);
        }
    }

    private void validateLoaiCong(String loaiCong) {
        if (loaiCong == null || !LOAI_CONG_HOP_LE.contains(loaiCong.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại cổng không hợp lệ.");
        }
    }

    private String normalizeTinhTrang(String value) {
        return hasText(value) ? value.trim() : "tat-ca";
    }

    private LocalDateTime parseOrNull(String primary, String fallback) {
        String value = hasText(primary) ? primary : fallback;
        return hasText(value) ? LocalDateTime.parse(value) : null;
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
