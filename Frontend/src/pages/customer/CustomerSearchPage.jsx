import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { layDanhSachChuyenBayKhachHang } from "../../api/customerApi.js";
import { statusOptions } from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "ALL");
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
          type,
          status,
          date,
        });
        if (!ignore) setFlights(data || []);
      } catch (err) {
        if (!ignore) setError(err.message || "Không thể tra cứu chuyến bay.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFlights();
    return () => {
      ignore = true;
    };
  }, [keyword, type, status, date]);

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

export default CustomerSearchPage;
