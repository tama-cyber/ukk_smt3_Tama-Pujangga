const mariadb = require('mariadb');
const { randomBytes, scryptSync } = require("crypto");
require("dotenv").config();

function hashUserPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const url = new URL(databaseUrl);

  const pool = mariadb.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: 5
  });

  let conn;
  try {
    conn = await pool.getConnection();
    const hash = hashUserPassword("123456");

    const res = await conn.query(
      "INSERT INTO users (fullname, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      ["Admin UKK", "admin@gmail.com", hash, "admin"]
    );

    if (res.affectedRows > 0) {
      console.log("✅ SUKSES! Akun admin@gmail.com dengan password 123456 telah dibuat.");
    } else {
      console.log("❌ Gagal membuat user.");
    }

  } catch (err) {
    console.error("❌ Error Database:", err.message);
  } finally {
    if (conn) conn.release();
    pool.end();
  }
  process.exit(0);
}

main();