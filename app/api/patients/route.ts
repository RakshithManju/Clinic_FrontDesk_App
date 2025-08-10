import { requireAuth } from "@/lib/auth"
import { query, exec } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const rows = await query<any>(
    `SELECT id, first_name, last_name, phone, email, created_at FROM patients WHERE clinic_id = 1
     ${q ? "AND (LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?)" : ""}
     ORDER BY id DESC`,
    q ? [like(q), like(q), like(q), like(q)] : [],
  )
  const patients = rows.map((p) => ({
    id: String(p.id),
    firstName: p.first_name,
    lastName: p.last_name,
    phone: p.phone || undefined,
    email: p.email || undefined,
    createdAt: new Date(p.created_at).toISOString(),
  }))
  return Response.json({ patients })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const body = await request.json()
  if (!body.firstName || !body.lastName) return new Response("firstName and lastName are required", { status: 400 })
  await exec(
    "INSERT INTO patients (clinic_id, first_name, last_name, phone, email, created_at) VALUES (1, ?, ?, ?, ?, NOW())",
    [body.firstName, body.lastName, body.phone || null, body.email || null],
  )
  // Fetch last inserted
  const row = await query<any>("SELECT LAST_INSERT_ID() as id")
  const id = row[0].id
  return Response.json(
    {
      patient: {
        id: String(id),
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || undefined,
        email: body.email || undefined,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  )
}

function like(q: string) {
  return `%${q}%`
}
