package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CapNhatNhaGaRequest(
        @NotBlank(message = "Tên nhà ga không được để trống")
        @Size(max = 100, message = "Tên nhà ga tối đa 100 ký tự")
        String tenNhaGa,

        @NotBlank(message = "Loại nhà ga không được để trống")
        String loaiNhaGa,

        @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
        String moTa
) {
}
