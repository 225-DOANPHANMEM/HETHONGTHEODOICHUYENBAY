package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaoLichTrinhRequest(
        @NotBlank(message = "Mã chuyến bay không được để trống")
        String maChuyenBay,

        @NotNull(message = "Ngày bay không được để trống")
        LocalDate ngayBay,

        @NotNull(message = "Giờ dự kiến khởi hành không được để trống")
        LocalDateTime gioDuKienKhoiHanh,

        @NotNull(message = "Giờ dự kiến hạ cánh không được để trống")
        LocalDateTime gioDuKienHaCanh
) {
}
