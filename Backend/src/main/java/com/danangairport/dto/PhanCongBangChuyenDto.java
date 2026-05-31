package com.danangairport.dto;

public record PhanCongBangChuyenDto(
        String maPhanCongBangChuyen,
        String maLichTrinh,
        String maBangChuyenHanhLy,
        String tenBangChuyenHanhLy,
        String tenNhaGa,
        String thoiGianBatDauSuDung,
        String thoiGianKetThucSuDung,
        Boolean dangHienHanh
) {
}
