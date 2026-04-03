import { addDays, addWeeks, differenceInDays, format, parseISO, isValid } from "date-fns"
import type { Subject, FUKey, VisitData } from "./types"

export function getExpectedDates(subject: Subject): Record<FUKey, Date | null> {
  if (!subject.baselineDate) {
    return { fu1: null, fu2: null, fu3: null, fu4: null }
  }
  const baseline = parseISO(subject.baselineDate)
  if (!isValid(baseline)) {
    return { fu1: null, fu2: null, fu3: null, fu4: null }
  }

  const fuKeys: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]
  const result: Record<string, Date | null> = {}
  let cumulativeWeeks = 0

  for (const key of fuKeys) {
    const visit = subject.visits[key]
    const visitInterval = visit.interval ?? subject.visitInterval ?? 2
    if (visit.status !== "skipped") {
      cumulativeWeeks += visitInterval
    }
    if (visit.nextVisitDate) {
      const parsed = parseISO(visit.nextVisitDate)
      result[key] = isValid(parsed) ? parsed : addWeeks(baseline, cumulativeWeeks)
    } else {
      result[key] = addWeeks(baseline, cumulativeWeeks)
    }
  }

  return result as Record<FUKey, Date | null>
}

export function getWindowDates(expectedDate: Date): { start: Date; end: Date } {
  return {
    start: addDays(expectedDate, -3),
    end: addDays(expectedDate, 3),
  }
}

export function isWithinWindow(actualDate: string, expectedDate: Date): boolean {
  const actual = parseISO(actualDate)
  if (!isValid(actual)) return false
  const { start, end } = getWindowDates(expectedDate)
  return actual >= start && actual <= end
}

export function getVisitColorClass(visit: VisitData, expectedDate: Date | null): string {
  switch (visit.status) {
    case "completed":
      if (visit.actualDate && expectedDate && !isWithinWindow(visit.actualDate, expectedDate)) {
        return "bg-amber-100 text-amber-800 border-amber-300"
      }
      return "bg-emerald-100 text-emerald-800 border-emerald-300"
    case "skipped":
      return "bg-muted text-muted-foreground border-border"
    case "missed":
      return "bg-red-100 text-red-800 border-red-300"
    case "pending":
    default:
      if (expectedDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const expected = new Date(expectedDate)
        expected.setHours(0, 0, 0, 0)
        const diff = differenceInDays(expected, today)
        if (diff < -3) return "bg-red-100 text-red-800 border-red-300"
        if (diff >= -3 && diff <= 3) return "bg-blue-100 text-blue-800 border-blue-300"
      }
      return "bg-muted text-muted-foreground border-border"
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-"
  try {
    const d = parseISO(dateStr)
    if (!isValid(d)) return "-"
    return format(d, "yyyy-MM-dd")
  } catch {
    return "-"
  }
}

export function getExpectedDates(subject: Subject): Record<FUKey, Date | null> {
  if (!subject.baselineDate) {
    return { fu1: null, fu2: null, fu3: null, fu4: null }
  }
  const baseline = parseISO(subject.baselineDate)
  if (!isValid(baseline)) {
    return { fu1: null, fu2: null, fu3: null, fu4: null }
  }

  const fuKeys: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]
  const result: Record<string, Date | null> = {}
  let cumulativeWeeks = 0

  // 이전 방문의 nextVisitDate (첫 번째는 baselineNextVisitDate)
  const prevNextVisitDates: (string | null | undefined)[] = [
    subject.baselineNextVisitDate,
    subject.visits.fu1.nextVisitDate,
    subject.visits.fu2.nextVisitDate,
    subject.visits.fu3.nextVisitDate,
  ]

  for (let i = 0; i < fuKeys.length; i++) {
    const key = fuKeys[i]
    const visit = subject.visits[key]
    const visitInterval = visit.interval ?? subject.visitInterval ?? 2

    if (visit.status !== "skipped") {
      cumulativeWeeks += visitInterval
    }

    const prevNext = prevNextVisitDates[i]
    if (prevNext) {
      const parsed = parseISO(prevNext)
      result[key] = isValid(parsed) ? parsed : addWeeks(baseline, cumulativeWeeks)
    } else {
      result[key] = addWeeks(baseline, cumulativeWeeks)
    }
  }

  return result as Record<FUKey, Date | null>
}
