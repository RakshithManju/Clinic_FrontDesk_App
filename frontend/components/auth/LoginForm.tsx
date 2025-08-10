"use client"

import React, { useState } from "react"
import { Button, Input } from "@nextui-org/react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("frontdesk@medicareplus.com")
  const [password, setPassword] = useState("frontdesk123")
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        startContent={<Mail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
        required
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        startContent={<Lock className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
        endContent={
          <button className="focus:outline-none" type="button" onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? (
              <EyeOff className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <Eye className="text-2xl text-default-400 pointer-events-none" />
            )}
          </button>
        }
        type={isVisible ? "text" : "password"}
        required
      />
      <Button type="submit" color="primary" className="w-full" isLoading={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
