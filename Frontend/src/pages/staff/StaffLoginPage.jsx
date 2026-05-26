import "../../styles/staff/StaffPages.css";

function StaffLoginPage({ onLoginSuccess }) {
  function handleSubmit(event) {
    event.preventDefault();
    localStorage.setItem("staffLoggedIn", "true");
    onLoginSuccess && onLoginSuccess();
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
              <input className="staff-input" placeholder="NV001 hoặc email@airport.vn" defaultValue="NV001" required />
            </div>
            <div className="staff-form-group">
              <label>Mật khẩu</label>
              <input className="staff-input" type="password" placeholder="••••••••" defaultValue="123456" required />
            </div>
            <button type="submit" className="staff-btn staff-btn--primary">Đăng nhập</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default StaffLoginPage;
