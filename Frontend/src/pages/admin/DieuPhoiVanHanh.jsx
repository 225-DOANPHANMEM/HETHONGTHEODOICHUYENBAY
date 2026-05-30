import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  huyPhanCongBangChuyen,
  huyPhanCongCong,
  layBangChuyenKhaDung,
  layChiTietDieuPhoi,
  layCongKhaDung,
  layDanhSachLichTrinhDieuPhoi,
  layLoaiChuyenBayDieuPhoi,
  layLoaiCongDieuPhoi,
  layNhaGaOptionsDieuPhoi,
  layThongKeDieuPhoi,
  layTrangThaiChuyenBayDieuPhoi,
  phanCongBangChuyen,
  phanCongCong,
} from "../../api/dieuPhoiApi.js";
import "../../styles/admin/dieuPhoiVanHanh.css";

const EMPTY_FILTERS = {
  keyword: "",
  ngayBay: "",
  loaiChuyenBay: "",
  trangThai: "",
  tinhTrangCong: "tat-ca",
  tinhTrangBangChuyen: "tat-ca",
};

const STAT_CARDS = [
  { key: "tongLichTrinh", label: "Tổng lịch trình", icon: "fa-solid fa-plane" },
  { key: "lichTrinhDaPhanCongCong", label: "Đã phân công cổng", icon: "fa-solid fa-door-open" },
  { key: "lichTrinhChuaPhanCongCong", label: "Chưa phân công cổng", icon: "fa-solid fa-link-slash" },
  { key: "lichTrinhDaPhanCongBangChuyen", label: "Đã phân công băng chuyền", icon: "fa-solid fa-suitcase-rolling" },
  { key: "lichTrinhChuaPhanCongBangChuyen", label: "Chưa phân công băng chuyền", icon: "fa-solid fa-link-slash" },
  { key: "soCongSanSang", label: "Cổng sẵn sàng", icon: "fa-solid fa-circle-check" },
  { key: "soCongBaoTri", label: "Cổng bảo trì", icon: "fa-solid fa-screwdriver-wrench" },
  { key: "soBangChuyenSanSang", label: "Băng chuyền sẵn sàng", icon: "fa-solid fa-circle-check" },
  { key: "soBangChuyenBaoTri", label: "Băng chuyền bảo trì", icon: "fa-solid fa-screwdriver-wrench" },
];

function DieuPhoiVanHanh({ onNavigate }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [terminalOptions, setTerminalOptions] = useState([]);
  const [gateTypes, setGateTypes] = useState([]);
  const [flightTypes, setFlightTypes] = useState([]);
  const [flightStatuses, setFlightStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const activeModalType = modal?.type;
  const currentGateAssignmentId = modal?.item?.maPhanCongCong || "";
  const currentBaggageAssignmentId = modal?.item?.maPhanCongBangChuyen || "";

  const loadCommonData = useCallback(async () => {
    const [stats, terminals, gateTypeOptions, flightTypeOptions, statusOptions] = await Promise.all([
      layThongKeDieuPhoi(),
      layNhaGaOptionsDieuPhoi(),
      layLoaiCongDieuPhoi(),
      layLoaiChuyenBayDieuPhoi(),
      layTrangThaiChuyenBayDieuPhoi(),
    ]);
    setStatistics(stats || {});
    setTerminalOptions(Array.isArray(terminals) ? terminals : []);
    setGateTypes(Array.isArray(gateTypeOptions) ? gateTypeOptions : []);
    setFlightTypes(Array.isArray(flightTypeOptions) ? flightTypeOptions : []);
    setFlightStatuses(Array.isArray(statusOptions) ? statusOptions : []);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const data = await layDanhSachLichTrinhDieuPhoi(appliedFilters);
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [appliedFilters]);

  useEffect(() => {
    let cancelled = false;
    async function fetchCommon() {
      try {
        const [stats, terminals, gateTypeOptions, flightTypeOptions, statusOptions] = await Promise.all([
          layThongKeDieuPhoi(),
          layNhaGaOptionsDieuPhoi(),
          layLoaiCongDieuPhoi(),
          layLoaiChuyenBayDieuPhoi(),
          layTrangThaiChuyenBayDieuPhoi(),
        ]);
        if (!cancelled) {
          setStatistics(stats || {});
          setTerminalOptions(Array.isArray(terminals) ? terminals : []);
          setGateTypes(Array.isArray(gateTypeOptions) ? gateTypeOptions : []);
          setFlightTypes(Array.isArray(flightTypeOptions) ? flightTypeOptions : []);
          setFlightStatuses(Array.isArray(statusOptions) ? statusOptions : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Không tải được dữ liệu điều phối.");
      }
    }
    fetchCommon();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchRows() {
      try {
        const data = await layDanhSachLichTrinhDieuPhoi(appliedFilters);
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
          setLoading(false);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
          setError(err.message || "Không tải được danh sách lịch trình.");
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

  const applyFilters = () => {
    setLoading(true);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setLoading(true);
  };

  const openDetail = async (item) => {
    setSaving(true);
    setError("");
    try {
      const detail = await layChiTietDieuPhoi(item.maLichTrinh);
      setModal({ type: "detail", detail });
    } catch (err) {
      setError(err.message || "Không tải được chi tiết điều phối.");
    } finally {
      setSaving(false);
    }
  };

  const openGateModal = (item) => {
    setFormData(createGateForm(item, gateTypes));
    setModal({ type: "gate", item, available: [], loadingAvailable: false });
  };

  const openBaggageModal = (item) => {
    setFormData(createBaggageForm(item));
    setModal({ type: "baggage", item, available: [], loadingAvailable: false });
  };

  const openDeactivateModal = (item, resourceType) => {
    setModal({ type: "deactivate", item, resourceType });
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

  const loadAvailableResources = useCallback(async () => {
    if (!["gate", "baggage"].includes(activeModalType)) return;
    const start = formData.thoiGianBatDauSuDung;
    const end = formData.thoiGianKetThucSuDung;
    if (!start || !end) return;

    setModal((current) => current ? { ...current, loadingAvailable: true } : current);
    try {
      const filtersForApi = {
        thoiGianBatDau: start,
        thoiGianKetThuc: end,
        maNhaGa: formData.maNhaGa,
      };
      if (activeModalType === "gate") {
        filtersForApi.loaiCong = formData.loaiCong;
        filtersForApi.maPhanCongBoQua = currentGateAssignmentId;
        const data = await layCongKhaDung(filtersForApi);
        setModal((current) => current ? { ...current, available: Array.isArray(data) ? data : [], loadingAvailable: false } : current);
      } else {
        filtersForApi.maPhanCongBoQua = currentBaggageAssignmentId;
        const data = await layBangChuyenKhaDung(filtersForApi);
        setModal((current) => current ? { ...current, available: Array.isArray(data) ? data : [], loadingAvailable: false } : current);
      }
    } catch (err) {
      setModal((current) => current ? { ...current, available: [], loadingAvailable: false } : current);
      setError(err.message || "Không tải được danh sách tài nguyên khả dụng.");
    }
  }, [activeModalType, currentBaggageAssignmentId, currentGateAssignmentId, formData]);

  useEffect(() => {
    let timeoutId;
    if (["gate", "baggage"].includes(activeModalType) && formData.thoiGianBatDauSuDung && formData.thoiGianKetThucSuDung) {
      timeoutId = window.setTimeout(() => {
        loadAvailableResources();
      }, 250);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeModalType, loadAvailableResources, formData.thoiGianBatDauSuDung, formData.thoiGianKetThucSuDung, formData.maNhaGa, formData.loaiCong]);

  const handleAssignGate = async (event) => {
    event.preventDefault();
    if (!modal) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await phanCongCong({
        maPhanCongCong: modal.item.maPhanCongCong || null,
        maLichTrinh: modal.item.maLichTrinh,
        maCong: formData.maCong,
        loaiCong: formData.loaiCong,
        thoiGianBatDauSuDung: formData.thoiGianBatDauSuDung,
        thoiGianKetThucSuDung: formData.thoiGianKetThucSuDung,
      });
      setSuccess("Phân công cổng thành công.");
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Không phân công được cổng.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignBaggage = async (event) => {
    event.preventDefault();
    if (!modal) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await phanCongBangChuyen({
        maPhanCongBangChuyen: modal.item.maPhanCongBangChuyen || null,
        maLichTrinh: modal.item.maLichTrinh,
        maBangChuyenHanhLy: formData.maBangChuyenHanhLy,
        thoiGianBatDauSuDung: formData.thoiGianBatDauSuDung,
        thoiGianKetThucSuDung: formData.thoiGianKetThucSuDung,
      });
      setSuccess("Phân công băng chuyền thành công.");
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Không phân công được băng chuyền.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!modal) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (modal.resourceType === "gate") {
        await huyPhanCongCong(modal.item.maPhanCongCong);
        setSuccess("Đã hủy hiệu lực phân công cổng thành công.");
      } else {
        await huyPhanCongBangChuyen(modal.item.maPhanCongBangChuyen);
        setSuccess("Đã hủy hiệu lực phân công băng chuyền thành công.");
      }
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Không hủy được phân công.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activePage="dispatch" onNavigate={onNavigate}>
      <section className="dispatch-admin-page">
        <header className="dispatch-admin-header">
          <div className="dispatch-admin-header__content">
            <span className="dispatch-admin-header__icon">
              <i className="fa-solid fa-diagram-project" aria-hidden="true" />
            </span>
            <div>
              <h1>Điều phối vận hành</h1>
              <p>Phân công cổng và băng chuyền hành lý cho các lịch trình chuyến bay.</p>
            </div>
          </div>
          <button className="dispatch-admin-button dispatch-admin-button--secondary" type="button" onClick={reloadAll}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            Làm mới
          </button>
        </header>

        {(error || success) && (
          <div className={error ? "dispatch-admin-alert dispatch-admin-alert--error" : "dispatch-admin-alert dispatch-admin-alert--success"}>
            <i className={error ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-check"} aria-hidden="true" />
            <span>{error || success}</span>
          </div>
        )}

        <section className="dispatch-admin-stats">
          {STAT_CARDS.map((card) => (
            <article className="dispatch-admin-stat" key={card.key}>
              <span><i className={card.icon} aria-hidden="true" /></span>
              <div>
                <p>{card.label}</p>
                <strong>{statistics?.[card.key] ?? 0}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="dispatch-admin-panel">
          <div className="dispatch-admin-panel__header">
            <div>
              <h2>Bộ lọc điều phối</h2>
              <p>{rows.length} lịch trình đang hiển thị</p>
            </div>
          </div>

          <div className="dispatch-admin-filters">
            <label className="dispatch-admin-field dispatch-admin-field--wide">
              <span>Tìm kiếm</span>
              <input name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Số hiệu, hãng bay, điểm đi, điểm đến" />
            </label>
            <label className="dispatch-admin-field">
              <span>Ngày bay</span>
              <input type="date" name="ngayBay" value={filters.ngayBay} onChange={handleFilterChange} />
            </label>
            <label className="dispatch-admin-field">
              <span>Loại chuyến bay</span>
              <select name="loaiChuyenBay" value={filters.loaiChuyenBay} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {flightTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="dispatch-admin-field">
              <span>Trạng thái chuyến bay</span>
              <select name="trangThai" value={filters.trangThai} onChange={handleFilterChange}>
                <option value="">Tất cả</option>
                {flightStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="dispatch-admin-field">
              <span>Tình trạng cổng</span>
              <select name="tinhTrangCong" value={filters.tinhTrangCong} onChange={handleFilterChange}>
                <option value="tat-ca">Tất cả</option>
                <option value="da-phan-cong">Đã phân công</option>
                <option value="chua-phan-cong">Chưa phân công</option>
              </select>
            </label>
            <label className="dispatch-admin-field">
              <span>Tình trạng băng chuyền</span>
              <select name="tinhTrangBangChuyen" value={filters.tinhTrangBangChuyen} onChange={handleFilterChange}>
                <option value="tat-ca">Tất cả</option>
                <option value="da-phan-cong">Đã phân công</option>
                <option value="chua-phan-cong">Chưa phân công</option>
              </select>
            </label>
            <div className="dispatch-admin-filter-actions">
              <button className="dispatch-admin-button dispatch-admin-button--primary" type="button" onClick={applyFilters}>
                <i className="fa-solid fa-filter" aria-hidden="true" />
                Lọc
              </button>
              <button className="dispatch-admin-button dispatch-admin-button--secondary" type="button" onClick={resetFilters}>
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
                Làm mới
              </button>
            </div>
          </div>

          <div className="dispatch-admin-table-wrap">
            {loading ? (
              <div className="dispatch-admin-state">
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="dispatch-admin-state">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <span>Không có lịch trình phù hợp.</span>
              </div>
            ) : (
              <DispatchTable
                rows={rows}
                onView={openDetail}
                onGate={openGateModal}
                onBaggage={openBaggageModal}
                onDeactivate={openDeactivateModal}
              />
            )}
          </div>
        </section>

        {modal?.type === "gate" && (
          <GateModal
            modal={modal}
            formData={formData}
            terminalOptions={terminalOptions}
            gateTypes={gateTypes}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onSubmit={handleAssignGate}
          />
        )}

        {modal?.type === "baggage" && (
          <BaggageModal
            modal={modal}
            formData={formData}
            terminalOptions={terminalOptions}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onSubmit={handleAssignBaggage}
          />
        )}

        {modal?.type === "detail" && <DetailModal detail={modal.detail} onClose={closeModal} />}

        {modal?.type === "deactivate" && (
          <DeactivateModal modal={modal} saving={saving} onClose={closeModal} onConfirm={handleDeactivate} />
        )}
      </section>
    </AdminLayout>
  );
}

function DispatchTable({ rows, onView, onGate, onBaggage, onDeactivate }) {
  return (
    <table className="dispatch-admin-table">
      <thead>
        <tr>
          <th>Số hiệu chuyến bay</th>
          <th>Hãng bay</th>
          <th>Loại</th>
          <th>Điểm đi</th>
          <th>Điểm đến</th>
          <th>Ngày bay</th>
          <th>Giờ dự kiến</th>
          <th>Trạng thái chuyến bay</th>
          <th>Cổng hiện tại</th>
          <th>Băng chuyền hiện tại</th>
          <th>Trạng thái điều phối</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.maLichTrinh}>
            <td className="dispatch-admin-code">{row.soHieuChuyenBay}</td>
            <td>{displayValue(row.tenHangHangKhong, "Chưa cập nhật")}</td>
            <td><span className="dispatch-admin-badge">{row.loaiChuyenBay}</span></td>
            <td>{displayValue(row.diemDi, "Chưa cập nhật")}</td>
            <td>{displayValue(row.diemDen, "Chưa cập nhật")}</td>
            <td>{displayValue(row.ngayBay, "Chưa cập nhật")}</td>
            <td>
              <span>{displayValue(row.gioDuKienKhoiHanh, "Chưa cập nhật")}</span>
              <small>{displayValue(row.gioDuKienHaCanh, "Chưa cập nhật")}</small>
            </td>
            <td><span className={statusClass(row.trangThaiHienTai)}>{row.trangThaiHienTai}</span></td>
            <td>{displayValue(row.tenCong)}</td>
            <td>{displayValue(row.tenBangChuyenHanhLy)}</td>
            <td><span className={dispatchClass(row.trangThaiDieuPhoi)}>{row.trangThaiDieuPhoi}</span></td>
            <td>
              <div className="dispatch-admin-actions">
                <button type="button" title="Xem chi tiết" aria-label="Xem chi tiết" onClick={() => onView(row)}>
                  <i className="fa-solid fa-eye" aria-hidden="true" />
                </button>
                <button type="button" title="Phân công cổng" aria-label="Phân công cổng" onClick={() => onGate(row)}>
                  <i className="fa-solid fa-door-open" aria-hidden="true" />
                </button>
                <button type="button" title="Phân công băng chuyền" aria-label="Phân công băng chuyền" onClick={() => onBaggage(row)}>
                  <i className="fa-solid fa-suitcase-rolling" aria-hidden="true" />
                </button>
                {row.maPhanCongCong && (
                  <button className="dispatch-admin-actions__danger" type="button" title="Hủy phân công cổng" aria-label="Hủy phân công cổng" onClick={() => onDeactivate(row, "gate")}>
                    <i className="fa-solid fa-link-slash" aria-hidden="true" />
                  </button>
                )}
                {row.maPhanCongBangChuyen && (
                  <button className="dispatch-admin-actions__danger" type="button" title="Hủy phân công băng chuyền" aria-label="Hủy phân công băng chuyền" onClick={() => onDeactivate(row, "baggage")}>
                    <i className="fa-solid fa-ban" aria-hidden="true" />
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

function GateModal({ modal, formData, terminalOptions, gateTypes, saving, onChange, onClose, onSubmit }) {
  const available = modal.available || [];
  const readyItems = available.filter((item) => item.coSanSang);
  return (
    <Modal title="Phân công cổng" onClose={onClose}>
      <form onSubmit={onSubmit}>
        <AssignmentSummary item={modal.item} />
        {modal.item.maCong && <WarningText text="Lịch trình này đã có cổng, phân công mới sẽ thay thế phân công hiện tại." />}
        <div className="dispatch-admin-modal__body">
          <TimeFields formData={formData} onChange={onChange} />
          <label className="dispatch-admin-field">
            <span>Loại cổng</span>
            <select name="loaiCong" value={formData.loaiCong || ""} onChange={onChange} required>
              {gateTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <TerminalSelect terminalOptions={terminalOptions} value={formData.maNhaGa || ""} onChange={onChange} />
          <label className="dispatch-admin-field dispatch-admin-field--full">
            <span>Danh sách cổng khả dụng</span>
            <select name="maCong" value={formData.maCong || ""} onChange={onChange} required>
              <option value="">Chọn cổng</option>
              {available.map((item) => (
                <option key={item.maCong} value={item.maCong} disabled={!item.coSanSang}>
                  {item.tenCong} - {item.tenNhaGa} - {item.ghiChu}
                </option>
              ))}
            </select>
          </label>
          {modal.loadingAvailable && <InfoText text="Đang kiểm tra cổng khả dụng..." />}
          {!modal.loadingAvailable && available.length > 0 && readyItems.length === 0 && <WarningText text="Không có cổng khả dụng trong khoảng thời gian đã chọn." />}
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Phân công" />
      </form>
    </Modal>
  );
}

function BaggageModal({ modal, formData, terminalOptions, saving, onChange, onClose, onSubmit }) {
  const available = modal.available || [];
  const readyItems = available.filter((item) => item.coSanSang);
  return (
    <Modal title="Phân công băng chuyền" onClose={onClose}>
      <form onSubmit={onSubmit}>
        <AssignmentSummary item={modal.item} />
        {modal.item.maBangChuyenHanhLy && <WarningText text="Lịch trình này đã có băng chuyền, phân công mới sẽ thay thế phân công hiện tại." />}
        <div className="dispatch-admin-modal__body">
          <TimeFields formData={formData} onChange={onChange} />
          <TerminalSelect terminalOptions={terminalOptions} value={formData.maNhaGa || ""} onChange={onChange} />
          <label className="dispatch-admin-field dispatch-admin-field--full">
            <span>Danh sách băng chuyền khả dụng</span>
            <select name="maBangChuyenHanhLy" value={formData.maBangChuyenHanhLy || ""} onChange={onChange} required>
              <option value="">Chọn băng chuyền</option>
              {available.map((item) => (
                <option key={item.maBangChuyenHanhLy} value={item.maBangChuyenHanhLy} disabled={!item.coSanSang}>
                  {item.tenBangChuyenHanhLy} - {item.tenNhaGa} - {item.ghiChu}
                </option>
              ))}
            </select>
          </label>
          {modal.loadingAvailable && <InfoText text="Đang kiểm tra băng chuyền khả dụng..." />}
          {!modal.loadingAvailable && available.length > 0 && readyItems.length === 0 && <WarningText text="Không có băng chuyền khả dụng trong khoảng thời gian đã chọn." />}
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Phân công" />
      </form>
    </Modal>
  );
}

function DetailModal({ detail, onClose }) {
  const item = detail?.lichTrinh || {};
  return (
    <Modal title={`Chi tiết điều phối ${item.soHieuChuyenBay || ""}`} onClose={onClose} wide>
      <div className="dispatch-admin-detail">
        <section>
          <h3>Thông tin chuyến bay</h3>
          <div className="dispatch-admin-detail-grid">
            {detailFields(item).map((field) => (
              <div className="dispatch-admin-detail-item" key={field.label}>
                <span>{field.label}</span>
                <strong>{displayValue(field.value, field.emptyText)}</strong>
              </div>
            ))}
          </div>
        </section>
        <HistorySection title="Lịch sử phân công cổng" items={detail?.lichSuPhanCongCong || []} type="gate" />
        <HistorySection title="Lịch sử phân công băng chuyền" items={detail?.lichSuPhanCongBangChuyen || []} type="baggage" />
      </div>
      <div className="dispatch-admin-modal__footer">
        <button className="dispatch-admin-button dispatch-admin-button--primary" type="button" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}

function HistorySection({ title, items, type }) {
  return (
    <section>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="dispatch-admin-empty-text">Chưa phân công</p>
      ) : (
        <div className="dispatch-admin-list">
          {items.map((item) => (
            <article key={type === "gate" ? item.maPhanCongCong : item.maPhanCongBangChuyen}>
              <strong>{type === "gate" ? item.tenCong : item.tenBangChuyenHanhLy}</strong>
              <p>{item.tenNhaGa} · {displayValue(item.thoiGianBatDauSuDung, "Chưa cập nhật")} - {displayValue(item.thoiGianKetThucSuDung, "Chưa cập nhật")}</p>
              <span>{item.dangHienHanh ? "Đang hiệu lực" : "Đã hủy hiệu lực"}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DeactivateModal({ modal, saving, onClose, onConfirm }) {
  const isGate = modal.resourceType === "gate";
  return (
    <Modal title="Hủy phân công" onClose={onClose}>
      <div className="dispatch-admin-delete">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        <p>Bạn có chắc muốn hủy hiệu lực phân công {isGate ? "cổng" : "băng chuyền"} của chuyến bay <strong>{modal.item.soHieuChuyenBay}</strong>?</p>
      </div>
      <div className="dispatch-admin-modal__footer">
        <button className="dispatch-admin-button dispatch-admin-button--secondary" type="button" onClick={onClose} disabled={saving}>Hủy</button>
        <button className="dispatch-admin-button dispatch-admin-button--danger" type="button" onClick={onConfirm} disabled={saving}>
          <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-link-slash"} aria-hidden="true" />
          Hủy phân công
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="dispatch-admin-modal-backdrop" role="presentation">
      <div className={wide ? "dispatch-admin-modal dispatch-admin-modal--wide" : "dispatch-admin-modal"} role="dialog" aria-modal="true" aria-label={title}>
        <div className="dispatch-admin-modal__header">
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

function AssignmentSummary({ item }) {
  return (
    <div className="dispatch-admin-summary">
      <div><span>Số hiệu</span><strong>{item.soHieuChuyenBay}</strong></div>
      <div><span>Hãng bay</span><strong>{item.tenHangHangKhong}</strong></div>
      <div><span>Ngày bay</span><strong>{item.ngayBay}</strong></div>
      <div><span>Giờ dự kiến</span><strong>{item.gioDuKienKhoiHanh} - {item.gioDuKienHaCanh}</strong></div>
    </div>
  );
}

function TimeFields({ formData, onChange }) {
  return (
    <>
      <label className="dispatch-admin-field">
        <span>Thời gian bắt đầu sử dụng</span>
        <input type="datetime-local" name="thoiGianBatDauSuDung" value={formData.thoiGianBatDauSuDung || ""} onChange={onChange} required />
      </label>
      <label className="dispatch-admin-field">
        <span>Thời gian kết thúc sử dụng</span>
        <input type="datetime-local" name="thoiGianKetThucSuDung" value={formData.thoiGianKetThucSuDung || ""} onChange={onChange} required />
      </label>
    </>
  );
}

function TerminalSelect({ terminalOptions, value, onChange }) {
  return (
    <label className="dispatch-admin-field">
      <span>Nhà ga</span>
      <select name="maNhaGa" value={value} onChange={onChange}>
        <option value="">Tất cả nhà ga</option>
        {terminalOptions.map((terminal) => (
          <option key={terminal.maNhaGa} value={terminal.maNhaGa}>{terminal.tenNhaGa}</option>
        ))}
      </select>
    </label>
  );
}

function ModalFooter({ saving, onClose, saveLabel }) {
  return (
    <div className="dispatch-admin-modal__footer">
      <button className="dispatch-admin-button dispatch-admin-button--secondary" type="button" onClick={onClose} disabled={saving}>Hủy</button>
      <button className="dispatch-admin-button dispatch-admin-button--primary" type="submit" disabled={saving}>
        <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-link"} aria-hidden="true" />
        {saveLabel}
      </button>
    </div>
  );
}

function WarningText({ text }) {
  return <div className="dispatch-admin-warning"><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /><span>{text}</span></div>;
}

function InfoText({ text }) {
  return <div className="dispatch-admin-info"><i className="fa-solid fa-circle-info" aria-hidden="true" /><span>{text}</span></div>;
}

function createGateForm(item, gateTypes) {
  return {
    thoiGianBatDauSuDung: item.gioUocTinhKhoiHanh || item.gioDuKienKhoiHanh || "",
    thoiGianKetThucSuDung: item.gioUocTinhHaCanh || item.gioDuKienHaCanh || "",
    loaiCong: gateTypes[0] || "Nội địa",
    maNhaGa: "",
    maCong: "",
  };
}

function createBaggageForm(item) {
  return {
    thoiGianBatDauSuDung: item.gioUocTinhHaCanh || item.gioDuKienHaCanh || "",
    thoiGianKetThucSuDung: addMinutes(item.gioUocTinhHaCanh || item.gioDuKienHaCanh, 45),
    maNhaGa: "",
    maBangChuyenHanhLy: "",
  };
}

function addMinutes(value, minutes) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setMinutes(date.getMinutes() + minutes);
  return toDateTimeLocal(date);
}

function toDateTimeLocal(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function displayValue(value, emptyText = "Chưa phân công") {
  return value === null || value === undefined || value === "" ? emptyText : value;
}

function statusClass(status) {
  const map = {
    "Đã lên lịch": "dispatch-admin-status dispatch-admin-status--scheduled",
    "Đang làm thủ tục": "dispatch-admin-status dispatch-admin-status--checkin",
    "Đang bay": "dispatch-admin-status dispatch-admin-status--flying",
    "Đã hạ cánh": "dispatch-admin-status dispatch-admin-status--landed",
    "Hoàn thành": "dispatch-admin-status dispatch-admin-status--completed",
    "Chậm chuyến": "dispatch-admin-status dispatch-admin-status--delayed",
    "Hủy chuyến": "dispatch-admin-status dispatch-admin-status--cancelled",
  };
  return map[status] || "dispatch-admin-status";
}

function dispatchClass(status) {
  const map = {
    "Đã phân công đủ": "dispatch-admin-status dispatch-admin-status--completed",
    "Thiếu băng chuyền": "dispatch-admin-status dispatch-admin-status--delayed",
    "Thiếu cổng": "dispatch-admin-status dispatch-admin-status--delayed",
    "Chưa phân công": "dispatch-admin-status dispatch-admin-status--cancelled",
  };
  return map[status] || "dispatch-admin-status";
}

function detailFields(item) {
  return [
    { label: "Mã lịch trình", value: item.maLichTrinh, emptyText: "Chưa cập nhật" },
    { label: "Số hiệu chuyến bay", value: item.soHieuChuyenBay, emptyText: "Chưa cập nhật" },
    { label: "Hãng bay", value: item.tenHangHangKhong, emptyText: "Chưa cập nhật" },
    { label: "Loại chuyến bay", value: item.loaiChuyenBay, emptyText: "Chưa cập nhật" },
    { label: "Điểm đi", value: item.diemDi, emptyText: "Chưa cập nhật" },
    { label: "Điểm đến", value: item.diemDen, emptyText: "Chưa cập nhật" },
    { label: "Ngày bay", value: item.ngayBay, emptyText: "Chưa cập nhật" },
    { label: "Giờ dự kiến khởi hành", value: item.gioDuKienKhoiHanh, emptyText: "Chưa cập nhật" },
    { label: "Giờ dự kiến hạ cánh", value: item.gioDuKienHaCanh, emptyText: "Chưa cập nhật" },
    { label: "Cổng hiện hành", value: item.tenCong },
    { label: "Băng chuyền hiện hành", value: item.tenBangChuyenHanhLy },
    { label: "Trạng thái điều phối", value: item.trangThaiDieuPhoi, emptyText: "Chưa cập nhật" },
  ];
}

export default DieuPhoiVanHanh;
