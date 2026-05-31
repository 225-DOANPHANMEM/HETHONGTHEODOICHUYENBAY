package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record CapNhatTinhHinhChuyenBayRequest(
        @NotBlank(message = "Mã tài khoản không được để trống")
        String maTaiKhoan,

        @NotBlank(message = "Trạng thái mới không được để trống")
        String trangThaiMoi,

        LocalDateTime gioUocTinhKhoiHanh,
        LocalDateTime gioUocTinhHaCanh,
        LocalDateTime gioThucTeKhoiHanh,
        LocalDateTime gioThucTeHaCanh,
        String lyDoChamHoacHuy
) {
}
