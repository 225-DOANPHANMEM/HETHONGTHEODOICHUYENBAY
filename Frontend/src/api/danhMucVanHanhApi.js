const BASE_URL = "http://localhost:8080/api/admin/operation-categories";

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

function buildUrl(path, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `${BASE_URL}${path}?${query}` : `${BASE_URL}${path}`;
}

export function layThongKeDanhMucVanHanh() {
  return callApi(`${BASE_URL}/statistics`);
}

export function layLoaiNhaGa() {
  return callApi(`${BASE_URL}/terminal-types`);
}

export function layTrangThaiTaiNguyen() {
  return callApi(`${BASE_URL}/resource-statuses`);
}

export function layNhaGaOptions() {
  return callApi(`${BASE_URL}/terminals/options`);
}

export function layDanhSachHangHangKhong(filters = {}) {
  return callApi(buildUrl("/airlines", filters));
}

export function layChiTietHangHangKhong(maHangHangKhong) {
  return callApi(`${BASE_URL}/airlines/${maHangHangKhong}`);
}

export function themHangHangKhong(payload) {
  return callApi(`${BASE_URL}/airlines`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function capNhatHangHangKhong(maHangHangKhong, payload) {
  return callApi(`${BASE_URL}/airlines/${maHangHangKhong}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function xoaHangHangKhong(maHangHangKhong) {
  return callApi(`${BASE_URL}/airlines/${maHangHangKhong}`, { method: "DELETE" });
}

export function layDanhSachNhaGa(filters = {}) {
  return callApi(buildUrl("/terminals", filters));
}

export function layChiTietNhaGa(maNhaGa) {
  return callApi(`${BASE_URL}/terminals/${maNhaGa}`);
}

export function themNhaGa(payload) {
  return callApi(`${BASE_URL}/terminals`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function capNhatNhaGa(maNhaGa, payload) {
  return callApi(`${BASE_URL}/terminals/${maNhaGa}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function xoaNhaGa(maNhaGa) {
  return callApi(`${BASE_URL}/terminals/${maNhaGa}`, { method: "DELETE" });
}

export function layDanhSachCong(filters = {}) {
  return callApi(buildUrl("/gates", filters));
}

export function layChiTietCong(maCong) {
  return callApi(`${BASE_URL}/gates/${maCong}`);
}

export function themCong(payload) {
  return callApi(`${BASE_URL}/gates`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function capNhatCong(maCong, payload) {
  return callApi(`${BASE_URL}/gates/${maCong}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function capNhatTrangThaiCong(maCong, trangThaiCong) {
  return callApi(`${BASE_URL}/gates/${maCong}/status`, {
    method: "PATCH",
    body: JSON.stringify({ trangThaiCong }),
  });
}

export function xoaCong(maCong) {
  return callApi(`${BASE_URL}/gates/${maCong}`, { method: "DELETE" });
}

export function layDanhSachBangChuyen(filters = {}) {
  return callApi(buildUrl("/baggage-carousels", filters));
}

export function layChiTietBangChuyen(maBangChuyenHanhLy) {
  return callApi(`${BASE_URL}/baggage-carousels/${maBangChuyenHanhLy}`);
}

export function themBangChuyen(payload) {
  return callApi(`${BASE_URL}/baggage-carousels`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function capNhatBangChuyen(maBangChuyenHanhLy, payload) {
  return callApi(`${BASE_URL}/baggage-carousels/${maBangChuyenHanhLy}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function capNhatTrangThaiBangChuyen(maBangChuyenHanhLy, trangThaiBangChuyen) {
  return callApi(`${BASE_URL}/baggage-carousels/${maBangChuyenHanhLy}/status`, {
    method: "PATCH",
    body: JSON.stringify({ trangThaiBangChuyen }),
  });
}

export function xoaBangChuyen(maBangChuyenHanhLy) {
  return callApi(`${BASE_URL}/baggage-carousels/${maBangChuyenHanhLy}`, { method: "DELETE" });
}
