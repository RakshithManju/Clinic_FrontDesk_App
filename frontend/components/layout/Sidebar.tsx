"use client"

import { Button } from "@nextui-org/react"
import { X, LayoutDashboard, Users, Calendar, Stethoscope, UserCheck } from "lucide-react"

type ActiveTab = "dashboard" | "queue" | "appointments" | "doctors" | "patients"

interface SidebarProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  onClose: () => void
}

export function Sidebar({ activeTab, onTabChange, onClose }: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as ActiveTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "queue" as ActiveTab, label: "Queue", icon: UserCheck },
    { id: "appointments" as ActiveTab, label: "Appointments", icon: Calendar },
    { id: "doctors" as ActiveTab, label: "Doctors", icon: Stethoscope },
    { id: "patients" as ActiveTab, label: "Patients", icon: Users },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary-600">MediCare Plus</h2>
          <Button isIconOnly variant="light" size="sm" onClick={onClose} className="lg:hidden">
            <X size={20} />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "solid" : "light"}
                  color={activeTab === item.id ? "primary" : "default"}
                  className="w-full justify-start"
                  startContent={<Icon size={20} />}
                  onClick={() => {
                    onTabChange(item.id)
                    onClose()
                  }}
                >
                  {item.label}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
