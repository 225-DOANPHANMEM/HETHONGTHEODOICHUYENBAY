package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CapNhatChuyenBayRequest(
        @NotBlank(message = "Hãng hàng không không được để trống")
        String maHangHangKhong,

        @NotBlank(message = "Số hiệu chuyến bay không được để trống")
        @Size(max = 20, message = "Số hiệu chuyến bay tối đa 20 ký tự")
        String soHieuChuyenBay,

        @NotBlank(message = "Loại chuyến bay không được để trống")
        String loaiChuyenBay,

        @NotBlank(message = "Điểm đi không được để trống")
        @Size(max = 100, message = "Điểm đi tối đa 100 ký tự")
        String diemDi,

        @NotBlank(message = "Điểm đến không được để trống")
        @Size(max = 100, message = "Điểm đến tối đa 100 ký tự")
        String diemDen,

        @NotNull(message = "Ngày bay không được để trống")
        LocalDate ngayBay,

        @NotNull(message = "Giờ dự kiến khởi hành không được để trống")
        LocalDateTime gioDuKienKhoiHanh,

        @NotNull(message = "Giờ dự kiến hạ cánh không được để trống")
        LocalDateTime gioDuKienHaCanh
) {
}
