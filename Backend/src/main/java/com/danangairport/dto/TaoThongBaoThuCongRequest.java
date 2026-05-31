package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record TaoThongBaoThuCongRequest(
        @NotBlank(message = "Mã lịch trình không được để trống")
        String maLichTrinh,

        @NotBlank(message = "Mã tài khoản không được để trống")
        String maTaiKhoan,

        String maCong,

        String maBangChuyenHanhLy,

        @NotBlank(message = "Nội dung thông báo không được để trống")
        @Size(max = 500, message = "Nội dung thông báo tối đa 500 ký tự")
        String noiDungThongBao,

        @NotBlank(message = "Trạng thái mới không được để trống")
        String trangThaiMoi,

        LocalDateTime gioUocTinhMoi,

        @NotBlank(message = "Phương thức gửi không được để trống")
        String phuongThucGui,

        @NotBlank(message = "Trạng thái gửi không được để trống")
        String trangThaiGui
) {
}
