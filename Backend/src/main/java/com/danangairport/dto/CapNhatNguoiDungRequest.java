package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CapNhatNguoiDungRequest {
    @Size(max = 15, message = "So dien thoai toi da 15 ky tu")
    private String soDienThoai;

    @Size(max = 50, message = "Email toi da 50 ky tu")
    private String email;

    @NotBlank(message = "Vai tro khong duoc de trong")
    private String vaiTro;

    @NotBlank(message = "Trang thai tai khoan khong duoc de trong")
    private String trangThaiTaiKhoan;

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
