import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import { layTongQuanDashboard } from "../../api/adminDashboardApi.js";
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
    title: "Quan ly chuyen bay",
    page: "flights",
  },
  {
    id: 2,
    icon: "fa-solid fa-diagram-project",
    iconClass: "dashboard-icon--dispatch",
    title: "Dieu phoi",
    page: "dispatch",
  },
  {
    id: 3,
    icon: "fa-solid fa-users",
    iconClass: "dashboard-icon--users",
    title: "Nguoi dung",
    page: "users",
  },
  {
    id: 4,
    icon: "fa-solid fa-chart-line",
    iconClass: "dashboard-icon--report",
    title: "Bao cao",
    page: "reports",
  },
];

const textOrDefault = (value) =>
  value === null || value === undefined || value === ""
    ? "Chua cap nhat"
    : value;

function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await layTongQuanDashboard();
        setData({ ...initialData, ...response });
      } catch {
        setError("Khong tai duoc du lieu tong quan. Vui long thu lai.");
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
        label: "Tong chuyen bay",
        value: data.tongChuyenBay,
        icon: "fa-solid fa-plane",
        iconClass: "dashboard-icon--flight",
      },
      {
        id: 2,
        label: "Chuyen bay den",
        value: data.soChuyenBayDen,
        icon: "fa-solid fa-plane-arrival",
        iconClass: "dashboard-icon--arrival",
      },
      {
        id: 3,
        label: "Chuyen bay di",
        value: data.soChuyenBayDi,
        icon: "fa-solid fa-plane-departure",
        iconClass: "dashboard-icon--departure",
      },
      {
        id: 4,
        label: "Dang lam thu tuc",
        value: data.soDangLamThuTuc,
        icon: "fa-solid fa-clipboard-check",
        iconClass: "dashboard-icon--checkin",
      },
      {
        id: 5,
        label: "Dang bay",
        value: data.soDangBay,
        icon: "fa-solid fa-route",
        iconClass: "dashboard-icon--flying",
      },
      {
        id: 6,
        label: "Cham chuyen",
        value: data.soChamChuyen,
        icon: "fa-solid fa-clock",
        iconClass: "dashboard-icon--delayed",
      },
      {
        id: 7,
        label: "Huy chuyen",
        value: data.soHuyChuyen,
        icon: "fa-solid fa-ban",
        iconClass: "dashboard-icon--cancelled",
      },
      {
        id: 8,
        label: "Hoan thanh",
        value: data.soHoanThanh,
        icon: "fa-solid fa-circle-check",
        iconClass: "dashboard-icon--done",
      },
      {
        id: 9,
        label: "Cong dang dung",
        value: data.soCongDangDung,
        icon: "fa-solid fa-door-open",
        iconClass: "dashboard-icon--gate",
      },
      {
        id: 10,
        label: "Bang chuyen dang dung",
        value: data.soBangChuyenDangDung,
        icon: "fa-solid fa-suitcase-rolling",
        iconClass: "dashboard-icon--belt",
      },
    ],
    [data],
  );

  return (
    <AdminLayout activePage="dashboard" onNavigate={onNavigate}>
      <section className="dashboard-page">
        <div className="dashboard-page__heading">
          <div>
            <p className="dashboard-page__eyebrow">Bang dieu khien Admin</p>
            <h1 className="dashboard-page__title">Tong quan he thong</h1>
          </div>
          <div
            className="dashboard-page__plane-icon"
            role="img"
            aria-label="dashboard icon"
          >
            <i className="fa-solid fa-plane" />
          </div>
        </div>

        {loading && (
          <p className="dashboard-panel__subtitle">Dang tai du lieu...</p>
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
            <h2 className="dashboard-panel__title">Chuyen bay can chu y</h2>
          </div>
          <div className="dashboard-attention-table-wrapper">
            <div className="dashboard-attention-table__header">
              <span>So hieu</span>
              <span>Hang bay</span>
              <span>Loai</span>
              <span>Tuyen bay</span>
              <span>Trang thai</span>
              <span>Canh bao</span>
              <span>Cham</span>
            </div>
            <div className="dashboard-attention-table">
              {data.chuyenBayCanChuY.length === 0 && (
                <p className="dashboard-panel__subtitle">Khong co du lieu.</p>
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
                  <div className="dashboard-attention-table__warning">{`${textOrDefault(flight.diemDi)} -> ${textOrDefault(flight.diemDen)}`}</div>
                  <div className="dashboard-attention-table__status">
                    <span className="dashboard-attention-table__chip">
                      {textOrDefault(flight.trangThaiHienTai)}
                    </span>
                  </div>
                  <div className="dashboard-attention-table__warning">
                    {textOrDefault(flight.canhBao)}
                  </div>
                  <div className="dashboard-attention-table__warning">
                    {flight.soPhutCham ?? 0} phut
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="dashboard-page__bottom-grid">
          <section className="dashboard-panel dashboard-quick-access">
            <div className="dashboard-panel__header">
              <h2 className="dashboard-panel__title">Thong bao gan day</h2>
            </div>
            <div className="dashboard-update-list">
              {data.thongBaoGanDay.length === 0 && (
                <p className="dashboard-panel__subtitle">Khong co du lieu.</p>
              )}
              {data.thongBaoGanDay.map((item) => (
                <article
                  className="dashboard-update-item"
                  key={item.maThongBao}
                >
                  <div className="dashboard-update-item__dot" />
                  <div className="dashboard-update-item__body">
                    <p className="dashboard-update-item__action">
                      {textOrDefault(item.soHieuChuyenBay)} -{" "}
                      {textOrDefault(item.noiDungThongBao)}
                    </p>
                    <p className="dashboard-update-item__meta">
                      {textOrDefault(item.trangThaiMoi)} ·{" "}
                      {textOrDefault(item.thoiGianGui)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__header">
              <h2 className="dashboard-panel__title">
                Lich su cap nhat gan day
              </h2>
            </div>
            <div className="dashboard-update-list">
              {data.lichSuCapNhatGanDay.length === 0 && (
                <p className="dashboard-panel__subtitle">Khong co du lieu.</p>
              )}
              {data.lichSuCapNhatGanDay.map((item) => (
                <article
                  className="dashboard-update-item"
                  key={item.maLichSuCapNhat}
                >
                  <div className="dashboard-update-item__dot"></div>
                  <div className="dashboard-update-item__body">
                    <p className="dashboard-update-item__action">
                      {textOrDefault(item.soHieuChuyenBay)} -{" "}
                      {textOrDefault(item.noiDungCapNhat)}
                    </p>
                    <p className="dashboard-update-item__meta">
                      {textOrDefault(item.tenDangNhap)} ·{" "}
                      {textOrDefault(item.thoiGianCapNhat)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="dashboard-panel" style={{ marginTop: "24px" }}>
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Truy cap nhanh</h2>
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
      </section>
    </AdminLayout>
  );
}

export default DashboardPage;
