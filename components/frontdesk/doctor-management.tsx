"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ExportCsvButton } from "@/components/export-csv-button"

type Availability = { day: number; start: string; end: string }

type Doctor = {
  id: string
  name: string
  specialization: string
  gender: "male" | "female" | "other"
  location: string
  availability: Availability[]
  active: boolean
}

const specializations = ["General Medicine", "Pediatrics", "Cardiology", "Dermatology", "Orthopedics", "ENT"]
const locations = ["Main Clinic", "Annex A", "Annex B", "Telehealth"]

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [specFilter, setSpecFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const { toast } = useToast()

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (specFilter !== "all") params.set("specialization", specFilter)
    if (locationFilter !== "all") params.set("location", locationFilter)
    const res = await fetch(`/api/doctors?${params.toString()}`)
    const data = await res.json()
    setDoctors(data.doctors)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, specFilter, locationFilter])

  function newDoctorTemplate(): Doctor {
    return {
      id: "",
      name: "",
      specialization: specializations[0] as Doctor["specialization"],
      gender: "other",
      location: locations[0] as Doctor["location"],
      availability: [
        { day: 1, start: "09:00", end: "17:00" },
        { day: 2, start: "09:00", end: "17:00" },
        { day: 3, start: "09:00", end: "17:00" },
        { day: 4, start: "09:00", end: "17:00" },
        { day: 5, start: "09:00", end: "17:00" },
      ],
      active: true,
    }
  }

  function openNew() {
    setEditing(newDoctorTemplate())
    setOpen(true)
  }

  function openEdit(d: Doctor) {
    setEditing(JSON.parse(JSON.stringify(d)))
    setOpen(true)
  }

  async function save() {
    if (!editing) return
    try {
      const method = editing.id ? "PATCH" : "POST"
      const url = editing.id ? `/api/doctors/${editing.id}` : "/api/doctors"
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editing),
      })
      if (!res.ok) throw new Error(await res.text())
      setOpen(false)
      setEditing(null)
      await load()
      toast({ description: "Doctor saved." })
    } catch (e: any) {
      toast({ description: e?.message || "Failed to save", variant: "destructive" })
    }
  }

  async function remove(id: string) {
    await fetch(`/api/doctors/${id}`, { method: "DELETE" })
    await load()
  }

  const columns: ColumnDef<Doctor>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name}
          <div className="text-xs text-muted-foreground">
            {row.original.location} • {row.original.gender}
          </div>
        </div>
      ),
    },
    {
      header: "Specialization",
      accessorKey: "specialization",
      cell: ({ row }) => row.original.specialization,
    },
    {
      header: "Availability",
      accessorKey: "availability",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.availability
            .slice()
            .sort((a, b) => a.day - b.day)
            .map((a, i) => (
              <Badge key={i} variant="secondary" className="text-[11px]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][a.day]} {a.start}–{a.end}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this doctor?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => remove(row.original.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="grid gap-2 sm:flex-1">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Name, specialization, location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid gap-2 sm:w-[220px]">
        <Label>Specialization</Label>
        <Select value={specFilter} onValueChange={setSpecFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {specializations.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 sm:w-[220px]">
        <Label>Location</Label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ExportCsvButton
        data={doctors}
        filename="doctors.csv"
        disabled={loading || doctors.length === 0}
        mapRow={(d) => ({
          id: d.id,
          name: d.name,
          specialization: d.specialization,
          gender: d.gender,
          location: d.location,
          availability: d.availability
            .slice()
            .sort((a, b) => a.day - b.day)
            .map((a) => `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][a.day]} ${a.start}-${a.end}`)
            .join("; "),
        })}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add doctor
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit doctor" : "Add doctor"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Specialization</Label>
                  <Select
                    value={editing.specialization}
                    onValueChange={(v) => setEditing({ ...editing, specialization: v as Doctor["specialization"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select
                    value={editing.gender}
                    onValueChange={(v) => setEditing({ ...editing, gender: v as Doctor["gender"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Select
                    value={editing.location}
                    onValueChange={(v) => setEditing({ ...editing, location: v as Doctor["location"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Weekly availability</Label>
                <div className="grid gap-2">
                  {editing.availability
                    .slice()
                    .sort((a, b) => a.day - b.day)
                    .map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Select
                          value={String(slot.day)}
                          onValueChange={(v) => {
                            const av = [...editing.availability]
                            av[idx] = { ...av[idx], day: Number(v) }
                            setEditing({ ...editing, availability: av })
                          }}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const av = [...editing.availability]
                            av[idx] = { ...av[idx], start: e.target.value }
                            setEditing({ ...editing, availability: av })
                          }}
                          className="w-[130px]"
                        />
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const av = [...editing.availability]
                            av[idx] = { ...av[idx], end: e.target.value }
                            setEditing({ ...editing, availability: av })
                          }}
                          className="w-[130px]"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            const av = editing.availability.filter((_, i) => i !== idx)
                            setEditing({ ...editing, availability: av })
                          }}
                          aria-label="Remove availability"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          availability: [...editing.availability, { day: 1, start: "09:00", end: "17:00" }],
                        })
                      }
                    >
                      Add day
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={save}>
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>Manage doctors and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={doctors} toolbar={toolbar} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
