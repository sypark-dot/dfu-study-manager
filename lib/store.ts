import { supabase } from "./supabase"
import type { Subject } from "./types"

const AUTH_KEY = "dfu_authed"
const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "lexsoft2024"

export function checkPassword(pw: string): boolean {
  return pw === PASSWORD
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "true"
}

export function setAuthenticated(value: boolean) {
  if (typeof window === "undefined") return
  if (value) {
    localStorage.setItem(AUTH_KEY, "true")
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("subject_id", { ascending: true })

  if (error) {
    console.error("getSubjects error:", error)
    return []
  }

  return (data || []).map(rowToSubject)
}

export async function addSubject(subject: Subject): Promise<Subject> {
  const { data, error } = await supabase
    .from("subjects")
    .insert(subjectToRow(subject))
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToSubject(data)
}

export async function updateSubject(subject: Subject): Promise<Subject> {
  const { data, error } = await supabase
    .from("subjects")
    .update(subjectToRow(subject))
    .eq("id", subject.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToSubject(data)
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSubject(row: any): Subject {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    phoneNumber: row.phone_number ?? "",
    hospitalRegNo: row.hospital_reg_no ?? "",
    ulcerNo: row.ulcer_no ?? 1,
    staffName: row.staff_name ?? "",
    baselineDate: row.baseline_date ?? "",
    visitInterval: row.visit_interval ?? 1,
    visits: row.visits ?? {
      fu1: { date: null, status: "pending", interval: 1, notes: "" },
      fu2: { date: null, status: "pending", interval: 1, notes: "" },
      fu3: { date: null, status: "pending", interval: 1, notes: "" },
      fu4: { date: null, status: "pending", interval: 1, notes: "" },
    },
    site: row.site,
    notes: row.notes ?? "",
  }
}

function subjectToRow(s: Subject) {
  return {
    id: s.id,
    subject_id: s.subjectId,
    subject_name: s.subjectName,
    phone_number: s.phoneNumber,
    hospital_reg_no: s.hospitalRegNo,
    ulcer_no: s.ulcerNo,
    staff_name: s.staffName,
    baseline_date: s.baselineDate,
    visit_interval: s.visitInterval,
    visits: s.visits,
    site: s.site,
    notes: s.notes,
  }
}
