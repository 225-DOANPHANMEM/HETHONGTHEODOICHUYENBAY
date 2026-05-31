import { useEffect, useState } from "react";
import { layThongBaoKhachHang } from "../../api/customerApi.js";
import { getStatusClass, getStatusLabel, loadFollowedFlights } from "../../data/customerData.js";
import "../../styles/customer/CustomerPages.css";

function CustomerNotificationsPage() {
  const followed = loadFollowedFlights();
  const followedKey = followed.join("|");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");
        const data = await layThongBaoKhachHang(loadFollowedFlights());
        if (!ignore) setNotifications(data || []);
      } catch (err) {
        if (!ignore) setError(err.message || "Không thể tải thông báo.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadNotifications();
    return () => {
      ignore = true;
    };
  }, [followedKey]);

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Thông báo chuyến bay</h2>
          <p>
            Cập nhật thay đổi trạng thái, giờ bay, cổng ra máy bay và băng
            chuyền hành lý.
          </p>
        </div>
      </div>

      {loading ? <div className="customer-empty">Đang tải thông báo...</div> : null}
      {error ? <div className="customer-empty">{error}</div> : null}
      {!loading && !error && !notifications.length ? (
        <div className="customer-empty">Chưa có thông báo chuyến bay.</div>
      ) : null}

      <div className="customer-notification-list">
        {!loading && !error
          ? notifications.map((item) => (
              <article className="customer-notification-item" key={item.id}>
                <div
                  className="customer-section-head"
                  style={{ alignItems: "center" }}
                >
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                  <span className={getStatusClass(item.status)}>
                    {getStatusLabel(item.status, item.statusText)}
                  </span>
                </div>
                <div className="customer-muted" style={{ marginTop: 10 }}>
                  Số hiệu: {item.flightNo} · Thời gian: {item.createdAt || "--"}
                </div>
              </article>
            ))
          : null}
      </div>
    </div>
  );
}

export default CustomerNotificationsPage;
