import { supabase } from "./supabase"
import type { Subject } from "./types"

const AUTH_KEY = "dfu_authed"
const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "1234"

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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getSubjects error:", error)
    return []
  }

  return (data ?? []).map(mapDbToSubject)
}

export async function addSubject(subject: Subject): Promise<Subject> {
  const dbSubject = mapSubjectToDb(subject)

  const { data, error } = await supabase
    .from("subjects")
    .insert(dbSubject)
    .select()
    .single()

  if (error) {
    console.error("addSubject error:", error)
    throw error
  }

  return mapDbToSubject(data)
}

export async function updateSubject(subject: Subject): Promise<Subject> {
  const dbSubject = mapSubjectToDb({
    ...subject,
    updatedAt: new Date().toISOString(),
  })

  console.log("[v0] Updating subject with data:", JSON.stringify(dbSubject, null, 2))

  const { data, error } = await supabase
    .from("subjects")
    .update(dbSubject)
    .eq("id", subject.id)
    .select()
    .single()

  if (error) {
    console.error("updateSubject error:", error)
    console.error("[v0] Error code:", error.code)
    console.error("[v0] Error message:", error.message)
    console.error("[v0] Error details:", error.details)
    throw error
  }

  console.log("[v0] Update successful, response:", data)
  return mapDbToSubject(data)
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase.from("subjects").delete().eq("id", id)

  if (error) {
    console.error("deleteSubject error:", error)
    throw error
  }
}

// Database column names use snake_case, app uses camelCase
function mapDbToSubject(db: Record<string, unknown>): Subject {
  return {
    id: db.id as string,
    site: db.site as Subject["site"],
    subjectId: db.subject_id as string,
    subjectName: db.subject_name as string,
    phoneNumber: db.phone_number as string,
    hospitalRegNo: db.hospital_reg_no as string,
    ulcerNo: db.ulcer_no as number,
    staffName: db.staff_name as string,
    baselineDate: db.baseline_date as string,
    visitInterval: db.visit_interval as Subject["visitInterval"],
    isLTF: db.is_ltf as boolean,
    visits: db.visits as Subject["visits"],
    notes: db.notes as string,
    createdAt: db.created_at as string,
    updatedAt: db.updated_at as string,
    bloodTestDone: db.blood_test_done as boolean | null,
    nextVisitConfirmed: db.next_visit_confirmed as boolean,
  }
}

function mapSubjectToDb(subject: Subject): Record<string, unknown> {
  return {
    id: subject.id,
    site: subject.site,
    subject_id: subject.subjectId,
    subject_name: subject.subjectName,
    phone_number: subject.phoneNumber,
    hospital_reg_no: subject.hospitalRegNo,
    ulcer_no: subject.ulcerNo,
    staff_name: subject.staffName,
    baseline_date: subject.baselineDate,
    visit_interval: subject.visitInterval,
    is_ltf: subject.isLTF,
    visits: subject.visits,
    notes: subject.notes,
    created_at: subject.createdAt,
    updated_at: subject.updatedAt,
    blood_test_done: subject.bloodTestDone ?? null,
    next_visit_confirmed: subject.nextVisitConfirmed ?? false,
  }
}
