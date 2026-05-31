import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatTinhHinhDieuPhoi,
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

const DISPATCH_STAT_CARDS = [
  { key: "tongLichTrinh", label: "Tổng lịch trình", icon: "fa-solid fa-plane" },
  { key: "lichTrinhDaPhanCongCong", label: "Đã phân công cổng", icon: "fa-solid fa-door-open" },
  { key: "lichTrinhChuaPhanCongCong", label: "Chưa phân công cổng", icon: "fa-solid fa-link-slash" },
  { key: "lichTrinhDaPhanCongBangChuyen", label: "Đã phân công băng chuyền", icon: "fa-solid fa-suitcase-rolling" },
  { key: "lichTrinhChuaPhanCongBangChuyen", label: "Chưa phân công băng chuyền", icon: "fa-solid fa-ban" },
  { key: "soCongSanSang", label: "Cổng sẵn sàng", icon: "fa-solid fa-circle-check" },
  { key: "soCongDangDung", label: "Cổng đang dùng", icon: "fa-solid fa-person-walking-luggage" },
  { key: "soCongBaoTri", label: "Cổng bảo trì", icon: "fa-solid fa-screwdriver-wrench" },
  { key: "soBangChuyenSanSang", label: "Băng chuyền sẵn sàng", icon: "fa-solid fa-circle-check" },
  { key: "soBangChuyenDangDung", label: "Băng chuyền đang dùng", icon: "fa-solid fa-gears" },
  { key: "soBangChuyenBaoTri", label: "Băng chuyền bảo trì", icon: "fa-solid fa-screwdriver-wrench" },
];

const MAIN_STATUSES = ["Đã lên lịch", "Đang làm thủ tục", "Đang bay", "Đã hạ cánh", "Chậm chuyến", "Hủy chuyến", "Hoàn thành"];
const HIDDEN_STATUS_OPTIONS = new Set(["Đã xóa"]);

function DieuPhoiVanHanh({ onNavigate }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [terminalOptions, setTerminalOptions] = useState([]);
  const [gateTypes, setGateTypes] = useState([]);
  const [flightTypes, setFlightTypes] = useState([]);
  const [flightStatuses, setFlightStatuses] = useState(MAIN_STATUSES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});

  const visibleStatuses = useMemo(() => {
    const options = flightStatuses.filter((status) => !HIDDEN_STATUS_OPTIONS.has(status));
    return options.length ? options : MAIN_STATUSES;
  }, [flightStatuses]);

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
    setFlightStatuses(Array.isArray(statusOptions) ? statusOptions : MAIN_STATUSES);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await layDanhSachLichTrinhDieuPhoi(appliedFilters);
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setRows([]);
      setError(err.message || "Không tải được danh sách điều phối.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    async function fetchCommon() {
      try {
        await loadCommonData();
      } catch (err) {
        setError(err.message || "Không tải được thống kê điều phối.");
      }
    }
    fetchCommon();
  }, [loadCommonData]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) loadRows();
    });
    return () => {
      cancelled = true;
    };
  }, [loadRows]);

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
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
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

  const openStatusModal = (item) => {
    setFormData(createStatusForm(item));
    setModal({ type: "status", item });
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
    if (resourceType === "gate" && !item.maPhanCongCong) return;
    if (resourceType === "baggage" && !item.maPhanCongBangChuyen) return;
    setModal({ type: "deactivate", item, resourceType });
  };

  const closeModal = () => {
    if (!saving) {
      setModal(null);
      setFormData({});
    }
  };

  const resourceModalType = modal?.type;
  const gateAssignmentToIgnore = modal?.item?.maPhanCongCong || "";
  const baggageAssignmentToIgnore = modal?.item?.maPhanCongBangChuyen || "";

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const loadAvailableResources = useCallback(async () => {
    const resourceType = resourceModalType;
    if (!["gate", "baggage"].includes(resourceType)) return;
    if (!formData.thoiGianBatDauSuDung || !formData.thoiGianKetThucSuDung) return;

    setModal((current) => current?.type === resourceType ? { ...current, loadingAvailable: true } : current);
    try {
      const filtersForApi = {
        thoiGianBatDau: formData.thoiGianBatDauSuDung,
        thoiGianKetThuc: formData.thoiGianKetThucSuDung,
        maNhaGa: formData.maNhaGa,
      };
      if (resourceType === "gate") {
        filtersForApi.loaiCong = formData.loaiCong;
        filtersForApi.maPhanCongBoQua = gateAssignmentToIgnore;
        const data = await layCongKhaDung(filtersForApi);
        setModal((current) => current?.type === resourceType ? { ...current, available: Array.isArray(data) ? data : [], loadingAvailable: false } : current);
      } else {
        filtersForApi.maPhanCongBoQua = baggageAssignmentToIgnore;
        const data = await layBangChuyenKhaDung(filtersForApi);
        setModal((current) => current?.type === resourceType ? { ...current, available: Array.isArray(data) ? data : [], loadingAvailable: false } : current);
      }
    } catch (err) {
      setModal((current) => current?.type === resourceType ? { ...current, available: [], loadingAvailable: false } : current);
      setError(err.message || "Không tải được tài nguyên khả dụng.");
    }
  }, [
    formData.thoiGianBatDauSuDung,
    formData.thoiGianKetThucSuDung,
    formData.maNhaGa,
    formData.loaiCong,
    resourceModalType,
    gateAssignmentToIgnore,
    baggageAssignmentToIgnore,
  ]);

  useEffect(() => {
    let timeoutId;
    if (["gate", "baggage"].includes(modal?.type) && formData.thoiGianBatDauSuDung && formData.thoiGianKetThucSuDung) {
      timeoutId = window.setTimeout(loadAvailableResources, 250);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [loadAvailableResources, modal?.type, formData.thoiGianBatDauSuDung, formData.thoiGianKetThucSuDung, formData.maNhaGa, formData.loaiCong]);

  const handleUpdateStatus = async (event) => {
    event.preventDefault();
    if (!modal) return;

    const validationMessage = validateStatusForm(formData, modal.item);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updatedFlight = await capNhatTinhHinhDieuPhoi(modal.item.maLichTrinh, normalizeStatusPayload(formData));
      setSuccess("Cập nhật tình hình chuyến bay thành công.");
      setModal(null);
      await reloadAll();
      if (updatedFlight?.maLichTrinh) {
        setRows((current) => current.map((row) => mergeUpdatedFlight(row, updatedFlight)));
      }
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignGate = async (event) => {
    event.preventDefault();
    if (!modal) return;

    const validationMessage = validateAssignmentTime(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

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
      setError(err.message || "Phân công cổng thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignBaggage = async (event) => {
    event.preventDefault();
    if (!modal) return;

    const validationMessage = validateAssignmentTime(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

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
      setError(err.message || "Phân công băng chuyền thất bại.");
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
        if (!modal.item.maPhanCongCong) return;
        await huyPhanCongCong(modal.item.maPhanCongCong);
        setSuccess("Hủy phân công cổng thành công.");
      } else {
        if (!modal.item.maPhanCongBangChuyen) return;
        await huyPhanCongBangChuyen(modal.item.maPhanCongBangChuyen);
        setSuccess("Hủy phân công băng chuyền thành công.");
      }
      setModal(null);
      await reloadAll();
    } catch (err) {
      setError(err.message || "Hủy phân công thất bại.");
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
              <p>Cập nhật tình hình thực tế, phân công cổng và băng chuyền cho các chuyến bay đến/đi.</p>
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

        <section className="dispatch-admin-stats" aria-label="Thống kê điều phối">
          {DISPATCH_STAT_CARDS.map((card) => (
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
                {visibleStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
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
                <i className="fa-solid fa-filter-circle-xmark" aria-hidden="true" />
                Xóa bộ lọc
              </button>
              <button className="dispatch-admin-button dispatch-admin-button--secondary" type="button" onClick={reloadAll}>
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
                onStatus={openStatusModal}
                onGate={openGateModal}
                onBaggage={openBaggageModal}
                onDeactivate={openDeactivateModal}
              />
            )}
          </div>
        </section>

        {modal?.type === "status" && (
          <StatusModal
            modal={modal}
            formData={formData}
            statuses={visibleStatuses}
            saving={saving}
            onChange={handleFormChange}
            onClose={closeModal}
            onSubmit={handleUpdateStatus}
          />
        )}

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

function DispatchTable({ rows, onView, onStatus, onGate, onBaggage, onDeactivate }) {
  return (
    <table className="dispatch-admin-table">
      <thead>
        <tr>
          <th>Số hiệu chuyến bay</th>
          <th>Hãng bay</th>
          <th>Loại chuyến bay</th>
          <th>Điểm đi</th>
          <th>Điểm đến</th>
          <th>Ngày bay</th>
          <th>Giờ dự kiến</th>
          <th>Giờ ước tính</th>
          <th>Trạng thái chuyến bay</th>
          <th>Số phút chậm</th>
          <th>Cổng hiện tại</th>
          <th>Băng chuyền hiện tại</th>
          <th>Trạng thái điều phối</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.maLichTrinh}>
            {(() => {
              const delayMinutes = resolveDelayMinutes(row);
              return (
                <>
            <td className="dispatch-admin-code">{row.soHieuChuyenBay}</td>
            <td>{displayValue(row.tenHangHangKhong, "Chưa cập nhật")}</td>
            <td><span className="dispatch-admin-badge">{displayValue(row.loaiChuyenBay, "Chưa cập nhật")}</span></td>
            <td>{displayValue(row.diemDi, "Chưa cập nhật")}</td>
            <td>{displayValue(row.diemDen, "Chưa cập nhật")}</td>
            <td>{formatDate(row.ngayBay)}</td>
            <td>{formatDateTime(primaryScheduledTime(row))}</td>
            <td>{formatDateTime(primaryEstimatedTime(row))}</td>
            <td><span className={statusClass(row.trangThaiHienTai)}>{displayValue(row.trangThaiHienTai, "Chưa cập nhật")}</span></td>
            <td>{displayDelay(delayMinutes, row.trangThaiHienTai)}</td>
            <td>{row.tenCong || "Chưa phân công"}</td>
            <td>{row.tenBangChuyenHanhLy || "Chưa phân công"}</td>
            <td><span className={dispatchClass(row.trangThaiDieuPhoi)}>{row.trangThaiDieuPhoi}</span></td>
            <td>
              <div className="dispatch-admin-actions">
                <button type="button" title="Xem chi tiết" aria-label="Xem chi tiết" onClick={() => onView(row)}>
                  <i className="fa-solid fa-eye" aria-hidden="true" />
                </button>
                <button type="button" title="Cập nhật tình hình" aria-label="Cập nhật tình hình" onClick={() => onStatus(row)}>
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
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
                </>
              );
            })()}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusModal({ modal, formData, statuses, saving, onChange, onClose, onSubmit }) {
  const previewDelayMinutes = resolveDelayMinutes({
    ...modal.item,
    ...formData,
    trangThaiHienTai: formData.trangThaiMoi,
  });
  return (
    <Modal title="Cập nhật tình hình chuyến bay" onClose={onClose} wide>
      <form onSubmit={onSubmit}>
        <AssignmentSummary item={modal.item} />
        <div className="dispatch-admin-modal__body">
          <label className="dispatch-admin-field">
            <span>Mã tài khoản cập nhật</span>
            <input name="maTaiKhoan" value={formData.maTaiKhoan || ""} onChange={onChange} required />
          </label>
          <label className="dispatch-admin-field">
            <span>Trạng thái mới</span>
            <select name="trangThaiMoi" value={formData.trangThaiMoi || ""} onChange={onChange} required>
              <option value="">Chọn trạng thái</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="dispatch-admin-field">
            <span>Giờ ước tính khởi hành</span>
            <input type="datetime-local" name="gioUocTinhKhoiHanh" value={formData.gioUocTinhKhoiHanh || ""} onChange={onChange} />
          </label>
          <label className="dispatch-admin-field">
            <span>Giờ ước tính hạ cánh</span>
            <input type="datetime-local" name="gioUocTinhHaCanh" value={formData.gioUocTinhHaCanh || ""} onChange={onChange} />
          </label>
          <label className="dispatch-admin-field">
            <span>Giờ thực tế khởi hành</span>
            <input type="datetime-local" name="gioThucTeKhoiHanh" value={formData.gioThucTeKhoiHanh || ""} onChange={onChange} />
          </label>
          <label className="dispatch-admin-field">
            <span>Giờ thực tế hạ cánh</span>
            <input type="datetime-local" name="gioThucTeHaCanh" value={formData.gioThucTeHaCanh || ""} onChange={onChange} />
          </label>
          <label className="dispatch-admin-field dispatch-admin-field--full">
            <span>Lý do chậm/hủy</span>
            <textarea name="lyDoChamHoacHuy" value={formData.lyDoChamHoacHuy || ""} onChange={onChange} rows={3} />
          </label>
          {formData.trangThaiMoi === "Chậm chuyến" && (
            <label className="dispatch-admin-field dispatch-admin-field--full">
              <span>Số phút chậm dự kiến</span>
              <input value={displayDelay(previewDelayMinutes, formData.trangThaiMoi)} readOnly />
            </label>
          )}
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Cập nhật" icon="fa-solid fa-floppy-disk" />
      </form>
    </Modal>
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
            <span>Cổng khả dụng</span>
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
          {!modal.loadingAvailable && available.length === 0 && <InfoText text="Nhập khoảng thời gian để tải cổng khả dụng." />}
          {!modal.loadingAvailable && available.length > 0 && readyItems.length === 0 && <WarningText text="Không có cổng khả dụng trong khoảng thời gian đã chọn." />}
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Phân công" icon="fa-solid fa-link" />
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
            <span>Băng chuyền khả dụng</span>
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
          {!modal.loadingAvailable && available.length === 0 && <InfoText text="Nhập khoảng thời gian để tải băng chuyền khả dụng." />}
          {!modal.loadingAvailable && available.length > 0 && readyItems.length === 0 && <WarningText text="Không có băng chuyền khả dụng trong khoảng thời gian đã chọn." />}
        </div>
        <ModalFooter saving={saving} onClose={onClose} saveLabel="Phân công" icon="fa-solid fa-link" />
      </form>
    </Modal>
  );
}

function DetailModal({ detail, onClose }) {
  const item = detail?.lichTrinh || {};
  return (
    <Modal title={`Chi tiết điều phối ${item.soHieuChuyenBay || ""}`} onClose={onClose} wide>
      <div className="dispatch-admin-detail">
        <DetailSection title="Thông tin chuyến bay" fields={flightDetailFields(item)} />
        <DetailSection title="Thông tin thời gian" fields={timeDetailFields(item)} />
        <DetailSection title="Thông tin điều phối" fields={dispatchDetailFields(item)} />
        <HistorySection title="Lịch sử phân công cổng" items={detail?.lichSuPhanCongCong || []} type="gate" />
        <HistorySection title="Lịch sử phân công băng chuyền" items={detail?.lichSuPhanCongBangChuyen || []} type="baggage" />
        <StatusHistorySection items={detail?.lichSuCapNhat || []} />
      </div>
      <div className="dispatch-admin-modal__footer">
        <button className="dispatch-admin-button dispatch-admin-button--primary" type="button" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}

function DetailSection({ title, fields }) {
  return (
    <section>
      <h3>{title}</h3>
      <div className="dispatch-admin-detail-grid">
        {fields.map((field) => (
          <div className="dispatch-admin-detail-item" key={field.label}>
            <span>{field.label}</span>
            <strong>{displayValue(field.value, field.emptyText || "Chưa cập nhật")}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistorySection({ title, items, type }) {
  return (
    <section>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="dispatch-admin-empty-text">Chưa có lịch sử.</p>
      ) : (
        <div className="dispatch-admin-list">
          {items.map((item) => (
            <article key={type === "gate" ? item.maPhanCongCong : item.maPhanCongBangChuyen}>
              <strong>{type === "gate" ? item.tenCong : item.tenBangChuyenHanhLy}</strong>
              <p>{item.tenNhaGa} · {formatDateTime(item.thoiGianBatDauSuDung)} - {formatDateTime(item.thoiGianKetThucSuDung)}</p>
              <span>{item.dangHienHanh ? "Đang hiệu lực" : "Đã hủy hiệu lực"}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusHistorySection({ items }) {
  return (
    <section>
      <h3>Lịch sử cập nhật tình hình</h3>
      {items.length === 0 ? (
        <p className="dispatch-admin-empty-text">Chưa có lịch sử.</p>
      ) : (
        <div className="dispatch-admin-list">
          {items.map((item) => (
            <article key={item.maLichSuCapNhat}>
              <strong>{displayValue(item.trangThaiCu, "Chưa cập nhật")} → {displayValue(item.trangThaiMoi, "Chưa cập nhật")}</strong>
              <p>{displayValue(item.noiDungCapNhat || item.lyDoCapNhat, "Chưa cập nhật")}</p>
              <span>{displayValue(item.tenDangNhap, "Chưa cập nhật")} · {formatDateTime(item.thoiGianCapNhat)} · Chậm {item.soPhutChamMoi ?? 0} phút</span>
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
        <p>Bạn có chắc muốn hủy phân công {isGate ? "cổng" : "băng chuyền"} của chuyến bay <strong>{modal.item.soHieuChuyenBay}</strong>?</p>
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
      <div><span>Số hiệu</span><strong>{displayValue(item.soHieuChuyenBay, "Chưa cập nhật")}</strong></div>
      <div><span>Hãng bay</span><strong>{displayValue(item.tenHangHangKhong, "Chưa cập nhật")}</strong></div>
      <div><span>Loại chuyến bay</span><strong>{displayValue(item.loaiChuyenBay, "Chưa cập nhật")}</strong></div>
      <div><span>Tuyến bay</span><strong>{displayValue(item.diemDi, "Chưa cập nhật")} - {displayValue(item.diemDen, "Chưa cập nhật")}</strong></div>
      <div><span>Ngày bay</span><strong>{formatDate(item.ngayBay)}</strong></div>
      <div><span>Trạng thái hiện tại</span><strong>{displayValue(item.trangThaiHienTai, "Chưa cập nhật")}</strong></div>
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

function ModalFooter({ saving, onClose, saveLabel, icon }) {
  return (
    <div className="dispatch-admin-modal__footer">
      <button className="dispatch-admin-button dispatch-admin-button--secondary" type="button" onClick={onClose} disabled={saving}>Hủy</button>
      <button className="dispatch-admin-button dispatch-admin-button--primary" type="submit" disabled={saving}>
        <i className={saving ? "fa-solid fa-spinner fa-spin" : icon} aria-hidden="true" />
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

function createStatusForm(item) {
  return {
    maTaiKhoan: "TK01",
    trangThaiMoi: item.trangThaiHienTai && item.trangThaiHienTai !== "Đã hạ cánh" ? item.trangThaiHienTai : "Đã lên lịch",
    gioUocTinhKhoiHanh: normalizeInputDateTime(item.gioUocTinhKhoiHanh),
    gioUocTinhHaCanh: normalizeInputDateTime(item.gioUocTinhHaCanh),
    gioThucTeKhoiHanh: normalizeInputDateTime(item.gioThucTeKhoiHanh),
    gioThucTeHaCanh: normalizeInputDateTime(item.gioThucTeHaCanh),
    lyDoChamHoacHuy: item.lyDoChamHoacHuy || "",
  };
}

function createGateForm(item, gateTypes) {
  return {
    thoiGianBatDauSuDung: normalizeInputDateTime(item.thoiGianBatDauSuDungCong || item.gioUocTinhKhoiHanh || item.gioDuKienKhoiHanh),
    thoiGianKetThucSuDung: normalizeInputDateTime(item.thoiGianKetThucSuDungCong || item.gioUocTinhHaCanh || item.gioDuKienHaCanh),
    loaiCong: gateTypes[0] || "Nội địa",
    maNhaGa: "",
    maCong: item.maCong || "",
  };
}

function createBaggageForm(item) {
  return {
    thoiGianBatDauSuDung: normalizeInputDateTime(item.thoiGianBatDauSuDungBangChuyen || item.gioUocTinhHaCanh || item.gioDuKienHaCanh),
    thoiGianKetThucSuDung: normalizeInputDateTime(item.thoiGianKetThucSuDungBangChuyen || addMinutes(item.gioUocTinhHaCanh || item.gioDuKienHaCanh, 45)),
    maNhaGa: "",
    maBangChuyenHanhLy: item.maBangChuyenHanhLy || "",
  };
}

function normalizeStatusPayload(data) {
  return {
    maTaiKhoan: data.maTaiKhoan?.trim() || "TK01",
    trangThaiMoi: data.trangThaiMoi || "",
    gioUocTinhKhoiHanh: emptyToNull(data.gioUocTinhKhoiHanh),
    gioUocTinhHaCanh: emptyToNull(data.gioUocTinhHaCanh),
    gioThucTeKhoiHanh: emptyToNull(data.gioThucTeKhoiHanh),
    gioThucTeHaCanh: emptyToNull(data.gioThucTeHaCanh),
    lyDoChamHoacHuy: data.lyDoChamHoacHuy?.trim() || "",
  };
}

function validateStatusForm(data, item = {}) {
  if (!data.trangThaiMoi) return "Phải chọn trạng thái mới.";
  if (data.trangThaiMoi === "Chậm chuyến") {
    const delayMinutes = resolveDelayMinutes({
      ...item,
      ...data,
      trangThaiHienTai: data.trangThaiMoi,
    });
    if (delayMinutes <= 0) {
      return "Cập nhật Chậm chuyến cần nhập giờ ước tính muộn hơn giờ dự kiến để tính số phút chậm.";
    }
  }
  if (["Chậm chuyến", "Hủy chuyến"].includes(data.trangThaiMoi) && !data.lyDoChamHoacHuy?.trim()) {
    return "Nhập thiếu lý do chậm/hủy.";
  }
  if (data.trangThaiMoi === "Đang bay" && !data.gioThucTeKhoiHanh) {
    return "Cập nhật Đang bay bắt buộc nhập giờ thực tế khởi hành.";
  }
  if (data.trangThaiMoi === "Hoàn thành" && !data.gioThucTeHaCanh) {
    return "Cập nhật Hoàn thành bắt buộc nhập giờ thực tế hạ cánh.";
  }
  if (data.gioUocTinhKhoiHanh && data.gioUocTinhHaCanh && new Date(data.gioUocTinhHaCanh) <= new Date(data.gioUocTinhKhoiHanh)) {
    return "Giờ ước tính hạ cánh phải lớn hơn giờ ước tính khởi hành.";
  }
  if (data.gioThucTeKhoiHanh && data.gioThucTeHaCanh && new Date(data.gioThucTeHaCanh) < new Date(data.gioThucTeKhoiHanh)) {
    return "Giờ thực tế hạ cánh phải lớn hơn hoặc bằng giờ thực tế khởi hành.";
  }
  return "";
}

function validateAssignmentTime(data) {
  if (!data.thoiGianBatDauSuDung || !data.thoiGianKetThucSuDung) return "Thời gian bắt đầu và kết thúc không được để trống.";
  if (new Date(data.thoiGianKetThucSuDung) <= new Date(data.thoiGianBatDauSuDung)) return "Thời gian kết thúc phải lớn hơn thời gian bắt đầu.";
  return "";
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

function normalizeInputDateTime(value) {
  return value ? value.slice(0, 16) : "";
}

function emptyToNull(value) {
  return value ? value : null;
}

function displayValue(value, emptyText = "Chưa phân công") {
  return value === null || value === undefined || value === "" ? emptyText : value;
}

function displayDelay(minutes, status = "") {
  if (minutes && minutes > 0) return `${minutes} phút`;
  return status === "Chậm chuyến" ? "Chưa tính được" : "Đúng giờ";
}

function resolveDelayMinutes(item = {}) {
  const storedDelay = Number(item.soPhutCham);
  if (Number.isFinite(storedDelay) && storedDelay > 0) {
    return storedDelay;
  }

  const scheduledTime = primaryScheduledTime(item);
  const estimatedTime = primaryEstimatedTime(item);
  const scheduledDate = scheduledTime ? new Date(scheduledTime) : null;
  const estimatedDate = estimatedTime ? new Date(estimatedTime) : null;
  if (!scheduledDate || !estimatedDate || Number.isNaN(scheduledDate.getTime()) || Number.isNaN(estimatedDate.getTime())) {
    return Number.isFinite(storedDelay) ? Math.max(storedDelay, 0) : 0;
  }

  const diffMinutes = Math.round((estimatedDate.getTime() - scheduledDate.getTime()) / 60000);
  return Math.max(diffMinutes, 0);
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

function statusClass(status) {
  const map = {
    "Đã lên lịch": "dispatch-admin-status dispatch-admin-status--scheduled",
    "Đang làm thủ tục": "dispatch-admin-status dispatch-admin-status--checkin",
    "Đang bay": "dispatch-admin-status dispatch-admin-status--flying",
    "Đã hạ cánh": "dispatch-admin-status dispatch-admin-status--landed",
    "Chậm chuyến": "dispatch-admin-status dispatch-admin-status--delayed",
    "Hủy chuyến": "dispatch-admin-status dispatch-admin-status--cancelled",
    "Hoàn thành": "dispatch-admin-status dispatch-admin-status--completed",
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

function flightDetailFields(item) {
  return [
    { label: "Mã lịch trình", value: item.maLichTrinh },
    { label: "Mã chuyến bay", value: item.maChuyenBay },
    { label: "Số hiệu chuyến bay", value: item.soHieuChuyenBay },
    { label: "Hãng bay", value: item.tenHangHangKhong },
    { label: "Loại chuyến bay", value: item.loaiChuyenBay },
    { label: "Điểm đi", value: item.diemDi },
    { label: "Điểm đến", value: item.diemDen },
  ];
}

function timeDetailFields(item) {
  const delayMinutes = resolveDelayMinutes(item);
  return [
    { label: "Ngày bay", value: formatDate(item.ngayBay) },
    { label: "Giờ dự kiến khởi hành", value: formatDateTime(item.gioDuKienKhoiHanh) },
    { label: "Giờ dự kiến hạ cánh", value: formatDateTime(item.gioDuKienHaCanh) },
    { label: "Giờ ước tính khởi hành", value: formatDateTime(item.gioUocTinhKhoiHanh) },
    { label: "Giờ ước tính hạ cánh", value: formatDateTime(item.gioUocTinhHaCanh) },
    { label: "Giờ thực tế khởi hành", value: formatDateTime(item.gioThucTeKhoiHanh) },
    { label: "Giờ thực tế hạ cánh", value: formatDateTime(item.gioThucTeHaCanh) },
    { label: "Số phút chậm", value: displayDelay(delayMinutes, item.trangThaiHienTai) },
    { label: "Lý do chậm/hủy", value: item.lyDoChamHoacHuy },
  ];
}

function dispatchDetailFields(item) {
  return [
    { label: "Cổng hiện tại", value: item.tenCong, emptyText: "Chưa phân công" },
    { label: "Nhà ga của cổng", value: item.tenNhaGaCong, emptyText: "Chưa phân công" },
    { label: "Băng chuyền hiện tại", value: item.tenBangChuyenHanhLy, emptyText: "Chưa phân công" },
    { label: "Nhà ga của băng chuyền", value: item.tenNhaGaBangChuyen, emptyText: "Chưa phân công" },
    { label: "Trạng thái điều phối", value: item.trangThaiDieuPhoi },
  ];
}

function mergeUpdatedFlight(row, updatedFlight) {
  if (row.maLichTrinh !== updatedFlight.maLichTrinh) return row;
  return {
    ...row,
    gioUocTinhKhoiHanh: updatedFlight.gioUocTinhKhoiHanh,
    gioUocTinhHaCanh: updatedFlight.gioUocTinhHaCanh,
    gioThucTeKhoiHanh: updatedFlight.gioThucTeKhoiHanh,
    gioThucTeHaCanh: updatedFlight.gioThucTeHaCanh,
    trangThaiHienTai: updatedFlight.trangThaiHienTai,
    soPhutCham: resolveDelayMinutes(updatedFlight),
    lyDoChamHoacHuy: updatedFlight.lyDoChamHoacHuy,
  };
}

export default DieuPhoiVanHanh;
