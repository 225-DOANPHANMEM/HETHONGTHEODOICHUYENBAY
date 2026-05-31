package com.danangairport.dto;

public record AdminPasswordResetRequestDto(
        String maYeuCau,
        String email,
        String trangThaiYeuCau,
        String thoiGianHetHan,
        String demoCode
) {
}
