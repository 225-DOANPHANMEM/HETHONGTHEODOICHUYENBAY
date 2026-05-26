import "../styles/StaffLayout.css";

function StaffLayout({
  children,
  activePage = "staffHome",
  onNavigate,
  onLogout,
}) {
  const menuItems = [
    {
      key: "staffHome",
      icon: "🏠",
      label: "Trang chủ",
    },
    {
      key: "staffFlights",
      icon: "🔎",
      label: "Tra cứu chuyến bay",
    },
    {
      key: "staffUpdateStatus",
      icon: "🛫",
      label: "Cập nhật trạng thái",
    },
    {
      key: "staffNotifications",
      icon: "🔔",
      label: "Gửi thông báo",
    },
    {
      key: "staffHistory",
      icon: "🕘",
      label: "Lịch sử cập nhật",
    },
    {
      key: "staffAccount",
      icon: "👤",
      label: "Tài khoản",
    },
  ];

  return (
    <div className="staff-layout">
      <aside className="staff-layout__sidebar">
        <div className="staff-layout__brand">
          <div className="staff-layout__brand-icon">✈</div>

          <div>
            <h1 className="staff-layout__brand-title">Sân bay Đà Nẵng</h1>
            <p className="staff-layout__brand-subtitle">Nhân viên điều hành</p>
          </div>
        </div>

        <nav className="staff-layout__nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                activePage === item.key
                  ? "staff-layout__nav-link staff-layout__nav-link--active"
                  : "staff-layout__nav-link"
              }
              onClick={() => onNavigate && onNavigate(item.key)}
            >
              <span className="staff-layout__nav-icon">{item.icon}</span>
              <span className="staff-layout__nav-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="staff-layout__sidebar-footer">
          <p className="staff-layout__footer-label">Hệ thống</p>
          <p className="staff-layout__footer-status">Đang hoạt động</p>

          <button
            type="button"
            className="staff-layout__logout-button"
            onClick={onLogout}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="staff-layout__main">
        <header className="staff-layout__header">
          <div>
            <p className="staff-layout__header-label">
              Sân bay Quốc tế Đà Nẵng
            </p>
            <h2 className="staff-layout__header-title">
              Hệ thống điều hành chuyến bay
            </h2>
          </div>

          <div className="staff-layout__user">
            <div className="staff-layout__user-info">
              <p className="staff-layout__user-name">Nhân viên điều hành</p>
              <p className="staff-layout__user-role">Flight Operator</p>
            </div>

            <div className="staff-layout__avatar">S</div>
          </div>
        </header>

        <section className="staff-layout__content">{children}</section>
      </main>
    </div>
  );
}

export default StaffLayout;
