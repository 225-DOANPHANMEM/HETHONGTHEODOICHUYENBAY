package com.danangairport.dto;

public record BaoCaoHangHangKhongDto(
        String maHangHangKhong,
        String maHang,
        String tenHangHangKhong,
        long tongChuyenBay,
        long soChuyenBayDen,
        long soChuyenBayDi,
        long soChamChuyen,
        long soHuyChuyen,
        long soHoanThanh,
        long tongSoPhutCham,
        double soPhutChamTrungBinh
) {
}
