"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { Subject, Site, VisitInterval } from "@/lib/types"
import { createDefaultSubject, SITE_OPTIONS, SITE_LABELS } from "@/lib/types"

interface SubjectFormProps {
  open: boolean
  onClose: () => void
  onSave: (subject: Subject) => void
  initialData?: Subject | null
}

export function SubjectForm({ open, onClose, onSave, initialData }: SubjectFormProps) {
  const [formData, setFormData] = useState<Subject>(
    initialData || createDefaultSubject("IJH")
  )

  function handleSiteChange(site: Site) {
    setFormData((prev) => ({ ...prev, site }))
  }

  function handleChange(field: keyof Subject, value: string | number | null) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleIntervalChange(checked: boolean) {
    const interval: VisitInterval = checked ? 2 : 1
    setFormData((prev) => ({
      ...prev,
      visitInterval: interval,
      visits: {
        fu1: { ...prev.visits.fu1, interval },
        fu2: { ...prev.visits.fu2, interval },
        fu3: { ...prev.visits.fu3, interval },
        fu4: { ...prev.visits.fu4, interval },
      },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.subjectId || !formData.subjectName || !formData.baselineDate) return
    onSave(formData)
    onClose()
  }

  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "대상자 수정 / Edit Subject" : "대상자 등록 / Add Subject"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="site">병원명 / Site</Label>
              <Select value={formData.site} onValueChange={(v) => handleSiteChange(v as Site)}>
                <SelectTrigger id="site">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SITE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subjectId">대상자 ID / Subject ID</Label>
              <Input
                id="subjectId"
                placeholder="e.g. IJH0001"
                value={formData.subjectId}
                onChange={(e) => handleChange("subjectId", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subjectName">이름 / Name</Label>
              <Input
                id="subjectName"
                placeholder="Subject name"
                value={formData.subjectName}
                onChange={(e) => handleChange("subjectName", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phoneNumber">연락처 / Phone</Label>
              <Input
                id="phoneNumber"
                placeholder="010-1234-5678"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hospitalRegNo">병원 등록번호 / Chart No</Label>
              <Input
                id="hospitalRegNo"
                placeholder="Hospital registration number"
                value={formData.hospitalRegNo}
                onChange={(e) => handleChange("hospitalRegNo", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ulcerNo">궤양 번호 / Ulcer No</Label>
              <Input
                id="ulcerNo"
                type="number"
                min={1}
                value={formData.ulcerNo}
                onChange={(e) => handleChange("ulcerNo", parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staffName">담당자 / Staff</Label>
              <Input
                id="staffName"
                placeholder="Staff name"
                value={formData.staffName}
                onChange={(e) => handleChange("staffName", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="baselineDate">기준일 / Baseline</Label>
              <Input
                id="baselineDate"
                type="date"
                value={formData.baselineDate}
                onChange={(e) => handleChange("baselineDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-3">
            <Label htmlFor="interval-toggle" className="flex-1 text-sm">
              기본 방문 간격 / Default Interval
              <span className="block text-xs text-muted-foreground">각 방문별로 개별 설정 가능</span>
            </Label>
            <span className="text-sm text-muted-foreground">1주 / 1wk</span>
            <Switch
              id="interval-toggle"
              checked={formData.visitInterval === 2}
              onCheckedChange={handleIntervalChange}
            />
            <span className="text-sm text-muted-foreground">2주 / 2wk</span>
          </div>

          {/* Baseline 혈액검사 및 다음 예약 섹션 */}
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Baseline 방문 정보</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                <Label htmlFor="bloodTestDone" className="flex-1 text-sm">
                  혈액검사 시행 / Blood Test Done
                </Label>
                <Switch
                  id="bloodTestDone"
                  checked={formData.bloodTestDone === true}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      bloodTestDone: checked,
                      bloodTestReason: checked ? "" : prev.bloodTestReason,
                    }))
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="baselineNextVisitDate">다음 예약일 / Next Visit Date</Label>
                <Input
                  id="baselineNextVisitDate"
                  type="date"
                  value={formData.baselineNextVisitDate || ""}
                  onChange={(e) => handleChange("baselineNextVisitDate", e.target.value)}
                />
              </div>
            </div>
            {!formData.bloodTestDone && (
              <div className="mt-3 flex flex-col gap-1.5">
                <Label htmlFor="bloodTestReason">혈액검사 미시행 사유 / Reason if not done</Label>
                <Textarea
                  id="bloodTestReason"
                  placeholder="혈액검사를 하지 못한 경우 사유를 입력하세요..."
                  value={formData.bloodTestReason || ""}
                  onChange={(e) => handleChange("bloodTestReason", e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">비고 / Notes</Label>
            <Textarea
              id="notes"
              placeholder="Free text notes..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소 / Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "저장 / Save" : "등록 / Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
