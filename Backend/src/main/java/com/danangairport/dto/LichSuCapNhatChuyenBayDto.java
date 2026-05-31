package com.danangairport.dto;

public record LichSuCapNhatChuyenBayDto(
        String maLichSuCapNhat,
        String tenDangNhap,
        String trangThaiCu,
        String trangThaiMoi,
        String gioUocTinhCu,
        String gioUocTinhMoi,
        Integer soPhutChamMoi,
        String lyDoCapNhat,
        String noiDungCapNhat,
        String thoiGianCapNhat
) {
}
