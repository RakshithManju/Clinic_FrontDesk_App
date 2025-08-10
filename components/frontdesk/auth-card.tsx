"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import LoginCard from "./login-card"
import RegisterCard from "./register-card"

type Me = {
  id: string
  email: string
  role: "frontdesk" | "admin"
}

export default function AuthCard({ onSuccess }: { onSuccess: (me: Me) => void }) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {isLogin ? (
        <LoginCard onSuccess={onSuccess} />
      ) : (
        <RegisterCard onSuccess={onSuccess} />
      )}
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary hover:text-primary/80"
        >
          {isLogin ? "Create new account" : "Sign in instead"}
        </Button>
      </div>
    </div>
  )
}
