import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadCustomerFlights, statusOptions } from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerSearchPage({ initialKeyword = "" }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("2026-05-01");
  const flights = loadCustomerFlights();

  const filteredFlights = useMemo(() => {
    const search = keyword.toLowerCase().trim();
    return flights.filter((flight) => {
      const matchKeyword =
        !search ||
        [flight.flightNo, flight.airline, flight.from, flight.to, flight.gate]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchType = type === "ALL" || flight.type === type;
      const matchStatus = status === "ALL" || flight.status === status;
      const matchDate = !date || flight.date === date;
      return matchKeyword && matchType && matchStatus && matchDate;
    });
  }, [keyword, type, status, date, flights]);

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Tra cứu chuyến bay</h2>
          <p>
            Tìm kiếm chuyến bay theo số hiệu, hãng bay, ngày, loại chuyến và
            trạng thái.
          </p>
        </div>
      </div>

      <div className="customer-panel customer-filter-panel">
        <input
          className="customer-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Số hiệu, hãng bay, điểm đi/đến..."
        />
        <select
          className="customer-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="ALL">Tất cả loại chuyến</option>
          <option value="DEN">Chuyến bay đến</option>
          <option value="DI">Chuyến bay đi</option>
        </select>
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
          onClick={() => {
            setKeyword("");
            setType("ALL");
            setStatus("ALL");
            setDate("");
          }}
        >
          Xóa lọc
        </button>
      </div>

      <CustomerFlightTable flights={filteredFlights} onNavigate={(page, id) => navigate(`/customer/${page === 'customerDetail' ? `flights/${id}` : page === 'customerArrivals' ? 'arrivals' : page === 'customerDepartures' ? 'departures' : page === 'customerSearch' ? 'search' : ''}`)} />
    </div>
  );
}

export default CustomerSearchPage;
