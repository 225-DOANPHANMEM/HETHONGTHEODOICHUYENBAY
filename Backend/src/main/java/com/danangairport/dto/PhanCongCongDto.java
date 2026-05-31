package com.danangairport.dto;

public record PhanCongCongDto(
        String maPhanCongCong,
        String maLichTrinh,
        String maCong,
        String tenCong,
        String tenNhaGa,
        String loaiCong,
        String thoiGianBatDauSuDung,
        String thoiGianKetThucSuDung,
        Boolean dangHienHanh
) {
}
