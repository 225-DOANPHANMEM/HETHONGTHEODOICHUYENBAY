package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;

public record CapNhatTrangThaiThongBaoRequest(
        @NotBlank(message = "Trạng thái gửi không được để trống")
        String trangThaiGui
) {
}
