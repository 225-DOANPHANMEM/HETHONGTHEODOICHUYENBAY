const BASE_URL = "http://localhost:8080/api/admin/users";

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

export function layDanhSachNguoiDung(filters = {}) {
  const params = new URLSearchParams();
  if (filters.keyword) params.append("keyword", filters.keyword);
  if (filters.vaiTro) params.append("vaiTro", filters.vaiTro);
  if (filters.trangThai) params.append("trangThai", filters.trangThai);
  const query = params.toString();
  return callApi(query ? `${BASE_URL}?${query}` : BASE_URL);
}

export function layChiTietNguoiDung(maTaiKhoan) {
  return callApi(`${BASE_URL}/${maTaiKhoan}`);
}

export function layThongKeNguoiDung() {
  return callApi(`${BASE_URL}/statistics`);
}

export function layDanhSachVaiTro() {
  return callApi(`${BASE_URL}/roles`);
}

export function layDanhSachTrangThai() {
  return callApi(`${BASE_URL}/statuses`);
}

export function themNguoiDung(payload) {
  return callApi(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function capNhatNguoiDung(maTaiKhoan, payload) {
  return callApi(`${BASE_URL}/${maTaiKhoan}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function khoaTaiKhoan(maTaiKhoan, lyDo) {
  return callApi(`${BASE_URL}/${maTaiKhoan}/lock`, {
    method: "PATCH",
    body: JSON.stringify({ lyDo }),
  });
}

export function moKhoaTaiKhoan(maTaiKhoan) {
  return callApi(`${BASE_URL}/${maTaiKhoan}/unlock`, { method: "PATCH" });
}

export function ngungSuDungTaiKhoan(maTaiKhoan, lyDo) {
  return callApi(`${BASE_URL}/${maTaiKhoan}/deactivate`, {
    method: "PATCH",
    body: JSON.stringify({ lyDo }),
  });
}

export function datLaiMatKhau(maTaiKhoan, matKhauMoi) {
  return callApi(`${BASE_URL}/${maTaiKhoan}/reset-password`, {
    method: "PATCH",
    body: JSON.stringify({ matKhauMoi }),
  });
}
