const BASE_URL = "http://localhost:8080/api/admin/flights";

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

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function buildUrl(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `${BASE_URL}?${query}` : BASE_URL;
}

export function layThongKeChuyenBay() {
  return callApi(`${BASE_URL}/statistics`);
}

export function layDanhSachChuyenBay(filters = {}) {
  return callApi(buildUrl(filters));
}

export function layChiTietChuyenBay(maLichTrinh) {
  return callApi(`${BASE_URL}/${maLichTrinh}`);
}

export function layLichSuChuyenBay(maLichTrinh) {
  return callApi(`${BASE_URL}/${maLichTrinh}/history`);
}

export function themChuyenBay(payload) {
  return callApi(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function capNhatChuyenBay(maLichTrinh, payload) {
  return callApi(`${BASE_URL}/${maLichTrinh}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function capNhatTinhHinhChuyenBay(maLichTrinh, payload) {
  return callApi(`${BASE_URL}/${maLichTrinh}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function luuTruChuyenBay(maLichTrinh, reason) {
  return callApi(`${BASE_URL}/${maLichTrinh}/archive`, {
    method: "PUT",
    body: JSON.stringify({ lyDoXoa: reason }),
  });
}

export const xoaMemChuyenBay = luuTruChuyenBay;

export function layHangHangKhongOptions() {
  return callApi(`${BASE_URL}/airlines/options`);
}

export function layLoaiChuyenBay() {
  return callApi(`${BASE_URL}/types`);
}

export function layTrangThaiChuyenBay() {
  return callApi(`${BASE_URL}/statuses`);
}
