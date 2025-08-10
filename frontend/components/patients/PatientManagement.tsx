"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
} from "@nextui-org/react"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  Heart,
  MapPin,
} from "lucide-react"
import api from "@/lib/api"
import toast from "react-hot-toast"
import type { Patient } from "@/lib/types"

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const patientsPerPage = 10

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get("/patients")
      setPatients(response.data)
    } catch (error) {
      toast.error("Failed to load patients")
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = async () => {
    try {
      const response = await api.post("/patients", formData)
      setPatients([...patients, response.data])
      setIsAddModalOpen(false)
      resetForm()
      toast.success("Patient added successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add patient")
    }
  }

  const handleEditPatient = async () => {
    if (!selectedPatient) return
    try {
      const response = await api.patch(`/patients/${selectedPatient.id}`, formData)
      setPatients(patients.map(p => p.id === selectedPatient.id ? response.data : p))
      setIsEditModalOpen(false)
      setSelectedPatient(null)
      resetForm()
      toast.success("Patient updated successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update patient")
    }
  }

  const handleDeletePatient = async (patientId: number) => {
    if (!confirm("Are you sure you want to delete this patient?")) return
    try {
      await api.delete(`/patients/${patientId}`)
      setPatients(patients.filter(p => p.id !== patientId))
      toast.success("Patient deleted successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete patient")
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
    })
  }

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth?.split('T')[0] || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(true)
  }

  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)
  const startIndex = (currentPage - 1) * patientsPerPage
  const endIndex = startIndex + patientsPerPage
  const currentPatients = filteredPatients.slice(startIndex, endIndex)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const genders = ["male", "female", "other"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Patient Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage patient records and medical information
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<Plus size={20} />}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Add New Patient
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full sm:w-auto">
                <Input
                  placeholder="Search patients by name, phone, or email..."
                  startContent={<Search className="text-gray-400" size={20} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-lg"
                  size="lg"
                />
              </div>
              <Button
                variant="bordered"
                startContent={<Filter size={20} />}
                className="border-2 font-semibold"
              >
                Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold">{patients.length}</div>
              <div className="text-blue-100">Total Patients</div>
            </CardBody>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold">{patients.filter(p => p.isActive).length}</div>
              <div className="text-green-100">Active Patients</div>
            </CardBody>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold">{patients.filter(p => new Date().getFullYear() - new Date(p.dateOfBirth || '').getFullYear() < 18).length}</div>
              <div className="text-purple-100">Pediatric</div>
            </CardBody>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold">{patients.filter(p => new Date().getFullYear() - new Date(p.dateOfBirth || '').getFullYear() >= 60).length}</div>
              <div className="text-orange-100">Senior</div>
            </CardBody>
          </Card>
        </div>

        {/* Patients Table */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Patients</h3>
              <Chip color="primary" variant="flat" size="lg">
                {filteredPatients.length} patients
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <>
                <Table aria-label="Patients table" className="min-h-[400px]">
                  <TableHeader>
                    <TableColumn>PATIENT</TableColumn>
                    <TableColumn>CONTACT</TableColumn>
                    <TableColumn>AGE/GENDER</TableColumn>
                    <TableColumn>BLOOD GROUP</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={"No patients found"}>
                    {currentPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={getInitials(patient.firstName, patient.lastName)}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
                              size="md"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {patient.patientId || `P${patient.id.toString().padStart(4, '0')}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-gray-400" />
                              <span>{patient.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={14} className="text-gray-400" />
                              <span className="truncate max-w-[150px]">{patient.email || "N/A"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{getAge(patient.dateOfBirth || "")} years</div>
                            <Chip size="sm" variant="flat" color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'}>
                              {patient.gender || "N/A"}
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="solid" color="danger" className="font-semibold">
                            {patient.bloodGroup || "Unknown"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={patient.isActive ? "success" : "default"}
                            variant="flat"
                          >
                            {patient.isActive ? "Active" : "Inactive"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                              >
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Patient actions">
                              <DropdownItem
                                key="view"
                                startContent={<Eye size={16} />}
                                onClick={() => openViewModal(patient)}
                              >
                                View Details
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                startContent={<Edit size={16} />}
                                onClick={() => openEditModal(patient)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Trash2 size={16} />}
                                onClick={() => handleDeletePatient(patient.id)}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex justify-center py-4">
                    <Pagination
                      total={totalPages}
                      page={currentPage}
                      onChange={setCurrentPage}
                      color="primary"
                      size="lg"
                      showControls
                    />
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        size="3xl"
        scrollBehavior="inside"
        className="max-h-[90vh]"
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Patient
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                startContent={<User size={18} className="text-gray-400" />}
                isRequired
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                startContent={<User size={18} className="text-gray-400" />}
                isRequired
              />
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                startContent={<Calendar size={18} className="text-gray-400" />}
              />
              <Select
                label="Gender"
                placeholder="Select gender"
                selectedKeys={formData.gender ? [formData.gender] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  setFormData({ ...formData, gender: selectedKey })
                }}
              >
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                startContent={<Phone size={18} className="text-gray-400" />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                startContent={<Mail size={18} className="text-gray-400" />}
              />
              <Select
                label="Blood Group"
                placeholder="Select blood group"
                selectedKeys={formData.bloodGroup ? [formData.bloodGroup] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  setFormData({ ...formData, bloodGroup: selectedKey })
                }}
              >
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                startContent={<MapPin size={18} className="text-gray-400" />}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <Textarea
                label="Allergies"
                placeholder="List any known allergies..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                minRows={2}
              />
              <Textarea
                label="Medical History"
                placeholder="Enter relevant medical history..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddPatient}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              Add Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPatient(null)
          resetForm()
        }}
        size="3xl"
        scrollBehavior="inside"
        className="max-h-[90vh]"
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Patient
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                startContent={<User size={18} className="text-gray-400" />}
                isRequired
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                startContent={<User size={18} className="text-gray-400" />}
                isRequired
              />
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                startContent={<Calendar size={18} className="text-gray-400" />}
              />
              <Select
                label="Gender"
                placeholder="Select gender"
                selectedKeys={formData.gender ? [formData.gender] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  setFormData({ ...formData, gender: selectedKey })
                }}
              >
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                startContent={<Phone size={18} className="text-gray-400" />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                startContent={<Mail size={18} className="text-gray-400" />}
              />
              <Select
                label="Blood Group"
                placeholder="Select blood group"
                selectedKeys={formData.bloodGroup ? [formData.bloodGroup] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  setFormData({ ...formData, bloodGroup: selectedKey })
                }}
              >
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                startContent={<MapPin size={18} className="text-gray-400" />}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <Textarea
                label="Allergies"
                placeholder="List any known allergies..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                minRows={2}
              />
              <Textarea
                label="Medical History"
                placeholder="Enter relevant medical history..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setIsEditModalOpen(false)
                setSelectedPatient(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleEditPatient}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              Update Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Patient Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedPatient(null)
        }}
        size="4xl"
        scrollBehavior="inside"
        className="max-h-[90vh]"
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Patient Details
          </ModalHeader>
          <ModalBody className="py-6">
            {selectedPatient && (
              <div className="space-y-8">
                {/* Patient Header */}
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                  <Avatar
                    name={getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold w-20 h-20 text-2xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Patient ID: {selectedPatient.patientId || `P${selectedPatient.id.toString().padStart(4, '0')}`}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <Chip color={selectedPatient.isActive ? "success" : "default"} variant="flat">
                        {selectedPatient.isActive ? "Active" : "Inactive"}
                      </Chip>
                      <Chip color="primary" variant="flat">
                        {getAge(selectedPatient.dateOfBirth || "")} years old
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <User className="text-blue-500" size={20} />
                        Personal Information
                      </h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</label>
                          <p className="text-lg font-medium capitalize">{selectedPatient.gender || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Blood Group</label>
                          <Chip color="danger" variant="solid" className="font-bold">
                            {selectedPatient.bloodGroup || "Unknown"}
                          </Chip>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Date of Birth</label>
                        <p className="text-lg font-medium">{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Contact Information */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Phone className="text-green-500" size={20} />
                        Contact Information
                      </h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-gray-400" />
                        <div>
                          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Phone</label>
                          <p className="text-lg font-medium">{selectedPatient.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-gray-400" />
                        <div>
                          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Email</label>
                          <p className="text-lg font-medium">{selectedPatient.email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-400 mt-1" />
                        <div>
                          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Address</label>
                          <p className="text-lg font-medium">{selectedPatient.address || "N/A"}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Medical Information */}
                <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Heart className="text-red-500" size={20} />
                        Medical Information
                      </h3>
                    </CardHeader>
                    <CardBody className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Allergies</label>
                        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <CardBody>
                            <p className="text-gray-800 dark:text-gray-200">{selectedPatient.allergies || "No known allergies"}</p>
                          </CardBody>
                        </Card>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Medical History</label>
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <CardBody>
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selectedPatient.medicalHistory || "No medical history recorded"}</p>
                          </CardBody>
                        </Card>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="light"
              onPress={() => selectedPatient && openEditModal(selectedPatient)}
              startContent={<Edit size={16} />}
            >
              Edit Patient
            </Button>
            <Button
              color="primary"
              onPress={() => {
                setIsViewModalOpen(false)
                setSelectedPatient(null)
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
