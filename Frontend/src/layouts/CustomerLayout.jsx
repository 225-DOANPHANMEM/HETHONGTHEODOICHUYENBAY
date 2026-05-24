import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/CustomerLayout.css";

function CustomerLayout() {
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/customer",
      label: "Trang chủ",
      icon: "🏠",
      end: true,
    },
    {
      path: "/customer/arrivals",
      label: "Chuyến bay đến",
      icon: "🛬",
    },
    {
      path: "/customer/departures",
      label: "Chuyến bay đi",
      icon: "🛫",
    },
    {
      path: "/customer/search",
      label: "Tra cứu",
      icon: "🔎",
    },
    {
      path: "/customer/followed",
      label: "Theo dõi",
      icon: "⭐",
    },
    {
      path: "/customer/notifications",
      label: "Thông báo",
      icon: "🔔",
    },
  ];

  return (
    <div className="customer-layout">
      <header className="customer-layout__header">
        <div
          className="customer-layout__brand"
          onClick={() => navigate("/customer")}
          role="button"
          tabIndex={0}
        >
          <div className="customer-layout__brand-icon">✈</div>

          <div>
            <h1>Sân bay Quốc tế Đà Nẵng</h1>
            <p>Tra cứu tình hình chuyến bay</p>
          </div>
        </div>

        <nav className="customer-layout__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? "customer-layout__nav-link customer-layout__nav-link--active"
                  : "customer-layout__nav-link"
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            className="customer-layout__system-button"
            onClick={() => navigate("/")}
          >
            Hệ thống
          </button>
        </nav>
      </header>

      <main className="customer-layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
