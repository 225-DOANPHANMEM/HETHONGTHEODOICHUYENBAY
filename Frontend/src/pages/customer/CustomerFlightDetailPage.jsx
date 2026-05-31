import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFlightByCode } from "../../api";
import { mapApiFlightToCustomer } from "../../utils/flightMapper";
import { getStatusClass, getStatusLabel } from "../../data/customerData.js";
import "../../styles/customer/CustomerPages.css";

function CustomerFlightDetailPage() {
  const navigate = useNavigate();
  const { flightNo } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followMsg, setFollowMsg] = useState("");

  // Lấy thông tin user đang đăng nhập (nếu có)
  const currentUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("customerUser") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    setLoading(true);
    setError("");
    getFlightByCode(flightNo)
      .then((data) => {
        const mapped = mapApiFlightToCustomer(data);
        setFlight(mapped);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [flightNo]);

  if (loading) {
    return <div className="customer-empty">Đang tải thông tin chuyến bay...</div>;
  }

  if (error || !flight) {
    return (
      <div className="customer-empty">
        {error || "Không tìm thấy thông tin chuyến bay."}
      </div>
    );
  }

  async function handleToggleFollow() {
    if (!currentUser) {
      setFollowMsg("Vui lòng đăng nhập để theo dõi chuyến bay.");
      return;
    }

    try {
      const { followFlight, unfollowFlight } = await import("../../api");
      if (isFollowing) {
        await unfollowFlight(currentUser.maTaiKhoan, flight._raw.MaLichTrinh);
        setIsFollowing(false);
        setFollowMsg("Đã hủy theo dõi chuyến bay.");
      } else {
        await followFlight(currentUser.maTaiKhoan, flight._raw.MaLichTrinh);
        setIsFollowing(true);
        setFollowMsg("Đã theo dõi chuyến bay thành công.");
      }
    } catch (err) {
      setFollowMsg(err.message);
    }
  }

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Chi tiết chuyến bay {flight.flightNo}</h2>
          <p>
            Thông tin trạng thái, thời gian, cổng ra máy bay và băng chuyền hành lý.
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
          {flight.note && (
            <p className="customer-desc" style={{ color: "#64748b" }}>
              {flight.note}
            </p>
          )}

          <div className="customer-info-grid">
            <div className="customer-info-item">
              <span>Tuyến bay</span>
              <strong>{flight.from} → {flight.to}</strong>
            </div>
            <div className="customer-info-item">
              <span>Trạng thái</span>
              <strong>
                <span className={getStatusClass(flight.status)}>
                  {getStatusLabel(flight.status)}
                </span>
              </strong>
            </div>
            <div className="customer-info-item">
              <span>Ngày bay</span>
              <strong>{flight.date}</strong>
            </div>
            <div className="customer-info-item">
              <span>Giờ dự kiến</span>
              <strong>{flight.scheduledTime}</strong>
            </div>
            <div className="customer-info-item">
              <span>Giờ ước tính</span>
              <strong>{flight.estimatedTime}</strong>
            </div>
            <div className="customer-info-item">
              <span>Cổng ra máy bay</span>
              <strong>{flight.gate || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Băng chuyền hành lý</span>
              <strong>{flight.carousel || "--"}</strong>
            </div>
            <div className="customer-info-item">
              <span>Loại chuyến</span>
              <strong>{flight.type === "DEN" ? "Chuyến bay đến" : "Chuyến bay đi"}</strong>
            </div>
          </div>
        </div>

        <aside className="customer-panel customer-detail-card">
          <h3 style={{ marginTop: 0 }}>Theo dõi chuyến bay</h3>
          <p className="customer-muted" style={{ lineHeight: 1.7 }}>
            Khi theo dõi chuyến bay, bạn có thể xem nhanh chuyến này trong danh
            sách theo dõi và nhận thông báo thay đổi.
          </p>
          {followMsg && (
            <p style={{ fontSize: "13px", color: "#0284c7", marginTop: 8 }}>
              {followMsg}
            </p>
          )}
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
