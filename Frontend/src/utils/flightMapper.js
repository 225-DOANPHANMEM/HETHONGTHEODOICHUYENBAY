/**
 * Chuyển đổi dữ liệu từ API (tiếng Việt) sang format mà các component đang dùng.
 * Giúp không phải sửa toàn bộ UI component.
 */

const STATUS_MAP = {
  "Đã lên lịch": "SCHEDULED",
  "Đang làm thủ tục": "CHECKIN",
  "Đang bay": "IN_AIR",
  "Đã hạ cánh": "LANDED",
  "Hoàn thành": "LANDED",
  "Chậm chuyến": "DELAYED",
  "Hủy chuyến": "CANCELLED",
};

/**
 * Map một record từ API /flights sang shape mà CustomerFlightTable và các trang customer dùng.
 */
export function mapApiFlightToCustomer(record) {
  const scheduledTime = record.GioDuKienKhoiHanh
    ? new Date(record.GioDuKienKhoiHanh).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--";

  const estimatedTime = record.GioUocTinhKhoiHanh
    ? new Date(record.GioUocTinhKhoiHanh).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : scheduledTime;

  const date = record.NgayBay
    ? new Date(record.NgayBay).toISOString().slice(0, 10)
    : "";

  return {
    id: record.MaLichTrinh,
    flightNo: record.SoHieuChuyenBay,
    airline: record.TenHangHangKhong,
    type: record.LoaiChuyenBay === "Đến" ? "DEN" : "DI",
    from: record.DiemDi,
    to: record.DiemDen,
    date,
    scheduledTime,
    estimatedTime,
    gate: record.TenCong || "",
    carousel: record.TenBangChuyen || "",
    status: STATUS_MAP[record.TrangThaiHienTai] || "SCHEDULED",
    note: record.LyDoChamHoacHuy || "",
    // Giữ nguyên dữ liệu gốc để dùng khi cần
    _raw: record,
  };
}

/**
 * Map một record từ API sang shape mà Staff pages dùng.
 */
export function mapApiFlightToStaff(record) {
  const fmt = (dt) =>
    dt
      ? new Date(dt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "";

  const date = record.NgayBay
    ? new Date(record.NgayBay).toISOString().slice(0, 10)
    : "";

  return {
    id: record.MaLichTrinh,
    flightNo: record.SoHieuChuyenBay,
    airline: record.TenHangHangKhong,
    type: record.LoaiChuyenBay === "Đến" ? "DEN" : "DI",
    from: record.DiemDi,
    to: record.DiemDen,
    date,
    aircraft: "",
    plannedDeparture: fmt(record.GioDuKienKhoiHanh),
    plannedArrival: fmt(record.GioDuKienHaCanh),
    estimatedDeparture: fmt(record.GioUocTinhKhoiHanh),
    estimatedArrival: fmt(record.GioUocTinhHaCanh),
    actualDeparture: fmt(record.GioThucTeKhoiHanh),
    actualArrival: fmt(record.GioThucTeHaCanh),
    gate: record.TenCong || "",
    carousel: record.TenBangChuyen || "",
    status: STATUS_MAP[record.TrangThaiHienTai] || "SCHEDULED",
    reason: record.LyDoChamHoacHuy || "",
    _raw: record,
  };
}
