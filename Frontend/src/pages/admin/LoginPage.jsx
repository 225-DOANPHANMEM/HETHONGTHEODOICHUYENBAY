import { useState } from "react";
import {
  dangNhapAdmin,
  datLaiMatKhauAdmin,
  guiYeuCauKhoiPhucMatKhau,
  xacNhanMaKhoiPhuc,
} from "../../api/adminAuthApi.js";
import "../../styles/admin/LoginPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [forgotStep, setForgotStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [demoCode, setDemoCode] = useState("");

  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: "",
    password: "",
    remember: false,
  });
  const [forgotForm, setForgotForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateLoginForm = (event) => {
    const { name, value, type, checked } = event.target;
    setLoginForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateForgotForm = (event) => {
    const { name, value } = event.target;
    setForgotForm((current) => ({ ...current, [name]: value }));
  };

  const showError = (message) => {
    setAlert({ type: "error", message });
  };

  const showSuccess = (message) => {
    setAlert({ type: "success", message });
  };

  const normalizeApiError = (error) => {
    if (!error?.message || error.message === "Failed to fetch") {
      return "Không kết nối được backend. Vui lòng kiểm tra server và thử lại.";
    }
    return error.message;
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email không được để trống.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return "Email không đúng định dạng.";
    }
    return "";
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAlert(null);

    if (!loginForm.usernameOrEmail.trim()) {
      showError("Vui lòng nhập tên đăng nhập hoặc email.");
      return;
    }
    if (!loginForm.password.trim()) {
      showError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const response = await dangNhapAdmin({
        usernameOrEmail: loginForm.usernameOrEmail.trim(),
        password: loginForm.password,
      });
      const account = response?.data;
      if (!account) {
        throw new Error("Backend không trả về thông tin tài khoản.");
      }

      const storage = loginForm.remember ? localStorage : sessionStorage;
      const otherStorage = loginForm.remember ? sessionStorage : localStorage;
      otherStorage.removeItem("adminAccount");
      storage.setItem("adminAccount", JSON.stringify(account));

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(account);
      }
    } catch (error) {
      showError(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setMode("forgot");
    setForgotStep("request");
    setAlert(null);
    setDemoCode("");
    setForgotForm({
      email: loginForm.usernameOrEmail.includes("@") ? loginForm.usernameOrEmail : "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const backToLogin = () => {
    setMode("login");
    setForgotStep("request");
    setAlert(null);
    setDemoCode("");
  };

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setAlert(null);
    const emailError = validateEmail(forgotForm.email);
    if (emailError) {
      showError(emailError);
      return;
    }

    setLoading(true);
    try {
      const response = await guiYeuCauKhoiPhucMatKhau(forgotForm.email.trim());
      setDemoCode(response?.data?.demoCode || "");
      setForgotStep("verify");
      showSuccess(response?.message || "Yêu cầu khôi phục mật khẩu đã được gửi lên hệ thống quản lý.");
    } catch (error) {
      showError(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setAlert(null);
    const emailError = validateEmail(forgotForm.email);
    if (emailError) {
      showError(emailError);
      return;
    }
    if (!forgotForm.code.trim()) {
      showError("Mã xác thực không được để trống.");
      return;
    }

    setLoading(true);
    try {
      await xacNhanMaKhoiPhuc(forgotForm.email.trim(), forgotForm.code.trim());
      setForgotStep("reset");
      showSuccess("Mã xác thực hợp lệ. Vui lòng đặt mật khẩu mới.");
    } catch (error) {
      showError(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setAlert(null);
    const emailError = validateEmail(forgotForm.email);
    if (emailError) {
      showError(emailError);
      return;
    }
    if (!forgotForm.code.trim()) {
      showError("Mã xác thực không được để trống.");
      return;
    }
    if (!forgotForm.newPassword.trim()) {
      showError("Mật khẩu mới không được để trống.");
      return;
    }
    if (forgotForm.newPassword.trim().length < 8) {
      showError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (forgotForm.newPassword.trim() !== forgotForm.confirmPassword.trim()) {
      showError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await datLaiMatKhauAdmin({
        email: forgotForm.email.trim(),
        code: forgotForm.code.trim(),
        newPassword: forgotForm.newPassword.trim(),
        confirmPassword: forgotForm.confirmPassword.trim(),
      });
      setLoginForm((current) => ({
        ...current,
        usernameOrEmail: forgotForm.email.trim(),
        password: "",
      }));
      setMode("login");
      setForgotStep("request");
      setDemoCode("");
      showSuccess(response?.message || "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.");
    } catch (error) {
      showError(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form className="login-form" onSubmit={handleLogin}>
      <div className="login-form__header">
        <p className="login-form__eyebrow">Quản trị hệ thống</p>
        <h2 className="login-form__title">Đăng nhập quản trị</h2>
        <p className="login-form__subtitle">
          Hệ thống quản lý cập nhật tình hình chuyến bay sân bay quốc tế Đà Nẵng
        </p>
      </div>

      {renderAlert()}

      <div className="login-form__group">
        <label className="login-form__label" htmlFor="usernameOrEmail">
          Tên đăng nhập hoặc email
        </label>
        <input
          className="login-form__input"
          type="text"
          id="usernameOrEmail"
          name="usernameOrEmail"
          placeholder="admin01 hoặc admin01@airport.vn"
          value={loginForm.usernameOrEmail}
          onChange={updateLoginForm}
          autoComplete="username"
        />
      </div>

      <div className="login-form__group">
        <label className="login-form__label" htmlFor="password">
          Mật khẩu
        </label>
        <div className="login-form__password-field">
          <input
            className="login-form__input login-form__input--with-action"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={loginForm.password}
            onChange={updateLoginForm}
            autoComplete="current-password"
          />
          <button
            className="login-form__icon-button"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
          </button>
        </div>
      </div>

      <div className="login-form__options">
        <label className="login-form__remember">
          <input
            className="login-form__checkbox"
            type="checkbox"
            name="remember"
            checked={loginForm.remember}
            onChange={updateLoginForm}
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>

        <button className="login-form__link-button" type="button" onClick={openForgotPassword}>
          Quên mật khẩu?
        </button>
      </div>

      <button className="login-form__submit-button" type="submit" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="login-form__note">
        Chỉ tài khoản có vai trò Quản trị hoặc Điều phối và đang hoạt động mới được vào hệ thống Admin.
      </p>
    </form>
  );

  const renderForgotForm = () => (
    <form
      className="login-form"
      onSubmit={
        forgotStep === "request"
          ? handleRequestReset
          : forgotStep === "verify"
            ? handleVerifyCode
            : handleResetPassword
      }
    >
      <div className="login-form__header">
        <p className="login-form__eyebrow">Khôi phục quyền truy cập</p>
        <h2 className="login-form__title">{forgotStep === "reset" ? "Đặt mật khẩu mới" : "Quên mật khẩu Admin"}</h2>
        <p className="login-form__subtitle">
          Yêu cầu được gửi lên hệ thống quản lý. Sau khi được cấp mã, Admin dùng mã để đặt mật khẩu mới.
        </p>
      </div>

      <div className="login-form__steps" aria-label="Các bước khôi phục mật khẩu">
        <span className={forgotStep === "request" ? "login-form__step login-form__step--active" : "login-form__step"}>1</span>
        <span className={forgotStep === "verify" ? "login-form__step login-form__step--active" : "login-form__step"}>2</span>
        <span className={forgotStep === "reset" ? "login-form__step login-form__step--active" : "login-form__step"}>3</span>
      </div>

      {renderAlert()}

      <div className="login-form__group">
        <label className="login-form__label" htmlFor="forgotEmail">
          Email tài khoản
        </label>
        <input
          className="login-form__input"
          type="email"
          id="forgotEmail"
          name="email"
          placeholder="admin01@airport.vn"
          value={forgotForm.email}
          onChange={updateForgotForm}
          disabled={forgotStep !== "request"}
          autoComplete="email"
        />
      </div>

      {forgotStep !== "request" && (
        <div className="login-form__group">
          <label className="login-form__label" htmlFor="resetCode">
            Mã xác thực
          </label>
          <input
            className="login-form__input"
            type="text"
            id="resetCode"
            name="code"
            placeholder="Nhập mã 6 chữ số"
            value={forgotForm.code}
            onChange={updateForgotForm}
            inputMode="numeric"
          />
          {demoCode && (
            <p className="login-form__hint">
              Mã demo được cấp: <strong>{demoCode}</strong>
            </p>
          )}
        </div>
      )}

      {forgotStep === "reset" && (
        <>
          <PasswordField
            id="newPassword"
            label="Mật khẩu mới"
            name="newPassword"
            value={forgotForm.newPassword}
            onChange={updateForgotForm}
            show={showNewPassword}
            onToggle={() => setShowNewPassword((value) => !value)}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            value={forgotForm.confirmPassword}
            onChange={updateForgotForm}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
            autoComplete="new-password"
          />
        </>
      )}

      <button className="login-form__submit-button" type="submit" disabled={loading}>
        {forgotStep === "request" && (loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu")}
        {forgotStep === "verify" && (loading ? "Đang xác nhận..." : "Xác nhận mã")}
        {forgotStep === "reset" && (loading ? "Đang cập nhật..." : "Cập nhật mật khẩu")}
      </button>

      <button className="login-form__secondary-button" type="button" onClick={backToLogin} disabled={loading}>
        Quay lại đăng nhập
      </button>
    </form>
  );

  const renderAlert = () => {
    if (!alert) return null;
    return (
      <div className={`login-form__alert login-form__alert--${alert.type}`} role="alert">
        <i className={alert.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"} />
        <span>{alert.message}</span>
      </div>
    );
  };

  return (
    <main className="login-page">
      <section className="login-page__container">
        <div className="login-page__intro">
          <div className="login-page__brand">
            <span className="login-page__brand-icon">
              <i className="fa-solid fa-plane-departure" />
            </span>
            <span className="login-page__brand-name">Sân bay Quốc tế Đà Nẵng</span>
          </div>

          <div className="login-page__intro-content">
            <p className="login-page__eyebrow">Hệ thống quản lý nội bộ</p>
            <h1 className="login-page__title">Quản lý cập nhật tình hình chuyến bay</h1>
            <p className="login-page__description">
              Theo dõi, điều phối và cập nhật trạng thái các chuyến bay đến và đi tại sân bay quốc tế Đà Nẵng.
            </p>
          </div>

          <div className="login-page__status-card">
            <span className="login-page__status-dot" />
            <div>
              <p className="login-page__status-title">Trạng thái hệ thống</p>
              <p className="login-page__status-text">Sẵn sàng hoạt động</p>
            </div>
          </div>
        </div>

        <div className="login-page__form-wrapper">
          {mode === "login" ? renderLoginForm() : renderForgotForm()}
        </div>
      </section>
    </main>
  );
}

function PasswordField({ id, label, name, value, onChange, show, onToggle, autoComplete }) {
  return (
    <div className="login-form__group">
      <label className="login-form__label" htmlFor={id}>
        {label}
      </label>
      <div className="login-form__password-field">
        <input
          className="login-form__input login-form__input--with-action"
          type={show ? "text" : "password"}
          id={id}
          name={name}
          placeholder={label}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          className="login-form__icon-button"
          type="button"
          onClick={onToggle}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <i className={show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
