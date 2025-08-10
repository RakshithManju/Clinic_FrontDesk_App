"use client"

import { useState, useEffect } from "react"
import { Card, CardBody, Button, Spinner } from "@nextui-org/react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import toast from "react-hot-toast"
import { LoginForm } from "./auth/LoginForm"
import { Dashboard } from "./dashboard/Dashboard"
import { QueueManagement } from "./queue/QueueManagement"
import { AppointmentManagement } from "./appointments/AppointmentManagement"
import { DoctorManagement } from "./doctors/DoctorManagement"
import { PatientManagement } from "./patients/PatientManagement"
import { Sidebar } from "./layout/Sidebar"
import { Header } from "./layout/Header"
import api from "@/lib/api"
import type { User } from "@/lib/types"

type ActiveTab = "dashboard" | "queue" | "appointments" | "doctors" | "patients"

export function FrontDeskApp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    checkAuth()
    
    // Listen for auth errors from API interceptor
    const handleAuthError = () => {
      setUser(null)
      toast.error("Session expired. Please log in again.")
    }
    
    window.addEventListener('auth-error', handleAuthError)
    return () => window.removeEventListener('auth-error', handleAuthError)
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setLoading(false)
        return
      }
      // For now, just check if token exists
      setUser({ id: 1, email: "frontdesk@medicareplus.com", roles: ["FRONT_DESK"], clinicId: 1 })
    } catch (error) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const { access_token, refresh_token, user } = response.data

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)

      toast.success("Welcome back!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed")
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
    setActiveTab("dashboard")
    toast.success("Logged out successfully")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl">
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary-600 mb-2">MediCare Plus</h1>
                <p className="text-gray-600 dark:text-gray-400">Front Desk Management System</p>
              </div>
              <LoginForm onLogin={handleLogin} />
              <div className="mt-6 text-center">
                <Button
                  variant="light"
                  size="sm"
                  onClick={toggleTheme}
                  startContent={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "queue":
        return <QueueManagement />
      case "appointments":
        return <AppointmentManagement />
      case "doctors":
        return <DoctorManagement />
      case "patients":
        return <PatientManagement />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          onThemeToggle={toggleTheme}
          theme={theme}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
