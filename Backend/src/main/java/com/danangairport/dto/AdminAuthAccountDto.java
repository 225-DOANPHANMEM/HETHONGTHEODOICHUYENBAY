package com.danangairport.dto;

public record AdminAuthAccountDto(
        String maTaiKhoan,
        String tenDangNhap,
        String email,
        String vaiTro,
        String trangThaiTaiKhoan
) {
}
