const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// GET /api/dispatch/gates — danh sách cổng
router.get("/gates", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT c.MaCong, c.TenCong, c.TrangThaiCong, ng.MaNhaGa, ng.TenNhaGa, ng.LoaiNhaGa
      FROM dbo.CONG c
      JOIN dbo.NHAGA ng ON ng.MaNhaGa = c.MaNhaGa
      ORDER BY c.TenCong
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách cổng:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/dispatch/belts — danh sách băng chuyền
router.get("/belts", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT bc.MaBangChuyenHanhLy, bc.TenBangChuyenHanhLy, bc.TrangThaiBangChuyen,
             ng.MaNhaGa, ng.TenNhaGa, ng.LoaiNhaGa
      FROM dbo.BANGCHUYENHANHLY bc
      JOIN dbo.NHAGA ng ON ng.MaNhaGa = bc.MaNhaGa
      ORDER BY bc.TenBangChuyenHanhLy
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách băng chuyền:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/dispatch/gate-assignments — danh sách phân công cổng
router.get("/gate-assignments", async (req, res) => {
  try {
    await poolConnect;
    const { maLichTrinh } = req.query;

    let query = `
      SELECT pcc.MaPhanCongCong, pcc.MaLichTrinh, pcc.MaCong, pcc.LoaiCong,
             pcc.ThoiGianBatDauSuDung, pcc.ThoiGianKetThucSuDung, pcc.DangHienHanh,
             c.TenCong, c.TrangThaiCong
      FROM dbo.PHANCONGCONG pcc
      JOIN dbo.CONG c ON c.MaCong = pcc.MaCong
      WHERE pcc.DangHienHanh = 1
    `;
    const request = pool.request();

    if (maLichTrinh) {
      query += " AND pcc.MaLichTrinh = @MaLichTrinh";
      request.input("MaLichTrinh", sql.VarChar(10), maLichTrinh);
    }

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy phân công cổng:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// POST /api/dispatch/gate-assignments — phân công cổng (gọi stored procedure)
// Body: { maLichTrinh, maCong, loaiCong, thoiGianBatDau, thoiGianKetThuc, maPhanCongCong? }
router.post("/gate-assignments", async (req, res) => {
  try {
    await poolConnect;
    const { maLichTrinh, maCong, loaiCong, thoiGianBatDau, thoiGianKetThuc, maPhanCongCong } = req.body;

    if (!maLichTrinh || !maCong || !loaiCong || !thoiGianBatDau || !thoiGianKetThuc) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const request = pool.request();
    request.input("MaLichTrinh", sql.VarChar(10), maLichTrinh);
    request.input("MaCong", sql.VarChar(10), maCong);
    request.input("LoaiCong", sql.NVarChar(20), loaiCong);
    request.input("ThoiGianBatDauSuDung", sql.DateTime, new Date(thoiGianBatDau));
    request.input("ThoiGianKetThucSuDung", sql.DateTime, new Date(thoiGianKetThuc));
    request.input("MaPhanCongCong", sql.VarChar(10), maPhanCongCong || null);

    await request.execute("dbo.sp_PhanCongCongChoChuyenBay");

    return res.status(201).json({ message: "Phân công cổng thành công." });
  } catch (err) {
    console.error("Lỗi phân công cổng:", err);
    return res.status(400).json({ message: err.message || "Lỗi phân công cổng." });
  }
});

// GET /api/dispatch/belt-assignments — danh sách phân công băng chuyền
router.get("/belt-assignments", async (req, res) => {
  try {
    await poolConnect;
    const { maLichTrinh } = req.query;

    let query = `
      SELECT pcbc.MaPhanCongBangChuyen, pcbc.MaLichTrinh, pcbc.MaBangChuyenHanhLy,
             pcbc.ThoiGianBatDauSuDung, pcbc.ThoiGianKetThucSuDung, pcbc.DangHienHanh,
             bc.TenBangChuyenHanhLy, bc.TrangThaiBangChuyen
      FROM dbo.PHANCONGBANGCHUYEN pcbc
      JOIN dbo.BANGCHUYENHANHLY bc ON bc.MaBangChuyenHanhLy = pcbc.MaBangChuyenHanhLy
      WHERE pcbc.DangHienHanh = 1
    `;
    const request = pool.request();

    if (maLichTrinh) {
      query += " AND pcbc.MaLichTrinh = @MaLichTrinh";
      request.input("MaLichTrinh", sql.VarChar(10), maLichTrinh);
    }

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy phân công băng chuyền:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// POST /api/dispatch/belt-assignments — phân công băng chuyền
// Body: { maLichTrinh, maBangChuyen, thoiGianBatDau, thoiGianKetThuc, maPhanCongBangChuyen? }
router.post("/belt-assignments", async (req, res) => {
  try {
    await poolConnect;
    const { maLichTrinh, maBangChuyen, thoiGianBatDau, thoiGianKetThuc, maPhanCongBangChuyen } = req.body;

    if (!maLichTrinh || !maBangChuyen || !thoiGianBatDau || !thoiGianKetThuc) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const request = pool.request();
    request.input("MaLichTrinh", sql.VarChar(10), maLichTrinh);
    request.input("MaBangChuyenHanhLy", sql.VarChar(10), maBangChuyen);
    request.input("ThoiGianBatDauSuDung", sql.DateTime, new Date(thoiGianBatDau));
    request.input("ThoiGianKetThucSuDung", sql.DateTime, new Date(thoiGianKetThuc));
    request.input("MaPhanCongBangChuyen", sql.VarChar(10), maPhanCongBangChuyen || null);

    await request.execute("dbo.sp_PhanCongBangChuyenChoChuyenBay");

    return res.status(201).json({ message: "Phân công băng chuyền thành công." });
  } catch (err) {
    console.error("Lỗi phân công băng chuyền:", err);
    return res.status(400).json({ message: err.message || "Lỗi phân công băng chuyền." });
  }
});

module.exports = router;
