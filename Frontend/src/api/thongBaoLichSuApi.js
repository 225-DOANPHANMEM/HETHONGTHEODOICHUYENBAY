const BASE_URL = "http://localhost:8080/api/admin/notifications-history";

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
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `${BASE_URL}${path}?${query}` : `${BASE_URL}${path}`;
}

export function layThongKeThongBaoLichSu() {
  return callApi(`${BASE_URL}/statistics`);
}

export function layDanhSachThongBao(filters = {}) {
  return callApi(buildUrl("/notifications", filters));
}

export function layChiTietThongBao(maThongBao) {
  return callApi(`${BASE_URL}/notifications/${maThongBao}`);
}

export function capNhatTrangThaiThongBao(maThongBao, trangThaiGui) {
  return callApi(`${BASE_URL}/notifications/${maThongBao}/status`, {
    method: "PATCH",
    body: JSON.stringify({ trangThaiGui }),
  });
}

export function taoThongBaoThuCong(payload) {
  return callApi(`${BASE_URL}/notifications`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function layDanhSachLichSuCapNhat(filters = {}) {
  return callApi(buildUrl("/histories", filters));
}

export function layChiTietLichSuCapNhat(maLichSuCapNhat) {
  return callApi(`${BASE_URL}/histories/${maLichSuCapNhat}`);
}

export function layPhuongThucThongBao() {
  return callApi(`${BASE_URL}/notification-methods`);
}

export function layTrangThaiGuiThongBao() {
  return callApi(`${BASE_URL}/notification-statuses`);
}

export function layTrangThaiChuyenBayThongBao() {
  return callApi(`${BASE_URL}/flight-statuses`);
}

export function layTaiKhoanThongBaoOptions() {
  return callApi(`${BASE_URL}/accounts/options`);
}

export function layLichTrinhThongBaoOptions() {
  return callApi(`${BASE_URL}/schedules/options`);
}

export function layCongThongBaoOptions() {
  return callApi(`${BASE_URL}/gates/options`);
}

export function layBangChuyenThongBaoOptions() {
  return callApi(`${BASE_URL}/baggage-carousels/options`);
}
