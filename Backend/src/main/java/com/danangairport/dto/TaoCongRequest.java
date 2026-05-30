package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaoCongRequest(
        @NotBlank(message = "Mã nhà ga không được để trống")
        String maNhaGa,

        @NotBlank(message = "Tên cổng không được để trống")
        @Size(max = 100, message = "Tên cổng tối đa 100 ký tự")
        String tenCong,

        @NotBlank(message = "Trạng thái cổng không được để trống")
        String trangThaiCong
) {
}
