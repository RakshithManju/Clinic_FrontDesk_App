"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { CalendarPlus, ListOrdered, PlusCircle, Search, Stethoscope, UserPlus2, UsersRound } from "lucide-react"

type Doctor = { id: string; name: string; specialization: string; location: string }
type Patient = { id: string; firstName: string; lastName: string; email?: string }

export function CommandMenu({
  open,
  setOpen,
  onNavigate,
}: {
  open: boolean
  setOpen: (o: boolean) => void
  onNavigate: (key: "queue" | "appointments" | "doctors" | "patients") => void
}) {
  const [doctors, setDoctors] = React.useState<Doctor[]>([])
  const [patients, setPatients] = React.useState<Patient[]>([])

  React.useEffect(() => {
    function down(e: KeyboardEvent) {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "F2") {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  React.useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const [d, p] = await Promise.all([fetch("/api/doctors"), fetch("/api/patients")])
        const dd = (await d.json()).doctors as Doctor[]
        const pp = (await p.json()).patients as Patient[]
        setDoctors(dd)
        setPatients(pp)
      } catch {
        setDoctors([])
        setPatients([])
      }
    })()
  }, [open])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search anything (⌘/Ctrl K)..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => onNavigate("queue")}>
            <ListOrdered className="mr-2 h-4 w-4" />
            Queue
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("appointments")}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Appointments
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("doctors")}>
            <Stethoscope className="mr-2 h-4 w-4" />
            Doctors
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("patients")}>
            <UsersRound className="mr-2 h-4 w-4" />
            Patients
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => onNavigate("patients")}>
            <UserPlus2 className="mr-2 h-4 w-4" />
            Add patient
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("appointments")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Book appointment
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Doctors">
          {doctors.slice(0, 6).map((d) => (
            <CommandItem key={d.id} onSelect={() => onNavigate("doctors")}>
              <Stethoscope className="mr-2 h-4 w-4" />
              {d.name} — {d.specialization} ({d.location})
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Patients">
          {patients.slice(0, 6).map((p) => (
            <CommandItem key={p.id} onSelect={() => onNavigate("patients")}>
              <Search className="mr-2 h-4 w-4" />
              {p.firstName} {p.lastName} {p.email ? `– ${p.email}` : ""}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
