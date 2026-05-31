package com.danangairport.dto;

public record BaoCaoChuyenBayDto(
        String maChuyenBay,
        String soHieuChuyenBay,
        String tenHangHangKhong,
        String loaiChuyenBay,
        String diemDi,
        String diemDen,
        String ngayBay,
        String trangThaiHienTai,
        Integer soPhutCham
) {
}
