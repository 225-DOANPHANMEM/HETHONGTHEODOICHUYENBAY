import { useMemo, useState } from "react";
import { addStaffHistory, getStatusLabel, loadStaffFlights } from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function makeMessage(flight) {
  return `Thông báo: Chuyến bay ${flight.flightNo} của ${flight.airline} từ ${flight.from} đến ${flight.to} hiện có trạng thái ${getStatusLabel(flight.status)}. Giờ dự kiến: ${flight.type === "DEN" ? flight.estimatedArrival : flight.estimatedDeparture}. Gate: ${flight.gate || "--"}. Vui lòng theo dõi thông tin mới nhất từ sân bay.`;
}

function StaffNotificationPage() {
  const flights = loadStaffFlights();
  const [flightNo, setFlightNo] = useState(flights[0]?.flightNo || "");
  const selectedFlight = useMemo(() => flights.find((item) => item.flightNo === flightNo) || flights[0], [flights, flightNo]);
  const [channels, setChannels] = useState({ sms: true, email: true, push: true });
  const [content, setContent] = useState(() => selectedFlight ? makeMessage(selectedFlight) : "");
  const [logs, setLogs] = useState([]);

  function handleFlightChange(value) {
    setFlightNo(value);
    const flight = flights.find((item) => item.flightNo === value);
    if (flight) setContent(makeMessage(flight));
  }

  function handleSend() {
    const selectedChannels = Object.entries(channels).filter(([, checked]) => checked).map(([key]) => key.toUpperCase());
    if (selectedChannels.length === 0) {
      alert("Vui lòng chọn ít nhất một phương thức gửi.");
      return;
    }

    const log = `Đã gửi thông báo ${selectedFlight.flightNo} qua ${selectedChannels.join(", ")} lúc ${new Date().toLocaleString("vi-VN")}`;
    setLogs((prev) => [log, ...prev]);
    addStaffHistory({
      flightNo: selectedFlight.flightNo,
      airline: selectedFlight.airline,
      action: "Gửi thông báo thay đổi chuyến bay",
      oldStatus: selectedFlight.status,
      newStatus: selectedFlight.status,
      employee: "NV001 - Nguyễn Văn A",
      content,
    });
    alert("Đã gửi thông báo thay đổi chuyến bay.");
  }

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Flight Notification</p>
          <h1 className="staff-page__title">Thông báo thay đổi chuyến bay</h1>
          <p className="staff-page__desc">Soạn và gửi thông báo qua SMS, Email hoặc Push Notification khi chuyến bay có thay đổi.</p>
        </div>
      </div>

      <section className="staff-detail-grid">
        <div className="staff-card">
          <div className="staff-card__body">
            <h3 style={{ marginTop: 0 }}>Thông tin chuyến bay</h3>
            <div className="staff-form-group" style={{ marginBottom: 14 }}>
              <label>Chọn chuyến bay</label>
              <select className="staff-select" value={flightNo} onChange={(e) => handleFlightChange(e.target.value)}>
                {flights.map((item) => <option key={item.flightNo} value={item.flightNo}>{item.flightNo} - {item.airline}</option>)}
              </select>
            </div>
            {selectedFlight && <div className="staff-info-list">
              <div className="staff-info-row"><span>Số hiệu</span><span>{selectedFlight.flightNo}</span></div>
              <div className="staff-info-row"><span>Hãng bay</span><span>{selectedFlight.airline}</span></div>
              <div className="staff-info-row"><span>Tuyến bay</span><span>{selectedFlight.from} → {selectedFlight.to}</span></div>
              <div className="staff-info-row"><span>Trạng thái</span><span>{getStatusLabel(selectedFlight.status)}</span></div>
            </div>}
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-card__body">
            <h3 style={{ marginTop: 0 }}>Nội dung thông báo</h3>
            <div className="staff-form-group">
              <label>Nội dung gửi</label>
              <textarea className="staff-textarea" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
              <label><input type="checkbox" checked={channels.sms} onChange={(e) => setChannels({ ...channels, sms: e.target.checked })} /> SMS</label>
              <label><input type="checkbox" checked={channels.email} onChange={(e) => setChannels({ ...channels, email: e.target.checked })} /> Email</label>
              <label><input type="checkbox" checked={channels.push} onChange={(e) => setChannels({ ...channels, push: e.target.checked })} /> App Push</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button className="staff-btn staff-btn--primary" onClick={handleSend}>Xác nhận gửi thông báo</button>
            </div>
          </div>
        </div>
      </section>

      {logs.length > 0 && <section className="staff-card" style={{ marginTop: 18 }}>
        <div className="staff-card__body">
          <h3 style={{ marginTop: 0 }}>Log gửi thông báo</h3>
          <div className="staff-info-list">{logs.map((log) => <div className="staff-alert" key={log}>{log}</div>)}</div>
        </div>
      </section>}
    </div>
  );
}

export default StaffNotificationPage;
