export function toCSV(rows: Array<Record<string, any>>): string {
  if (!rows || rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const headerLine = headers.map(escape).join(",")
  const lines = rows.map((row) => headers.map((h) => escape(row[h])).join(","))
  return [headerLine, ...lines].join("\n")
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
