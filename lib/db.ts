import "server-only"
import mysql, { type Pool } from "mysql2/promise"

let _pool: Pool | null = null

export function getPool(): Pool {
  if (_pool) return _pool
  const {
    MYSQL_HOST = "127.0.0.1",
    MYSQL_PORT = "3306",
    MYSQL_USER = "root",
    MYSQL_PASSWORD = "",
    MYSQL_DATABASE = "clinic",
  } = process.env

  _pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z", // return dates in UTC
    dateStrings: false,
  })
  return _pool
}

// Helpers
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params)
  return rows as T[]
}

export async function exec(sql: string, params: any[] = []) {
  await getPool().execute(sql, params)
}

export async function txn<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}
