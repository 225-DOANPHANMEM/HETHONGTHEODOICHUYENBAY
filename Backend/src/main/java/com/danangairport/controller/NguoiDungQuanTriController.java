package com.danangairport.controller;

import com.danangairport.dto.CapNhatNguoiDungRequest;
import com.danangairport.dto.DatLaiMatKhauRequest;
import com.danangairport.dto.DoiTrangThaiTaiKhoanRequest;
import com.danangairport.dto.NguoiDungDto;
import com.danangairport.dto.TaoNguoiDungRequest;
import com.danangairport.dto.ThongKeNguoiDungDto;
import com.danangairport.service.NguoiDungQuanTriService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class NguoiDungQuanTriController {
    private final NguoiDungQuanTriService service;

    public NguoiDungQuanTriController(NguoiDungQuanTriService service) {
        this.service = service;
    }

    @GetMapping
    public List<NguoiDungDto> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String vaiTro,
            @RequestParam(required = false) String trangThai
    ) {
        return service.layDanhSach(keyword, vaiTro, trangThai);
    }

    @GetMapping("/{maTaiKhoan}")
    public NguoiDungDto layChiTiet(@PathVariable String maTaiKhoan) {
        return service.layChiTiet(maTaiKhoan);
    }

    @GetMapping("/statistics")
    public ThongKeNguoiDungDto layThongKe() {
        return service.layThongKe();
    }

    @GetMapping("/roles")
    public List<String> layVaiTro() {
        return service.layDanhSachVaiTro();
    }

    @GetMapping("/statuses")
    public List<String> layTrangThai() {
        return service.layDanhSachTrangThai();
    }

    @PostMapping
    public ResponseEntity<NguoiDungDto> themNguoiDung(@Valid @RequestBody TaoNguoiDungRequest request) {
        return ResponseEntity.ok(service.themNguoiDung(request));
    }

    @PutMapping("/{maTaiKhoan}")
    public ResponseEntity<NguoiDungDto> capNhatNguoiDung(@PathVariable String maTaiKhoan, @Valid @RequestBody CapNhatNguoiDungRequest request) {
        return ResponseEntity.ok(service.capNhatNguoiDung(maTaiKhoan, request));
    }

    @PatchMapping("/{maTaiKhoan}/lock")
    public ResponseEntity<Map<String, String>> khoaTaiKhoan(@PathVariable String maTaiKhoan, @Valid @RequestBody DoiTrangThaiTaiKhoanRequest request) {
        service.khoaTaiKhoan(maTaiKhoan, request.getLyDo());
        return ResponseEntity.ok(Map.of("message", "Đã khóa tài khoản thành công"));
    }

    @PatchMapping("/{maTaiKhoan}/unlock")
    public ResponseEntity<Map<String, String>> moKhoaTaiKhoan(@PathVariable String maTaiKhoan) {
        service.moKhoaTaiKhoan(maTaiKhoan);
        return ResponseEntity.ok(Map.of("message", "Đã mở khóa tài khoản thành công"));
    }

    @PatchMapping("/{maTaiKhoan}/deactivate")
    public ResponseEntity<Map<String, String>> ngungSuDungTaiKhoan(@PathVariable String maTaiKhoan, @Valid @RequestBody DoiTrangThaiTaiKhoanRequest request) {
        service.ngungSuDungTaiKhoan(maTaiKhoan, request.getLyDo());
        return ResponseEntity.ok(Map.of("message", "Đã ngừng sử dụng tài khoản"));
    }

    @PatchMapping("/{maTaiKhoan}/reset-password")
    public ResponseEntity<Map<String, String>> datLaiMatKhau(@PathVariable String maTaiKhoan, @Valid @RequestBody DatLaiMatKhauRequest request) {
        service.datLaiMatKhau(maTaiKhoan, request.getMatKhauMoi());
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }
}
