"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Subject, FUKey, VisitStatus, VisitData, VisitInterval } from "@/lib/types"
import { FU_LABELS } from "@/lib/types"
import { getExpectedDates, getWindowDates, getVisitColorClass, formatDate, isWithinWindow } from "@/lib/visit-utils"
import { format } from "date-fns"
import { Check, X, SkipForward, Clock, AlertTriangle } from "lucide-react"

interface VisitDetailRowProps {
  subject: Subject
  fuKey: FUKey
  onUpdate: (subject: Subject) => void
  compact?: boolean
}

const STATUS_LABELS: Record<VisitStatus, string> = {
  pending: "대기 / Pending",
  completed: "완료 / Completed",
  skipped: "건너뜀 / Skipped",
  missed: "미방문 / Missed",
}

const STATUS_ICONS: Record<VisitStatus, React.ReactNode> = {
  completed: <Check className="h-3.5 w-3.5" />,
  skipped: <SkipForward className="h-3.5 w-3.5" />,
  missed: <X className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
}

export function VisitDetailRow({ subject, fuKey, onUpdate, compact }: VisitDetailRowProps) {
  const visit = subject.visits[fuKey]
  const expected = getExpectedDates(subject)
  const expectedDate = expected[fuKey]
  const colorClass = getVisitColorClass(visit, expectedDate)

  const [editing, setEditing] = useState(false)
  const [localVisit, setLocalVisit] = useState<VisitData>({ ...visit })

  function handleSave() {
    const updated = {
      ...subject,
      visits: {
        ...subject.visits,
        [fuKey]: localVisit,
      },
    }
    onUpdate(updated)
    setEditing(false)
  }

  function handleQuickComplete() {
    const today = format(new Date(), "yyyy-MM-dd")
    const updated = {
      ...subject,
      visits: {
        ...subject.visits,
        [fuKey]: { status: "completed" as VisitStatus, actualDate: today, reason: "" },
      },
    }
    onUpdate(updated)
  }

  const windowStr = expectedDate
    ? `${format(getWindowDates(expectedDate).start, "MM/dd")} ~ ${format(getWindowDates(expectedDate).end, "MM/dd")}`
    : "-"

  const outOfWindow =
    visit.status === "completed" &&
    visit.actualDate &&
    expectedDate &&
    !isWithinWindow(visit.actualDate, expectedDate)

  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded border px-2 py-1 ${colorClass}`}>
        <span className="text-xs font-medium">{FU_LABELS[fuKey]}</span>
        {STATUS_ICONS[visit.status]}
        {visit.status === "pending" && (
          <Checkbox
            checked={false}
            onCheckedChange={() => handleQuickComplete()}
            aria-label={`Mark ${FU_LABELS[fuKey]} as completed`}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-2 rounded-md border p-3 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{FU_LABELS[fuKey]}</span>
          <Badge variant="outline" className={colorClass}>
            {STATUS_ICONS[visit.status]}
            <span className="ml-1">{STATUS_LABELS[visit.status]}</span>
          </Badge>
          {outOfWindow && (
            <span className="flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="h-3 w-3" />
              Window 초과
            </span>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
          {editing ? "취소" : "수정"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-5">
        <div>
          <span className="font-medium text-foreground">간격 / Interval</span>
          <div>{visit.interval ?? subject.visitInterval}주</div>
        </div>
        <div>
          <span className="font-medium text-foreground">예상일 / Expected</span>
          <div>{expectedDate ? format(expectedDate, "yyyy-MM-dd") : "-"}</div>
        </div>
        <div>
          <span className="font-medium text-foreground">허용 범위 / Window</span>
          <div>{windowStr}</div>
        </div>
        <div>
          <span className="font-medium text-foreground">실제 방문일 / Actual</span>
          <div>{formatDate(visit.actualDate)}</div>
        </div>
        <div>
          <span className="font-medium text-foreground">사유 / Reason</span>
          <div>{visit.reason || "-"}</div>
        </div>
      </div>

      {editing && (
        <div className="mt-2 flex flex-col gap-3 rounded border border-border bg-card p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">F/U 간격 / Interval</label>
              <Select
                value={String(localVisit.interval ?? subject.visitInterval)}
                onValueChange={(v) => setLocalVisit((p) => ({ ...p, interval: Number(v) as VisitInterval }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1주 / 1 week</SelectItem>
                  <SelectItem value="2">2주 / 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">상태 / Status</label>
              <Select
                value={localVisit.status}
                onValueChange={(v) => setLocalVisit((p) => ({ ...p, status: v as VisitStatus }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as VisitStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">실제 방문일 / Actual Date</label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={localVisit.actualDate || ""}
                onChange={(e) => setLocalVisit((p) => ({ ...p, actualDate: e.target.value || null }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">사유 / Reason</label>
              <Input
                className="h-8 text-xs"
                placeholder="Optional reason"
                value={localVisit.reason}
                onChange={(e) => setLocalVisit((p) => ({ ...p, reason: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave}>
              저장 / Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
