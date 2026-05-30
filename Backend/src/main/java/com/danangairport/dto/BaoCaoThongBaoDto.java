package com.danangairport.dto;

import java.util.List;

public record BaoCaoThongBaoDto(
        long tongThongBao,
        long soChoGui,
        long soDaGui,
        long soLoiGui,
        List<TheoPhuongThuc> theoPhuongThuc
) {
    public record TheoPhuongThuc(
            String phuongThucGui,
            long soLuong
    ) {
    }
}
