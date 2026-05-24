import { loadStaffFlights } from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function StaffHomePage({ onNavigate }) {
  const flights = loadStaffFlights();
  const arrivals = flights.filter((item) => item.type === "DEN").length;
  const departures = flights.filter((item) => item.type === "DI").length;
  const issueFlights = flights.filter((item) => ["DELAYED", "CANCELLED"].includes(item.status)).length;

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Flight Operations</p>
          <h1 className="staff-page__title">Trang chủ nhân viên điều hành</h1>
          <p className="staff-page__desc">
            Tra cứu chuyến bay, cập nhật trạng thái, gửi thông báo thay đổi và theo dõi lịch sử cập nhật chuyến bay.
          </p>
        </div>
      </div>

      <section className="staff-grid staff-grid--4" style={{ marginBottom: 22 }}>
        <div className="staff-card staff-stat"><div className="staff-stat__icon">📋</div><div><p className="staff-stat__label">Tổng chuyến bay</p><p className="staff-stat__value">{flights.length}</p></div></div>
        <div className="staff-card staff-stat"><div className="staff-stat__icon">🛫</div><div><p className="staff-stat__label">Chuyến bay đi</p><p className="staff-stat__value">{departures}</p></div></div>
        <div className="staff-card staff-stat"><div className="staff-stat__icon">🛬</div><div><p className="staff-stat__label">Chuyến bay đến</p><p className="staff-stat__value">{arrivals}</p></div></div>
        <div className="staff-card staff-stat"><div className="staff-stat__icon">⏱</div><div><p className="staff-stat__label">Chậm / hủy</p><p className="staff-stat__value">{issueFlights}</p></div></div>
      </section>

      <section className="staff-grid staff-grid--3">
        <article className="staff-card staff-action-card">
          <div className="staff-action-card__icon">🛬</div>
          <h3>Chuyến bay đến</h3>
          <p>Xem danh sách các chuyến bay đang đến sân bay Đà Nẵng.</p>
          <button className="staff-btn staff-btn--primary" onClick={() => onNavigate("staffFlights", { type: "DEN" })}>Xem ngay</button>
        </article>
        <article className="staff-card staff-action-card">
          <div className="staff-action-card__icon">🛫</div>
          <h3>Chuyến bay đi</h3>
          <p>Xem danh sách các chuyến bay khởi hành từ Đà Nẵng.</p>
          <button className="staff-btn staff-btn--primary" onClick={() => onNavigate("staffFlights", { type: "DI" })}>Xem ngay</button>
        </article>
        <article className="staff-card staff-action-card">
          <div className="staff-action-card__icon">🔔</div>
          <h3>Thông báo thay đổi</h3>
          <p>Gửi thông báo khi chuyến bay có thay đổi trạng thái.</p>
          <button className="staff-btn staff-btn--secondary" onClick={() => onNavigate("staffNotifications")}>Gửi thông báo</button>
        </article>
      </section>
    </div>
  );
}

export default StaffHomePage;
