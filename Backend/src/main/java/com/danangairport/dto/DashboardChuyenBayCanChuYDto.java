package com.danangairport.dto;

public class DashboardChuyenBayCanChuYDto {

    private final String maChuyenBay;
    private final String maLichTrinh;
    private final String soHieuChuyenBay;
    private final String tenHangHangKhong;
    private final String loaiChuyenBay;
    private final String diemDi;
    private final String diemDen;
    private final String ngayBay;
    private final String trangThaiHienTai;
    private final Integer soPhutCham;
    private final String lyDoChamHoacHuy;
    private final String canhBao;

    public DashboardChuyenBayCanChuYDto(
            String maChuyenBay,
            String maLichTrinh,
            String soHieuChuyenBay,
            String tenHangHangKhong,
            String loaiChuyenBay,
            String diemDi,
            String diemDen,
            String ngayBay,
            String trangThaiHienTai,
            Integer soPhutCham,
            String lyDoChamHoacHuy,
            String canhBao
    ) {
        this.maChuyenBay = maChuyenBay;
        this.maLichTrinh = maLichTrinh;
        this.soHieuChuyenBay = soHieuChuyenBay;
        this.tenHangHangKhong = tenHangHangKhong;
        this.loaiChuyenBay = loaiChuyenBay;
        this.diemDi = diemDi;
        this.diemDen = diemDen;
        this.ngayBay = ngayBay;
        this.trangThaiHienTai = trangThaiHienTai;
        this.soPhutCham = soPhutCham;
        this.lyDoChamHoacHuy = lyDoChamHoacHuy;
        this.canhBao = canhBao;
    }

    public String getMaChuyenBay() { return maChuyenBay; }
    public String getMaLichTrinh() { return maLichTrinh; }
    public String getSoHieuChuyenBay() { return soHieuChuyenBay; }
    public String getTenHangHangKhong() { return tenHangHangKhong; }
    public String getLoaiChuyenBay() { return loaiChuyenBay; }
    public String getDiemDi() { return diemDi; }
    public String getDiemDen() { return diemDen; }
    public String getNgayBay() { return ngayBay; }
    public String getTrangThaiHienTai() { return trangThaiHienTai; }
    public Integer getSoPhutCham() { return soPhutCham; }
    public String getLyDoChamHoacHuy() { return lyDoChamHoacHuy; }
    public String getCanhBao() { return canhBao; }
}
