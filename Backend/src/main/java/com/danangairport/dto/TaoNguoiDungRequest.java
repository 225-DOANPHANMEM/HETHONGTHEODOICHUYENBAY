package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TaoNguoiDungRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(max = 20, message = "Tên đăng nhập tối đa 20 ký tự")
    private String tenDangNhap;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String matKhau;

    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    private String soDienThoai;

    @Size(max = 50, message = "Email tối đa 50 ký tự")
    private String email;

    @NotBlank(message = "Vai trò không được để trống")
    private String vaiTro;

    @NotBlank(message = "Trạng thái tài khoản không được để trống")
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
