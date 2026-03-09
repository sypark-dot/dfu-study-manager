import type { Subject } from "./types"

const STORAGE_KEY = "dfu-study-subjects"
const AUTH_KEY = "dfu-study-auth"
const PASSWORD = "dfu2025!"

export function getSubjects(): Subject[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSubjects(subjects: Subject[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
}

export function addSubject(subject: Subject): Subject[] {
  const subjects = getSubjects()
  subjects.push(subject)
  saveSubjects(subjects)
  return subjects
}

export function updateSubject(updated: Subject): Subject[] {
  const subjects = getSubjects()
  const index = subjects.findIndex((s) => s.id === updated.id)
  if (index !== -1) {
    updated.updatedAt = new Date().toISOString()
    subjects[index] = updated
    saveSubjects(subjects)
  }
  return subjects
}

export function deleteSubject(id: string): Subject[] {
  const subjects = getSubjects().filter((s) => s.id !== id)
  saveSubjects(subjects)
  return subjects
}

export function checkPassword(pw: string): boolean {
  return pw === PASSWORD
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "true"
}

export function setAuthenticated(val: boolean): void {
  if (typeof window === "undefined") return
  if (val) {
    localStorage.setItem(AUTH_KEY, "true")
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}
