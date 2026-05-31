package com.danangairport.service;

import com.danangairport.dto.CapNhatNguoiDungRequest;
import com.danangairport.dto.NguoiDungDto;
import com.danangairport.dto.TaoNguoiDungRequest;
import com.danangairport.dto.ThongKeNguoiDungDto;
import com.danangairport.repository.NguoiDungQuanTriRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class NguoiDungQuanTriService {
    private static final String TRANG_THAI_HOAT_DONG = "Hoạt động";
    private static final String TRANG_THAI_KHOA = "Khóa";
    private static final String TRANG_THAI_NGUNG_SU_DUNG = "Ngừng sử dụng";
    private static final Set<String> VAI_TRO_HOP_LE = Set.of("Quản trị", "Điều phối", "Khách hàng");
    private static final Set<String> TRANG_THAI_HOP_LE = Set.of(
            TRANG_THAI_HOAT_DONG,
            TRANG_THAI_KHOA,
            TRANG_THAI_NGUNG_SU_DUNG
    );

    private final NguoiDungQuanTriRepository repository;

    public NguoiDungQuanTriService(NguoiDungQuanTriRepository repository) {
        this.repository = repository;
    }

    public List<NguoiDungDto> layDanhSach(String keyword, String vaiTro, String trangThai) {
        validateVaiTroNeuCo(vaiTro);
        validateTrangThaiNeuCo(trangThai);
        return repository.layDanhSach(keyword, vaiTro, trangThai);
    }

    public NguoiDungDto layChiTiet(String maTaiKhoan) {
        return repository.layChiTiet(maTaiKhoan).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản")
        );
    }

    public ThongKeNguoiDungDto layThongKe() {
        return repository.thongKe();
    }

    public List<String> layDanhSachVaiTro() {
        return List.of("Quản trị", "Điều phối", "Khách hàng");
    }

    public List<String> layDanhSachTrangThai() {
        return List.of(TRANG_THAI_HOAT_DONG, TRANG_THAI_KHOA, TRANG_THAI_NGUNG_SU_DUNG);
    }

    public NguoiDungDto themNguoiDung(TaoNguoiDungRequest request) {
        String tenDangNhap = request.getTenDangNhap().trim();
        String email = trimToNull(request.getEmail());
        validateVaiTro(request.getVaiTro());
        validateTrangThai(request.getTrangThaiTaiKhoan());

        if (repository.tonTaiTenDangNhap(tenDangNhap)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại");
        }
        if (email != null && repository.tonTaiEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }

        String maMoi = repository.taoMaTaiKhoanMoi();
        repository.themNguoiDung(maMoi, request, request.getMatKhau().trim());
        return layChiTiet(maMoi);
    }

    public NguoiDungDto capNhatNguoiDung(String maTaiKhoan, CapNhatNguoiDungRequest request) {
        if (!repository.tonTaiMaTaiKhoan(maTaiKhoan)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản");
        }
        String email = trimToNull(request.getEmail());
        validateVaiTro(request.getVaiTro());
        validateTrangThai(request.getTrangThaiTaiKhoan());
        validateLyDoNeuCan(request.getTrangThaiTaiKhoan(), request.getLyDo());
        if (email != null && repository.tonTaiEmailKhacMa(email, maTaiKhoan)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }
        repository.capNhatNguoiDung(maTaiKhoan, request);
        return layChiTiet(maTaiKhoan);
    }

    public void khoaTaiKhoan(String maTaiKhoan, String lyDo) {
        validateLyDoBatBuoc(lyDo);
        capNhatTrangThai(maTaiKhoan, TRANG_THAI_KHOA);
    }

    public void moKhoaTaiKhoan(String maTaiKhoan) {
        capNhatTrangThai(maTaiKhoan, TRANG_THAI_HOAT_DONG);
    }

    public void ngungSuDungTaiKhoan(String maTaiKhoan, String lyDo) {
        validateLyDoBatBuoc(lyDo);
        capNhatTrangThai(maTaiKhoan, TRANG_THAI_NGUNG_SU_DUNG);
    }

    public void datLaiMatKhau(String maTaiKhoan, String matKhauMoi) {
        if (!repository.tonTaiMaTaiKhoan(maTaiKhoan)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản");
        }
        repository.datLaiMatKhau(maTaiKhoan, matKhauMoi.trim());
    }

    private void capNhatTrangThai(String maTaiKhoan, String trangThai) {
        if (!repository.tonTaiMaTaiKhoan(maTaiKhoan)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản");
        }
        repository.capNhatTrangThai(maTaiKhoan, trangThai);
    }

    private void validateVaiTroNeuCo(String vaiTro) {
        if (vaiTro != null && !vaiTro.isBlank()) {
            validateVaiTro(vaiTro);
        }
    }

    private void validateTrangThaiNeuCo(String trangThai) {
        if (trangThai != null && !trangThai.isBlank()) {
            validateTrangThai(trangThai);
        }
    }

    private void validateVaiTro(String vaiTro) {
        if (vaiTro == null || !VAI_TRO_HOP_LE.contains(vaiTro.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò không hợp lệ");
        }
    }

    private void validateTrangThai(String trangThai) {
        if (trangThai == null || !TRANG_THAI_HOP_LE.contains(trangThai.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái tài khoản không hợp lệ");
        }
    }

    private void validateLyDoNeuCan(String trangThai, String lyDo) {
        if (TRANG_THAI_KHOA.equals(trangThai) || TRANG_THAI_NGUNG_SU_DUNG.equals(trangThai)) {
            validateLyDoBatBuoc(lyDo);
        }
    }

    private void validateLyDoBatBuoc(String lyDo) {
        if (lyDo == null || lyDo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do khi khóa hoặc ngừng sử dụng tài khoản");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
