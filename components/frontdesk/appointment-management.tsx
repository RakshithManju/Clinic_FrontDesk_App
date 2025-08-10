"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarClock, RotateCcw, XCircle, Grid3X3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toggle } from "@/components/ui/toggle"
import { getTodayString, safeParseDate, formatTimeDisplay, formatDateTimeDisplay, parseDateString, isSameDay } from "@/lib/date-utils"

type Doctor = {
  id: string
  name: string
  specialization: string
  gender: "male" | "female" | "other"
  location: string
}
type Appointment = {
  id: string
  patientName: string
  doctorId: string
  timeISO: string
  status: "booked" | "completed" | "canceled" | "rescheduled" | "no-show"
}
type Timeslot = { timeISO: string }

export default function AppointmentManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState<string>("")
  const [date, setDate] = useState<string>(getTodayString)
  const [slots, setSlots] = useState<Timeslot[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientName, setPatientName] = useState("")
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [dayView, setDayView] = useState(true)
  const [draggingApptId, setDraggingApptId] = useState<string | null>(null)
  const { toast } = useToast()

  async function loadDoctors() {
    const res = await fetch("/api/doctors")
    const data = await res.json()
    setDoctors(data.doctors)
    if (data.doctors[0]) setDoctorId((prev) => prev || data.doctors[0].id)
  }

  async function loadAppointments() {
    setLoadingAppts(true)
    const url = doctorId ? `/api/appointments?doctorId=${encodeURIComponent(doctorId)}` : "/api/appointments"
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()
    setAppointments(data.appointments)
    setLoadingAppts(false)
  }

  async function loadSlots() {
    if (!doctorId || !date) return
    setLoadingSlots(true)
    try {
      const res = await fetch(`/api/doctors/${doctorId}/timeslots?date=${encodeURIComponent(date)}&days=1`)
      const data = await res.json()
      setSlots(data.timeslots)
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    loadSlots()
    loadAppointments()
  }, [doctorId, date])

  async function book(timeISO: string) {
    if (!patientName.trim()) {
      toast({ description: "Enter patient name first." })
      return
    }
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ patientName, doctorId, timeISO }),
    })
    if (!res.ok) {
      toast({ description: await res.text(), variant: "destructive" })
    } else {
      toast({ description: "Appointment booked." })
      setPatientName("")
      await Promise.all([loadSlots(), loadAppointments()])
    }
  }

  async function cancel(id: string) {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" })
    await loadAppointments()
    await loadSlots()
  }

  async function reschedule(id: string, timeISO: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ timeISO }),
    })
    if (!res.ok) {
      toast({ description: await res.text(), variant: "destructive" })
    } else {
      toast({ description: "Appointment rescheduled." })
    }
    await loadAppointments()
    await loadSlots()
  }

  const upcoming = useMemo(() => {
    const now = Date.now()
    return appointments
      .filter((a) => {
        if (a.status !== "booked") return false
        const appointmentTime = safeParseDate(a.timeISO)
        return appointmentTime && appointmentTime.getTime() >= now
      })
      .sort((a, b) => {
        const aTime = safeParseDate(a.timeISO)?.getTime() || 0
        const bTime = safeParseDate(b.timeISO)?.getTime() || 0
        return aTime - bTime
      })
  }, [appointments])

  const daySlots = useMemo(() => {
    const selectedDate = parseDateString(date)
    if (!selectedDate) return { map: new Map<string, Appointment>() }
    
    const sameDay = appointments.filter((a) => {
      const appointmentDate = safeParseDate(a.timeISO)
      return appointmentDate && isSameDay(appointmentDate, selectedDate)
    })
    
    const map = new Map<string, Appointment>()
    sameDay.forEach((a) => {
      const appointmentDate = safeParseDate(a.timeISO)
      if (appointmentDate) {
        map.set(appointmentDate.toISOString(), a)
      }
    })
    return { map }
  }, [appointments, date])

  function onDragStart(apptId: string) {
    setDraggingApptId(apptId)
  }
  function onDragEnd() {
    setDraggingApptId(null)
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Book an appointment</CardTitle>
          <CardDescription>Select doctor and time</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label>Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.specialization} ({d.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Patient name</Label>
            <Input
              placeholder="e.g., John Smith"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Available timeslots
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {loadingSlots ? (
                <>
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                </>
              ) : slots.length === 0 ? (
                <div className="col-span-2 text-sm text-muted-foreground">No slots available.</div>
              ) : (
                slots.map((s) => {
                  const label = formatTimeDisplay(s.timeISO)
                  if (label === 'Invalid Time') {
                    console.error('Invalid date in slot:', s.timeISO)
                    return null
                  }
                  return (
                    <Button key={s.timeISO} variant="outline" onClick={() => book(s.timeISO)}>
                      {label}
                    </Button>
                  )
                }).filter(Boolean)
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Toggle pressed={dayView} onPressedChange={setDayView} aria-label="Toggle day view">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Day view
            </Toggle>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Upcoming appointments</CardTitle>
          <CardDescription>Drag a booked slot onto another slot to reschedule</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {dayView ? (
            <div className="grid gap-2">
              {loadingSlots ? (
                <div className="grid gap-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {slots.map((s) => {
                    const slotDate = safeParseDate(s.timeISO)
                    if (!slotDate) {
                      console.error('Invalid date in dayview slot:', s.timeISO)
                      return null
                    }
                    const slotISO = slotDate.toISOString()
                    const lbl = formatTimeDisplay(s.timeISO)
                    const ap = daySlots.map.get(slotISO)
                    const isDropTarget = !ap
                    return (
                      <div
                        key={slotISO}
                        className={`rounded border p-2 text-left text-sm transition-colors ${
                          ap
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted aria-[droptarget=true]:ring-2 aria-[droptarget=true]:ring-primary"
                        }`}
                        aria-droptarget={isDropTarget && draggingApptId ? "true" : "false"}
                        onDragOver={(e) => {
                          if (isDropTarget) e.preventDefault()
                        }}
                        onDrop={async (e) => {
                          e.preventDefault()
                          const id = e.dataTransfer.getData("text/plain")
                          if (isDropTarget && id) {
                            await reschedule(id, slotISO)
                          }
                        }}
                      >
                        <div
                          draggable={!!ap}
                          onDragStart={(e) => {
                            if (!ap) return
                            e.dataTransfer.setData("text/plain", ap.id)
                            onDragStart(ap.id)
                          }}
                          onDragEnd={onDragEnd}
                          title={ap ? `Booked: ${ap.patientName}` : "Available"}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <div className="font-medium">{lbl}</div>
                          <div className="text-xs opacity-80">{ap ? ap.patientName : "Available"}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {loadingAppts ? (
            <div className="grid gap-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-sm text-muted-foreground">No upcoming appointments.</div>
          ) : (
            upcoming.map((a) => {
              const d = doctors.find((doc) => doc.id === a.doctorId)
              const dateStr = formatDateTimeDisplay(a.timeISO, { dateStyle: "medium", timeStyle: "short" })
              if (dateStr === 'Invalid Date') {
                console.error('Invalid date in appointment:', a.timeISO)
                return null
              }
              return (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">
                      {a.patientName} — {d ? `${d.name} (${d.specialization})` : "Unknown Doctor"}
                    </div>
                    <div className="text-sm text-muted-foreground">{dateStr}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(newISO) => reschedule(a.id, newISO)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Reschedule to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {slots.map((s) => {
                          const t = safeParseDate(s.timeISO)
                          const lbl = formatTimeDisplay(s.timeISO)
                          if (!t || lbl === 'Invalid Time') {
                            console.error('Invalid date in reschedule slot:', s.timeISO)
                            return null
                          }
                          return (
                            <SelectItem value={t.toISOString()} key={s.timeISO}>
                              {lbl}
                            </SelectItem>
                          )
                        }).filter(Boolean)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => reschedule(a.id, a.timeISO)} aria-label="Keep same time">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Keep
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" aria-label="Cancel">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Back</AlertDialogCancel>
                          <AlertDialogAction onClick={() => cancel(a.id)}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
