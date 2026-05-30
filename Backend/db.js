const sql = require("mssql");

const config = {
  server: "localhost",
  database: "QL_ChuyenBay_DaNang",
  port: 1433,                      // port cố định sau khi đã set trong Configuration Manager
  user: "airport_user",            // SQL Server login
  password: "Airport@2026",
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect.catch((err) => {
  console.error("Lỗi kết nối SQL Server:", err.message);
});

module.exports = { sql, pool, poolConnect };
