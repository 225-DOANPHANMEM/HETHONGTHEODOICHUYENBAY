import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadCustomerFlights, statusOptions } from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerDeparturesPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const flights = loadCustomerFlights().filter((item) => item.type === "DI");

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
          defaultValue="2026-05-01"
        />
        <button
          className="customer-btn customer-btn--secondary"
          onClick={() => {
            setKeyword("");
            setStatus("ALL");
          }}
        >
          Làm mới
        </button>
      </div>

      <CustomerFlightTable flights={filteredFlights} onNavigate={(page, id) => navigate(`/customer/${page === 'customerDetail' ? `flights/${id}` : page === 'customerArrivals' ? 'arrivals' : page === 'customerDepartures' ? 'departures' : page === 'customerSearch' ? 'search' : ''}`)} />
    </div>
  );
}

export default CustomerDeparturesPage;
