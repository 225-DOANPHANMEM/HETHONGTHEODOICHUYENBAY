package com.danangairport.dto;

import java.util.List;

public record ChiTietChuyenBayDto(
        ChuyenBayDto thongTinChuyenBay,
        List<LichSuCapNhatChuyenBayDto> lichSuCapNhatGanDay,
        List<ThongBaoChuyenBayDto> thongBaoGanDay
) {
}
