package com.danangairport.dto;

public record ChiTietLichSuCapNhatDto(
        String maLichSuCapNhat,
        String maLichTrinh,
        String maTaiKhoan,
        String tenDangNhap,
        String soHieuChuyenBay,
        String tenHangHangKhong,
        String loaiChuyenBay,
        String diemDi,
        String diemDen,
        String ngayBay,
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
