import { useMemo, useState } from "react";
import {
  addStaffHistory,
  getStatusClass,
  getStatusLabel,
  loadStaffFlights,
  saveStaffFlights,
  statusOptions,
} from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function StaffUpdateFlightStatusPage({ flightNo, onNavigate }) {
  const flights = loadStaffFlights();
  const selectedFlight = useMemo(() => {
    return flights.find((item) => item.flightNo === flightNo) || flights[0];
  }, [flightNo, flights]);

  const [form, setForm] = useState({ ...selectedFlight });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (["DELAYED", "CANCELLED"].includes(form.status) && !form.reason.trim()) {
      alert("Vui lòng nhập lý do khi chuyến bay bị chậm hoặc hủy.");
      return;
    }

    const nextFlights = flights.map((item) => (item.flightNo === form.flightNo ? form : item));
    saveStaffFlights(nextFlights);
    addStaffHistory({
      flightNo: form.flightNo,
      airline: form.airline,
      action: "Cập nhật trạng thái chuyến bay",
      oldStatus: selectedFlight.status,
      newStatus: form.status,
      employee: "NV001 - Nguyễn Văn A",
      content: `Cập nhật ${form.flightNo}: ${getStatusLabel(selectedFlight.status)} → ${getStatusLabel(form.status)}. Gate: ${form.gate || "--"}. Băng chuyền: ${form.carousel || "--"}.`,
    });
    alert("Đã lưu thông tin cập nhật chuyến bay.");
    onNavigate("staffFlights");
  }

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Flight Status Management</p>
          <h1 className="staff-page__title">Cập nhật trạng thái chuyến bay</h1>
          <p className="staff-page__desc">Cập nhật trạng thái, giờ dự kiến/thực tế, cổng ra máy bay và băng chuyền hành lý.</p>
        </div>
        <button className="staff-btn staff-btn--secondary" onClick={() => onNavigate("staffFlights")}>← Quay lại</button>
      </div>

      <section className="staff-detail-grid">
        <div className="staff-card">
          <div className="staff-card__body">
            <h3 style={{ marginTop: 0 }}>Thông tin chuyến bay</h3>
            <div className="staff-info-list">
              <div className="staff-info-row"><span>Số hiệu</span><span>{form.flightNo}</span></div>
              <div className="staff-info-row"><span>Hãng bay</span><span>{form.airline}</span></div>
              <div className="staff-info-row"><span>Tuyến bay</span><span>{form.from} → {form.to}</span></div>
              <div className="staff-info-row"><span>Loại</span><span>{form.type === "DEN" ? "Chuyến bay đến" : "Chuyến bay đi"}</span></div>
              <div className="staff-info-row"><span>Máy bay</span><span>{form.aircraft}</span></div>
              <div className="staff-info-row"><span>Trạng thái hiện tại</span><span><span className={getStatusClass(form.status)}>{getStatusLabel(form.status)}</span></span></div>
            </div>
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-card__body">
            <h3 style={{ marginTop: 0 }}>Biểu mẫu cập nhật</h3>
            <div className="staff-form-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div className="staff-form-group">
                <label>Ngày bay</label>
                <input className="staff-input" type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Trạng thái mới</label>
                <select className="staff-select" value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                  {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className="staff-form-group">
                <label>Giờ dự kiến khởi hành</label>
                <input className="staff-input" type="time" value={form.plannedDeparture} onChange={(e) => updateField("plannedDeparture", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Giờ dự kiến hạ cánh</label>
                <input className="staff-input" type="time" value={form.plannedArrival} onChange={(e) => updateField("plannedArrival", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Giờ ước tính khởi hành</label>
                <input className="staff-input" type="time" value={form.estimatedDeparture} onChange={(e) => updateField("estimatedDeparture", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Giờ ước tính hạ cánh</label>
                <input className="staff-input" type="time" value={form.estimatedArrival} onChange={(e) => updateField("estimatedArrival", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Giờ thực tế khởi hành</label>
                <input className="staff-input" type="time" value={form.actualDeparture} onChange={(e) => updateField("actualDeparture", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Giờ thực tế hạ cánh</label>
                <input className="staff-input" type="time" value={form.actualArrival} onChange={(e) => updateField("actualArrival", e.target.value)} />
              </div>
              <div className="staff-form-group">
                <label>Cổng ra máy bay</label>
                <input className="staff-input" value={form.gate} onChange={(e) => updateField("gate", e.target.value)} placeholder="VD: A05" />
              </div>
              <div className="staff-form-group">
                <label>Băng chuyền hành lý</label>
                <input className="staff-input" value={form.carousel} onChange={(e) => updateField("carousel", e.target.value)} placeholder="VD: B03" />
              </div>
            </div>

            {["DELAYED", "CANCELLED"].includes(form.status) && (
              <div className="staff-form-group" style={{ marginTop: 16 }}>
                <label>Lý do chậm / hủy chuyến</label>
                <textarea className="staff-textarea" value={form.reason} onChange={(e) => updateField("reason", e.target.value)} placeholder="Nhập lý do thay đổi trạng thái chuyến bay..." />
              </div>
            )}

            {["DELAYED", "CANCELLED"].includes(form.status) && (
              <div className="staff-alert" style={{ marginTop: 16 }}>
                Trạng thái này nên gửi thông báo cho hành khách và bộ phận liên quan sau khi lưu.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
              <button className="staff-btn staff-btn--secondary" onClick={() => setForm({ ...selectedFlight })}>Làm mới</button>
              <button className="staff-btn staff-btn--primary" onClick={handleSave}>Lưu cập nhật</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StaffUpdateFlightStatusPage;
