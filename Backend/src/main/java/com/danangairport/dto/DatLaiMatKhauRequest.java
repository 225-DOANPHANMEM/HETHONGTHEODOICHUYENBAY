package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;

public class DatLaiMatKhauRequest {
    @NotBlank(message = "Mat khau moi khong duoc de trong")
    private String matKhauMoi;

    public String getMatKhauMoi() {
        return matKhauMoi;
    }

    public void setMatKhauMoi(String matKhauMoi) {
        this.matKhauMoi = matKhauMoi;
    }
}
