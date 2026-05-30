import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatBangChuyen,
  capNhatCong,
  capNhatHangHangKhong,
  capNhatNhaGa,
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
  themBangChuyen,
  themCong,
  themHangHangKhong,
  themNhaGa,
  xoaBangChuyen,
  xoaCong,
  xoaHangHangKhong,
  xoaNhaGa,
} from "../../api/danhMucVanHanhApi.js";
import "../../styles/admin/danhMucVanHanh.css";

const TABS = [
  { key: "airlines", label: "Hãng hàng không", icon: "fa-solid fa-plane" },
  { key: "terminals", label: "Nhà ga", icon: "fa-solid fa-building" },
  { key: "gates", label: "Cổng", icon: "fa-solid fa-door-open" },
  { key: "baggage", label: "Băng chuyền hành lý", icon: "fa-solid fa-suitcase-rolling" },
];

const STAT_CARDS = [
  { label: "Hãng hàng không", key: "tongHangHangKhong", icon: "fa-solid fa-plane" },
  { label: "Nhà ga", key: "tongNhaGa", icon: "fa-solid fa-building" },
  { label: "Cổng", key: "tongCong", icon: "fa-solid fa-door-open" },
  { label: "Băng chuyền", key: "tongBangChuyen", icon: "fa-solid fa-suitcase-rolling" },
  { label: "Cổng sẵn sàng", key: "soCongSanSang", icon: "fa-solid fa-circle-check" },
  { label: "Cổng bảo trì", key: "soCongBaoTri", icon: "fa-solid fa-screwdriver-wrench" },
  { label: "Băng chuyền sẵn sàng", key: "soBangChuyenSanSang", icon: "fa-solid fa-circle-check" },
  { label: "Băng chuyền bảo trì", key: "soBangChuyenBaoTri", icon: "fa-solid fa-screwdriver-wrench" },
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
  const [formData, setFormData] = useState({});

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

  const updateFilter = (name, value) => {
    setLoading(true);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData(createEmptyForm(activeTab, terminalTypes, resourceStatuses, terminalOptions));
    setModal({ type: "form", mode: "create", tab: activeTab, item: null });
  };

  const openEditModal = (item) => {
    setFormData(mapItemToForm(activeTab, item));
    setModal({ type: "form", mode: "edit", tab: activeTab, item });
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

  const openDeleteModal = (item) => {
    setModal({ type: "delete", tab: activeTab, item });
  };

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setFormData({});
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!modal) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const api = getTabApi(modal.tab);
      const payload = normalizePayload(modal.tab, formData);
      if (modal.mode === "edit") {
        await api.update(getRowId(modal.tab, modal.item), payload);
        setSuccess("Cập nhật dữ liệu thành công.");
      } else {
        await api.create(payload);
        setSuccess("Thêm mới dữ liệu thành công.");
      }
      setModal(null);
      setFormData({});
      await refreshAll();
    } catch (err) {
      setError(err.message || "Không lưu được dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modal) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await getTabApi(modal.tab).remove(getRowId(modal.tab, modal.item));
      setSuccess("Xóa dữ liệu thành công.");
      setModal(null);
      await refreshAll();
    } catch (err) {
      setError(err.message || "Không xóa được dữ liệu.");
    } finally {
      setSaving(false);
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
            <article className="operation-stat" key={card.key}>
              <span className="operation-stat__icon">
                <i className={card.icon} aria-hidden="true" />
              </span>
              <div>
                <p>{card.label}</p>
                <strong>{statistics?.[card.key] ?? 0}</strong>
              </div>
            </article>
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
              <button className="operation-button operation-button--primary" type="button" onClick={openCreateModal}>
                <i className="fa-solid fa-plus" aria-hidden="true" />
                Thêm mới
              </button>
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
                renderTable(activeTab, rows, resourceStatuses, openDetailModal, openEditModal, openDeleteModal, handleQuickStatus)
              )}
            </div>
          </div>
        </section>

        {modal?.type === "form" && (
          <FormModal
            modal={modal}
            formData={formData}
            terminalTypes={terminalTypes}
            resourceStatuses={resourceStatuses}
            terminalOptions={terminalOptions}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}

        {modal?.type === "detail" && (
          <DetailModal modal={modal} onClose={closeModal} />
        )}

        {modal?.type === "delete" && (
          <DeleteModal modal={modal} saving={saving} onClose={closeModal} onDelete={handleDelete} />
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

function renderTable(activeTab, rows, resourceStatuses, onView, onEdit, onDelete, onQuickStatus) {
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
            <th>Hành động</th>
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
              <td>{renderActions(item, onView, onEdit, onDelete)}</td>
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
              <td>{renderActions(item, onView, onEdit, onDelete)}</td>
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
              <td>{renderActions(item, onView, onEdit, onDelete)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function renderActions(item, onView, onEdit, onDelete) {
  return (
    <div className="operation-actions">
      <button type="button" title="Xem" aria-label="Xem" onClick={() => onView(item)}>
        <i className="fa-solid fa-eye" aria-hidden="true" />
      </button>
      <button type="button" title="Sửa" aria-label="Sửa" onClick={() => onEdit(item)}>
        <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
      </button>
      <button className="operation-actions__danger" type="button" title="Xóa" aria-label="Xóa" onClick={() => onDelete(item)}>
        <i className="fa-solid fa-trash" aria-hidden="true" />
      </button>
    </div>
  );
}

function FormModal({ modal, formData, terminalTypes, resourceStatuses, terminalOptions, saving, onChange, onClose, onSubmit }) {
  const title = modal.mode === "edit" ? `Sửa ${getTabLabel(modal.tab).toLowerCase()}` : `Thêm ${getTabLabel(modal.tab).toLowerCase()}`;

  return (
    <div className="operation-modal-backdrop" role="presentation">
      <div className="operation-modal" role="dialog" aria-modal="true" aria-label={title}>
        <form onSubmit={onSubmit}>
          <div className="operation-modal__header">
            <h3>{title}</h3>
            <button type="button" aria-label="Đóng" onClick={onClose}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <div className="operation-modal__body">
            {renderFormFields(modal.tab, formData, terminalTypes, resourceStatuses, terminalOptions, onChange)}
          </div>
          <div className="operation-modal__footer">
            <button className="operation-button operation-button--secondary" type="button" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button className="operation-button operation-button--primary" type="submit" disabled={saving}>
              <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk"} aria-hidden="true" />
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderFormFields(tab, formData, terminalTypes, resourceStatuses, terminalOptions, onChange) {
  if (tab === "airlines") {
    return (
      <>
        <label className="operation-field">
          <span>Mã hãng</span>
          <input name="maHang" value={formData.maHang || ""} onChange={onChange} required maxLength={10} />
        </label>
        <label className="operation-field">
          <span>Tên hãng hàng không</span>
          <input name="tenHangHangKhong" value={formData.tenHangHangKhong || ""} onChange={onChange} required maxLength={100} />
        </label>
        <label className="operation-field">
          <span>Quốc gia</span>
          <input name="quocGia" value={formData.quocGia || ""} onChange={onChange} maxLength={50} />
        </label>
      </>
    );
  }

  if (tab === "terminals") {
    return (
      <>
        <label className="operation-field">
          <span>Tên nhà ga</span>
          <input name="tenNhaGa" value={formData.tenNhaGa || ""} onChange={onChange} required maxLength={100} />
        </label>
        <label className="operation-field">
          <span>Loại nhà ga</span>
          <select name="loaiNhaGa" value={formData.loaiNhaGa || ""} onChange={onChange} required>
            {terminalTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="operation-field operation-field--full">
          <span>Mô tả</span>
          <textarea name="moTa" value={formData.moTa || ""} onChange={onChange} maxLength={255} rows={3} />
        </label>
      </>
    );
  }

  const isGate = tab === "gates";
  return (
    <>
      <label className="operation-field">
        <span>Nhà ga</span>
        <select name="maNhaGa" value={formData.maNhaGa || ""} onChange={onChange} required>
          {terminalOptions.map((terminal) => (
            <option key={terminal.maNhaGa} value={terminal.maNhaGa}>
              {terminal.tenNhaGa}
            </option>
          ))}
        </select>
      </label>
      <label className="operation-field">
        <span>{isGate ? "Tên cổng" : "Tên băng chuyền"}</span>
        <input
          name={isGate ? "tenCong" : "tenBangChuyenHanhLy"}
          value={isGate ? formData.tenCong || "" : formData.tenBangChuyenHanhLy || ""}
          onChange={onChange}
          required
          maxLength={100}
        />
      </label>
      <label className="operation-field">
        <span>Trạng thái</span>
        <select name={isGate ? "trangThaiCong" : "trangThaiBangChuyen"} value={isGate ? formData.trangThaiCong || "" : formData.trangThaiBangChuyen || ""} onChange={onChange} required>
          {resourceStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
    </>
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

function DeleteModal({ modal, saving, onClose, onDelete }) {
  const label = getItemDisplayName(modal.tab, modal.item);
  const isResource = modal.tab === "gates" || modal.tab === "baggage";
  return (
    <div className="operation-modal-backdrop" role="presentation">
      <div className="operation-modal operation-modal--delete" role="dialog" aria-modal="true" aria-label="Xác nhận xóa">
        <div className="operation-modal__header">
          <h3>Xác nhận xóa</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="operation-delete">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <p>Bạn có chắc muốn xóa <strong>{label}</strong>?</p>
          {isResource && <span>Nếu dữ liệu đã được dùng trong vận hành, hãy đổi trạng thái sang "Đóng" hoặc "Bảo trì".</span>}
        </div>
        <div className="operation-modal__footer">
          <button className="operation-button operation-button--secondary" type="button" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button className="operation-button operation-button--danger" type="button" onClick={onDelete} disabled={saving}>
            <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-trash"} aria-hidden="true" />
            Xóa
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
      create: themHangHangKhong,
      update: capNhatHangHangKhong,
      remove: xoaHangHangKhong,
    },
    terminals: {
      list: layDanhSachNhaGa,
      detail: layChiTietNhaGa,
      create: themNhaGa,
      update: capNhatNhaGa,
      remove: xoaNhaGa,
    },
    gates: {
      list: layDanhSachCong,
      detail: layChiTietCong,
      create: themCong,
      update: capNhatCong,
      remove: xoaCong,
    },
    baggage: {
      list: layDanhSachBangChuyen,
      detail: layChiTietBangChuyen,
      create: themBangChuyen,
      update: capNhatBangChuyen,
      remove: xoaBangChuyen,
    },
  };
  return map[tab];
}

function createEmptyForm(tab, terminalTypes, resourceStatuses, terminalOptions) {
  if (tab === "airlines") {
    return { maHang: "", tenHangHangKhong: "", quocGia: "" };
  }
  if (tab === "terminals") {
    return { tenNhaGa: "", loaiNhaGa: terminalTypes[0] || "", moTa: "" };
  }
  if (tab === "gates") {
    return {
      maNhaGa: terminalOptions[0]?.maNhaGa || "",
      tenCong: "",
      trangThaiCong: resourceStatuses[0] || "",
    };
  }
  return {
    maNhaGa: terminalOptions[0]?.maNhaGa || "",
    tenBangChuyenHanhLy: "",
    trangThaiBangChuyen: resourceStatuses[0] || "",
  };
}

function mapItemToForm(tab, item) {
  if (tab === "airlines") {
    return {
      maHang: item.maHang || "",
      tenHangHangKhong: item.tenHangHangKhong || "",
      quocGia: item.quocGia || "",
    };
  }
  if (tab === "terminals") {
    return {
      tenNhaGa: item.tenNhaGa || "",
      loaiNhaGa: item.loaiNhaGa || "",
      moTa: item.moTa || "",
    };
  }
  if (tab === "gates") {
    return {
      maNhaGa: item.maNhaGa || "",
      tenCong: item.tenCong || "",
      trangThaiCong: item.trangThaiCong || "",
    };
  }
  return {
    maNhaGa: item.maNhaGa || "",
    tenBangChuyenHanhLy: item.tenBangChuyenHanhLy || "",
    trangThaiBangChuyen: item.trangThaiBangChuyen || "",
  };
}

function normalizePayload(tab, data) {
  if (tab === "airlines") {
    return {
      maHang: data.maHang?.trim() || "",
      tenHangHangKhong: data.tenHangHangKhong?.trim() || "",
      quocGia: data.quocGia?.trim() || "",
    };
  }
  if (tab === "terminals") {
    return {
      tenNhaGa: data.tenNhaGa?.trim() || "",
      loaiNhaGa: data.loaiNhaGa || "",
      moTa: data.moTa?.trim() || "",
    };
  }
  if (tab === "gates") {
    return {
      maNhaGa: data.maNhaGa || "",
      tenCong: data.tenCong?.trim() || "",
      trangThaiCong: data.trangThaiCong || "",
    };
  }
  return {
    maNhaGa: data.maNhaGa || "",
    tenBangChuyenHanhLy: data.tenBangChuyenHanhLy?.trim() || "",
    trangThaiBangChuyen: data.trangThaiBangChuyen || "",
  };
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

function getItemDisplayName(tab, item) {
  if (tab === "airlines") return item.tenHangHangKhong;
  if (tab === "terminals") return item.tenNhaGa;
  if (tab === "gates") return item.tenCong;
  return item.tenBangChuyenHanhLy;
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
