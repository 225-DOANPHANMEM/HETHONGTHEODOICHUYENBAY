import { useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/NotificationHistoryPage.css";

const SEND_METHODS = ["Email", "SMS", "Ứng dụng", "Hệ thống"];
const SEND_STATUSES = ["Chờ gửi", "Đã gửi", "Lỗi gửi"];

const FLIGHT_STATUSES = [
  "Đã lên lịch",
  "Đang làm thủ tục",
  "Đang bay",
  "Đã hạ cánh",
  "Hoàn thành",
  "Chậm chuyến",
  "Hủy chuyến",
  "Đã xóa",
];

const initialFlights = [
  {
    scheduleId: "LT001",
    flightNumber: "VN101",
    airlineName: "Vietnam Airlines",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Hà Nội",
    gateName: "Cổng 1",
    beltName: "Không áp dụng",
  },
  {
    scheduleId: "LT002",
    flightNumber: "VJ203",
    airlineName: "Vietjet Air",
    type: "Đến",
    departure: "TP.HCM",
    destination: "Đà Nẵng",
    gateName: "Cổng 2",
    beltName: "Băng chuyền 1",
  },
  {
    scheduleId: "LT003",
    flightNumber: "QH305",
    airlineName: "Bamboo Airways",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Singapore",
    gateName: "Cổng 3",
    beltName: "Không áp dụng",
  },
  {
    scheduleId: "LT004",
    flightNumber: "SQ171",
    airlineName: "Singapore Airlines",
    type: "Đến",
    departure: "Singapore",
    destination: "Đà Nẵng",
    gateName: "Cổng 4",
    beltName: "Băng chuyền 3",
  },
  {
    scheduleId: "LT005",
    flightNumber: "KE462",
    airlineName: "Korean Air",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Seoul",
    gateName: "Cổng 5",
    beltName: "Không áp dụng",
  },
];

const initialNotifications = [
  {
    id: "TB01",
    scheduleId: "LT001",
    accountId: "TK01",
    flightNumber: "VN101",
    gateName: "Cổng 1",
    beltName: "Không áp dụng",
    content: "Chuyến bay VN101 đã được lên lịch khởi hành tại Cổng 1.",
    newStatus: "Đã lên lịch",
    newEstimatedTime: "2026-05-01T06:00",
    method: "Hệ thống",
    sendStatus: "Đã gửi",
    sentAt: "2026-05-01T05:00",
  },
  {
    id: "TB02",
    scheduleId: "LT002",
    accountId: "TK02",
    flightNumber: "VJ203",
    gateName: "Cổng 2",
    beltName: "Băng chuyền 1",
    content:
      "Chuyến bay VJ203 dự kiến hạ cánh lúc 09:15 và nhận hành lý tại Băng chuyền 1.",
    newStatus: "Đã lên lịch",
    newEstimatedTime: "2026-05-01T09:15",
    method: "Email",
    sendStatus: "Đã gửi",
    sentAt: "2026-05-01T05:05",
  },
  {
    id: "TB03",
    scheduleId: "LT003",
    accountId: "TK03",
    flightNumber: "QH305",
    gateName: "Cổng 3",
    beltName: "Không áp dụng",
    content: "Chuyến bay QH305 có thay đổi giờ ước tính khởi hành.",
    newStatus: "Chậm chuyến",
    newEstimatedTime: "2026-05-01T11:00",
    method: "SMS",
    sendStatus: "Chờ gửi",
    sentAt: "",
  },
  {
    id: "TB04",
    scheduleId: "LT004",
    accountId: "TK04",
    flightNumber: "SQ171",
    gateName: "Cổng 4",
    beltName: "Băng chuyền 3",
    content: "Chuyến bay SQ171 đã đổi sang Băng chuyền 3.",
    newStatus: "Đã hạ cánh",
    newEstimatedTime: "2026-05-01T16:40",
    method: "Ứng dụng",
    sendStatus: "Lỗi gửi",
    sentAt: "",
  },
];

const initialUpdateHistory = [
  {
    id: "LS01",
    scheduleId: "LT001",
    accountId: "TK01",
    accountName: "admin01",
    flightNumber: "VN101",
    oldStatus: "Đã lên lịch",
    newStatus: "Đã lên lịch",
    oldEstimatedTime: "2026-05-01T06:00",
    newEstimatedTime: "2026-05-01T06:00",
    delayMinutes: 0,
    reason: "Khởi tạo",
    content: "Tạo lịch trình ban đầu cho chuyến bay VN101.",
    updatedAt: "2026-05-01T05:00",
  },
  {
    id: "LS02",
    scheduleId: "LT002",
    accountId: "TK02",
    accountName: "dieuphoi01",
    flightNumber: "VJ203",
    oldStatus: "Đã lên lịch",
    newStatus: "Đã lên lịch",
    oldEstimatedTime: "2026-05-01T09:15",
    newEstimatedTime: "2026-05-01T09:15",
    delayMinutes: 0,
    reason: "Khởi tạo",
    content: "Tạo lịch trình ban đầu cho chuyến bay VJ203.",
    updatedAt: "2026-05-01T05:05",
  },
  {
    id: "LS03",
    scheduleId: "LT003",
    accountId: "TK03",
    accountName: "giamsat01",
    flightNumber: "QH305",
    oldStatus: "Đã lên lịch",
    newStatus: "Chậm chuyến",
    oldEstimatedTime: "2026-05-01T10:30",
    newEstimatedTime: "2026-05-01T11:00",
    delayMinutes: 30,
    reason: "Thời tiết xấu",
    content: "Cập nhật chuyến bay QH305 chậm 30 phút.",
    updatedAt: "2026-05-01T09:50",
  },
  {
    id: "LS04",
    scheduleId: "LT004",
    accountId: "TK04",
    accountName: "nhanvien01",
    flightNumber: "SQ171",
    oldStatus: "Đang bay",
    newStatus: "Đã hạ cánh",
    oldEstimatedTime: "2026-05-01T16:40",
    newEstimatedTime: "2026-05-01T16:40",
    delayMinutes: 0,
    reason: "Máy bay đã hạ cánh",
    content: "Cập nhật trạng thái chuyến bay SQ171 đã hạ cánh.",
    updatedAt: "2026-05-01T16:42",
  },
];

const emptyNotificationForm = {
  scheduleId: "LT001",
  content: "",
  newStatus: "Đã lên lịch",
  newEstimatedTime: "",
  method: "Hệ thống",
};

function NotificationHistoryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [updateHistory] = useState(initialUpdateHistory);
  const [notificationForm, setNotificationForm] = useState(
    emptyNotificationForm,
  );
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [notificationKeyword, setNotificationKeyword] = useState("");
  const [methodFilter, setMethodFilter] = useState("Tất cả");
  const [sendStatusFilter, setSendStatusFilter] = useState("Tất cả");

  const [historyKeyword, setHistoryKeyword] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("Tất cả");
  const [accountFilter, setAccountFilter] = useState("Tất cả");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const flightByScheduleId = useMemo(() => {
    return initialFlights.reduce((map, flight) => {
      map[flight.scheduleId] = flight;
      return map;
    }, {});
  }, []);

  const accountOptions = useMemo(() => {
    return [...new Set(updateHistory.map((item) => item.accountName))];
  }, [updateHistory]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      waiting: notifications.filter((item) => item.sendStatus === "Chờ gửi")
        .length,
      sent: notifications.filter((item) => item.sendStatus === "Đã gửi").length,
      failed: notifications.filter((item) => item.sendStatus === "Lỗi gửi")
        .length,
      history: updateHistory.length,
    };
  }, [notifications, updateHistory]);

  const filteredNotifications = useMemo(() => {
    const searchValue = notificationKeyword.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesKeyword =
        item.id.toLowerCase().includes(searchValue) ||
        item.scheduleId.toLowerCase().includes(searchValue) ||
        item.flightNumber.toLowerCase().includes(searchValue) ||
        item.content.toLowerCase().includes(searchValue) ||
        item.newStatus.toLowerCase().includes(searchValue);

      const matchesMethod =
        methodFilter === "Tất cả" || item.method === methodFilter;

      const matchesSendStatus =
        sendStatusFilter === "Tất cả" || item.sendStatus === sendStatusFilter;

      return matchesKeyword && matchesMethod && matchesSendStatus;
    });
  }, [notifications, notificationKeyword, methodFilter, sendStatusFilter]);

  const filteredHistory = useMemo(() => {
    const searchValue = historyKeyword.trim().toLowerCase();

    return updateHistory.filter((item) => {
      const updatedDate = item.updatedAt.slice(0, 10);

      const matchesKeyword =
        item.id.toLowerCase().includes(searchValue) ||
        item.scheduleId.toLowerCase().includes(searchValue) ||
        item.flightNumber.toLowerCase().includes(searchValue) ||
        item.accountName.toLowerCase().includes(searchValue) ||
        item.content.toLowerCase().includes(searchValue) ||
        item.reason.toLowerCase().includes(searchValue);

      const matchesStatus =
        historyStatusFilter === "Tất cả" ||
        item.oldStatus === historyStatusFilter ||
        item.newStatus === historyStatusFilter;

      const matchesAccount =
        accountFilter === "Tất cả" || item.accountName === accountFilter;

      const matchesFromDate = !fromDate || updatedDate >= fromDate;
      const matchesToDate = !toDate || updatedDate <= toDate;

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesAccount &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    updateHistory,
    historyKeyword,
    historyStatusFilter,
    accountFilter,
    fromDate,
    toDate,
  ]);

  const formatDateTime = (value) => {
    if (!value) {
      return "Chưa có";
    }

    return value.replace("T", " ");
  };

  const generateId = (prefix, items) => {
    return `${prefix}${String(items.length + 1).padStart(2, "0")}`;
  };

  const handleChangeNotificationForm = (event) => {
    const { name, value } = event.target;
    setNotificationForm({ ...notificationForm, [name]: value });
  };

  const handleCreateNotification = (event) => {
    event.preventDefault();

    const flight = flightByScheduleId[notificationForm.scheduleId];

    if (!flight) {
      alert("Không tìm thấy lịch trình chuyến bay.");
      return;
    }

    if (!notificationForm.content.trim()) {
      alert("Vui lòng nhập nội dung thông báo.");
      return;
    }

    const nextNotification = {
      id: generateId("TB", notifications),
      scheduleId: notificationForm.scheduleId,
      accountId: "TK01",
      flightNumber: flight.flightNumber,
      gateName: flight.gateName,
      beltName: flight.beltName,
      content: notificationForm.content.trim(),
      newStatus: notificationForm.newStatus,
      newEstimatedTime: notificationForm.newEstimatedTime,
      method: notificationForm.method,
      sendStatus: "Chờ gửi",
      sentAt: "",
    };

    setNotifications([nextNotification, ...notifications]);
    setNotificationForm(emptyNotificationForm);
    alert("Tạo thông báo thay đổi chuyến bay thành công.");
  };

  const handleChangeSendStatus = (notificationId, nextStatus) => {
    setNotifications(
      notifications.map((item) => {
        if (item.id !== notificationId) {
          return item;
        }

        return {
          ...item,
          sendStatus: nextStatus,
          sentAt:
            nextStatus === "Đã gửi"
              ? new Date().toISOString().slice(0, 16)
              : item.sentAt,
        };
      }),
    );
  };

  const handleChangeMethod = (notificationId, nextMethod) => {
    setNotifications(
      notifications.map((item) =>
        item.id === notificationId ? { ...item, method: nextMethod } : item,
      ),
    );
  };

  const getSendStatusClassName = (status) => {
    const map = {
      "Chờ gửi": "notify-status notify-status--waiting",
      "Đã gửi": "notify-status notify-status--sent",
      "Lỗi gửi": "notify-status notify-status--failed",
    };

    return map[status] || "notify-status";
  };

  const getFlightStatusClassName = (status) => {
    const map = {
      "Đã lên lịch": "notify-flight-status notify-flight-status--scheduled",
      "Đang làm thủ tục": "notify-flight-status notify-flight-status--checkin",
      "Đang bay": "notify-flight-status notify-flight-status--flying",
      "Đã hạ cánh": "notify-flight-status notify-flight-status--landed",
      "Hoàn thành": "notify-flight-status notify-flight-status--completed",
      "Chậm chuyến": "notify-flight-status notify-flight-status--delayed",
      "Hủy chuyến": "notify-flight-status notify-flight-status--cancelled",
      "Đã xóa": "notify-flight-status notify-flight-status--deleted",
    };

    return map[status] || "notify-flight-status";
  };

  return (
    <AdminLayout activePage="notifications" onNavigate={onNavigate}>
      <section className="notify-page">
        <div className="notify-page__heading">
          <div>
            <p className="notify-page__eyebrow">Notifications & Update Logs</p>
            <h1 className="notify-page__title">Thông báo & lịch sử cập nhật</h1>
            <p className="notify-page__description">
              Theo dõi thông báo thay đổi chuyến bay, trạng thái gửi thông báo
              và lịch sử cập nhật tình hình chuyến bay đến/đi tại sân bay quốc
              tế Đà Nẵng.
            </p>
          </div>

          <div className="notify-page__heading-icon">🔔</div>
        </div>

        <div className="notify-page__stats-grid">
          <article className="notify-stat-card">
            <span className="notify-stat-card__icon">📨</span>
            <div>
              <p className="notify-stat-card__label">Tổng thông báo</p>
              <h2 className="notify-stat-card__value">{stats.total}</h2>
            </div>
          </article>

          <article className="notify-stat-card">
            <span className="notify-stat-card__icon">⏳</span>
            <div>
              <p className="notify-stat-card__label">Chờ gửi</p>
              <h2 className="notify-stat-card__value">{stats.waiting}</h2>
            </div>
          </article>

          <article className="notify-stat-card">
            <span className="notify-stat-card__icon">✅</span>
            <div>
              <p className="notify-stat-card__label">Đã gửi</p>
              <h2 className="notify-stat-card__value">{stats.sent}</h2>
            </div>
          </article>

          <article className="notify-stat-card">
            <span className="notify-stat-card__icon">🧾</span>
            <div>
              <p className="notify-stat-card__label">Lịch sử cập nhật</p>
              <h2 className="notify-stat-card__value">{stats.history}</h2>
            </div>
          </article>
        </div>

        <div className="notify-tabs">
          <button
            className={
              activeTab === "notifications"
                ? "notify-tabs__button notify-tabs__button--active"
                : "notify-tabs__button"
            }
            type="button"
            onClick={() => setActiveTab("notifications")}
          >
            🔔 Thông báo chuyến bay
          </button>

          <button
            className={
              activeTab === "history"
                ? "notify-tabs__button notify-tabs__button--active"
                : "notify-tabs__button"
            }
            type="button"
            onClick={() => setActiveTab("history")}
          >
            🧾 Lịch sử cập nhật
          </button>
        </div>

        {activeTab === "notifications" && (
          <>
            <section className="notify-panel">
              <div className="notify-panel__header">
                <div>
                  <h2 className="notify-panel__title">
                    Tạo thông báo thay đổi chuyến bay
                  </h2>
                  <p className="notify-panel__subtitle">
                    Tạo thông báo khi chuyến bay đổi trạng thái, đổi giờ ước
                    tính, đổi cổng hoặc đổi băng chuyền.
                  </p>
                </div>
              </div>

              <form
                className="notify-create-form"
                onSubmit={handleCreateNotification}
              >
                <select
                  className="notify-form__input"
                  name="scheduleId"
                  value={notificationForm.scheduleId}
                  onChange={handleChangeNotificationForm}
                >
                  {initialFlights.map((flight) => (
                    <option key={flight.scheduleId} value={flight.scheduleId}>
                      {flight.flightNumber} - {flight.departure} →{" "}
                      {flight.destination}
                    </option>
                  ))}
                </select>

                <select
                  className="notify-form__input"
                  name="newStatus"
                  value={notificationForm.newStatus}
                  onChange={handleChangeNotificationForm}
                >
                  {FLIGHT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <input
                  className="notify-form__input"
                  type="datetime-local"
                  name="newEstimatedTime"
                  value={notificationForm.newEstimatedTime}
                  onChange={handleChangeNotificationForm}
                />

                <select
                  className="notify-form__input"
                  name="method"
                  value={notificationForm.method}
                  onChange={handleChangeNotificationForm}
                >
                  {SEND_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>

                <input
                  className="notify-form__input notify-create-form__content"
                  name="content"
                  value={notificationForm.content}
                  onChange={handleChangeNotificationForm}
                  placeholder="Nội dung thông báo thay đổi chuyến bay..."
                />

                <div className="notify-create-form__actions">
                  <button className="notify-primary-button" type="submit">
                    Tạo thông báo
                  </button>
                </div>
              </form>
            </section>

            <section className="notify-panel">
              <div className="notify-panel__header notify-panel__header--split">
                <div>
                  <h2 className="notify-panel__title">
                    Danh sách thông báo chuyến bay
                  </h2>
                  <p className="notify-panel__subtitle">
                    Theo dõi nội dung thông báo, phương thức gửi, trạng thái gửi
                    và thời gian gửi.
                  </p>
                </div>

                <span className="notify-panel__count">
                  {filteredNotifications.length} thông báo
                </span>
              </div>

              <div className="notify-toolbar">
                <input
                  className="notify-form__input"
                  value={notificationKeyword}
                  onChange={(event) =>
                    setNotificationKeyword(event.target.value)
                  }
                  placeholder="Tìm mã thông báo, chuyến bay, nội dung..."
                />

                <select
                  className="notify-form__input"
                  value={methodFilter}
                  onChange={(event) => setMethodFilter(event.target.value)}
                >
                  <option value="Tất cả">Tất cả phương thức</option>
                  {SEND_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>

                <select
                  className="notify-form__input"
                  value={sendStatusFilter}
                  onChange={(event) => setSendStatusFilter(event.target.value)}
                >
                  <option value="Tất cả">Tất cả trạng thái gửi</option>
                  {SEND_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="notify-table-wrapper">
                <div className="notify-table notify-table--notifications">
                  <div className="notify-table__header">
                    <span>Mã TB</span>
                    <span>Chuyến bay</span>
                    <span>Nội dung</span>
                    <span>Trạng thái mới</span>
                    <span>Phương thức</span>
                    <span>Trạng thái gửi</span>
                    <span>Thời gian gửi</span>
                    <span>Thao tác</span>
                  </div>

                  {filteredNotifications.map((item) => (
                    <div className="notify-table__row" key={item.id}>
                      <span className="notify-table__code">{item.id}</span>

                      <span className="notify-table__text">
                        {item.flightNumber}
                      </span>

                      <span className="notify-table__text notify-table__content">
                        {item.content}
                      </span>

                      <span
                        className={getFlightStatusClassName(item.newStatus)}
                      >
                        {item.newStatus}
                      </span>

                      <select
                        className="notify-table__select"
                        value={item.method}
                        onChange={(event) =>
                          handleChangeMethod(item.id, event.target.value)
                        }
                      >
                        {SEND_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>

                      <select
                        className={getSendStatusClassName(item.sendStatus)}
                        value={item.sendStatus}
                        onChange={(event) =>
                          handleChangeSendStatus(item.id, event.target.value)
                        }
                      >
                        {SEND_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <span className="notify-table__text">
                        {formatDateTime(item.sentAt)}
                      </span>

                      <div className="notify-table__actions">
                        <button
                          className="notify-table__button"
                          type="button"
                          onClick={() =>
                            setSelectedDetail({
                              type: "notification",
                              data: item,
                            })
                          }
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredNotifications.length === 0 && (
                  <div className="notify-empty">
                    <span>🔎</span>
                    <p>Không tìm thấy thông báo phù hợp.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "history" && (
          <section className="notify-panel">
            <div className="notify-panel__header notify-panel__header--split">
              <div>
                <h2 className="notify-panel__title">
                  Lịch sử cập nhật chuyến bay
                </h2>
                <p className="notify-panel__subtitle">
                  Hiển thị trạng thái cũ, trạng thái mới, giờ ước tính cũ, giờ
                  ước tính mới, số phút chậm, lý do và nội dung cập nhật.
                </p>
              </div>

              <span className="notify-panel__count">
                {filteredHistory.length} bản ghi
              </span>
            </div>

            <div className="notify-history-toolbar">
              <input
                className="notify-form__input"
                value={historyKeyword}
                onChange={(event) => setHistoryKeyword(event.target.value)}
                placeholder="Tìm mã lịch sử, mã lịch trình, chuyến bay, người cập nhật..."
              />

              <select
                className="notify-form__input"
                value={historyStatusFilter}
                onChange={(event) => setHistoryStatusFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                {FLIGHT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                className="notify-form__input"
                value={accountFilter}
                onChange={(event) => setAccountFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả người cập nhật</option>
                {accountOptions.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>

              <input
                className="notify-form__input"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />

              <input
                className="notify-form__input"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>

            <div className="notify-table-wrapper">
              <div className="notify-table notify-table--history">
                <div className="notify-table__header">
                  <span>Mã LS</span>
                  <span>Lịch trình</span>
                  <span>Chuyến bay</span>
                  <span>Người cập nhật</span>
                  <span>Trạng thái</span>
                  <span>Giờ ước tính</span>
                  <span>Chậm</span>
                  <span>Lý do</span>
                  <span>Thao tác</span>
                </div>

                {filteredHistory.map((item) => (
                  <div className="notify-table__row" key={item.id}>
                    <span className="notify-table__code">{item.id}</span>

                    <span className="notify-table__text">
                      {item.scheduleId}
                    </span>

                    <span className="notify-table__text">
                      {item.flightNumber}
                    </span>

                    <span className="notify-table__text">
                      {item.accountName}
                    </span>

                    <div className="notify-history-status">
                      <span
                        className={getFlightStatusClassName(item.oldStatus)}
                      >
                        {item.oldStatus}
                      </span>
                      <span className="notify-history-status__arrow">→</span>
                      <span
                        className={getFlightStatusClassName(item.newStatus)}
                      >
                        {item.newStatus}
                      </span>
                    </div>

                    <span className="notify-table__text">
                      {formatDateTime(item.oldEstimatedTime)} →{" "}
                      {formatDateTime(item.newEstimatedTime)}
                    </span>

                    <span className="notify-table__text">
                      {item.delayMinutes} phút
                    </span>

                    <span className="notify-table__text">{item.reason}</span>

                    <div className="notify-table__actions">
                      <button
                        className="notify-table__button"
                        type="button"
                        onClick={() =>
                          setSelectedDetail({
                            type: "history",
                            data: item,
                          })
                        }
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredHistory.length === 0 && (
                <div className="notify-empty">
                  <span>🔎</span>
                  <p>Không tìm thấy lịch sử cập nhật phù hợp.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {selectedDetail && (
          <div className="notify-modal-backdrop">
            <div className="notify-modal">
              <div className="notify-modal__header">
                <div>
                  <p className="notify-page__eyebrow">
                    {selectedDetail.type === "notification"
                      ? "Chi tiết thông báo"
                      : "Chi tiết lịch sử cập nhật"}
                  </p>
                  <h2>
                    {selectedDetail.type === "notification"
                      ? selectedDetail.data.id
                      : selectedDetail.data.flightNumber}
                  </h2>
                </div>

                <button
                  className="notify-modal__close"
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                >
                  ×
                </button>
              </div>

              {selectedDetail.type === "notification" && (
                <div className="notify-modal__grid">
                  <div className="notify-detail-card">
                    <span>Mã lịch trình</span>
                    <strong>{selectedDetail.data.scheduleId}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Số hiệu chuyến bay</span>
                    <strong>{selectedDetail.data.flightNumber}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Cổng</span>
                    <strong>{selectedDetail.data.gateName}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Băng chuyền</span>
                    <strong>{selectedDetail.data.beltName}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Trạng thái mới</span>
                    <strong>{selectedDetail.data.newStatus}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Giờ ước tính mới</span>
                    <strong>
                      {formatDateTime(selectedDetail.data.newEstimatedTime)}
                    </strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Phương thức gửi</span>
                    <strong>{selectedDetail.data.method}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Trạng thái gửi</span>
                    <strong>{selectedDetail.data.sendStatus}</strong>
                  </div>

                  <div className="notify-detail-card notify-detail-card--wide">
                    <span>Nội dung thông báo</span>
                    <strong>{selectedDetail.data.content}</strong>
                  </div>
                </div>
              )}

              {selectedDetail.type === "history" && (
                <div className="notify-modal__grid">
                  <div className="notify-detail-card">
                    <span>Mã lịch sử</span>
                    <strong>{selectedDetail.data.id}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Mã lịch trình</span>
                    <strong>{selectedDetail.data.scheduleId}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Người cập nhật</span>
                    <strong>{selectedDetail.data.accountName}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Thời gian cập nhật</span>
                    <strong>
                      {formatDateTime(selectedDetail.data.updatedAt)}
                    </strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Trạng thái cũ</span>
                    <strong>{selectedDetail.data.oldStatus}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Trạng thái mới</span>
                    <strong>{selectedDetail.data.newStatus}</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Số phút chậm</span>
                    <strong>{selectedDetail.data.delayMinutes} phút</strong>
                  </div>

                  <div className="notify-detail-card">
                    <span>Lý do</span>
                    <strong>{selectedDetail.data.reason}</strong>
                  </div>

                  <div className="notify-detail-card notify-detail-card--wide">
                    <span>Nội dung cập nhật</span>
                    <strong>{selectedDetail.data.content}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default NotificationHistoryPage;
