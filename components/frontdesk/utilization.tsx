"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getTodayString, safeParseDate, parseDateString } from "@/lib/date-utils"

type Doctor = {
  id: string
  name: string
  specialization: string
  location: string
}

type Appointment = {
  id: string
  doctorId: string
  timeISO: string
  status: "booked" | "completed" | "canceled" | "rescheduled" | "no-show"
}

type Timeslot = { timeISO: string }

export default function Utilization() {
  const [date, setDate] = useState<string>(getTodayString)
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [slotsByDoctor, setSlotsByDoctor] = useState<Record<string, Timeslot[]>>({})

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [dRes, aRes] = await Promise.all([
          fetch("/api/doctors", { cache: "no-store" }),
          fetch("/api/appointments", { cache: "no-store" }),
        ])
        const djs = await dRes.json()
        const ajs = await aRes.json()
        const docs: Doctor[] = djs.doctors
        setDoctors(docs)
        setAppointments(ajs.appointments)
        // fetch timeslots for each doctor for the selected date
        const pairs = await Promise.all(
          docs.map(async (doc) => {
            const res = await fetch(`/api/doctors/${doc.id}/timeslots?date=${encodeURIComponent(date)}&days=1`)
            const js = await res.json()
            return [doc.id, js.timeslots as Timeslot[]] as const
          }),
        )
        const map: Record<string, Timeslot[]> = {}
        pairs.forEach(([id, slots]) => {
          map[id] = slots
        })
        setSlotsByDoctor(map)
      } finally {
        setLoading(false)
      }
    })()
  }, [date])

  const isToday = useMemo(() => date === getTodayString(), [date])
  const now = new Date()

  const rows = useMemo(() => {
    const selectedDate = parseDateString(date)
    if (!selectedDate) return []
    
    return doctors.map((d) => {
      const dayStart = new Date(selectedDate.getTime())
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDate.getTime())
      dayEnd.setHours(23, 59, 59, 999)
      
      const bookedAll = appointments.filter((a) => {
        if (a.doctorId !== d.id || a.status !== "booked") return false
        const appointmentDate = safeParseDate(a.timeISO)
        if (!appointmentDate) return false
        return appointmentDate.getTime() >= dayStart.getTime() &&
               appointmentDate.getTime() <= dayEnd.getTime()
      })
      
      const bookedFuture = bookedAll.filter((a) => {
        if (!isToday) return true
        const appointmentDate = safeParseDate(a.timeISO)
        return appointmentDate && appointmentDate >= now
      })
      
      const available = (slotsByDoctor[d.id] || []).filter((s) => {
        if (!isToday) return true
        const slotDate = safeParseDate(s.timeISO)
        return slotDate && slotDate >= now
      })
      const total = bookedFuture.length + available.length
      const pct = total === 0 ? 0 : Math.round((bookedFuture.length / total) * 100)
      return {
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        location: d.location,
        booked: bookedFuture.length,
        available: available.length,
        total,
        pct,
      }
    })
  }, [appointments, doctors, slotsByDoctor, date, isToday, now])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Utilization by doctor</CardTitle>
          <CardDescription>Booked over total slots for the selected date</CardDescription>
        </div>
        <div className="grid gap-2 sm:w-[220px]">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {loading ? (
          <>
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No doctors found.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {r.name} — {r.specialization}
                  <span className="ml-2 text-xs text-muted-foreground">({r.location})</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {r.booked}/{r.total} booked ({r.pct}
                  {"%"})
                </Badge>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${r.pct}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={r.pct}
                  role="progressbar"
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
