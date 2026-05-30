package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CapNhatNguoiDungRequest {
    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    private String soDienThoai;

    @Size(max = 50, message = "Email tối đa 50 ký tự")
    private String email;

    @NotBlank(message = "Vai trò không được để trống")
    private String vaiTro;

    @NotBlank(message = "Trạng thái tài khoản không được để trống")
    private String trangThaiTaiKhoan;

    @Size(max = 255, message = "Lý do tối đa 255 ký tự")
    private String lyDo;

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

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }
}
