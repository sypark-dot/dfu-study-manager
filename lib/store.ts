import type { Subject } from "./types"

const AUTH_KEY = "dfu_authed"
const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "1234"
const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

// ─── 인증 관련 (기존 그대로) ───────────────────────────────
export function checkPassword(pw: string): boolean {
  return pw === PASSWORD
}
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "true"
}
export function setAuthenticated(value: boolean) {
  if (typeof window === "undefined") return
  if (value) localStorage.setItem(AUTH_KEY, "true")
  else localStorage.removeItem(AUTH_KEY)
}

// ─── Google Sheets API 호출 ────────────────────────────────
export async function getSubjects(): Promise<Subject[]> {
  try {
    const res = await fetch(SCRIPT_URL)
    if (!res.ok) throw new Error("fetch 실패")
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error("getSubjects error:", e)
    return []
  }
}

export async function addSubject(subject: Subject): Promise<Subject> {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "create", subject }),
  })
  if (!res.ok) throw new Error("addSubject 실패")
  return subject
}

export async function updateSubject(subject: Subject): Promise<Subject> {
  const updated = { ...subject, updatedAt: new Date().toISOString() }
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "update", subject: updated }),
  })
  if (!res.ok) throw new Error("updateSubject 실패")
  return updated
}

export async function deleteSubject(id: string): Promise<void> {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "delete", id }),
  })
  if (!res.ok) throw new Error("deleteSubject 실패")
}
