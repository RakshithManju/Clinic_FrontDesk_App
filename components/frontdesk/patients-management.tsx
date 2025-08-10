"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Trash2, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ExportCsvButton } from "@/components/export-csv-button"
import { formatDateDisplay } from "@/lib/date-utils"

type Patient = {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  createdAt: string
}

export default function PatientsManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const { toast } = useToast()

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/patients?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setPatients(data.patients)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function newPatientTemplate(): Patient {
    return { id: "", firstName: "", lastName: "", phone: "", email: "", createdAt: new Date().toISOString() }
  }

  function openNew() {
    setEditing(newPatientTemplate())
    setOpen(true)
  }

  function openEdit(p: Patient) {
    setEditing(JSON.parse(JSON.stringify(p)))
    setOpen(true)
  }

  async function save() {
    if (!editing) return
    try {
      const method = editing.id ? "PATCH" : "POST"
      const url = editing.id ? `/api/patients/${editing.id}` : "/api/patients"
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editing),
      })
      if (!res.ok) throw new Error(await res.text())
      setOpen(false)
      setEditing(null)
      await load()
      toast({ description: "Patient saved." })
    } catch (e: any) {
      toast({ description: e?.message || "Failed to save", variant: "destructive" })
    }
  }

  async function remove(id: string) {
    await fetch(`/api/patients/${id}`, { method: "DELETE" })
    await load()
  }

  const columns: ColumnDef<Patient>[] = [
    {
      header: "Patient",
      accessorKey: "firstName",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.firstName} {row.original.lastName}
          <div className="text-xs text-muted-foreground">
            {formatDateDisplay(row.original.createdAt)}
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: ({ row }) => (
        <div className="text-sm">{(row.original.email || "—") + " • " + (row.original.phone || "—")}</div>
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
                <AlertDialogTitle>Delete this patient?</AlertDialogTitle>
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
        <Input id="search" placeholder="Name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ExportCsvButton
        data={patients}
        filename="patients.csv"
        disabled={loading || patients.length === 0}
        mapRow={(p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email || "",
          phone: p.phone || "",
          createdAt: p.createdAt,
        })}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add patient
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit patient" : "Add patient"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>First name</Label>
                  <Input
                    value={editing.firstName}
                    onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Last name</Label>
                  <Input
                    value={editing.lastName}
                    onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input
                    value={editing.phone || ""}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={editing.email || ""}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={save}>Save</Button>
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
          <CardTitle>Patients</CardTitle>
          <CardDescription>Manage patient records</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={patients} toolbar={toolbar} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
