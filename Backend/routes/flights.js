const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// Query dùng chung: JOIN đầy đủ thông tin chuyến bay + lịch trình + cổng + băng chuyền
const BASE_FLIGHT_QUERY = `
  SELECT
    lt.MaLichTrinh,
    lt.NgayBay,
    lt.GioDuKienKhoiHanh,
    lt.GioDuKienHaCanh,
    lt.GioUocTinhKhoiHanh,
    lt.GioUocTinhHaCanh,
    lt.GioThucTeKhoiHanh,
    lt.GioThucTeHaCanh,
    lt.TrangThaiHienTai,
    lt.SoPhutCham,
    lt.LyDoChamHoacHuy,
    cb.MaChuyenBay,
    cb.SoHieuChuyenBay,
    cb.LoaiChuyenBay,
    cb.DiemDen,
    cb.DiemDi,
    hhk.MaHang,
    hhk.TenHangHangKhong,
    hhk.QuocGia,
    (
      SELECT TOP 1 c.TenCong
      FROM dbo.PHANCONGCONG pcc
      JOIN dbo.CONG c ON c.MaCong = pcc.MaCong
      WHERE pcc.MaLichTrinh = lt.MaLichTrinh AND pcc.DangHienHanh = 1
    ) AS TenCong,
    (
      SELECT TOP 1 bc.TenBangChuyenHanhLy
      FROM dbo.PHANCONGBANGCHUYEN pcbc
      JOIN dbo.BANGCHUYENHANHLY bc ON bc.MaBangChuyenHanhLy = pcbc.MaBangChuyenHanhLy
      WHERE pcbc.MaLichTrinh = lt.MaLichTrinh AND pcbc.DangHienHanh = 1
    ) AS TenBangChuyen
  FROM dbo.LICHTRINH lt
  JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
  JOIN dbo.HANGHANGKHONG hhk ON hhk.MaHangHangKhong = cb.MaHangHangKhong
  WHERE lt.TrangThaiHienTai <> N'Đã xóa'
`;

// GET /api/flights — lấy tất cả chuyến bay (có thể lọc theo ngày, loại)
router.get("/", async (req, res) => {
  try {
    await poolConnect;
    const { date, type, status } = req.query;

    let query = BASE_FLIGHT_QUERY;
    const conditions = [];
    const request = pool.request();

    if (date) {
      conditions.push("lt.NgayBay = @NgayBay");
      request.input("NgayBay", sql.Date, date);
    }
    if (type) {
      conditions.push("cb.LoaiChuyenBay = @LoaiChuyenBay");
      request.input("LoaiChuyenBay", sql.NVarChar(10), type);
    }
    if (status) {
      conditions.push("lt.TrangThaiHienTai = @TrangThai");
      request.input("TrangThai", sql.NVarChar(50), status);
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY lt.GioDuKienKhoiHanh ASC";

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách chuyến bay:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/flights/search?q=... — tìm kiếm theo số hiệu, điểm đi, điểm đến, hãng bay
router.get("/search", async (req, res) => {
  try {
    await poolConnect;
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm." });
    }

    const keyword = `%${q.trim()}%`;
    const result = await pool
      .request()
      .input("Keyword", sql.NVarChar(100), keyword)
      .query(`
        ${BASE_FLIGHT_QUERY}
        AND (
          cb.SoHieuChuyenBay LIKE @Keyword
          OR cb.DiemDen LIKE @Keyword
          OR cb.DiemDi LIKE @Keyword
          OR hhk.TenHangHangKhong LIKE @Keyword
          OR hhk.MaHang LIKE @Keyword
        )
        ORDER BY lt.GioDuKienKhoiHanh ASC
      `);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi tìm kiếm chuyến bay:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/flights/:soHieu — chi tiết theo số hiệu chuyến bay (VD: VN101)
router.get("/:soHieu", async (req, res) => {
  try {
    await poolConnect;
    const { soHieu } = req.params;

    const result = await pool
      .request()
      .input("SoHieu", sql.VarChar(10), soHieu)
      .query(`
        ${BASE_FLIGHT_QUERY}
        AND cb.SoHieuChuyenBay = @SoHieu
        ORDER BY lt.NgayBay DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy chuyến bay." });
    }

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Lỗi lấy chi tiết chuyến bay:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
