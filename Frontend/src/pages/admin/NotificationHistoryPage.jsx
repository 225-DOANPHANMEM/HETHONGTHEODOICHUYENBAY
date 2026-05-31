import { useCallback, useEffect, useMemo, useState } from "react";
import {
  capNhatTrangThaiThongBao,
  layChiTietLichSuCapNhat,
  layChiTietThongBao,
  layDanhSachLichSuCapNhat,
  layDanhSachThongBao,
  layPhuongThucThongBao,
  layThongKeThongBaoLichSu,
  layTrangThaiChuyenBayThongBao,
  layTrangThaiGuiThongBao,
} from "../../api/thongBaoLichSuApi.js";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/NotificationHistoryPage.css";

const EMPTY_NOTIFICATION_FILTERS = {
  keyword: "",
  method: "",
  sendStatus: "",
  date: "",
};

const EMPTY_HISTORY_FILTERS = {
  keyword: "",
  status: "",
  fromDate: "",
  toDate: "",
};

const INITIAL_STATS = {
  totalNotifications: 0,
  pendingNotifications: 0,
  sentNotifications: 0,
  failedNotifications: 0,
  totalHistories: 0,
  todayHistories: 0,
};

function NotificationHistoryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [stats, setStats] = useState(INITIAL_STATS);
  const [notifications, setNotifications] = useState([]);
  const [histories, setHistories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [sendStatuses, setSendStatuses] = useState([]);
  const [flightStatuses, setFlightStatuses] = useState([]);
  const [notificationFilters, setNotificationFilters] = useState(EMPTY_NOTIFICATION_FILTERS);
  const [appliedNotificationFilters, setAppliedNotificationFilters] = useState(EMPTY_NOTIFICATION_FILTERS);
  const [historyFilters, setHistoryFilters] = useState(EMPTY_HISTORY_FILTERS);
  const [appliedHistoryFilters, setAppliedHistoryFilters] = useState(EMPTY_HISTORY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const statCards = useMemo(() => [
    { key: "totalNotifications", label: "Tổng thông báo", icon: "fa-bell" },
    { key: "pendingNotifications", label: "Thông báo chờ gửi", icon: "fa-hourglass-half" },
    { key: "sentNotifications", label: "Thông báo đã gửi", icon: "fa-circle-check" },
    { key: "failedNotifications", label: "Thông báo lỗi gửi", icon: "fa-triangle-exclamation" },
    { key: "totalHistories", label: "Tổng lịch sử cập nhật", icon: "fa-clock-rotate-left" },
    { key: "todayHistories", label: "Cập nhật hôm nay", icon: "fa-clipboard-list" },
  ], []);

  const loadStats = useCallback(async () => {
    const data = await layThongKeThongBaoLichSu();
    setStats({
      totalNotifications: data?.totalNotifications ?? data?.tongThongBao ?? 0,
      pendingNotifications: data?.pendingNotifications ?? data?.soChoGui ?? 0,
      sentNotifications: data?.sentNotifications ?? data?.soDaGui ?? 0,
      failedNotifications: data?.failedNotifications ?? data?.soLoiGui ?? 0,
      totalHistories: data?.totalHistories ?? data?.tongLichSuCapNhat ?? 0,
      todayHistories: data?.todayHistories ?? data?.soCapNhatHomNay ?? 0,
    });
  }, []);

  const loadOptions = useCallback(async () => {
    const [methodData, statusData, flightStatusData] = await Promise.all([
      layPhuongThucThongBao(),
      layTrangThaiGuiThongBao(),
      layTrangThaiChuyenBayThongBao(),
    ]);
    setMethods(Array.isArray(methodData) ? methodData : []);
    setSendStatuses(Array.isArray(statusData) ? statusData : []);
    setFlightStatuses(Array.isArray(flightStatusData) ? flightStatusData.filter((status) => status !== "Đã hạ cánh" && status !== "Đã xóa") : []);
  }, []);

  const loadNotifications = useCallback(async () => {
    const data = await layDanhSachThongBao(appliedNotificationFilters);
    setNotifications(Array.isArray(data) ? data : []);
  }, [appliedNotificationFilters]);

  const loadHistories = useCallback(async () => {
    const data = await layDanhSachLichSuCapNhat(appliedHistoryFilters);
    setHistories(Array.isArray(data) ? data : []);
  }, [appliedHistoryFilters]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadStats(), loadOptions(), loadNotifications(), loadHistories()]);
    } catch (err) {
      setError(err.message || "Không tải được dữ liệu thông báo và lịch sử.");
    } finally {
      setLoading(false);
    }
  }, [loadHistories, loadNotifications, loadOptions, loadStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const applyNotificationFilters = (event) => {
    event.preventDefault();
    setAppliedNotificationFilters(notificationFilters);
  };

  const resetNotificationFilters = () => {
    setNotificationFilters(EMPTY_NOTIFICATION_FILTERS);
    setAppliedNotificationFilters(EMPTY_NOTIFICATION_FILTERS);
  };

  const applyHistoryFilters = (event) => {
    event.preventDefault();
    if (historyFilters.fromDate && historyFilters.toDate && historyFilters.toDate < historyFilters.fromDate) {
      setError("Đến ngày không được nhỏ hơn từ ngày.");
      return;
    }
    setAppliedHistoryFilters(historyFilters);
  };

  const resetHistoryFilters = () => {
    setHistoryFilters(EMPTY_HISTORY_FILTERS);
    setAppliedHistoryFilters(EMPTY_HISTORY_FILTERS);
  };

  const openNotificationDetail = async (maThongBao) => {
    setModal("notification");
    setDetail(null);
    setModalLoading(true);
    setError("");
    try {
      setDetail(await layChiTietThongBao(maThongBao));
    } catch (err) {
      setModal(null);
      setError(err.message || "Không tải được chi tiết thông báo.");
    } finally {
      setModalLoading(false);
    }
  };

  const openHistoryDetail = async (maLichSuCapNhat) => {
    setModal("history");
    setDetail(null);
    setModalLoading(true);
    setError("");
    try {
      setDetail(await layChiTietLichSuCapNhat(maLichSuCapNhat));
    } catch (err) {
      setModal(null);
      setError(err.message || "Không tải được chi tiết lịch sử.");
    } finally {
      setModalLoading(false);
    }
  };

  const updateNotificationStatus = async (maThongBao, trangThaiGui) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await capNhatTrangThaiThongBao(maThongBao, trangThaiGui);
      await Promise.all([loadStats(), loadNotifications()]);
      setSuccess("Cập nhật trạng thái gửi thông báo thành công.");
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái gửi thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setDetail(null);
    }
  };

  return (
    <AdminLayout activePage="notifications" onNavigate={onNavigate}>
      <section className="notify-page">
        <header className="notify-header">
          <div>
            <h1>Thông báo & lịch sử</h1>
            <p>Theo dõi thông báo hệ thống và lịch sử cập nhật tình hình chuyến bay.</p>
          </div>
          <button className="notify-button notify-button--secondary" type="button" onClick={refreshAll} disabled={loading}>
            <i className="fa-solid fa-rotate-right" />
            Làm mới
          </button>
        </header>

        {error && <Alert type="error" text={error} />}
        {success && <Alert type="success" text={success} />}

        <section className="notify-stats" aria-label="Thống kê nhanh">
          {statCards.map((card) => (
            <article className="notify-stat" key={card.key}>
              <span className="notify-stat__icon">
                <i className={`fa-solid ${card.icon}`} />
              </span>
              <div>
                <p>{card.label}</p>
                <strong>{stats[card.key] ?? 0}</strong>
              </div>
            </article>
          ))}
        </section>

        <div className="notify-tabs" role="tablist">
          <button className={`notify-tab ${activeTab === "notifications" ? "is-active" : ""}`} type="button" onClick={() => setActiveTab("notifications")}>
            <i className="fa-solid fa-bell" />
            Thông báo
          </button>
          <button className={`notify-tab ${activeTab === "history" ? "is-active" : ""}`} type="button" onClick={() => setActiveTab("history")}>
            <i className="fa-solid fa-clock-rotate-left" />
            Lịch sử cập nhật
          </button>
        </div>

        {activeTab === "notifications" ? (
          <NotificationTab
            filters={notificationFilters}
            setFilters={setNotificationFilters}
            methods={methods}
            sendStatuses={sendStatuses}
            rows={notifications}
            loading={loading}
            saving={saving}
            onApply={applyNotificationFilters}
            onReset={resetNotificationFilters}
            onView={openNotificationDetail}
            onUpdateStatus={updateNotificationStatus}
          />
        ) : (
          <HistoryTab
            filters={historyFilters}
            setFilters={setHistoryFilters}
            statuses={flightStatuses}
            rows={histories}
            loading={loading}
            onApply={applyHistoryFilters}
            onReset={resetHistoryFilters}
            onView={openHistoryDetail}
          />
        )}

        {modal === "notification" && (
          <NotificationDetailModal detail={detail} loading={modalLoading} onClose={closeModal} />
        )}

        {modal === "history" && (
          <HistoryDetailModal detail={detail} loading={modalLoading} onClose={closeModal} />
        )}
      </section>
    </AdminLayout>
  );
}

function NotificationTab({ filters, setFilters, methods, sendStatuses, rows, loading, saving, onApply, onReset, onView, onUpdateStatus }) {
  return (
    <section className="notify-panel">
      <form className="notify-filters notify-filters--notifications" onSubmit={onApply}>
        <Field label="Tìm kiếm">
          <input value={filters.keyword} onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} placeholder="Số hiệu, nội dung, tài khoản" />
        </Field>
        <Field label="Phương thức gửi">
          <select value={filters.method} onChange={(event) => setFilters({ ...filters, method: event.target.value })}>
            <option value="">Tất cả</option>
            {methods.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </Field>
        <Field label="Trạng thái gửi">
          <select value={filters.sendStatus} onChange={(event) => setFilters({ ...filters, sendStatus: event.target.value })}>
            <option value="">Tất cả</option>
            {sendStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </Field>
        <Field label="Ngày gửi">
          <input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        </Field>
        <FilterActions onReset={onReset} />
      </form>

      <div className="notify-table-wrap">
        <table className="notify-table notify-table--notifications">
          <thead>
            <tr>
              <th>Mã thông báo</th>
              <th>Số hiệu chuyến bay</th>
              <th>Người nhận / tài khoản</th>
              <th>Nội dung thông báo</th>
              <th>Trạng thái mới</th>
              <th>Giờ ước tính mới</th>
              <th>Phương thức gửi</th>
              <th>Trạng thái gửi</th>
              <th>Thời gian gửi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10"><EmptyState icon="fa-spinner fa-spin" text="Đang tải dữ liệu..." /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="10"><EmptyState icon="fa-inbox" text="Không có dữ liệu phù hợp." /></td></tr>
            ) : rows.map((item) => (
              <tr key={item.maThongBao}>
                <td>{displayValue(item.maThongBao, "Không có")}</td>
                <td><strong>{displayValue(item.soHieuChuyenBay, "Không có")}</strong></td>
                <td>
                  <strong>{displayValue(item.tenDangNhap, "Chưa có")}</strong>
                  <small>{displayValue(item.maTaiKhoan, "Chưa có")}</small>
                </td>
                <td className="notify-table__content">{displayValue(item.noiDungThongBao, "Không có")}</td>
                <td><span className={flightStatusClass(item.trangThaiMoi)}>{displayValue(item.trangThaiMoi, "Không có")}</span></td>
                <td>{formatDateTime(item.gioUocTinhMoi, "Không áp dụng")}</td>
                <td><span className={methodClass(item.phuongThucGui)}>{displayValue(item.phuongThucGui, "Không có")}</span></td>
                <td><span className={sendStatusClass(item.trangThaiGui)}>{displayValue(item.trangThaiGui, "Chưa gửi")}</span></td>
                <td>{formatDateTime(item.thoiGianGui, "Chưa gửi")}</td>
                <td>
                  <div className="notify-actions">
                    <button title="Xem chi tiết" type="button" onClick={() => onView(item.maThongBao)}>
                      <i className="fa-solid fa-eye" />
                    </button>
                    {sendStatuses.map((status) => (
                      <button key={status} title={`Cập nhật ${status}`} type="button" disabled={saving || item.trangThaiGui === status} onClick={() => onUpdateStatus(item.maThongBao, status)}>
                        <i className={statusIcon(status)} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HistoryTab({ filters, setFilters, statuses, rows, loading, onApply, onReset, onView }) {
  return (
    <section className="notify-panel">
      <form className="notify-filters notify-filters--history" onSubmit={onApply}>
        <Field label="Tìm kiếm">
          <input value={filters.keyword} onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} placeholder="Số hiệu, người cập nhật, nội dung" />
        </Field>
        <Field label="Trạng thái mới">
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">Tất cả</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </Field>
        <Field label="Từ ngày">
          <input type="date" value={filters.fromDate} onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })} />
        </Field>
        <Field label="Đến ngày">
          <input type="date" value={filters.toDate} onChange={(event) => setFilters({ ...filters, toDate: event.target.value })} />
        </Field>
        <FilterActions onReset={onReset} />
      </form>

      <div className="notify-table-wrap">
        <table className="notify-table notify-table--history">
          <thead>
            <tr>
              <th>Mã lịch sử</th>
              <th>Số hiệu chuyến bay</th>
              <th>Người cập nhật</th>
              <th>Trạng thái cũ</th>
              <th>Trạng thái mới</th>
              <th>Giờ ước tính cũ</th>
              <th>Giờ ước tính mới</th>
              <th>Số phút chậm</th>
              <th>Lý do cập nhật</th>
              <th>Nội dung cập nhật</th>
              <th>Thời gian cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="12"><EmptyState icon="fa-spinner fa-spin" text="Đang tải dữ liệu..." /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="12"><EmptyState icon="fa-inbox" text="Không có dữ liệu phù hợp." /></td></tr>
            ) : rows.map((item) => (
              <tr key={item.maLichSuCapNhat}>
                <td>{displayValue(item.maLichSuCapNhat, "Không có")}</td>
                <td><strong>{displayValue(item.soHieuChuyenBay, "Không có")}</strong></td>
                <td>
                  <strong>{displayValue(item.tenDangNhap, "Không có")}</strong>
                  <small>{displayValue(item.maTaiKhoan, "Không có")}</small>
                </td>
                <td><span className={flightStatusClass(item.trangThaiCu)}>{displayValue(item.trangThaiCu, "Không có")}</span></td>
                <td><span className={flightStatusClass(item.trangThaiMoi)}>{displayValue(item.trangThaiMoi, "Không có")}</span></td>
                <td>{formatDateTime(item.gioUocTinhCu, "Không có")}</td>
                <td>{formatDateTime(item.gioUocTinhMoi, "Không có")}</td>
                <td>{item.soPhutChamMoi ?? 0}</td>
                <td className="notify-table__content">{displayValue(item.lyDoCapNhat, "Không có")}</td>
                <td className="notify-table__content">{displayValue(item.noiDungCapNhat, "Không có")}</td>
                <td>{formatDateTime(item.thoiGianCapNhat, "Không có")}</td>
                <td>
                  <div className="notify-actions">
                    <button title="Xem chi tiết" type="button" onClick={() => onView(item.maLichSuCapNhat)}>
                      <i className="fa-solid fa-eye" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NotificationDetailModal({ detail, loading, onClose }) {
  return (
    <Modal title="Chi tiết thông báo" icon="fa-bell" onClose={onClose}>
      {loading ? <EmptyState icon="fa-spinner fa-spin" text="Đang tải chi tiết..." /> : (
        <div className="notify-detail-grid">
          <DetailItem label="Mã thông báo" value={detail?.maThongBao} />
          <DetailItem label="Mã lịch trình" value={detail?.maLichTrinh} />
          <DetailItem label="Số hiệu chuyến bay" value={detail?.soHieuChuyenBay} />
          <DetailItem label="Người nhận" value={formatAccount(detail)} emptyText="Chưa có" />
          <DetailItem label="Cổng" value={detail?.tenCong || detail?.maCong} emptyText="Chưa có" />
          <DetailItem label="Băng chuyền" value={detail?.tenBangChuyenHanhLy || detail?.maBangChuyenHanhLy} emptyText="Chưa có" />
          <DetailItem label="Trạng thái mới" value={detail?.trangThaiMoi} emptyText="Không có" />
          <DetailItem label="Giờ ước tính mới" value={formatDateTime(detail?.gioUocTinhMoi, "Không áp dụng")} />
          <DetailItem label="Phương thức gửi" value={detail?.phuongThucGui} emptyText="Không có" />
          <DetailItem label="Trạng thái gửi" value={detail?.trangThaiGui} emptyText="Chưa gửi" />
          <DetailItem label="Thời gian gửi" value={formatDateTime(detail?.thoiGianGui, "Chưa gửi")} />
          <DetailItem label="Nội dung thông báo" value={detail?.noiDungThongBao} wide emptyText="Không có" />
        </div>
      )}
    </Modal>
  );
}

function HistoryDetailModal({ detail, loading, onClose }) {
  return (
    <Modal title="Chi tiết lịch sử" icon="fa-clock-rotate-left" onClose={onClose}>
      {loading ? <EmptyState icon="fa-spinner fa-spin" text="Đang tải chi tiết..." /> : (
        <div className="notify-detail-grid">
          <DetailItem label="Mã lịch sử cập nhật" value={detail?.maLichSuCapNhat} emptyText="Không có" />
          <DetailItem label="Mã lịch trình" value={detail?.maLichTrinh} emptyText="Không có" />
          <DetailItem label="Số hiệu chuyến bay" value={detail?.soHieuChuyenBay} emptyText="Không có" />
          <DetailItem label="Người cập nhật" value={formatAccount(detail)} emptyText="Không có" />
          <DetailItem label="Trạng thái cũ" value={detail?.trangThaiCu} emptyText="Không có" />
          <DetailItem label="Trạng thái mới" value={detail?.trangThaiMoi} emptyText="Không có" />
          <DetailItem label="Giờ ước tính cũ" value={formatDateTime(detail?.gioUocTinhCu, "Không có")} />
          <DetailItem label="Giờ ước tính mới" value={formatDateTime(detail?.gioUocTinhMoi, "Không có")} />
          <DetailItem label="Số phút chậm mới" value={detail?.soPhutChamMoi ?? 0} />
          <DetailItem label="Thời gian cập nhật" value={formatDateTime(detail?.thoiGianCapNhat, "Không có")} />
          <DetailItem label="Lý do cập nhật" value={detail?.lyDoCapNhat} wide emptyText="Không có" />
          <DetailItem label="Nội dung cập nhật" value={detail?.noiDungCapNhat} wide emptyText="Không có" />
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
}

function FilterActions({ onReset }) {
  return (
    <div className="notify-filter-actions">
      <button className="notify-button notify-button--primary" type="submit">
        <i className="fa-solid fa-filter" />
        Lọc
      </button>
      <button className="notify-button notify-button--ghost" type="button" onClick={onReset}>
        <i className="fa-solid fa-filter-circle-xmark" />
        Xóa bộ lọc
      </button>
    </div>
  );
}

function Alert({ type, text }) {
  return (
    <div className={`notify-alert notify-alert--${type}`}>
      <i className={type === "error" ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-check"} />
      <span>{text}</span>
    </div>
  );
}

function Modal({ title, icon, children, onClose }) {
  return (
    <div className="notify-modal-backdrop" role="presentation">
      <section className="notify-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="notify-modal__header">
          <h2><i className={`fa-solid ${icon}`} /> {title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <i className="fa-solid fa-xmark" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function DetailItem({ label, value, wide = false, emptyText = "Chưa cập nhật" }) {
  return (
    <div className={`notify-detail-item ${wide ? "notify-detail-item--wide" : ""}`}>
      <span>{label}</span>
      <strong>{displayValue(value, emptyText)}</strong>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="notify-empty">
      <i className={`fa-solid ${icon}`} />
      <span>{text}</span>
    </div>
  );
}

function displayValue(value, fallback = "Chưa cập nhật") {
  return value === null || value === undefined || value === "" ? fallback : value;
}

function formatDateTime(value, fallback = "Chưa cập nhật") {
  if (!value) return fallback;
  const [datePart, timePart = ""] = String(value).split("T");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}${timePart ? ` ${timePart.slice(0, 5)}` : ""}`;
}

function formatAccount(item) {
  if (!item?.tenDangNhap && !item?.maTaiKhoan) return "";
  return `${displayValue(item.tenDangNhap, "Chưa có")} (${displayValue(item.maTaiKhoan, "Chưa có")})`;
}

function sendStatusClass(status) {
  const map = {
    "Chờ gửi": "notify-badge notify-badge--waiting",
    "Đã gửi": "notify-badge notify-badge--sent",
    "Lỗi gửi": "notify-badge notify-badge--failed",
  };
  return map[status] || "notify-badge notify-badge--neutral";
}

function methodClass(method) {
  const map = {
    Email: "notify-badge notify-badge--email",
    SMS: "notify-badge notify-badge--sms",
    "Ứng dụng": "notify-badge notify-badge--app",
    "Hệ thống": "notify-badge notify-badge--system",
  };
  return map[method] || "notify-badge notify-badge--neutral";
}

function flightStatusClass(status) {
  const map = {
    "Đã lên lịch": "notify-badge notify-badge--scheduled",
    "Đang làm thủ tục": "notify-badge notify-badge--active",
    "Đang bay": "notify-badge notify-badge--flying",
    "Chậm chuyến": "notify-badge notify-badge--delayed",
    "Hủy chuyến": "notify-badge notify-badge--cancelled",
    "Hoàn thành": "notify-badge notify-badge--completed",
  };
  return map[status] || "notify-badge notify-badge--neutral";
}

function statusIcon(status) {
  const map = {
    "Chờ gửi": "fa-solid fa-hourglass-half",
    "Đã gửi": "fa-solid fa-circle-check",
    "Lỗi gửi": "fa-solid fa-triangle-exclamation",
  };
  return map[status] || "fa-solid fa-pen";
}

export default NotificationHistoryPage;
