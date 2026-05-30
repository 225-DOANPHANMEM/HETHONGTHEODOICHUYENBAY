package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaoBangChuyenRequest(
        @NotBlank(message = "Tên băng chuyền không được để trống")
        @Size(max = 100, message = "Tên băng chuyền tối đa 100 ký tự")
        String tenBangChuyenHanhLy,

        @NotBlank(message = "Trạng thái băng chuyền không được để trống")
        String trangThaiBangChuyen,

        @NotBlank(message = "Mã nhà ga không được để trống")
        String maNhaGa
) {
}
