import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { layDanhSachChuyenBayKhachHang } from "../../api/customerApi.js";
import { loadFollowedFlights } from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerFollowedFlightsPage() {
  const navigate = useNavigate();
  const followed = loadFollowedFlights();
  const followedKey = followed.join("|");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadFlights() {
      try {
        setLoading(true);
        setError("");
        const data = await layDanhSachChuyenBayKhachHang();
        const followedSet = new Set(loadFollowedFlights());
        if (!ignore) {
          setFlights((data || []).filter((flight) => followedSet.has(flight.flightNo)));
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Không thể tải chuyến bay theo dõi.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFlights();
    return () => {
      ignore = true;
    };
  }, [followedKey]);

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Chuyến bay đang theo dõi</h2>
          <p>Danh sách chuyến bay hành khách đã chọn theo dõi.</p>
        </div>
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

export default CustomerFollowedFlightsPage;
