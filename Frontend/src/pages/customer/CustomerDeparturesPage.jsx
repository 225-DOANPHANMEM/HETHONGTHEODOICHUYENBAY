import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFlights } from "../../api";
import { mapApiFlightToCustomer } from "../../utils/flightMapper";
import { statusOptions } from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerDeparturesPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getFlights({ type: "Đi", date })
      .then((data) => setFlights(data.map(mapApiFlightToCustomer)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date]);

  const filteredFlights = useMemo(() => {
    const search = keyword.toLowerCase().trim();
    return flights.filter((flight) => {
      const matchKeyword =
        !search ||
        [flight.flightNo, flight.airline, flight.from, flight.to]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchStatus = status === "ALL" || flight.status === status;
      return matchKeyword && matchStatus;
    });
  }, [keyword, status, flights]);

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Chuyến bay đi</h2>
          <p>Danh sách chuyến bay khởi hành từ sân bay quốc tế Đà Nẵng.</p>
        </div>
      </div>

      <div className="customer-panel customer-filter-panel">
        <input
          className="customer-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm số hiệu, hãng bay, điểm đến..."
        />
        <select
          className="customer-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <input
          className="customer-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="customer-btn customer-btn--secondary"
          onClick={() => { setKeyword(""); setStatus("ALL"); }}
        >
          Làm mới
        </button>
      </div>

      {loading && <p className="customer-muted" style={{ padding: "16px" }}>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "#dc2626", padding: "16px" }}>{error}</p>}
      {!loading && !error && (
        <CustomerFlightTable
          flights={filteredFlights}
          onNavigate={(page, id) =>
            navigate(
              page === "customerDetail"
                ? `/customer/flights/${id}`
                : page === "customerArrivals"
                ? "/customer/arrivals"
                : page === "customerDepartures"
                ? "/customer/departures"
                : "/customer/search"
            )
          }
        />
      )}
    </div>
  );
}

export default CustomerDeparturesPage;
