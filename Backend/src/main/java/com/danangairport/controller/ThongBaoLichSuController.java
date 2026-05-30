package com.danangairport.controller;

import com.danangairport.dto.CapNhatTrangThaiThongBaoRequest;
import com.danangairport.dto.ChiTietLichSuCapNhatDto;
import com.danangairport.dto.ChiTietThongBaoDto;
import com.danangairport.dto.LichSuCapNhatDto;
import com.danangairport.dto.TaoThongBaoThuCongRequest;
import com.danangairport.dto.ThongBaoDto;
import com.danangairport.dto.ThongBaoOptionDto;
import com.danangairport.dto.ThongKeThongBaoLichSuDto;
import com.danangairport.service.ThongBaoLichSuService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications-history")
public class ThongBaoLichSuController {
    private final ThongBaoLichSuService service;

    public ThongBaoLichSuController(ThongBaoLichSuService service) {
        this.service = service;
    }

    @GetMapping("/statistics")
    public ThongKeThongBaoLichSuDto layThongKe() {
        return service.layThongKe();
    }

    @GetMapping("/notifications")
    public List<ThongBaoDto> layDanhSachThongBao(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThaiGui,
            @RequestParam(required = false) String phuongThucGui,
            @RequestParam(required = false) String trangThaiMoi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layDanhSachThongBao(keyword, trangThaiGui, phuongThucGui, trangThaiMoi, tuNgay, denNgay);
    }

    @GetMapping("/notifications/{maThongBao}")
    public ChiTietThongBaoDto layChiTietThongBao(@PathVariable String maThongBao) {
        return service.layChiTietThongBao(maThongBao);
    }

    @PatchMapping("/notifications/{maThongBao}/status")
    public ResponseEntity<ChiTietThongBaoDto> capNhatTrangThaiThongBao(
            @PathVariable String maThongBao,
            @Valid @RequestBody CapNhatTrangThaiThongBaoRequest request
    ) {
        return ResponseEntity.ok(service.capNhatTrangThaiThongBao(maThongBao, request));
    }

    @PostMapping("/notifications")
    public ResponseEntity<ChiTietThongBaoDto> taoThongBao(@Valid @RequestBody TaoThongBaoThuCongRequest request) {
        return ResponseEntity.ok(service.taoThongBao(request));
    }

    @GetMapping("/update-logs")
    public List<LichSuCapNhatDto> layDanhSachLichSu(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String maTaiKhoan,
            @RequestParam(required = false) String trangThaiMoi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layDanhSachLichSu(keyword, maTaiKhoan, trangThaiMoi, tuNgay, denNgay);
    }

    @GetMapping("/update-logs/{maLichSuCapNhat}")
    public ChiTietLichSuCapNhatDto layChiTietLichSu(@PathVariable String maLichSuCapNhat) {
        return service.layChiTietLichSu(maLichSuCapNhat);
    }

    @GetMapping("/notification-methods")
    public List<String> layPhuongThucGui() {
        return service.layPhuongThucGui();
    }

    @GetMapping("/notification-statuses")
    public List<String> layTrangThaiGui() {
        return service.layTrangThaiGui();
    }

    @GetMapping("/flight-statuses")
    public List<String> layTrangThaiChuyenBay() {
        return service.layTrangThaiChuyenBay();
    }

    @GetMapping("/accounts/options")
    public List<ThongBaoOptionDto> layTaiKhoanOptions() {
        return service.layTaiKhoanOptions();
    }

    @GetMapping("/schedules/options")
    public List<ThongBaoOptionDto> layLichTrinhOptions() {
        return service.layLichTrinhOptions();
    }

    @GetMapping("/gates/options")
    public List<ThongBaoOptionDto> layCongOptions() {
        return service.layCongOptions();
    }

    @GetMapping("/baggage-carousels/options")
    public List<ThongBaoOptionDto> layBangChuyenOptions() {
        return service.layBangChuyenOptions();
    }
}
