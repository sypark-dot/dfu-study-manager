"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface LoginScreenProps {
  onLogin: (password: string) => boolean
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(false)

    setTimeout(() => {
      const success = onLogin(password)
      if (!success) {
        setError(true)
        setPassword("")
      }
      setIsLoading(false)
    }, 300)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">DFU Study Manager</CardTitle>
          <CardDescription>
            당뇨발 AI 연구 관리 시스템
            <br />
            <span className="text-xs text-muted-foreground">Diabetic Foot AI Research Management</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                비밀번호 / Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                autoFocus
                aria-invalid={error}
              />
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  비밀번호가 틀렸습니다. / Incorrect password.
                </p>
              )}
            </div>
            <Button type="submit" disabled={isLoading || !password}>
              {isLoading ? "확인 중..." : "로그인 / Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
