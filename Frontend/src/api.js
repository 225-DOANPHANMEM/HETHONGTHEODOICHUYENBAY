// Tất cả các lời gọi API đến Backend đều đi qua file này.
// Thay đổi BASE_URL nếu backend chạy ở địa chỉ khác.

const BASE_URL = "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Lỗi không xác định từ server.");
  }

  return data;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ─── FLIGHTS ─────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách chuyến bay.
 * @param {{ date?: string, type?: 'Đến'|'Đi', status?: string }} params
 */
export function getFlights(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/flights${query ? "?" + query : ""}`);
}

/**
 * Tìm kiếm chuyến bay theo từ khóa.
 * @param {string} keyword
 */
export function searchFlights(keyword) {
  return request(`/flights/search?q=${encodeURIComponent(keyword)}`);
}

/**
 * Lấy chi tiết chuyến bay theo số hiệu (VD: VN101).
 * @param {string} soHieu
 */
export function getFlightByCode(soHieu) {
  return request(`/flights/${encodeURIComponent(soHieu)}`);
}

// ─── SCHEDULES ───────────────────────────────────────────────────────────────

/**
 * Cập nhật trạng thái lịch trình (gọi stored procedure).
 * @param {string} maLichTrinh
 * @param {object} payload
 */
export function updateFlightStatus(maLichTrinh, payload) {
  return request(`/schedules/${maLichTrinh}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy lịch sử cập nhật của một lịch trình.
 * @param {string} maLichTrinh
 */
export function getScheduleHistory(maLichTrinh) {
  return request(`/schedules/${maLichTrinh}/history`);
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/users${query ? "?" + query : ""}`);
}

export function createUser(payload) {
  return request("/users", { method: "POST", body: JSON.stringify(payload) });
}

export function updateUser(maTaiKhoan, payload) {
  return request(`/users/${maTaiKhoan}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateUserStatus(maTaiKhoan, trangThai) {
  return request(`/users/${maTaiKhoan}/status`, {
    method: "PATCH",
    body: JSON.stringify({ trangThai }),
  });
}

// ─── DISPATCH ────────────────────────────────────────────────────────────────

export function getGates() {
  return request("/dispatch/gates");
}

export function getBelts() {
  return request("/dispatch/belts");
}

export function getGateAssignments(maLichTrinh) {
  return request(`/dispatch/gate-assignments${maLichTrinh ? "?maLichTrinh=" + maLichTrinh : ""}`);
}

export function assignGate(payload) {
  return request("/dispatch/gate-assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getBeltAssignments(maLichTrinh) {
  return request(`/dispatch/belt-assignments${maLichTrinh ? "?maLichTrinh=" + maLichTrinh : ""}`);
}

export function assignBelt(payload) {
  return request("/dispatch/belt-assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export function getNotifications(maTaiKhoan) {
  return request(`/notifications${maTaiKhoan ? "?maTaiKhoan=" + maTaiKhoan : ""}`);
}

export function getNotificationHistory() {
  return request("/notifications/history");
}

// ─── FOLLOW ──────────────────────────────────────────────────────────────────

export function getFollowedFlights(maTaiKhoan) {
  return request(`/follow/${maTaiKhoan}`);
}

export function followFlight(maTaiKhoan, maLichTrinh) {
  return request("/follow", {
    method: "POST",
    body: JSON.stringify({ maTaiKhoan, maLichTrinh }),
  });
}

export function unfollowFlight(maTaiKhoan, maLichTrinh) {
  return request("/follow", {
    method: "DELETE",
    body: JSON.stringify({ maTaiKhoan, maLichTrinh }),
  });
}

// ─── CATALOG ─────────────────────────────────────────────────────────────────

export function getAirlines() {
  return request("/catalog/airlines");
}

export function getTerminals() {
  return request("/catalog/terminals");
}

export function getCatalogFlights() {
  return request("/catalog/flights");
}

export function createCatalogFlight(payload) {
  return request("/catalog/flights", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createSchedule(payload) {
  return request("/catalog/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export function getReportSummary(date) {
  return request(`/reports/summary${date ? "?date=" + date : ""}`);
}

export function getReportByAirline(date) {
  return request(`/reports/by-airline${date ? "?date=" + date : ""}`);
}

export function getUpdateHistory(date) {
  return request(`/reports/update-history${date ? "?date=" + date : ""}`);
}
