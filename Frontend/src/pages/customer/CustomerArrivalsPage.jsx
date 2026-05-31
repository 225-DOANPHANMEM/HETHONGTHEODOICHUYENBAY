import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { layDanhSachChuyenBayKhachHang } from "../../api/customerApi.js";
import { statusOptions } from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerArrivalsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadFlights() {
      try {
        setLoading(true);
        setError("");
        const data = await layDanhSachChuyenBayKhachHang({
          keyword,
          type: "DEN",
          status,
          date,
        });
        if (!ignore) setFlights(data || []);
      } catch (err) {
        if (!ignore) setError(err.message || "Không thể tải chuyến bay đến.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFlights();
    return () => {
      ignore = true;
    };
  }, [keyword, status, date]);

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Chuyến bay đến</h2>
          <p>Danh sách chuyến bay hạ cánh tại sân bay quốc tế Đà Nẵng.</p>
        </div>
      </div>

      <div className="customer-panel customer-filter-panel">
        <input
          className="customer-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm số hiệu, hãng bay, nơi khởi hành..."
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
          onClick={() => {
            setKeyword("");
            setStatus("ALL");
            setDate("");
          }}
        >
          Làm mới
        </button>
      </div>

      {loading ? <div className="customer-empty">Đang tải dữ liệu...</div> : null}
      {error ? <div className="customer-empty">{error}</div> : null}
      {!loading && !error ? (
        <CustomerFlightTable
          flights={flights}
          onViewDetail={(id) => navigate(`/customer/flights/${id}`)}
        />
      ) : null}
    </div>
  );
}

export default CustomerArrivalsPage;
