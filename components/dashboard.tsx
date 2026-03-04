"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Download, MapPin, CalendarCheck, Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Subject, Site } from "@/lib/types"
import { SITE_OPTIONS, SITE_LABELS, createDefaultSubject } from "@/lib/types"
import { getSubjects, addSubject, updateSubject, deleteSubject } from "@/lib/store"
import { hasVisitToday, hasVisitExactlyToday } from "@/lib/visit-utils"
import { exportToCSV } from "@/lib/export-utils"
import { SubjectForm } from "./subject-form"
import { SubjectRow } from "./subject-row"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  // Filters
  const [siteFilter, setSiteFilter] = useState<string>("all")
  const [staffFilter, setStaffFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [todayMode, setTodayMode] = useState(false)
  const [exactTodayMode, setExactTodayMode] = useState(false)

  const staffNames = useMemo(() => {
    const names = new Set(subjects.map((s) => s.staffName).filter(Boolean))
    return Array.from(names).sort()
  }, [subjects])

  const filteredSubjects = useMemo(() => {
    let list = [...subjects]

    if (siteFilter !== "all") {
      list = list.filter((s) => s.site === siteFilter)
    }

    if (staffFilter) {
      list = list.filter((s) => s.staffName === staffFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.subjectId.toLowerCase().includes(q) ||
          s.subjectName.toLowerCase().includes(q) ||
          s.staffName.toLowerCase().includes(q) ||
          s.notes.toLowerCase().includes(q)
      )
    }

    if (exactTodayMode) {
      list = list.filter(hasVisitExactlyToday)
    } else if (todayMode) {
      list = list.filter(hasVisitToday)
    }

    return list.sort((a, b) => a.subjectId.localeCompare(b.subjectId))
  }, [subjects, siteFilter, staffFilter, searchQuery, todayMode, exactTodayMode])

  const handleAdd = useCallback((subject: Subject) => {
    const updated = addSubject(subject)
    setSubjects(updated)
  }, [])

  const handleUpdate = useCallback((subject: Subject) => {
    const updated = updateSubject(subject)
    setSubjects(updated)
  }, [])

  const handleDelete = useCallback((id: string) => {
    const updated = deleteSubject(id)
    setSubjects(updated)
  }, [])

  const handleEdit = useCallback((subject: Subject) => {
    setEditingSubject(subject)
    setFormOpen(true)
  }, [])

  const handleSave = useCallback(
    (subject: Subject) => {
      if (editingSubject) {
        handleUpdate(subject)
      } else {
        handleAdd(subject)
      }
      setEditingSubject(null)
    },
    [editingSubject, handleUpdate, handleAdd]
  )

  const handleExport = useCallback(() => {
    exportToCSV(filteredSubjects)
  }, [filteredSubjects])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-foreground sm:text-xl">DFU Study Manager</h1>
            <p className="text-xs text-muted-foreground">당뇨발 AI 연구 관리 시스템</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">내보내기 / </span>Export
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingSubject(null)
                setFormOpen(true)
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">등록 / </span>Add
            </Button>
            <Button size="sm" variant="ghost" onClick={onLogout} aria-label="Logout">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filters bar */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="검색 / Search..."
              className="h-8 pl-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Site filter */}
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="병원 / Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 / All</SelectItem>
              {SITE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Staff filter */}
          <Select value={staffFilter || "all"} onValueChange={(v) => setStaffFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="담당자 / Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 / All</SelectItem>
              {staffNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Today mode toggle (window +-3 days) */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1">
            <MapPin className={`h-3.5 w-3.5 ${todayMode ? "text-primary" : "text-muted-foreground"}`} />
            <Label htmlFor="today-mode" className="cursor-pointer text-xs">
              외근 모드
            </Label>
            <Switch
              id="today-mode"
              checked={todayMode}
              onCheckedChange={(checked) => {
                setTodayMode(checked)
                if (checked) setExactTodayMode(false)
              }}
              className="scale-75"
            />
          </div>

          {/* Exact today toggle */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1">
            <CalendarCheck className={`h-3.5 w-3.5 ${exactTodayMode ? "text-primary" : "text-muted-foreground"}`} />
            <Label htmlFor="exact-today-mode" className="cursor-pointer text-xs">
              당일 방문
            </Label>
            <Switch
              id="exact-today-mode"
              checked={exactTodayMode}
              onCheckedChange={(checked) => {
                setExactTodayMode(checked)
                if (checked) setTodayMode(false)
              }}
              className="scale-75"
            />
          </div>

          {/* Count */}
          <Badge variant="secondary" className="ml-auto text-xs">
            {filteredSubjects.length}건 / {subjects.length}건
          </Badge>
        </div>
      </div>

      {/* Legend */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">상태:</span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="inline-block h-3 w-3 rounded bg-emerald-200 border border-emerald-400" />
            완료 Completed
          </span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="inline-block h-3 w-3 rounded bg-blue-200 border border-blue-400" />
            예정 Upcoming
          </span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="inline-block h-3 w-3 rounded bg-amber-200 border border-amber-400" />
            Window 초과
          </span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="inline-block h-3 w-3 rounded bg-red-200 border border-red-400" />
            미방문 Missed
          </span>
        </div>
      </div>

      {/* Table header */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="hidden items-center border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground sm:flex">
          <span className="w-6" />
          <span className="flex-1">대상자 정보 / Subject Info</span>
          <span className="w-32 text-center">FU1-FU4</span>
          <span className="w-16" />
        </div>
      </div>

      {/* Subject list */}
      <main className="mx-auto w-full max-w-7xl flex-1">
        {filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
              {exactTodayMode
                ? "오늘 당일 방문 예정 환자가 없습니다. / No patients expected exactly today."
                : todayMode
                ? "오늘 예정된 방문이 없습니다. / No visits scheduled for today."
                : subjects.length === 0
                ? "등록된 대상자가 없습니다. / No subjects registered yet."
                : "검색 결과가 없습니다. / No results found."}
            </p>
            {subjects.length === 0 && (
              <Button
                className="mt-4"
                size="sm"
                onClick={() => {
                  setEditingSubject(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                첫 대상자 등록 / Add First Subject
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSubjects.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                onUpdate={handleUpdate}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Subject form dialog */}
      {formOpen && (
        <SubjectForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setEditingSubject(null)
          }}
          onSave={handleSave}
          initialData={editingSubject}
        />
      )}
    </div>
  )
}
