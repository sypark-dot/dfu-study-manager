"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { Dashboard } from "@/components/dashboard"
import { checkPassword, isAuthenticated, setAuthenticated } from "@/lib/store"

export default function Home() {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthed(isAuthenticated())
    setLoading(false)
  }, [])

  function handleLogin(password: string): boolean {
    if (checkPassword(password)) {
      setAuthenticated(true)
      setAuthed(true)
      return true
    }
    return false
  }

  function handleLogout() {
    setAuthenticated(false)
    setAuthed(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}
