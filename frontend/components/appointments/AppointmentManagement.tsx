"use client"

import { useState, useEffect } from "react"
import { Card, CardBody, Button, Chip } from "@nextui-org/react"
import { Calendar, Clock } from "lucide-react"
import toast from "react-hot-toast"
import api from "@/lib/api"
import type { Appointment } from "@/lib/types"

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const response = await api.get("/appointments")
      setAppointments(response.data)
    } catch (error) {
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const handleRescheduleAppointment = async (appointmentId: number) => {
    try {
      // For now, just show a toast - in production you'd open a reschedule modal
      toast.success("Reschedule functionality coming soon!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reschedule appointment")
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: "CANCELLED" })
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: "CANCELLED" as any }
          : apt
      ))
      toast.success("Appointment cancelled successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "primary"
      case "CONFIRMED":
        return "success"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
        return "danger"
      case "NO_SHOW":
        return "warning"
      default:
        return "default"
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage patient appointments and schedules</p>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No appointments scheduled</p>
            </CardBody>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dr. {appointment.doctor.name} - {appointment.doctor.specialization}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleString()}
                        </span>
                        <Chip size="sm" color={getStatusColor(appointment.status)} variant="flat">
                          {appointment.status}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {appointment.type}
                        </Chip>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="primary"
                      onClick={() => handleRescheduleAppointment(appointment.id)}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="danger"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
