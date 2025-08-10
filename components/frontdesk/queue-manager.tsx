"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, UserRoundPlus, AlertTriangle, Trash2 } from "lucide-react"
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

type Doctor = {
  id: string
  name: string
  specialization: string
  gender: "male" | "female" | "other"
  location: string
}

type QueueEntry = {
  id: string
  queueNumber: number
  patientName: string
  status: "waiting" | "with-doctor" | "completed" | "no-show" | "canceled"
  priority: "normal" | "urgent"
  doctorId?: string | null
}

export default function QueueManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [patientName, setPatientName] = useState("")
  const [priority, setPriority] = useState<"normal" | "urgent">("normal")
  const [doctorId, setDoctorId] = useState<string | "unassigned">("unassigned")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  async function load() {
    setLoading(true)
    const [dq, qq] = await Promise.all([fetch("/api/doctors"), fetch("/api/queue")])
    const doctorsData = dq.ok ? await dq.json() : { doctors: [] }
    const queueData = qq.ok ? await qq.json() : { queue: [] }
    setDoctors(doctorsData.doctors)
    setQueue(queueData.queue)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function addToQueue() {
    if (!patientName.trim()) return
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patientName, priority, doctorId: doctorId === "unassigned" ? null : doctorId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setPatientName("")
      setPriority("normal")
      setDoctorId("unassigned")
      await load()
      toast({ description: "Added to queue." })
    } catch (e: any) {
      toast({ description: e?.message || "Failed to add", variant: "destructive" })
    }
  }

  async function updateStatus(id: string, status: QueueEntry["status"]) {
    try {
      const res = await fetch(`/api/queue/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(await res.text())
      await load()
      toast({ description: `Status updated to ${status.replace("-", " ")}.` })
    } catch (e: any) {
      toast({ description: e?.message || "Failed to update status", variant: "destructive" })
    }
  }

  async function togglePriority(id: string, current: QueueEntry["priority"]) {
    try {
      const newPriority = current === "urgent" ? "normal" : "urgent"
      const res = await fetch(`/api/queue/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      })
      if (!res.ok) throw new Error(await res.text())
      await load()
      toast({ description: `Priority changed to ${newPriority}.` })
    } catch (e: any) {
      toast({ description: e?.message || "Failed to update priority", variant: "destructive" })
    }
  }

  async function removeEntry(id: string) {
    try {
      const res = await fetch(`/api/queue/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      await load()
      toast({ description: "Queue entry removed." })
    } catch (e: any) {
      toast({ description: e?.message || "Failed to remove entry", variant: "destructive" })
    }
  }

  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === "urgent" ? -1 : 1
      const order = ["waiting", "with-doctor", "completed", "no-show", "canceled"]
      if (a.status !== b.status) return order.indexOf(a.status) - order.indexOf(b.status)
      return a.queueNumber - b.queueNumber
    })
  }, [queue])

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add walk-in patient</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="patient">Patient name</Label>
            <Input
              id="patient"
              placeholder="e.g., Jane Doe"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Assign doctor (optional)</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v: "normal" | "urgent") => setPriority(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Button onClick={addToQueue} className="w-full md:w-auto">
              <UserRoundPlus className="mr-2 h-4 w-4" />
              Add to queue
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {loading ? (
          <div className="grid gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : sortedQueue.length === 0 ? (
          <div className="text-sm text-muted-foreground">No patients in queue.</div>
        ) : (
          <div className="grid gap-2">
            {sortedQueue.map((q) => {
              const doc = q.doctorId ? doctors.find((d) => d.id === q.doctorId) : undefined
              return (
                <div
                  key={q.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={q.priority === "urgent" ? "destructive" : "secondary"} className="uppercase">
                      {q.priority === "urgent" ? "Urgent" : "Normal"}
                    </Badge>
                    <div className="font-medium">
                      {"#"}
                      {q.queueNumber} — {q.patientName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {doc ? `• ${doc.name} (${doc.specialization})` : "• Unassigned"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {q.status.replace("-", " ")}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(q.id, "waiting")}>
                      <Clock className="mr-2 h-4 w-4" />
                      Waiting
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(q.id, "with-doctor")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      With Doctor
                    </Button>
                    <Button size="sm" onClick={() => updateStatus(q.id, "completed")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completed
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => togglePriority(q.id, q.priority)}>
                      <AlertTriangle className={`h-4 w-4 ${q.priority === "urgent" ? "text-red-600" : ""}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove queue entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The queue number will be lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeEntry(q.id)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
