// Node.js script to verify DB connection, user row, and bcrypt password match.
// Run: node scripts/check-login.ts
// It will read .env.local automatically if env vars are not already set.

import fs from "node:fs"
import path from "node:path"
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"

function loadDotenvLocal() {
  try {
    const p = path.resolve(process.cwd(), ".env.local")
    if (!fs.existsSync(p)) return
    const txt = fs.readFileSync(p, "utf8")
    for (const line of txt.split("\n")) {
      const l = line.trim()
      if (!l || l.startsWith("#")) continue
      const eq = l.indexOf("=")
      if (eq === -1) continue
      const k = l.slice(0, eq).trim()
      const v = l.slice(eq + 1).trim()
      if (!(k in process.env)) process.env[k] = v
    }
  } catch {}
}

async function main() {
  loadDotenvLocal()

  const host = process.env.MYSQL_HOST || "127.0.0.1"
  const port = Number(process.env.MYSQL_PORT || "3306")
  const user = process.env.MYSQL_USER || "root"
  const password = process.env.MYSQL_PASSWORD || ""
  const database = process.env.MYSQL_DATABASE || "clinic"

  console.log("DB config:", { host, port, user, database })

  const conn = await mysql.createConnection({ host, port, user, password, database, timezone: "Z" })
  const [verRow] = await conn.query("SELECT VERSION() AS v")
  console.log("MySQL version:", (verRow as any)[0].v)

  const [schemaRow] = await conn.query("SELECT DATABASE() AS db")
  console.log("Current database:", (schemaRow as any)[0].db)

  const [counts] = await conn.query("SELECT COUNT(*) AS n FROM users")
  console.log("Users count:", (counts as any)[0].n)

  const [rows] = await conn.execute(
    "SELECT id, email, is_active, password_hash, roles FROM users WHERE email = ? LIMIT 1",
    ["frontdesk@clinic.com"],
  )
  const r = (rows as any[])[0]
  if (!r) {
    console.log("Result: user not found in this database. Seed 02/03 or check MYSQL_DATABASE.")
    process.exit(1)
  }
  console.log("User:", {
    id: r.id,
    email: r.email,
    is_active: r.is_active,
    hash_prefix: String(r.password_hash || "").slice(0, 10),
  })

  let roles = r.roles
  try {
    if (typeof roles === "string") roles = JSON.parse(roles)
  } catch {
    roles = []
  }
  console.log("Roles:", roles)

  const ok =
    r.password_hash && String(r.password_hash).startsWith("$2")
      ? await bcrypt.compare("frontdesk123", r.password_hash)
      : false

  console.log("Password check (frontdesk123):", ok ? "MATCH" : "NO MATCH")

  if (!ok) {
    console.log("Tip: update password_hash to a new bcrypt for 'frontdesk123'.")
    console.log("Node one-liner: node -e \"console.log(require('bcryptjs').hashSync('frontdesk123',10))\"")
    console.log("Then run: UPDATE users SET password_hash='YOUR_HASH', is_active=1 WHERE email='frontdesk@clinic.com';")
    process.exit(2)
  }

  console.log("All good: credentials are valid and DB is reachable.")
  await conn.end()
}

main().catch((e) => {
  console.error("Error:", e?.message || e)
  process.exit(1)
})
