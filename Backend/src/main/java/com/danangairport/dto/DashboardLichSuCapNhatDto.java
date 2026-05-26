package com.danangairport.dto;

public class DashboardLichSuCapNhatDto {

    private final String maLichSuCapNhat;
    private final String soHieuChuyenBay;
    private final String tenDangNhap;
    private final String trangThaiCu;
    private final String trangThaiMoi;
    private final Integer soPhutChamMoi;
    private final String lyDoCapNhat;
    private final String noiDungCapNhat;
    private final String thoiGianCapNhat;

    public DashboardLichSuCapNhatDto(
            String maLichSuCapNhat,
            String soHieuChuyenBay,
            String tenDangNhap,
            String trangThaiCu,
            String trangThaiMoi,
            Integer soPhutChamMoi,
            String lyDoCapNhat,
            String noiDungCapNhat,
            String thoiGianCapNhat
    ) {
        this.maLichSuCapNhat = maLichSuCapNhat;
        this.soHieuChuyenBay = soHieuChuyenBay;
        this.tenDangNhap = tenDangNhap;
        this.trangThaiCu = trangThaiCu;
        this.trangThaiMoi = trangThaiMoi;
        this.soPhutChamMoi = soPhutChamMoi;
        this.lyDoCapNhat = lyDoCapNhat;
        this.noiDungCapNhat = noiDungCapNhat;
        this.thoiGianCapNhat = thoiGianCapNhat;
    }

    public String getMaLichSuCapNhat() { return maLichSuCapNhat; }
    public String getSoHieuChuyenBay() { return soHieuChuyenBay; }
    public String getTenDangNhap() { return tenDangNhap; }
    public String getTrangThaiCu() { return trangThaiCu; }
    public String getTrangThaiMoi() { return trangThaiMoi; }
    public Integer getSoPhutChamMoi() { return soPhutChamMoi; }
    public String getLyDoCapNhat() { return lyDoCapNhat; }
    public String getNoiDungCapNhat() { return noiDungCapNhat; }
    public String getThoiGianCapNhat() { return thoiGianCapNhat; }
}
