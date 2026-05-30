const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// GET /api/catalog/airlines — danh sách hãng hàng không
router.get("/airlines", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT MaHangHangKhong, MaHang, TenHangHangKhong, QuocGia
      FROM dbo.HANGHANGKHONG
      ORDER BY TenHangHangKhong
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy hãng hàng không:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/catalog/terminals — danh sách nhà ga
router.get("/terminals", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT MaNhaGa, TenNhaGa, LoaiNhaGa, MoTa
      FROM dbo.NHAGA
      ORDER BY TenNhaGa
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy nhà ga:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/catalog/flights — danh sách chuyến bay (CHUYENBAY, không phải lịch trình)
router.get("/flights", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT cb.MaChuyenBay, cb.SoHieuChuyenBay, cb.LoaiChuyenBay, cb.DiemDen, cb.DiemDi,
             hhk.TenHangHangKhong, hhk.MaHang
      FROM dbo.CHUYENBAY cb
      JOIN dbo.HANGHANGKHONG hhk ON hhk.MaHangHangKhong = cb.MaHangHangKhong
      ORDER BY cb.SoHieuChuyenBay
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh mục chuyến bay:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// POST /api/catalog/flights — thêm chuyến bay mới
router.post("/flights", async (req, res) => {
  try {
    await poolConnect;
    const { maHangHangKhong, soHieuChuyenBay, loaiChuyenBay, diemDen, diemDi } = req.body;

    if (!maHangHangKhong || !soHieuChuyenBay || !loaiChuyenBay || !diemDen || !diemDi) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const countResult = await pool.request().query(`SELECT COUNT(*) AS Total FROM dbo.CHUYENBAY`);
    const total = countResult.recordset[0].Total;
    const maChuyenBay = "CB" + String(total + 1).padStart(3, "0");

    await pool
      .request()
      .input("MaChuyenBay", sql.VarChar(10), maChuyenBay)
      .input("MaHangHangKhong", sql.VarChar(10), maHangHangKhong)
      .input("SoHieuChuyenBay", sql.VarChar(10), soHieuChuyenBay)
      .input("LoaiChuyenBay", sql.NVarChar(10), loaiChuyenBay)
      .input("DiemDen", sql.NVarChar(50), diemDen)
      .input("DiemDi", sql.NVarChar(50), diemDi)
      .query(`
        INSERT INTO dbo.CHUYENBAY (MaChuyenBay, MaHangHangKhong, SoHieuChuyenBay, LoaiChuyenBay, DiemDen, DiemDi)
        VALUES (@MaChuyenBay, @MaHangHangKhong, @SoHieuChuyenBay, @LoaiChuyenBay, @DiemDen, @DiemDi)
      `);

    return res.status(201).json({ message: "Thêm chuyến bay thành công.", maChuyenBay });
  } catch (err) {
    console.error("Lỗi thêm chuyến bay:", err);
    if (err.number === 2627) {
      return res.status(409).json({ message: "Số hiệu chuyến bay đã tồn tại." });
    }
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// POST /api/catalog/schedules — thêm lịch trình mới
router.post("/schedules", async (req, res) => {
  try {
    await poolConnect;
    const {
      maChuyenBay,
      ngayBay,
      gioDuKienKhoiHanh,
      gioDuKienHaCanh,
    } = req.body;

    if (!maChuyenBay || !ngayBay || !gioDuKienKhoiHanh || !gioDuKienHaCanh) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const countResult = await pool.request().query(`SELECT COUNT(*) AS Total FROM dbo.LICHTRINH`);
    const total = countResult.recordset[0].Total;
    const maLichTrinh = "LT" + String(total + 1).padStart(3, "0");

    await pool
      .request()
      .input("MaLichTrinh", sql.VarChar(10), maLichTrinh)
      .input("MaChuyenBay", sql.VarChar(10), maChuyenBay)
      .input("NgayBay", sql.Date, ngayBay)
      .input("GioDuKienKhoiHanh", sql.DateTime, new Date(gioDuKienKhoiHanh))
      .input("GioDuKienHaCanh", sql.DateTime, new Date(gioDuKienHaCanh))
      .query(`
        INSERT INTO dbo.LICHTRINH (MaLichTrinh, MaChuyenBay, NgayBay, GioDuKienKhoiHanh, GioDuKienHaCanh)
        VALUES (@MaLichTrinh, @MaChuyenBay, @NgayBay, @GioDuKienKhoiHanh, @GioDuKienHaCanh)
      `);

    return res.status(201).json({ message: "Thêm lịch trình thành công.", maLichTrinh });
  } catch (err) {
    console.error("Lỗi thêm lịch trình:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
