package com.danangairport.dto;

public record ThongKeDieuPhoiDto(
        Long tongLichTrinh,
        Long lichTrinhDaPhanCongCong,
        Long lichTrinhChuaPhanCongCong,
        Long lichTrinhDaPhanCongBangChuyen,
        Long lichTrinhChuaPhanCongBangChuyen,
        Long soCongSanSang,
        Long soCongDangDung,
        Long soCongBaoTri,
        Long soBangChuyenSanSang,
        Long soBangChuyenDangDung,
        Long soBangChuyenBaoTri
) {
}
