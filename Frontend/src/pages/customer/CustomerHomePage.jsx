import { useNavigate } from "react-router-dom";
import { loadCustomerFlights } from "../../data/customerData.js";
import "../../styles/customer/CustomerPages.css";

function CustomerHomePage() {
  const navigate = useNavigate();
  const flights = loadCustomerFlights();
  const arrivals = flights.filter((item) => item.type === "DEN");
  const departures = flights.filter((item) => item.type === "DI");
  const delayed = flights.filter((item) => item.status === "DELAYED");

  function handleQuickSearch(event) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("keyword")?.trim();
    navigate(`/customer/search?q=${encodeURIComponent(value || "")}`);
  }

  return (
    <div className="customer-page">
      <section className="customer-hero">
        <div>
          <p className="customer-eyebrow">Da Nang International Airport</p>
          <h1 className="customer-title">
            Tra cứu chuyến bay đến và đi tại sân bay Đà Nẵng
          </h1>
          <p className="customer-desc">
            Hành khách có thể xem danh sách chuyến bay, trạng thái, giờ dự kiến,
            cổng ra máy bay và băng chuyền hành lý theo thời gian cập nhật mới
            nhất.
          </p>
        </div>

        <form className="customer-search-box" onSubmit={handleQuickSearch}>
          <h3>Tìm nhanh chuyến bay</h3>
          <div className="customer-search-row">
            <input
              className="customer-input"
              name="keyword"
              placeholder="Nhập số hiệu, hãng bay, điểm đi/đến..."
            />
            <button
              className="customer-btn customer-btn--primary"
              type="submit"
            >
              Tra cứu
            </button>
          </div>
        </form>
      </section>

      <section className="customer-stat-grid">
        <div className="customer-stat-card">
          <p>Chuyến bay đến</p>
          <strong>{arrivals.length}</strong>
        </div>
        <div className="customer-stat-card">
          <p>Chuyến bay đi</p>
          <strong>{departures.length}</strong>
        </div>
        <div className="customer-stat-card">
          <p>Chậm chuyến</p>
          <strong>{delayed.length}</strong>
        </div>
      </section>

      <section className="customer-card-grid">
        <div className="customer-card">
          <h3>Chuyến bay đến</h3>
          <p>Xem các chuyến bay sắp hạ cánh tại sân bay quốc tế Đà Nẵng.</p>
          <button
            className="customer-btn customer-btn--primary"
            onClick={() => navigate("/customer/arrivals")}
          >
            Xem chuyến bay đến
          </button>
        </div>
        <div className="customer-card">
          <h3>Chuyến bay đi</h3>
          <p>Theo dõi các chuyến bay chuẩn bị khởi hành từ Đà Nẵng.</p>
          <button
            className="customer-btn customer-btn--primary"
            onClick={() => navigate("/customer/departures")}
          >
            Xem chuyến bay đi
          </button>
        </div>
        <div className="customer-card">
          <h3>Thông báo chuyến bay</h3>
          <p>
            Nhận thông báo khi chuyến bay đang theo dõi có thay đổi trạng thái.
          </p>
          <button
            className="customer-btn customer-btn--secondary"
            onClick={() => navigate("/customer/notifications")}
          >
            Xem thông báo
          </button>
        </div>
      </section>
    </div>
  );
}

export default CustomerHomePage;
