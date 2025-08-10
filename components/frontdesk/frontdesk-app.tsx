"use client"

import { useEffect, useState } from "react"
import AppShell from "@/components/layout/app-shell"
import QueueManager from "./queue-manager"
import AppointmentManagement from "./appointment-management"
import DoctorManagement from "./doctor-management"
import PatientsManagement from "./patients-management"
import OverviewKpis from "./overview-kpis"
import Utilization from "./utilization"
import AuthCard from "./auth-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

type Me = { id: string; email: string; role: "frontdesk" | "admin" }
type NavKey = "queue" | "appointments" | "doctors" | "patients"

export default function FrontDeskApp() {
  const [user, setUser] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<NavKey>("queue")
  const { toast } = useToast()

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    toast({ description: "Signed out." })
  }

  if (loading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="mt-4 h-64" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <AuthCard onSuccess={setUser} />
      </div>
    )
  }

  return (
    <AppShell userEmail={user.email} active={active} onChange={setActive} onLogout={logout}>
      <div className="grid gap-6">
        <OverviewKpis />
        <Utilization />
        {active === "queue" && <QueueManager />}
        {active === "appointments" && <AppointmentManagement />}
        {active === "doctors" && <DoctorManagement />}
        {active === "patients" && <PatientsManagement />}
      </div>
    </AppShell>
  )
}
