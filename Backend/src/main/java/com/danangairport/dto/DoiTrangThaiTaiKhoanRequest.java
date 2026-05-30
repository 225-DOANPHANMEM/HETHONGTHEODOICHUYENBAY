package com.danangairport.dto;

import jakarta.validation.constraints.Size;

public class DoiTrangThaiTaiKhoanRequest {
    @Size(max = 255, message = "Lý do tối đa 255 ký tự")
    private String lyDo;

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }
}
