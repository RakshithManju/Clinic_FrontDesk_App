"use client"

import { useState } from "react"
import { Card, CardBody, Button } from "@nextui-org/react"

export function FrontDeskAppMinimal() {
  const [user, setUser] = useState(null)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl">
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">MediCare Plus</h1>
                <p className="text-gray-600 dark:text-gray-400">Front Desk Management System</p>
              </div>
              <Button 
                color="primary" 
                className="w-full"
                onClick={() => setUser({ email: 'test@example.com' })}
              >
                Login (Demo)
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Welcome to the Front Desk System
        </p>
        <Button onClick={() => setUser(null)}>
          Logout
        </Button>
      </div>
    </div>
  )
}
