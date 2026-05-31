import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import { layTongQuanDashboard } from "../../api/adminDashboardApi.js";
import {
  layChiTietLichSuCapNhat,
  layChiTietThongBao,
} from "../../api/thongBaoLichSuApi.js";
import "../../styles/admin/DashboardPage.css";

const initialData = {
  tongChuyenBay: 0,
  soChuyenBayDen: 0,
  soChuyenBayDi: 0,
  soDangLamThuTuc: 0,
  soDangBay: 0,
  soChamChuyen: 0,
  soHuyChuyen: 0,
  soHoanThanh: 0,
  soCongDangDung: 0,
  soBangChuyenDangDung: 0,
  chuyenBayCanChuY: [],
  thongBaoGanDay: [],
  lichSuCapNhatGanDay: [],
};

const quickActions = [
  {
    id: 1,
    icon: "fa-solid fa-plane-circle-check",
    iconClass: "dashboard-icon--flight",
    title: "Quản lý chuyến bay",
    page: "flights",
  },
  {
    id: 2,
    icon: "fa-solid fa-diagram-project",
    iconClass: "dashboard-icon--dispatch",
    title: "Điều phối",
    page: "dispatch",
  },
  {
    id: 3,
    icon: "fa-solid fa-users",
    iconClass: "dashboard-icon--users",
    title: "Người dùng",
    page: "users",
  },
  {
    id: 4,
    icon: "fa-solid fa-chart-line",
    iconClass: "dashboard-icon--report",
    title: "Báo cáo",
    page: "reports",
  },
];

const textOrDefault = (value, fallback = "Chưa cập nhật") =>
  value === null || value === undefined || value === ""
    ? fallback
    : value;

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";
  const [datePart, timePart = ""] = String(value).split("T");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}${timePart ? ` ${timePart.slice(0, 5)}` : ""}`;
}

function handleOpenKeyDown(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailModal, setDetailModal] = useState({
    type: null,
    detail: null,
    loading: false,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await layTongQuanDashboard();
        setData({ ...initialData, ...response });
      } catch {
        setError("Không tải được dữ liệu tổng quan. Vui lòng thử lại.");
        setData(initialData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overviewStats = useMemo(
    () => [
      {
        id: 1,
        label: "Tổng chuyến bay",
        value: data.tongChuyenBay,
        icon: "fa-solid fa-plane",
        iconClass: "dashboard-icon--flight",
      },
      {
        id: 2,
        label: "Chuyến bay đến",
        value: data.soChuyenBayDen,
        icon: "fa-solid fa-plane-arrival",
        iconClass: "dashboard-icon--arrival",
      },
      {
        id: 3,
        label: "Chuyến bay đi",
        value: data.soChuyenBayDi,
        icon: "fa-solid fa-plane-departure",
        iconClass: "dashboard-icon--departure",
      },
      {
        id: 4,
        label: "Đang làm thủ tục",
        value: data.soDangLamThuTuc,
        icon: "fa-solid fa-clipboard-check",
        iconClass: "dashboard-icon--checkin",
      },
      {
        id: 5,
        label: "Đang bay",
        value: data.soDangBay,
        icon: "fa-solid fa-route",
        iconClass: "dashboard-icon--flying",
      },
      {
        id: 6,
        label: "Chậm chuyến",
        value: data.soChamChuyen,
        icon: "fa-solid fa-clock",
        iconClass: "dashboard-icon--delayed",
      },
      {
        id: 7,
        label: "Hủy chuyến",
        value: data.soHuyChuyen,
        icon: "fa-solid fa-ban",
        iconClass: "dashboard-icon--cancelled",
      },
      {
        id: 8,
        label: "Hoàn thành",
        value: data.soHoanThanh,
        icon: "fa-solid fa-circle-check",
        iconClass: "dashboard-icon--done",
      },
      {
        id: 9,
        label: "Cổng đang dùng",
        value: data.soCongDangDung,
        icon: "fa-solid fa-door-open",
        iconClass: "dashboard-icon--gate",
      },
      {
        id: 10,
        label: "Băng chuyền đang dùng",
        value: data.soBangChuyenDangDung,
        icon: "fa-solid fa-suitcase-rolling",
        iconClass: "dashboard-icon--belt",
      },
    ],
    [data],
  );

  async function openNotificationDetail(maThongBao) {
    if (!maThongBao) return;
    setDetailModal({
      type: "notification",
      detail: null,
      loading: true,
      error: "",
    });

    try {
      const detail = await layChiTietThongBao(maThongBao);
      setDetailModal({
        type: "notification",
        detail,
        loading: false,
        error: "",
      });
    } catch (err) {
      setDetailModal({
        type: "notification",
        detail: null,
        loading: false,
        error: err.message || "Không tải được chi tiết thông báo.",
      });
    }
  }

  async function openLogDetail(maLichSuCapNhat) {
    if (!maLichSuCapNhat) return;
    setDetailModal({
      type: "log",
      detail: null,
      loading: true,
      error: "",
    });

    try {
      const detail = await layChiTietLichSuCapNhat(maLichSuCapNhat);
      setDetailModal({
        type: "log",
        detail,
        loading: false,
        error: "",
      });
    } catch (err) {
      setDetailModal({
        type: "log",
        detail: null,
        loading: false,
        error: err.message || "Không tải được chi tiết lịch sử cập nhật.",
      });
    }
  }

  function closeDetailModal() {
    setDetailModal({
      type: null,
      detail: null,
      loading: false,
      error: "",
    });
  }

  return (
    <AdminLayout activePage="dashboard" onNavigate={onNavigate}>
      <section className="dashboard-page">
        <div className="dashboard-page__heading">
          <div>
            <p className="dashboard-page__eyebrow">Bảng điều khiển Admin</p>
            <h1 className="dashboard-page__title">Tổng quan hệ thống</h1>
          </div>
          <div
            className="dashboard-page__plane-icon"
            role="img"
            aria-label="Biểu tượng trang tổng quan"
          >
            <i className="fa-solid fa-plane" />
          </div>
        </div>

        {loading && (
          <p className="dashboard-panel__subtitle">Đang tải dữ liệu...</p>
        )}
        {error && (
          <p className="dashboard-panel__subtitle" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        <div className="dashboard-page__stats-grid">
          {overviewStats.map((item) => (
            <article className="dashboard-stat-card" key={item.id}>
              <div className="dashboard-stat-card__icon">
                <i className={`${item.icon} ${item.iconClass}`} />
              </div>
              <div className="dashboard-stat-card__content">
                <p className="dashboard-stat-card__label">{item.label}</p>
                <h2 className="dashboard-stat-card__value">
                  {item.value ?? 0}
                </h2>
              </div>
            </article>
          ))}
        </div>

        <section className="dashboard-panel dashboard-panel--attention">
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Chuyến bay cần chú ý</h2>
          </div>
          <div className="dashboard-attention-table-wrapper">
            <div className="dashboard-attention-table__header">
              <span>Số hiệu</span>
              <span>Hãng bay</span>
              <span>Loại</span>
              <span>Tuyến bay</span>
              <span>Trạng thái</span>
              <span>Cảnh báo</span>
              <span>Chậm</span>
            </div>
            <div className="dashboard-attention-table">
              {data.chuyenBayCanChuY.length === 0 && (
                <p className="dashboard-panel__subtitle">Không có dữ liệu.</p>
              )}
              {data.chuyenBayCanChuY.map((flight) => (
                <article
                  className="dashboard-attention-table__row"
                  key={`${flight.maLichTrinh}-${flight.maChuyenBay}`}
                >
                  <div className="dashboard-attention-table__flight">
                    <p className="dashboard-attention-table__flight-number">
                      {textOrDefault(flight.soHieuChuyenBay)}
                    </p>
                  </div>
                  <div className="dashboard-attention-table__airline">
                    {textOrDefault(flight.tenHangHangKhong)}
                  </div>
                  <div className="dashboard-attention-table__airline">
                    {textOrDefault(flight.loaiChuyenBay)}
                  </div>
                  <div className="dashboard-attention-table__warning">{`${textOrDefault(flight.diemDi)} → ${textOrDefault(flight.diemDen)}`}</div>
                  <div className="dashboard-attention-table__status">
                    <span className="dashboard-attention-table__chip">
                      {textOrDefault(flight.trangThaiHienTai)}
                    </span>
                  </div>
                  <div className="dashboard-attention-table__warning">
                    {textOrDefault(flight.canhBao)}
                  </div>
                  <div className="dashboard-attention-table__warning">
                    {flight.soPhutCham ?? 0} phút
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="dashboard-page__bottom-grid">
          <section className="dashboard-panel dashboard-quick-access">
            <div className="dashboard-panel__header">
              <h2 className="dashboard-panel__title">Thông báo gần đây</h2>
            </div>
            <div className="dashboard-update-list">
              {data.thongBaoGanDay.length === 0 && (
                <p className="dashboard-panel__subtitle">Không có dữ liệu.</p>
              )}
              {data.thongBaoGanDay.map((item) => (
                <article
                  className="dashboard-update-item dashboard-update-item--clickable"
                  key={item.maThongBao}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNotificationDetail(item.maThongBao)}
                  onKeyDown={(event) =>
                    handleOpenKeyDown(event, () =>
                      openNotificationDetail(item.maThongBao),
                    )
                  }
                >
                  <div className="dashboard-update-item__dot" />
                  <div className="dashboard-update-item__body">
                    <p className="dashboard-update-item__action">
                      {textOrDefault(item.soHieuChuyenBay)} -{" "}
                      {textOrDefault(item.noiDungThongBao)}
                    </p>
                    <p className="dashboard-update-item__meta">
                      {textOrDefault(item.trangThaiMoi)} ·{" "}
                      {formatDateTime(item.thoiGianGui)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__header">
              <h2 className="dashboard-panel__title">
                Lịch sử cập nhật gần đây
              </h2>
            </div>
            <div className="dashboard-update-list">
              {data.lichSuCapNhatGanDay.length === 0 && (
                <p className="dashboard-panel__subtitle">Không có dữ liệu.</p>
              )}
              {data.lichSuCapNhatGanDay.map((item) => (
                <article
                  className="dashboard-update-item dashboard-update-item--clickable"
                  key={item.maLichSuCapNhat}
                  role="button"
                  tabIndex={0}
                  onClick={() => openLogDetail(item.maLichSuCapNhat)}
                  onKeyDown={(event) =>
                    handleOpenKeyDown(event, () =>
                      openLogDetail(item.maLichSuCapNhat),
                    )
                  }
                >
                  <div className="dashboard-update-item__dot"></div>
                  <div className="dashboard-update-item__body">
                    <p className="dashboard-update-item__action">
                      {textOrDefault(item.soHieuChuyenBay)} -{" "}
                      {textOrDefault(item.noiDungCapNhat)}
                    </p>
                    <p className="dashboard-update-item__meta">
                      {textOrDefault(item.tenDangNhap)} ·{" "}
                      {formatDateTime(item.thoiGianCapNhat)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="dashboard-panel" style={{ marginTop: "24px" }}>
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Truy cập nhanh</h2>
          </div>
          <div className="quick-access-grid">
            {quickActions.map((action) => (
              <button
                className="quick-action-card"
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.page)}
              >
                <div className="quick-action-card__icon">
                  <i className={`${action.icon} ${action.iconClass}`} />
                </div>
                <div className="quick-action-card__text">
                  <p className="quick-action-card__title">{action.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {detailModal.type === "notification" && (
          <NotificationDetailModal
            detail={detailModal.detail}
            loading={detailModal.loading}
            error={detailModal.error}
            onClose={closeDetailModal}
          />
        )}

        {detailModal.type === "log" && (
          <LogDetailModal
            detail={detailModal.detail}
            loading={detailModal.loading}
            error={detailModal.error}
            onClose={closeDetailModal}
          />
        )}
      </section>
    </AdminLayout>
  );
}

function NotificationDetailModal({ detail, loading, error, onClose }) {
  return (
    <DetailModal title="Chi tiết thông báo" icon="fa-bell" onClose={onClose}>
      {loading && <ModalStatus icon="fa-spinner fa-spin" text="Đang tải chi tiết..." />}
      {error && <ModalStatus icon="fa-triangle-exclamation" text={error} />}
      {!loading && !error && (
        <div className="dashboard-detail-grid">
          <DetailItem label="Mã thông báo" value={detail?.maThongBao} />
          <DetailItem label="Lịch trình" value={detail?.maLichTrinh} />
          <DetailItem label="Chuyến bay" value={detail?.soHieuChuyenBay} />
          <DetailItem label="Hãng bay" value={detail?.tenHangHangKhong} />
          <DetailItem label="Loại chuyến bay" value={detail?.loaiChuyenBay} />
          <DetailItem
            label="Hành trình"
            value={`${textOrDefault(detail?.diemDi)} → ${textOrDefault(detail?.diemDen)}`}
          />
          <DetailItem label="Ngày bay" value={formatDate(detail?.ngayBay)} />
          <DetailItem
            label="Người nhận"
            value={`${textOrDefault(detail?.tenDangNhap)} (${textOrDefault(detail?.maTaiKhoan)})`}
          />
          <DetailItem label="Cổng" value={detail?.tenCong || detail?.maCong} emptyText="Chưa phân công" />
          <DetailItem
            label="Băng chuyền"
            value={detail?.tenBangChuyenHanhLy || detail?.maBangChuyenHanhLy}
            emptyText="Chưa phân công"
          />
          <DetailItem label="Trạng thái mới" value={detail?.trangThaiMoi} />
          <DetailItem label="Giờ ước tính mới" value={formatDateTime(detail?.gioUocTinhMoi)} />
          <DetailItem label="Phương thức gửi" value={detail?.phuongThucGui} />
          <DetailItem label="Trạng thái gửi" value={detail?.trangThaiGui} />
          <DetailItem label="Thời gian gửi" value={formatDateTime(detail?.thoiGianGui)} />
          <DetailItem label="Nội dung" value={detail?.noiDungThongBao} wide emptyText="Không có" />
        </div>
      )}
    </DetailModal>
  );
}

function LogDetailModal({ detail, loading, error, onClose }) {
  return (
    <DetailModal title="Chi tiết lịch sử cập nhật" icon="fa-clock-rotate-left" onClose={onClose}>
      {loading && <ModalStatus icon="fa-spinner fa-spin" text="Đang tải chi tiết..." />}
      {error && <ModalStatus icon="fa-triangle-exclamation" text={error} />}
      {!loading && !error && (
        <div className="dashboard-detail-grid">
          <DetailItem label="Mã lịch sử" value={detail?.maLichSuCapNhat} />
          <DetailItem label="Lịch trình" value={detail?.maLichTrinh} />
          <DetailItem label="Chuyến bay" value={detail?.soHieuChuyenBay} />
          <DetailItem label="Hãng bay" value={detail?.tenHangHangKhong} />
          <DetailItem label="Loại chuyến bay" value={detail?.loaiChuyenBay} />
          <DetailItem
            label="Hành trình"
            value={`${textOrDefault(detail?.diemDi)} → ${textOrDefault(detail?.diemDen)}`}
          />
          <DetailItem label="Ngày bay" value={formatDate(detail?.ngayBay)} />
          <DetailItem
            label="Người cập nhật"
            value={`${textOrDefault(detail?.tenDangNhap)} (${textOrDefault(detail?.maTaiKhoan)})`}
          />
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
    </DetailModal>
  );
}

function DetailModal({ title, icon, children, onClose }) {
  return (
    <div className="dashboard-detail-modal-backdrop" role="presentation">
      <section className="dashboard-detail-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="dashboard-detail-modal__header">
          <h2>
            <i className={`fa-solid ${icon}`} />
            {title}
          </h2>
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
    <div className={`dashboard-detail-item ${wide ? "dashboard-detail-item--wide" : ""}`}>
      <span>{label}</span>
      <strong>{textOrDefault(value, emptyText)}</strong>
    </div>
  );
}

function ModalStatus({ icon, text }) {
  return (
    <div className="dashboard-detail-status">
      <i className={`fa-solid ${icon}`} />
      <span>{text}</span>
    </div>
  );
}

export default DashboardPage;
