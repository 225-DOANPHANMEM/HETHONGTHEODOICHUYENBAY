package com.danangairport.dto;

import java.util.List;

public record BaoCaoTaiNguyenDto(
        List<Cong> cong,
        List<BangChuyen> bangChuyen
) {
    public record Cong(
            String maCong,
            String tenCong,
            String tenNhaGa,
            String trangThaiCong,
            long soLanPhanCong
    ) {
    }

    public record BangChuyen(
            String maBangChuyenHanhLy,
            String tenBangChuyenHanhLy,
            String tenNhaGa,
            String trangThaiBangChuyen,
            long soLanPhanCong
    ) {
    }
}
