import { useNavigate } from "react-router-dom";
import {
  loadCustomerFlights,
  loadFollowedFlights,
} from "../../data/customerData.js";
import CustomerFlightTable from "./CustomerFlightTable.jsx";
import "../../styles/customer/CustomerPages.css";

function CustomerFollowedFlightsPage() {
  const navigate = useNavigate();
  const followed = loadFollowedFlights();
  const flights = loadCustomerFlights().filter((flight) =>
    followed.includes(flight.flightNo),
  );

  return (
    <div className="customer-page">
      <div className="customer-section-head">
        <div>
          <h2>Chuyến bay đang theo dõi</h2>
          <p>Danh sách chuyến bay hành khách đã chọn theo dõi.</p>
        </div>
      </div>

      <CustomerFlightTable
        flights={flights}
        onNavigate={(page, id) =>
          navigate(
            `/customer/${page === "customerDetail" ? `flights/${id}` : page === "customerArrivals" ? "arrivals" : page === "customerDepartures" ? "departures" : page === "customerSearch" ? "search" : ""}`,
          )
        }
      />
    </div>
  );
}

export default CustomerFollowedFlightsPage;
