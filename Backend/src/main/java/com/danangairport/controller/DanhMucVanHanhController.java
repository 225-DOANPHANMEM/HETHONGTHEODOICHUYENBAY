package com.danangairport.controller;

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
import com.danangairport.service.DanhMucVanHanhService;
import jakarta.validation.Valid;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/operation-categories")
public class DanhMucVanHanhController {
    private final DanhMucVanHanhService service;

    public DanhMucVanHanhController(DanhMucVanHanhService service) {
        this.service = service;
    }

    @GetMapping("/statistics")
    public ThongKeDanhMucVanHanhDto layThongKe() {
        return service.layThongKe();
    }

    @GetMapping("/airlines")
    public List<HangHangKhongDto> layDanhSachHangHangKhong(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String quocGia
    ) {
        return service.layDanhSachHangHangKhong(keyword, quocGia);
    }

    @GetMapping("/airlines/{maHangHangKhong}")
    public HangHangKhongDto layChiTietHangHangKhong(@PathVariable String maHangHangKhong) {
        return service.layChiTietHangHangKhong(maHangHangKhong);
    }

    @PostMapping("/airlines")
    public ResponseEntity<HangHangKhongDto> themHangHangKhong(@Valid @RequestBody TaoHangHangKhongRequest request) {
        return ResponseEntity.ok(service.themHangHangKhong(request));
    }

    @PutMapping("/airlines/{maHangHangKhong}")
    public ResponseEntity<HangHangKhongDto> capNhatHangHangKhong(
            @PathVariable String maHangHangKhong,
            @Valid @RequestBody CapNhatHangHangKhongRequest request
    ) {
        return ResponseEntity.ok(service.capNhatHangHangKhong(maHangHangKhong, request));
    }

    @DeleteMapping("/airlines/{maHangHangKhong}")
    public ResponseEntity<Map<String, String>> xoaHangHangKhong(@PathVariable String maHangHangKhong) {
        service.xoaHangHangKhong(maHangHangKhong);
        return ResponseEntity.ok(Map.of("message", "Đã xóa hãng hàng không thành công."));
    }

    @GetMapping("/terminals")
    public List<NhaGaDto> layDanhSachNhaGa(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String loaiNhaGa
    ) {
        return service.layDanhSachNhaGa(keyword, loaiNhaGa);
    }

    @GetMapping("/terminals/options")
    public List<Map<String, Object>> layNhaGaOptions() {
        return service.layNhaGaOptions();
    }

    @GetMapping("/terminals/{maNhaGa}")
    public NhaGaDto layChiTietNhaGa(@PathVariable String maNhaGa) {
        return service.layChiTietNhaGa(maNhaGa);
    }

    @PostMapping("/terminals")
    public ResponseEntity<NhaGaDto> themNhaGa(@Valid @RequestBody TaoNhaGaRequest request) {
        return ResponseEntity.ok(service.themNhaGa(request));
    }

    @PutMapping("/terminals/{maNhaGa}")
    public ResponseEntity<NhaGaDto> capNhatNhaGa(
            @PathVariable String maNhaGa,
            @Valid @RequestBody CapNhatNhaGaRequest request
    ) {
        return ResponseEntity.ok(service.capNhatNhaGa(maNhaGa, request));
    }

    @DeleteMapping("/terminals/{maNhaGa}")
    public ResponseEntity<Map<String, String>> xoaNhaGa(@PathVariable String maNhaGa) {
        service.xoaNhaGa(maNhaGa);
        return ResponseEntity.ok(Map.of("message", "Đã xóa nhà ga thành công."));
    }

    @GetMapping("/gates")
    public List<CongDto> layDanhSachCong(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String maNhaGa,
            @RequestParam(required = false) String trangThaiCong
    ) {
        return service.layDanhSachCong(keyword, maNhaGa, trangThaiCong);
    }

    @GetMapping("/gates/{maCong}")
    public CongDto layChiTietCong(@PathVariable String maCong) {
        return service.layChiTietCong(maCong);
    }

    @PostMapping("/gates")
    public ResponseEntity<CongDto> themCong(@Valid @RequestBody TaoCongRequest request) {
        return ResponseEntity.ok(service.themCong(request));
    }

    @PutMapping("/gates/{maCong}")
    public ResponseEntity<CongDto> capNhatCong(
            @PathVariable String maCong,
            @Valid @RequestBody CapNhatCongRequest request
    ) {
        return ResponseEntity.ok(service.capNhatCong(maCong, request));
    }

    @PatchMapping("/gates/{maCong}/status")
    public ResponseEntity<CongDto> capNhatTrangThaiCong(
            @PathVariable String maCong,
            @RequestBody Map<String, String> request
    ) {
        return ResponseEntity.ok(service.capNhatTrangThaiCong(maCong, request.get("trangThaiCong")));
    }

    @DeleteMapping("/gates/{maCong}")
    public ResponseEntity<Map<String, String>> xoaCong(@PathVariable String maCong) {
        service.xoaCong(maCong);
        return ResponseEntity.ok(Map.of("message", "Đã xóa cổng thành công."));
    }

    @GetMapping("/baggage-carousels")
    public List<BangChuyenHanhLyDto> layDanhSachBangChuyen(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String maNhaGa,
            @RequestParam(required = false) String trangThaiBangChuyen
    ) {
        return service.layDanhSachBangChuyen(keyword, maNhaGa, trangThaiBangChuyen);
    }

    @GetMapping("/baggage-carousels/{maBangChuyenHanhLy}")
    public BangChuyenHanhLyDto layChiTietBangChuyen(@PathVariable String maBangChuyenHanhLy) {
        return service.layChiTietBangChuyen(maBangChuyenHanhLy);
    }

    @PostMapping("/baggage-carousels")
    public ResponseEntity<BangChuyenHanhLyDto> themBangChuyen(@Valid @RequestBody TaoBangChuyenRequest request) {
        return ResponseEntity.ok(service.themBangChuyen(request));
    }

    @PutMapping("/baggage-carousels/{maBangChuyenHanhLy}")
    public ResponseEntity<BangChuyenHanhLyDto> capNhatBangChuyen(
            @PathVariable String maBangChuyenHanhLy,
            @Valid @RequestBody CapNhatBangChuyenRequest request
    ) {
        return ResponseEntity.ok(service.capNhatBangChuyen(maBangChuyenHanhLy, request));
    }

    @PatchMapping("/baggage-carousels/{maBangChuyenHanhLy}/status")
    public ResponseEntity<BangChuyenHanhLyDto> capNhatTrangThaiBangChuyen(
            @PathVariable String maBangChuyenHanhLy,
            @RequestBody Map<String, String> request
    ) {
        return ResponseEntity.ok(service.capNhatTrangThaiBangChuyen(maBangChuyenHanhLy, request.get("trangThaiBangChuyen")));
    }

    @DeleteMapping("/baggage-carousels/{maBangChuyenHanhLy}")
    public ResponseEntity<Map<String, String>> xoaBangChuyen(@PathVariable String maBangChuyenHanhLy) {
        service.xoaBangChuyen(maBangChuyenHanhLy);
        return ResponseEntity.ok(Map.of("message", "Đã xóa băng chuyền thành công."));
    }

    @GetMapping("/terminal-types")
    public List<String> layLoaiNhaGa() {
        return service.layDanhSachLoaiNhaGa();
    }

    @GetMapping("/resource-statuses")
    public List<String> layTrangThaiTaiNguyen() {
        return service.layDanhSachTrangThaiTaiNguyen();
    }
}
