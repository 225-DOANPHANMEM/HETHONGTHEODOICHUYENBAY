import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatTrangThaiBangChuyen,
  capNhatTrangThaiCong,
  layChiTietBangChuyen,
  layChiTietCong,
  layChiTietHangHangKhong,
  layChiTietNhaGa,
  layDanhSachBangChuyen,
  layDanhSachCong,
  layDanhSachHangHangKhong,
  layDanhSachNhaGa,
  layLoaiNhaGa,
  layNhaGaOptions,
  layThongKeDanhMucVanHanh,
  layTrangThaiTaiNguyen,
} from "../../api/danhMucVanHanhApi.js";
import "../../styles/admin/danhMucVanHanh.css";

const TABS = [
  { key: "airlines", label: "Hãng hàng không", icon: "fa-solid fa-plane" },
  { key: "terminals", label: "Nhà ga", icon: "fa-solid fa-building" },
  { key: "gates", label: "Cổng", icon: "fa-solid fa-door-open" },
  { key: "baggage", label: "Băng chuyền hành lý", icon: "fa-solid fa-suitcase-rolling" },
];

const STAT_CARDS = [
  { label: "Hãng hàng không", key: "tongHangHangKhong", icon: "fa-solid fa-plane", tone: "blue", target: { tab: "airlines" } },
  { label: "Nhà ga", key: "tongNhaGa", icon: "fa-solid fa-building", tone: "indigo", target: { tab: "terminals" } },
  { label: "Cổng", key: "tongCong", icon: "fa-solid fa-door-open", tone: "cyan", target: { tab: "gates" } },
  { label: "Băng chuyền", key: "tongBangChuyen", icon: "fa-solid fa-suitcase-rolling", tone: "violet", target: { tab: "baggage" } },
  { label: "Cổng sẵn sàng", key: "soCongSanSang", icon: "fa-solid fa-circle-check", tone: "green", target: { tab: "gates", filter: "trangThaiCong", value: "Sẵn sàng" } },
  { label: "Cổng bảo trì", key: "soCongBaoTri", icon: "fa-solid fa-screwdriver-wrench", tone: "amber", target: { tab: "gates", filter: "trangThaiCong", value: "Bảo trì" } },
  { label: "Băng chuyền sẵn sàng", key: "soBangChuyenSanSang", icon: "fa-solid fa-circle-check", tone: "green", target: { tab: "baggage", filter: "trangThaiBangChuyen", value: "Sẵn sàng" } },
  { label: "Băng chuyền bảo trì", key: "soBangChuyenBaoTri", icon: "fa-solid fa-screwdriver-wrench", tone: "amber", target: { tab: "baggage", filter: "trangThaiBangChuyen", value: "Bảo trì" } },
];

const INITIAL_FILTERS = {
  quocGia: "",
  loaiNhaGa: "",
  maNhaGa: "",
  trangThaiCong: "",
  trangThaiBangChuyen: "",
};

function DanhMucVanHanh({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("airlines");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [terminalTypes, setTerminalTypes] = useState([]);
  const [resourceStatuses, setResourceStatuses] = useState([]);
  const [terminalOptions, setTerminalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);

  const currentTab = useMemo(
    () => TABS.find((tab) => tab.key === activeTab) || TABS[0],
    [activeTab],
  );

  const buildListFilters = useCallback(() => {
    if (activeTab === "airlines") {
      return { keyword, quocGia: filters.quocGia };
    }
    if (activeTab === "terminals") {
      return { keyword, loaiNhaGa: filters.loaiNhaGa };
    }
    if (activeTab === "gates") {
      return {
        keyword,
        maNhaGa: filters.maNhaGa,
        trangThaiCong: filters.trangThaiCong,
      };
    }
    return {
      keyword,
      maNhaGa: filters.maNhaGa,
      trangThaiBangChuyen: filters.trangThaiBangChuyen,
    };
  }, [activeTab, filters, keyword]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const listFilters = buildListFilters();
      const data = await getTabApi(activeTab).list(listFilters);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setRows([]);
      setError(err.message || "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, buildListFilters]);

  const loadCommonData = useCallback(async () => {
    try {
      const [stats, types, statuses, terminals] = await Promise.all([
        layThongKeDanhMucVanHanh(),
        layLoaiNhaGa(),
        layTrangThaiTaiNguyen(),
        layNhaGaOptions(),
      ]);
      setStatistics(stats || {});
      setTerminalTypes(Array.isArray(types) ? types : []);
      setResourceStatuses(Array.isArray(statuses) ? statuses : []);
      setTerminalOptions(Array.isArray(terminals) ? terminals : []);
    } catch (err) {
      setError(err.message || "Không tải được dữ liệu danh mục.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCommonData() {
      try {
        const [stats, types, statuses, terminals] = await Promise.all([
          layThongKeDanhMucVanHanh(),
          layLoaiNhaGa(),
          layTrangThaiTaiNguyen(),
          layNhaGaOptions(),
        ]);
        if (!cancelled) {
          setStatistics(stats || {});
          setTerminalTypes(Array.isArray(types) ? types : []);
          setResourceStatuses(Array.isArray(statuses) ? statuses : []);
          setTerminalOptions(Array.isArray(terminals) ? terminals : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không tải được dữ liệu danh mục.");
        }
      }
    }

    fetchCommonData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchRows() {
      try {
        const listFilters = buildListFilters();
        const data = await getTabApi(activeTab).list(listFilters);
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          setError(err.message || "Không tải được danh sách.");
          setLoading(false);
        }
      }
    }

    fetchRows();
    return () => {
      cancelled = true;
    };
  }, [activeTab, buildListFilters]);

  const refreshAll = async () => {
    setSuccess("");
    await Promise.all([loadCommonData(), loadRows()]);
  };

  const handleChangeTab = (tabKey) => {
    setActiveTab(tabKey);
    setKeyword("");
    setFilters(INITIAL_FILTERS);
    setLoading(true);
    setError("");
    setSuccess("");
    setModal(null);
  };

  const handleStatFilter = (card) => {
    const nextFilters = card.target?.filter
      ? { ...INITIAL_FILTERS, [card.target.filter]: card.target.value }
      : INITIAL_FILTERS;

    setActiveTab(card.target.tab);
    setKeyword("");
    setFilters(nextFilters);
    setLoading(true);
    setError("");
    setSuccess("");
    setModal(null);
  };

  const updateFilter = (name, value) => {
    setLoading(true);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const openDetailModal = async (item) => {
    setSaving(true);
    setError("");
    try {
      const detail = await getTabApi(activeTab).detail(getRowId(activeTab, item));
      setModal({ type: "detail", tab: activeTab, item: detail });
    } catch (err) {
      setError(err.message || "Không tải được chi tiết.");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (!saving) {
      setModal(null);
    }
  };

  const handleQuickStatus = async (item, newStatus) => {
    setError("");
    setSuccess("");
    try {
      if (activeTab === "gates") {
        await capNhatTrangThaiCong(item.maCong, newStatus);
      } else {
        await capNhatTrangThaiBangChuyen(item.maBangChuyenHanhLy, newStatus);
      }
      setSuccess("Cập nhật trạng thái thành công.");
      await refreshAll();
    } catch (err) {
      setError(err.message || "Không cập nhật được trạng thái.");
    }
  };

  return (
    <AdminLayout activePage="catalog" onNavigate={onNavigate}>
      <section className="operation-page">
        <header className="operation-header">
          <div className="operation-header__content">
            <div className="operation-header__icon">
              <i className="fa-solid fa-list-check" aria-hidden="true" />
            </div>
            <div>
              <h1>Danh mục vận hành</h1>
              <p>
                Quản lý hãng hàng không, nhà ga, cổng và băng chuyền phục vụ vận hành chuyến bay.
              </p>
            </div>
          </div>
          <button className="operation-button operation-button--secondary" type="button" onClick={refreshAll}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            Làm mới
          </button>
        </header>

        {(error || success) && (
          <div className={error ? "operation-alert operation-alert--error" : "operation-alert operation-alert--success"}>
            <i className={error ? "fa-solid fa-circle-xmark" : "fa-solid fa-circle-check"} aria-hidden="true" />
            <span>{error || success}</span>
          </div>
        )}

        <section className="operation-stats" aria-label="Thống kê danh mục vận hành">
          {STAT_CARDS.map((card) => (
            <button
              className={`operation-stat operation-stat--${card.tone}`}
              key={card.key}
              type="button"
              onClick={() => handleStatFilter(card)}
            >
              <span className="operation-stat__icon">
                <i className={card.icon} aria-hidden="true" />
              </span>
              <div>
                <p>{card.label}</p>
                <strong>{statistics?.[card.key] ?? 0}</strong>
              </div>
            </button>
          ))}
        </section>

        <section className="operation-workspace">
          <div className="operation-tabs" role="tablist" aria-label="Nhóm danh mục">
            {TABS.map((tab) => (
              <button
                className={activeTab === tab.key ? "operation-tab operation-tab--active" : "operation-tab"}
                key={tab.key}
                type="button"
                onClick={() => handleChangeTab(tab.key)}
              >
                <i className={tab.icon} aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="operation-panel">
            <div className="operation-panel__bar">
              <div>
                <h2>{currentTab.label}</h2>
                <p>{rows.length} bản ghi</p>
              </div>
            </div>

            <div className="operation-toolbar">
              <label className="operation-field operation-field--search">
                <span>Tìm kiếm</span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => {
                    setLoading(true);
                    setKeyword(event.target.value);
                  }}
                  placeholder="Nhập mã, tên hoặc trạng thái"
                />
              </label>
              {renderFilters(activeTab, filters, updateFilter, terminalTypes, resourceStatuses, terminalOptions)}
            </div>

            <div className="operation-table-wrap">
              {loading ? (
                <div className="operation-state">
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : rows.length === 0 ? (
                <div className="operation-state">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  <span>Không có dữ liệu phù hợp.</span>
                </div>
              ) : (
                renderTable(activeTab, rows, resourceStatuses, openDetailModal, handleQuickStatus)
              )}
            </div>
          </div>
        </section>

        {modal?.type === "detail" && (
          <DetailModal modal={modal} onClose={closeModal} />
        )}
      </section>
    </AdminLayout>
  );
}

function renderFilters(activeTab, filters, updateFilter, terminalTypes, resourceStatuses, terminalOptions) {
  if (activeTab === "airlines") {
    return (
      <label className="operation-field">
        <span>Quốc gia</span>
        <input
          type="text"
          value={filters.quocGia}
          onChange={(event) => updateFilter("quocGia", event.target.value)}
          placeholder="Tất cả"
        />
      </label>
    );
  }

  if (activeTab === "terminals") {
    return (
      <label className="operation-field">
        <span>Loại nhà ga</span>
        <select value={filters.loaiNhaGa} onChange={(event) => updateFilter("loaiNhaGa", event.target.value)}>
          <option value="">Tất cả</option>
          {terminalTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <>
      <label className="operation-field">
        <span>Nhà ga</span>
        <select value={filters.maNhaGa} onChange={(event) => updateFilter("maNhaGa", event.target.value)}>
          <option value="">Tất cả</option>
          {terminalOptions.map((terminal) => (
            <option key={terminal.maNhaGa} value={terminal.maNhaGa}>
              {terminal.tenNhaGa}
            </option>
          ))}
        </select>
      </label>
      <label className="operation-field">
        <span>Trạng thái</span>
        <select
          value={activeTab === "gates" ? filters.trangThaiCong : filters.trangThaiBangChuyen}
          onChange={(event) =>
            updateFilter(activeTab === "gates" ? "trangThaiCong" : "trangThaiBangChuyen", event.target.value)
          }
        >
          <option value="">Tất cả</option>
          {resourceStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function renderTable(activeTab, rows, resourceStatuses, onView, onQuickStatus) {
  if (activeTab === "airlines") {
    return (
      <table className="operation-table">
        <thead>
          <tr>
            <th>Mã HHK</th>
            <th>Mã hãng</th>
            <th>Tên hãng hàng không</th>
            <th>Quốc gia</th>
            <th>Số chuyến bay</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.maHangHangKhong}>
              <td className="operation-code">{item.maHangHangKhong}</td>
              <td>{item.maHang}</td>
              <td>{item.tenHangHangKhong}</td>
              <td>{item.quocGia || "-"}</td>
              <td>{item.soChuyenBay ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (activeTab === "terminals") {
    return (
      <table className="operation-table">
        <thead>
          <tr>
            <th>Mã nhà ga</th>
            <th>Tên nhà ga</th>
            <th>Loại</th>
            <th>Mô tả</th>
            <th>Cổng</th>
            <th>Băng chuyền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.maNhaGa}>
              <td className="operation-code">{item.maNhaGa}</td>
              <td>{item.tenNhaGa}</td>
              <td><span className="operation-badge">{item.loaiNhaGa}</span></td>
              <td>{item.moTa || "-"}</td>
              <td>{item.soCong ?? 0}</td>
              <td>{item.soBangChuyen ?? 0}</td>
              <td>{renderReadOnlyActions(item, onView)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="operation-table">
      <thead>
        <tr>
          <th>Mã</th>
          <th>Tên</th>
          <th>Nhà ga</th>
          <th>Trạng thái</th>
          <th>Số lần phân công</th>
          <th>Cập nhật trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => {
          const id = activeTab === "gates" ? item.maCong : item.maBangChuyenHanhLy;
          const name = activeTab === "gates" ? item.tenCong : item.tenBangChuyenHanhLy;
          const status = activeTab === "gates" ? item.trangThaiCong : item.trangThaiBangChuyen;
          return (
            <tr key={id}>
              <td className="operation-code">{id}</td>
              <td>{name}</td>
              <td>{item.tenNhaGa}</td>
              <td><span className={getStatusClassName(status)}>{status}</span></td>
              <td>{item.soLanPhanCong ?? 0}</td>
              <td>
                <select className="operation-status-select" value={status} onChange={(event) => onQuickStatus(item, event.target.value)}>
                  {resourceStatuses.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </td>
              <td>{renderReadOnlyActions(item, onView)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function renderReadOnlyActions(item, onView) {
  return (
    <div className="operation-actions">
      <button type="button" title="Xem" aria-label="Xem" onClick={() => onView(item)}>
        <i className="fa-solid fa-eye" aria-hidden="true" />
      </button>
    </div>
  );
}

function DetailModal({ modal, onClose }) {
  const fields = getDetailFields(modal.tab, modal.item);
  return (
    <div className="operation-modal-backdrop" role="presentation">
      <div className="operation-modal operation-modal--detail" role="dialog" aria-modal="true" aria-label="Chi tiết">
        <div className="operation-modal__header">
          <h3>Chi tiết {getTabLabel(modal.tab).toLowerCase()}</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="operation-detail-grid">
          {fields.map((field) => (
            <div className="operation-detail" key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value || "-"}</strong>
            </div>
          ))}
        </div>
        <div className="operation-modal__footer">
          <button className="operation-button operation-button--primary" type="button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function getTabApi(tab) {
  const map = {
    airlines: {
      list: layDanhSachHangHangKhong,
      detail: layChiTietHangHangKhong,
    },
    terminals: {
      list: layDanhSachNhaGa,
      detail: layChiTietNhaGa,
    },
    gates: {
      list: layDanhSachCong,
      detail: layChiTietCong,
    },
    baggage: {
      list: layDanhSachBangChuyen,
      detail: layChiTietBangChuyen,
    },
  };
  return map[tab];
}

function getRowId(tab, item) {
  if (tab === "airlines") return item.maHangHangKhong;
  if (tab === "terminals") return item.maNhaGa;
  if (tab === "gates") return item.maCong;
  return item.maBangChuyenHanhLy;
}

function getTabLabel(tab) {
  return TABS.find((item) => item.key === tab)?.label || "";
}

function getDetailFields(tab, item) {
  if (tab === "airlines") {
    return [
      { label: "Mã hãng hàng không", value: item.maHangHangKhong },
      { label: "Mã hãng", value: item.maHang },
      { label: "Tên hãng hàng không", value: item.tenHangHangKhong },
      { label: "Quốc gia", value: item.quocGia },
      { label: "Số chuyến bay", value: item.soChuyenBay ?? 0 },
    ];
  }
  if (tab === "terminals") {
    return [
      { label: "Mã nhà ga", value: item.maNhaGa },
      { label: "Tên nhà ga", value: item.tenNhaGa },
      { label: "Loại nhà ga", value: item.loaiNhaGa },
      { label: "Mô tả", value: item.moTa },
      { label: "Số cổng", value: item.soCong ?? 0 },
      { label: "Số băng chuyền", value: item.soBangChuyen ?? 0 },
    ];
  }
  if (tab === "gates") {
    return [
      { label: "Mã cổng", value: item.maCong },
      { label: "Tên cổng", value: item.tenCong },
      { label: "Mã nhà ga", value: item.maNhaGa },
      { label: "Nhà ga", value: item.tenNhaGa },
      { label: "Trạng thái", value: item.trangThaiCong },
      { label: "Số lần phân công", value: item.soLanPhanCong ?? 0 },
    ];
  }
  return [
    { label: "Mã băng chuyền", value: item.maBangChuyenHanhLy },
    { label: "Tên băng chuyền", value: item.tenBangChuyenHanhLy },
    { label: "Mã nhà ga", value: item.maNhaGa },
    { label: "Nhà ga", value: item.tenNhaGa },
    { label: "Trạng thái", value: item.trangThaiBangChuyen },
    { label: "Số lần phân công", value: item.soLanPhanCong ?? 0 },
  ];
}

function getStatusClassName(status) {
  const map = {
    "Sẵn sàng": "operation-status operation-status--ready",
    "Đang dùng": "operation-status operation-status--using",
    "Bảo trì": "operation-status operation-status--maintenance",
    "Đóng": "operation-status operation-status--closed",
  };
  return map[status] || "operation-status";
}

export default DanhMucVanHanh;
