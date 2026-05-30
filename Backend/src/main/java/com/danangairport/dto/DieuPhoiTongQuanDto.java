package com.danangairport.dto;

import java.util.List;

public record DieuPhoiTongQuanDto(
        LichTrinhDieuPhoiDto lichTrinh,
        PhanCongCongDto congHienHanh,
        PhanCongBangChuyenDto bangChuyenHienHanh,
        List<PhanCongCongDto> lichSuPhanCongCong,
        List<PhanCongBangChuyenDto> lichSuPhanCongBangChuyen,
        List<CongOptionDto> congKhaDung,
        List<BangChuyenOptionDto> bangChuyenKhaDung
) {
}
