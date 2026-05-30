const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// GET /api/users — danh sách tài khoản (admin)
router.get("/", async (req, res) => {
  try {
    await poolConnect;
    const { role, status } = req.query;

    let query = `
      SELECT MaTaiKhoan, TenDangNhap, Email, SoDienThoai, VaiTro, TrangThaiTaiKhoan, NgayTao
      FROM dbo.TAIKHOAN
      WHERE 1=1
    `;
    const request = pool.request();

    if (role) {
      query += " AND VaiTro = @VaiTro";
      request.input("VaiTro", sql.NVarChar(30), role);
    }
    if (status) {
      query += " AND TrangThaiTaiKhoan = @TrangThai";
      request.input("TrangThai", sql.NVarChar(20), status);
    }

    query += " ORDER BY NgayTao DESC";

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách người dùng:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// POST /api/users — thêm tài khoản mới
router.post("/", async (req, res) => {
  try {
    await poolConnect;
    const { tenDangNhap, matKhau, soDienThoai, email, vaiTro } = req.body;

    if (!tenDangNhap || !matKhau || !vaiTro) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Tự sinh mã tài khoản
    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS Total FROM dbo.TAIKHOAN
    `);
    const total = countResult.recordset[0].Total;
    const maTaiKhoan = "TK" + String(total + 1).padStart(2, "0");

    await pool
      .request()
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .input("TenDangNhap", sql.VarChar(20), tenDangNhap)
      .input("MatKhau", sql.VarChar(255), matKhau)
      .input("SoDienThoai", sql.VarChar(15), soDienThoai || null)
      .input("Email", sql.VarChar(50), email || null)
      .input("VaiTro", sql.NVarChar(30), vaiTro)
      .query(`
        INSERT INTO dbo.TAIKHOAN (MaTaiKhoan, TenDangNhap, MatKhau, SoDienThoai, Email, VaiTro)
        VALUES (@MaTaiKhoan, @TenDangNhap, @MatKhau, @SoDienThoai, @Email, @VaiTro)
      `);

    return res.status(201).json({ message: "Tạo tài khoản thành công.", maTaiKhoan });
  } catch (err) {
    console.error("Lỗi tạo tài khoản:", err);
    if (err.number === 2627) {
      return res.status(409).json({ message: "Tên đăng nhập hoặc email đã tồn tại." });
    }
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// PUT /api/users/:maTaiKhoan — cập nhật tài khoản
router.put("/:maTaiKhoan", async (req, res) => {
  try {
    await poolConnect;
    const { maTaiKhoan } = req.params;
    const { soDienThoai, email, vaiTro, trangThaiTaiKhoan } = req.body;

    await pool
      .request()
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .input("SoDienThoai", sql.VarChar(15), soDienThoai || null)
      .input("Email", sql.VarChar(50), email || null)
      .input("VaiTro", sql.NVarChar(30), vaiTro || null)
      .input("TrangThai", sql.NVarChar(20), trangThaiTaiKhoan || null)
      .query(`
        UPDATE dbo.TAIKHOAN
        SET
          SoDienThoai = ISNULL(@SoDienThoai, SoDienThoai),
          Email = ISNULL(@Email, Email),
          VaiTro = ISNULL(@VaiTro, VaiTro),
          TrangThaiTaiKhoan = ISNULL(@TrangThai, TrangThaiTaiKhoan)
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    return res.json({ message: "Cập nhật tài khoản thành công." });
  } catch (err) {
    console.error("Lỗi cập nhật tài khoản:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

// PATCH /api/users/:maTaiKhoan/status — khóa / mở khóa tài khoản
router.patch("/:maTaiKhoan/status", async (req, res) => {
  try {
    await poolConnect;
    const { maTaiKhoan } = req.params;
    const { trangThai } = req.body;

    const validStatuses = ["Hoạt động", "Khóa", "Ngừng sử dụng"];
    if (!validStatuses.includes(trangThai)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    await pool
      .request()
      .input("MaTaiKhoan", sql.VarChar(10), maTaiKhoan)
      .input("TrangThai", sql.NVarChar(20), trangThai)
      .query(`
        UPDATE dbo.TAIKHOAN
        SET TrangThaiTaiKhoan = @TrangThai
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    return res.json({ message: "Cập nhật trạng thái tài khoản thành công." });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái tài khoản:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;
