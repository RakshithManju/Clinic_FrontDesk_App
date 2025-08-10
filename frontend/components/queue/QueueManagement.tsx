"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { Plus, Clock } from "lucide-react"
import toast from "react-hot-toast"
import api from "@/lib/api"
import type { QueueEntry, Patient, Doctor } from "@/lib/types"

export function QueueManagement() {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [priority, setPriority] = useState("NORMAL")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [queueRes, patientsRes, doctorsRes] = await Promise.all([
        api.get("/queue"),
        api.get("/patients"),
        api.get("/doctors"),
      ])
      setQueue(queueRes.data)
      setPatients(patientsRes.data)
      setDoctors(doctorsRes.data)
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addToQueue = async () => {
    try {
      await api.post("/queue", {
        patientId: Number(selectedPatient),
        assignedDoctorId: selectedDoctor ? Number(selectedDoctor) : null,
        priority,
        notes,
      })
      toast.success("Patient added to queue")
      onClose()
      setSelectedPatient("")
      setSelectedDoctor("")
      setPriority("NORMAL")
      setNotes("")
      loadData()
    } catch (error) {
      toast.error("Failed to add patient to queue")
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/queue/${id}`, { status })
      toast.success("Status updated")
      loadData()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "danger"
      case "URGENT":
        return "warning"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "warning"
      case "CALLED":
        return "primary"
      case "WITH_DOCTOR":
        return "success"
      case "COMPLETED":
        return "success"
      default:
        return "default"
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Queue Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient queue and waiting times</p>
        </div>
        <Button color="primary" startContent={<Plus size={20} />} onPress={onOpen}>
          Add to Queue
        </Button>
      </div>

      <div className="grid gap-4">
        {queue.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No patients in queue</p>
            </CardBody>
          </Card>
        ) : (
          queue.map((entry) => (
            <Card key={entry.id} className="shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {entry.queueNumber}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.patient.firstName} {entry.patient.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Chip size="sm" color={getPriorityColor(entry.priority)} variant="flat">
                          {entry.priority}
                        </Chip>
                        <Chip size="sm" color={getStatusColor(entry.status)} variant="flat">
                          {entry.status.replace("_", " ")}
                        </Chip>
                        {entry.assignedDoctor && (
                          <Chip size="sm" variant="flat">
                            Dr. {entry.assignedDoctor.name}
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Arrived: {new Date(entry.arrivalTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="flat" color="primary" onClick={() => updateStatus(entry.id, "CALLED")}>
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      onClick={() => updateStatus(entry.id, "WITH_DOCTOR")}
                    >
                      With Doctor
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      onClick={() => updateStatus(entry.id, "COMPLETED")}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add Patient to Queue</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Select Patient"
                placeholder="Choose a patient"
                selectedKeys={selectedPatient ? [selectedPatient] : []}
                onSelectionChange={(keys) => setSelectedPatient(Array.from(keys)[0] as string)}
              >
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Assign Doctor (Optional)"
                placeholder="Choose a doctor"
                selectedKeys={selectedDoctor ? [selectedDoctor] : []}
                onSelectionChange={(keys) => setSelectedDoctor(Array.from(keys)[0] as string)}
              >
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Priority"
                selectedKeys={[priority]}
                onSelectionChange={(keys) => setPriority(Array.from(keys)[0] as string)}
              >
                <SelectItem key="NORMAL">Normal</SelectItem>
                <SelectItem key="URGENT">Urgent</SelectItem>
                <SelectItem key="EMERGENCY">Emergency</SelectItem>
              </Select>

              <Input
                label="Notes"
                placeholder="Additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={addToQueue} isDisabled={!selectedPatient}>
              Add to Queue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
