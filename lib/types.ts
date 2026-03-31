export type Site = "IJH" | "SCH" | "EWH"

export type VisitInterval = 1 | 2

export type VisitStatus = "pending" | "completed" | "skipped" | "missed"

export interface VisitData {
  status: VisitStatus
  actualDate: string | null
  reason: string
  interval: VisitInterval // weeks until this visit from previous
  nextVisitDate?: string | null // 다음 예약 날짜
}

export interface Subject {
  id: string
  site: Site
  subjectId: string
  subjectName: string
  phoneNumber: string
  hospitalRegNo: string
  ulcerNo: number
  staffName: string
  baselineDate: string
  visitInterval: VisitInterval
  isLTF: boolean
  visits: {
    fu1: VisitData
    fu2: VisitData
    fu3: VisitData
    fu4: VisitData
  }
  notes: string
  createdAt: string
  updatedAt: string
  // Baseline 혈액검사 관련 필드
  bloodTestResult?: string | null // 혈액검사 결과
  bloodTestReason?: string | null // 혈액검사 미시행 사유
  baselineNextVisitDate?: string | null // Baseline 다음 예약 날짜
}

export type FUKey = "fu1" | "fu2" | "fu3" | "fu4"

export const FU_LABELS: Record<FUKey, string> = {
  fu1: "FU1",
  fu2: "FU2",
  fu3: "FU3",
  fu4: "FU4",
}

export const SITE_OPTIONS: Site[] = ["IJH", "SCH", "EWH"]

export const SITE_LABELS: Record<Site, string> = {
  IJH: "IJH (인제대학교 일산백병원)",
  SCH: "SCH (순천향대학교병원)",
  EWH: "EWH (이대목동병원)",
}

export function createEmptyVisit(interval: VisitInterval = 2): VisitData {
  return {
    status: "pending",
    actualDate: null,
    reason: "",
    interval,
    nextVisitDate: null,
  }
}

export function createDefaultSubject(site: Site, defaultInterval: VisitInterval = 2): Subject {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    site,
    subjectId: "",
    subjectName: "",
    phoneNumber: "",
    hospitalRegNo: "",
    ulcerNo: 1,
    staffName: "",
    baselineDate: "",
    visitInterval: defaultInterval,
    isLTF: false,
    visits: {
      fu1: createEmptyVisit(defaultInterval),
      fu2: createEmptyVisit(defaultInterval),
      fu3: createEmptyVisit(defaultInterval),
      fu4: createEmptyVisit(defaultInterval),
    },
    notes: "",
    createdAt: now,
    updatedAt: now,
    bloodTestResult: null,
    bloodTestReason: null,
    baselineNextVisitDate: null,
  }
}
