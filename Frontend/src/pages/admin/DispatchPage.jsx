import { useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/DispatchPage.css";

const FLIGHT_STATUSES = [
  "Đã lên lịch",
  "Đang làm thủ tục",
  "Đang bay",
  "Đã hạ cánh",
  "Hoàn thành",
  "Chậm chuyến",
  "Hủy chuyến",
];

const RESOURCE_STATUSES = ["Sẵn sàng", "Đang dùng", "Bảo trì", "Đóng"];

const initialAirlines = [
  { id: "HHK01", code: "VN", name: "Vietnam Airlines" },
  { id: "HHK02", code: "VJ", name: "Vietjet Air" },
  { id: "HHK03", code: "QH", name: "Bamboo Airways" },
  { id: "HHK04", code: "SQ", name: "Singapore Airlines" },
  { id: "HHK05", code: "KE", name: "Korean Air" },
];

const initialTerminals = [
  { id: "NG01", name: "Nhà ga T1", type: "Nội địa" },
  { id: "NG02", name: "Nhà ga T2", type: "Quốc tế" },
  { id: "NG03", name: "Nhà ga hỗn hợp A", type: "Hỗn hợp" },
];

const initialFlights = [
  {
    id: "CB001",
    airlineId: "HHK01",
    flightNumber: "VN101",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Hà Nội",
  },
  {
    id: "CB002",
    airlineId: "HHK02",
    flightNumber: "VJ203",
    type: "Đến",
    departure: "TP.HCM",
    destination: "Đà Nẵng",
  },
  {
    id: "CB003",
    airlineId: "HHK03",
    flightNumber: "QH305",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Singapore",
  },
  {
    id: "CB004",
    airlineId: "HHK04",
    flightNumber: "SQ171",
    type: "Đến",
    departure: "Singapore",
    destination: "Đà Nẵng",
  },
  {
    id: "CB005",
    airlineId: "HHK05",
    flightNumber: "KE462",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "Seoul",
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
    reason: "",
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
    reason: "",
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
    reason: "",
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
    reason: "",
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
    reason: "",
  },
];

const initialGates = [
  { id: "G01", terminalId: "NG01", name: "Cổng 1", status: "Sẵn sàng" },
  { id: "G02", terminalId: "NG01", name: "Cổng 2", status: "Sẵn sàng" },
  { id: "G03", terminalId: "NG02", name: "Cổng 3", status: "Sẵn sàng" },
  { id: "G04", terminalId: "NG02", name: "Cổng 4", status: "Sẵn sàng" },
  { id: "G05", terminalId: "NG03", name: "Cổng 5", status: "Bảo trì" },
];

const initialBelts = [
  { id: "BC01", terminalId: "NG01", name: "Băng chuyền 1", status: "Sẵn sàng" },
  { id: "BC02", terminalId: "NG01", name: "Băng chuyền 2", status: "Sẵn sàng" },
  { id: "BC03", terminalId: "NG02", name: "Băng chuyền 3", status: "Sẵn sàng" },
  {
    id: "BC04",
    terminalId: "NG02",
    name: "Băng chuyền 4",
    status: "Đang dùng",
  },
  { id: "BC05", terminalId: "NG03", name: "Băng chuyền 5", status: "Đóng" },
];

const initialGateAssignments = [
  {
    id: "PCC01",
    scheduleId: "LT001",
    gateId: "G01",
    startTime: "2026-05-01T05:30",
    endTime: "2026-05-01T07:30",
    active: true,
  },
  {
    id: "PCC02",
    scheduleId: "LT002",
    gateId: "G02",
    startTime: "2026-05-01T07:30",
    endTime: "2026-05-01T09:30",
    active: true,
  },
  {
    id: "PCC03",
    scheduleId: "LT003",
    gateId: "G03",
    startTime: "2026-05-01T10:00",
    endTime: "2026-05-01T13:30",
    active: true,
  },
];

const initialBeltAssignments = [
  {
    id: "PCBC01",
    scheduleId: "LT002",
    beltId: "BC01",
    startTime: "2026-05-01T09:00",
    endTime: "2026-05-01T09:45",
    active: true,
  },
  {
    id: "PCBC02",
    scheduleId: "LT004",
    beltId: "BC03",
    startTime: "2026-05-01T16:20",
    endTime: "2026-05-01T17:10",
    active: true,
  },
];

function DispatchPage({ onNavigate }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [gates, setGates] = useState(initialGates);
  const [belts, setBelts] = useState(initialBelts);
  const [gateAssignments, setGateAssignments] = useState(
    initialGateAssignments,
  );
  const [beltAssignments, setBeltAssignments] = useState(
    initialBeltAssignments,
  );
  const [updateHistory, setUpdateHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("LT001");
  const [dateFilter, setDateFilter] = useState("2026-05-01");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
  const [terminalFilter, setTerminalFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [conflictMessage, setConflictMessage] = useState("");

  const [gateForm, setGateForm] = useState({
    gateId: "G01",
    startTime: "2026-05-01T05:30",
    endTime: "2026-05-01T07:30",
  });

  const [beltForm, setBeltForm] = useState({
    beltId: "BC01",
    startTime: "2026-05-01T07:00",
    endTime: "2026-05-01T08:00",
  });

  const airlineById = useMemo(() => {
    return initialAirlines.reduce((map, airline) => {
      map[airline.id] = airline;
      return map;
    }, {});
  }, []);

  const terminalById = useMemo(() => {
    return initialTerminals.reduce((map, terminal) => {
      map[terminal.id] = terminal;
      return map;
    }, {});
  }, []);

  const gateById = useMemo(() => {
    return gates.reduce((map, gate) => {
      map[gate.id] = gate;
      return map;
    }, {});
  }, [gates]);

  const beltById = useMemo(() => {
    return belts.reduce((map, belt) => {
      map[belt.id] = belt;
      return map;
    }, {});
  }, [belts]);

  const dispatchRows = useMemo(() => {
    return schedules.map((schedule) => {
      const flight = initialFlights.find(
        (item) => item.id === schedule.flightId,
      );
      const airline = airlineById[flight?.airlineId];
      const gateAssignment = gateAssignments.find(
        (item) => item.scheduleId === schedule.id && item.active,
      );
      const beltAssignment = beltAssignments.find(
        (item) => item.scheduleId === schedule.id && item.active,
      );

      const gate = gateAssignment ? gateById[gateAssignment.gateId] : null;
      const belt = beltAssignment ? beltById[beltAssignment.beltId] : null;

      return {
        ...schedule,
        flight,
        airline,
        gateAssignment,
        beltAssignment,
        gate,
        belt,
      };
    });
  }, [
    schedules,
    airlineById,
    gates,
    belts,
    gateAssignments,
    beltAssignments,
    gateById,
    beltById,
  ]);

  const selectedRow = dispatchRows.find((row) => row.id === selectedScheduleId);

  const filteredRows = useMemo(() => {
    return dispatchRows.filter((row) => {
      const matchesDate = !dateFilter || row.flightDate === dateFilter;
      const matchesType =
        typeFilter === "Tất cả" || row.flight?.type === typeFilter;
      const matchesStatus =
        statusFilter === "Tất cả" || row.status === statusFilter;

      const resourceTerminalId = row.gate?.terminalId || row.belt?.terminalId;
      const matchesTerminal =
        terminalFilter === "Tất cả" || resourceTerminalId === terminalFilter;

      return matchesDate && matchesType && matchesStatus && matchesTerminal;
    });
  }, [dispatchRows, dateFilter, typeFilter, statusFilter, terminalFilter]);

  const stats = useMemo(() => {
    return {
      total: dispatchRows.length,
      gateAssigned: dispatchRows.filter((row) => row.gate).length,
      beltAssigned: dispatchRows.filter((row) => row.belt).length,
      warning: dispatchRows.filter((row) =>
        ["Chậm chuyến", "Hủy chuyến"].includes(row.status),
      ).length,
    };
  }, [dispatchRows]);

  const formatDateTime = (value) => {
    if (!value) {
      return "Chưa cập nhật";
    }

    return value.replace("T", " ");
  };

  const generateId = (prefix, items) => {
    return `${prefix}${String(items.length + 1).padStart(3, "0")}`;
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

  const isTimeOverlap = (startA, endA, startB, endB) => {
    return (
      new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB)
    );
  };

  const createHistoryAndNotification = (
    scheduleId,
    oldStatus,
    newStatus,
    content,
  ) => {
    const row = dispatchRows.find((item) => item.id === scheduleId);
    const flightNumber = row?.flight?.flightNumber || "Không rõ";

    setUpdateHistory((currentHistory) => [
      {
        id: generateId("LS", currentHistory),
        scheduleId,
        flightNumber,
        oldStatus,
        newStatus,
        content,
        updatedAt: new Date().toLocaleString("vi-VN"),
      },
      ...currentHistory,
    ]);

    setNotifications((currentNotifications) => [
      {
        id: generateId("TB", currentNotifications),
        scheduleId,
        flightNumber,
        content: `Chuyến bay ${flightNumber}: ${content}`,
        method: "Hệ thống",
        sendStatus: "Chờ gửi",
        createdAt: new Date().toLocaleString("vi-VN"),
      },
      ...currentNotifications,
    ]);
  };

  const handleSelectSchedule = (scheduleId) => {
    const row = dispatchRows.find((item) => item.id === scheduleId);

    if (!row) {
      return;
    }

    setSelectedScheduleId(scheduleId);

    setGateForm({
      gateId: row.gate?.id || "G01",
      startTime: row.gateAssignment?.startTime || row.scheduledDeparture,
      endTime: row.gateAssignment?.endTime || row.scheduledArrival,
    });

    setBeltForm({
      beltId: row.belt?.id || "BC01",
      startTime: row.beltAssignment?.startTime || row.scheduledArrival,
      endTime: row.beltAssignment?.endTime || row.scheduledArrival,
    });

    setConflictMessage("");
  };

  const handleChangeGateForm = (event) => {
    const { name, value } = event.target;
    setGateForm({ ...gateForm, [name]: value });
  };

  const handleChangeBeltForm = (event) => {
    const { name, value } = event.target;
    setBeltForm({ ...beltForm, [name]: value });
  };

  const checkGateConflict = () => {
    if (!selectedRow) {
      return "Vui lòng chọn chuyến bay cần phân công cổng.";
    }

    if (!gateForm.gateId || !gateForm.startTime || !gateForm.endTime) {
      return "Vui lòng nhập đủ cổng, thời gian bắt đầu và thời gian kết thúc.";
    }

    if (new Date(gateForm.endTime) <= new Date(gateForm.startTime)) {
      return "Thời gian kết thúc sử dụng cổng phải lớn hơn thời gian bắt đầu.";
    }

    const selectedGate = gateById[gateForm.gateId];

    if (!selectedGate) {
      return "Cổng được chọn không tồn tại.";
    }

    if (!["Sẵn sàng", "Đang dùng"].includes(selectedGate.status)) {
      return `Không thể phân công ${selectedGate.name} vì trạng thái hiện tại là ${selectedGate.status}.`;
    }

    const conflict = gateAssignments.find((assignment) => {
      return (
        assignment.active &&
        assignment.gateId === gateForm.gateId &&
        assignment.scheduleId !== selectedRow.id &&
        isTimeOverlap(
          gateForm.startTime,
          gateForm.endTime,
          assignment.startTime,
          assignment.endTime,
        )
      );
    });

    if (conflict) {
      const conflictRow = dispatchRows.find(
        (row) => row.id === conflict.scheduleId,
      );
      return `${selectedGate.name} bị trùng lịch với chuyến bay ${conflictRow?.flight?.flightNumber || conflict.scheduleId}.`;
    }

    return "";
  };

  const checkBeltConflict = () => {
    if (!selectedRow) {
      return "Vui lòng chọn chuyến bay cần phân công băng chuyền.";
    }

    if (selectedRow.flight.type !== "Đến") {
      return "Băng chuyền hành lý chỉ áp dụng cho chuyến bay đến.";
    }

    if (!beltForm.beltId || !beltForm.startTime || !beltForm.endTime) {
      return "Vui lòng nhập đủ băng chuyền, thời gian bắt đầu và thời gian kết thúc.";
    }

    if (new Date(beltForm.endTime) <= new Date(beltForm.startTime)) {
      return "Thời gian kết thúc sử dụng băng chuyền phải lớn hơn thời gian bắt đầu.";
    }

    const selectedBelt = beltById[beltForm.beltId];

    if (!selectedBelt) {
      return "Băng chuyền được chọn không tồn tại.";
    }

    if (!["Sẵn sàng", "Đang dùng"].includes(selectedBelt.status)) {
      return `Không thể phân công ${selectedBelt.name} vì trạng thái hiện tại là ${selectedBelt.status}.`;
    }

    const conflict = beltAssignments.find((assignment) => {
      return (
        assignment.active &&
        assignment.beltId === beltForm.beltId &&
        assignment.scheduleId !== selectedRow.id &&
        isTimeOverlap(
          beltForm.startTime,
          beltForm.endTime,
          assignment.startTime,
          assignment.endTime,
        )
      );
    });

    if (conflict) {
      const conflictRow = dispatchRows.find(
        (row) => row.id === conflict.scheduleId,
      );
      return `${selectedBelt.name} bị trùng lịch với chuyến bay ${conflictRow?.flight?.flightNumber || conflict.scheduleId}.`;
    }

    return "";
  };

  const handleCheckConflict = () => {
    const gateConflict = checkGateConflict();
    const beltConflict =
      selectedRow?.flight.type === "Đến" ? checkBeltConflict() : "";

    if (gateConflict || beltConflict) {
      setConflictMessage(gateConflict || beltConflict);
      return;
    }

    setConflictMessage("Không phát hiện xung đột. Có thể lưu phân công.");
  };

  const handleAssignGate = (event) => {
    event.preventDefault();

    const gateConflict = checkGateConflict();

    if (gateConflict) {
      setConflictMessage(gateConflict);
      return;
    }

    const oldAssignment = gateAssignments.find(
      (item) => item.scheduleId === selectedRow.id && item.active,
    );

    const newAssignment = {
      id: oldAssignment?.id || generateId("PCC", gateAssignments),
      scheduleId: selectedRow.id,
      gateId: gateForm.gateId,
      startTime: gateForm.startTime,
      endTime: gateForm.endTime,
      active: true,
    };

    setGateAssignments(
      oldAssignment
        ? gateAssignments.map((item) =>
            item.id === oldAssignment.id ? newAssignment : item,
          )
        : [newAssignment, ...gateAssignments],
    );

    setGates(
      gates.map((gate) =>
        gate.id === gateForm.gateId ? { ...gate, status: "Đang dùng" } : gate,
      ),
    );

    createHistoryAndNotification(
      selectedRow.id,
      selectedRow.status,
      selectedRow.status,
      `Phân công ${gateById[gateForm.gateId]?.name} cho chuyến bay`,
    );

    setConflictMessage("Phân công cổng thành công.");
  };

  const handleAssignBelt = (event) => {
    event.preventDefault();

    const beltConflict = checkBeltConflict();

    if (beltConflict) {
      setConflictMessage(beltConflict);
      return;
    }

    const oldAssignment = beltAssignments.find(
      (item) => item.scheduleId === selectedRow.id && item.active,
    );

    const newAssignment = {
      id: oldAssignment?.id || generateId("PCBC", beltAssignments),
      scheduleId: selectedRow.id,
      beltId: beltForm.beltId,
      startTime: beltForm.startTime,
      endTime: beltForm.endTime,
      active: true,
    };

    setBeltAssignments(
      oldAssignment
        ? beltAssignments.map((item) =>
            item.id === oldAssignment.id ? newAssignment : item,
          )
        : [newAssignment, ...beltAssignments],
    );

    setBelts(
      belts.map((belt) =>
        belt.id === beltForm.beltId ? { ...belt, status: "Đang dùng" } : belt,
      ),
    );

    createHistoryAndNotification(
      selectedRow.id,
      selectedRow.status,
      selectedRow.status,
      `Phân công ${beltById[beltForm.beltId]?.name} cho chuyến bay đến`,
    );

    setConflictMessage("Phân công băng chuyền thành công.");
  };

  const getStatusClassName = (status) => {
    const map = {
      "Đã lên lịch": "dispatch-status dispatch-status--scheduled",
      "Đang làm thủ tục": "dispatch-status dispatch-status--checkin",
      "Đang bay": "dispatch-status dispatch-status--flying",
      "Đã hạ cánh": "dispatch-status dispatch-status--landed",
      "Hoàn thành": "dispatch-status dispatch-status--completed",
      "Chậm chuyến": "dispatch-status dispatch-status--delayed",
      "Hủy chuyến": "dispatch-status dispatch-status--cancelled",
      "Sẵn sàng": "dispatch-status dispatch-status--ready",
      "Đang dùng": "dispatch-status dispatch-status--using",
      "Bảo trì": "dispatch-status dispatch-status--maintenance",
      Đóng: "dispatch-status dispatch-status--closed",
    };

    return map[status] || "dispatch-status";
  };

  return (
    <AdminLayout activePage="dispatch" onNavigate={onNavigate}>
      <section className="dispatch-page">
        <div className="dispatch-page__heading">
          <div>
            <p className="dispatch-page__eyebrow">Realtime Operation</p>
            <h1 className="dispatch-page__title">Điều phối vận hành</h1>
            <p className="dispatch-page__description">
              Phân công cổng ra máy bay, băng chuyền hành lý, cập nhật tình hình
              chuyến bay và kiểm tra xung đột tài nguyên theo thời gian thực tại
              sân bay quốc tế Đà Nẵng.
            </p>
          </div>

          <div className="dispatch-page__heading-icon">🧭</div>
        </div>

        <div className="dispatch-page__stats-grid">
          <article className="dispatch-stat-card">
            <span className="dispatch-stat-card__icon">🛫</span>
            <div>
              <p className="dispatch-stat-card__label">Chuyến bay trong ngày</p>
              <h2 className="dispatch-stat-card__value">{stats.total}</h2>
            </div>
          </article>

          <article className="dispatch-stat-card">
            <span className="dispatch-stat-card__icon">🚪</span>
            <div>
              <p className="dispatch-stat-card__label">Đã phân công cổng</p>
              <h2 className="dispatch-stat-card__value">
                {stats.gateAssigned}
              </h2>
            </div>
          </article>

          <article className="dispatch-stat-card">
            <span className="dispatch-stat-card__icon">🧳</span>
            <div>
              <p className="dispatch-stat-card__label">
                Đã phân công băng chuyền
              </p>
              <h2 className="dispatch-stat-card__value">
                {stats.beltAssigned}
              </h2>
            </div>
          </article>

          <article className="dispatch-stat-card">
            <span className="dispatch-stat-card__icon">⚠️</span>
            <div>
              <p className="dispatch-stat-card__label">Chậm / hủy</p>
              <h2 className="dispatch-stat-card__value">{stats.warning}</h2>
            </div>
          </article>
        </div>

        <section className="dispatch-panel">
          <div className="dispatch-panel__header dispatch-panel__header--split">
            <div>
              <h2 className="dispatch-panel__title">Bộ lọc điều phối</h2>
              <p className="dispatch-panel__subtitle">
                Lọc danh sách theo ngày bay, loại chuyến bay, nhà ga hoặc trạng
                thái để điều phối nhanh.
              </p>
            </div>

            <span className="dispatch-panel__count">
              {filteredRows.length} lịch trình
            </span>
          </div>

          <div className="dispatch-toolbar">
            <input
              className="dispatch-form__input"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />

            <select
              className="dispatch-form__input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="Tất cả">Tất cả loại chuyến bay</option>
              <option value="Đi">Chuyến bay đi</option>
              <option value="Đến">Chuyến bay đến</option>
            </select>

            <select
              className="dispatch-form__input"
              value={terminalFilter}
              onChange={(event) => setTerminalFilter(event.target.value)}
            >
              <option value="Tất cả">Tất cả nhà ga</option>
              {initialTerminals.map((terminal) => (
                <option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </option>
              ))}
            </select>

            <select
              className="dispatch-form__input"
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
        </section>

        <div className="dispatch-page__grid">
          <section className="dispatch-panel">
            <div className="dispatch-panel__header">
              <h2 className="dispatch-panel__title">
                Chọn chuyến bay điều phối
              </h2>
              <p className="dispatch-panel__subtitle">
                Thông tin hiện tại của chuyến bay, cổng và băng chuyền liên
                quan.
              </p>
            </div>

            <select
              className="dispatch-form__input"
              value={selectedScheduleId}
              onChange={(event) => handleSelectSchedule(event.target.value)}
            >
              {filteredRows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.flight.flightNumber} - {row.flight.type} -{" "}
                  {row.flight.departure} → {row.flight.destination}
                </option>
              ))}
            </select>

            {selectedRow && (
              <div className="dispatch-current-grid">
                <div className="dispatch-info-card">
                  <span>Số hiệu</span>
                  <strong>{selectedRow.flight.flightNumber}</strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Hãng bay</span>
                  <strong>{selectedRow.airline?.name}</strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Loại chuyến bay</span>
                  <strong>{selectedRow.flight.type}</strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Trạng thái</span>
                  <strong className={getStatusClassName(selectedRow.status)}>
                    {selectedRow.status}
                  </strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Giờ dự kiến</span>
                  <strong>
                    {formatDateTime(selectedRow.scheduledDeparture)}
                  </strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Giờ ước tính</span>
                  <strong>
                    {formatDateTime(selectedRow.estimatedDeparture)}
                  </strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Cổng hiện tại</span>
                  <strong>{selectedRow.gate?.name || "Chưa phân công"}</strong>
                </div>

                <div className="dispatch-info-card">
                  <span>Băng chuyền</span>
                  <strong>
                    {selectedRow.flight.type === "Đến"
                      ? selectedRow.belt?.name || "Chưa phân công"
                      : "Không áp dụng"}
                  </strong>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="dispatch-page__grid">
          <section className="dispatch-panel">
            <div className="dispatch-panel__header">
              <h2 className="dispatch-panel__title">
                Phân công cổng ra máy bay
              </h2>
              <p className="dispatch-panel__subtitle">
                Kiểm tra trạng thái cổng và xung đột thời gian trước khi lưu.
              </p>
            </div>

            <form className="dispatch-form-grid" onSubmit={handleAssignGate}>
              <div>
                <label className="dispatch-form__label">Cổng ra</label>
                <select
                  className="dispatch-form__input"
                  name="gateId"
                  value={gateForm.gateId}
                  onChange={handleChangeGateForm}
                >
                  {gates.map((gate) => (
                    <option key={gate.id} value={gate.id}>
                      {gate.name} - {terminalById[gate.terminalId]?.name} -{" "}
                      {gate.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="dispatch-form__label">Bắt đầu sử dụng</label>
                <input
                  className="dispatch-form__input"
                  type="datetime-local"
                  name="startTime"
                  value={gateForm.startTime}
                  onChange={handleChangeGateForm}
                />
              </div>

              <div>
                <label className="dispatch-form__label">Kết thúc sử dụng</label>
                <input
                  className="dispatch-form__input"
                  type="datetime-local"
                  name="endTime"
                  value={gateForm.endTime}
                  onChange={handleChangeGateForm}
                />
              </div>

              <div className="dispatch-form-grid__actions">
                <button
                  className="dispatch-secondary-button"
                  type="button"
                  onClick={handleCheckConflict}
                >
                  Kiểm tra xung đột
                </button>

                <button className="dispatch-primary-button" type="submit">
                  Lưu phân công cổng
                </button>
              </div>
            </form>
          </section>

          <section className="dispatch-panel">
            <div className="dispatch-panel__header">
              <h2 className="dispatch-panel__title">
                Phân công băng chuyền hành lý
              </h2>
              <p className="dispatch-panel__subtitle">
                Chỉ áp dụng cho chuyến bay đến. Hệ thống sẽ chặn nếu bị trùng
                thời gian hoặc tài nguyên không khả dụng.
              </p>
            </div>

            <form className="dispatch-form-grid" onSubmit={handleAssignBelt}>
              <div>
                <label className="dispatch-form__label">Băng chuyền</label>
                <select
                  className="dispatch-form__input"
                  name="beltId"
                  value={beltForm.beltId}
                  onChange={handleChangeBeltForm}
                  disabled={selectedRow?.flight.type !== "Đến"}
                >
                  {belts.map((belt) => (
                    <option key={belt.id} value={belt.id}>
                      {belt.name} - {terminalById[belt.terminalId]?.name} -{" "}
                      {belt.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="dispatch-form__label">Bắt đầu sử dụng</label>
                <input
                  className="dispatch-form__input"
                  type="datetime-local"
                  name="startTime"
                  value={beltForm.startTime}
                  onChange={handleChangeBeltForm}
                  disabled={selectedRow?.flight.type !== "Đến"}
                />
              </div>

              <div>
                <label className="dispatch-form__label">Kết thúc sử dụng</label>
                <input
                  className="dispatch-form__input"
                  type="datetime-local"
                  name="endTime"
                  value={beltForm.endTime}
                  onChange={handleChangeBeltForm}
                  disabled={selectedRow?.flight.type !== "Đến"}
                />
              </div>

              <div className="dispatch-form-grid__actions">
                <button
                  className="dispatch-secondary-button"
                  type="button"
                  onClick={handleCheckConflict}
                >
                  Kiểm tra xung đột
                </button>

                <button
                  className="dispatch-primary-button"
                  type="submit"
                  disabled={selectedRow?.flight.type !== "Đến"}
                >
                  Lưu phân công băng chuyền
                </button>
              </div>
            </form>
          </section>
        </div>

        {conflictMessage && (
          <div
            className={
              conflictMessage.includes("Không phát hiện") ||
              conflictMessage.includes("thành công")
                ? "dispatch-alert dispatch-alert--success"
                : "dispatch-alert dispatch-alert--warning"
            }
          >
            {conflictMessage}
          </div>
        )}

        <section className="dispatch-panel">
          <div className="dispatch-panel__header dispatch-panel__header--split">
            <div>
              <h2 className="dispatch-panel__title">
                Bảng điều phối chuyến bay
              </h2>
              <p className="dispatch-panel__subtitle">
                Theo dõi tình trạng phân công cổng, băng chuyền và tài nguyên
                theo từng chuyến bay.
              </p>
            </div>
          </div>

          <div className="dispatch-table-wrapper">
            <div className="dispatch-table">
              <div className="dispatch-table__header">
                <span>Số hiệu</span>
                <span>Loại</span>
                <span>Hãng bay</span>
                <span>Giờ ước tính</span>
                <span>Trạng thái</span>
                <span>Cổng</span>
                <span>Băng chuyền</span>
                <span>Thao tác</span>
              </div>

              {filteredRows.map((row) => (
                <div className="dispatch-table__row" key={row.id}>
                  <span className="dispatch-table__code">
                    {row.flight.flightNumber}
                  </span>

                  <span className="dispatch-badge">{row.flight.type}</span>

                  <span className="dispatch-table__text">
                    {row.airline?.name}
                  </span>

                  <span className="dispatch-table__text">
                    {formatDateTime(row.estimatedDeparture)}
                  </span>

                  <span className={getStatusClassName(row.status)}>
                    {row.status}
                  </span>

                  <span className="dispatch-table__text">
                    {row.gate?.name || "Chưa phân công"}
                  </span>

                  <span className="dispatch-table__text">
                    {row.flight.type === "Đến"
                      ? row.belt?.name || "Chưa phân công"
                      : "Không áp dụng"}
                  </span>

                  <div className="dispatch-table__actions">
                    <button
                      className="dispatch-table__button"
                      type="button"
                      onClick={() => handleSelectSchedule(row.id)}
                    >
                      Chọn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="dispatch-page__grid">
          <section className="dispatch-panel">
            <div className="dispatch-panel__header">
              <h2 className="dispatch-panel__title">Lịch sử cập nhật</h2>
              <p className="dispatch-panel__subtitle">
                Mô phỏng dữ liệu ghi vào bảng LICHSUCAPNHAT.
              </p>
            </div>

            <div className="dispatch-log-list">
              {updateHistory.length === 0 && (
                <p className="dispatch-empty-text">
                  Chưa có cập nhật mới trong phiên làm việc này.
                </p>
              )}

              {updateHistory.slice(0, 5).map((history) => (
                <article className="dispatch-log-card" key={history.id}>
                  <div>
                    <strong>{history.flightNumber}</strong>
                    <p>
                      {history.oldStatus} → {history.newStatus}
                    </p>
                  </div>
                  <div>
                    <span>{history.updatedAt}</span>
                    <p>{history.content}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dispatch-panel">
            <div className="dispatch-panel__header">
              <h2 className="dispatch-panel__title">Thông báo đã tạo</h2>
              <p className="dispatch-panel__subtitle">
                Mô phỏng dữ liệu sinh tự động vào bảng THONGBAO.
              </p>
            </div>

            <div className="dispatch-log-list">
              {notifications.length === 0 && (
                <p className="dispatch-empty-text">
                  Chưa có thông báo mới trong phiên làm việc này.
                </p>
              )}

              {notifications.slice(0, 5).map((notification) => (
                <article className="dispatch-log-card" key={notification.id}>
                  <div>
                    <strong>{notification.flightNumber}</strong>
                    <p>{notification.content}</p>
                  </div>
                  <div>
                    <span>{notification.createdAt}</span>
                    <p>
                      {notification.method} - {notification.sendStatus}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AdminLayout>
  );
}

export default DispatchPage;
