package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TaoPhanCongBangChuyenRequest(
        String maPhanCongBangChuyen,

        @NotBlank(message = "Mã lịch trình không được để trống")
        String maLichTrinh,

        @NotBlank(message = "Mã băng chuyền không được để trống")
        String maBangChuyenHanhLy,

        @NotNull(message = "Thời gian bắt đầu sử dụng không được để trống")
        LocalDateTime thoiGianBatDauSuDung,

        @NotNull(message = "Thời gian kết thúc sử dụng không được để trống")
        LocalDateTime thoiGianKetThucSuDung
) {
}
