const BASE_URL = "http://localhost:8080/api/admin/auth";

async function callApi(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = "Backend không phản hồi. Vui lòng thử lại sau.";
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

export function dangNhapAdmin(payload) {
  return callApi("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function guiYeuCauKhoiPhucMatKhau(email) {
  return callApi("/forgot-password/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function xacNhanMaKhoiPhuc(email, code) {
  return callApi("/forgot-password/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export function datLaiMatKhauAdmin(payload) {
  return callApi("/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
