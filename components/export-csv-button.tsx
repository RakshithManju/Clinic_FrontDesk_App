"use client"

import { Button } from "@/components/ui/button"
import { toCSV, downloadCSV } from "@/lib/csv"
import { FileDown } from "lucide-react"
import { useState } from "react"

export function ExportCsvButton<T>({
  data,
  filename,
  mapRow,
  disabled,
}: {
  data: T[]
  filename: string
  mapRow: (row: T) => Record<string, any>
  disabled?: boolean
}) {
  const [busy, setBusy] = useState(false)
  async function onExport() {
    try {
      setBusy(true)
      const rows = data.map(mapRow)
      const csv = toCSV(rows)
      downloadCSV(filename, csv)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={onExport} disabled={disabled || busy} aria-label="Export CSV">
      <FileDown className="mr-2 h-4 w-4" />
      {busy ? "Exporting..." : "Export CSV"}
    </Button>
  )
}
