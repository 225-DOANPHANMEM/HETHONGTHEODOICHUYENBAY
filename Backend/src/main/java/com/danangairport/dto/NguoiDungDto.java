package com.danangairport.dto;

public class NguoiDungDto {
    private String maTaiKhoan;
    private String tenDangNhap;
    private String soDienThoai;
    private String email;
    private String vaiTro;
    private String trangThaiTaiKhoan;
    private String ngayTao;

    public NguoiDungDto() {
    }

    public NguoiDungDto(String maTaiKhoan, String tenDangNhap, String soDienThoai, String email, String vaiTro, String trangThaiTaiKhoan, String ngayTao) {
        this.maTaiKhoan = maTaiKhoan;
        this.tenDangNhap = tenDangNhap;
        this.soDienThoai = soDienThoai;
        this.email = email;
        this.vaiTro = vaiTro;
        this.trangThaiTaiKhoan = trangThaiTaiKhoan;
        this.ngayTao = ngayTao;
    }

    public String getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(String maTaiKhoan) {
        this.maTaiKhoan = maTaiKhoan;
    }

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
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

    public String getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(String ngayTao) {
        this.ngayTao = ngayTao;
    }
}
