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
import { CheckCircle, XCircle, Edit2, CheckSquare, Square } from "lucide-react"
import type { Subject, FUKey } from "@/lib/types"
import { formatDate } from "@/lib/visit-utils"

interface CompletionSummaryProps {
  subjects: Subject[]
  onUpdate: (subject: Subject) => void
}

const FU_KEYS: FUKey[] = ["fu1", "fu2", "fu3", "fu4"]
const ALL_VISITS = ["baseline", "fu1", "fu2", "fu3", "fu4"] as const
type VisitKey = typeof ALL_VISITS[number]

export function CompletionSummary({ subjects, onUpdate }: CompletionSummaryProps) {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editForm, setEditForm] = useState<{
    bloodTestResult: string
    bloodTestReason: string
    baselineNextVisitDate: string
    fu1NextVisitDate: string
    fu2NextVisitDate: string
    fu3NextVisitDate: string
    fu4NextVisitDate: string
  }>({
    bloodTestResult: "",
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
      bloodTestResult: subject.bloodTestResult || "",
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
      bloodTestResult: editForm.bloodTestResult || null,
      bloodTestReason: editForm.bloodTestReason || null,
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

  function toggleEmr(subject: Subject, visitKey: VisitKey, who: "crc" | "pi") {
    if (visitKey === "baseline") {
      const field = who === "crc" ? "baselineEmrCrc" : "baselineEmrPi"
      onUpdate({ ...subject, [field]: !subject[field as keyof Subject], updatedAt: new Date().toISOString() })
    } else {
      const fuKey = visitKey as FUKey
      const field = who === "crc" ? "emrCrc" : "emrPi"
      onUpdate({
        ...subject,
        visits: {
          ...subject.visits,
          [fuKey]: { ...subject.visits[fuKey], [field]: !subject.visits[fuKey][field as keyof typeof subject.visits[FUKey]] },
        },
        updatedAt: new Date().toISOString(),
      })
    }
  }

  function getEmrValue(subject: Subject, visitKey: VisitKey, who: "crc" | "pi"): boolean {
    if (visitKey === "baseline") {
      return !!(who === "crc" ? subject.baselineEmrCrc : subject.baselineEmrPi)
    }
    const v = subject.visits[visitKey as FUKey]
    return !!(who === "crc" ? v.emrCrc : v.emrPi)
  }

  function isVisitApplicable(subject: Subject, visitKey: FUKey): boolean {
    return subject.visits[visitKey].status !== "skipped"
  }

  function hasBloodTest(subject: Subject): boolean {
    return !!(subject.bloodTestResult && subject.bloodTestResult.trim().length > 0)
  }

  function hasNextVisitDate(subject: Subject, visitKey: "baseline" | FUKey): boolean {
    if (visitKey === "baseline") return !!(subject.baselineNextVisitDate?.trim().length)
    return !!(subject.visits[visitKey].nextVisitDate?.trim().length)
  }

  function EmrCell({ subject, visitKey, applicable = true }: { subject: Subject; visitKey: VisitKey; applicable?: boolean }) {
    if (!applicable) return <span className="text-[10px] text-muted-foreground">건너뜀</span>
    const crc = getEmrValue(subject, visitKey, "crc")
    const pi = getEmrValue(subject, visitKey, "pi")
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => toggleEmr(subject, visitKey, "crc")}
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${crc ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
        >
          {crc ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
          CRC
        </button>
        <button
          onClick={() => toggleEmr(subject, visitKey, "pi")}
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${pi ? "bg-blue-100 text-blue-700" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
        >
          {pi ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
          PI
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[90px] text-xs font-semibold">대상자 ID</TableHead>
              <TableHead className="w-[50px] text-xs font-semibold text-center">병원</TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-center">
                혈액검사
                <span className="block text-[10px] font-normal text-muted-foreground">Blood Test</span>
              </TableHead>
              {ALL_VISITS.map((v) => (
                <TableHead key={v} className="w-[110px] text-xs font-semibold text-center">
                  {v === "baseline" ? "Baseline" : v.toUpperCase()}
                  <div className="mt-0.5 flex justify-center gap-1 text-[9px] font-normal text-muted-foreground">
                    <span>예약</span>
                    <span>|</span>
                    <span>EMR</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[50px] text-xs font-semibold text-center">수정</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id} className="hover:bg-muted/30">
                <TableCell className="text-sm font-medium">{subject.subjectId}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[10px]">{subject.site}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {hasBloodTest(subject) ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">{subject.bloodTestResult}</span>
                    </div>
                  ) : subject.bloodTestReason ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-amber-600 font-medium">미시행</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">{subject.bloodTestReason}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 rounded bg-red-100 px-1.5 py-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-[10px] text-red-600 font-semibold">미입력</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    {hasNextVisitDate(subject, "baseline") ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[10px] text-muted-foreground">{formatDate(subject.baselineNextVisitDate)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center rounded bg-red-100 px-1 py-0.5">
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                        <span className="text-[10px] text-red-600 font-semibold">미입력</span>
                      </div>
                    )}
                    <EmrCell subject={subject} visitKey="baseline" />
                  </div>
                </TableCell>
                {FU_KEYS.map((key) => (
                  <TableCell key={key} className="text-center">
                    {!isVisitApplicable(subject, key) ? (
                      <span className="text-[10px] text-muted-foreground">건너뜀</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        {hasNextVisitDate(subject, key) ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[10px] text-muted-foreground">{formatDate(subject.visits[key].nextVisitDate)}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center rounded bg-red-100 px-1 py-0.5">
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-[10px] text-red-600 font-semibold">미입력</span>
                          </div>
                        )}
                        <EmrCell subject={subject} visitKey={key} applicable={isVisitApplicable(subject, key)} />
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(subject)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingSubject} onOpenChange={(v) => !v && setEditingSubject(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSubject?.subjectId} - 완료 상태 수정</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <h4 className="mb-2 text-sm font-semibold">Baseline 혈액검사</h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">혈액검사 결과</Label>
                  <Input placeholder="예: 정상, HbA1c 7.2% 등" value={editForm.bloodTestResult} onChange={(e) => setEditForm((p) => ({ ...p, bloodTestResult: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">미시행 사유</Label>
                  <Textarea placeholder="혈액검사를 하지 못한 경우 사유를 입력하세요..." value={editForm.bloodTestReason} onChange={(e) => setEditForm((p) => ({ ...p, bloodTestReason: e.target.value }))} rows={2} />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <h4 className="mb-2 text-sm font-semibold">다음 예약일</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Baseline", key: "baselineNextVisitDate" },
                  { label: "FU1", key: "fu1NextVisitDate" },
                  { label: "FU2", key: "fu2NextVisitDate" },
                  { label: "FU3", key: "fu3NextVisitDate" },
                  { label: "FU4", key: "fu4NextVisitDate" },
                ].map(({ label, key }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input type="date" value={editForm[key as keyof typeof editForm]} onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubject(null)}>취소 / Cancel</Button>
            <Button onClick={handleSave}>저장 / Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
