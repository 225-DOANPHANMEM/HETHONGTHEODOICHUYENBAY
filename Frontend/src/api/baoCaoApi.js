const BASE_URL = "http://localhost:8080/api/admin/reports";

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

export function layBaoCaoTongQuan(filters = {}) {
  return callApi(buildUrl("/overview", filters));
}

export function layBaoCaoTheoNgay(filters = {}) {
  return callApi(buildUrl("/by-date", filters));
}

export function layBaoCaoTheoTrangThai(filters = {}) {
  return callApi(buildUrl("/by-status", filters));
}

export function layBaoCaoTheoHangBay(filters = {}) {
  return callApi(buildUrl("/by-airline", filters));
}

export function layBaoCaoTaiNguyen(filters = {}) {
  return callApi(buildUrl("/resources", filters));
}

export function layBaoCaoThongBao(filters = {}) {
  return callApi(buildUrl("/notifications", filters));
}

export function layBaoCaoLichSuCapNhat(filters = {}) {
  return callApi(buildUrl("/update-logs", filters));
}

export function taoBaoCaoExportUrl(type = "overview", filters = {}) {
  return buildUrl("/export", { type, ...filters });
}
