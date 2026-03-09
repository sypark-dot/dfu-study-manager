import type { Subject } from "./types"

const AUTH_KEY = "dfu_authed"
const SUBJECTS_KEY = "dfu_subjects"
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
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(SUBJECTS_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Subject[]
  } catch (error) {
    console.error("getSubjects error:", error)
    return []
  }
}

export async function addSubject(subject: Subject): Promise<Subject> {
  const subjects = await getSubjects()
  subjects.push(subject)
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
  return subject
}

export async function updateSubject(subject: Subject): Promise<Subject> {
  const subjects = await getSubjects()
  const index = subjects.findIndex((s) => s.id === subject.id)
  if (index === -1) throw new Error("Subject not found")
  subjects[index] = { ...subject, updatedAt: new Date().toISOString() }
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
  return subjects[index]
}

export async function deleteSubject(id: string): Promise<void> {
  const subjects = await getSubjects()
  const filtered = subjects.filter((s) => s.id !== id)
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(filtered))
}
