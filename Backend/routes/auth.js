const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// POST /api/auth/login
// Body: { username, password, role } — role: "Quản trị" | "Điều phối"
router.post("/login", async (req, res) => {
  try {
    await poolConnect;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu." });
    }

    const result = await pool
      .request()
      .input("TenDangNhap", sql.VarChar(20), username)
      .input("MatKhau", sql.VarChar(255), password)
      .query(`
        SELECT MaTaiKhoan, TenDangNhap, Email, SoDienThoai, VaiTro, TrangThaiTaiKhoan
        FROM dbo.TAIKHOAN
        WHERE TenDangNhap = @TenDangNhap
          AND MatKhau = @MatKhau
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    const user = result.recordset[0];

    if (user.TrangThaiTaiKhoan !== "Hoạt động") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa hoặc ngừng sử dụng." });
    }

    return res.json({
      maTaiKhoan: user.MaTaiKhoan,
      tenDangNhap: user.TenDangNhap,
      email: user.Email,
      soDienThoai: user.SoDienThoai,
      vaiTro: user.VaiTro,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
