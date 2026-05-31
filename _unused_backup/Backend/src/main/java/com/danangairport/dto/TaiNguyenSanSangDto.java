package com.danangairport.dto;

import java.util.List;

public record TaiNguyenSanSangDto(
        List<CongOptionDto> cong,
        List<BangChuyenOptionDto> bangChuyen
) {
}
