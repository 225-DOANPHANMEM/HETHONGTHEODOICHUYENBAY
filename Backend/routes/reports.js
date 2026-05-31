const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// GET /api/reports/summary — tổng quan thống kê
router.get("/summary", async (req, res) => {
  try {
    await poolConnect;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const request = pool.request();
    request.input("NgayBay", sql.Date, targetDate);

    const result = await request.query(`
      SELECT
        COUNT(*) AS TongChuyenBay,
        SUM(CASE WHEN cb.LoaiChuyenBay = N'Đi' THEN 1 ELSE 0 END) AS ChuyenBayDi,
        SUM(CASE WHEN cb.LoaiChuyenBay = N'Đến' THEN 1 ELSE 0 END) AS ChuyenBayDen,
        SUM(CASE WHEN lt.TrangThaiHienTai = N'Chậm chuyến' THEN 1 ELSE 0 END) AS ChamChuyen,
        SUM(CASE WHEN lt.TrangThaiHienTai = N'Hủy chuyến' THEN 1 ELSE 0 END) AS HuyChuyen,
        SUM(CASE WHEN lt.TrangThaiHienTai = N'Hoàn thành' THEN 1 ELSE 0 END) AS HoanThanh,
        SUM(CASE WHEN lt.TrangThaiHienTai = N'Đang bay' THEN 1 ELSE 0 END) AS DangBay,
        AVG(CAST(lt.SoPhutCham AS FLOAT)) AS TrungBinhPhutCham
      FROM dbo.LICHTRINH lt
      JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
      WHERE lt.NgayBay = @NgayBay
        AND lt.TrangThaiHienTai <> N'Đã xóa'
    `);

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Lỗi lấy báo cáo tổng quan:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/reports/by-airline — thống kê theo hãng bay
router.get("/by-airline", async (req, res) => {
  try {
    await poolConnect;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const request = pool.request();
    request.input("NgayBay", sql.Date, targetDate);

    const result = await request.query(`
      SELECT
        hhk.TenHangHangKhong,
        hhk.MaHang,
        COUNT(*) AS TongChuyenBay,
        SUM(CASE WHEN lt.TrangThaiHienTai = N'Chậm chuyến' THEN 1 ELSE 0 END) AS ChamChuyen,
        SUM(CASE WHEN lt.TrangThaiHienTai = N'Hủy chuyến' THEN 1 ELSE 0 END) AS HuyChuyen,
        AVG(CAST(lt.SoPhutCham AS FLOAT)) AS TrungBinhPhutCham
      FROM dbo.LICHTRINH lt
      JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
      JOIN dbo.HANGHANGKHONG hhk ON hhk.MaHangHangKhong = cb.MaHangHangKhong
      WHERE lt.NgayBay = @NgayBay
        AND lt.TrangThaiHienTai <> N'Đã xóa'
      GROUP BY hhk.TenHangHangKhong, hhk.MaHang
      ORDER BY TongChuyenBay DESC
    `);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy báo cáo theo hãng:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// GET /api/reports/update-history — lịch sử cập nhật toàn bộ (admin)
router.get("/update-history", async (req, res) => {
  try {
    await poolConnect;
    const { date } = req.query;

    let query = `
      SELECT
        ls.MaLichSuCapNhat,
        ls.TrangThaiCu,
        ls.TrangThaiMoi,
        ls.GioUocTinhCu,
        ls.GioUocTinhMoi,
        ls.SoPhutChamMoi,
        ls.LyDoCapNhat,
        ls.NoiDungCapNhat,
        ls.ThoiGianCapNhat,
        cb.SoHieuChuyenBay,
        lt.NgayBay,
        tk.TenDangNhap
      FROM dbo.LICHSUCAPNHAT ls
      JOIN dbo.LICHTRINH lt ON lt.MaLichTrinh = ls.MaLichTrinh
      JOIN dbo.CHUYENBAY cb ON cb.MaChuyenBay = lt.MaChuyenBay
      JOIN dbo.TAIKHOAN tk ON tk.MaTaiKhoan = ls.MaTaiKhoan
      WHERE 1=1
    `;
    const request = pool.request();

    if (date) {
      query += " AND lt.NgayBay = @NgayBay";
      request.input("NgayBay", sql.Date, date);
    }

    query += " ORDER BY ls.ThoiGianCapNhat DESC";

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy lịch sử cập nhật:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
