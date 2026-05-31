const STORAGE_KEYS = {
  followed: "customer_followed_flights",
};

export const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "CHECKIN", label: "Đang làm thủ tục" },
  { value: "BOARDING", label: "Đang lên máy bay" },
  { value: "DEPARTED", label: "Đã khởi hành" },
  { value: "IN_AIR", label: "Đang bay" },
  { value: "LANDED", label: "Đã hạ cánh" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "DELAYED", label: "Chậm chuyến" },
  { value: "CANCELLED", label: "Hủy chuyến" },
];

export function getStatusLabel(status, fallback = "") {
  const found = statusOptions.find((item) => item.value === status);
  return found ? found.label : fallback || status || "Không xác định";
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
    case "COMPLETED":
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
