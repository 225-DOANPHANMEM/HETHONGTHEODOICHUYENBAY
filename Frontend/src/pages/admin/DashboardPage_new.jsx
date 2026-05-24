import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/DashboardPage.css";

const overviewStats = [
  {
    id: 1,
    label: "Tổng chuyến bay hôm nay",
    value: "48",
    description: "Bao gồm chuyến bay đến và đi",
    icon: "🛫",
  },
  {
    id: 2,
    label: "Tổng lịch trình trong ngày",
    value: "156",
    description: "Tất cả lịch trình được sắp xếp",
    icon: "📋",
  },
  {
    id: 3,
    label: "Tài khoản hệ thống",
    value: "24",
    description: "Người dùng đang hoạt động",
    icon: "👥",
  },
  {
    id: 4,
    label: "Số lần cập nhật gần đây",
    value: "128",
    description: "Trong 24 giờ qua",
    icon: "🔄",
  },
  {
    id: 5,
    label: "Chuyến bay đang hoạt động",
    value: "12",
    description: "Đang làm thủ tục hoặc đang bay",
    icon: "📡",
  },
  {
    id: 6,
    label: "Chuyến bay chậm",
    value: "5",
    description: "Cần theo dõi và cập nhật",
    icon: "⏱",
  },
  {
    id: 7,
    label: "Cổng đang sử dụng",
    value: "7",
    description: "Đang được phân công",
    icon: "🚪",
  },
  {
    id: 8,
    label: "Băng chuyền đang sử dụng",
    value: "9",
    description: "Đang xử lý hành khách",
    icon: "🎫",
  },
];

const statusStats = [
  { id: 1, label: "Đã lên lịch", count: "18", color: "#e0f2fe" },
  { id: 2, label: "Đang làm thủ tục", count: "8", color: "#e0fdf4" },
  { id: 3, label: "Đang bay", count: "14", color: "#fef3c7" },
  { id: 4, label: "Chậm chuyến", count: "5", color: "#fee2e2" },
  { id: 5, label: "Hủy chuyến", count: "2", color: "#f3e8ff" },
  { id: 6, label: "Hoàn thành", count: "48", color: "#dcfce7" },
];

const attentionFlights = [
  {
    flightNo: "VN101",
    airline: "Vietnam Airlines",
    type: "Đi",
    route: "Đà Nẵng → Hà Nội",
    scheduledTime: "06:00",
    estimatedTime: "06:35",
    status: "Chậm chuyến",
    delayMinutes: 35,
    gate: "Cổng 1",
    baggage: "Không áp dụng",
    warning: "Chậm 35 phút",
    priority: "Cao",
  },
  {
    flightNo: "VJ203",
    airline: "Vietjet Air",
    type: "Đến",
    route: "TP.HCM → Đà Nẵng",
    scheduledTime: "09:15",
    estimatedTime: "09:15",
    status: "Đang làm thủ tục",
    delayMinutes: 0,
    gate: "Cổng 2",
    baggage: "Băng chuyền 2",
    warning: "Theo dõi thủ tục",
    priority: "Trung bình",
  },
  {
    flightNo: "SQ171",
    airline: "Singapore Airlines",
    type: "Đến",
    route: "Singapore → Đà Nẵng",
    scheduledTime: "16:40",
    estimatedTime: "16:40",
    status: "Đã hạ cánh",
    delayMinutes: 0,
    gate: "Cổng 4",
    baggage: "Băng chuyền 4",
    warning: "Đang trả hành lý",
    priority: "Thấp",
  },
  {
    flightNo: "QH305",
    airline: "Bamboo Airways",
    type: "Đi",
    route: "Đà Nẵng → Singapore",
    scheduledTime: "10:30",
    estimatedTime: "10:30",
    status: "Chưa phân công",
    delayMinutes: 0,
    gate: "Chưa phân công",
    baggage: "Không áp dụng",
    warning: "Thiếu cổng",
    priority: "Cao",
  },
  {
    flightNo: "KE462",
    airline: "Korean Air",
    type: "Đi",
    route: "Đà Nẵng → Seoul",
    scheduledTime: "18:00",
    estimatedTime: "--",
    status: "Hủy chuyến",
    delayMinutes: 0,
    gate: "Cổng 5",
    baggage: "Không áp dụng",
    warning: "Thời tiết xấu",
    priority: "Cao",
  },
  {
    flightNo: "VN220",
    airline: "Vietnam Airlines",
    type: "Đến",
    route: "Hà Nội → Đà Nẵng",
    scheduledTime: "19:20",
    estimatedTime: "19:45",
    status: "Chậm chuyến",
    delayMinutes: 25,
    gate: "Cổng 3",
    baggage: "Chưa phân công",
    warning: "Thiếu băng chuyền",
    priority: "Trung bình",
  },
];

const recentUpdates = [
  {
    user: "admin01",
    action: "Cập nhật trạng thái VN101 sang Chậm chuyến",
    time: "06:25",
  },
  {
    user: "dieuphoi01",
    action: "Phân công Cổng 2 cho VJ203",
    time: "07:30",
  },
  {
    user: "giamsat01",
    action: "Ghi nhận SQ171 đã hạ cánh",
    time: "16:45",
  },
  {
    user: "admin02",
    action: "Hủy chuyến KE462 do thời tiết xấu",
    time: "17:15",
  },
];

const quickActions = [
  {
    id: 1,
    icon: "🛫",
    title: "Quản lý chuyến bay",
    description: "Xem và cập nhật chuyến bay",
  },
  {
    id: 2,
    icon: "🧭",
    title: "Điều phối chuyến bay",
    description: "Phân công cổng và băng chuyền",
  },
  {
    id: 3,
    icon: "👤",
    title: "Quản lý người dùng",
    description: "Quản trị tài khoản và phân quyền",
  },
  {
    id: 4,
    icon: "📊",
    title: "Báo cáo thống kê",
    description: "Xem báo cáo và biểu đồ",
  },
];

function getStatusClass(status) {
  switch (status) {
    case "Chậm chuyến":
      return "dashboard-attention-table__chip--status-delayed";
    case "Đang làm thủ tục":
      return "dashboard-attention-table__chip--status-checkin";
    case "Đã hạ cánh":
      return "dashboard-attention-table__chip--status-landed";
    case "Chưa phân công":
      return "dashboard-attention-table__chip--status-unassigned";
    case "Hủy chuyến":
      return "dashboard-attention-table__chip--status-cancelled";
    default:
      return "dashboard-attention-table__chip--status-default";
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case "Cao":
      return "dashboard-attention-table__chip--priority-high";
    case "Trung bình":
      return "dashboard-attention-table__chip--priority-medium";
    case "Thấp":
      return "dashboard-attention-table__chip--priority-low";
    default:
      return "dashboard-attention-table__chip--priority-low";
  }
}

function DashboardPage({ onNavigate }) {
  return (
    <AdminLayout activePage="dashboard" onNavigate={onNavigate}>
      <section className="dashboard-page">
        <div className="dashboard-page__heading">
          <div>
            <p className="dashboard-page__eyebrow">Bảng điều khiển Admin</p>
            <h1 className="dashboard-page__title">Tổng quan hệ thống</h1>
            <p className="dashboard-page__description">
              Theo dõi nhanh tình hình chuyến bay, trạng thái vận hành và các
              cập nhật mới nhất trong ngày.
            </p>
          </div>

          <div
            className="dashboard-page__plane-icon"
            aria-label="Flight dashboard icon"
            role="img"
          >
            ✈️
          </div>
        </div>

        <div className="dashboard-page__stats-grid">
          {overviewStats.map((item) => (
            <article className="dashboard-stat-card" key={item.id}>
              <div className="dashboard-stat-card__icon">{item.icon}</div>

              <div className="dashboard-stat-card__content">
                <p className="dashboard-stat-card__label">{item.label}</p>
                <h2 className="dashboard-stat-card__value">{item.value}</h2>
                <p className="dashboard-stat-card__description">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">
                Thống kê theo trạng thái
              </h2>
              <p className="dashboard-panel__subtitle">
                Phân loại chuyến bay theo trạng thái vận hành trong ngày.
              </p>
            </div>
          </div>

          <div className="dashboard-status-list">
            {statusStats.map((item) => (
              <article
                className="dashboard-status-item"
                key={item.id}
                style={{ backgroundColor: item.color }}
              >
                <span className="dashboard-status-item__label">
                  {item.label}
                </span>
                <span className="dashboard-status-item__count">
                  {item.count}
                </span>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-page__content-grid">
          <section className="dashboard-panel dashboard-panel--attention">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">Chuyến bay cần chú ý</h2>
                <p className="dashboard-panel__subtitle">
                  Các chuyến bay có thay đổi trạng thái hoặc cần theo dõi ngay.
                </p>
                <p className="dashboard-attention-table__hint">
                  Ưu tiên các chuyến bay bị chậm, hủy hoặc thiếu phân công hạ
                  tầng.
                </p>
              </div>
            </div>

            <div className="dashboard-attention-table-wrapper">
              <div className="dashboard-attention-table__header">
                <span>Chuyến bay</span>
                <span>Hãng</span>
                <span>Lịch trình</span>
                <span>Trạng thái</span>
                <span>Hạ tầng</span>
                <span>Cảnh báo</span>
                <span>Ưu tiên</span>
              </div>

              <div className="dashboard-attention-table">
                {attentionFlights.map((flight) => (
                  <article
                    className="dashboard-attention-table__row"
                    key={flight.flightNo}
                  >
                    <div className="dashboard-attention-table__flight">
                      <p className="dashboard-attention-table__flight-number">
                        {flight.flightNo}
                      </p>
                      <p className="dashboard-attention-table__route">
                        {flight.route}
                      </p>
                    </div>

                    <div className="dashboard-attention-table__airline">
                      {flight.airline}
                    </div>

                    <div className="dashboard-attention-table__schedule">
                      <p className="dashboard-attention-table__schedule-line">
                        Dự kiến: {flight.scheduledTime}
                      </p>
                      <p className="dashboard-attention-table__schedule-line">
                        Ước tính: {flight.estimatedTime}
                      </p>
                      {flight.delayMinutes > 0 && (
                        <p className="dashboard-attention-table__delay">
                          Chậm: {flight.delayMinutes} phút
                        </p>
                      )}
                    </div>

                    <div className="dashboard-attention-table__status">
                      <span
                        className={`dashboard-attention-table__chip dashboard-attention-table__chip--status ${getStatusClass(
                          flight.status,
                        )}`}
                      >
                        {flight.status}
                      </span>
                    </div>

                    <div className="dashboard-attention-table__infrastructure">
                      <span className="dashboard-attention-table__chip">
                        Cổng: {flight.gate}
                      </span>
                      <span className="dashboard-attention-table__chip">
                        Băng chuyền: {flight.baggage}
                      </span>
                    </div>

                    <div className="dashboard-attention-table__warning">
                      {flight.warning}
                    </div>

                    <span
                      className={`dashboard-attention-table__chip dashboard-attention-table__priority ${getPriorityClass(
                        flight.priority,
                      )}`}
                    >
                      {flight.priority}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="dashboard-page__bottom-grid">
          <section className="dashboard-panel dashboard-quick-access">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">
                  Truy cập nhanh chức năng chính
                </h2>
                <p className="dashboard-panel__subtitle">
                  Nhanh chóng vào các chức năng sử dụng thường xuyên.
                </p>
              </div>
            </div>

            <div className="quick-access-grid">
              {quickActions.map((action) => (
                <button
                  className="quick-action-card"
                  key={action.id}
                  type="button"
                >
                  <div className="quick-action-card__icon">{action.icon}</div>
                  <div className="quick-action-card__text">
                    <p className="quick-action-card__title">{action.title}</p>
                    <p className="quick-action-card__desc">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">Hoạt động gần đây</h2>
                <p className="dashboard-panel__subtitle">
                  Lịch sử cập nhật mới nhất từ hệ thống vận hành.
                </p>
              </div>
            </div>

            <div className="dashboard-update-list">
              {recentUpdates.map((update, index) => (
                <article className="dashboard-update-item" key={index}>
                  <div className="dashboard-update-item__dot"></div>

                  <div className="dashboard-update-item__body">
                    <p className="dashboard-update-item__action">
                      {update.action}
                    </p>
                    <p className="dashboard-update-item__meta">
                      {update.user} · {update.time}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AdminLayout>
  );
}

export default DashboardPage;
