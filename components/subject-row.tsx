"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Subject, FUKey } from "@/lib/types"
import { VisitDetailRow } from "./visit-detail-row"
import { getExpectedDates, getVisitColorClass } from "@/lib/visit-utils"
import { Check, X, SkipForward, Clock, Phone, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SubjectRowProps {
  subject: Subject
  onUpdate: (subject: Subject) => void
  onEdit: (subject: Subject) => void
  onDelete: (id: string) => void
}

const STATUS_ICONS_SMALL: Record<string, React.ReactNode> = {
  completed: <Check className="h-3 w-3" />,
  skipped: <SkipForward className="h-3 w-3" />,
  missed: <X className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
}

const FU_KEYS: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]

export function SubjectRow({ subject, onUpdate, onEdit, onDelete }: SubjectRowProps) {
  const [expanded, setExpanded] = useState(false)
  const expected = getExpectedDates(subject)

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Main row */}
      <div
        className="flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:gap-3 sm:px-4"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      >
        <span className="text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>

        {/* Subject info */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 text-[10px] font-semibold">
              {subject.site}
            </Badge>
            {subject.isLTF && (
              <Badge variant="destructive" className="shrink-0 text-[10px] font-semibold">
                LTF
              </Badge>
            )}
            <span className="truncate text-sm font-medium text-foreground">{subject.subjectId}</span>
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {subject.subjectName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground sm:ml-auto sm:mr-2">
            <span className="hidden sm:inline">
              {subject.staffName && `${subject.staffName} | `}
            </span>
            <span>{subject.visitInterval}주간격</span>
          </div>
        </div>

        {/* Visit status badges */}
        <div className="flex items-center gap-1">
          {FU_KEYS.map((key) => {
            const visit = subject.visits[key]
            const colorClass = getVisitColorClass(visit, expected[key])
            return (
              <span
                key={key}
                className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium ${colorClass}`}
                title={`${key.toUpperCase()}: ${visit.status}`}
              >
                {STATUS_ICONS_SMALL[visit.status]}
              </span>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(subject)}
            aria-label="Edit subject"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label="Delete subject"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>대상자 삭제 / Delete Subject</AlertDialogTitle>
                <AlertDialogDescription>
                  {subject.subjectId} ({subject.subjectName}) 을(를) 삭제하시겠습니까?
                  <br />
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소 / Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(subject.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  삭제 / Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Expanded visit details */}
      {expanded && (
        <div className="flex flex-col gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
          {/* LTF Warning Banner */}
          {subject.isLTF && (
            <div className="mb-2 flex items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-destructive">Lost to Follow-up (LTF)</div>
                {subject.phoneNumber && (
                  <a
                    href={`tel:${subject.phoneNumber}`}
                    className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground underline"
                  >
                    <Phone className="h-4 w-4" />
                    {subject.phoneNumber}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Subject info row */}
          <div className="mb-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
            <div>
              <span className="font-medium text-foreground">기준일 / Baseline</span>
              <div>{subject.baselineDate || "-"}</div>
            </div>
            <div>
              <span className="font-medium text-foreground">연락처 / Phone</span>
              <div>{subject.phoneNumber || "-"}</div>
            </div>
            <div>
              <span className="font-medium text-foreground">병원 등록번호 / Chart No</span>
              <div>{subject.hospitalRegNo || "-"}</div>
            </div>
            <div>
              <span className="font-medium text-foreground">비고 / Notes</span>
              <div>{subject.notes || "-"}</div>
            </div>
          </div>

          {/* Baseline Blood Test & Next Visit Info */}
          <div className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-border bg-card p-2 text-xs sm:grid-cols-3">
            <div>
              <span className="font-medium text-foreground">혈액검사 / Blood Test</span>
              <div className={!subject.bloodTestResult && !subject.bloodTestReason ? "text-red-600 font-semibold" : ""}>
                {subject.bloodTestResult || (subject.bloodTestReason ? `미시행: ${subject.bloodTestReason}` : "미입력")}
              </div>
            </div>
            <div>
              <span className="font-medium text-foreground">Baseline 다음 예약</span>
              <div className={!subject.baselineNextVisitDate ? "text-red-600 font-semibold" : ""}>
                {subject.baselineNextVisitDate || "미입력"}
              </div>
            </div>
            {subject.bloodTestReason && (
              <div className="col-span-2 sm:col-span-1">
                <span className="font-medium text-foreground">혈액검사 미시행 사유</span>
                <div className="text-amber-600">{subject.bloodTestReason}</div>
              </div>
            )}
          </div>

          {/* LTF Toggle */}
          <div className="mb-2 flex items-center gap-3 rounded-md border border-border bg-card p-2">
            <Label htmlFor={`ltf-${subject.id}`} className="flex-1 text-xs font-medium">
              추적 관찰 중단 / Lost to Follow-up (LTF)
            </Label>
            <Switch
              id={`ltf-${subject.id}`}
              checked={subject.isLTF}
              onCheckedChange={(checked) => {
                onUpdate({ ...subject, isLTF: checked, updatedAt: new Date().toISOString() })
              }}
            />
          </div>

          {FU_KEYS.map((key) => (
            <VisitDetailRow
              key={key}
              subject={subject}
              fuKey={key}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
