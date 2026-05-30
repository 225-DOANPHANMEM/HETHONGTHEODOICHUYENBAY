import { useEffect, useMemo, useState } from "react";
import { getFlights } from "../../api";
import { mapApiFlightToStaff } from "../../utils/flightMapper";
import { getStatusClass, getStatusLabel } from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function StaffFlightLookupPage({ onNavigate, initialType = "" }) {
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState(initialType || "");
  const [status, setStatus] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (date) params.date = date;
    if (type) params.type = type === "DEN" ? "Đến" : "Đi";

    getFlights(params)
      .then((data) => setFlights(data.map(mapApiFlightToStaff)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date, type]);

  const filteredFlights = useMemo(() => {
    return flights.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.flightNo.toLowerCase().includes(keyword.toLowerCase()) ||
        item.airline.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = !status || item.status === status;
      return matchKeyword && matchStatus;
    });
  }, [flights, keyword, status]);

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Flight Lookup</p>
          <h1 className="staff-page__title">Tra cứu chuyến bay</h1>
          <p className="staff-page__desc">
            Tìm kiếm chuyến bay theo số hiệu, hãng bay, ngày bay, loại chuyến bay và trạng thái.
          </p>
        </div>
        <button
          className="staff-btn staff-btn--secondary"
          onClick={() => onNavigate("staffHome")}
        >
          ← Về trang chủ
        </button>
      </div>

      <section className="staff-card" style={{ marginBottom: 18 }}>
        <div className="staff-card__body staff-form-grid">
          <div className="staff-form-group">
            <label>Số hiệu / hãng bay</label>
            <input
              className="staff-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="VD: VN132"
            />
          </div>
          <div className="staff-form-group">
            <label>Ngày bay</label>
            <input
              className="staff-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="staff-form-group">
            <label>Loại chuyến bay</label>
            <select
              className="staff-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="DEN">Chuyến bay đến</option>
              <option value="DI">Chuyến bay đi</option>
            </select>
          </div>
          <div className="staff-form-group">
            <label>Trạng thái</label>
            <select
              className="staff-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="CHECKIN">Đang làm thủ tục</option>
              <option value="IN_AIR">Đang bay</option>
              <option value="LANDED">Đã hạ cánh</option>
              <option value="DELAYED">Chậm chuyến</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </section>

      <section className="staff-card">
        <div className="staff-card__body">
          <div className="staff-page__topbar" style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>Kết quả tra cứu</h3>
            <span style={{ color: "#64748b", fontWeight: 700 }}>
              {loading ? "Đang tải..." : `${filteredFlights.length} chuyến bay`}
            </span>
          </div>

          {error && (
            <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>
          )}

          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Số hiệu</th>
                  <th>Hãng bay</th>
                  <th>Loại</th>
                  <th>Tuyến bay</th>
                  <th>Giờ dự kiến</th>
                  <th>Cổng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 42, color: "#64748b" }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredFlights.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 42, color: "#64748b" }}>
                      Không tìm thấy chuyến bay phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredFlights.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.flightNo}</strong></td>
                      <td>{item.airline}</td>
                      <td>{item.type === "DEN" ? "Đến" : "Đi"}</td>
                      <td>{item.from} → {item.to}</td>
                      <td>
                        {item.type === "DEN"
                          ? item.estimatedArrival || item.plannedArrival
                          : item.estimatedDeparture || item.plannedDeparture}
                      </td>
                      <td>{item.gate || "--"}</td>
                      <td>
                        <span className={getStatusClass(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="staff-btn staff-btn--secondary"
                          onClick={() => onNavigate("staffUpdateStatus", { flightId: item.id })}
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StaffFlightLookupPage;
