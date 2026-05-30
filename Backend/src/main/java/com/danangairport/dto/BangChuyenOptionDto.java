package com.danangairport.dto;

public record BangChuyenOptionDto(
        String maBangChuyenHanhLy,
        String tenBangChuyenHanhLy,
        String maNhaGa,
        String tenNhaGa,
        String trangThaiBangChuyen,
        Boolean coSanSang,
        String ghiChu
) {
}
