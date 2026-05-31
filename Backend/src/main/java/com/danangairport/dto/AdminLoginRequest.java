package com.danangairport.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
        @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
        String usernameOrEmail,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {
}
