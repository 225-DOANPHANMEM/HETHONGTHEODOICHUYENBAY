const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// GET /api/notifications — lấy thông báo (có thể lọc theo tài khoản)
router.get("/", async (req, res) => {
  try {
    await poolConnect;
    const { maTaiKhoan } = req.query;

    let query = `
      SELECT
        tb.MaThongBao,
        tb.NoiDungThongBao,
        tb.TrangThaiMoi,
        tb.GioUocTinhMoi,
        tb.PhuongThucGui,
        tb.TrangThaiGui,
        tb.ThoiGianGui,
        cb.SoHieuChuyenBay,
        lt.MaLichTrinh,
        lt.NgayBay,
        c.TenCong,
        bc.TenBangChuyenHanhLy
      FROM dbo.THONGBAO tb
      JOIN dbo.LICHTRINH lt ON lt.MaLichTrinh = tb.MaLichTrinh
      JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
      LEFT JOIN dbo.CONG c ON c.MaCong = tb.MaCong
      LEFT JOIN dbo.BANGCHUYENHANHLY bc ON bc.MaBangChuyenHanhLy = tb.MaBangChuyenHanhLy
      WHERE 1=1
    `;
    const request = pool.request();

    if (maTaiKhoan) {
      query += " AND tb.MaTaiKhoan = @MaTaiKhoan";
      request.input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan);
    }

    query += " ORDER BY tb.ThoiGianGui DESC";

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy thông báo:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/notifications/history — lịch sử thông báo (admin)
router.get("/history", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT
        tb.MaThongBao,
        tb.NoiDungThongBao,
        tb.TrangThaiMoi,
        tb.PhuongThucGui,
        tb.TrangThaiGui,
        tb.ThoiGianGui,
        cb.SoHieuChuyenBay,
        lt.NgayBay,
        tk.TenDangNhap,
        tk.VaiTro
      FROM dbo.THONGBAO tb
      JOIN dbo.LICHTRINH lt ON lt.MaLichTrinh = tb.MaLichTrinh
      JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
      JOIN dbo.TAIKHOAN tk ON tk.MaTaiKhoan = tb.MaTaiKhoan
      ORDER BY tb.ThoiGianGui DESC
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy lịch sử thông báo:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
