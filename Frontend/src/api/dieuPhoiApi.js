const BASE_URL = "http://localhost:8080/api/admin/dispatch";

async function callApi(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = "Có lỗi xảy ra";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function buildUrl(path, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.append(key, value);
  });
  const query = params.toString();
  return query ? `${BASE_URL}${path}?${query}` : `${BASE_URL}${path}`;
}

export function layThongKeDieuPhoi() {
  return callApi(`${BASE_URL}/statistics`);
}

export function layDanhSachLichTrinhDieuPhoi(filters = {}) {
  return callApi(buildUrl("/schedules", filters));
}

export function layChiTietDieuPhoi(maLichTrinh) {
  return callApi(`${BASE_URL}/schedules/${maLichTrinh}`);
}

export function capNhatTinhHinhDieuPhoi(maLichTrinh, payload) {
  return callApi(`${BASE_URL}/schedules/${maLichTrinh}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function layCongKhaDung(filters = {}) {
  return callApi(buildUrl("/available-gates", filters));
}

export function layBangChuyenKhaDung(filters = {}) {
  return callApi(buildUrl("/available-baggage-carousels", filters));
}

export function phanCongCong(payload) {
  return callApi(`${BASE_URL}/gate-assignments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function phanCongBangChuyen(payload) {
  return callApi(`${BASE_URL}/baggage-assignments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function huyPhanCongCong(maPhanCongCong) {
  return callApi(`${BASE_URL}/gate-assignments/${maPhanCongCong}/deactivate`, { method: "PATCH" });
}

export function huyPhanCongBangChuyen(maPhanCongBangChuyen) {
  return callApi(`${BASE_URL}/baggage-assignments/${maPhanCongBangChuyen}/deactivate`, { method: "PATCH" });
}

export function layNhaGaOptionsDieuPhoi() {
  return callApi(`${BASE_URL}/terminal-options`);
}

export function layLoaiCongDieuPhoi() {
  return callApi(`${BASE_URL}/gate-types`);
}

export function layLoaiChuyenBayDieuPhoi() {
  return callApi(`${BASE_URL}/flight-types`);
}

export function layTrangThaiChuyenBayDieuPhoi() {
  return callApi(`${BASE_URL}/flight-statuses`);
}
