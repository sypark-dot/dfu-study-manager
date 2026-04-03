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

    // ✅ nextVisitDate 있으면 그걸 우선, 없으면 자동계산
    if (visit.nextVisitDate) {
      const parsed = parseISO(visit.nextVisitDate)
      result[key] = isValid(parsed) ? parsed : addWeeks(baseline, cumulativeWeeks)
    } else {
      result[key] = addWeeks(baseline, cumulativeWeeks)
    }
  }

  return result as Record<FUKey, Date | null>
}

/**
 * Get the window dates for a given expected date (+-3 days)
 */
export function getWindowDates(expectedDate: Date): { start: Date; end: Date } {
  return {
    start: addDays(expectedDate, -3),
    end: addDays(expectedDate, 3),
  }
}

/**
 * Check if an actual date is within the visit window
 */
export function isWithinWindow(actualDate: string, expectedDate: Date): boolean {
  const actual = parseISO(actualDate)
  if (!isValid(actual)) return false
  const { start, end } = getWindowDates(expectedDate)
  return actual >= start && actual <= end
}

/**
 * Get display color class for a visit status
 */
export function getVisitColorClass(
  visit: VisitData,
  expectedDate: Date | null
): string {
  switch (visit.status) {
    case "completed":
      if (visit.actualDate && expectedDate && !isWithinWindow(visit.actualDate, expectedDate)) {
        return "bg-amber-100 text-amber-800 border-amber-300" // Out of window
      }
      return "bg-emerald-100 text-emerald-800 border-emerald-300" // Completed
    case "skipped":
      return "bg-muted text-muted-foreground border-border" // Skipped
    case "missed":
      return "bg-red-100 text-red-800 border-red-300" // Missed
    case "pending":
    default:
      if (expectedDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const expected = new Date(expectedDate)
        expected.setHours(0, 0, 0, 0)
        const diff = differenceInDays(expected, today)
        if (diff < -3) {
          return "bg-red-100 text-red-800 border-red-300" // Overdue
        }
        if (diff >= -3 && diff <= 3) {
          return "bg-blue-100 text-blue-800 border-blue-300" // Upcoming (within window)
        }
      }
      return "bg-muted text-muted-foreground border-border" // Future
  }
}

/**
 * Format date for display
 */
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

/**
 * Check if a subject has a visit scheduled within the window around today (+-3 days)
 */
export function hasVisitToday(subject: Subject): boolean {
  const expected = getExpectedDates(subject)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fuKeys: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]
  return fuKeys.some((key) => {
    if (subject.visits[key].status !== "pending") return false
    const exp = expected[key]
    if (!exp) return false
    const { start, end } = getWindowDates(exp)
    return today >= start && today <= end
  })
}

/**
 * Check if a subject has a visit expected exactly today (date match only, no window)
 */
export function hasVisitExactlyToday(subject: Subject): boolean {
  const expected = getExpectedDates(subject)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fuKeys: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]
  return fuKeys.some((key) => {
    if (subject.visits[key].status !== "pending") return false
    const exp = expected[key]
    if (!exp) return false
    const expDate = new Date(exp)
    expDate.setHours(0, 0, 0, 0)
    return expDate.getTime() === today.getTime()
  })
}
