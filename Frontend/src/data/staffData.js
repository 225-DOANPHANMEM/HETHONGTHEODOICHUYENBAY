const STORAGE_KEYS = {
  flights: "staff_flights",
  history: "staff_update_history",
  notifications: "staff_notifications",
};

export const statusOptions = [
  { value: "CREATED", label: "Tạo mới" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "ON_TIME", label: "Đúng giờ" },
  { value: "CHECKIN", label: "Đang làm thủ tục" },
  { value: "BOARDING", label: "Đang lên máy bay" },
  { value: "DEPARTED", label: "Đã khởi hành" },
  { value: "IN_AIR", label: "Đang bay" },
  { value: "ARRIVED", label: "Đã đến" },
  { value: "LANDED", label: "Đã hạ cánh" },
  { value: "DELAYED", label: "Chậm chuyến" },
  { value: "CANCELLED", label: "Hủy chuyến" },
];

export const staffInfo = {
  code: "NV001",
  fullName: "Nguyễn Văn A",
  position: "Nhân viên điều hành",
  status: "Đang làm việc",
  birthday: "1990-01-01",
  gender: "Nam",
  citizenId: "012345678",
  phone: "0901234567",
  email: "nv001@airport.vn",
  department: "Khối Điều hành",
  shift: "Ca 1",
  address: "Sân bay Quốc tế Đà Nẵng",
};

export const staffFlights = [
  {
    id: 1,
    flightNo: "VN101",
    airline: "Vietnam Airlines",
    type: "DI",
    from: "Đà Nẵng",
    to: "Hà Nội",
    date: "2026-05-01",
    aircraft: "Airbus A321",
    plannedDeparture: "06:00",
    plannedArrival: "07:20",
    estimatedDeparture: "06:00",
    estimatedArrival: "07:20",
    actualDeparture: "",
    actualArrival: "",
    gate: "A01",
    carousel: "",
    status: "SCHEDULED",
    reason: "",
  },
  {
    id: 2,
    flightNo: "VJ203",
    airline: "Vietjet Air",
    type: "DI",
    from: "Đà Nẵng",
    to: "TP. Hồ Chí Minh",
    date: "2026-05-01",
    aircraft: "Airbus A320",
    plannedDeparture: "08:30",
    plannedArrival: "09:50",
    estimatedDeparture: "08:45",
    estimatedArrival: "10:05",
    actualDeparture: "",
    actualArrival: "",
    gate: "A03",
    carousel: "",
    status: "DELAYED",
    reason: "Điều chỉnh lịch khai thác",
  },
  {
    id: 3,
    flightNo: "QH302",
    airline: "Bamboo Airways",
    type: "DEN",
    from: "Hà Nội",
    to: "Đà Nẵng",
    date: "2026-05-01",
    aircraft: "Airbus A320",
    plannedDeparture: "08:00",
    plannedArrival: "09:15",
    estimatedDeparture: "08:00",
    estimatedArrival: "09:15",
    actualDeparture: "",
    actualArrival: "",
    gate: "B02",
    carousel: "Băng chuyền 01",
    status: "IN_AIR",
    reason: "",
  },
  {
    id: 4,
    flightNo: "VN128",
    airline: "Vietnam Airlines",
    type: "DEN",
    from: "TP. Hồ Chí Minh",
    to: "Đà Nẵng",
    date: "2026-05-01",
    aircraft: "Airbus A321",
    plannedDeparture: "09:00",
    plannedArrival: "10:20",
    estimatedDeparture: "09:15",
    estimatedArrival: "10:35",
    actualDeparture: "",
    actualArrival: "",
    gate: "B04",
    carousel: "Băng chuyền 03",
    status: "DELAYED",
    reason: "Thời tiết xấu tại sân bay khởi hành",
  },
];

export const staffUpdateHistory = [
  {
    id: 1,
    flightNo: "VN101",
    airline: "Vietnam Airlines",
    action: "Cập nhật trạng thái chuyến bay",
    oldStatus: "CREATED",
    newStatus: "SCHEDULED",
    employee: "NV001 - Nguyễn Văn A",
    content: "Cập nhật VN101 sang trạng thái Đã lên lịch.",
    createdAt: "2026-05-01 05:30",
  },
  {
    id: 2,
    flightNo: "VJ203",
    airline: "Vietjet Air",
    action: "Cập nhật trạng thái chuyến bay",
    oldStatus: "SCHEDULED",
    newStatus: "DELAYED",
    employee: "NV001 - Nguyễn Văn A",
    content: "Cập nhật VJ203 bị chậm chuyến 15 phút.",
    createdAt: "2026-05-01 08:05",
  },
];

export const staffNotifications = [
  {
    id: 1,
    flightNo: "VJ203",
    title: "Thông báo chậm chuyến",
    content:
      "Chuyến bay VJ203 từ Đà Nẵng đi TP. Hồ Chí Minh dự kiến khởi hành muộn 15 phút.",
    channel: "Email, Push",
    status: "Đã gửi",
    createdAt: "2026-05-01 08:10",
  },
];

function readStorage(key, fallbackData) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallbackData;
  } catch {
    return fallbackData;
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn("Không thể lưu dữ liệu vào localStorage");
  }
}

export function loadStaffFlights() {
  return readStorage(STORAGE_KEYS.flights, staffFlights);
}

export function saveStaffFlights(flights) {
  writeStorage(STORAGE_KEYS.flights, flights);
  return flights;
}

export function loadStaffHistory() {
  return readStorage(STORAGE_KEYS.history, staffUpdateHistory);
}

export function loadStaffUpdateHistory() {
  return loadStaffHistory();
}

export function addStaffHistory(historyItem) {
  const currentHistory = loadStaffHistory();

  const newHistory = {
    id: Date.now(),
    flightNo: historyItem.flightNo || "",
    airline: historyItem.airline || "",
    action: historyItem.action || "Cập nhật chuyến bay",
    oldStatus: historyItem.oldStatus || "",
    newStatus: historyItem.newStatus || "",
    employee: historyItem.employee || "NV001 - Nguyễn Văn A",
    content: historyItem.content || "",
    createdAt:
      historyItem.createdAt ||
      new Date().toLocaleString("vi-VN", {
        hour12: false,
      }),
    ...historyItem,
  };

  const nextHistory = [newHistory, ...currentHistory];
  writeStorage(STORAGE_KEYS.history, nextHistory);

  return newHistory;
}

export function loadStaffNotifications() {
  return readStorage(STORAGE_KEYS.notifications, staffNotifications);
}

export function saveStaffNotifications(notifications) {
  writeStorage(STORAGE_KEYS.notifications, notifications);
  return notifications;
}

export function addStaffNotification(notificationItem) {
  const currentNotifications = loadStaffNotifications();

  const newNotification = {
    id: Date.now(),
    flightNo: notificationItem.flightNo || "",
    title: notificationItem.title || "Thông báo thay đổi chuyến bay",
    content: notificationItem.content || "",
    channel: notificationItem.channel || "Push",
    status: notificationItem.status || "Đã gửi",
    createdAt:
      notificationItem.createdAt ||
      new Date().toLocaleString("vi-VN", {
        hour12: false,
      }),
    ...notificationItem,
  };

  const nextNotifications = [newNotification, ...currentNotifications];
  writeStorage(STORAGE_KEYS.notifications, nextNotifications);

  return newNotification;
}

export function getStatusLabel(status) {
  const foundStatus = statusOptions.find((item) => item.value === status);
  return foundStatus ? foundStatus.label : "Không xác định";
}

export function getStatusClass(status) {
  switch (status) {
    case "CREATED":
      return "status-default";

    case "SCHEDULED":
      return "status-scheduled";

    case "ON_TIME":
      return "status-scheduled";

    case "CHECKIN":
      return "status-checkin";

    case "BOARDING":
      return "status-boarding";

    case "DEPARTED":
      return "status-departed";

    case "IN_AIR":
      return "status-flying";

    case "ARRIVED":
      return "status-landed";

    case "LANDED":
      return "status-landed";

    case "DELAYED":
      return "status-delayed";

    case "CANCELLED":
      return "status-cancelled";

    default:
      return "status-default";
  }
}
