export async function layTongQuanDashboard() {
  const response = await fetch("http://localhost:8080/api/admin/dashboard/tong-quan");

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu dashboard");
  }

  return response.json();
}

