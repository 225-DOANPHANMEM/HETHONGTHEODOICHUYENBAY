const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// GET /api/follow/:maTaiKhoan — danh sách chuyến bay đang theo dõi
router.get("/:maTaiKhoan", async (req, res) => {
  try {
    await poolConnect;
    const { maTaiKhoan } = req.params;

    const result = await pool
      .request()
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .query(`
        SELECT
          td.MaTheoDoi,
          td.ThoiGianDangKy,
          td.TrangThaiTheoDoi,
          lt.MaLichTrinh,
          lt.NgayBay,
          lt.TrangThaiHienTai,
          lt.GioDuKienKhoiHanh,
          lt.GioUocTinhKhoiHanh,
          cb.SoHieuChuyenBay,
          cb.LoaiChuyenBay,
          cb.DiemDen,
          cb.DiemDi,
          hhk.TenHangHangKhong
        FROM dbo.THEODOICHUYENBAY td
        JOIN dbo.LICHTRINH lt ON lt.MaLichTrinh = td.MaLichTrinh
        JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
        JOIN dbo.HANGHANGKHONG hhk ON hhk.MaHangHangKhong = cb.MaHangHangKhong
        WHERE td.MaTaiKhoan = @MaTaiKhoan
          AND td.TrangThaiTheoDoi = N'Đang theo dõi'
        ORDER BY lt.GioDuKienKhoiHanh ASC
      `);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách theo dõi:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// POST /api/follow — đăng ký theo dõi chuyến bay
// Body: { maTaiKhoan, maLichTrinh }
router.post("/", async (req, res) => {
  try {
    await poolConnect;
    const { maTaiKhoan, maLichTrinh } = req.body;

    if (!maTaiKhoan || !maLichTrinh) {
      return res.status(400).json({ message: "Thiếu maTaiKhoan hoặc maLichTrinh." });
    }

    // Kiểm tra đã theo dõi chưa
    const existing = await pool
      .request()
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .input("MaLichTrinh", sql.VarChar(10), maLichTrinh)
      .query(`
        SELECT MaTheoDoi, TrangThaiTheoDoi
        FROM dbo.THEODOICHUYENBAY
        WHERE MaTaiKhoan = @MaTaiKhoan AND MaLichTrinh = @MaLichTrinh
      `);

    if (existing.recordset.length > 0) {
      const record = existing.recordset[0];
      if (record.TrangThaiTheoDoi === "Đang theo dõi") {
        return res.status(409).json({ message: "Đã theo dõi chuyến bay này rồi." });
      }
      // Nếu đã ngừng theo dõi thì kích hoạt lại
      await pool
        .request()
        .input("MaTheoDoi", sql.VarChar(10), record.MaTheoDoi)
        .query(`
          UPDATE dbo.THEODOICHUYENBAY
          SET TrangThaiTheoDoi = N'Đang theo dõi'
          WHERE MaTheoDoi = @MaTheoDoi
        `);
      return res.json({ message: "Đã theo dõi lại chuyến bay." });
    }

    // Sinh mã mới
    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS Total FROM dbo.THEODOICHUYENBAY
    `);
    const total = countResult.recordset[0].Total;
    const maTheoDoi = "TD" + String(total + 1).padStart(2, "0");

    await pool
      .request()
      .input("MaTheoDoi", sql.VarChar(10), maTheoDoi)
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .input("MaLichTrinh", sql.VarChar(10), maLichTrinh)
      .query(`
        INSERT INTO dbo.THEODOICHUYENBAY (MaTheoDoi, MaTaiKhoan, MaLichTrinh)
        VALUES (@MaTheoDoi, @MaTaiKhoan, @MaLichTrinh)
      `);

    return res.status(201).json({ message: "Theo dõi chuyến bay thành công." });
  } catch (err) {
    console.error("Lỗi theo dõi chuyến bay:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// DELETE /api/follow — hủy theo dõi
// Body: { maTaiKhoan, maLichTrinh }
router.delete("/", async (req, res) => {
  try {
    await poolConnect;
    const { maTaiKhoan, maLichTrinh } = req.body;

    await pool
      .request()
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .input("MaLichTrinh", sql.VarChar(10), maLichTrinh)
      .query(`
        UPDATE dbo.THEODOICHUYENBAY
        SET TrangThaiTheoDoi = N'Ngừng theo dõi'
        WHERE MaTaiKhoan = @MaTaiKhoan AND MaLichTrinh = @MaLichTrinh
      `);

    return res.json({ message: "Đã hủy theo dõi chuyến bay." });
  } catch (err) {
    console.error("Lỗi hủy theo dõi:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
