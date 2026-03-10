"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, Edit2 } from "lucide-react"
import type { Subject, FUKey } from "@/lib/types"
import { formatDate } from "@/lib/visit-utils"

interface CompletionSummaryProps {
  subjects: Subject[]
  onUpdate: (subject: Subject) => void
}

const FU_KEYS: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]

export function CompletionSummary({ subjects, onUpdate }: CompletionSummaryProps) {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editForm, setEditForm] = useState<{
    bloodTestDone: boolean | null
    bloodTestReason: string
    baselineNextVisitDate: string
    fu1NextVisitDate: string
    fu2NextVisitDate: string
    fu3NextVisitDate: string
    fu4NextVisitDate: string
  }>({
    bloodTestDone: null,
    bloodTestReason: "",
    baselineNextVisitDate: "",
    fu1NextVisitDate: "",
    fu2NextVisitDate: "",
    fu3NextVisitDate: "",
    fu4NextVisitDate: "",
  })

  function openEdit(subject: Subject) {
    setEditingSubject(subject)
    setEditForm({
      bloodTestDone: subject.bloodTestDone ?? null,
      bloodTestReason: subject.bloodTestReason || "",
      baselineNextVisitDate: subject.baselineNextVisitDate || "",
      fu1NextVisitDate: subject.visits.fu1.nextVisitDate || "",
      fu2NextVisitDate: subject.visits.fu2.nextVisitDate || "",
      fu3NextVisitDate: subject.visits.fu3.nextVisitDate || "",
      fu4NextVisitDate: subject.visits.fu4.nextVisitDate || "",
    })
  }

  function handleSave() {
    if (!editingSubject) return
    const updated: Subject = {
      ...editingSubject,
      bloodTestDone: editForm.bloodTestDone,
      bloodTestReason: editForm.bloodTestDone === false ? (editForm.bloodTestReason || null) : null,
      baselineNextVisitDate: editForm.baselineNextVisitDate || null,
      visits: {
        ...editingSubject.visits,
        fu1: { ...editingSubject.visits.fu1, nextVisitDate: editForm.fu1NextVisitDate || null },
        fu2: { ...editingSubject.visits.fu2, nextVisitDate: editForm.fu2NextVisitDate || null },
        fu3: { ...editingSubject.visits.fu3, nextVisitDate: editForm.fu3NextVisitDate || null },
        fu4: { ...editingSubject.visits.fu4, nextVisitDate: editForm.fu4NextVisitDate || null },
      },
      updatedAt: new Date().toISOString(),
    }
    onUpdate(updated)
    setEditingSubject(null)
  }

  function getBloodTestStatus(subject: Subject): "done" | "not_done" | "not_entered" {
    if (subject.bloodTestDone === true) return "done"
    if (subject.bloodTestDone === false) return "not_done"
    return "not_entered"
  }

  function hasNextVisitDate(subject: Subject, visitKey: "baseline" | FUKey): boolean {
    if (visitKey === "baseline") {
      return !!(subject.baselineNextVisitDate && subject.baselineNextVisitDate.trim().length > 0)
    }
    return !!(subject.visits[visitKey].nextVisitDate && subject.visits[visitKey].nextVisitDate?.trim().length)
  }

  // Check if visit is applicable (not skipped and has been completed or is pending)
  function isVisitApplicable(subject: Subject, visitKey: FUKey): boolean {
    const visit = subject.visits[visitKey]
    // If visit is skipped, next visit date is not required
    return visit.status !== "skipped"
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px] text-xs font-semibold">대상자 ID</TableHead>
              <TableHead className="w-[60px] text-xs font-semibold text-center">병원</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold text-center">
                혈액검사
                <span className="block text-[10px] font-normal text-muted-foreground">Blood Test</span>
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-center">
                Baseline
                <span className="block text-[10px] font-normal text-muted-foreground">다음 예약</span>
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-center">
                FU1
                <span className="block text-[10px] font-normal text-muted-foreground">다음 예약</span>
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-center">
                FU2
                <span className="block text-[10px] font-normal text-muted-foreground">다음 예약</span>
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-center">
                FU3
                <span className="block text-[10px] font-normal text-muted-foreground">다음 예약</span>
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-center">
                FU4
                <span className="block text-[10px] font-normal text-muted-foreground">다음 예약</span>
              </TableHead>
              <TableHead className="w-[60px] text-xs font-semibold text-center">수정</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id} className="hover:bg-muted/30">
                <TableCell className="text-sm font-medium">{subject.subjectId}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[10px]">{subject.site}</Badge>
                </TableCell>
                {/* Blood Test - Baseline only */}
                <TableCell className="text-center">
                  {(() => {
                    const status = getBloodTestStatus(subject)
                    if (status === "done") {
                      return (
                        <div className="flex flex-col items-center gap-0.5">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-medium">완료</span>
                        </div>
                      )
                    } else if (status === "not_done") {
                      return (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-amber-600 font-medium">미시행</span>
                          {subject.bloodTestReason && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                              {subject.bloodTestReason}
                            </span>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="flex flex-col items-center gap-0.5 rounded bg-red-100 px-1.5 py-1">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-[10px] text-red-600 font-semibold">미입력</span>
                        </div>
                      )
                    }
                  })()}
                </TableCell>
                {/* Baseline Next Visit */}
                <TableCell className="text-center">
                  {hasNextVisitDate(subject, "baseline") ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(subject.baselineNextVisitDate)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 rounded bg-red-100 px-1.5 py-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-[10px] text-red-600 font-semibold">미입력</span>
                    </div>
                  )}
                </TableCell>
                {/* FU1-4 Next Visit */}
                {FU_KEYS.map((key) => (
                  <TableCell key={key} className="text-center">
                    {!isVisitApplicable(subject, key) ? (
                      <span className="text-[10px] text-muted-foreground">건너뜀</span>
                    ) : hasNextVisitDate(subject, key) ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(subject.visits[key].nextVisitDate)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 rounded bg-red-100 px-1.5 py-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-[10px] text-red-600 font-semibold">미입력</span>
                      </div>
                    )}
                  </TableCell>
                ))}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(v) => !v && setEditingSubject(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSubject?.subjectId} - 완료 상태 수정
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* Blood Test Section */}
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <h4 className="mb-2 text-sm font-semibold">Baseline 혈액검사</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                  <Label htmlFor="edit-bloodTestDone" className="flex-1 text-sm">
                    혈액검사 시행 / Blood Test Done
                  </Label>
                  <Switch
                    id="edit-bloodTestDone"
                    checked={editForm.bloodTestDone === true}
                    onCheckedChange={(checked) => {
                      setEditForm((p) => ({
                        ...p,
                        bloodTestDone: checked,
                        bloodTestReason: checked ? "" : p.bloodTestReason,
                      }))
                    }}
                  />
                </div>
                {editForm.bloodTestDone === false && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-bloodTestReason" className="text-xs">미시행 사유</Label>
                    <Textarea
                      id="edit-bloodTestReason"
                      placeholder="혈액검사를 하지 못한 경우 사유를 입력하세요..."
                      value={editForm.bloodTestReason}
                      onChange={(e) => setEditForm((p) => ({ ...p, bloodTestReason: e.target.value }))}
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Next Visit Dates Section */}
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <h4 className="mb-2 text-sm font-semibold">다음 예약일</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-baselineNextVisit" className="text-xs">Baseline</Label>
                  <Input
                    id="edit-baselineNextVisit"
                    type="date"
                    value={editForm.baselineNextVisitDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, baselineNextVisitDate: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-fu1NextVisit" className="text-xs">FU1</Label>
                  <Input
                    id="edit-fu1NextVisit"
                    type="date"
                    value={editForm.fu1NextVisitDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, fu1NextVisitDate: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-fu2NextVisit" className="text-xs">FU2</Label>
                  <Input
                    id="edit-fu2NextVisit"
                    type="date"
                    value={editForm.fu2NextVisitDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, fu2NextVisitDate: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-fu3NextVisit" className="text-xs">FU3</Label>
                  <Input
                    id="edit-fu3NextVisit"
                    type="date"
                    value={editForm.fu3NextVisitDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, fu3NextVisitDate: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-fu4NextVisit" className="text-xs">FU4</Label>
                  <Input
                    id="edit-fu4NextVisit"
                    type="date"
                    value={editForm.fu4NextVisitDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, fu4NextVisitDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
              취소 / Cancel
            </Button>
            <Button onClick={handleSave}>
              저장 / Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
