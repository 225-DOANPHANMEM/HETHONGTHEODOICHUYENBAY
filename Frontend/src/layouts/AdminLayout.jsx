import "../styles/AdminLayout.css";

function AdminLayout({ children, activePage = "dashboard", onNavigate }) {
  const navItems = [
    { key: "dashboard", label: "Tong quan", icon: "fa-solid fa-chart-line" },
    { key: "users", label: "Nguoi dung", icon: "fa-solid fa-users" },
    { key: "catalog", label: "Danh muc van hanh", icon: "fa-solid fa-list-check" },
    { key: "flights", label: "Chuyen bay", icon: "fa-solid fa-plane-circle-check" },
    { key: "dispatch", label: "Dieu phoi", icon: "fa-solid fa-diagram-project" },
    { key: "notifications", label: "Thong bao & lich su", icon: "fa-solid fa-bell" },
    { key: "reports", label: "Bao cao", icon: "fa-solid fa-chart-line" },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <div className="admin-layout__brand-icon"><i className="fa-solid fa-plane" /></div>
          <div>
            <h1 className="admin-layout__brand-title">San Bay Da Nang</h1>
            <p className="admin-layout__brand-subtitle">He Thong Quan Tri</p>
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
          <p className="admin-layout__footer-label">He Thong</p>
          <p className="admin-layout__footer-status">San Sang Hoat Dong</p>
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-layout__header">
          <div>
            <p className="admin-layout__header-label">San Bay Quoc Te Da Nang</p>
            <h2 className="admin-layout__header-title">Quan Ly Thong Tin Chuyen Bay</h2>
          </div>

          <div className="admin-layout__user">
            <div className="admin-layout__user-info">
              <p className="admin-layout__user-name">Quan Tri Vien</p>
              <p className="admin-layout__user-role">Quan tri he thong</p>
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
