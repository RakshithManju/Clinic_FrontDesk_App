"use client"

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react"
import { Menu, Sun, Moon, LogOut, User } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface HeaderProps {
  user: UserType
  onMenuClick: () => void
  onLogout: () => void
  onThemeToggle: () => void
  theme?: string
}

export function Header({ user, onMenuClick, onLogout, onThemeToggle, theme }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button isIconOnly variant="light" onClick={onMenuClick} className="lg:hidden mr-2">
            <Menu size={20} />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Front Desk System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button isIconOnly variant="light" onClick={onThemeToggle}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user.firstName || user.email}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<User size={16} />}>
                My Settings
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut size={16} />} onClick={onLogout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
