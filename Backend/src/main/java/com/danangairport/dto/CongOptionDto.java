package com.danangairport.dto;

public record CongOptionDto(
        String maCong,
        String tenCong,
        String maNhaGa,
        String tenNhaGa,
        String loaiNhaGa,
        String trangThaiCong,
        Boolean coSanSang,
        String ghiChu
) {
}
