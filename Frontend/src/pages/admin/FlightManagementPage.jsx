import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatChuyenBay,
  capNhatTinhHinhChuyenBay,
  layChiTietChuyenBay,
  layDanhSachChuyenBay,
  layHangHangKhongOptions,
  layLoaiChuyenBay,
  layThongKeChuyenBay,
  layTrangThaiChuyenBay,
  themChuyenBay,
  xoaMemChuyenBay,
} from "../../api/chuyenBayApi.js";
import "../../styles/admin/FlightManagementPage.css";

const EMPTY_FILTERS = {
  keyword: "",
  loaiChuyenBay: "",
  trangThai: "",
  maHangHangKhong: "",
  tuNgay: "",
  denNgay: "",
};

const STAT_CARDS = [
  { key: "tongChuyenBay", label: "Tổng chuyến bay", icon: "fa-solid fa-plane" },
  { key: "soChuyenBayDen", label: "Chuyến bay đến", icon: "fa-solid fa-plane-arrival" },
  { key: "soChuyenBayDi", label: "Chuyến bay đi", icon: "fa-solid fa-plane-departure" },
  { key: "soDaLenLich", label: "Đã lên lịch", icon: "fa-solid fa-calendar-check" },
  { key: "soDangLamThuTuc", label: "Đang làm thủ tục", icon: "fa-solid fa-clipboard-check" },
  { key: "soDangBay", label: "Đang bay", icon: "fa-solid fa-route" },
  { key: "soChamChuyen", label: "Chậm chuyến", icon: "fa-solid fa-clock" },
  { key: "soHuyChuyen", label: "Hủy chuyến", icon: "fa-solid fa-ban" },
  { key: "soHoanThanh", label: "Hoàn thành", icon: "fa-solid fa-circle-check" },
];

function FlightManagementPage({ onNavigate }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [airlines, setAirlines] = useState([]);
  const [flightTypes, setFlightTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});

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
    setStatuses(Array.isArray(statusOptions) ? statusOptions : []);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const data = await layDanhSachChuyenBay(appliedFilters);
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [appliedFilters]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCommonData() {
      try {
        const [stats, airlineOptions, typeOptions, statusOptions] = await Promise.all([
          layThongKeChuyenBay(),
          layHangHangKhongOptions(),
          layLoaiChuyenBay(),
          layTrangThaiChuyenBay(),
        ]);
        if (!cancelled) {
          setStatistics(stats || {});
          setAirlines(Array.isArray(airlineOptions) ? airlineOptions : []);
          setFlightTypes(Array.isArray(typeOptions) ? typeOptions : []);
          setStatuses(Array.isArray(statusOptions) ? statusOptions : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không tải được dữ liệu chuyến bay.");
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
        const data = await layDanhSachChuyenBay(appliedFilters);
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
          setLoading(false);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
          setError(err.message || "Không tải được danh sách chuyến bay.");
        }
      }
    }

    fetchRows();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters]);

  const reloadAll = async () => {
    setError("");
    setSuccess("");
    await Promise.all([loadCommonData(), loadRows()]);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleApplyFilters = () => {
    setLoading(true);
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setLoading(true);
  };

  const openCreateModal = () => {
    setFormData(createEmptyFlightForm(airlines, flightTypes));
    setModal({ type: "flight-form", mode: "create", item: null });
  };

  const openEditModal = (item) => {
    setFormData(mapFlightToForm(item));
    setModal({ type: "flight-form", mode: "edit", item });
  };

  const openStatusModal = (item) => {
    setFormData({
      maTaiKhoan: "",
      trangThaiMoi: item.trangThaiHienTai || statuses[0] || "",
      gioUocTinhKhoiHanh: item.gioUocTinhKhoiHanh || "",
      gioUocTinhHaCanh: item.gioUocTinhHaCanh || "",
      gioThucTeKhoiHanh: item.gioThucTeKhoiHanh || "",
      gioThucTeHaCanh: item.gioThucTeHaCanh || "",
      lyDoChamHoacHuy: "",
    });
    setModal({ type: "status-form", item });
  };

  const openDeleteModal = (item) => {
    setFormData({ lyDoXoa: "" });
    setModal({ type: "delete", item });
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

  const handleSubmitStatus = async (event) => {
    event.preventDefault();
    if (!modal) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await capNhatTinhHinhChuyenBay(modal.item.maLichTrinh, normalizeStatusPayload(formData));
      setSuccess("Cập nhật tình hình chuyến bay thành công.");
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Không cập nhật được tình hình chuyến bay.");
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
      await xoaMemChuyenBay(modal.item.maLichTrinh, formData.lyDoXoa || "");
      setSuccess("Đã xóa mềm lịch trình chuyến bay thành công.");
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Không xóa mềm được chuyến bay.");
    } finally {
      setSaving(false);
    }
  };

  const statusWarning = useMemo(() => getStatusWarning(formData), [formData]);

  return (
    <AdminLayout activePage="flights" onNavigate={onNavigate}>
      <section className="flight-admin-page">
        <header className="flight-admin-header">
          <div className="flight-admin-header__content">
            <span className="flight-admin-header__icon">
              <i className="fa-solid fa-plane" aria-hidden="true" />
            </span>
            <div>
              <h1>Chuyến bay</h1>
              <p>Quản lý và cập nhật tình hình các chuyến bay đến/đi tại sân bay quốc tế Đà Nẵng.</p>
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
          {STAT_CARDS.map((card) => (
            <article className="flight-admin-stat" key={card.key}>
              <span><i className={card.icon} aria-hidden="true" /></span>
              <div>
                <p>{card.label}</p>
                <strong>{statistics?.[card.key] ?? 0}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="flight-admin-panel">
          <div className="flight-admin-panel__header">
            <div>
              <h2>Danh sách chuyến bay</h2>
              <p>{rows.length} lịch trình đang hiển thị</p>
            </div>
          </div>

          <div className="flight-admin-filters">
            <label className="flight-admin-field flight-admin-field--wide">
              <span>Tìm kiếm</span>
              <input name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Số hiệu, hãng bay, điểm đi, điểm đến" />
            </label>
            <label className="flight-admin-field">
              <span>Loại</span>
              <select name="loaiChuyenBay" value={filters.loaiChuyenBay} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {flightTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Trạng thái</span>
              <select name="trangThai" value={filters.trangThai} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Hãng hàng không</span>
              <select name="maHangHangKhong" value={filters.maHangHangKhong} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {airlines.map((airline) => (
                  <option key={airline.maHangHangKhong} value={airline.maHangHangKhong}>
                    {airline.maHang} - {airline.tenHangHangKhong}
                  </option>
                ))}
              </select>
            </label>
            <label className="flight-admin-field">
              <span>Từ ngày</span>
              <input type="date" name="tuNgay" value={filters.tuNgay} onChange={handleFilterChange} />
            </label>
            <label className="flight-admin-field">
              <span>Đến ngày</span>
              <input type="date" name="denNgay" value={filters.denNgay} onChange={handleFilterChange} />
            </label>
            <div className="flight-admin-filter-actions">
              <button className="flight-admin-button flight-admin-button--primary" type="button" onClick={handleApplyFilters}>
                <i className="fa-solid fa-filter" aria-hidden="true" />
                Lọc
              </button>
              <button className="flight-admin-button flight-admin-button--secondary" type="button" onClick={handleResetFilters}>
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
                Làm mới
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
                onStatus={openStatusModal}
                onDelete={openDeleteModal}
              />
            )}
          </div>
        </section>

        {modal?.type === "flight-form" && (
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

        {modal?.type === "status-form" && (
          <StatusModal
            formData={formData}
            statuses={statuses}
            warning={statusWarning}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onSubmit={handleSubmitStatus}
          />
        )}

        {modal?.type === "detail" && (
          <DetailModal detail={modal.detail} onClose={closeModal} />
        )}

        {modal?.type === "delete" && (
          <DeleteModal
            item={modal.item}
            formData={formData}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onDelete={handleDelete}
          />
        )}
      </section>
    </AdminLayout>
  );
}

function FlightTable({ rows, onView, onEdit, onStatus, onDelete }) {
  return (
    <table className="flight-admin-table">
      <thead>
        <tr>
          <th>Số hiệu chuyến bay</th>
          <th>Hãng bay</th>
          <th>Loại</th>
          <th>Điểm đi</th>
          <th>Điểm đến</th>
          <th>Ngày bay</th>
          <th>Giờ dự kiến khởi hành</th>
          <th>Giờ dự kiến hạ cánh</th>
          <th>Giờ ước tính</th>
          <th>Trạng thái</th>
          <th>Số phút chậm</th>
          <th>Cổng</th>
          <th>Băng chuyền</th>
          <th>Hành động</th>
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
            <td>{displayValue(row.ngayBay)}</td>
            <td>{displayValue(row.gioDuKienKhoiHanh)}</td>
            <td>{displayValue(row.gioDuKienHaCanh)}</td>
            <td>
              <span>{displayValue(row.gioUocTinhKhoiHanh)}</span>
              <small>{displayValue(row.gioUocTinhHaCanh)}</small>
            </td>
            <td><span className={statusClass(row.trangThaiHienTai)}>{displayValue(row.trangThaiHienTai)}</span></td>
            <td>{row.soPhutCham ?? 0}</td>
            <td>{displayValue(row.tenCong)}</td>
            <td>{displayValue(row.tenBangChuyenHanhLy)}</td>
            <td>
              <div className="flight-admin-actions">
                <button type="button" title="Xem chi tiết" aria-label="Xem chi tiết" onClick={() => onView(row)}>
                  <i className="fa-solid fa-eye" aria-hidden="true" />
                </button>
                <button type="button" title="Sửa" aria-label="Sửa" onClick={() => onEdit(row)}>
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                </button>
                <button type="button" title="Cập nhật tình hình" aria-label="Cập nhật tình hình" onClick={() => onStatus(row)}>
                  <i className="fa-solid fa-rotate" aria-hidden="true" />
                </button>
                <button className="flight-admin-actions__danger" type="button" title="Xóa mềm" aria-label="Xóa mềm" onClick={() => onDelete(row)}>
                  <i className="fa-solid fa-trash" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FlightFormModal({ modal, formData, airlines, flightTypes, saving, onChange, onClose, onSubmit }) {
  const title = modal.mode === "edit" ? "Sửa chuyến bay" : "Thêm chuyến bay";
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="flight-admin-modal__body">
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
            <span>Số hiệu chuyến bay</span>
            <input name="soHieuChuyenBay" value={formData.soHieuChuyenBay || ""} onChange={onChange} required maxLength={20} />
          </label>
          <label className="flight-admin-field">
            <span>Loại chuyến bay</span>
            <select name="loaiChuyenBay" value={formData.loaiChuyenBay || ""} onChange={onChange} required>
              <option value="">Chọn loại</option>
              {flightTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="flight-admin-field">
            <span>Ngày bay</span>
            <input type="date" name="ngayBay" value={formData.ngayBay || ""} onChange={onChange} required />
          </label>
          <label className="flight-admin-field">
            <span>Điểm đi</span>
            <input name="diemDi" value={formData.diemDi || ""} onChange={onChange} required maxLength={100} />
          </label>
          <label className="flight-admin-field">
            <span>Điểm đến</span>
            <input name="diemDen" value={formData.diemDen || ""} onChange={onChange} required maxLength={100} />
          </label>
          <label className="flight-admin-field">
            <span>Giờ dự kiến khởi hành</span>
            <input type="datetime-local" name="gioDuKienKhoiHanh" value={formData.gioDuKienKhoiHanh || ""} onChange={onChange} required />
          </label>
          <label className="flight-admin-field">
            <span>Giờ dự kiến hạ cánh</span>
            <input type="datetime-local" name="gioDuKienHaCanh" value={formData.gioDuKienHaCanh || ""} onChange={onChange} required />
          </label>
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Lưu" />
      </form>
    </Modal>
  );
}

function StatusModal({ formData, statuses, warning, saving, onChange, onClose, onSubmit }) {
  return (
    <Modal title="Cập nhật tình hình chuyến bay" onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="flight-admin-modal__body">
          <label className="flight-admin-field">
            <span>Mã tài khoản cập nhật</span>
            <input name="maTaiKhoan" value={formData.maTaiKhoan || ""} onChange={onChange} required placeholder="Ví dụ: TK01" />
          </label>
          <label className="flight-admin-field">
            <span>Trạng thái mới</span>
            <select name="trangThaiMoi" value={formData.trangThaiMoi || ""} onChange={onChange} required>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="flight-admin-field">
            <span>Giờ ước tính khởi hành</span>
            <input type="datetime-local" name="gioUocTinhKhoiHanh" value={formData.gioUocTinhKhoiHanh || ""} onChange={onChange} />
          </label>
          <label className="flight-admin-field">
            <span>Giờ ước tính hạ cánh</span>
            <input type="datetime-local" name="gioUocTinhHaCanh" value={formData.gioUocTinhHaCanh || ""} onChange={onChange} />
          </label>
          <label className="flight-admin-field">
            <span>Giờ thực tế khởi hành</span>
            <input type="datetime-local" name="gioThucTeKhoiHanh" value={formData.gioThucTeKhoiHanh || ""} onChange={onChange} />
          </label>
          <label className="flight-admin-field">
            <span>Giờ thực tế hạ cánh</span>
            <input type="datetime-local" name="gioThucTeHaCanh" value={formData.gioThucTeHaCanh || ""} onChange={onChange} />
          </label>
          <label className="flight-admin-field flight-admin-field--full">
            <span>Lý do chậm/hủy</span>
            <textarea name="lyDoChamHoacHuy" value={formData.lyDoChamHoacHuy || ""} onChange={onChange} rows={3} />
          </label>
          {warning && (
            <div className="flight-admin-warning">
              <i className="fa-solid fa-circle-info" aria-hidden="true" />
              <span>{warning}</span>
            </div>
          )}
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Cập nhật" />
      </form>
    </Modal>
  );
}

function DetailModal({ detail, onClose }) {
  const flight = detail?.thongTinChuyenBay || {};
  return (
    <Modal title={`Chi tiết ${flight.soHieuChuyenBay || "chuyến bay"}`} onClose={onClose} wide>
      <div className="flight-admin-detail">
        <section>
          <h3>Thông tin chuyến bay</h3>
          <div className="flight-admin-detail-grid">
            {detailFields(flight).map((item) => (
              <div className="flight-admin-detail-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{displayValue(item.value)}</strong>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Lịch sử cập nhật gần đây</h3>
          {detail?.lichSuCapNhatGanDay?.length ? (
            <div className="flight-admin-list">
              {detail.lichSuCapNhatGanDay.map((item) => (
                <article key={item.maLichSuCapNhat}>
                  <strong>{displayValue(item.trangThaiCu)} → {displayValue(item.trangThaiMoi)}</strong>
                  <p>{displayValue(item.noiDungCapNhat || item.lyDoCapNhat)}</p>
                  <span>{displayValue(item.tenDangNhap)} · {displayValue(item.thoiGianCapNhat)}</span>
                </article>
              ))}
            </div>
          ) : <p className="flight-admin-empty-text">Chưa cập nhật</p>}
        </section>
        <section>
          <h3>Thông báo liên quan</h3>
          {detail?.thongBaoGanDay?.length ? (
            <div className="flight-admin-list">
              {detail.thongBaoGanDay.map((item) => (
                <article key={item.maThongBao}>
                  <strong>{displayValue(item.trangThaiMoi)}</strong>
                  <p>{displayValue(item.noiDungThongBao)}</p>
                  <span>{displayValue(item.phuongThucGui)} · {displayValue(item.trangThaiGui)} · {displayValue(item.thoiGianGui)}</span>
                </article>
              ))}
            </div>
          ) : <p className="flight-admin-empty-text">Chưa cập nhật</p>}
        </section>
      </div>
      <div className="flight-admin-modal__footer">
        <button className="flight-admin-button flight-admin-button--primary" type="button" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}

function DeleteModal({ item, formData, saving, onChange, onClose, onDelete }) {
  return (
    <Modal title="Xóa mềm chuyến bay" onClose={onClose}>
      <div className="flight-admin-delete">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        <p>Bạn có chắc muốn xóa mềm lịch trình <strong>{item.soHieuChuyenBay}</strong>?</p>
        <label className="flight-admin-field">
          <span>Lý do xóa</span>
          <textarea name="lyDoXoa" value={formData.lyDoXoa || ""} onChange={onChange} rows={3} />
        </label>
      </div>
      <div className="flight-admin-modal__footer">
        <button className="flight-admin-button flight-admin-button--secondary" type="button" onClick={onClose} disabled={saving}>Hủy</button>
        <button className="flight-admin-button flight-admin-button--danger" type="button" onClick={onDelete} disabled={saving}>
          <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-trash"} aria-hidden="true" />
          Xóa mềm
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
    gioDuKienKhoiHanh: item.gioDuKienKhoiHanh || "",
    gioDuKienHaCanh: item.gioDuKienHaCanh || "",
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
  };
}

function normalizeStatusPayload(data) {
  return {
    maTaiKhoan: data.maTaiKhoan?.trim() || "",
    trangThaiMoi: data.trangThaiMoi || "",
    gioUocTinhKhoiHanh: emptyToNull(data.gioUocTinhKhoiHanh),
    gioUocTinhHaCanh: emptyToNull(data.gioUocTinhHaCanh),
    gioThucTeKhoiHanh: emptyToNull(data.gioThucTeKhoiHanh),
    gioThucTeHaCanh: emptyToNull(data.gioThucTeHaCanh),
    lyDoChamHoacHuy: data.lyDoChamHoacHuy?.trim() || "",
  };
}

function emptyToNull(value) {
  return value ? value : null;
}

function displayValue(value) {
  return value === null || value === undefined || value === "" ? "Chưa cập nhật" : value;
}

function statusClass(status) {
  const map = {
    "Đã lên lịch": "flight-admin-status flight-admin-status--scheduled",
    "Đang làm thủ tục": "flight-admin-status flight-admin-status--checkin",
    "Đang bay": "flight-admin-status flight-admin-status--flying",
    "Đã hạ cánh": "flight-admin-status flight-admin-status--landed",
    "Hoàn thành": "flight-admin-status flight-admin-status--completed",
    "Chậm chuyến": "flight-admin-status flight-admin-status--delayed",
    "Hủy chuyến": "flight-admin-status flight-admin-status--cancelled",
    "Đã xóa": "flight-admin-status flight-admin-status--deleted",
  };
  return map[status] || "flight-admin-status";
}

function getStatusWarning(data) {
  if (["Chậm chuyến", "Hủy chuyến"].includes(data.trangThaiMoi) && !data.lyDoChamHoacHuy?.trim()) {
    return "Trạng thái chậm hoặc hủy chuyến bắt buộc nhập lý do.";
  }
  if (data.trangThaiMoi === "Đang bay" && !data.gioThucTeKhoiHanh) {
    return "Nên nhập giờ thực tế khởi hành khi chuyển sang trạng thái Đang bay.";
  }
  if (data.trangThaiMoi === "Hoàn thành" && !data.gioThucTeHaCanh) {
    return "Nên nhập giờ thực tế hạ cánh khi hoàn thành chuyến bay.";
  }
  return "";
}

function detailFields(flight) {
  return [
    { label: "Mã chuyến bay", value: flight.maChuyenBay },
    { label: "Mã lịch trình", value: flight.maLichTrinh },
    { label: "Số hiệu", value: flight.soHieuChuyenBay },
    { label: "Hãng hàng không", value: flight.tenHangHangKhong },
    { label: "Loại chuyến bay", value: flight.loaiChuyenBay },
    { label: "Điểm đi", value: flight.diemDi },
    { label: "Điểm đến", value: flight.diemDen },
    { label: "Ngày bay", value: flight.ngayBay },
    { label: "Giờ dự kiến khởi hành", value: flight.gioDuKienKhoiHanh },
    { label: "Giờ dự kiến hạ cánh", value: flight.gioDuKienHaCanh },
    { label: "Giờ ước tính khởi hành", value: flight.gioUocTinhKhoiHanh },
    { label: "Giờ ước tính hạ cánh", value: flight.gioUocTinhHaCanh },
    { label: "Giờ thực tế khởi hành", value: flight.gioThucTeKhoiHanh },
    { label: "Giờ thực tế hạ cánh", value: flight.gioThucTeHaCanh },
    { label: "Trạng thái", value: flight.trangThaiHienTai },
    { label: "Số phút chậm", value: flight.soPhutCham ?? 0 },
    { label: "Cổng hiện tại", value: flight.tenCong },
    { label: "Băng chuyền hiện tại", value: flight.tenBangChuyenHanhLy },
    { label: "Lý do chậm/hủy", value: flight.lyDoChamHoacHuy },
  ];
}

export default FlightManagementPage;
