import { useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/ReportPage.css";

const REPORT_PERIODS = ["Ngày", "Tuần", "Tháng"];

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
  {
    id: "CB006",
    airlineId: "HHK01",
    flightNumber: "VN155",
    type: "Đến",
    departure: "Hà Nội",
    destination: "Đà Nẵng",
  },
  {
    id: "CB007",
    airlineId: "HHK02",
    flightNumber: "VJ701",
    type: "Đi",
    departure: "Đà Nẵng",
    destination: "TP.HCM",
  },
  {
    id: "CB008",
    airlineId: "HHK04",
    flightNumber: "SQ173",
    type: "Đến",
    departure: "Singapore",
    destination: "Đà Nẵng",
  },
];

const initialSchedules = [
  {
    id: "LT001",
    flightId: "CB001",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T06:00",
    estimatedDeparture: "2026-05-01T06:00",
    scheduledArrival: "2026-05-01T07:20",
    estimatedArrival: "2026-05-01T07:20",
    status: "Đã lên lịch",
    delayMinutes: 0,
  },
  {
    id: "LT002",
    flightId: "CB002",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T08:00",
    estimatedDeparture: "2026-05-01T08:25",
    scheduledArrival: "2026-05-01T09:15",
    estimatedArrival: "2026-05-01T09:40",
    status: "Chậm chuyến",
    delayMinutes: 25,
  },
  {
    id: "LT003",
    flightId: "CB003",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T10:30",
    estimatedDeparture: "2026-05-01T11:00",
    scheduledArrival: "2026-05-01T13:15",
    estimatedArrival: "2026-05-01T13:45",
    status: "Chậm chuyến",
    delayMinutes: 30,
  },
  {
    id: "LT004",
    flightId: "CB004",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T14:00",
    estimatedDeparture: "2026-05-01T14:00",
    scheduledArrival: "2026-05-01T16:40",
    estimatedArrival: "2026-05-01T16:40",
    status: "Đã hạ cánh",
    delayMinutes: 0,
  },
  {
    id: "LT005",
    flightId: "CB005",
    flightDate: "2026-05-01",
    scheduledDeparture: "2026-05-01T18:00",
    estimatedDeparture: "2026-05-01T18:00",
    scheduledArrival: "2026-05-01T22:30",
    estimatedArrival: "2026-05-01T22:30",
    status: "Đang bay",
    delayMinutes: 0,
  },
  {
    id: "LT006",
    flightId: "CB006",
    flightDate: "2026-05-02",
    scheduledDeparture: "2026-05-02T07:00",
    estimatedDeparture: "2026-05-02T07:10",
    scheduledArrival: "2026-05-02T08:20",
    estimatedArrival: "2026-05-02T08:30",
    status: "Hoàn thành",
    delayMinutes: 10,
  },
  {
    id: "LT007",
    flightId: "CB007",
    flightDate: "2026-05-02",
    scheduledDeparture: "2026-05-02T09:00",
    estimatedDeparture: "2026-05-02T09:00",
    scheduledArrival: "2026-05-02T10:10",
    estimatedArrival: "2026-05-02T10:10",
    status: "Hủy chuyến",
    delayMinutes: 0,
  },
  {
    id: "LT008",
    flightId: "CB008",
    flightDate: "2026-05-03",
    scheduledDeparture: "2026-05-03T13:30",
    estimatedDeparture: "2026-05-03T14:20",
    scheduledArrival: "2026-05-03T16:10",
    estimatedArrival: "2026-05-03T17:00",
    status: "Chậm chuyến",
    delayMinutes: 50,
  },
];

const initialGateAssignments = [
  { id: "PCC01", scheduleId: "LT001", gateName: "Cổng 1" },
  { id: "PCC02", scheduleId: "LT002", gateName: "Cổng 2" },
  { id: "PCC03", scheduleId: "LT003", gateName: "Cổng 3" },
  { id: "PCC04", scheduleId: "LT004", gateName: "Cổng 4" },
  { id: "PCC05", scheduleId: "LT005", gateName: "Cổng 5" },
  { id: "PCC06", scheduleId: "LT006", gateName: "Cổng 1" },
  { id: "PCC07", scheduleId: "LT007", gateName: "Cổng 2" },
  { id: "PCC08", scheduleId: "LT008", gateName: "Cổng 4" },
];

const initialBeltAssignments = [
  { id: "PCBC01", scheduleId: "LT002", beltName: "Băng chuyền 1" },
  { id: "PCBC02", scheduleId: "LT004", beltName: "Băng chuyền 3" },
  { id: "PCBC03", scheduleId: "LT006", beltName: "Băng chuyền 2" },
  { id: "PCBC04", scheduleId: "LT008", beltName: "Băng chuyền 3" },
];

const initialUpdateHistory = [
  {
    id: "LS01",
    scheduleId: "LT001",
    accountName: "admin01",
    flightNumber: "VN101",
    updatedAt: "2026-05-01T05:00",
    content: "Khởi tạo lịch trình",
  },
  {
    id: "LS02",
    scheduleId: "LT002",
    accountName: "dieuphoi01",
    flightNumber: "VJ203",
    updatedAt: "2026-05-01T07:45",
    content: "Cập nhật chuyến bay chậm 25 phút",
  },
  {
    id: "LS03",
    scheduleId: "LT003",
    accountName: "giamsat01",
    flightNumber: "QH305",
    updatedAt: "2026-05-01T10:00",
    content: "Cập nhật chuyến bay chậm 30 phút",
  },
  {
    id: "LS04",
    scheduleId: "LT004",
    accountName: "nhanvien01",
    flightNumber: "SQ171",
    updatedAt: "2026-05-01T16:42",
    content: "Cập nhật trạng thái đã hạ cánh",
  },
  {
    id: "LS05",
    scheduleId: "LT006",
    accountName: "dieuphoi01",
    flightNumber: "VN155",
    updatedAt: "2026-05-02T08:35",
    content: "Cập nhật hoàn thành chuyến bay",
  },
  {
    id: "LS06",
    scheduleId: "LT007",
    accountName: "admin01",
    flightNumber: "VJ701",
    updatedAt: "2026-05-02T08:10",
    content: "Cập nhật hủy chuyến",
  },
];

const initialNotifications = [
  { id: "TB01", scheduleId: "LT001", sendStatus: "Đã gửi", method: "Hệ thống" },
  { id: "TB02", scheduleId: "LT002", sendStatus: "Đã gửi", method: "Email" },
  { id: "TB03", scheduleId: "LT003", sendStatus: "Chờ gửi", method: "SMS" },
  {
    id: "TB04",
    scheduleId: "LT004",
    sendStatus: "Lỗi gửi",
    method: "Ứng dụng",
  },
  { id: "TB05", scheduleId: "LT006", sendStatus: "Đã gửi", method: "Hệ thống" },
  { id: "TB06", scheduleId: "LT007", sendStatus: "Đã gửi", method: "Email" },
];

function ReportPage({ onNavigate }) {
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-03");
  const [period, setPeriod] = useState("Ngày");

  const airlineById = useMemo(() => {
    return initialAirlines.reduce((map, airline) => {
      map[airline.id] = airline;
      return map;
    }, {});
  }, []);

  const gateByScheduleId = useMemo(() => {
    return initialGateAssignments.reduce((map, item) => {
      map[item.scheduleId] = item.gateName;
      return map;
    }, {});
  }, []);

  const beltByScheduleId = useMemo(() => {
    return initialBeltAssignments.reduce((map, item) => {
      map[item.scheduleId] = item.beltName;
      return map;
    }, {});
  }, []);

  const reportRows = useMemo(() => {
    return initialSchedules
      .map((schedule) => {
        const flight = initialFlights.find(
          (item) => item.id === schedule.flightId,
        );
        const airline = airlineById[flight?.airlineId];

        return {
          ...schedule,
          flight,
          airline,
          gateName: gateByScheduleId[schedule.id] || "Chưa phân công",
          beltName:
            flight?.type === "Đến"
              ? beltByScheduleId[schedule.id] || "Chưa phân công"
              : "Không áp dụng",
        };
      })
      .filter((row) => {
        const matchesFromDate = !fromDate || row.flightDate >= fromDate;
        const matchesToDate = !toDate || row.flightDate <= toDate;

        return matchesFromDate && matchesToDate;
      });
  }, [airlineById, gateByScheduleId, beltByScheduleId, fromDate, toDate]);

  const filteredHistory = useMemo(() => {
    return initialUpdateHistory.filter((item) => {
      const date = item.updatedAt.slice(0, 10);
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  }, [fromDate, toDate]);

  const filteredNotifications = useMemo(() => {
    const scheduleIds = reportRows.map((row) => row.id);
    return initialNotifications.filter((item) =>
      scheduleIds.includes(item.scheduleId),
    );
  }, [reportRows]);

  const groupByDate = (rows) => {
    return rows.reduce((map, row) => {
      const key = row.flightDate;
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});
  };

  const groupByField = (rows, fieldGetter) => {
    return rows.reduce((map, row) => {
      const key = fieldGetter(row);
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});
  };

  const statistics = useMemo(() => {
    const totalFlights = reportRows.length;
    const arrivalFlights = reportRows.filter(
      (row) => row.flight?.type === "Đến",
    ).length;
    const departureFlights = reportRows.filter(
      (row) => row.flight?.type === "Đi",
    ).length;
    const delayedFlights = reportRows.filter(
      (row) => row.status === "Chậm chuyến",
    ).length;
    const cancelledFlights = reportRows.filter(
      (row) => row.status === "Hủy chuyến",
    ).length;
    const completedFlights = reportRows.filter((row) =>
      ["Hoàn thành", "Đã hạ cánh"].includes(row.status),
    ).length;
    const totalDelayMinutes = reportRows.reduce(
      (sum, row) => sum + row.delayMinutes,
      0,
    );
    const averageDelay =
      totalFlights > 0 ? Math.round(totalDelayMinutes / totalFlights) : 0;

    return {
      totalFlights,
      arrivalFlights,
      departureFlights,
      delayedFlights,
      cancelledFlights,
      completedFlights,
      averageDelay,
      updates: filteredHistory.length,
      sentNotifications: filteredNotifications.filter(
        (item) => item.sendStatus === "Đã gửi",
      ).length,
      failedNotifications: filteredNotifications.filter(
        (item) => item.sendStatus === "Lỗi gửi",
      ).length,
    };
  }, [reportRows, filteredHistory, filteredNotifications]);

  const flightsByDate = useMemo(() => groupByDate(reportRows), [reportRows]);

  const flightsByType = useMemo(
    () => groupByField(reportRows, (row) => row.flight?.type || "Không rõ"),
    [reportRows],
  );

  const flightsByStatus = useMemo(
    () => groupByField(reportRows, (row) => row.status),
    [reportRows],
  );

  const gateUsage = useMemo(
    () =>
      groupByField(
        reportRows.filter((row) => row.gateName !== "Chưa phân công"),
        (row) => row.gateName,
      ),
    [reportRows],
  );

  const beltUsage = useMemo(
    () =>
      groupByField(
        reportRows.filter(
          (row) =>
            row.beltName !== "Không áp dụng" &&
            row.beltName !== "Chưa phân công",
        ),
        (row) => row.beltName,
      ),
    [reportRows],
  );

  const updateByAccount = useMemo(() => {
    return filteredHistory.reduce((map, item) => {
      map[item.accountName] = (map[item.accountName] || 0) + 1;
      return map;
    }, {});
  }, [filteredHistory]);

  const delayedFlightRows = useMemo(() => {
    return [...reportRows]
      .filter((row) => row.delayMinutes > 0 || row.status === "Chậm chuyến")
      .sort((a, b) => b.delayMinutes - a.delayMinutes);
  }, [reportRows]);

  const getMaxValue = (dataMap) => {
    const values = Object.values(dataMap);
    return values.length > 0 ? Math.max(...values) : 1;
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "Chưa có";
    }

    return value.replace("T", " ");
  };

  const handleExportCsv = () => {
    const header = [
      "MaLichTrinh",
      "SoHieuChuyenBay",
      "HangBay",
      "Loai",
      "NgayBay",
      "DiemDi",
      "DiemDen",
      "TrangThai",
      "SoPhutCham",
      "Cong",
      "BangChuyen",
    ];

    const rows = reportRows.map((row) => [
      row.id,
      row.flight?.flightNumber,
      row.airline?.name,
      row.flight?.type,
      row.flightDate,
      row.flight?.departure,
      row.flight?.destination,
      row.status,
      row.delayMinutes,
      row.gateName,
      row.beltName,
    ]);

    const csvContent = [header, ...rows]
      .map((line) =>
        line
          .map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-van-hanh-chuyen-bay.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderBarList = (dataMap, emptyText) => {
    const entries = Object.entries(dataMap);
    const maxValue = getMaxValue(dataMap);

    if (entries.length === 0) {
      return <p className="report-empty-text">{emptyText}</p>;
    }

    return (
      <div className="report-bar-list">
        {entries.map(([label, value]) => (
          <div className="report-bar-item" key={label}>
            <div className="report-bar-item__top">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>

            <div className="report-bar-item__track">
              <div
                className="report-bar-item__fill"
                style={{ width: `${Math.max((value / maxValue) * 100, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getStatusClassName = (status) => {
    const map = {
      "Đã lên lịch": "report-status report-status--scheduled",
      "Đang làm thủ tục": "report-status report-status--checkin",
      "Đang bay": "report-status report-status--flying",
      "Đã hạ cánh": "report-status report-status--landed",
      "Hoàn thành": "report-status report-status--completed",
      "Chậm chuyến": "report-status report-status--delayed",
      "Hủy chuyến": "report-status report-status--cancelled",
    };

    return map[status] || "report-status";
  };

  return (
    <AdminLayout activePage="reports" onNavigate={onNavigate}>
      <section className="report-page">
        <div className="report-page__heading">
          <div>
            <p className="report-page__eyebrow">Operational Reports</p>
            <h1 className="report-page__title">Báo cáo vận hành chuyến bay</h1>
            <p className="report-page__description">
              Thống kê tình hình chuyến bay đến/đi, trạng thái vận hành, chuyến
              bay chậm, sử dụng cổng, sử dụng băng chuyền và hoạt động cập nhật
              tại sân bay quốc tế Đà Nẵng.
            </p>
          </div>

          <div className="report-page__heading-icon">📈</div>
        </div>

        <section className="report-panel">
          <div className="report-panel__header report-panel__header--split">
            <div>
              <h2 className="report-panel__title">Bộ lọc báo cáo</h2>
              <p className="report-panel__subtitle">
                Lọc dữ liệu vận hành theo khoảng thời gian và nhóm thống kê.
              </p>
            </div>

            <button
              className="report-export-button"
              type="button"
              onClick={handleExportCsv}
            >
              Xuất CSV
            </button>
          </div>

          <div className="report-filter-grid">
            <div>
              <label className="report-form__label">Từ ngày</label>
              <input
                className="report-form__input"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </div>

            <div>
              <label className="report-form__label">Đến ngày</label>
              <input
                className="report-form__input"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>

            <div>
              <label className="report-form__label">Nhóm thống kê</label>
              <select
                className="report-form__input"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                {REPORT_PERIODS.map((item) => (
                  <option key={item} value={item}>
                    Theo {item.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-filter-note">
              <strong>Phạm vi:</strong>
              <span>
                Báo cáo chỉ thống kê vận hành chuyến bay, không bao gồm bán vé,
                hành khách, doanh thu hoặc thanh toán.
              </span>
            </div>
          </div>
        </section>

        <div className="report-page__stats-grid">
          <article className="report-stat-card">
            <span className="report-stat-card__icon">🛫</span>
            <div>
              <p className="report-stat-card__label">Tổng chuyến bay</p>
              <h2 className="report-stat-card__value">
                {statistics.totalFlights}
              </h2>
            </div>
          </article>

          <article className="report-stat-card">
            <span className="report-stat-card__icon">🛬</span>
            <div>
              <p className="report-stat-card__label">Chuyến bay đến</p>
              <h2 className="report-stat-card__value">
                {statistics.arrivalFlights}
              </h2>
            </div>
          </article>

          <article className="report-stat-card">
            <span className="report-stat-card__icon">🛫</span>
            <div>
              <p className="report-stat-card__label">Chuyến bay đi</p>
              <h2 className="report-stat-card__value">
                {statistics.departureFlights}
              </h2>
            </div>
          </article>

          <article className="report-stat-card">
            <span className="report-stat-card__icon">⏱️</span>
            <div>
              <p className="report-stat-card__label">Chậm trung bình</p>
              <h2 className="report-stat-card__value">
                {statistics.averageDelay} phút
              </h2>
            </div>
          </article>
        </div>

        <div className="report-page__stats-grid report-page__stats-grid--secondary">
          <article className="report-mini-card">
            <p>Chuyến bay chậm</p>
            <strong>{statistics.delayedFlights}</strong>
          </article>

          <article className="report-mini-card">
            <p>Chuyến bay hủy</p>
            <strong>{statistics.cancelledFlights}</strong>
          </article>

          <article className="report-mini-card">
            <p>Đã hoàn tất / hạ cánh</p>
            <strong>{statistics.completedFlights}</strong>
          </article>

          <article className="report-mini-card">
            <p>Số lượt cập nhật</p>
            <strong>{statistics.updates}</strong>
          </article>

          <article className="report-mini-card">
            <p>Thông báo đã gửi</p>
            <strong>{statistics.sentNotifications}</strong>
          </article>

          <article className="report-mini-card">
            <p>Thông báo lỗi</p>
            <strong>{statistics.failedNotifications}</strong>
          </article>
        </div>

        <div className="report-page__grid">
          <section className="report-panel">
            <div className="report-panel__header">
              <h2 className="report-panel__title">
                Thống kê chuyến bay theo thời gian
              </h2>
              <p className="report-panel__subtitle">
                Số lượng chuyến bay được nhóm theo {period.toLowerCase()}.
              </p>
            </div>

            {renderBarList(flightsByDate, "Không có dữ liệu chuyến bay.")}
          </section>

          <section className="report-panel">
            <div className="report-panel__header">
              <h2 className="report-panel__title">Chuyến bay đến / đi</h2>
              <p className="report-panel__subtitle">
                So sánh số lượng chuyến bay theo loại Đến và Đi.
              </p>
            </div>

            {renderBarList(flightsByType, "Không có dữ liệu loại chuyến bay.")}
          </section>
        </div>

        <div className="report-page__grid">
          <section className="report-panel">
            <div className="report-panel__header">
              <h2 className="report-panel__title">
                Thống kê chuyến bay theo trạng thái
              </h2>
              <p className="report-panel__subtitle">
                Theo dõi số chuyến đã lên lịch, đang bay, chậm, hủy hoặc hoàn
                thành.
              </p>
            </div>

            {renderBarList(flightsByStatus, "Không có dữ liệu trạng thái.")}
          </section>

          <section className="report-panel">
            <div className="report-panel__header">
              <h2 className="report-panel__title">Hoạt động cập nhật</h2>
              <p className="report-panel__subtitle">
                Thống kê số lượt cập nhật theo tài khoản vận hành.
              </p>
            </div>

            {renderBarList(updateByAccount, "Không có dữ liệu cập nhật.")}
          </section>
        </div>

        <div className="report-page__grid">
          <section className="report-panel">
            <div className="report-panel__header">
              <h2 className="report-panel__title">Tần suất sử dụng cổng</h2>
              <p className="report-panel__subtitle">
                Thống kê số lần từng cổng ra máy bay được phân công.
              </p>
            </div>

            {renderBarList(gateUsage, "Không có dữ liệu phân công cổng.")}
          </section>

          <section className="report-panel">
            <div className="report-panel__header">
              <h2 className="report-panel__title">
                Tần suất sử dụng băng chuyền
              </h2>
              <p className="report-panel__subtitle">
                Thống kê số lần từng băng chuyền hành lý được sử dụng cho chuyến
                bay đến.
              </p>
            </div>

            {renderBarList(
              beltUsage,
              "Không có dữ liệu phân công băng chuyền.",
            )}
          </section>
        </div>

        <section className="report-panel">
          <div className="report-panel__header report-panel__header--split">
            <div>
              <h2 className="report-panel__title">Danh sách chuyến bay chậm</h2>
              <p className="report-panel__subtitle">
                Danh sách chuyến bay có số phút chậm cao để phục vụ đánh giá vận
                hành.
              </p>
            </div>

            <span className="report-panel__count">
              {delayedFlightRows.length} chuyến
            </span>
          </div>

          <div className="report-table-wrapper">
            <div className="report-table report-table--delayed">
              <div className="report-table__header">
                <span>Số hiệu</span>
                <span>Hãng bay</span>
                <span>Loại</span>
                <span>Ngày bay</span>
                <span>Giờ dự kiến</span>
                <span>Giờ ước tính</span>
                <span>Trạng thái</span>
                <span>Số phút chậm</span>
              </div>

              {delayedFlightRows.map((row) => (
                <div className="report-table__row" key={row.id}>
                  <span className="report-table__code">
                    {row.flight?.flightNumber}
                  </span>

                  <span className="report-table__text">
                    {row.airline?.name}
                  </span>

                  <span className="report-badge">{row.flight?.type}</span>

                  <span className="report-table__text">{row.flightDate}</span>

                  <span className="report-table__text">
                    {formatDateTime(row.scheduledDeparture)}
                  </span>

                  <span className="report-table__text">
                    {formatDateTime(row.estimatedDeparture)}
                  </span>

                  <span className={getStatusClassName(row.status)}>
                    {row.status}
                  </span>

                  <span className="report-table__delay">
                    {row.delayMinutes} phút
                  </span>
                </div>
              ))}
            </div>

            {delayedFlightRows.length === 0 && (
              <div className="report-empty">
                <span>✅</span>
                <p>Không có chuyến bay chậm trong khoảng thời gian này.</p>
              </div>
            )}
          </div>
        </section>

        <section className="report-panel">
          <div className="report-panel__header report-panel__header--split">
            <div>
              <h2 className="report-panel__title">
                Bảng dữ liệu báo cáo tổng hợp
              </h2>
              <p className="report-panel__subtitle">
                Dữ liệu tổng hợp từ chuyến bay, lịch trình, cổng và băng chuyền.
              </p>
            </div>

            <span className="report-panel__count">
              {reportRows.length} bản ghi
            </span>
          </div>

          <div className="report-table-wrapper">
            <div className="report-table report-table--summary">
              <div className="report-table__header">
                <span>Mã LT</span>
                <span>Số hiệu</span>
                <span>Hãng bay</span>
                <span>Loại</span>
                <span>Ngày bay</span>
                <span>Trạng thái</span>
                <span>Chậm</span>
                <span>Cổng</span>
                <span>Băng chuyền</span>
              </div>

              {reportRows.map((row) => (
                <div className="report-table__row" key={row.id}>
                  <span className="report-table__code">{row.id}</span>
                  <span className="report-table__text">
                    {row.flight?.flightNumber}
                  </span>
                  <span className="report-table__text">
                    {row.airline?.name}
                  </span>
                  <span className="report-badge">{row.flight?.type}</span>
                  <span className="report-table__text">{row.flightDate}</span>
                  <span className={getStatusClassName(row.status)}>
                    {row.status}
                  </span>
                  <span className="report-table__text">
                    {row.delayMinutes} phút
                  </span>
                  <span className="report-table__text">{row.gateName}</span>
                  <span className="report-table__text">{row.beltName}</span>
                </div>
              ))}
            </div>

            {reportRows.length === 0 && (
              <div className="report-empty">
                <span>🔎</span>
                <p>Không có dữ liệu trong khoảng thời gian đã chọn.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </AdminLayout>
  );
}

export default ReportPage;
