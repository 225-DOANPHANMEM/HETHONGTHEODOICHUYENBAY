import { useCallback, useEffect, useMemo, useState } from "react";
import {
  capNhatTrangThaiThongBao,
  layBangChuyenThongBaoOptions,
  layChiTietLichSuCapNhat,
  layChiTietThongBao,
  layCongThongBaoOptions,
  layDanhSachLichSuCapNhat,
  layDanhSachThongBao,
  layLichTrinhThongBaoOptions,
  layPhuongThucThongBao,
  layTaiKhoanThongBaoOptions,
  layThongKeThongBaoLichSu,
  layTrangThaiChuyenBayThongBao,
  layTrangThaiGuiThongBao,
  taoThongBaoThuCong,
} from "../../api/thongBaoLichSuApi.js";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/NotificationHistoryPage.css";

const emptyNotificationFilters = {
  keyword: "",
  trangThaiGui: "",
  phuongThucGui: "",
  trangThaiMoi: "",
  tuNgay: "",
  denNgay: "",
};

const emptyLogFilters = {
  keyword: "",
  maTaiKhoan: "",
  trangThaiMoi: "",
  tuNgay: "",
  denNgay: "",
};

const emptyCreateForm = {
  maLichTrinh: "",
  maTaiKhoan: "",
  maCong: "",
  maBangChuyenHanhLy: "",
  noiDungThongBao: "",
  trangThaiMoi: "",
  gioUocTinhMoi: "",
  phuongThucGui: "",
  trangThaiGui: "",
};

const initialStats = {
  tongThongBao: 0,
  soChoGui: 0,
  soDaGui: 0,
  soLoiGui: 0,
  tongLichSuCapNhat: 0,
  soCapNhatHomNay: 0,
  soChuyenBayCham: 0,
  soChuyenBayHuy: 0,
};

function displayValue(value, fallback = "Chưa cập nhật") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
}

function compactText(value, fallback = "Không có") {
  return displayValue(value, fallback);
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";
  const [datePart, timePart = ""] = String(value).split("T");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}${timePart ? ` ${timePart.slice(0, 5)}` : ""}`;
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}`;
}

function emptyToNull(value) {
  return value && value.trim() ? value.trim() : null;
}

function statusClass(status) {
  const map = {
    "Đã gửi": "notify-badge notify-badge--sent",
    "Chờ gửi": "notify-badge notify-badge--waiting",
    "Lỗi gửi": "notify-badge notify-badge--failed",
    "Chậm chuyến": "notify-badge notify-badge--delayed",
    "Hủy chuyến": "notify-badge notify-badge--cancelled",
    "Hoàn thành": "notify-badge notify-badge--completed",
    "Đã hạ cánh": "notify-badge notify-badge--completed",
    "Đang bay": "notify-badge notify-badge--active",
    "Đang làm thủ tục": "notify-badge notify-badge--active",
    "Đã xóa": "notify-badge notify-badge--muted",
  };
  return map[status] || "notify-badge notify-badge--neutral";
}

function NotificationHistoryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [stats, setStats] = useState(initialStats);
  const [notifications, setNotifications] = useState([]);
  const [updateLogs, setUpdateLogs] = useState([]);
  const [methods, setMethods] = useState([]);
  const [sendStatuses, setSendStatuses] = useState([]);
  const [flightStatuses, setFlightStatuses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [gates, setGates] = useState([]);
  const [baggageCarousels, setBaggageCarousels] = useState([]);

  const [notificationFilters, setNotificationFilters] = useState(emptyNotificationFilters);
  const [appliedNotificationFilters, setAppliedNotificationFilters] = useState(emptyNotificationFilters);
  const [logFilters, setLogFilters] = useState(emptyLogFilters);
  const [appliedLogFilters, setAppliedLogFilters] = useState(emptyLogFilters);

  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [modal, setModal] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStats = useCallback(async () => {
    const data = await layThongKeThongBaoLichSu();
    setStats({ ...initialStats, ...(data || {}) });
  }, []);

  const loadNotifications = useCallback(async (filters = appliedNotificationFilters) => {
    const data = await layDanhSachThongBao(filters);
    setNotifications(Array.isArray(data) ? data : []);
  }, [appliedNotificationFilters]);

  const loadLogs = useCallback(async (filters = appliedLogFilters) => {
    const data = await layDanhSachLichSuCapNhat(filters);
    setUpdateLogs(Array.isArray(data) ? data : []);
  }, [appliedLogFilters]);

  const loadOptions = useCallback(async () => {
    const [
      methodData,
      statusData,
      flightStatusData,
      accountData,
      scheduleData,
      gateData,
      baggageData,
    ] = await Promise.all([
      layPhuongThucThongBao(),
      layTrangThaiGuiThongBao(),
      layTrangThaiChuyenBayThongBao(),
      layTaiKhoanThongBaoOptions(),
      layLichTrinhThongBaoOptions(),
      layCongThongBaoOptions(),
      layBangChuyenThongBaoOptions(),
    ]);

    setMethods(Array.isArray(methodData) ? methodData : []);
    setSendStatuses(Array.isArray(statusData) ? statusData : []);
    setFlightStatuses(Array.isArray(flightStatusData) ? flightStatusData : []);
    setAccounts(Array.isArray(accountData) ? accountData : []);
    setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
    setGates(Array.isArray(gateData) ? gateData : []);
    setBaggageCarousels(Array.isArray(baggageData) ? baggageData : []);

    setCreateForm((current) => ({
      ...current,
      phuongThucGui: current.phuongThucGui || methodData?.[0] || "",
      trangThaiGui: current.trangThaiGui || statusData?.[0] || "",
      trangThaiMoi: current.trangThaiMoi || flightStatusData?.[0] || "",
      maLichTrinh: current.maLichTrinh || scheduleData?.[0]?.value || "",
      maTaiKhoan: current.maTaiKhoan || accountData?.[0]?.value || "",
    }));
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        loadStats(),
        loadOptions(),
        loadNotifications(appliedNotificationFilters),
        loadLogs(appliedLogFilters),
      ]);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu thông báo và lịch sử.");
    } finally {
      setLoading(false);
    }
  }, [appliedLogFilters, appliedNotificationFilters, loadLogs, loadNotifications, loadOptions, loadStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const statCards = useMemo(() => [
    { label: "Tổng thông báo", value: stats.tongThongBao, icon: "fa-bell" },
    { label: "Chờ gửi", value: stats.soChoGui, icon: "fa-hourglass-half" },
    { label: "Đã gửi", value: stats.soDaGui, icon: "fa-circle-check" },
    { label: "Lỗi gửi", value: stats.soLoiGui, icon: "fa-triangle-exclamation" },
    { label: "Tổng lịch sử cập nhật", value: stats.tongLichSuCapNhat, icon: "fa-clock-rotate-left" },
    { label: "Cập nhật hôm nay", value: stats.soCapNhatHomNay, icon: "fa-clipboard-list" },
    { label: "Chuyến bay chậm", value: stats.soChuyenBayCham, icon: "fa-plane-circle-exclamation" },
    { label: "Chuyến bay hủy", value: stats.soChuyenBayHuy, icon: "fa-ban" },
  ], [stats]);

  async function handleRefresh() {
    setSuccess("");
    await refreshAll();
  }

  function applyNotificationFilters(event) {
    event.preventDefault();
    setAppliedNotificationFilters({ ...notificationFilters });
  }

  function resetNotificationFilters() {
    setNotificationFilters(emptyNotificationFilters);
    setAppliedNotificationFilters(emptyNotificationFilters);
  }

  function applyLogFilters(event) {
    event.preventDefault();
    setAppliedLogFilters({ ...logFilters });
  }

  function resetLogFilters() {
    setLogFilters(emptyLogFilters);
    setAppliedLogFilters(emptyLogFilters);
  }

  async function openNotificationDetail(maThongBao) {
    setModal("notificationDetail");
    setSelectedDetail(null);
    setModalLoading(true);
    setError("");
    try {
      const detail = await layChiTietThongBao(maThongBao);
      setSelectedDetail(detail);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết thông báo.");
      setModal(null);
    } finally {
      setModalLoading(false);
    }
  }

  async function openLogDetail(maLichSuCapNhat) {
    setModal("logDetail");
    setSelectedDetail(null);
    setModalLoading(true);
    setError("");
    try {
      const detail = await layChiTietLichSuCapNhat(maLichSuCapNhat);
      setSelectedDetail(detail);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết lịch sử cập nhật.");
      setModal(null);
    } finally {
      setModalLoading(false);
    }
  }

  async function updateNotificationStatus(maThongBao, trangThaiGui) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await capNhatTrangThaiThongBao(maThongBao, trangThaiGui);
      await Promise.all([loadStats(), loadNotifications(appliedNotificationFilters)]);
      setSuccess("Đã cập nhật trạng thái gửi thông báo.");
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái gửi.");
    } finally {
      setSaving(false);
    }
  }

  async function submitCreateNotification(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...createForm,
      maCong: emptyToNull(createForm.maCong),
      maBangChuyenHanhLy: emptyToNull(createForm.maBangChuyenHanhLy),
      gioUocTinhMoi: emptyToNull(createForm.gioUocTinhMoi),
    };

    try {
      await taoThongBaoThuCong(payload);
      setModal(null);
      setCreateForm((current) => ({
        ...emptyCreateForm,
        phuongThucGui: methods[0] || current.phuongThucGui,
        trangThaiGui: sendStatuses[0] || current.trangThaiGui,
        trangThaiMoi: flightStatuses[0] || current.trangThaiMoi,
        maLichTrinh: schedules[0]?.value || current.maLichTrinh,
        maTaiKhoan: accounts[0]?.value || current.maTaiKhoan,
      }));
      await Promise.all([loadStats(), loadNotifications(appliedNotificationFilters)]);
      setSuccess("Đã tạo thông báo thủ công.");
    } catch (err) {
      setError(err.message || "Không thể tạo thông báo.");
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    if (saving) return;
    setModal(null);
    setSelectedDetail(null);
  }

  return (
    <AdminLayout activePage="notifications" onNavigate={onNavigate}>
      <div className="notify-page">
        <header className="notify-header">
          <div>
            <h1>Thông báo & Lịch sử cập nhật</h1>
            <p>Theo dõi thông báo hệ thống và lịch sử cập nhật tình hình chuyến bay.</p>
          </div>
          <div className="notify-header__actions">
            <button className="notify-button notify-button--primary" type="button" onClick={() => setModal("create")}>
              <i className="fa-solid fa-plus" />
              Tạo thông báo
            </button>
            <button className="notify-button notify-button--secondary" type="button" onClick={handleRefresh} disabled={loading}>
              <i className="fa-solid fa-rotate-right" />
              Làm mới
            </button>
          </div>
        </header>

        {error && (
          <div className="notify-alert notify-alert--error">
            <i className="fa-solid fa-triangle-exclamation" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="notify-alert notify-alert--success">
            <i className="fa-solid fa-circle-check" />
            <span>{success}</span>
          </div>
        )}

        <section className="notify-stats" aria-label="Thống kê thông báo và lịch sử">
          {statCards.map((card) => (
            <article className="notify-stat" key={card.label}>
              <span className="notify-stat__icon">
                <i className={`fa-solid ${card.icon}`} />
              </span>
              <div>
                <p>{card.label}</p>
                <strong>{card.value ?? 0}</strong>
              </div>
            </article>
          ))}
        </section>

        <div className="notify-tabs" role="tablist">
          <button
            className={`notify-tab ${activeTab === "notifications" ? "is-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("notifications")}
          >
            <i className="fa-solid fa-bell" />
            Thông báo
          </button>
          <button
            className={`notify-tab ${activeTab === "history" ? "is-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("history")}
          >
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
            flightStatuses={flightStatuses}
            notifications={notifications}
            loading={loading}
            saving={saving}
            onApply={applyNotificationFilters}
            onReset={resetNotificationFilters}
            onView={openNotificationDetail}
            onUpdateStatus={updateNotificationStatus}
          />
        ) : (
          <HistoryTab
            filters={logFilters}
            setFilters={setLogFilters}
            accounts={accounts}
            flightStatuses={flightStatuses}
            updateLogs={updateLogs}
            loading={loading}
            onApply={applyLogFilters}
            onReset={resetLogFilters}
            onView={openLogDetail}
          />
        )}

        {modal === "create" && (
          <CreateNotificationModal
            form={createForm}
            setForm={setCreateForm}
            schedules={schedules}
            accounts={accounts}
            methods={methods}
            sendStatuses={sendStatuses}
            flightStatuses={flightStatuses}
            gates={gates}
            baggageCarousels={baggageCarousels}
            saving={saving}
            onSubmit={submitCreateNotification}
            onClose={closeModal}
          />
        )}

        {modal === "notificationDetail" && (
          <NotificationDetailModal detail={selectedDetail} loading={modalLoading} onClose={closeModal} />
        )}

        {modal === "logDetail" && (
          <LogDetailModal detail={selectedDetail} loading={modalLoading} onClose={closeModal} />
        )}
      </div>
    </AdminLayout>
  );
}

function NotificationTab({
  filters,
  setFilters,
  methods,
  sendStatuses,
  flightStatuses,
  notifications,
  loading,
  saving,
  onApply,
  onReset,
  onView,
  onUpdateStatus,
}) {
  return (
    <section className="notify-panel">
      <form className="notify-filters notify-filters--notifications" onSubmit={onApply}>
        <label>
          <span>Tìm kiếm</span>
          <input
            value={filters.keyword}
            onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
            placeholder="Chuyến bay, hãng bay, tài khoản, nội dung"
          />
        </label>
        <label>
          <span>Trạng thái gửi</span>
          <select value={filters.trangThaiGui} onChange={(event) => setFilters({ ...filters, trangThaiGui: event.target.value })}>
            <option value="">Tất cả trạng thái</option>
            {sendStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Phương thức gửi</span>
          <select value={filters.phuongThucGui} onChange={(event) => setFilters({ ...filters, phuongThucGui: event.target.value })}>
            <option value="">Tất cả phương thức</option>
            {methods.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </label>
        <label>
          <span>Trạng thái chuyến bay</span>
          <select value={filters.trangThaiMoi} onChange={(event) => setFilters({ ...filters, trangThaiMoi: event.target.value })}>
            <option value="">Tất cả trạng thái</option>
            {flightStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Từ ngày</span>
          <input type="date" value={filters.tuNgay} onChange={(event) => setFilters({ ...filters, tuNgay: event.target.value })} />
        </label>
        <label>
          <span>Đến ngày</span>
          <input type="date" value={filters.denNgay} onChange={(event) => setFilters({ ...filters, denNgay: event.target.value })} />
        </label>
        <div className="notify-filter-actions">
          <button className="notify-button notify-button--primary" type="submit">
            <i className="fa-solid fa-filter" />
            Lọc
          </button>
          <button className="notify-button notify-button--ghost" type="button" onClick={onReset}>
            <i className="fa-solid fa-rotate-right" />
            Làm mới
          </button>
        </div>
      </form>

      <div className="notify-table-wrap">
        <table className="notify-table">
          <thead>
            <tr>
              <th>Mã thông báo</th>
              <th>Số hiệu chuyến bay</th>
              <th>Người nhận/Tài khoản</th>
              <th>Nội dung</th>
              <th>Trạng thái mới</th>
              <th>Phương thức gửi</th>
              <th>Trạng thái gửi</th>
              <th>Thời gian gửi</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9"><EmptyState icon="fa-spinner fa-spin" text="Đang tải dữ liệu..." /></td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan="9"><EmptyState icon="fa-inbox" text="Không có thông báo phù hợp." /></td></tr>
            ) : notifications.map((item) => (
              <tr key={item.maThongBao}>
                <td>{displayValue(item.maThongBao)}</td>
                <td>
                  <strong>{displayValue(item.soHieuChuyenBay)}</strong>
                  <small>{compactText(item.tenHangHangKhong)}</small>
                </td>
                <td>
                  <strong>{displayValue(item.tenDangNhap)}</strong>
                  <small>{displayValue(item.maTaiKhoan)}</small>
                </td>
                <td className="notify-table__content">{compactText(item.noiDungThongBao)}</td>
                <td><span className={statusClass(item.trangThaiMoi)}>{displayValue(item.trangThaiMoi)}</span></td>
                <td>{displayValue(item.phuongThucGui)}</td>
                <td><span className={statusClass(item.trangThaiGui)}>{displayValue(item.trangThaiGui)}</span></td>
                <td>{formatDateTime(item.thoiGianGui)}</td>
                <td>
                  <div className="notify-actions">
                    <button title="Xem chi tiết" type="button" onClick={() => onView(item.maThongBao)}>
                      <i className="fa-solid fa-eye" />
                    </button>
                    <button title="Đánh dấu đã gửi" type="button" disabled={saving} onClick={() => onUpdateStatus(item.maThongBao, "Đã gửi")}>
                      <i className="fa-solid fa-circle-check" />
                    </button>
                    <button title="Đánh dấu lỗi gửi" type="button" disabled={saving} onClick={() => onUpdateStatus(item.maThongBao, "Lỗi gửi")}>
                      <i className="fa-solid fa-triangle-exclamation" />
                    </button>
                    <button title="Chuyển về chờ gửi" type="button" disabled={saving} onClick={() => onUpdateStatus(item.maThongBao, "Chờ gửi")}>
                      <i className="fa-solid fa-hourglass-half" />
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

function HistoryTab({ filters, setFilters, accounts, flightStatuses, updateLogs, loading, onApply, onReset, onView }) {
  return (
    <section className="notify-panel">
      <form className="notify-filters notify-filters--history" onSubmit={onApply}>
        <label>
          <span>Tìm kiếm</span>
          <input
            value={filters.keyword}
            onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
            placeholder="Chuyến bay, hãng bay, tài khoản, lý do"
          />
        </label>
        <label>
          <span>Tài khoản cập nhật</span>
          <select value={filters.maTaiKhoan} onChange={(event) => setFilters({ ...filters, maTaiKhoan: event.target.value })}>
            <option value="">Tất cả tài khoản</option>
            {accounts.map((account) => (
              <option key={account.value} value={account.value}>
                {account.label} ({account.value})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Trạng thái mới</span>
          <select value={filters.trangThaiMoi} onChange={(event) => setFilters({ ...filters, trangThaiMoi: event.target.value })}>
            <option value="">Tất cả trạng thái</option>
            {flightStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Từ ngày</span>
          <input type="date" value={filters.tuNgay} onChange={(event) => setFilters({ ...filters, tuNgay: event.target.value })} />
        </label>
        <label>
          <span>Đến ngày</span>
          <input type="date" value={filters.denNgay} onChange={(event) => setFilters({ ...filters, denNgay: event.target.value })} />
        </label>
        <div className="notify-filter-actions">
          <button className="notify-button notify-button--primary" type="submit">
            <i className="fa-solid fa-filter" />
            Lọc
          </button>
          <button className="notify-button notify-button--ghost" type="button" onClick={onReset}>
            <i className="fa-solid fa-rotate-right" />
            Làm mới
          </button>
        </div>
      </form>

      <div className="notify-table-wrap">
        <table className="notify-table">
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
              <th>Lý do</th>
              <th>Thời gian cập nhật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="11"><EmptyState icon="fa-spinner fa-spin" text="Đang tải dữ liệu..." /></td></tr>
            ) : updateLogs.length === 0 ? (
              <tr><td colSpan="11"><EmptyState icon="fa-inbox" text="Không có lịch sử cập nhật phù hợp." /></td></tr>
            ) : updateLogs.map((item) => (
              <tr key={item.maLichSuCapNhat}>
                <td>{displayValue(item.maLichSuCapNhat)}</td>
                <td>
                  <strong>{displayValue(item.soHieuChuyenBay)}</strong>
                  <small>{compactText(item.tenHangHangKhong)}</small>
                </td>
                <td>
                  <strong>{displayValue(item.tenDangNhap)}</strong>
                  <small>{displayValue(item.maTaiKhoan)}</small>
                </td>
                <td><span className={statusClass(item.trangThaiCu)}>{displayValue(item.trangThaiCu)}</span></td>
                <td><span className={statusClass(item.trangThaiMoi)}>{displayValue(item.trangThaiMoi)}</span></td>
                <td>{formatDateTime(item.gioUocTinhCu)}</td>
                <td>{formatDateTime(item.gioUocTinhMoi)}</td>
                <td>{item.soPhutChamMoi ?? 0}</td>
                <td className="notify-table__content">{compactText(item.lyDoCapNhat)}</td>
                <td>{formatDateTime(item.thoiGianCapNhat)}</td>
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

function CreateNotificationModal({
  form,
  setForm,
  schedules,
  accounts,
  methods,
  sendStatuses,
  flightStatuses,
  gates,
  baggageCarousels,
  saving,
  onSubmit,
  onClose,
}) {
  return (
    <Modal title="Tạo thông báo" icon="fa-plus" onClose={onClose}>
      <form className="notify-modal-form" onSubmit={onSubmit}>
        <label>
          <span>Lịch trình chuyến bay</span>
          <select required value={form.maLichTrinh} onChange={(event) => setForm({ ...form, maLichTrinh: event.target.value })}>
            <option value="">Chọn lịch trình</option>
            {schedules.map((schedule) => (
              <option key={schedule.value} value={schedule.value}>
                {schedule.value} - {schedule.label} - {displayValue(schedule.description)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tài khoản nhận</span>
          <select required value={form.maTaiKhoan} onChange={(event) => setForm({ ...form, maTaiKhoan: event.target.value })}>
            <option value="">Chọn tài khoản</option>
            {accounts.map((account) => (
              <option key={account.value} value={account.value}>
                {account.label} ({account.value}) - {displayValue(account.description)}
              </option>
            ))}
          </select>
        </label>
        <label className="notify-form-wide">
          <span>Nội dung thông báo</span>
          <textarea
            required
            maxLength={500}
            value={form.noiDungThongBao}
            onChange={(event) => setForm({ ...form, noiDungThongBao: event.target.value })}
            placeholder="Nhập nội dung thông báo"
          />
        </label>
        <label>
          <span>Trạng thái mới</span>
          <select required value={form.trangThaiMoi} onChange={(event) => setForm({ ...form, trangThaiMoi: event.target.value })}>
            <option value="">Chọn trạng thái</option>
            {flightStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Giờ ước tính mới</span>
          <input type="datetime-local" value={form.gioUocTinhMoi} onChange={(event) => setForm({ ...form, gioUocTinhMoi: event.target.value })} />
        </label>
        <label>
          <span>Phương thức gửi</span>
          <select required value={form.phuongThucGui} onChange={(event) => setForm({ ...form, phuongThucGui: event.target.value })}>
            <option value="">Chọn phương thức</option>
            {methods.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </label>
        <label>
          <span>Trạng thái gửi</span>
          <select required value={form.trangThaiGui} onChange={(event) => setForm({ ...form, trangThaiGui: event.target.value })}>
            <option value="">Chọn trạng thái gửi</option>
            {sendStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Cổng</span>
          <select value={form.maCong} onChange={(event) => setForm({ ...form, maCong: event.target.value })}>
            <option value="">Không chọn</option>
            {gates.map((gate) => (
              <option key={gate.value} value={gate.value}>
                {gate.value} - {gate.label} - {displayValue(gate.status)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Băng chuyền</span>
          <select value={form.maBangChuyenHanhLy} onChange={(event) => setForm({ ...form, maBangChuyenHanhLy: event.target.value })}>
            <option value="">Không chọn</option>
            {baggageCarousels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} - {item.label} - {displayValue(item.status)}
              </option>
            ))}
          </select>
        </label>
        <div className="notify-modal-actions">
          <button className="notify-button notify-button--ghost" type="button" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="notify-button notify-button--primary" type="submit" disabled={saving}>
            <i className={`fa-solid ${saving ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
            Tạo thông báo
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NotificationDetailModal({ detail, loading, onClose }) {
  return (
    <Modal title="Chi tiết thông báo" icon="fa-bell" onClose={onClose}>
      {loading ? <EmptyState icon="fa-spinner fa-spin" text="Đang tải chi tiết..." /> : (
        <div className="notify-detail-grid">
          <DetailItem label="Mã thông báo" value={detail?.maThongBao} />
          <DetailItem label="Lịch trình" value={detail?.maLichTrinh} />
          <DetailItem label="Chuyến bay" value={detail?.soHieuChuyenBay} />
          <DetailItem label="Hãng bay" value={detail?.tenHangHangKhong} />
          <DetailItem label="Loại chuyến bay" value={detail?.loaiChuyenBay} />
          <DetailItem label="Hành trình" value={`${displayValue(detail?.diemDi)} - ${displayValue(detail?.diemDen)}`} />
          <DetailItem label="Ngày bay" value={formatDate(detail?.ngayBay)} />
          <DetailItem label="Người nhận" value={`${displayValue(detail?.tenDangNhap)} (${displayValue(detail?.maTaiKhoan)})`} />
          <DetailItem label="Cổng" value={detail?.tenCong || detail?.maCong} emptyText="Chưa phân công" />
          <DetailItem label="Băng chuyền" value={detail?.tenBangChuyenHanhLy || detail?.maBangChuyenHanhLy} emptyText="Chưa phân công" />
          <DetailItem label="Trạng thái mới" value={detail?.trangThaiMoi} />
          <DetailItem label="Giờ ước tính mới" value={formatDateTime(detail?.gioUocTinhMoi)} />
          <DetailItem label="Phương thức gửi" value={detail?.phuongThucGui} />
          <DetailItem label="Trạng thái gửi" value={detail?.trangThaiGui} />
          <DetailItem label="Thời gian gửi" value={formatDateTime(detail?.thoiGianGui)} />
          <DetailItem label="Nội dung" value={detail?.noiDungThongBao} wide emptyText="Không có" />
        </div>
      )}
    </Modal>
  );
}

function LogDetailModal({ detail, loading, onClose }) {
  return (
    <Modal title="Chi tiết lịch sử cập nhật" icon="fa-clock-rotate-left" onClose={onClose}>
      {loading ? <EmptyState icon="fa-spinner fa-spin" text="Đang tải chi tiết..." /> : (
        <div className="notify-detail-grid">
          <DetailItem label="Mã lịch sử" value={detail?.maLichSuCapNhat} />
          <DetailItem label="Lịch trình" value={detail?.maLichTrinh} />
          <DetailItem label="Chuyến bay" value={detail?.soHieuChuyenBay} />
          <DetailItem label="Hãng bay" value={detail?.tenHangHangKhong} />
          <DetailItem label="Loại chuyến bay" value={detail?.loaiChuyenBay} />
          <DetailItem label="Hành trình" value={`${displayValue(detail?.diemDi)} - ${displayValue(detail?.diemDen)}`} />
          <DetailItem label="Ngày bay" value={formatDate(detail?.ngayBay)} />
          <DetailItem label="Người cập nhật" value={`${displayValue(detail?.tenDangNhap)} (${displayValue(detail?.maTaiKhoan)})`} />
          <DetailItem label="Trạng thái cũ" value={detail?.trangThaiCu} />
          <DetailItem label="Trạng thái mới" value={detail?.trangThaiMoi} />
          <DetailItem label="Giờ ước tính cũ" value={formatDateTime(detail?.gioUocTinhCu)} />
          <DetailItem label="Giờ ước tính mới" value={formatDateTime(detail?.gioUocTinhMoi)} />
          <DetailItem label="Số phút chậm" value={detail?.soPhutChamMoi ?? 0} />
          <DetailItem label="Thời gian cập nhật" value={formatDateTime(detail?.thoiGianCapNhat)} />
          <DetailItem label="Lý do cập nhật" value={detail?.lyDoCapNhat} wide emptyText="Không có" />
          <DetailItem label="Nội dung cập nhật" value={detail?.noiDungCapNhat} wide emptyText="Không có" />
        </div>
      )}
    </Modal>
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

export default NotificationHistoryPage;
