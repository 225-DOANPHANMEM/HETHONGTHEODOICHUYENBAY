package com.danangairport.controller;

import com.danangairport.dto.BaoCaoHangHangKhongDto;
import com.danangairport.dto.BaoCaoLichSuCapNhatDto;
import com.danangairport.dto.BaoCaoTaiNguyenDto;
import com.danangairport.dto.BaoCaoTheoNgayDto;
import com.danangairport.dto.BaoCaoThongBaoDto;
import com.danangairport.dto.BaoCaoTongQuanDto;
import com.danangairport.dto.BaoCaoTrangThaiDto;
import com.danangairport.service.BaoCaoVanHanhService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
public class BaoCaoVanHanhController {
    private final BaoCaoVanHanhService service;

    public BaoCaoVanHanhController(BaoCaoVanHanhService service) {
        this.service = service;
    }

    @GetMapping("/overview")
    public BaoCaoTongQuanDto layTongQuan(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layTongQuan(tuNgay, denNgay);
    }

    @GetMapping("/by-date")
    public List<BaoCaoTheoNgayDto> layTheoNgay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layTheoNgay(tuNgay, denNgay);
    }

    @GetMapping("/by-status")
    public List<BaoCaoTrangThaiDto> layTheoTrangThai(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layTheoTrangThai(tuNgay, denNgay);
    }

    @GetMapping("/by-airline")
    public List<BaoCaoHangHangKhongDto> layTheoHangHangKhong(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layTheoHangHangKhong(tuNgay, denNgay);
    }

    @GetMapping("/resources")
    public BaoCaoTaiNguyenDto layTaiNguyen(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layTaiNguyen(tuNgay, denNgay);
    }

    @GetMapping("/notifications")
    public BaoCaoThongBaoDto layThongBao(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layThongBao(tuNgay, denNgay);
    }

    @GetMapping("/update-logs")
    public BaoCaoLichSuCapNhatDto layLichSuCapNhat(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        return service.layLichSuCapNhat(tuNgay, denNgay);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> xuatCsv(
            @RequestParam(defaultValue = "overview") String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay
    ) {
        byte[] csv = service.xuatCsv(type, tuNgay, denNgay);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-van-hanh.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}
