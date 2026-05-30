import { useEffect, useMemo, useState } from "react";
import { getFlights, updateFlightStatus } from "../../api";
import { mapApiFlightToStaff } from "../../utils/flightMapper";
import {
  getStatusClass,
  getStatusLabel,
  statusOptions,
} from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function StaffUpdateFlightStatusPage({ onNavigate }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  // Lấy thông tin nhân viên đang đăng nhập
  const staffUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("staffUser") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    setLoading(true);
    getFlights({ date: today })
      .then((data) => {
        const mapped = data.map(mapApiFlightToStaff);
        setFlights(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
          setForm({ ...mapped[0] });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [today]);

  const selectedFlight = useMemo(
    () => flights.find((f) => f.id === selectedId) || null,
    [flights, selectedId]
  );

  function handleSelectFlight(id) {
    const found = flights.find((f) => f.id === id);
    if (found) {
      setSelectedId(id);
      setForm({ ...found });
      setMessage("");
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form || !selectedFlight) return;

    if (["DELAYED", "CANCELLED"].includes(form.status) && !form.reason.trim()) {
      setMessage("Vui lòng nhập lý do khi chuyến bay bị chậm hoặc hủy.");
      return;
    }

    if (!staffUser) {
      setMessage("Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }

    // Map status từ frontend sang tiếng Việt cho DB
    const STATUS_TO_VN = {
      SCHEDULED: "Đã lên lịch",
      CHECKIN: "Đang làm thủ tục",
      IN_AIR: "Đang bay",
      LANDED: "Đã hạ cánh",
      DELAYED: "Chậm chuyến",
      CANCELLED: "Hủy chuyến",
    };

    const raw = selectedFlight._raw;
    const ngayBay = raw.NgayBay
      ? new Date(raw.NgayBay).toISOString().slice(0, 10)
      : today;

    const toDateTime = (timeStr) => {
      if (!timeStr) return null;
      return `${ngayBay}T${timeStr}:00`;
    };

    setSaving(true);
    setMessage("");

    try {
      await updateFlightStatus(selectedFlight.id, {
        maTaiKhoan: staffUser.maTaiKhoan,
        trangThaiMoi: STATUS_TO_VN[form.status] || null,
        gioUocTinhKhoiHanh: toDateTime(form.estimatedDeparture),
        gioUocTinhHaCanh: toDateTime(form.estimatedArrival),
        gioThucTeKhoiHanh: toDateTime(form.actualDeparture) || null,
        gioThucTeHaCanh: toDateTime(form.actualArrival) || null,
        lyDoChamHoacHuy: form.reason || null,
      });

      // Cập nhật lại danh sách local
      setFlights((prev) =>
        prev.map((f) => (f.id === selectedId ? { ...f, ...form } : f))
      );
      setMessage("Đã lưu thông tin cập nhật chuyến bay thành công.");
    } catch (err) {
      setMessage(err.message || "Lỗi khi lưu cập nhật.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Flight Status Management</p>
          <h1 className="staff-page__title">Cập nhật trạng thái chuyến bay</h1>
          <p className="staff-page__desc">
            Cập nhật trạng thái, giờ dự kiến/thực tế, cổng ra máy bay và băng chuyền hành lý.
          </p>
        </div>
        <button className="staff-btn staff-btn--secondary" onClick={() => onNavigate("staffFlights")}>
          ← Quay lại
        </button>
      </div>

      {loading && (
        <p className="staff-page__desc" style={{ padding: "16px" }}>Đang tải danh sách chuyến bay...</p>
      )}

      {!loading && flights.length > 0 && (
        <section className="staff-card" style={{ marginBottom: 16 }}>
          <div className="staff-card__body">
            <div className="staff-form-group">
              <label>Chọn chuyến bay cần cập nhật</label>
              <select
                className="staff-select"
                value={selectedId || ""}
                onChange={(e) => handleSelectFlight(e.target.value)}
              >
                {flights.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.flightNo} — {f.from} → {f.to} ({f.date})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {!loading && form && (
        <section className="staff-detail-grid">
          <div className="staff-card">
            <div className="staff-card__body">
              <h3 style={{ marginTop: 0 }}>Thông tin chuyến bay</h3>
              <div className="staff-info-list">
                <div className="staff-info-row"><span>Số hiệu</span><span>{form.flightNo}</span></div>
                <div className="staff-info-row"><span>Hãng bay</span><span>{form.airline}</span></div>
                <div className="staff-info-row"><span>Tuyến bay</span><span>{form.from} → {form.to}</span></div>
                <div className="staff-info-row"><span>Loại</span><span>{form.type === "DEN" ? "Chuyến bay đến" : "Chuyến bay đi"}</span></div>
                <div className="staff-info-row">
                  <span>Trạng thái hiện tại</span>
                  <span>
                    <span className={getStatusClass(form.status)}>{getStatusLabel(form.status)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="staff-card">
            <div className="staff-card__body">
              <h3 style={{ marginTop: 0 }}>Biểu mẫu cập nhật</h3>
              <div className="staff-form-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div className="staff-form-group">
                  <label>Trạng thái mới</label>
                  <select
                    className="staff-select"
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div className="staff-form-group">
                  <label>Giờ ước tính khởi hành</label>
                  <input
                    className="staff-input"
                    type="time"
                    value={form.estimatedDeparture}
                    onChange={(e) => updateField("estimatedDeparture", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Giờ ước tính hạ cánh</label>
                  <input
                    className="staff-input"
                    type="time"
                    value={form.estimatedArrival}
                    onChange={(e) => updateField("estimatedArrival", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Giờ thực tế khởi hành</label>
                  <input
                    className="staff-input"
                    type="time"
                    value={form.actualDeparture}
                    onChange={(e) => updateField("actualDeparture", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Giờ thực tế hạ cánh</label>
                  <input
                    className="staff-input"
                    type="time"
                    value={form.actualArrival}
                    onChange={(e) => updateField("actualArrival", e.target.value)}
                  />
                </div>
              </div>

              {["DELAYED", "CANCELLED"].includes(form.status) && (
                <div className="staff-form-group" style={{ marginTop: 16 }}>
                  <label>Lý do chậm / hủy chuyến</label>
                  <textarea
                    className="staff-textarea"
                    value={form.reason}
                    onChange={(e) => updateField("reason", e.target.value)}
                    placeholder="Nhập lý do thay đổi trạng thái chuyến bay..."
                  />
                </div>
              )}

              {["DELAYED", "CANCELLED"].includes(form.status) && (
                <div className="staff-alert" style={{ marginTop: 16 }}>
                  Trạng thái này nên gửi thông báo cho hành khách và bộ phận liên quan sau khi lưu.
                </div>
              )}

              {message && (
                <p
                  style={{
                    marginTop: 12,
                    fontSize: "14px",
                    color: message.includes("thành công") ? "#16a34a" : "#dc2626",
                  }}
                >
                  {message}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
                <button
                  className="staff-btn staff-btn--secondary"
                  onClick={() => { setForm({ ...selectedFlight }); setMessage(""); }}
                >
                  Làm mới
                </button>
                <button
                  className="staff-btn staff-btn--primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu cập nhật"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default StaffUpdateFlightStatusPage;
