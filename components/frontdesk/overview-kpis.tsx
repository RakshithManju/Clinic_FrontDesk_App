"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type KPI = {
  label: string
  value: string | number
  sub?: string
}

export default function OverviewKpis() {
  const [kpis, setKpis] = useState<KPI[] | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function load(showToast = false) {
    setLoading(true)
    try {
      const [queueRes, apptRes, docRes] = await Promise.all([
        fetch("/api/queue", { cache: "no-store" }),
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/doctors", { cache: "no-store" }),
      ])
      const queue = (await queueRes.json()).queue as any[]
      const appts = (await apptRes.json()).appointments as any[]
      const docs = (await docRes.json()).doctors as any[]

      const waiting = queue.filter((q) => q.status === "waiting").length
      const withDoctor = queue.filter((q) => q.status === "with-doctor").length
      const today = new Date().toISOString().slice(0, 10)
      const todaysAppts = appts.filter((a) => a.timeISO.startsWith(today)).length

      setKpis([
        { label: "Waiting", value: waiting, sub: "In queue" },
        { label: "With Doctor", value: withDoctor, sub: "Currently attended" },
        { label: "Today's Appointments", value: todaysAppts },
        { label: "Doctors", value: docs.length },
      ])
      if (showToast) {
        toast({ description: "Dashboard updated." })
      }
    } catch (e: any) {
      setKpis([
        { label: "Waiting", value: "-" },
        { label: "With Doctor", value: "-" },
        { label: "Today's Appointments", value: "-" },
        { label: "Doctors", value: "-" },
      ])
      if (showToast) {
        toast({ description: "Failed to refresh data", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard Overview</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => load(true)} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(kpis || Array.from({ length: 4 })).map((k, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{k ? k.label : "Loading..."}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{k ? k.value : "—"}</div>
              {k?.sub ? <div className="text-xs text-muted-foreground">{k.sub}</div> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
