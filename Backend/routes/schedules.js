const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// PUT /api/schedules/:maLichTrinh/status — cập nhật trạng thái (gọi stored procedure)
// Body: { maTaiKhoan, trangThaiMoi, gioUocTinhKhoiHanh, gioUocTinhHaCanh,
//         gioThucTeKhoiHanh, gioThucTeHaCanh, lyDoChamHoacHuy }
router.put("/:maLichTrinh/status", async (req, res) => {
  try {
    await poolConnect;
    const { maLichTrinh } = req.params;
    const {
      maTaiKhoan,
      trangThaiMoi,
      gioUocTinhKhoiHanh,
      gioUocTinhHaCanh,
      gioThucTeKhoiHanh,
      gioThucTeHaCanh,
      lyDoChamHoacHuy,
    } = req.body;

    if (!maTaiKhoan) {
      return res.status(400).json({ message: "Thiếu maTaiKhoan." });
    }

    const request = pool.request();
    request.input("MaLichTrinh", sql.VarChar(10), maLichTrinh);
    request.input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan);
    request.input("TrangThaiMoi", sql.NVarChar(50), trangThaiMoi || null);
    request.input("GioUocTinhKhoiHanh", sql.DateTime, gioUocTinhKhoiHanh ? new Date(gioUocTinhKhoiHanh) : null);
    request.input("GioUocTinhHaCanh", sql.DateTime, gioUocTinhHaCanh ? new Date(gioUocTinhHaCanh) : null);
    request.input("GioThucTeKhoiHanh", sql.DateTime, gioThucTeKhoiHanh ? new Date(gioThucTeKhoiHanh) : null);
    request.input("GioThucTeHaCanh", sql.DateTime, gioThucTeHaCanh ? new Date(gioThucTeHaCanh) : null);
    request.input("LyDoChamHoacHuy", sql.NVarChar(200), lyDoChamHoacHuy || null);

    await request.execute("dbo.sp_CapNhatTinhHinhChuyenBay");

    return res.json({ message: "Cập nhật tình hình chuyến bay thành công." });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    // Trả về message lỗi từ SQL (THROW 5000x)
    return res.status(400).json({ message: err.message || "Lỗi cập nhật." });
  }
});

// GET /api/schedules/:maLichTrinh/history — lịch sử cập nhật của một lịch trình
router.get("/:maLichTrinh/history", async (req, res) => {
  try {
    await poolConnect;
    const { maLichTrinh } = req.params;

    const result = await pool
      .request()
      .input("MaLichTrinh", sql.VarChar(10), maLichTrinh)
      .query(`
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
          tk.TenDangNhap,
          tk.VaiTro
        FROM dbo.LICHSUCAPNHAT ls
        JOIN dbo.TAIKHOAN tk ON tk.MaTaiKhoan = ls.MaTaiKhoan
        WHERE ls.MaLichTrinh = @MaLichTrinh
        ORDER BY ls.ThoiGianCapNhat DESC
      `);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy lịch sử:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
