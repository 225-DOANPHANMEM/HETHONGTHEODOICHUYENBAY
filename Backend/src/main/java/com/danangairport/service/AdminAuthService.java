package com.danangairport.service;

import com.danangairport.dto.AdminAuthAccountDto;
import com.danangairport.dto.AdminForgotPasswordRequest;
import com.danangairport.dto.AdminLoginRequest;
import com.danangairport.dto.AdminPasswordResetRequestDto;
import com.danangairport.dto.AdminResetPasswordRequest;
import com.danangairport.dto.AdminVerifyResetCodeRequest;
import com.danangairport.repository.AdminAuthRepository;
import com.danangairport.repository.AdminAuthRepository.AdminAccountRecord;
import com.danangairport.repository.AdminAuthRepository.PasswordResetRecord;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
public class AdminAuthService {
    private static final int CODE_TTL_MINUTES = 15;
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final Set<String> ADMIN_ROLES = Set.of("quan tri", "dieu phoi");
    private static final Set<String> LEGACY_ADMIN_ROLES = Set.of(
            "Quáº£n trá»‹",
            "Äiá»u phá»‘i",
            "QuÃ¡ÂºÂ£n trÃ¡Â»â€¹",
            "Ã„ÂiÃ¡Â»Âu phÃ¡Â»â€˜i"
    );
    private static final Set<String> ACTIVE_STATUSES = Set.of("hoat dong");
    private static final Set<String> LEGACY_ACTIVE_STATUSES = Set.of(
            "Hoáº¡t Ä‘á»™ng",
            "HoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng"
    );
    private static final Set<String> LOCKED_STATUSES = Set.of("khoa", "ngung su dung");
    private static final Set<String> LEGACY_LOCKED_STATUSES = Set.of(
            "KhÃ³a",
            "Ngá»«ng sá»­ dá»¥ng",
            "KhÃƒÂ³a",
            "NgÃ¡Â»Â«ng sÃ¡Â»Â­ dÃ¡Â»Â¥ng"
    );

    private final AdminAuthRepository repository;

    public AdminAuthService(AdminAuthRepository repository) {
        this.repository = repository;
    }

    public AdminAuthAccountDto dangNhap(AdminLoginRequest request) {
        String usernameOrEmail = request.usernameOrEmail().trim();
        String password = request.password().trim();
        AdminAccountRecord account = repository.timTheoTenDangNhapHoacEmail(usernameOrEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thông tin đăng nhập không chính xác."));

        if (!passwordMatches(password, account.matKhau())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thông tin đăng nhập không chính xác.");
        }
        validateAdminAccount(account);
        return toDto(account);
    }

    public AdminPasswordResetRequestDto guiYeuCauKhoiPhuc(AdminForgotPasswordRequest request) {
        String email = request.email().trim();
        AdminAccountRecord account = repository.timTheoEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại trong hệ thống."));
        validateAdminAccount(account);

        String maYeuCau = repository.taoMaYeuCauMoi();
        String code = taoMaXacThuc();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(CODE_TTL_MINUTES);
        repository.taoYeuCauKhoiPhuc(maYeuCau, account, code, expiresAt);

        return new AdminPasswordResetRequestDto(
                maYeuCau,
                account.email(),
                "Đã cấp mã",
                repository.dinhDangThoiGian(expiresAt),
                code
        );
    }

    public void xacNhanMa(AdminVerifyResetCodeRequest request) {
        PasswordResetRecord reset = layYeuCauHopLe(request.email(), request.code());
        validateResetRequest(reset);
    }

    public void datLaiMatKhau(AdminResetPasswordRequest request) {
        String newPassword = request.newPassword() == null ? "" : request.newPassword().trim();
        String confirmPassword = request.confirmPassword() == null ? "" : request.confirmPassword().trim();
        if (newPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải có ít nhất 8 ký tự.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không trùng khớp.");
        }

        PasswordResetRecord reset = layYeuCauHopLe(request.email(), request.code());
        validateResetRequest(reset);

        // TODO: Nâng cấp sang BCrypt khi chuẩn hóa lại mật khẩu hiện có trong TAIKHOAN.
        repository.capNhatMatKhau(reset.maTaiKhoan(), newPassword);
        repository.danhDauDaSuDung(reset.maYeuCau());
    }

    private PasswordResetRecord layYeuCauHopLe(String email, String code) {
        String normalizedEmail = email == null ? "" : email.trim();
        String normalizedCode = code == null ? "" : code.trim();
        return repository.timYeuCauMoiNhatTheoEmailVaMa(normalizedEmail, normalizedCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác thực không chính xác."));
    }

    private void validateAdminAccount(AdminAccountRecord account) {
        if (!isAdminRole(account.vaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không có quyền truy cập hệ thống Admin.");
        }
        if (!isActive(account.trangThaiTaiKhoan())) {
            if (isLocked(account.trangThaiTaiKhoan())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị hệ thống.");
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không ở trạng thái hoạt động.");
        }
    }

    private void validateResetRequest(PasswordResetRecord reset) {
        if (reset.thoiGianSuDung() != null || "Đã sử dụng".equalsIgnoreCase(reset.trangThaiYeuCau())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác thực đã được sử dụng.");
        }
        if (reset.thoiGianHetHan() == null || reset.thoiGianHetHan().isBefore(LocalDateTime.now())) {
            repository.danhDauHetHan(reset.maYeuCau());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác thực đã hết hạn.");
        }
        if ("Từ chối".equalsIgnoreCase(reset.trangThaiYeuCau())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Yêu cầu khôi phục mật khẩu đã bị từ chối.");
        }
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        return storedPassword.equals(rawPassword) || storedPassword.equals(rawPassword + "_hash");
    }

    private boolean isAdminRole(String value) {
        String trimmed = value == null ? "" : value.trim();
        return ADMIN_ROLES.contains(normalize(trimmed)) || LEGACY_ADMIN_ROLES.contains(trimmed);
    }

    private boolean isActive(String value) {
        String trimmed = value == null ? "" : value.trim();
        return ACTIVE_STATUSES.contains(normalize(trimmed)) || LEGACY_ACTIVE_STATUSES.contains(trimmed);
    }

    private boolean isLocked(String value) {
        String trimmed = value == null ? "" : value.trim();
        return LOCKED_STATUSES.contains(normalize(trimmed)) || LEGACY_LOCKED_STATUSES.contains(trimmed);
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String lower = value.trim().toLowerCase(Locale.ROOT).replace('đ', 'd');
        return Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("\\s+", " ");
    }

    private String taoMaXacThuc() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private AdminAuthAccountDto toDto(AdminAccountRecord account) {
        return new AdminAuthAccountDto(
                account.maTaiKhoan(),
                account.tenDangNhap(),
                account.email(),
                account.vaiTro(),
                account.trangThaiTaiKhoan()
        );
    }
}
