package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TaoPhanCongCongRequest(
        String maPhanCongCong,

        @NotBlank(message = "Mã lịch trình không được để trống")
        String maLichTrinh,

        @NotBlank(message = "Mã cổng không được để trống")
        String maCong,

        @NotBlank(message = "Loại cổng không được để trống")
        String loaiCong,

        @NotNull(message = "Thời gian bắt đầu sử dụng không được để trống")
        LocalDateTime thoiGianBatDauSuDung,

        @NotNull(message = "Thời gian kết thúc sử dụng không được để trống")
        LocalDateTime thoiGianKetThucSuDung
) {
}
