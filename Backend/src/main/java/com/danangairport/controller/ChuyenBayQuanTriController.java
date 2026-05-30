package com.danangairport.controller;

import com.danangairport.dto.CapNhatChuyenBayRequest;
import com.danangairport.dto.CapNhatTinhHinhChuyenBayRequest;
import com.danangairport.dto.ChiTietChuyenBayDto;
import com.danangairport.dto.ChuyenBayDto;
import com.danangairport.dto.ChuyenBayOptionDto;
import com.danangairport.dto.TaoChuyenBayRequest;
import com.danangairport.dto.ThongKeChuyenBayDto;
import com.danangairport.dto.XoaChuyenBayRequest;
import com.danangairport.service.ChuyenBayQuanTriService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/flights")
public class ChuyenBayQuanTriController {
    private final ChuyenBayQuanTriService service;

    public ChuyenBayQuanTriController(ChuyenBayQuanTriService service) {
        this.service = service;
    }

    @GetMapping("/statistics")
    public ThongKeChuyenBayDto layThongKe() {
        return service.layThongKe();
    }

    @GetMapping
    public List<ChuyenBayDto> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String loaiChuyenBay,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String maHangHangKhong,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layDanhSach(keyword, loaiChuyenBay, trangThai, maHangHangKhong, tuNgay, denNgay);
    }

    @GetMapping("/{maLichTrinh}")
    public ChiTietChuyenBayDto layChiTiet(@PathVariable String maLichTrinh) {
        return service.layChiTiet(maLichTrinh);
    }

    @PostMapping
    public ResponseEntity<ChuyenBayDto> themChuyenBay(@Valid @RequestBody TaoChuyenBayRequest request) {
        return ResponseEntity.ok(service.themChuyenBay(request));
    }

    @PutMapping("/{maLichTrinh}")
    public ResponseEntity<ChuyenBayDto> capNhatChuyenBay(
            @PathVariable String maLichTrinh,
            @Valid @RequestBody CapNhatChuyenBayRequest request
    ) {
        return ResponseEntity.ok(service.capNhatChuyenBay(maLichTrinh, request));
    }

    @PatchMapping("/{maLichTrinh}/status")
    public ResponseEntity<ChuyenBayDto> capNhatTinhHinh(
            @PathVariable String maLichTrinh,
            @Valid @RequestBody CapNhatTinhHinhChuyenBayRequest request
    ) {
        return ResponseEntity.ok(service.capNhatTinhHinh(maLichTrinh, request));
    }

    @DeleteMapping("/{maLichTrinh}")
    public ResponseEntity<Map<String, String>> xoaMem(
            @PathVariable String maLichTrinh,
            @Valid @RequestBody(required = false) XoaChuyenBayRequest request
    ) {
        service.xoaMem(maLichTrinh, request);
        return ResponseEntity.ok(Map.of("message", "Đã xóa mềm lịch trình chuyến bay thành công."));
    }

    @GetMapping("/airlines/options")
    public List<ChuyenBayOptionDto> layHangHangKhongOptions() {
        return service.layHangHangKhongOptions();
    }

    @GetMapping("/types")
    public List<String> layLoaiChuyenBay() {
        return service.layLoaiChuyenBay();
    }

    @GetMapping("/statuses")
    public List<String> layTrangThaiChuyenBay() {
        return service.layTrangThaiChuyenBay();
    }
}
