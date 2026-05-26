const STORAGE_KEYS = {
  followed: "customer_followed_flights",
};

export const customerFlights = [
  {
    id: 1,
    flightNo: "VN128",
    airline: "Vietnam Airlines",
    type: "DEN",
    from: "TP. Hồ Chí Minh",
    to: "Đà Nẵng",
    date: "2026-05-01",
    scheduledTime: "10:20",
    estimatedTime: "10:35",
    gate: "B04",
    carousel: "Băng chuyền 03",
    aircraft: "Airbus A321",
    status: "DELAYED",
    note: "Chuyến bay dự kiến hạ cánh trễ 15 phút do điều kiện khai thác.",
  },
  {
    id: 2,
    flightNo: "QH302",
    airline: "Bamboo Airways",
    type: "DEN",
    from: "Hà Nội",
    to: "Đà Nẵng",
    date: "2026-05-01",
    scheduledTime: "09:15",
    estimatedTime: "09:15",
    gate: "B02",
    carousel: "Băng chuyền 01",
    aircraft: "Airbus A320",
    status: "IN_AIR",
    note: "Chuyến bay đang trên hành trình đến Đà Nẵng.",
  },
  {
    id: 3,
    flightNo: "VU456",
    airline: "Vietravel Airlines",
    type: "DEN",
    from: "Đà Lạt",
    to: "Đà Nẵng",
    date: "2026-05-01",
    scheduledTime: "12:00",
    estimatedTime: "12:00",
    gate: "B01",
    carousel: "Băng chuyền 02",
    aircraft: "Airbus A321",
    status: "SCHEDULED",
    note: "Chuyến bay đúng lịch.",
  },
  {
    id: 4,
    flightNo: "VN101",
    airline: "Vietnam Airlines",
    type: "DI",
    from: "Đà Nẵng",
    to: "Hà Nội",
    date: "2026-05-01",
    scheduledTime: "06:00",
    estimatedTime: "06:00",
    gate: "A01",
    carousel: "",
    aircraft: "Airbus A321",
    status: "BOARDING",
    note: "Hành khách vui lòng có mặt tại cửa ra máy bay A01.",
  },
  {
    id: 5,
    flightNo: "VJ203",
    airline: "Vietjet Air",
    type: "DI",
    from: "Đà Nẵng",
    to: "TP. Hồ Chí Minh",
    date: "2026-05-01",
    scheduledTime: "08:30",
    estimatedTime: "08:45",
    gate: "A03",
    carousel: "",
    aircraft: "Airbus A320",
    status: "DELAYED",
    note: "Chuyến bay khởi hành muộn 15 phút.",
  },
  {
    id: 6,
    flightNo: "BL789",
    airline: "Pacific Airlines",
    type: "DI",
    from: "Đà Nẵng",
    to: "Singapore",
    date: "2026-05-01",
    scheduledTime: "13:40",
    estimatedTime: "13:40",
    gate: "A05",
    carousel: "",
    aircraft: "Airbus A320",
    status: "SCHEDULED",
    note: "Chuyến bay đúng lịch.",
  },
];

export const customerNotifications = [
  {
    id: 1,
    flightNo: "VJ203",
    title: "Chuyến bay VJ203 bị chậm",
    content: "Chuyến bay VJ203 dự kiến khởi hành lúc 08:45 thay vì 08:30.",
    createdAt: "2026-05-01 08:10",
    status: "Chưa đọc",
  },
  {
    id: 2,
    flightNo: "VN128",
    title: "Cập nhật giờ hạ cánh VN128",
    content: "Chuyến bay VN128 dự kiến hạ cánh lúc 10:35 tại sân bay Đà Nẵng.",
    createdAt: "2026-05-01 09:50",
    status: "Đã đọc",
  },
];

export const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "CHECKIN", label: "Đang làm thủ tục" },
  { value: "BOARDING", label: "Đang lên máy bay" },
  { value: "DEPARTED", label: "Đã khởi hành" },
  { value: "IN_AIR", label: "Đang bay" },
  { value: "LANDED", label: "Đã hạ cánh" },
  { value: "DELAYED", label: "Chậm chuyến" },
  { value: "CANCELLED", label: "Hủy chuyến" },
];

export function loadCustomerFlights() {
  return customerFlights;
}

export function loadCustomerNotifications() {
  return customerNotifications;
}

export function getCustomerFlightById(id) {
  return customerFlights.find((flight) => String(flight.id) === String(id));
}

export function getCustomerFlightByNo(flightNo) {
  return customerFlights.find(
    (flight) => flight.flightNo.toLowerCase() === String(flightNo).toLowerCase()
  );
}

export function getStatusLabel(status) {
  const found = statusOptions.find((item) => item.value === status);
  return found ? found.label : "Không xác định";
}

export function getStatusClass(status) {
  switch (status) {
    case "SCHEDULED":
      return "customer-status customer-status--scheduled";
    case "CHECKIN":
      return "customer-status customer-status--checkin";
    case "BOARDING":
      return "customer-status customer-status--boarding";
    case "DEPARTED":
      return "customer-status customer-status--departed";
    case "IN_AIR":
      return "customer-status customer-status--flying";
    case "LANDED":
      return "customer-status customer-status--landed";
    case "DELAYED":
      return "customer-status customer-status--delayed";
    case "CANCELLED":
      return "customer-status customer-status--cancelled";
    default:
      return "customer-status customer-status--default";
  }
}

export function loadFollowedFlights() {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.followed);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function saveFollowedFlights(flightNos) {
  localStorage.setItem(STORAGE_KEYS.followed, JSON.stringify(flightNos));
  return flightNos;
}

export function isFollowingFlight(flightNo) {
  return loadFollowedFlights().includes(flightNo);
}

export function toggleFollowFlight(flightNo) {
  const followed = loadFollowedFlights();
  const exists = followed.includes(flightNo);
  const nextFollowed = exists
    ? followed.filter((item) => item !== flightNo)
    : [flightNo, ...followed];

  saveFollowedFlights(nextFollowed);
  return nextFollowed;
}
