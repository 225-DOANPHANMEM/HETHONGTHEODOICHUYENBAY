import { loadCustomerNotifications } from "../../data/customerData.js";
import "../../styles/customer/CustomerPages.css";

function CustomerNotificationsPage() {
  const notifications = loadCustomerNotifications();

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Thông báo chuyến bay</h2>
          <p>Cập nhật thay đổi trạng thái, giờ bay, cổng ra máy bay và băng chuyền hành lý.</p>
        </div>
      </div>

      <div className="customer-notification-list">
        {notifications.map((item) => (
          <article className="customer-notification-item" key={item.id}>
            <div className="customer-section-head" style={{ alignItems: "center" }}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
              <span className="customer-status customer-status--scheduled">{item.status}</span>
            </div>
            <div className="customer-muted" style={{ marginTop: 10 }}>
              Số hiệu: {item.flightNo} · Thời gian: {item.createdAt}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default CustomerNotificationsPage;
