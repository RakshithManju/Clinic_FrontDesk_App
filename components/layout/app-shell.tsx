"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Menu, X, ListOrdered, CalendarClock, Stethoscope, UsersRound, Search, LogOut, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { CommandMenu } from "@/components/frontdesk/command-menu"

type NavKey = "queue" | "appointments" | "doctors" | "patients"

export type AppShellProps = {
  userEmail: string
  active: NavKey
  onChange: (key: NavKey) => void
  onLogout: () => void
  children: React.ReactNode
}

export default function AppShell({ userEmail, active, onChange, onLogout, children }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "F2") {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const NavItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ComponentType<any>
    label: string
    value: NavKey
  }) => (
    <button
      onClick={() => {
        onChange(value)
        setOpen(false)
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active === value ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70",
      )}
      aria-current={active === value ? "page" : undefined}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <>
      <div className="flex min-h-[100dvh] bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card p-3 transition-transform md:static md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
          aria-label="Sidebar navigation"
        >
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="text-base font-semibold">FrontDeskSystem</div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="grid gap-1">
            <NavItem icon={ListOrdered} label="Queue" value="queue" />
            <NavItem icon={CalendarClock} label="Appointments" value="appointments" />
            <NavItem icon={Stethoscope} label="Doctors" value="doctors" />
            <NavItem icon={UsersRound} label="Patients" value="patients" />
          </nav>
          <div className="mt-auto hidden md:block" />
        </aside>

        {/* Main */}
        <div className="ml-0 flex min-w-0 flex-1 flex-col md:ml-0">
          {/* Header with subtle gradient brand accent */}
          <header className="sticky top-0 z-30 border-b">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-50/60 via-transparent to-transparent dark:from-emerald-900/30" />
            <div className="flex items-center gap-2 px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="relative ml-1 hidden flex-1 items-center md:flex">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search patients, doctors, appointments... (⌘/Ctrl K)" />
              </div>

              <div className="ml-auto flex items-center gap-1 sm:gap-3">
                <Button variant="ghost" size="icon" onClick={() => setCmdOpen(true)} aria-label="Open command menu">
                  <Command className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <div className="hidden text-sm text-muted-foreground sm:block">{userEmail}</div>
                <Button variant="outline" size="sm" onClick={onLogout} aria-label="Sign out">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="px-4 pb-8 pt-4">{children}</main>
        </div>
      </div>
      <CommandMenu open={cmdOpen} setOpen={setCmdOpen} onNavigate={onChange} />
    </>
  )
}
