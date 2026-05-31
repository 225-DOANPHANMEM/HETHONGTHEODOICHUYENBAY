package com.danangairport.controller;

import com.danangairport.dto.BangChuyenOptionDto;
import com.danangairport.dto.CapNhatTinhHinhChuyenBayRequest;
import com.danangairport.dto.ChuyenBayDto;
import com.danangairport.dto.CongOptionDto;
import com.danangairport.dto.DieuPhoiTongQuanDto;
import com.danangairport.dto.LichTrinhDieuPhoiDto;
import com.danangairport.dto.PhanCongBangChuyenDto;
import com.danangairport.dto.PhanCongCongDto;
import com.danangairport.dto.TaoPhanCongBangChuyenRequest;
import com.danangairport.dto.TaoPhanCongCongRequest;
import com.danangairport.dto.ThongKeDieuPhoiDto;
import com.danangairport.service.DieuPhoiVanHanhService;
import com.danangairport.service.ChuyenBayQuanTriService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dispatch")
public class DieuPhoiVanHanhController {
    private final DieuPhoiVanHanhService service;
    private final ChuyenBayQuanTriService chuyenBayService;

    public DieuPhoiVanHanhController(DieuPhoiVanHanhService service, ChuyenBayQuanTriService chuyenBayService) {
        this.service = service;
        this.chuyenBayService = chuyenBayService;
    }

    @GetMapping("/statistics")
    public ThongKeDieuPhoiDto layThongKe() {
        return service.layThongKe();
    }

    @GetMapping("/schedules")
    public List<LichTrinhDieuPhoiDto> layDanhSachLichTrinh(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayBay,
            @RequestParam(required = false) String loaiChuyenBay,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false, defaultValue = "tat-ca") String tinhTrangCong,
            @RequestParam(required = false, defaultValue = "tat-ca") String tinhTrangBangChuyen
    ) {
        return service.layDanhSachLichTrinh(keyword, ngayBay, loaiChuyenBay, trangThai, tinhTrangCong, tinhTrangBangChuyen);
    }

    @GetMapping("/schedules/{maLichTrinh}")
    public DieuPhoiTongQuanDto layChiTiet(@PathVariable String maLichTrinh) {
        return service.layChiTiet(maLichTrinh);
    }

    @PatchMapping("/schedules/{maLichTrinh}/status")
    public ResponseEntity<ChuyenBayDto> capNhatTinhHinh(
            @PathVariable String maLichTrinh,
            @Valid @RequestBody CapNhatTinhHinhChuyenBayRequest request
    ) {
        return ResponseEntity.ok(chuyenBayService.capNhatTinhHinh(maLichTrinh, request));
    }

    @GetMapping("/available-gates")
    public List<CongOptionDto> layCongKhaDung(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime thoiGianBatDau,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime thoiGianKetThuc,
            @RequestParam(required = false) String maNhaGa,
            @RequestParam(required = false) String loaiCong,
            @RequestParam(required = false) String maPhanCongBoQua
    ) {
        return service.layCongKhaDung(thoiGianBatDau, thoiGianKetThuc, maNhaGa, loaiCong, maPhanCongBoQua);
    }

    @GetMapping("/available-baggage-carousels")
    public List<BangChuyenOptionDto> layBangChuyenKhaDung(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime thoiGianBatDau,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime thoiGianKetThuc,
            @RequestParam(required = false) String maNhaGa,
            @RequestParam(required = false) String maPhanCongBoQua
    ) {
        return service.layBangChuyenKhaDung(thoiGianBatDau, thoiGianKetThuc, maNhaGa, maPhanCongBoQua);
    }

    @PostMapping("/gate-assignments")
    public ResponseEntity<PhanCongCongDto> phanCongCong(@Valid @RequestBody TaoPhanCongCongRequest request) {
        return ResponseEntity.ok(service.phanCongCong(request));
    }

    @PostMapping("/baggage-assignments")
    public ResponseEntity<PhanCongBangChuyenDto> phanCongBangChuyen(@Valid @RequestBody TaoPhanCongBangChuyenRequest request) {
        return ResponseEntity.ok(service.phanCongBangChuyen(request));
    }

    @PatchMapping("/gate-assignments/{maPhanCongCong}/deactivate")
    public ResponseEntity<Map<String, String>> huyPhanCongCong(@PathVariable String maPhanCongCong) {
        service.huyPhanCongCong(maPhanCongCong);
        return ResponseEntity.ok(Map.of("message", "Đã hủy hiệu lực phân công cổng thành công."));
    }

    @PatchMapping("/baggage-assignments/{maPhanCongBangChuyen}/deactivate")
    public ResponseEntity<Map<String, String>> huyPhanCongBangChuyen(@PathVariable String maPhanCongBangChuyen) {
        service.huyPhanCongBangChuyen(maPhanCongBangChuyen);
        return ResponseEntity.ok(Map.of("message", "Đã hủy hiệu lực phân công băng chuyền thành công."));
    }

    @GetMapping("/terminal-options")
    public List<Map<String, Object>> layNhaGaOptions() {
        return service.layNhaGaOptions();
    }

    @GetMapping("/gate-types")
    public List<String> layLoaiCong() {
        return service.layLoaiCong();
    }

    @GetMapping("/flight-types")
    public List<String> layLoaiChuyenBay() {
        return service.layLoaiChuyenBay();
    }

    @GetMapping("/flight-statuses")
    public List<String> layTrangThaiChuyenBay() {
        return service.layTrangThaiChuyenBay();
    }
}
