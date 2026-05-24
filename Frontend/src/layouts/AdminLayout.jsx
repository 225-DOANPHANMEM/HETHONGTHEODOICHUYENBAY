import "../styles/AdminLayout.css";

function AdminLayout({ children, activePage = "dashboard", onNavigate }) {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <div className="admin-layout__brand-icon">✈</div>

          <div>
            <h1 className="admin-layout__brand-title">Sân Bay Đà Nẵng</h1>
            <p className="admin-layout__brand-subtitle">Hệ Thống Quản Trị</p>
          </div>
        </div>

        <nav className="admin-layout__nav">
          <button
            type="button"
            className={
              activePage === "dashboard"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("dashboard")}
          >
            <span className="admin-layout__nav-icon">📊</span>
            <span className="admin-layout__nav-text">Tổng quan</span>
          </button>

          <button
            type="button"
            className={
              activePage === "users"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("users")}
          >
            <span className="admin-layout__nav-icon">👤</span>
            <span className="admin-layout__nav-text">Người dùng</span>
          </button>

          <button
            type="button"
            className={
              activePage === "catalog"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("catalog")}
          >
            <span className="admin-layout__nav-icon">🗂</span>
            <span className="admin-layout__nav-text">Danh mục vận hành</span>
          </button>

          <button
            type="button"
            className={
              activePage === "flights"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("flights")}
          >
            <span className="admin-layout__nav-icon">🛫</span>
            <span className="admin-layout__nav-text">Chuyến bay</span>
          </button>

          <button
            type="button"
            className={
              activePage === "dispatch"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("dispatch")}
          >
            <span className="admin-layout__nav-icon">🧭</span>
            <span className="admin-layout__nav-text">Điều phối</span>
          </button>

          <button
            type="button"
            className={
              activePage === "notifications"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("notifications")}
          >
            <span className="admin-layout__nav-icon">🔔</span>
            <span className="admin-layout__nav-text">Thông báo & lịch sử</span>
          </button>

          <button
            type="button"
            className={
              activePage === "reports"
                ? "admin-layout__nav-link admin-layout__nav-link--active"
                : "admin-layout__nav-link"
            }
            onClick={() => onNavigate && onNavigate("reports")}
          >
            <span className="admin-layout__nav-icon">📈</span>
            <span className="admin-layout__nav-text">Báo cáo</span>
          </button>
        </nav>

        <div className="admin-layout__sidebar-footer">
          <p className="admin-layout__footer-label">Hệ Thống</p>
          <p className="admin-layout__footer-status">Sẵn Sàng Hoạt Động</p>
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-layout__header">
          <div>
            <p className="admin-layout__header-label">
              Sân Bay Quốc Tế Đà Nẵng
            </p>
            <h2 className="admin-layout__header-title">
              Quản Lý Thông Tin Chuyến Bay
            </h2>
          </div>

          <div className="admin-layout__user">
            <div className="admin-layout__user-info">
              <p className="admin-layout__user-name">Quản Trị Viên</p>
              <p className="admin-layout__user-role">Quản trị hệ thống</p>
            </div>

            <div className="admin-layout__avatar">A</div>
          </div>
        </header>

        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
