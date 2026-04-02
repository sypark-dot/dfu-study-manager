"use client"

import { useState } from "react"
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Subject, FUKey } from "@/lib/types"
import { getExpectedDates } from "@/lib/visit-utils"
import { parseISO, isValid } from "date-fns"

interface VisitCalendarProps {
  subjects: Subject[]
  onSelectDate?: (date: Date, subjects: Subject[]) => void
}

// 각 대상자의 다음 pending 방문 예정일 수집
function getScheduledVisits(subjects: Subject[]): Map<string, Subject[]> {
  const map = new Map<string, Subject[]>()
  const fuKeys: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]

  for (const subject of subjects) {
    if (subject.isLTF) continue
    const expected = getExpectedDates(subject)
    for (const key of fuKeys) {
      const visit = subject.visits[key]
      if (visit.status !== "pending") continue
      const date = expected[key]
      if (!date) continue
      const dateStr = format(date, "yyyy-MM-dd")
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)!.push(subject)
      break // 대상자당 가장 가까운 pending 방문 1개만
    }
  }
  return map
}

const SITE_COLORS: Record<string, string> = {
  IJH: "bg-purple-400",
  SCH: "bg-blue-400",
  ILH: "bg-emerald-400",
  EWH: "bg-emerald-400",
}

export function VisitCalendar({ subjects, onSelectDate }: VisitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const scheduleMap = getScheduledVisits(subjects)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const selectedSubjects = selectedDate
    ? scheduleMap.get(format(selectedDate, "yyyy-MM-dd")) ?? []
    : []

  function handleDayClick(day: Date) {
    setSelectedDate(day)
    const subs = scheduleMap.get(format(day, "yyyy-MM-dd")) ?? []
    onSelectDate?.(day, subs)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </span>
        <Button size="icon" variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const daySubjects = scheduleMap.get(dateStr) ?? []
          const hasVisit = daySubjects.length > 0
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isT = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className={`
                relative flex flex-col items-center rounded-lg p-1 text-xs transition-colors
                ${!isCurrentMonth ? "opacity-30" : ""}
                ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                ${isT && !isSelected ? "font-bold text-blue-600" : ""}
              `}
            >
              <span>{format(day, "d")}</span>
              {/* 병원별 색 점 */}
              {hasVisit && (
                <div className="mt-0.5 flex gap-0.5 flex-wrap justify-center max-w-[32px]">
                  {daySubjects.slice(0, 4).map((s, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${SITE_COLORS[s.site] ?? "bg-gray-400"}`}
                    />
                  ))}
                  {daySubjects.length > 4 && (
                    <span className="text-[9px] text-muted-foreground">+{daySubjects.length - 4}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 선택된 날짜 환자 목록 */}
      {selectedDate && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 text-xs font-semibold text-foreground">
            {format(selectedDate, "M월 d일 (EEE)", { locale: ko })} 예정 방문
            <span className="ml-2 text-muted-foreground">{selectedSubjects.length}명</span>
          </div>
          {selectedSubjects.length === 0 ? (
            <div className="text-xs text-muted-foreground">예정된 방문 없음</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {selectedSubjects.map((s) => {
                const fuKeys: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]
                const expected = getExpectedDates(s)
                const pendingFU = fuKeys.find(
                  (k) => s.visits[k].status === "pending" && expected[k]
                )
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5"
                  >
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        s.site === "IJH" ? "border-purple-400 bg-purple-50 text-purple-700" :
                        s.site === "SCH" ? "border-blue-400 bg-blue-50 text-blue-700" :
                        "border-emerald-400 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {s.site}
                    </Badge>
                    <span className="text-xs font-medium">{s.subjectId}</span>
                    <span className="text-xs text-muted-foreground">{s.subjectName}</span>
                    {pendingFU && (
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {pendingFU.toUpperCase()}
                      </Badge>
                    )}
                    {/* nextVisitDate로 지정된 경우 표시 */}
                    {pendingFU && s.visits[pendingFU].nextVisitDate && (
                      <span className="text-[10px] text-blue-600">예약지정</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
