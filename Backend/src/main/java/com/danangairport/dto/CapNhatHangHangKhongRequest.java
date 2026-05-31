package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CapNhatHangHangKhongRequest(
        @NotBlank(message = "Mã hãng không được để trống")
        @Size(max = 10, message = "Mã hãng tối đa 10 ký tự")
        String maHang,

        @NotBlank(message = "Tên hãng hàng không không được để trống")
        @Size(max = 100, message = "Tên hãng hàng không tối đa 100 ký tự")
        String tenHangHangKhong,

        @Size(max = 50, message = "Quốc gia tối đa 50 ký tự")
        String quocGia
) {
}
