import "../styles/AdminLayout.css";

function AdminLayout({ children, activePage = "dashboard", onNavigate }) {
  const navItems = [
    { key: "dashboard", label: "Tổng quan", icon: "fa-solid fa-chart-line" },
    { key: "users", label: "Người dùng", icon: "fa-solid fa-users" },
    { key: "catalog", label: "Danh mục vận hành", icon: "fa-solid fa-list-check" },
    { key: "flights", label: "Chuyến bay", icon: "fa-solid fa-plane-circle-check" },
    { key: "dispatch", label: "Điều phối", icon: "fa-solid fa-diagram-project" },
    { key: "notifications", label: "Thông báo & lịch sử", icon: "fa-solid fa-bell" },
    { key: "reports", label: "Báo cáo", icon: "fa-solid fa-chart-line" },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <div className="admin-layout__brand-icon"><i className="fa-solid fa-plane" /></div>
          <div>
            <h1 className="admin-layout__brand-title">Sân bay Đà Nẵng</h1>
            <p className="admin-layout__brand-subtitle">Hệ thống quản trị</p>
          </div>
        </div>

        <nav className="admin-layout__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activePage === item.key ? "admin-layout__nav-link admin-layout__nav-link--active" : "admin-layout__nav-link"}
              onClick={() => onNavigate && onNavigate(item.key)}
            >
              <span className="admin-layout__nav-icon"><i className={item.icon} /></span>
              <span className="admin-layout__nav-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-layout__sidebar-footer">
          <p className="admin-layout__footer-label">Hệ thống</p>
          <p className="admin-layout__footer-status">Sẵn sàng hoạt động</p>
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-layout__header">
          <div>
            <p className="admin-layout__header-label">Sân bay Quốc tế Đà Nẵng</p>
            <h2 className="admin-layout__header-title">Quản lý thông tin chuyến bay</h2>
          </div>

          <div className="admin-layout__user">
            <div className="admin-layout__user-info">
              <p className="admin-layout__user-name">Quản trị viên</p>
              <p className="admin-layout__user-role">Quản trị hệ thống</p>
            </div>
            <div className="admin-layout__avatar"><i className="fa-solid fa-user-shield" /></div>
          </div>
        </header>

        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
