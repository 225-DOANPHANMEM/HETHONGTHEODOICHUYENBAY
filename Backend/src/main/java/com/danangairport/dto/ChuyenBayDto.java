package com.danangairport.dto;

public record ChuyenBayDto(
        String maChuyenBay,
        String maLichTrinh,
        String soHieuChuyenBay,
        String maHangHangKhong,
        String tenHangHangKhong,
        String loaiChuyenBay,
        String diemDi,
        String diemDen,
        String ngayBay,
        String gioDuKienKhoiHanh,
        String gioDuKienHaCanh,
        String gioUocTinhKhoiHanh,
        String gioUocTinhHaCanh,
        String gioThucTeKhoiHanh,
        String gioThucTeHaCanh,
        String trangThaiHienTai,
        Integer soPhutCham,
        String lyDoChamHoacHuy,
        String maCong,
        String tenCong,
        String tenNhaGa,
        String thoiGianBatDauSuDungCong,
        String thoiGianKetThucSuDungCong,
        String maBangChuyenHanhLy,
        String tenBangChuyenHanhLy,
        String tenNhaGaBangChuyen,
        String thoiGianBatDauSuDungBangChuyen,
        String thoiGianKetThucSuDungBangChuyen
) {
}
