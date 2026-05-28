package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TaoNguoiDungRequest {
    @NotBlank(message = "Ten dang nhap khong duoc de trong")
    @Size(max = 20, message = "Ten dang nhap toi da 20 ky tu")
    private String tenDangNhap;

    @NotBlank(message = "Mat khau khong duoc de trong")
    private String matKhau;

    @Size(max = 15, message = "So dien thoai toi da 15 ky tu")
    private String soDienThoai;

    @Size(max = 50, message = "Email toi da 50 ky tu")
    private String email;

    @NotBlank(message = "Vai tro khong duoc de trong")
    private String vaiTro;

    @NotBlank(message = "Trang thai tai khoan khong duoc de trong")
    private String trangThaiTaiKhoan;

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(String vaiTro) {
        this.vaiTro = vaiTro;
    }

    public String getTrangThaiTaiKhoan() {
        return trangThaiTaiKhoan;
    }

    public void setTrangThaiTaiKhoan(String trangThaiTaiKhoan) {
        this.trangThaiTaiKhoan = trangThaiTaiKhoan;
    }
}
