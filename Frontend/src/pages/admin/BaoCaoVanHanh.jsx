import { useCallback, useEffect, useMemo, useState } from "react";
import {
  layBaoCaoLichSuCapNhat,
  layBaoCaoTaiNguyen,
  layBaoCaoTheoHangBay,
  layBaoCaoTheoNgay,
  layBaoCaoTheoTrangThai,
  layBaoCaoThongBao,
  layBaoCaoTongQuan,
  taoBaoCaoExportUrl,
} from "../../api/baoCaoApi.js";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/baoCaoVanHanh.css";

const emptyFilters = {
  tuNgay: "",
  denNgay: "",
};

const emptyOverview = {
  tongChuyenBay: 0,
  tongLichTrinh: 0,
  soChuyenBayDen: 0,
  soChuyenBayDi: 0,
  soDaLenLich: 0,
  soDangLamThuTuc: 0,
  soDangBay: 0,
  soDaHaCanh: 0,
  soHoanThanh: 0,
  soChamChuyen: 0,
  soHuyChuyen: 0,
  soDaXoa: 0,
  tongSoPhutCham: 0,
  soPhutChamTrungBinh: 0,
  tongThongBao: 0,
  tongLichSuCapNhat: 0,
  tongCongDangDung: 0,
  tongBangChuyenDangDung: 0,
};

const tabs = [
  { key: "overview", label: "Tổng quan", icon: "fa-gauge-high" },
  { key: "by-date", label: "Theo ngày", icon: "fa-calendar-days" },
  { key: "by-status", label: "Theo trạng thái", icon: "fa-list-check" },
  { key: "by-airline", label: "Theo hãng bay", icon: "fa-plane" },
  { key: "resources", label: "Tài nguyên vận hành", icon: "fa-door-open" },
  { key: "notifications", label: "Thông báo", icon: "fa-bell" },
  { key: "update-logs", label: "Lịch sử cập nhật", icon: "fa-clock-rotate-left" },
];

function displayValue(value, fallback = "Chưa cập nhật") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
}

function statusClass(status) {
  const map = {
    "Đã gửi": "report-badge report-badge--success",
    "Chờ gửi": "report-badge report-badge--warning",
    "Lỗi gửi": "report-badge report-badge--danger",
    "Chậm chuyến": "report-badge report-badge--orange",
    "Hủy chuyến": "report-badge report-badge--danger",
    "Hoàn thành": "report-badge report-badge--success",
    "Đã hạ cánh": "report-badge report-badge--success",
    "Đang bay": "report-badge report-badge--info",
    "Đang làm thủ tục": "report-badge report-badge--info",
    "Đã xóa": "report-badge report-badge--muted",
    "Bảo trì": "report-badge report-badge--warning",
    "Sẵn sàng": "report-badge report-badge--success",
    "Đang dùng": "report-badge report-badge--info",
    "Đóng": "report-badge report-badge--muted",
  };
  return map[status] || "report-badge report-badge--neutral";
}

function BaoCaoVanHanh({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [overview, setOverview] = useState(emptyOverview);
  const [byDate, setByDate] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byAirline, setByAirline] = useState([]);
  const [resources, setResources] = useState({ cong: [], bangChuyen: [] });
  const [notifications, setNotifications] = useState({ tongThongBao: 0, soChoGui: 0, soDaGui: 0, soLoiGui: 0, theoPhuongThuc: [] });
  const [updateLogs, setUpdateLogs] = useState({ tongLichSuCapNhat: 0, topTaiKhoanCapNhat: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        overviewData,
        dateData,
        statusData,
        airlineData,
        resourceData,
        notificationData,
        updateLogData,
      ] = await Promise.all([
        layBaoCaoTongQuan(appliedFilters),
        layBaoCaoTheoNgay(appliedFilters),
        layBaoCaoTheoTrangThai(appliedFilters),
        layBaoCaoTheoHangBay(appliedFilters),
        layBaoCaoTaiNguyen(appliedFilters),
        layBaoCaoThongBao(appliedFilters),
        layBaoCaoLichSuCapNhat(appliedFilters),
      ]);

      setOverview({ ...emptyOverview, ...(overviewData || {}) });
      setByDate(Array.isArray(dateData) ? dateData : []);
      setByStatus(Array.isArray(statusData) ? statusData : []);
      setByAirline(Array.isArray(airlineData) ? airlineData : []);
      setResources({
        cong: Array.isArray(resourceData?.cong) ? resourceData.cong : [],
        bangChuyen: Array.isArray(resourceData?.bangChuyen) ? resourceData.bangChuyen : [],
      });
      setNotifications({
        tongThongBao: notificationData?.tongThongBao || 0,
        soChoGui: notificationData?.soChoGui || 0,
        soDaGui: notificationData?.soDaGui || 0,
        soLoiGui: notificationData?.soLoiGui || 0,
        theoPhuongThuc: Array.isArray(notificationData?.theoPhuongThuc) ? notificationData.theoPhuongThuc : [],
      });
      setUpdateLogs({
        tongLichSuCapNhat: updateLogData?.tongLichSuCapNhat || 0,
        topTaiKhoanCapNhat: Array.isArray(updateLogData?.topTaiKhoanCapNhat) ? updateLogData.topTaiKhoanCapNhat : [],
      });
    } catch (err) {
      setError(err.message || "Không thể tải báo cáo vận hành.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const statCards = useMemo(() => [
    { label: "Tổng chuyến bay", value: overview.tongChuyenBay, icon: "fa-plane" },
    { label: "Chuyến bay đến", value: overview.soChuyenBayDen, icon: "fa-plane-arrival" },
    { label: "Chuyến bay đi", value: overview.soChuyenBayDi, icon: "fa-plane-departure" },
    { label: "Chậm chuyến", value: overview.soChamChuyen, icon: "fa-triangle-exclamation" },
    { label: "Hủy chuyến", value: overview.soHuyChuyen, icon: "fa-ban" },
    { label: "Hoàn thành", value: overview.soHoanThanh, icon: "fa-circle-check" },
    { label: "Tổng phút chậm", value: overview.tongSoPhutCham, icon: "fa-clock" },
    { label: "Phút chậm trung bình", value: formatNumber(overview.soPhutChamTrungBinh), icon: "fa-stopwatch" },
    { label: "Tổng thông báo", value: overview.tongThongBao, icon: "fa-bell" },
    { label: "Tổng lịch sử cập nhật", value: overview.tongLichSuCapNhat, icon: "fa-clock-rotate-left" },
  ], [overview]);

  function applyFilters(event) {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }

  function exportCsv() {
    window.location.href = taoBaoCaoExportUrl(activeTab, appliedFilters);
  }

  return (
    <AdminLayout activePage="reports" onNavigate={onNavigate}>
      <div className="report-page">
        <header className="report-header">
          <div>
            <h1>Báo cáo vận hành</h1>
            <p>Tổng hợp tình hình chuyến bay, trạng thái vận hành, sử dụng tài nguyên và lịch sử cập nhật.</p>
          </div>
          <div className="report-header__actions">
            <button className="report-button report-button--primary" type="button" onClick={exportCsv}>
              <i className="fa-solid fa-file-csv" />
              Xuất CSV
            </button>
            <button className="report-button report-button--secondary" type="button" onClick={loadReports} disabled={loading}>
              <i className="fa-solid fa-rotate-right" />
              Làm mới
            </button>
          </div>
        </header>

        {error && (
          <div className="report-alert report-alert--error">
            <i className="fa-solid fa-triangle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        <form className="report-filter" onSubmit={applyFilters}>
          <label>
            <span>Từ ngày</span>
            <input type="date" value={filters.tuNgay} onChange={(event) => setFilters({ ...filters, tuNgay: event.target.value })} />
          </label>
          <label>
            <span>Đến ngày</span>
            <input type="date" value={filters.denNgay} onChange={(event) => setFilters({ ...filters, denNgay: event.target.value })} />
          </label>
          <div className="report-filter__actions">
            <button className="report-button report-button--primary" type="submit">
              <i className="fa-solid fa-filter" />
              Áp dụng
            </button>
            <button className="report-button report-button--ghost" type="button" onClick={clearFilters}>
              Xóa lọc
            </button>
          </div>
        </form>

        <section className="report-stats" aria-label="Thống kê tổng quan">
          {statCards.map((card) => (
            <article className="report-stat" key={card.label}>
              <span className="report-stat__icon"><i className={`fa-solid ${card.icon}`} /></span>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <div className="report-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`report-tab ${activeTab === tab.key ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`fa-solid ${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <section className="report-panel">
          {loading ? (
            <EmptyState icon="fa-spinner fa-spin" text="Đang tải báo cáo..." />
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab overview={overview} notifications={notifications} />}
              {activeTab === "by-date" && <ByDateTab rows={byDate} />}
              {activeTab === "by-status" && <ByStatusTab rows={byStatus} />}
              {activeTab === "by-airline" && <ByAirlineTab rows={byAirline} />}
              {activeTab === "resources" && <ResourcesTab data={resources} />}
              {activeTab === "notifications" && <NotificationsTab data={notifications} />}
              {activeTab === "update-logs" && <UpdateLogsTab data={updateLogs} />}
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function OverviewTab({ overview, notifications }) {
  const statusRows = [
    ["Đã lên lịch", overview.soDaLenLich],
    ["Đang làm thủ tục", overview.soDangLamThuTuc],
    ["Đang bay", overview.soDangBay],
    ["Đã hạ cánh", overview.soDaHaCanh],
    ["Hoàn thành", overview.soHoanThanh],
    ["Chậm chuyến", overview.soChamChuyen],
    ["Hủy chuyến", overview.soHuyChuyen],
    ["Đã xóa", overview.soDaXoa],
  ];

  return (
    <div className="report-overview">
      <div className="report-warning-list">
        {overview.soChamChuyen > 0 && <Warning type="warning" text={`Có ${overview.soChamChuyen} chuyến bay đang chậm.`} />}
        {overview.soHuyChuyen > 0 && <Warning type="danger" text={`Có ${overview.soHuyChuyen} chuyến bay bị hủy.`} />}
        {notifications.soLoiGui > 0 && <Warning type="danger" text={`Có ${notifications.soLoiGui} thông báo lỗi gửi cần kiểm tra.`} />}
        {overview.soChamChuyen === 0 && overview.soHuyChuyen === 0 && notifications.soLoiGui === 0 && (
          <Warning type="success" text="Không có cảnh báo vận hành nổi bật trong bộ lọc hiện tại." />
        )}
      </div>
      <div className="report-table-wrap">
        <table className="report-table report-table--compact">
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {statusRows.map(([status, count]) => (
              <tr key={status}>
                <td><span className={statusClass(status)}>{status}</span></td>
                <td>{formatNumber(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ByDateTab({ rows }) {
  if (rows.length === 0) return <EmptyState icon="fa-calendar-days" text="Không có dữ liệu theo ngày." />;
  return (
    <div className="report-table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            <th>Ngày bay</th>
            <th>Tổng lịch trình</th>
            <th>Chuyến bay đến</th>
            <th>Chuyến bay đi</th>
            <th>Chậm chuyến</th>
            <th>Hủy chuyến</th>
            <th>Hoàn thành</th>
            <th>Tổng phút chậm</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.ngayBay}>
              <td>{formatDate(row.ngayBay)}</td>
              <td>{formatNumber(row.tongLichTrinh)}</td>
              <td>{formatNumber(row.soChuyenBayDen)}</td>
              <td>{formatNumber(row.soChuyenBayDi)}</td>
              <td>{formatNumber(row.soChamChuyen)}</td>
              <td>{formatNumber(row.soHuyChuyen)}</td>
              <td>{formatNumber(row.soHoanThanh)}</td>
              <td>{formatNumber(row.tongSoPhutCham)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByStatusTab({ rows }) {
  if (rows.length === 0) return <EmptyState icon="fa-list-check" text="Không có dữ liệu trạng thái." />;
  return (
    <div className="report-table-wrap">
      <table className="report-table report-table--compact">
        <thead>
          <tr>
            <th>Trạng thái</th>
            <th>Số lượng</th>
            <th>Tỷ lệ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.trangThai}>
              <td><span className={statusClass(row.trangThai)}>{displayValue(row.trangThai)}</span></td>
              <td>{formatNumber(row.soLuong)}</td>
              <td>
                <div className="report-percent">
                  <span style={{ width: `${Math.min(Number(row.tyLe || 0), 100)}%` }} />
                </div>
                <strong>{formatPercent(row.tyLe)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByAirlineTab({ rows }) {
  if (rows.length === 0) return <EmptyState icon="fa-plane" text="Không có dữ liệu hãng bay." />;
  return (
    <div className="report-table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            <th>Mã hãng</th>
            <th>Tên hãng</th>
            <th>Tổng chuyến bay</th>
            <th>Chuyến bay đến</th>
            <th>Chuyến bay đi</th>
            <th>Chậm chuyến</th>
            <th>Hủy chuyến</th>
            <th>Hoàn thành</th>
            <th>Phút chậm trung bình</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.maHangHangKhong}>
              <td>
                <strong>{displayValue(row.maHang)}</strong>
                <small>{displayValue(row.maHangHangKhong)}</small>
              </td>
              <td>{displayValue(row.tenHangHangKhong)}</td>
              <td>{formatNumber(row.tongChuyenBay)}</td>
              <td>{formatNumber(row.soChuyenBayDen)}</td>
              <td>{formatNumber(row.soChuyenBayDi)}</td>
              <td>{formatNumber(row.soChamChuyen)}</td>
              <td>{formatNumber(row.soHuyChuyen)}</td>
              <td>{formatNumber(row.soHoanThanh)}</td>
              <td>{formatNumber(row.soPhutChamTrungBinh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourcesTab({ data }) {
  return (
    <div className="report-resource-grid">
      <ResourceTable
        title="Cổng"
        icon="fa-door-open"
        rows={data.cong || []}
        columns={[
          ["maCong", "Mã cổng"],
          ["tenCong", "Tên cổng"],
          ["tenNhaGa", "Nhà ga"],
          ["trangThaiCong", "Trạng thái"],
          ["soLanPhanCong", "Số lần phân công"],
        ]}
      />
      <ResourceTable
        title="Băng chuyền"
        icon="fa-suitcase-rolling"
        rows={data.bangChuyen || []}
        columns={[
          ["maBangChuyenHanhLy", "Mã băng chuyền"],
          ["tenBangChuyenHanhLy", "Tên băng chuyền"],
          ["tenNhaGa", "Nhà ga"],
          ["trangThaiBangChuyen", "Trạng thái"],
          ["soLanPhanCong", "Số lần phân công"],
        ]}
      />
    </div>
  );
}

function ResourceTable({ title, icon, rows, columns }) {
  return (
    <section className="report-subsection">
      <h2><i className={`fa-solid ${icon}`} /> {title}</h2>
      {rows.length === 0 ? <EmptyState icon={icon} text={`Không có dữ liệu ${title.toLowerCase()}.`} /> : (
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[columns[0][0]]}>
                  {columns.map(([key]) => (
                    <td key={key}>
                      {key.toLowerCase().includes("trangthai")
                        ? <span className={statusClass(row[key])}>{displayValue(row[key])}</span>
                        : typeof row[key] === "number" ? formatNumber(row[key]) : displayValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function NotificationsTab({ data }) {
  return (
    <div className="report-split">
      <section className="report-mini-stats">
        <MiniStat label="Tổng thông báo" value={data.tongThongBao} icon="fa-bell" />
        <MiniStat label="Chờ gửi" value={data.soChoGui} icon="fa-hourglass-half" />
        <MiniStat label="Đã gửi" value={data.soDaGui} icon="fa-circle-check" />
        <MiniStat label="Lỗi gửi" value={data.soLoiGui} icon="fa-triangle-exclamation" />
      </section>
      <div className="report-table-wrap">
        <table className="report-table report-table--compact">
          <thead>
            <tr>
              <th>Phương thức gửi</th>
              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {(data.theoPhuongThuc || []).length === 0 ? (
              <tr><td colSpan="2"><EmptyState icon="fa-bell" text="Không có dữ liệu thông báo." /></td></tr>
            ) : data.theoPhuongThuc.map((item) => (
              <tr key={item.phuongThucGui}>
                <td>{displayValue(item.phuongThucGui)}</td>
                <td>{formatNumber(item.soLuong)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UpdateLogsTab({ data }) {
  return (
    <div className="report-split">
      <section className="report-mini-stats">
        <MiniStat label="Tổng lịch sử cập nhật" value={data.tongLichSuCapNhat} icon="fa-clock-rotate-left" />
      </section>
      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>Mã tài khoản</th>
              <th>Tên đăng nhập</th>
              <th>Vai trò</th>
              <th>Số lần cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {(data.topTaiKhoanCapNhat || []).length === 0 ? (
              <tr><td colSpan="4"><EmptyState icon="fa-clock-rotate-left" text="Không có dữ liệu lịch sử cập nhật." /></td></tr>
            ) : data.topTaiKhoanCapNhat.map((item) => (
              <tr key={item.maTaiKhoan}>
                <td>{displayValue(item.maTaiKhoan)}</td>
                <td>{displayValue(item.tenDangNhap)}</td>
                <td>{displayValue(item.vaiTro)}</td>
                <td>{formatNumber(item.soLanCapNhat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }) {
  return (
    <article className="report-mini-stat">
      <i className={`fa-solid ${icon}`} />
      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </article>
  );
}

function Warning({ type, text }) {
  return (
    <div className={`report-warning report-warning--${type}`}>
      <i className={`fa-solid ${type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
      <span>{text}</span>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="report-empty">
      <i className={`fa-solid ${icon}`} />
      <span>{text}</span>
    </div>
  );
}

export default BaoCaoVanHanh;
