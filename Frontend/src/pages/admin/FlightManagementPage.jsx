import { useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/FlightManagementPage.css";

const FLIGHT_STATUSES = [
  "Đã lên lịch",
  "Đang làm thủ tục",
  "Đang bay",
  "Đã hạ cánh",
  "Hoàn thành",
  "Chậm chuyến",
  "Hủy chuyến",
  "Đã xóa",
];

const initialAirlines = [
  { id: "HHK01", code: "VN", name: "Vietnam Airlines" },
  { id: "HHK02", code: "VJ", name: "Vietjet Air" },
  { id: "HHK03", code: "QH", name: "Bamboo Airways" },
  { id: "HHK04", code: "SQ", name: "Singapore Airlines" },
  { id: "HHK05", code: "KE", name: "Korean Air" },
];

const initialFlights = [
  {
    id: "CB001",
    airlineId: "HHK01",
    flightNumber: "VN101",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Hà Nội",
    deleted: false,
  },
  {
    id: "CB002",
    airlineId: "HHK02",
    flightNumber: "VJ203",
    type: "Đến",
    departure: "TP.HCM",
    destination: "Đà Nẵng",
    deleted: false,
  },
  {
    id: "CB003",
    airlineId: "HHK03",
    flightNumber: "QH305",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Singapore",
    deleted: false,
  },
  {
    id: "CB004",
    airlineId: "HHK04",
    flightNumber: "SQ171",
    type: "Đến",
    departure: "Singapore",
    destination: "Đà Nẵng",
    deleted: false,
  },
  {
    id: "CB005",
    airlineId: "HHK05",
    flightNumber: "KE462",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Seoul",
    deleted: false,
  },
];

const initialSchedules = [
  {
    id: "LT001",
    flightId: "CB001",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T06:00",
    scheduledArrival: "2026-05-01T07:20",
    estimatedDeparture: "2026-05-01T06:00",
    estimatedArrival: "2026-05-01T07:20",
    actualDeparture: "",
    actualArrival: "",
    status: "Đã lên lịch",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
  },
  {
    id: "LT002",
    flightId: "CB002",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T08:00",
    scheduledArrival: "2026-05-01T09:15",
    estimatedDeparture: "2026-05-01T08:00",
    estimatedArrival: "2026-05-01T09:15",
    actualDeparture: "",
    actualArrival: "",
    status: "Đã lên lịch",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
  },
  {
    id: "LT003",
    flightId: "CB003",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T10:30",
    scheduledArrival: "2026-05-01T13:15",
    estimatedDeparture: "2026-05-01T10:30",
    estimatedArrival: "2026-05-01T13:15",
    actualDeparture: "",
    actualArrival: "",
    status: "Đã lên lịch",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
  },
  {
    id: "LT004",
    flightId: "CB004",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T14:00",
    scheduledArrival: "2026-05-01T16:40",
    estimatedDeparture: "2026-05-01T14:00",
    estimatedArrival: "2026-05-01T16:40",
    actualDeparture: "",
    actualArrival: "",
    status: "Đã lên lịch",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
  },
  {
    id: "LT005",
    flightId: "CB005",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T18:00",
    scheduledArrival: "2026-05-01T22:30",
    estimatedDeparture: "2026-05-01T18:00",
    estimatedArrival: "2026-05-01T22:30",
    actualDeparture: "",
    actualArrival: "",
    status: "Đã lên lịch",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
  },
];

const initialGateAssignments = [
  { id: "PCC01", scheduleId: "LT001", gateName: "Cổng 1" },
  { id: "PCC02", scheduleId: "LT002", gateName: "Cổng 2" },
  { id: "PCC03", scheduleId: "LT003", gateName: "Cổng 3" },
  { id: "PCC04", scheduleId: "LT004", gateName: "Cổng 4" },
  { id: "PCC05", scheduleId: "LT005", gateName: "Cổng 5" },
];

const initialBeltAssignments = [
  { id: "PCBC01", scheduleId: "LT001", beltName: "Băng chuyền 1" },
  { id: "PCBC02", scheduleId: "LT002", beltName: "Băng chuyền 2" },
  { id: "PCBC03", scheduleId: "LT003", beltName: "Băng chuyền 3" },
  { id: "PCBC04", scheduleId: "LT004", beltName: "Băng chuyền 4" },
  { id: "PCBC05", scheduleId: "LT005", beltName: "Băng chuyền 5" },
];

const initialUpdateHistory = [
  {
    id: "LS01",
    scheduleId: "LT001",
    flightNumber: "VN101",
    oldStatus: "Đã lên lịch",
    newStatus: "Đã lên lịch",
    oldEstimatedDeparture: "2026-05-01T06:00",
    newEstimatedDeparture: "2026-05-01T06:00",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
    updatedAt: "01/05/2026 05:00",
  },
  {
    id: "LS02",
    scheduleId: "LT002",
    flightNumber: "VJ203",
    oldStatus: "Đã lên lịch",
    newStatus: "Đã lên lịch",
    oldEstimatedDeparture: "2026-05-01T08:00",
    newEstimatedDeparture: "2026-05-01T08:00",
    delayMinutes: 0,
    reason: "Khởi tạo lịch trình ban đầu",
    updatedAt: "01/05/2026 05:00",
  },
];

function FlightManagementPage({ onNavigate }) {
  const [flights, setFlights] = useState(initialFlights);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [updateHistory, setUpdateHistory] = useState(initialUpdateHistory);
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("LT001");
  const [detailScheduleId, setDetailScheduleId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("Tất cả");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [updateForm, setUpdateForm] = useState({
    status: "Đã lên lịch",
    estimatedDeparture: "2026-05-01T06:00",
    estimatedArrival: "2026-05-01T07:20",
    actualDeparture: "",
    actualArrival: "",
    reason: "",
  });

  const airlineById = useMemo(() => {
    return initialAirlines.reduce((result, airline) => {
      result[airline.id] = airline;
      return result;
    }, {});
  }, []);

  const gateByScheduleId = useMemo(() => {
    return initialGateAssignments.reduce((result, item) => {
      result[item.scheduleId] = item.gateName;
      return result;
    }, {});
  }, []);

  const beltByScheduleId = useMemo(() => {
    return initialBeltAssignments.reduce((result, item) => {
      result[item.scheduleId] = item.beltName;
      return result;
    }, {});
  }, []);

  const flightRows = useMemo(() => {
    return schedules
      .map((schedule) => {
        const flight = flights.find((item) => item.id === schedule.flightId);

        if (!flight || flight.deleted) {
          return null;
        }

        return {
          ...schedule,
          flight,
          airline: airlineById[flight.airlineId],
          gateName: gateByScheduleId[schedule.id] || "Chưa phân công",
          beltName: beltByScheduleId[schedule.id] || "Chưa phân công",
        };
      })
      .filter(Boolean);
  }, [flights, schedules, airlineById, gateByScheduleId, beltByScheduleId]);

  const selectedRow = flightRows.find((row) => row.id === selectedScheduleId);
  const detailRow = flightRows.find((row) => row.id === detailScheduleId);

  const filteredRows = useMemo(() => {
    const searchValue = keyword.trim().toLowerCase();

    return flightRows.filter((row) => {
      const matchesKeyword =
        row.flight.flightNumber.toLowerCase().includes(searchValue) ||
        row.airline?.name.toLowerCase().includes(searchValue) ||
        row.flight.departure.toLowerCase().includes(searchValue) ||
        row.flight.destination.toLowerCase().includes(searchValue) ||
        row.gateName.toLowerCase().includes(searchValue) ||
        row.beltName.toLowerCase().includes(searchValue);

      const matchesAirline =
        airlineFilter === "Tất cả" || row.flight.airlineId === airlineFilter;

      const matchesType =
        typeFilter === "Tất cả" || row.flight.type === typeFilter;

      const matchesDate = !dateFilter || row.flightDate === dateFilter;

      const matchesStatus =
        statusFilter === "Tất cả" || row.status === statusFilter;

      return (
        matchesKeyword &&
        matchesAirline &&
        matchesType &&
        matchesDate &&
        matchesStatus
      );
    });
  }, [
    flightRows,
    keyword,
    airlineFilter,
    typeFilter,
    dateFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: flightRows.length,
      departure: flightRows.filter((row) => row.flight.type === "Đi").length,
      arrival: flightRows.filter((row) => row.flight.type === "Đến").length,
      delayedOrCancelled: flightRows.filter((row) =>
        ["Chậm chuyến", "Hủy chuyến"].includes(row.status),
      ).length,
    };
  }, [flightRows]);

  const selectedHistory = useMemo(() => {
    if (!detailRow) {
      return [];
    }

    return updateHistory.filter((item) => item.scheduleId === detailRow.id);
  }, [detailRow, updateHistory]);

  const formatDateTime = (value) => {
    if (!value) {
      return "Chưa cập nhật";
    }

    return value.replace("T", " ");
  };

  const calculateDelayMinutes = (scheduledDeparture, estimatedDeparture) => {
    if (!scheduledDeparture || !estimatedDeparture) {
      return 0;
    }

    const scheduled = new Date(scheduledDeparture);
    const estimated = new Date(estimatedDeparture);
    const delay = Math.round((estimated - scheduled) / 60000);

    return delay > 0 ? delay : 0;
  };

  const handleSelectSchedule = (scheduleId) => {
    const row = flightRows.find((item) => item.id === scheduleId);

    if (!row) {
      return;
    }

    setSelectedScheduleId(scheduleId);
    setUpdateForm({
      status: row.status,
      estimatedDeparture: row.estimatedDeparture,
      estimatedArrival: row.estimatedArrival,
      actualDeparture: row.actualDeparture,
      actualArrival: row.actualArrival,
      reason: "",
    });
  };

  const handleChangeUpdateForm = (event) => {
    const { name, value } = event.target;
    setUpdateForm({ ...updateForm, [name]: value });
  };

  const handleUpdateFlightStatus = (event) => {
    event.preventDefault();

    if (!selectedRow) {
      alert("Vui lòng chọn chuyến bay cần cập nhật.");
      return;
    }

    if (!updateForm.status) {
      alert("Vui lòng chọn trạng thái mới.");
      return;
    }

    if (
      updateForm.estimatedArrival &&
      updateForm.estimatedDeparture &&
      new Date(updateForm.estimatedArrival) <
        new Date(updateForm.estimatedDeparture)
    ) {
      alert("Giờ ước tính hạ cánh không được nhỏ hơn giờ ước tính khởi hành.");
      return;
    }

    if (
      ["Chậm chuyến", "Hủy chuyến"].includes(updateForm.status) &&
      !updateForm.reason.trim()
    ) {
      alert("Vui lòng nhập lý do khi chuyến bay bị chậm hoặc hủy.");
      return;
    }

    const delayMinutes = calculateDelayMinutes(
      selectedRow.scheduledDeparture,
      updateForm.estimatedDeparture,
    );

    setSchedules(
      schedules.map((schedule) =>
        schedule.id === selectedRow.id
          ? {
              ...schedule,
              status: updateForm.status,
              estimatedDeparture:
                updateForm.estimatedDeparture || schedule.estimatedDeparture,
              estimatedArrival:
                updateForm.estimatedArrival || schedule.estimatedArrival,
              actualDeparture: updateForm.actualDeparture,
              actualArrival: updateForm.actualArrival,
              delayMinutes,
              reason: updateForm.reason.trim() || schedule.reason,
            }
          : schedule,
      ),
    );

    setUpdateHistory([
      {
        id: `LS${String(updateHistory.length + 1).padStart(3, "0")}`,
        scheduleId: selectedRow.id,
        flightNumber: selectedRow.flight.flightNumber,
        oldStatus: selectedRow.status,
        newStatus: updateForm.status,
        oldEstimatedDeparture: selectedRow.estimatedDeparture,
        newEstimatedDeparture: updateForm.estimatedDeparture,
        delayMinutes,
        reason: updateForm.reason.trim() || "Cập nhật tình hình chuyến bay",
        updatedAt: new Date().toLocaleString("vi-VN"),
      },
      ...updateHistory,
    ]);

    alert("Cập nhật tình hình chuyến bay thành công.");
  };

  const handleSoftDeleteFlight = (row) => {
    const reason = window.prompt(
      `Nhập lý do đánh dấu xóa chuyến bay ${row.flight.flightNumber}:`,
      "Chuyến bay ngừng theo dõi hoặc dữ liệu không còn hiệu lực",
    );

    if (!reason) {
      return;
    }

    setFlights(
      flights.map((flight) =>
        flight.id === row.flight.id ? { ...flight, deleted: true } : flight,
      ),
    );

    setSchedules(
      schedules.map((schedule) =>
        schedule.flightId === row.flight.id
          ? {
              ...schedule,
              status: "Đã xóa",
              reason,
            }
          : schedule,
      ),
    );

    setDeletedHistory([
      {
        id: deletedHistory.length + 1,
        flightId: row.flight.id,
        airlineId: row.flight.airlineId,
        flightNumber: row.flight.flightNumber,
        type: row.flight.type,
        departure: row.flight.departure,
        destination: row.flight.destination,
        deletedAt: new Date().toLocaleString("vi-VN"),
        reason,
      },
      ...deletedHistory,
    ]);

    setUpdateHistory([
      {
        id: `LS${String(updateHistory.length + 1).padStart(3, "0")}`,
        scheduleId: row.id,
        flightNumber: row.flight.flightNumber,
        oldStatus: row.status,
        newStatus: "Đã xóa",
        oldEstimatedDeparture: row.estimatedDeparture,
        newEstimatedDeparture: row.estimatedDeparture,
        delayMinutes: row.delayMinutes,
        reason,
        updatedAt: new Date().toLocaleString("vi-VN"),
      },
      ...updateHistory,
    ]);

    if (selectedScheduleId === row.id) {
      const nextRow = flightRows.find((item) => item.id !== row.id);
      setSelectedScheduleId(nextRow?.id || "");
    }

    alert("Đã đánh dấu xóa chuyến bay và lưu vào lịch sử.");
  };

  const getStatusClassName = (status) => {
    const statusClassMap = {
      "Đã lên lịch": "flight-status flight-status--scheduled",
      "Đang làm thủ tục": "flight-status flight-status--checkin",
      "Đang bay": "flight-status flight-status--flying",
      "Đã hạ cánh": "flight-status flight-status--landed",
      "Hoàn thành": "flight-status flight-status--completed",
      "Chậm chuyến": "flight-status flight-status--delayed",
      "Hủy chuyến": "flight-status flight-status--cancelled",
      "Đã xóa": "flight-status flight-status--deleted",
    };

    return statusClassMap[status] || "flight-status";
  };

  return (
    <AdminLayout activePage="flights" onNavigate={onNavigate}>
      <section className="flight-page">
        <div className="flight-page__heading">
          <div>
            <p className="flight-page__eyebrow">Flight Status Management</p>
            <h1 className="flight-page__title">
              Cập nhật tình hình chuyến bay
            </h1>
            <p className="flight-page__description">
              Theo dõi và cập nhật trạng thái, giờ ước tính, giờ thực tế, cổng
              ra máy bay và băng chuyền hành lý cho các chuyến bay đến và đi tại
              sân bay quốc tế Đà Nẵng.
            </p>
          </div>

          <div className="flight-page__heading-icon">🛫</div>
        </div>

        <div className="flight-page__stats-grid">
          <article className="flight-stat-card">
            <span className="flight-stat-card__icon">🧾</span>
            <div>
              <p className="flight-stat-card__label">Tổng chuyến bay</p>
              <h2 className="flight-stat-card__value">{stats.total}</h2>
            </div>
          </article>

          <article className="flight-stat-card">
            <span className="flight-stat-card__icon">🛫</span>
            <div>
              <p className="flight-stat-card__label">Chuyến bay đi</p>
              <h2 className="flight-stat-card__value">{stats.departure}</h2>
            </div>
          </article>

          <article className="flight-stat-card">
            <span className="flight-stat-card__icon">🛬</span>
            <div>
              <p className="flight-stat-card__label">Chuyến bay đến</p>
              <h2 className="flight-stat-card__value">{stats.arrival}</h2>
            </div>
          </article>

          <article className="flight-stat-card">
            <span className="flight-stat-card__icon">⏱️</span>
            <div>
              <p className="flight-stat-card__label">Chậm / hủy</p>
              <h2 className="flight-stat-card__value">
                {stats.delayedOrCancelled}
              </h2>
            </div>
          </article>
        </div>

        <section className="flight-panel">
          <div className="flight-panel__header flight-panel__header--split">
            <div>
              <h2 className="flight-panel__title">
                Cập nhật tình hình chuyến bay
              </h2>
              <p className="flight-panel__subtitle">
                Chọn chuyến bay cần cập nhật, kiểm tra thông tin hiện tại rồi
                cập nhật trạng thái, giờ ước tính hoặc giờ thực tế.
              </p>
            </div>

            <span className="flight-panel__count">
              {selectedRow?.flight.flightNumber || "Chưa chọn"}
            </span>
          </div>

          <div className="flight-update-layout">
            <div className="flight-current-card">
              <label className="flight-form__label">
                Chuyến bay cần cập nhật
              </label>

              <select
                className="flight-form__input"
                value={selectedScheduleId}
                onChange={(event) => handleSelectSchedule(event.target.value)}
              >
                {flightRows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.flight.flightNumber} - {row.flight.departure} →{" "}
                    {row.flight.destination} - {row.flightDate}
                  </option>
                ))}
              </select>

              {selectedRow && (
                <div className="flight-current-grid">
                  <div className="flight-info-item">
                    <span>Hãng bay</span>
                    <strong>{selectedRow.airline?.name}</strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Loại chuyến bay</span>
                    <strong>{selectedRow.flight.type}</strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Ngày bay</span>
                    <strong>{selectedRow.flightDate}</strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Trạng thái hiện tại</span>
                    <strong className={getStatusClassName(selectedRow.status)}>
                      {selectedRow.status}
                    </strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Giờ dự kiến khởi hành</span>
                    <strong>
                      {formatDateTime(selectedRow.scheduledDeparture)}
                    </strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Giờ dự kiến hạ cánh</span>
                    <strong>
                      {formatDateTime(selectedRow.scheduledArrival)}
                    </strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Cổng ra</span>
                    <strong>{selectedRow.gateName}</strong>
                  </div>

                  <div className="flight-info-item">
                    <span>Băng chuyền</span>
                    <strong>{selectedRow.beltName}</strong>
                  </div>
                </div>
              )}
            </div>

            <form
              className="flight-update-form"
              onSubmit={handleUpdateFlightStatus}
            >
              <div>
                <label className="flight-form__label">Trạng thái mới</label>
                <select
                  className="flight-form__input"
                  name="status"
                  value={updateForm.status}
                  onChange={handleChangeUpdateForm}
                >
                  {FLIGHT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flight-form__label">
                  Giờ ước tính khởi hành
                </label>
                <input
                  className="flight-form__input"
                  type="datetime-local"
                  name="estimatedDeparture"
                  value={updateForm.estimatedDeparture}
                  onChange={handleChangeUpdateForm}
                />
              </div>

              <div>
                <label className="flight-form__label">
                  Giờ ước tính hạ cánh
                </label>
                <input
                  className="flight-form__input"
                  type="datetime-local"
                  name="estimatedArrival"
                  value={updateForm.estimatedArrival}
                  onChange={handleChangeUpdateForm}
                />
              </div>

              <div>
                <label className="flight-form__label">
                  Giờ thực tế khởi hành
                </label>
                <input
                  className="flight-form__input"
                  type="datetime-local"
                  name="actualDeparture"
                  value={updateForm.actualDeparture}
                  onChange={handleChangeUpdateForm}
                />
              </div>

              <div>
                <label className="flight-form__label">
                  Giờ thực tế hạ cánh
                </label>
                <input
                  className="flight-form__input"
                  type="datetime-local"
                  name="actualArrival"
                  value={updateForm.actualArrival}
                  onChange={handleChangeUpdateForm}
                />
              </div>

              <div>
                <label className="flight-form__label">Lý do cập nhật</label>
                <input
                  className="flight-form__input"
                  name="reason"
                  value={updateForm.reason}
                  onChange={handleChangeUpdateForm}
                  placeholder="Ví dụ: thời tiết xấu, thay đổi khai thác..."
                />
              </div>

              <div className="flight-update-form__actions">
                <button className="flight-form__submit-button" type="submit">
                  Cập nhật tình hình
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="flight-panel">
          <div className="flight-panel__header flight-panel__header--split">
            <div>
              <h2 className="flight-panel__title">
                Danh sách chuyến bay đang theo dõi
              </h2>
              <p className="flight-panel__subtitle">
                Lọc chuyến bay theo số hiệu, hãng bay, loại chuyến bay, ngày bay
                hoặc trạng thái hiện tại.
              </p>
            </div>

            <span className="flight-panel__count">
              {filteredRows.length} chuyến bay
            </span>
          </div>

          <div className="flight-toolbar">
            <input
              className="flight-toolbar__input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm số hiệu, hãng bay, điểm đi, điểm đến..."
            />

            <select
              className="flight-toolbar__input"
              value={airlineFilter}
              onChange={(event) => setAirlineFilter(event.target.value)}
            >
              <option value="Tất cả">Tất cả hãng bay</option>
              {initialAirlines.map((airline) => (
                <option key={airline.id} value={airline.id}>
                  {airline.name}
                </option>
              ))}
            </select>

            <select
              className="flight-toolbar__input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="Tất cả">Tất cả loại</option>
              <option value="Đi">Chuyến bay đi</option>
              <option value="Đến">Chuyến bay đến</option>
            </select>

            <input
              className="flight-toolbar__input"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />

            <select
              className="flight-toolbar__input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              {FLIGHT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flight-table-wrapper">
            <div className="flight-table">
              <div className="flight-table__header">
                <span>Số hiệu</span>
                <span>Hãng bay</span>
                <span>Điểm đi</span>
                <span>Điểm đến</span>
                <span>Giờ dự kiến</span>
                <span>Giờ ước tính</span>
                <span>Trạng thái</span>
                <span>Cổng</span>
                <span>Băng chuyền</span>
                <span>Thao tác</span>
              </div>

              {filteredRows.map((row) => (
                <div className="flight-table__row" key={row.id}>
                  <span className="flight-table__code">
                    {row.flight.flightNumber}
                  </span>

                  <span className="flight-table__text">
                    {row.airline?.name}
                  </span>

                  <span className="flight-table__text">
                    {row.flight.departure}
                  </span>

                  <span className="flight-table__text">
                    {row.flight.destination}
                  </span>

                  <span className="flight-table__text">
                    {formatDateTime(row.scheduledDeparture)}
                  </span>

                  <span className="flight-table__text">
                    {formatDateTime(row.estimatedDeparture)}
                  </span>

                  <span className={getStatusClassName(row.status)}>
                    {row.status}
                  </span>

                  <span className="flight-table__text">{row.gateName}</span>

                  <span className="flight-table__text">{row.beltName}</span>

                  <div className="flight-table__actions">
                    <button
                      className="flight-table__button"
                      type="button"
                      onClick={() => handleSelectSchedule(row.id)}
                    >
                      Cập nhật
                    </button>

                    <button
                      className="flight-table__button"
                      type="button"
                      onClick={() => setDetailScheduleId(row.id)}
                    >
                      Chi tiết
                    </button>

                    <button
                      className="flight-table__button flight-table__button--danger"
                      type="button"
                      onClick={() => handleSoftDeleteFlight(row)}
                    >
                      Đánh dấu xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredRows.length === 0 && (
              <div className="flight-empty">
                <span>🔎</span>
                <p>Không tìm thấy chuyến bay phù hợp.</p>
              </div>
            )}
          </div>
        </section>

        <section className="flight-panel">
          <div className="flight-panel__header">
            <h2 className="flight-panel__title">Lịch sử cập nhật gần đây</h2>
            <p className="flight-panel__subtitle">
              Dữ liệu mô phỏng bảng LICHSUCAPNHAT, dùng để theo dõi các lần thay
              đổi trạng thái hoặc giờ ước tính.
            </p>
          </div>

          <div className="flight-history-list">
            {updateHistory.slice(0, 5).map((history) => (
              <article className="flight-history-card" key={history.id}>
                <div>
                  <strong>{history.flightNumber}</strong>
                  <p>
                    {history.oldStatus} → {history.newStatus}
                  </p>
                </div>

                <div>
                  <span>{history.updatedAt}</span>
                  <p>{history.reason}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {deletedHistory.length > 0 && (
          <section className="flight-panel">
            <div className="flight-panel__header">
              <h2 className="flight-panel__title">
                Lịch sử chuyến bay đã đánh dấu xóa
              </h2>
              <p className="flight-panel__subtitle">
                Dữ liệu mô phỏng bảng LICHSUCHUYENBAYXOA.
              </p>
            </div>

            <div className="flight-history-list">
              {deletedHistory.map((history) => (
                <article className="flight-history-card" key={history.id}>
                  <div>
                    <strong>{history.flightNumber}</strong>
                    <p>
                      {history.departure} → {history.destination}
                    </p>
                  </div>

                  <div>
                    <span>{history.deletedAt}</span>
                    <p>{history.reason}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {detailRow && (
          <div className="flight-modal-backdrop">
            <div className="flight-modal">
              <div className="flight-modal__header">
                <div>
                  <p className="flight-page__eyebrow">Chi tiết chuyến bay</p>
                  <h2>{detailRow.flight.flightNumber}</h2>
                </div>

                <button
                  className="flight-modal__close"
                  type="button"
                  onClick={() => setDetailScheduleId(null)}
                >
                  ×
                </button>
              </div>

              <div className="flight-modal__grid">
                <div className="flight-detail-card">
                  <span>Hãng hàng không</span>
                  <strong>{detailRow.airline?.name}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Loại chuyến bay</span>
                  <strong>{detailRow.flight.type}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Điểm đi</span>
                  <strong>{detailRow.flight.departure}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Điểm đến</span>
                  <strong>{detailRow.flight.destination}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Ngày bay</span>
                  <strong>{detailRow.flightDate}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Cổng ra</span>
                  <strong>{detailRow.gateName}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Băng chuyền</span>
                  <strong>{detailRow.beltName}</strong>
                </div>

                <div className="flight-detail-card">
                  <span>Số phút chậm</span>
                  <strong>{detailRow.delayMinutes} phút</strong>
                </div>
              </div>

              <div className="flight-modal__section">
                <h3>Thông tin lịch trình</h3>

                <div className="flight-schedule-card">
                  <div>
                    <span>Giờ dự kiến khởi hành</span>
                    <p>{formatDateTime(detailRow.scheduledDeparture)}</p>
                  </div>

                  <div>
                    <span>Giờ dự kiến hạ cánh</span>
                    <p>{formatDateTime(detailRow.scheduledArrival)}</p>
                  </div>

                  <div>
                    <span>Giờ ước tính khởi hành</span>
                    <p>{formatDateTime(detailRow.estimatedDeparture)}</p>
                  </div>

                  <div>
                    <span>Giờ ước tính hạ cánh</span>
                    <p>{formatDateTime(detailRow.estimatedArrival)}</p>
                  </div>

                  <div>
                    <span>Trạng thái</span>
                    <p className={getStatusClassName(detailRow.status)}>
                      {detailRow.status}
                    </p>
                  </div>

                  <div>
                    <span>Lý do gần nhất</span>
                    <p>{detailRow.reason || "Chưa có"}</p>
                  </div>
                </div>
              </div>

              <div className="flight-modal__section">
                <h3>Lịch sử cập nhật</h3>

                {selectedHistory.length > 0 ? (
                  selectedHistory.map((history) => (
                    <article className="flight-history-card" key={history.id}>
                      <div>
                        <strong>
                          {history.oldStatus} → {history.newStatus}
                        </strong>
                        <p>
                          Giờ ước tính:{" "}
                          {formatDateTime(history.oldEstimatedDeparture)} →{" "}
                          {formatDateTime(history.newEstimatedDeparture)}
                        </p>
                      </div>

                      <div>
                        <span>{history.updatedAt}</span>
                        <p>{history.reason}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="flight-modal__empty">
                    Chưa có lịch sử cập nhật cho chuyến bay này.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default FlightManagementPage;
