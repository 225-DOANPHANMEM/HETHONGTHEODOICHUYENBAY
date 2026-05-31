import { useState } from "react";
import { login } from "../../api";
import "../../styles/admin/LoginPage.css";

function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setError("");
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await login(formData.username.trim(), formData.password);

      if (user.vaiTro !== "Quản trị") {
        setError("Tài khoản này không có quyền truy cập hệ thống quản trị.");
        return;
      }

      // Lưu thông tin đăng nhập vào sessionStorage
      sessionStorage.setItem("adminUser", JSON.stringify(user));

      if (typeof onLoginSuccess === "function") onLoginSuccess();
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-page__container">
        <div className="login-page__intro">
          <div className="login-page__brand">
            <span className="login-page__brand-icon">✈</span>
            <span className="login-page__brand-name">
              Hệ Thống Hiển Thị Thông Tin Chuyến Bay
            </span>
          </div>

          <div className="login-page__intro-content">
            <p className="login-page__eyebrow">
              Hệ Thống Quản Lý Thông Tin Chuyến Bay
            </p>

            <h1 className="login-page__title">Hệ Thống Quản Trị Sân Bay</h1>

            <p className="login-page__description">
              Hệ thống quản lý và cập nhật tình hình các chuyến bay đến, chuyến
              bay đi tại sân bay quốc tế Đà Nẵng.
            </p>
          </div>

          <div className="login-page__status-card">
            <span className="login-page__status-dot"></span>

            <div>
              <p className="login-page__status-title">Trạng Thái Hệ Thống</p>
              <p className="login-page__status-text">Sẵn Sàng Hoạt Động</p>
            </div>
          </div>
        </div>

        <div className="login-page__form-wrapper">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__header">
              <h2 className="login-form__title">Đăng Nhập Quản Trị</h2>

              <p className="login-form__subtitle">
                Đăng nhập để quản lý lịch trình và trạng thái chuyến bay.
              </p>
            </div>

            <div className="login-form__group">
              <label className="login-form__label" htmlFor="username">
                Tên Đăng Nhập
              </label>

              <input
                className="login-form__input"
                type="text"
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="login-form__group">
              <label className="login-form__label" htmlFor="password">
                Mật Khẩu
              </label>

              <input
                className="login-form__input"
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="login-form__options">
              <label className="login-form__remember">
                <input
                  className="login-form__checkbox"
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />

                <span>Ghi Nhớ Tôi</span>
              </label>

              <button className="login-form__link-button" type="button">
                Quên Mật Khẩu?
              </button>
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "14px", margin: "0 0 8px" }}>
                {error}
              </p>
            )}

            <button
              className="login-form__submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>

            <p className="login-form__note">
              Chỉ tài khoản có quyền quản trị mới được truy cập hệ thống.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
