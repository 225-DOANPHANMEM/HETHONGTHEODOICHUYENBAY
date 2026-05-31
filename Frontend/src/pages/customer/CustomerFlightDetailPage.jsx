import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { layChiTietChuyenBayKhachHang } from "../../api/customerApi.js";
import {
  getStatusClass,
  getStatusLabel,
  isFollowingFlight,
  toggleFollowFlight,
} from "../../data/customerData.js";
import "../../styles/customer/CustomerPages.css";

function CustomerFlightDetailPage() {
  const navigate = useNavigate();
  const { flightNo } = useParams();
  const [flight, setFlight] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadFlight() {
      try {
        setLoading(true);
        setError("");
        const data = await layChiTietChuyenBayKhachHang(flightNo);
        if (!ignore) {
          setFlight(data);
          setIsFollowing(isFollowingFlight(data.flightNo));
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Không tìm thấy thông tin chuyến bay.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFlight();
    return () => {
      ignore = true;
    };
  }, [flightNo]);

  if (loading) {
    return <div className="customer-empty">Đang tải thông tin chuyến bay...</div>;
  }

  if (error || !flight) {
    return (
      <div className="customer-page">
        <div className="customer-empty">
          {error || "Không tìm thấy thông tin chuyến bay."}
        </div>
      </div>
    );
  }

  function handleToggleFollow() {
    toggleFollowFlight(flight.flightNo);
    setIsFollowing(isFollowingFlight(flight.flightNo));
  }

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Chi tiết chuyến bay {flight.flightNo}</h2>
          <p>
            Thông tin trạng thái, thời gian, cổng ra máy bay và băng chuyền
            hành lý.
          </p>
        </div>
        <button
          className="customer-btn customer-btn--secondary"
          onClick={() => navigate("/customer/search")}
        >
          ← Quay lại tra cứu
        </button>
      </div>

      <section className="customer-detail-grid">
        <div className="customer-panel customer-detail-card">
          <p className="customer-eyebrow" style={{ color: "#0284c7" }}>
            {flight.type === "DEN" ? "Arrival Flight" : "Departure Flight"}
          </p>
          <h1 className="customer-title" style={{ color: "#0f172a" }}>
            {flight.flightNo} · {flight.airline}
          </h1>
          <p className="customer-desc" style={{ color: "#64748b" }}>
            {flight.note}
          </p>

          <div className="customer-info-grid">
            <div className="customer-info-item">
              <span>Tuyến bay</span>
              <strong>
                {flight.from} → {flight.to}
              </strong>
            </div>
            <div className="customer-info-item">
              <span>Trạng thái</span>
              <strong>
                <span className={getStatusClass(flight.status)}>
                  {getStatusLabel(flight.status, flight.statusText)}
                </span>
              </strong>
            </div>
            <div className="customer-info-item">
              <span>Ngày bay</span>
              <strong>{flight.date || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Giờ hiển thị</span>
              <strong>{flight.estimatedTime || flight.scheduledTime || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Dự kiến khởi hành</span>
              <strong>{flight.estimatedDeparture || flight.scheduledDeparture || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Dự kiến hạ cánh</span>
              <strong>{flight.estimatedArrival || flight.scheduledArrival || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Cổng ra máy bay</span>
              <strong>{flight.gate || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Nhà ga</span>
              <strong>{flight.terminal || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Băng chuyền hành lý</span>
              <strong>{flight.carousel || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Chậm</span>
              <strong>{flight.delayMinutes ? `${flight.delayMinutes} phút` : "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Loại chuyến</span>
              <strong>
                {flight.type === "DEN" ? "Chuyến bay đến" : "Chuyến bay đi"}
              </strong>
            </div>
          </div>
        </div>

        <aside className="customer-panel customer-detail-card">
          <h3 style={{ marginTop: 0 }}>Theo dõi chuyến bay</h3>
          <p className="customer-muted" style={{ lineHeight: 1.7 }}>
            Khi theo dõi chuyến bay, hành khách có thể xem nhanh chuyến này
            trong danh sách theo dõi và lọc thông báo liên quan.
          </p>
          <button
            type="button"
            className={
              isFollowing
                ? "customer-btn customer-btn--danger"
                : "customer-btn customer-btn--primary"
            }
            onClick={handleToggleFollow}
            style={{ width: "100%", marginTop: 16 }}
          >
            {isFollowing ? "Hủy theo dõi" : "Theo dõi chuyến bay"}
          </button>
        </aside>
      </section>
    </div>
  );
}

export default CustomerFlightDetailPage;
