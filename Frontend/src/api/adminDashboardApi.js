export async function layTongQuanDashboard() {
  const response = await fetch("http://localhost:8080/api/admin/dashboard/tong-quan");

  if (!response.ok) {
    throw new Error("Khong the tai du lieu dashboard");
  }

  return response.json();
}

