import "../styles/AdminLayout.css";

function AdminLayout({ children, activePage = "dashboard", onNavigate }) {
<<<<<<< HEAD
  const navItems = [
    { key: "dashboard", label: "Tong quan", icon: "fa-solid fa-chart-line" },
    { key: "users", label: "Nguoi dung", icon: "fa-solid fa-users" },
    { key: "catalog", label: "Danh muc van hanh", icon: "fa-solid fa-list-check" },
    { key: "flights", label: "Chuyen bay", icon: "fa-solid fa-plane-circle-check" },
    { key: "dispatch", label: "Dieu phoi", icon: "fa-solid fa-diagram-project" },
    { key: "notifications", label: "Thong bao & lich su", icon: "fa-solid fa-bell" },
    { key: "reports", label: "Bao cao", icon: "fa-solid fa-chart-line" },
  ];

=======
>>>>>>> main
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
<<<<<<< HEAD
          <div className="admin-layout__brand-icon"><i className="fa-solid fa-plane" /></div>
          <div>
            <h1 className="admin-layout__brand-title">San Bay Da Nang</h1>
            <p className="admin-layout__brand-subtitle">He Thong Quan Tri</p>
=======
          <div className="admin-layout__brand-icon">✈</div>

          <div>
            <h1 className="admin-layout__brand-title">Sân Bay Đà Nẵng</h1>
            <p className="admin-layout__brand-subtitle">Hệ Thống Quản Trị</p>
>>>>>>> main
          </div>
        </div>

        <nav className="admin-layout__nav">
<<<<<<< HEAD
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                activePage === item.key
                  ? "admin-layout__nav-link admin-layout__nav-link--active"
                  : "admin-layout__nav-link"
              }
              onClick={() => onNavigate && onNavigate(item.key)}
            >
              <span className="admin-layout__nav-icon"><i className={item.icon} /></span>
              <span className="admin-layout__nav-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-layout__sidebar-footer">
          <p className="admin-layout__footer-label">He Thong</p>
          <p className="admin-layout__footer-status">San Sang Hoat Dong</p>
=======
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
>>>>>>> main
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-layout__header">
          <div>
<<<<<<< HEAD
            <p className="admin-layout__header-label">San Bay Quoc Te Da Nang</p>
            <h2 className="admin-layout__header-title">Quan Ly Thong Tin Chuyen Bay</h2>
=======
            <p className="admin-layout__header-label">
              Sân Bay Quốc Tế Đà Nẵng
            </p>
            <h2 className="admin-layout__header-title">
              Quản Lý Thông Tin Chuyến Bay
            </h2>
>>>>>>> main
          </div>

          <div className="admin-layout__user">
            <div className="admin-layout__user-info">
<<<<<<< HEAD
              <p className="admin-layout__user-name">Quan Tri Vien</p>
              <p className="admin-layout__user-role">Quan tri he thong</p>
            </div>
            <div className="admin-layout__avatar"><i className="fa-solid fa-user-shield" /></div>
=======
              <p className="admin-layout__user-name">Quản Trị Viên</p>
              <p className="admin-layout__user-role">Quản trị hệ thống</p>
            </div>

            <div className="admin-layout__avatar">A</div>
>>>>>>> main
          </div>
        </header>

        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
