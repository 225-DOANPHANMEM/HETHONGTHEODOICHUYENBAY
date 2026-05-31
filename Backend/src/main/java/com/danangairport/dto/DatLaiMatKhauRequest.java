package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;

public class DatLaiMatKhauRequest {
    @NotBlank(message = "Mật khẩu mới không được để trống")
    private String matKhauMoi;

    public String getMatKhauMoi() {
        return matKhauMoi;
    }

    public void setMatKhauMoi(String matKhauMoi) {
        this.matKhauMoi = matKhauMoi;
    }
}
