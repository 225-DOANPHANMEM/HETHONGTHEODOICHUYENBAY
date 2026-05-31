package com.danangairport.dto;

import java.util.List;

public class DashboardTongQuanResponseDto {

    private final long tongChuyenBay;
    private final long soChuyenBayDen;
    private final long soChuyenBayDi;
    private final long soDangLamThuTuc;
    private final long soDangBay;
    private final long soChamChuyen;
    private final long soHuyChuyen;
    private final long soHoanThanh;
    private final long soCongDangDung;
    private final long soBangChuyenDangDung;
    private final List<DashboardChuyenBayCanChuYDto> chuyenBayCanChuY;
    private final List<DashboardThongBaoDto> thongBaoGanDay;
    private final List<DashboardLichSuCapNhatDto> lichSuCapNhatGanDay;

    public DashboardTongQuanResponseDto(
            long tongChuyenBay,
            long soChuyenBayDen,
            long soChuyenBayDi,
            long soDangLamThuTuc,
            long soDangBay,
            long soChamChuyen,
            long soHuyChuyen,
            long soHoanThanh,
            long soCongDangDung,
            long soBangChuyenDangDung,
            List<DashboardChuyenBayCanChuYDto> chuyenBayCanChuY,
            List<DashboardThongBaoDto> thongBaoGanDay,
            List<DashboardLichSuCapNhatDto> lichSuCapNhatGanDay
    ) {
        this.tongChuyenBay = tongChuyenBay;
        this.soChuyenBayDen = soChuyenBayDen;
        this.soChuyenBayDi = soChuyenBayDi;
        this.soDangLamThuTuc = soDangLamThuTuc;
        this.soDangBay = soDangBay;
        this.soChamChuyen = soChamChuyen;
        this.soHuyChuyen = soHuyChuyen;
        this.soHoanThanh = soHoanThanh;
        this.soCongDangDung = soCongDangDung;
        this.soBangChuyenDangDung = soBangChuyenDangDung;
        this.chuyenBayCanChuY = chuyenBayCanChuY;
        this.thongBaoGanDay = thongBaoGanDay;
        this.lichSuCapNhatGanDay = lichSuCapNhatGanDay;
    }

    public long getTongChuyenBay() { return tongChuyenBay; }
    public long getSoChuyenBayDen() { return soChuyenBayDen; }
    public long getSoChuyenBayDi() { return soChuyenBayDi; }
    public long getSoDangLamThuTuc() { return soDangLamThuTuc; }
    public long getSoDangBay() { return soDangBay; }
    public long getSoChamChuyen() { return soChamChuyen; }
    public long getSoHuyChuyen() { return soHuyChuyen; }
    public long getSoHoanThanh() { return soHoanThanh; }
    public long getSoCongDangDung() { return soCongDangDung; }
    public long getSoBangChuyenDangDung() { return soBangChuyenDangDung; }
    public List<DashboardChuyenBayCanChuYDto> getChuyenBayCanChuY() { return chuyenBayCanChuY; }
    public List<DashboardThongBaoDto> getThongBaoGanDay() { return thongBaoGanDay; }
    public List<DashboardLichSuCapNhatDto> getLichSuCapNhatGanDay() { return lichSuCapNhatGanDay; }
}
