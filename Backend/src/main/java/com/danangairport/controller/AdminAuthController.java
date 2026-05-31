package com.danangairport.controller;

import com.danangairport.dto.AdminAuthAccountDto;
import com.danangairport.dto.AdminAuthResponse;
import com.danangairport.dto.AdminForgotPasswordRequest;
import com.danangairport.dto.AdminLoginRequest;
import com.danangairport.dto.AdminPasswordResetRequestDto;
import com.danangairport.dto.AdminResetPasswordRequest;
import com.danangairport.dto.AdminVerifyResetCodeRequest;
import com.danangairport.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
    private final AdminAuthService service;

    public AdminAuthController(AdminAuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public AdminAuthResponse<AdminAuthAccountDto> dangNhap(@Valid @RequestBody AdminLoginRequest request) {
        return AdminAuthResponse.ok("Đăng nhập thành công", service.dangNhap(request));
    }

    @PostMapping("/forgot-password/request")
    public AdminAuthResponse<AdminPasswordResetRequestDto> guiYeuCauKhoiPhuc(@Valid @RequestBody AdminForgotPasswordRequest request) {
        return AdminAuthResponse.ok(
                "Yêu cầu khôi phục mật khẩu đã được gửi lên hệ thống quản lý. Vui lòng chờ mã xác thực được cấp.",
                service.guiYeuCauKhoiPhuc(request)
        );
    }

    @PostMapping("/forgot-password/verify")
    public AdminAuthResponse<Void> xacNhanMa(@Valid @RequestBody AdminVerifyResetCodeRequest request) {
        service.xacNhanMa(request);
        return AdminAuthResponse.ok("Mã xác thực hợp lệ.", null);
    }

    @PostMapping("/forgot-password/reset")
    public AdminAuthResponse<Void> datLaiMatKhau(@Valid @RequestBody AdminResetPasswordRequest request) {
        service.datLaiMatKhau(request);
        return AdminAuthResponse.ok("Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.", null);
    }
}
