package com.danangairport.service;

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
import com.danangairport.repository.DanhMucVanHanhRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DanhMucVanHanhService {
    private static final Set<String> LOAI_NHA_GA_HOP_LE = Set.of("Nội địa", "Quốc tế", "Hỗn hợp");
    private static final Set<String> TRANG_THAI_TAI_NGUYEN_HOP_LE = Set.of("Sẵn sàng", "Đang dùng", "Bảo trì", "Đóng");

    private final DanhMucVanHanhRepository repository;

    public DanhMucVanHanhService(DanhMucVanHanhRepository repository) {
        this.repository = repository;
    }

    public ThongKeDanhMucVanHanhDto layThongKe() {
        return repository.thongKe();
    }

    public List<HangHangKhongDto> layDanhSachHangHangKhong(String keyword, String quocGia) {
        return repository.layDanhSachHangHangKhong(keyword, quocGia);
    }

    public HangHangKhongDto layChiTietHangHangKhong(String maHangHangKhong) {
        return repository.layChiTietHangHangKhong(maHangHangKhong)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hãng hàng không."));
    }

    @Transactional
    public HangHangKhongDto themHangHangKhong(TaoHangHangKhongRequest request) {
        String maHang = request.maHang().trim();
        if (repository.tonTaiMaHang(maHang)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã hãng đã tồn tại.");
        }

        String maMoi = repository.taoMaHangHangKhongMoi();
        repository.themHangHangKhong(maMoi, request);
        return layChiTietHangHangKhong(maMoi);
    }

    @Transactional
    public HangHangKhongDto capNhatHangHangKhong(String maHangHangKhong, CapNhatHangHangKhongRequest request) {
        if (!repository.tonTaiHangHangKhong(maHangHangKhong)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hãng hàng không.");
        }
        String maHang = request.maHang().trim();
        if (repository.tonTaiMaHangKhac(maHang, maHangHangKhong)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã hãng đã tồn tại.");
        }

        repository.capNhatHangHangKhong(maHangHangKhong, request);
        return layChiTietHangHangKhong(maHangHangKhong);
    }

    @Transactional
    public void xoaHangHangKhong(String maHangHangKhong) {
        if (!repository.tonTaiHangHangKhong(maHangHangKhong)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hãng hàng không.");
        }
        if (repository.demChuyenBayTheoHang(maHangHangKhong) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa hãng hàng không vì đã có chuyến bay liên quan.");
        }
        repository.xoaHangHangKhong(maHangHangKhong);
    }

    public List<NhaGaDto> layDanhSachNhaGa(String keyword, String loaiNhaGa) {
        validateLoaiNhaGaNeuCo(loaiNhaGa);
        return repository.layDanhSachNhaGa(keyword, loaiNhaGa);
    }

    public NhaGaDto layChiTietNhaGa(String maNhaGa) {
        return repository.layChiTietNhaGa(maNhaGa)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhà ga."));
    }

    public List<Map<String, Object>> layNhaGaOptions() {
        return repository.layNhaGaOptions();
    }

    @Transactional
    public NhaGaDto themNhaGa(TaoNhaGaRequest request) {
        validateLoaiNhaGa(request.loaiNhaGa());
        String maMoi = repository.taoMaNhaGaMoi();
        repository.themNhaGa(maMoi, request);
        return layChiTietNhaGa(maMoi);
    }

    @Transactional
    public NhaGaDto capNhatNhaGa(String maNhaGa, CapNhatNhaGaRequest request) {
        if (!repository.tonTaiNhaGa(maNhaGa)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhà ga.");
        }
        validateLoaiNhaGa(request.loaiNhaGa());
        repository.capNhatNhaGa(maNhaGa, request);
        return layChiTietNhaGa(maNhaGa);
    }

    @Transactional
    public void xoaNhaGa(String maNhaGa) {
        if (!repository.tonTaiNhaGa(maNhaGa)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhà ga.");
        }
        if (repository.demTaiNguyenTheoNhaGa(maNhaGa) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa nhà ga vì đang có cổng hoặc băng chuyền liên quan.");
        }
        repository.xoaNhaGa(maNhaGa);
    }

    public List<CongDto> layDanhSachCong(String keyword, String maNhaGa, String trangThaiCong) {
        validateTrangThaiTaiNguyenNeuCo(trangThaiCong, "Trạng thái cổng không hợp lệ.");
        return repository.layDanhSachCong(keyword, maNhaGa, trangThaiCong);
    }

    public CongDto layChiTietCong(String maCong) {
        return repository.layChiTietCong(maCong)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cổng."));
    }

    @Transactional
    public CongDto themCong(TaoCongRequest request) {
        validateNhaGaTonTai(request.maNhaGa());
        validateTrangThaiTaiNguyen(request.trangThaiCong(), "Trạng thái cổng không hợp lệ.");
        String tenCong = request.tenCong().trim();
        if (repository.tonTaiTenCong(tenCong)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên cổng đã tồn tại.");
        }

        String maMoi = repository.taoMaCongMoi();
        repository.themCong(maMoi, request);
        return layChiTietCong(maMoi);
    }

    @Transactional
    public CongDto capNhatCong(String maCong, CapNhatCongRequest request) {
        if (!repository.tonTaiCong(maCong)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cổng.");
        }
        validateNhaGaTonTai(request.maNhaGa());
        validateTrangThaiTaiNguyen(request.trangThaiCong(), "Trạng thái cổng không hợp lệ.");
        String tenCong = request.tenCong().trim();
        if (repository.tonTaiTenCongKhac(tenCong, maCong)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên cổng đã tồn tại.");
        }

        repository.capNhatCong(maCong, request);
        return layChiTietCong(maCong);
    }

    @Transactional
    public CongDto capNhatTrangThaiCong(String maCong, String trangThaiCong) {
        if (!repository.tonTaiCong(maCong)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cổng.");
        }
        validateTrangThaiTaiNguyen(trangThaiCong, "Trạng thái cổng không hợp lệ.");
        repository.capNhatTrangThaiCong(maCong, trangThaiCong.trim());
        return layChiTietCong(maCong);
    }

    @Transactional
    public void xoaCong(String maCong) {
        if (!repository.tonTaiCong(maCong)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cổng.");
        }
        if (repository.demLienKetCong(maCong) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa cổng vì đã có lịch sử phân công hoặc thông báo liên quan.");
        }
        repository.xoaCong(maCong);
    }

    public List<BangChuyenHanhLyDto> layDanhSachBangChuyen(String keyword, String maNhaGa, String trangThaiBangChuyen) {
        validateTrangThaiTaiNguyenNeuCo(trangThaiBangChuyen, "Trạng thái băng chuyền không hợp lệ.");
        return repository.layDanhSachBangChuyen(keyword, maNhaGa, trangThaiBangChuyen);
    }

    public BangChuyenHanhLyDto layChiTietBangChuyen(String maBangChuyenHanhLy) {
        return repository.layChiTietBangChuyen(maBangChuyenHanhLy)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy băng chuyền."));
    }

    @Transactional
    public BangChuyenHanhLyDto themBangChuyen(TaoBangChuyenRequest request) {
        validateNhaGaTonTai(request.maNhaGa());
        validateTrangThaiTaiNguyen(request.trangThaiBangChuyen(), "Trạng thái băng chuyền không hợp lệ.");
        String tenBangChuyen = request.tenBangChuyenHanhLy().trim();
        if (repository.tonTaiTenBangChuyen(tenBangChuyen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên băng chuyền đã tồn tại.");
        }

        String maMoi = repository.taoMaBangChuyenMoi();
        repository.themBangChuyen(maMoi, request);
        return layChiTietBangChuyen(maMoi);
    }

    @Transactional
    public BangChuyenHanhLyDto capNhatBangChuyen(String maBangChuyenHanhLy, CapNhatBangChuyenRequest request) {
        if (!repository.tonTaiBangChuyen(maBangChuyenHanhLy)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy băng chuyền.");
        }
        validateNhaGaTonTai(request.maNhaGa());
        validateTrangThaiTaiNguyen(request.trangThaiBangChuyen(), "Trạng thái băng chuyền không hợp lệ.");
        String tenBangChuyen = request.tenBangChuyenHanhLy().trim();
        if (repository.tonTaiTenBangChuyenKhac(tenBangChuyen, maBangChuyenHanhLy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên băng chuyền đã tồn tại.");
        }

        repository.capNhatBangChuyen(maBangChuyenHanhLy, request);
        return layChiTietBangChuyen(maBangChuyenHanhLy);
    }

    @Transactional
    public BangChuyenHanhLyDto capNhatTrangThaiBangChuyen(String maBangChuyenHanhLy, String trangThaiBangChuyen) {
        if (!repository.tonTaiBangChuyen(maBangChuyenHanhLy)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy băng chuyền.");
        }
        validateTrangThaiTaiNguyen(trangThaiBangChuyen, "Trạng thái băng chuyền không hợp lệ.");
        repository.capNhatTrangThaiBangChuyen(maBangChuyenHanhLy, trangThaiBangChuyen.trim());
        return layChiTietBangChuyen(maBangChuyenHanhLy);
    }

    @Transactional
    public void xoaBangChuyen(String maBangChuyenHanhLy) {
        if (!repository.tonTaiBangChuyen(maBangChuyenHanhLy)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy băng chuyền.");
        }
        if (repository.demLienKetBangChuyen(maBangChuyenHanhLy) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa băng chuyền vì đã có lịch sử phân công hoặc thông báo liên quan.");
        }
        repository.xoaBangChuyen(maBangChuyenHanhLy);
    }

    public List<String> layDanhSachLoaiNhaGa() {
        return List.of("Nội địa", "Quốc tế", "Hỗn hợp");
    }

    public List<String> layDanhSachTrangThaiTaiNguyen() {
        return List.of("Sẵn sàng", "Đang dùng", "Bảo trì", "Đóng");
    }

    private void validateNhaGaTonTai(String maNhaGa) {
        if (!repository.tonTaiNhaGa(maNhaGa.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nhà ga không tồn tại.");
        }
    }

    private void validateLoaiNhaGaNeuCo(String loaiNhaGa) {
        if (loaiNhaGa != null && !loaiNhaGa.isBlank()) {
            validateLoaiNhaGa(loaiNhaGa);
        }
    }

    private void validateLoaiNhaGa(String loaiNhaGa) {
        if (loaiNhaGa == null || !LOAI_NHA_GA_HOP_LE.contains(loaiNhaGa.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại nhà ga không hợp lệ.");
        }
    }

    private void validateTrangThaiTaiNguyenNeuCo(String trangThai, String message) {
        if (trangThai != null && !trangThai.isBlank()) {
            validateTrangThaiTaiNguyen(trangThai, message);
        }
    }

    private void validateTrangThaiTaiNguyen(String trangThai, String message) {
        if (trangThai == null || !TRANG_THAI_TAI_NGUYEN_HOP_LE.contains(trangThai.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }
}
