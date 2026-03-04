import type { Subject, FUKey } from "./types"
import { getExpectedDates, formatDate } from "./visit-utils"
import { format } from "date-fns"

const FU_KEYS: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToCSV(subjects: Subject[]): void {
  const headers = [
    "Site",
    "Subject ID",
    "Subject Name",
    "Phone Number",
    "Hospital Reg No",
    "Ulcer No",
    "Staff Name",
    "Baseline Date",
    "Visit Interval (weeks)",
    "LTF",
    "FU1 Status",
    "FU1 Expected Date",
    "FU1 Actual Date",
    "FU1 Reason",
    "FU2 Status",
    "FU2 Expected Date",
    "FU2 Actual Date",
    "FU2 Reason",
    "FU3 Status",
    "FU3 Expected Date",
    "FU3 Actual Date",
    "FU3 Reason",
    "FU4 Status",
    "FU4 Expected Date",
    "FU4 Actual Date",
    "FU4 Reason",
    "Notes",
  ]

  const rows = subjects.map((s) => {
    const expected = getExpectedDates(s)
    const fuFields = FU_KEYS.flatMap((key) => {
      const visit = s.visits[key]
      const exp = expected[key]
      return [
        visit.status,
        exp ? format(exp, "yyyy-MM-dd") : "",
        visit.actualDate || "",
        visit.reason,
      ]
    })

    return [
      s.site,
      s.subjectId,
      s.subjectName,
      s.phoneNumber || "",
      s.hospitalRegNo || "",
      String(s.ulcerNo),
      s.staffName,
      s.baselineDate,
      String(s.visitInterval),
      s.isLTF ? "Yes" : "No",
      ...fuFields,
      s.notes,
    ].map(escapeCSV)
  })

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `dfu-study-export-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
