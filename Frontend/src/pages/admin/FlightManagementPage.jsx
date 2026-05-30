import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatChuyenBay,
  layChiTietChuyenBay,
  layDanhSachChuyenBay,
  layHangHangKhongOptions,
  layLichSuChuyenBay,
  layLoaiChuyenBay,
  layThongKeChuyenBay,
  layTrangThaiChuyenBay,
  luuTruChuyenBay,
  themChuyenBay,
} from "../../api/chuyenBayApi.js";
import "../../styles/admin/FlightManagementPage.css";

const EMPTY_FILTERS = {
  keyword: "",
  type: "",
  status: "",
  airline: "",
  date: "",
  terminal: "",
  gate: "",
  includeArchived: false,
};

const MAIN_STAT_CARDS = [
  { key: "tongLichTrinh", label: "Tổng chuyến bay", icon: "fa-solid fa-plane", tone: "blue" },
  { key: "soChuyenBayDen", label: "Chuyến bay đến", icon: "fa-solid fa-plane-arrival", tone: "teal" },
  { key: "soChuyenBayDi", label: "Chuyến bay đi", icon: "fa-solid fa-plane-departure", tone: "indigo" },
  { key: "soDangKhaiThac", label: "Đang khai thác", icon: "fa-solid fa-route", tone: "cyan" },
  { key: "soChamHuy", label: "Chậm/Hủy", icon: "fa-solid fa-triangle-exclamation", tone: "amber" },
  { key: "soHoanThanh", label: "Hoàn thành", icon: "fa-solid fa-circle-check", tone: "green" },
];

const MAIN_STATUSES = ["Đã lên lịch", "Đang làm thủ tục", "Đang bay", "Chậm chuyến", "Hủy chuyến", "Hoàn thành"];

function FlightManagementPage({ onNavigate }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [airlines, setAirlines] = useState([]);
  const [flightTypes, setFlightTypes] = useState([]);
  const [statuses, setStatuses] = useState(MAIN_STATUSES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});

  const visibleStatuses = useMemo(() => {
    const apiStatuses = statuses.filter((status) => status !== "Đã hạ cánh");
    return apiStatuses.length ? apiStatuses : MAIN_STATUSES;
  }, [statuses]);

  const loadCommonData = useCallback(async () => {
    const [stats, airlineOptions, typeOptions, statusOptions] = await Promise.all([
      layThongKeChuyenBay(),
      layHangHangKhongOptions(),
      layLoaiChuyenBay(),
      layTrangThaiChuyenBay(),
    ]);
    setStatistics(stats || {});
    setAirlines(Array.isArray(airlineOptions) ? airlineOptions : []);
    setFlightTypes(Array.isArray(typeOptions) ? typeOptions : []);
    setStatuses(Array.isArray(statusOptions) ? statusOptions : MAIN_STATUSES);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await layDanhSachChuyenBay(appliedFilters);
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setRows([]);
      setError(err.message || "Không tải được danh sách chuyến bay.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        await loadCommonData();
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không tải được dữ liệu chuyến bay.");
        }
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [loadCommonData]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const reloadAll = async () => {
    setError("");
    setSuccess("");
    await Promise.all([loadCommonData(), loadRows()]);
  };

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const openCreateModal = () => {
    setFormData(createEmptyFlightForm(airlines, flightTypes));
    setModal({ type: "form", mode: "create", item: null });
  };

  const openEditModal = (item) => {
    setFormData(mapFlightToForm(item));
    setModal({ type: "form", mode: "edit", item });
  };

  const openDetailModal = async (item) => {
    setSaving(true);
    setError("");
    try {
      const detail = await layChiTietChuyenBay(item.maLichTrinh);
      setModal({ type: "detail", detail });
    } catch (err) {
      setError(err.message || "Không tải được chi tiết chuyến bay.");
    } finally {
      setSaving(false);
    }
  };

  const openHistoryModal = async (item) => {
    setSaving(true);
    setError("");
    try {
      const history = await layLichSuChuyenBay(item.maLichTrinh);
      setModal({ type: "history", item, history: Array.isArray(history) ? history : [] });
    } catch (err) {
      setError(err.message || "Không tải được lịch sử cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  const openArchiveModal = (item) => {
    setFormData({ reason: "" });
    setModal({ type: "archive", item });
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

  const handleSubmitFlight = async (event) => {
    event.preventDefault();
    if (!modal) return;

    const validationMessage = validateFlightForm(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = normalizeFlightPayload(formData);
      if (modal.mode === "edit") {
        await capNhatChuyenBay(modal.item.maLichTrinh, payload);
        setSuccess("Cập nhật chuyến bay thành công.");
      } else {
        await themChuyenBay(payload);
        setSuccess("Thêm chuyến bay thành công.");
      }
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Không lưu được chuyến bay.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!modal) return;
    const reason = formData.reason?.trim();
    if (!reason) {
      setError("Vui lòng nhập lý do lưu trữ chuyến bay.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await luuTruChuyenBay(modal.item.maLichTrinh, reason);
      setSuccess("Đã lưu trữ chuyến bay thành công.");
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Lưu trữ chuyến bay thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activePage="flights" onNavigate={onNavigate}>
      <section className="flight-admin-page">
        <header className="flight-admin-header">
          <div className="flight-admin-header__content">
            <span className="flight-admin-header__icon">
              <i className="fa-solid fa-plane" aria-hidden="true" />
            </span>
            <div>
              <h1>Quản lý chuyến bay</h1>
              <p>Quản lý thông tin chuyến bay đến và đi tại sân bay quốc tế Đà Nẵng.</p>
            </div>
          </div>
          <div className="flight-admin-header__actions">
            <button className="flight-admin-button flight-admin-button--primary" type="button" onClick={openCreateModal}>
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Thêm chuyến bay
            </button>
            <button className="flight-admin-button flight-admin-button--secondary" type="button" onClick={reloadAll}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              Làm mới
            </button>
          </div>
        </header>

        {(error || success) && (
          <div className={error ? "flight-admin-alert flight-admin-alert--error" : "flight-admin-alert flight-admin-alert--success"}>
            <i className={error ? "fa-solid fa-circle-xmark" : "fa-solid fa-circle-check"} aria-hidden="true" />
            <span>{error || success}</span>
          </div>
        )}

        <section className="flight-admin-stats" aria-label="Thống kê chuyến bay">
          {MAIN_STAT_CARDS.map((card) => (
            <article className={`flight-admin-stat flight-admin-stat--${card.tone}`} key={card.key}>
              <span><i className={card.icon} aria-hidden="true" /></span>
              <div>
                <p>{card.label}</p>
                <strong>{getStatValue(statistics, card.key)}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="flight-admin-panel">
          <div className="flight-admin-panel__header">
            <div>
              <h2>Danh sách chuyến bay</h2>
              <p>{rows.length} chuyến bay đang hiển thị</p>
            </div>
          </div>

          <div className="flight-admin-filters">
            <label className="flight-admin-field flight-admin-field--wide">
              <span>Tìm kiếm</span>
              <input name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Số hiệu, hãng hàng không, điểm đi, điểm đến" />
            </label>
            <label className="flight-admin-field">
              <span>Loại chuyến bay</span>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {flightTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Trạng thái</span>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {visibleStatuses.map((status) => <option key={status} value={status}>{status === "Đã xóa" ? "Đã lưu trữ" : status}</option>)}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Hãng hàng không</span>
              <select name="airline" value={filters.airline} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {airlines.map((airline) => (
                  <option key={airline.maHangHangKhong} value={airline.maHangHangKhong}>
                    {airline.maHang} - {airline.tenHangHangKhong}
                  </option>
                ))}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Ngày bay</span>
              <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
            </label>
            <label className="flight-admin-field">
              <span>Nhà ga</span>
              <input name="terminal" value={filters.terminal} onChange={handleFilterChange} placeholder="Ví dụ: Terminal 1" />
            </label>
            <label className="flight-admin-field">
              <span>Cổng</span>
              <input name="gate" value={filters.gate} onChange={handleFilterChange} placeholder="Ví dụ: G01" />
            </label>
            <label className="flight-admin-check">
              <input type="checkbox" name="includeArchived" checked={filters.includeArchived} onChange={handleFilterChange} />
              <span>Hiển thị chuyến bay đã lưu trữ</span>
            </label>
            <div className="flight-admin-filter-actions">
              <button className="flight-admin-button flight-admin-button--primary" type="button" onClick={handleApplyFilters}>
                <i className="fa-solid fa-filter" aria-hidden="true" />
                Lọc
              </button>
              <button className="flight-admin-button flight-admin-button--secondary" type="button" onClick={handleResetFilters}>
                <i className="fa-solid fa-filter-circle-xmark" aria-hidden="true" />
                Xóa bộ lọc
              </button>
            </div>
          </div>

          <div className="flight-admin-table-wrap">
            {loading ? (
              <div className="flight-admin-state">
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="flight-admin-state">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <span>Không có chuyến bay phù hợp.</span>
              </div>
            ) : (
              <FlightTable
                rows={rows}
                onView={openDetailModal}
                onEdit={openEditModal}
                onHistory={openHistoryModal}
                onArchive={openArchiveModal}
              />
            )}
          </div>
        </section>

        {modal?.type === "form" && (
          <FlightFormModal
            modal={modal}
            formData={formData}
            airlines={airlines}
            flightTypes={flightTypes}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onSubmit={handleSubmitFlight}
          />
        )}

        {modal?.type === "detail" && (
          <DetailModal detail={modal.detail} onClose={closeModal} />
        )}

        {modal?.type === "history" && (
          <HistoryModal item={modal.item} history={modal.history} onClose={closeModal} />
        )}

        {modal?.type === "archive" && (
          <ArchiveModal
            item={modal.item}
            formData={formData}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onArchive={handleArchive}
          />
        )}
      </section>
    </AdminLayout>
  );
}

function FlightTable({ rows, onView, onEdit, onHistory, onArchive }) {
  return (
    <table className="flight-admin-table">
      <thead>
        <tr>
          <th>Số hiệu chuyến bay</th>
          <th>Hãng hàng không</th>
          <th>Loại</th>
          <th>Điểm đi</th>
          <th>Điểm đến</th>
          <th>Ngày bay</th>
          <th>Giờ dự kiến</th>
          <th>Giờ ước tính</th>
          <th>Trạng thái</th>
          <th>Số phút chậm</th>
          <th>Cổng</th>
          <th>Băng chuyền</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.maLichTrinh}>
            <td className="flight-admin-code">{row.soHieuChuyenBay}</td>
            <td>{displayValue(row.tenHangHangKhong)}</td>
            <td><span className="flight-admin-badge">{displayValue(row.loaiChuyenBay)}</span></td>
            <td>{displayValue(row.diemDi)}</td>
            <td>{displayValue(row.diemDen)}</td>
            <td>{formatDate(row.ngayBay)}</td>
            <td>{formatDateTime(primaryScheduledTime(row))}</td>
            <td>{formatDateTime(primaryEstimatedTime(row))}</td>
            <td><span className={statusClass(row.trangThaiHienTai)}>{displayStatus(row.trangThaiHienTai)}</span></td>
            <td>{displayDelay(row.soPhutCham)}</td>
            <td>{row.tenCong || "Chưa phân công"}</td>
            <td>{row.tenBangChuyenHanhLy || "Chưa phân công"}</td>
            <td>
              <div className="flight-admin-actions">
                <button type="button" title="Xem" aria-label="Xem" onClick={() => onView(row)}>
                  <i className="fa-solid fa-eye" aria-hidden="true" />
                </button>
                <button type="button" title="Sửa" aria-label="Sửa" onClick={() => onEdit(row)}>
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                </button>
                <button type="button" title="Lịch sử" aria-label="Lịch sử" onClick={() => onHistory(row)}>
                  <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                </button>
                {canArchive(row) && (
                  <button className="flight-admin-actions__danger" type="button" title="Lưu trữ" aria-label="Lưu trữ" onClick={() => onArchive(row)}>
                    <i className="fa-solid fa-box-archive" aria-hidden="true" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FlightFormModal({ modal, formData, airlines, flightTypes, saving, onChange, onClose, onSubmit }) {
  const isEdit = modal.mode === "edit";
  return (
    <Modal title={isEdit ? "Sửa chuyến bay" : "Thêm chuyến bay"} onClose={onClose} wide>
      <form onSubmit={onSubmit}>
        <div className="flight-admin-modal__section">
          <h4>Thông tin chuyến bay</h4>
          <div className="flight-admin-modal__body">
            <label className="flight-admin-field">
              <span>Số hiệu chuyến bay</span>
              <input name="soHieuChuyenBay" value={formData.soHieuChuyenBay || ""} onChange={onChange} required maxLength={20} />
            </label>
            <label className="flight-admin-field">
              <span>Hãng hàng không</span>
              <select name="maHangHangKhong" value={formData.maHangHangKhong || ""} onChange={onChange} required>
                <option value="">Chọn hãng hàng không</option>
                {airlines.map((airline) => (
                  <option key={airline.maHangHangKhong} value={airline.maHangHangKhong}>
                    {airline.maHang} - {airline.tenHangHangKhong}
                  </option>
                ))}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Loại chuyến bay</span>
              <select name="loaiChuyenBay" value={formData.loaiChuyenBay || ""} onChange={onChange} required>
                <option value="">Chọn loại</option>
                {flightTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Điểm đi</span>
              <input name="diemDi" value={formData.diemDi || ""} onChange={onChange} required maxLength={100} />
            </label>
            <label className="flight-admin-field">
              <span>Điểm đến</span>
              <input name="diemDen" value={formData.diemDen || ""} onChange={onChange} required maxLength={100} />
            </label>
          </div>
        </div>

        <div className="flight-admin-modal__section">
          <h4>Thông tin lịch trình</h4>
          <div className="flight-admin-modal__body">
            <label className="flight-admin-field">
              <span>Ngày bay</span>
              <input type="date" name="ngayBay" value={formData.ngayBay || ""} onChange={onChange} required />
            </label>
            <label className="flight-admin-field">
              <span>Giờ dự kiến khởi hành</span>
              <input type="datetime-local" name="gioDuKienKhoiHanh" value={formData.gioDuKienKhoiHanh || ""} onChange={onChange} required />
            </label>
            <label className="flight-admin-field">
              <span>Giờ dự kiến hạ cánh</span>
              <input type="datetime-local" name="gioDuKienHaCanh" value={formData.gioDuKienHaCanh || ""} onChange={onChange} required />
            </label>
            {isEdit && (
              <>
                <label className="flight-admin-field">
                  <span>Giờ ước tính khởi hành</span>
                  <input type="datetime-local" name="gioUocTinhKhoiHanh" value={formData.gioUocTinhKhoiHanh || ""} onChange={onChange} />
                </label>
                <label className="flight-admin-field">
                  <span>Giờ ước tính hạ cánh</span>
                  <input type="datetime-local" name="gioUocTinhHaCanh" value={formData.gioUocTinhHaCanh || ""} onChange={onChange} />
                </label>
              </>
            )}
          </div>
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel={isEdit ? "Cập nhật" : "Lưu"} />
      </form>
    </Modal>
  );
}

function DetailModal({ detail, onClose }) {
  const flight = detail?.thongTinChuyenBay || {};
  return (
    <Modal title={`Chi tiết ${flight.soHieuChuyenBay || "chuyến bay"}`} onClose={onClose} wide>
      <div className="flight-admin-detail">
        <DetailSection title="Thông tin chuyến bay" fields={flightInfoFields(flight)} />
        <DetailSection title="Thông tin lịch trình" fields={scheduleFields(flight)} />
        <DetailSection title="Thông tin điều phối" fields={assignmentFields(flight)} />
        <section>
          <h3>Lịch sử cập nhật gần nhất</h3>
          <HistoryList items={detail?.lichSuCapNhatGanDay || []} compact />
        </section>
      </div>
      <div className="flight-admin-modal__footer">
        <button className="flight-admin-button flight-admin-button--primary" type="button" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}

function DetailSection({ title, fields }) {
  return (
    <section>
      <h3>{title}</h3>
      <div className="flight-admin-detail-grid">
        {fields.map((item) => (
          <div className="flight-admin-detail-item" key={item.label}>
            <span>{item.label}</span>
            <strong>{displayValue(item.value)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryModal({ item, history, onClose }) {
  return (
    <Modal title={`Lịch sử ${item.soHieuChuyenBay}`} onClose={onClose} wide>
      <div className="flight-admin-history">
        <HistoryList items={history} />
      </div>
      <div className="flight-admin-modal__footer">
        <button className="flight-admin-button flight-admin-button--primary" type="button" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}

function HistoryList({ items, compact = false }) {
  if (!items.length) {
    return <p className="flight-admin-empty-text">Chưa có lịch sử cập nhật cho chuyến bay này.</p>;
  }

  if (compact) {
    return (
      <div className="flight-admin-list">
        {items.map((item) => (
          <article key={item.maLichSuCapNhat}>
            <strong>{displayValue(item.trangThaiCu)} → {displayValue(item.trangThaiMoi)}</strong>
            <p>{displayValue(item.noiDungCapNhat || item.lyDoCapNhat)}</p>
            <span>{displayValue(item.tenDangNhap)} · {formatDateTime(item.thoiGianCapNhat)}</span>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="flight-admin-history-table-wrap">
      <table className="flight-admin-history-table">
        <thead>
          <tr>
            <th>Thời gian cập nhật</th>
            <th>Người cập nhật</th>
            <th>Trạng thái cũ</th>
            <th>Trạng thái mới</th>
            <th>Giờ ước tính cũ</th>
            <th>Giờ ước tính mới</th>
            <th>Số phút chậm</th>
            <th>Lý do cập nhật</th>
            <th>Nội dung cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.maLichSuCapNhat}>
              <td>{formatDateTime(item.thoiGianCapNhat)}</td>
              <td>{displayValue(item.tenDangNhap)}</td>
              <td>{displayValue(item.trangThaiCu)}</td>
              <td>{displayValue(item.trangThaiMoi)}</td>
              <td>{formatDateTime(item.gioUocTinhCu)}</td>
              <td>{formatDateTime(item.gioUocTinhMoi)}</td>
              <td>{item.soPhutChamMoi ?? 0}</td>
              <td>{displayValue(item.lyDoCapNhat)}</td>
              <td>{displayValue(item.noiDungCapNhat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArchiveModal({ item, formData, saving, onChange, onClose, onArchive }) {
  const disabled = saving || !formData.reason?.trim();
  return (
    <Modal title="Lưu trữ chuyến bay" onClose={onClose}>
      <div className="flight-admin-delete">
        <i className="fa-solid fa-box-archive" aria-hidden="true" />
        <p>Lưu trữ chuyến bay <strong>{item.soHieuChuyenBay}</strong> khi dữ liệu nhập sai, trùng hoặc không còn hợp lệ.</p>
        <label className="flight-admin-field">
          <span>Lý do lưu trữ</span>
          <textarea name="reason" value={formData.reason || ""} onChange={onChange} rows={3} required />
        </label>
      </div>
      <div className="flight-admin-modal__footer">
        <button className="flight-admin-button flight-admin-button--secondary" type="button" onClick={onClose} disabled={saving}>Hủy</button>
        <button className="flight-admin-button flight-admin-button--danger" type="button" onClick={onArchive} disabled={disabled}>
          <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-box-archive"} aria-hidden="true" />
          Lưu trữ
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="flight-admin-modal-backdrop" role="presentation">
      <div className={wide ? "flight-admin-modal flight-admin-modal--wide" : "flight-admin-modal"} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flight-admin-modal__header">
          <h3>{title}</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ saving, onClose, saveLabel }) {
  return (
    <div className="flight-admin-modal__footer">
      <button className="flight-admin-button flight-admin-button--secondary" type="button" onClick={onClose} disabled={saving}>Hủy</button>
      <button className="flight-admin-button flight-admin-button--primary" type="submit" disabled={saving}>
        <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk"} aria-hidden="true" />
        {saveLabel}
      </button>
    </div>
  );
}

function createEmptyFlightForm(airlines, flightTypes) {
  return {
    maHangHangKhong: airlines[0]?.maHangHangKhong || "",
    soHieuChuyenBay: "",
    loaiChuyenBay: flightTypes[0] || "",
    diemDi: "",
    diemDen: "",
    ngayBay: "",
    gioDuKienKhoiHanh: "",
    gioDuKienHaCanh: "",
    gioUocTinhKhoiHanh: "",
    gioUocTinhHaCanh: "",
  };
}

function mapFlightToForm(item) {
  return {
    maHangHangKhong: item.maHangHangKhong || "",
    soHieuChuyenBay: item.soHieuChuyenBay || "",
    loaiChuyenBay: item.loaiChuyenBay || "",
    diemDi: item.diemDi || "",
    diemDen: item.diemDen || "",
    ngayBay: item.ngayBay || "",
    gioDuKienKhoiHanh: normalizeInputDateTime(item.gioDuKienKhoiHanh),
    gioDuKienHaCanh: normalizeInputDateTime(item.gioDuKienHaCanh),
    gioUocTinhKhoiHanh: normalizeInputDateTime(item.gioUocTinhKhoiHanh),
    gioUocTinhHaCanh: normalizeInputDateTime(item.gioUocTinhHaCanh),
  };
}

function normalizeFlightPayload(data) {
  return {
    maHangHangKhong: data.maHangHangKhong || "",
    soHieuChuyenBay: data.soHieuChuyenBay?.trim() || "",
    loaiChuyenBay: data.loaiChuyenBay || "",
    diemDi: data.diemDi?.trim() || "",
    diemDen: data.diemDen?.trim() || "",
    ngayBay: data.ngayBay || "",
    gioDuKienKhoiHanh: data.gioDuKienKhoiHanh || null,
    gioDuKienHaCanh: data.gioDuKienHaCanh || null,
    gioUocTinhKhoiHanh: data.gioUocTinhKhoiHanh || null,
    gioUocTinhHaCanh: data.gioUocTinhHaCanh || null,
  };
}

function validateFlightForm(data) {
  if (!data.soHieuChuyenBay?.trim()) return "Số hiệu chuyến bay không được để trống.";
  if (!data.maHangHangKhong) return "Vui lòng chọn hãng hàng không.";
  if (!["Đến", "Đi"].includes(data.loaiChuyenBay)) return "Loại chuyến bay chỉ được là Đến hoặc Đi.";
  if (!data.diemDi?.trim() || !data.diemDen?.trim()) return "Điểm đi và điểm đến không được để trống.";
  if (data.diemDi.trim().toLowerCase() === data.diemDen.trim().toLowerCase()) return "Điểm đi và điểm đến không được giống nhau.";
  if (!data.ngayBay) return "Ngày bay không được để trống.";
  if (!data.gioDuKienKhoiHanh || !data.gioDuKienHaCanh) return "Giờ dự kiến không được để trống.";
  if (new Date(data.gioDuKienHaCanh) <= new Date(data.gioDuKienKhoiHanh)) return "Giờ hạ cánh phải lớn hơn giờ khởi hành.";
  if (data.gioUocTinhKhoiHanh && data.gioUocTinhHaCanh && new Date(data.gioUocTinhHaCanh) <= new Date(data.gioUocTinhKhoiHanh)) {
    return "Giờ ước tính hạ cánh phải lớn hơn giờ ước tính khởi hành.";
  }
  return "";
}

function normalizeInputDateTime(value) {
  return value ? value.slice(0, 16) : "";
}

function displayValue(value) {
  return value === null || value === undefined || value === "" ? "Chưa cập nhật" : value;
}

function displayStatus(status) {
  return status === "Đã xóa" ? "Đã lưu trữ" : displayValue(status);
}

function displayDelay(minutes) {
  return minutes && minutes > 0 ? `${minutes} phút` : "Đúng giờ";
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";
  const [datePart, timePart = ""] = value.split("T");
  const formattedDate = formatDate(datePart);
  return timePart ? `${formattedDate} ${timePart.slice(0, 5)}` : formattedDate;
}

function primaryScheduledTime(row) {
  return row.loaiChuyenBay === "Đến" ? row.gioDuKienHaCanh : row.gioDuKienKhoiHanh;
}

function primaryEstimatedTime(row) {
  return row.loaiChuyenBay === "Đến" ? row.gioUocTinhHaCanh : row.gioUocTinhKhoiHanh;
}

function canArchive(row) {
  return row.trangThaiHienTai !== "Hoàn thành" && row.trangThaiHienTai !== "Đã xóa";
}

function getStatValue(statistics, key) {
  if (key === "soDangKhaiThac") {
    return statistics.soDangKhaiThac ?? ((statistics.soDaLenLich ?? 0) + (statistics.soDangLamThuTuc ?? 0) + (statistics.soDangBay ?? 0) + (statistics.soChamChuyen ?? 0));
  }
  if (key === "soChamHuy") {
    return statistics.soChamHuy ?? ((statistics.soChamChuyen ?? 0) + (statistics.soHuyChuyen ?? 0));
  }
  return statistics?.[key] ?? 0;
}

function statusClass(status) {
  const map = {
    "Đã lên lịch": "flight-admin-status flight-admin-status--scheduled",
    "Đang làm thủ tục": "flight-admin-status flight-admin-status--checkin",
    "Đang bay": "flight-admin-status flight-admin-status--flying",
    "Chậm chuyến": "flight-admin-status flight-admin-status--delayed",
    "Hủy chuyến": "flight-admin-status flight-admin-status--cancelled",
    "Hoàn thành": "flight-admin-status flight-admin-status--completed",
    "Đã xóa": "flight-admin-status flight-admin-status--deleted",
  };
  return map[status] || "flight-admin-status";
}

function flightInfoFields(flight) {
  return [
    { label: "Mã chuyến bay", value: flight.maChuyenBay },
    { label: "Số hiệu chuyến bay", value: flight.soHieuChuyenBay },
    { label: "Hãng hàng không", value: flight.tenHangHangKhong },
    { label: "Loại chuyến bay", value: flight.loaiChuyenBay },
    { label: "Điểm đi", value: flight.diemDi },
    { label: "Điểm đến", value: flight.diemDen },
  ];
}

function scheduleFields(flight) {
  return [
    { label: "Mã lịch trình", value: flight.maLichTrinh },
    { label: "Ngày bay", value: formatDate(flight.ngayBay) },
    { label: "Giờ dự kiến khởi hành", value: formatDateTime(flight.gioDuKienKhoiHanh) },
    { label: "Giờ dự kiến hạ cánh", value: formatDateTime(flight.gioDuKienHaCanh) },
    { label: "Giờ ước tính khởi hành", value: formatDateTime(flight.gioUocTinhKhoiHanh) },
    { label: "Giờ ước tính hạ cánh", value: formatDateTime(flight.gioUocTinhHaCanh) },
    { label: "Giờ thực tế khởi hành", value: formatDateTime(flight.gioThucTeKhoiHanh) },
    { label: "Giờ thực tế hạ cánh", value: formatDateTime(flight.gioThucTeHaCanh) },
    { label: "Trạng thái hiện tại", value: displayStatus(flight.trangThaiHienTai) },
    { label: "Số phút chậm", value: flight.soPhutCham ?? 0 },
    { label: "Lý do chậm/hủy", value: flight.lyDoChamHoacHuy },
  ];
}

function assignmentFields(flight) {
  return [
    { label: "Cổng hiện tại", value: flight.tenCong || "Chưa phân công" },
    { label: "Nhà ga", value: flight.tenNhaGa || flight.tenNhaGaBangChuyen },
    { label: "Băng chuyền hành lý", value: flight.tenBangChuyenHanhLy || "Chưa phân công" },
    { label: "Bắt đầu dùng cổng", value: formatDateTime(flight.thoiGianBatDauSuDungCong) },
    { label: "Kết thúc dùng cổng", value: formatDateTime(flight.thoiGianKetThucSuDungCong) },
    { label: "Bắt đầu dùng băng chuyền", value: formatDateTime(flight.thoiGianBatDauSuDungBangChuyen) },
    { label: "Kết thúc dùng băng chuyền", value: formatDateTime(flight.thoiGianKetThucSuDungBangChuyen) },
  ];
}

export default FlightManagementPage;
