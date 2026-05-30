import { useState } from "react";
import { login } from "../../api";
import "../../styles/staff/StaffPages.css";

function StaffLoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("dieuphoi01");
  const [password, setPassword] = useState("123456_hash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(username, password);

      if (user.vaiTro !== "Điều phối") {
        setError("Tài khoản này không có quyền truy cập hệ thống nhân viên.");
        return;
      }

      sessionStorage.setItem("staffUser", JSON.stringify(user));
      onLoginSuccess && onLoginSuccess();
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="staff-login-page">
      <section className="staff-login-page__left">
        <div className="staff-login-page__left-inner">
          <div className="staff-login-page__brand">
            <div className="staff-login-page__brand-icon">✈</div>
            <h1>DANANG International Airport</h1>
          </div>
          <h2>Hệ thống Quản lý Cập nhật Chuyến bay</h2>
          <p>Sân bay Quốc tế Đà Nẵng</p>
          <div className="staff-login-page__features">
            <span>✓ Cập nhật trạng thái chuyến bay thời gian thực</span>
            <span>✓ Phân công cổng ra máy bay</span>
            <span>✓ Phân công băng chuyền hành lý</span>
            <span>✓ Theo dõi và gửi thông báo thay đổi chuyến bay</span>
            <span>✓ Xem lịch sử cập nhật chuyến bay</span>
          </div>
        </div>
      </section>

      <section className="staff-login-page__right">
        <div className="staff-login-card">
          <h2>Đăng nhập</h2>
          <p>Nhân viên Điều hành Chuyến bay</p>
          <form className="staff-login-form" onSubmit={handleSubmit}>
            <div className="staff-form-group">
              <label>Tên đăng nhập</label>
              <input
                className="staff-input"
                placeholder="NV001 hoặc email@airport.vn"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                required
              />
            </div>
            <div className="staff-form-group">
              <label>Mật khẩu</label>
              <input
                className="staff-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
              />
            </div>
            {error && (
              <p style={{ color: "#dc2626", fontSize: "14px", margin: "0 0 8px" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="staff-btn staff-btn--primary"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default StaffLoginPage;
