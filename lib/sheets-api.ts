import type { Subject } from "@/lib/types"

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

export async function fetchSubjects(): Promise<Subject[]> {
  const res = await fetch(SCRIPT_URL)
  if (!res.ok) throw new Error("Failed to fetch subjects")
  return res.json()
}

export async function createSubject(subject: Subject): Promise<void> {
  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "create", subject }),
  })
}

export async function updateSubject(subject: Subject): Promise<void> {
  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "update", subject }),
  })
}

export async function deleteSubject(id: string): Promise<void> {
  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "delete", id }),
  })
}
```

---

**Step 3: `.env.local` 에 추가**
```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/여기에URL/exec
