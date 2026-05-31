import { getStatusClass, getStatusLabel } from "../../data/customerData.js";

function CustomerFlightTable({ flights, onNavigate, onViewDetail }) {
  if (!flights.length) {
    return (
      <div className="customer-empty">Không tìm thấy chuyến bay phù hợp.</div>
    );
  }

  return (
    <div className="customer-table-wrap">
      <table className="customer-table">
        <thead>
          <tr>
            <th>Số hiệu</th>
            <th>Hãng bay</th>
            <th>Tuyến bay</th>
            <th>Ngày</th>
            <th>Giờ dự kiến</th>
            <th>Gate</th>
            <th>Băng chuyền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.id || flight.flightNo}>
              <td>
                <span className="customer-flight-no">{flight.flightNo}</span>
              </td>
              <td>{flight.airline}</td>
              <td>
                <strong>
                  {flight.from} → {flight.to}
                </strong>
                <div className="customer-muted">
                  {flight.type === "DEN" ? "Chuyến bay đến" : "Chuyến bay đi"}
                </div>
              </td>
              <td>{flight.date || "--"}</td>
              <td>
                {flight.estimatedTime || flight.scheduledTime || "--"}
                <div className="customer-muted">
                  Lịch: {flight.scheduledTime || "--"}
                </div>
              </td>
              <td>{flight.gate || "--"}</td>
              <td>{flight.carousel || "--"}</td>
              <td>
                <span className={getStatusClass(flight.status)}>
                  {getStatusLabel(flight.status, flight.statusText)}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="customer-btn customer-btn--secondary"
                  onClick={() => {
                    const id = flight.id || flight.flightNo;
                    if (onViewDetail) onViewDetail(id);
                    else onNavigate?.("customerDetail", id);
                  }}
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerFlightTable;
