const BASE_URL = "http://localhost:8080/api/customer";

async function callApi(url) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let message = "Co loi xay ra khi tai du lieu.";
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
    if (Array.isArray(value)) {
      value
        .filter((item) => item !== undefined && item !== null && item !== "")
        .forEach((item) => params.append(key, item));
      return;
    }

    if (value !== undefined && value !== null && value !== "" && value !== "ALL") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return query ? `${BASE_URL}${path}?${query}` : `${BASE_URL}${path}`;
}

export function layDanhSachChuyenBayKhachHang(filters = {}) {
  return callApi(buildUrl("/flights", filters));
}

export function layChiTietChuyenBayKhachHang(identifier) {
  return callApi(`${BASE_URL}/flights/${encodeURIComponent(identifier)}`);
}

export function layThongBaoKhachHang(flightNos = []) {
  return callApi(buildUrl("/notifications", { flightNo: flightNos }));
}
