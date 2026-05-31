import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./pages/admin/LoginPage.jsx";
import DashboardPage from "./pages/admin/DashboardPage_new.jsx";
import UserManagementPage from "./pages/admin/UserManagementPage.jsx";
import OperatingCatalogPage from "./pages/admin/OperatingCatalogPage.jsx";
import FlightManagementPage from "./pages/admin/FlightManagementPage.jsx";
import DispatchPage from "./pages/admin/DispatchPage.jsx";
import NotificationHistoryPage from "./pages/admin/NotificationHistoryPage.jsx";
import BaoCaoVanHanh from "./pages/admin/BaoCaoVanHanh.jsx";

import StaffLayout from "./layouts/StaffLayout.jsx";
import StaffLoginPage from "./pages/staff/StaffLoginPage.jsx";
import StaffHomePage from "./pages/staff/StaffHomePage.jsx";
import StaffFlightLookupPage from "./pages/staff/StaffFlightLookupPage.jsx";
import StaffUpdateFlightStatusPage from "./pages/staff/StaffUpdateFlightStatusPage.jsx";
import StaffNotificationPage from "./pages/staff/StaffNotificationPage.jsx";
import StaffHistoryPage from "./pages/staff/StaffHistoryPage.jsx";
import StaffAccountPage from "./pages/staff/StaffAccountPage.jsx";

import CustomerLayout from "./layouts/CustomerLayout.jsx";
import CustomerHomePage from "./pages/customer/CustomerHomePage.jsx";
import CustomerArrivalsPage from "./pages/customer/CustomerArrivalsPage.jsx";
import CustomerDeparturesPage from "./pages/customer/CustomerDeparturesPage.jsx";
import CustomerSearchPage from "./pages/customer/CustomerSearchPage.jsx";
import CustomerFlightDetailPage from "./pages/customer/CustomerFlightDetailPage.jsx";
import CustomerFollowedFlightsPage from "./pages/customer/CustomerFollowedFlightsPage.jsx";
import CustomerNotificationsPage from "./pages/customer/CustomerNotificationsPage.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalPage />} />

        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route
          path="/admin/dashboard"
          element={<AdminPage page="dashboard" />}
        />
        <Route path="/admin/users" element={<AdminPage page="users" />} />
        <Route path="/admin/catalog" element={<AdminPage page="catalog" />} />
        <Route path="/admin/flights" element={<AdminPage page="flights" />} />
        <Route path="/admin/dispatch" element={<AdminPage page="dispatch" />} />
        <Route
          path="/admin/notifications"
          element={<AdminPage page="notifications" />}
        />
        <Route path="/admin/reports" element={<AdminPage page="reports" />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        <Route path="/staff/login" element={<StaffLoginRoute />} />
        <Route path="/staff/home" element={<StaffPage page="staffHome" />} />
        <Route
          path="/staff/flights"
          element={<StaffPage page="staffFlights" />}
        />
        <Route
          path="/staff/update-status"
          element={<StaffPage page="staffUpdateStatus" />}
        />
        <Route
          path="/staff/notifications"
          element={<StaffPage page="staffNotifications" />}
        />
        <Route
          path="/staff/history"
          element={<StaffPage page="staffHistory" />}
        />
        <Route
          path="/staff/account"
          element={<StaffPage page="staffAccount" />}
        />
        <Route path="/staff" element={<Navigate to="/staff/login" replace />} />

        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
          <Route path="arrivals" element={<CustomerArrivalsPage />} />
          <Route path="departures" element={<CustomerDeparturesPage />} />
          <Route path="search" element={<CustomerSearchPage />} />
          <Route
            path="flights/:flightNo"
            element={<CustomerFlightDetailPage />}
          />
          <Route path="followed" element={<CustomerFollowedFlightsPage />} />
          <Route path="notifications" element={<CustomerNotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

function AdminLoginRoute() {
  const navigate = useNavigate();
  const storedAccount = getStoredAdminAccount();

  if (storedAccount) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <LoginPage onLoginSuccess={() => navigate("/admin/dashboard")} />;
}

function AdminPage({ page }) {
  const navigate = useNavigate();
  const storedAccount = getStoredAdminAccount();

  if (!storedAccount) {
    return <Navigate to="/admin/login" replace />;
  }

  const adminPathMap = {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    catalog: "/admin/catalog",
    flights: "/admin/flights",
    dispatch: "/admin/dispatch",
    notifications: "/admin/notifications",
    reports: "/admin/reports",
    login: "/admin/login",
  };

  const handleNavigate = (nextPage) => {
    navigate(adminPathMap[nextPage] || "/admin/dashboard");
  };

  if (page === "dashboard") {
    return <DashboardPage onNavigate={handleNavigate} />;
  }

  if (page === "users") {
    return <UserManagementPage onNavigate={handleNavigate} />;
  }

  if (page === "catalog") {
    return <OperatingCatalogPage onNavigate={handleNavigate} />;
  }

  if (page === "flights") {
    return <FlightManagementPage onNavigate={handleNavigate} />;
  }

  if (page === "dispatch") {
    return <DispatchPage onNavigate={handleNavigate} />;
  }

  if (page === "notifications") {
    return <NotificationHistoryPage onNavigate={handleNavigate} />;
  }

  if (page === "reports") {
    return <BaoCaoVanHanh onNavigate={handleNavigate} />;
  }

  return <DashboardPage onNavigate={handleNavigate} />;
}

function getStoredAdminAccount() {
  try {
    const rawAccount =
      localStorage.getItem("adminAccount") ||
      sessionStorage.getItem("adminAccount");
    return rawAccount ? JSON.parse(rawAccount) : null;
  } catch {
    localStorage.removeItem("adminAccount");
    sessionStorage.removeItem("adminAccount");
    return null;
  }
}

function StaffLoginRoute() {
  const navigate = useNavigate();

  return <StaffLoginPage onLoginSuccess={() => navigate("/staff/home")} />;
}

function StaffPage({ page }) {
  const navigate = useNavigate();

  const staffPathMap = {
    staffHome: "/staff/home",
    staffFlights: "/staff/flights",
    staffUpdateStatus: "/staff/update-status",
    staffNotifications: "/staff/notifications",
    staffHistory: "/staff/history",
    staffAccount: "/staff/account",
    staffLogin: "/staff/login",
  };

  const handleNavigate = (nextPage) => {
    navigate(staffPathMap[nextPage] || "/staff/home");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const renderStaffPage = () => {
    switch (page) {
      case "staffHome":
        return <StaffHomePage onNavigate={handleNavigate} />;

      case "staffFlights":
        return <StaffFlightLookupPage onNavigate={handleNavigate} />;

      case "staffUpdateStatus":
        return <StaffUpdateFlightStatusPage onNavigate={handleNavigate} />;

      case "staffNotifications":
        return <StaffNotificationPage onNavigate={handleNavigate} />;

      case "staffHistory":
        return <StaffHistoryPage onNavigate={handleNavigate} />;

      case "staffAccount":
        return <StaffAccountPage onNavigate={handleNavigate} />;

      default:
        return <StaffHomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <StaffLayout
      activePage={page}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderStaffPage()}
    </StaffLayout>
  );
}

function PortalPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.portalPage}>
      <div style={styles.portalCard}>
        <div style={styles.logo}>✈</div>

        <p style={styles.label}>Sân bay Quốc tế Đà Nẵng</p>

        <h1 style={styles.title}>
          Hệ thống Quản lý cập nhật tình hình chuyến bay
        </h1>

        <p style={styles.description}>
          Chọn hệ thống bạn muốn truy cập để tiếp tục.
        </p>

        <div style={styles.actionGroup}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate("/admin/login")}
          >
            Truy cập Admin
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("/staff/login")}
          >
            Truy cập Nhân viên điều hành
          </button>

          <button
            type="button"
            style={styles.lightButton}
            onClick={() => navigate("/customer")}
          >
            Truy cập Khách hàng
          </button>
        </div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.portalPage}>
      <div style={styles.portalCard}>
        <h1 style={styles.title}>Không tìm thấy trang</h1>
        <p style={styles.description}>
          Đường dẫn bạn đang truy cập không tồn tại trong hệ thống.
        </p>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => navigate("/")}
        >
          Quay về trang chọn hệ thống
        </button>
      </div>
    </div>
  );
}

const styles = {
  portalPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #dbeafe 100%)",
    fontFamily: '"Inter", "Roboto", "Segoe UI", Arial, sans-serif',
  },

  portalCard: {
    width: "100%",
    maxWidth: "680px",
    padding: "44px",
    borderRadius: "28px",
    backgroundColor: "#ffffff",
    border: "1px solid #dbeafe",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)",
    textAlign: "center",
  },

  logo: {
    width: "64px",
    height: "64px",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    fontSize: "28px",
  },

  label: {
    margin: "0 0 10px",
    color: "#0284c7",
    fontSize: "14px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  title: {
    margin: "0",
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1.25,
  },

  description: {
    margin: "16px 0 28px",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  actionGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  primaryButton: {
    minHeight: "46px",
    padding: "0 22px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: "46px",
    padding: "0 22px",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
  },

  lightButton: {
    minHeight: "46px",
    padding: "0 22px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
  },

  customerPage: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f8fafc",
    fontFamily: '"Inter", "Roboto", "Segoe UI", Arial, sans-serif',
  },

  customerHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "24px",
    padding: "32px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #dbeafe",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
  },

  customerTitle: {
    margin: "0",
    color: "#0f172a",
    fontSize: "32px",
    fontWeight: 800,
  },

  customerDescription: {
    maxWidth: "760px",
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  customerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },

  customerCard: {
    padding: "28px",
    borderRadius: "22px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
  },
};

export default App;
