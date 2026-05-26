package com.danangairport.dto;

public class DashboardThongBaoDto {

    private final String maThongBao;
    private final String soHieuChuyenBay;
    private final String noiDungThongBao;
    private final String trangThaiMoi;
    private final String phuongThucGui;
    private final String trangThaiGui;
    private final String thoiGianGui;

    public DashboardThongBaoDto(
            String maThongBao,
            String soHieuChuyenBay,
            String noiDungThongBao,
            String trangThaiMoi,
            String phuongThucGui,
            String trangThaiGui,
            String thoiGianGui
    ) {
        this.maThongBao = maThongBao;
        this.soHieuChuyenBay = soHieuChuyenBay;
        this.noiDungThongBao = noiDungThongBao;
        this.trangThaiMoi = trangThaiMoi;
        this.phuongThucGui = phuongThucGui;
        this.trangThaiGui = trangThaiGui;
        this.thoiGianGui = thoiGianGui;
    }

    public String getMaThongBao() { return maThongBao; }
    public String getSoHieuChuyenBay() { return soHieuChuyenBay; }
    public String getNoiDungThongBao() { return noiDungThongBao; }
    public String getTrangThaiMoi() { return trangThaiMoi; }
    public String getPhuongThucGui() { return phuongThucGui; }
    public String getTrangThaiGui() { return trangThaiGui; }
    public String getThoiGianGui() { return thoiGianGui; }
}
