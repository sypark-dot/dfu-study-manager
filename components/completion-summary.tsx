"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Edit2, MinusCircle } from "lucide-react"
import type { Subject, FUKey } from "@/lib/types"

interface CompletionSummaryProps {
  subjects: Subject[]
  onUpdate: (subject: Subject) => void
}

export function CompletionSummary({ subjects, onUpdate }: CompletionSummaryProps) {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editForm, setEditForm] = useState<{
    bloodTestDone: boolean | null
    nextVisitConfirmed: boolean
  }>({
    bloodTestDone: null,
    nextVisitConfirmed: false,
  })

  function openEdit(subject: Subject) {
    setEditingSubject(subject)
    setEditForm({
      bloodTestDone: subject.bloodTestDone ?? null,
      nextVisitConfirmed: subject.nextVisitConfirmed ?? false,
    })
  }

  function handleSave() {
    if (!editingSubject) return
    onUpdate({
      ...editingSubject,
      bloodTestDone: editForm.bloodTestDone,
      nextVisitConfirmed: editForm.nextVisitConfirmed,
      updatedAt: new Date().toISOString(),
    })
    setEditingSubject(null)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[110px] text-xs font-semibold">대상자 ID</TableHead>
              <TableHead className="w-[60px] text-center text-xs font-semibold">병원</TableHead>
              <TableHead className="text-center text-xs font-semibold">
                혈액검사
                <span className="block text-[10px] font-normal text-muted-foreground">Blood Test</span>
              </TableHead>
              <TableHead className="text-center text-xs font-semibold">
                다음 예약 확인
                <span className="block text-[10px] font-normal text-muted-foreground">Next Visit Confirmed</span>
              </TableHead>
              <TableHead className="w-[56px] text-center text-xs font-semibold">수정</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => {
              const bloodStatus =
                subject.bloodTestDone === true
                  ? "done"
                  : subject.bloodTestDone === false
                  ? "not_done"
                  : "not_entered"
              const nextVisitOk = subject.nextVisitConfirmed === true

              return (
                <TableRow key={subject.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm font-medium">{subject.subjectId}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px]">{subject.site}</Badge>
                  </TableCell>

                  {/* Blood Test */}
                  <TableCell className="text-center">
                    {bloodStatus === "done" && (
                      <div className="flex flex-col items-center gap-0.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-medium text-emerald-600">시행</span>
                      </div>
                    )}
                    {bloodStatus === "not_done" && (
                      <div className="flex flex-col items-center gap-0.5">
                        <MinusCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-medium text-amber-500">미시행</span>
                      </div>
                    )}
                    {bloodStatus === "not_entered" && (
                      <div className="flex flex-col items-center gap-0.5 rounded bg-red-50 px-1.5 py-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-[10px] font-semibold text-red-600">미입력</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Next Visit Confirmed */}
                  <TableCell className="text-center">
                    {nextVisitOk ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-medium text-emerald-600">확인 완료</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 rounded bg-red-50 px-1.5 py-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-[10px] font-semibold text-red-600">미확인</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(subject)}
                      aria-label="Edit completion data"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(v) => !v && setEditingSubject(null)}>
        <DialogContent className="sm:max-w-sm" aria-describedby="edit-completion-desc">
          <DialogHeader>
            <DialogTitle>{editingSubject?.subjectId} — 완료 상태 수정</DialogTitle>
            <DialogDescription id="edit-completion-desc">
              혈액검사 시행 여부와 다음 예약 확인 상태를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* 혈액검사 버튼 그룹 */}
            <div>
              <Label className="mb-2 block text-sm font-semibold">혈액검사 / Blood Test</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm((p) => ({ ...p, bloodTestDone: true }))}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    editForm.bloodTestDone === true
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  시행 / Done
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm((p) => ({ ...p, bloodTestDone: false }))}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    editForm.bloodTestDone === false
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  미시행 / Not done
                </button>
              </div>
            </div>

            {/* 다음 예약 확인 체크박스 */}
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5">
              <Checkbox
                id="edit-nextVisitConfirmed"
                checked={editForm.nextVisitConfirmed}
                onCheckedChange={(checked) =>
                  setEditForm((p) => ({ ...p, nextVisitConfirmed: checked === true }))
                }
              />
              <Label htmlFor="edit-nextVisitConfirmed" className="cursor-pointer text-sm">
                예약일 확인 완료 / Next visit confirmed
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
              취소 / Cancel
            </Button>
            <Button onClick={handleSave}>저장 / Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
