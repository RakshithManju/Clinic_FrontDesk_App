"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Progress,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Badge,
  Divider,
  Spinner,
  CircularProgress,
} from "@nextui-org/react"
import {
  Users,
  Calendar,
  Stethoscope,
  Clock,
  TrendingUp,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Plus,
  Bell,
  Star,
  Award,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  UserCheck,
  Clock4,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Sparkles,
  Pulse,
  Shield,
  Flame,
  Globe,
  Wifi,
  Database,
} from "lucide-react"
import api from "@/lib/api"
import toast from "react-hot-toast"
import type { Patient, Doctor, Appointment, QueueEntry } from "@/lib/types"

interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  todayAppointments: number
  queueLength: number
  completedAppointments: number
  pendingAppointments: number
  availableDoctors: number
  criticalAlerts: number
}

interface RecentActivity {
  id: string
  type: 'appointment' | 'patient' | 'queue' | 'doctor'
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
  icon: React.ElementType
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    queueLength: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    availableDoctors: 0,
    criticalAlerts: 0,
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false)

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'patient',
      message: 'New patient registered: Sarah Johnson',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'medium',
      icon: Users
    },
    {
      id: '2',
      type: 'appointment',
      message: 'Appointment scheduled with Dr. Smith',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'low',
      icon: Calendar
    },
    {
      id: '3',
      type: 'queue',
      message: 'Patient added to emergency queue',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'high',
      icon: AlertTriangle
    },
    {
      id: '4',
      type: 'doctor',
      message: 'Dr. Wilson started consultation',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      priority: 'low',
      icon: Stethoscope
    }
  ])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = useCallback(async () => {
    try {
      if (!loading) setRefreshing(true)

      const [patientsRes, doctorsRes, appointmentsRes, queueRes] = await Promise.all([
        api.get("/patients").catch(() => ({ data: [] })),
        api.get("/doctors").catch(() => ({ data: [] })),
        api.get("/appointments").catch(() => ({ data: [] })),
        api.get("/queue").catch(() => ({ data: [] })),
      ])

      const patientsData = patientsRes.data
      const doctorsData = doctorsRes.data
      const appointmentsData = appointmentsRes.data
      const queueData = queueRes.data

      setPatients(patientsData)
      setDoctors(doctorsData)
      setAppointments(appointmentsData)
      setQueueEntries(queueData)

      // Calculate today's date
      const today = new Date().toDateString()

      // Calculate stats
      const newStats: DashboardStats = {
        totalPatients: patientsData.length,
        totalDoctors: doctorsData.length,
        todayAppointments: appointmentsData.filter((apt: any) => 
          new Date(apt.startTime).toDateString() === today
        ).length,
        queueLength: queueData.filter((q: any) => 
          q.status === "WAITING" || q.status === "CALLED"
        ).length,
        completedAppointments: appointmentsData.filter((apt: any) => 
          apt.status === "COMPLETED" && new Date(apt.startTime).toDateString() === today
        ).length,
        pendingAppointments: appointmentsData.filter((apt: any) => 
          apt.status === "SCHEDULED" || apt.status === "CONFIRMED"
        ).length,
        availableDoctors: doctorsData.filter((doc: any) => 
          doc.isActive && getAvailabilityStatus(doc) === "available"
        ).length,
        criticalAlerts: queueData.filter((q: any) => 
          q.priority === "EMERGENCY" && q.status === "WAITING"
        ).length,
      }

      setStats(newStats)

    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast.error("Failed to refresh dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loading])

  const getAvailabilityStatus = (doctor: Doctor) => {
    const currentDay = new Date().getDay()
    const currentHour = new Date().getHours()
    
    if (doctor.schedules && doctor.schedules.length > 0) {
      const dayMap: { [key: string]: number } = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      }
      
      const todaySchedule = doctor.schedules.find(schedule => 
        dayMap[schedule.dayOfWeek.toLowerCase()] === currentDay
      )
      
      if (todaySchedule && todaySchedule.isAvailable) {
        const startHour = parseInt(todaySchedule.startTime.split(':')[0])
        const endHour = parseInt(todaySchedule.endTime.split(':')[0])
        
        if (currentHour >= startHour && currentHour < endHour) {
          return "available"
        }
      }
    }
    
    return "unavailable"
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getActivityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      default: return 'primary'
    }
  }

  const openDoctorModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsDoctorModalOpen(true)
  }

  const StatCard = ({ title, value, icon: Icon, gradient, trend, trendValue, description, glow }: {
    title: string
    value: number
    icon: React.ElementType
    gradient: string
    trend?: 'up' | 'down'
    trendValue?: string
    description?: string
    glow?: string
  }) => (
    <Card className={`${glow} shadow-2xl border-0 bg-gradient-to-br ${gradient} text-white transform transition-all duration-500 hover:scale-105 hover:-rotate-1 cursor-pointer group animate-fade-in-up overflow-hidden`}>
      <CardBody className="p-6 relative">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-8 h-8" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm ${
                trend === 'up' ? 'text-green-100' : 'text-red-100'
              }`}>
                {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span className="text-xs font-semibold">{trendValue}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-4xl font-black group-hover:scale-110 transition-transform duration-300">
              {value.toLocaleString()}
            </div>
            <div className="text-white/90 font-semibold text-lg group-hover:text-white transition-colors">
              {title}
            </div>
            {description && (
              <div className="text-white/70 text-sm">
                {description}
              </div>
            )}
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </CardBody>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Preparing your healthcare insights...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 transition-all duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 animate-gradient rounded-3xl" />
          
          <div className="relative p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4 animate-slide-in-left">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl animate-float">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                      Welcome back! Here's your healthcare overview
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Chip 
                    startContent={<Clock className="w-4 h-4" />} 
                    color="primary" 
                    variant="flat" 
                    size="lg"
                    className="animate-pulse"
                  >
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Chip>
                  <Chip 
                    startContent={<CalendarIcon className="w-4 h-4" />} 
                    color="secondary" 
                    variant="flat" 
                    size="lg"
                  >
                    {new Date().toLocaleDateString([], { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Chip>
                  {stats.criticalAlerts > 0 && (
                    <Chip 
                      startContent={<AlertTriangle className="w-4 h-4" />} 
                      color="danger" 
                      variant="solid" 
                      size="lg"
                      className="animate-pulse"
                    >
                      {stats.criticalAlerts} Critical Alert{stats.criticalAlerts !== 1 ? 's' : ''}
                    </Chip>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 animate-slide-in-right">
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  startContent={<RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />}
                  onClick={loadDashboardData}
                  disabled={refreshing}
                  className="font-semibold"
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  color="success"
                  size="lg"
                  startContent={<Plus className="w-5 h-5" />}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Quick Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            glow="shadow-blue-500/25"
            trend="up"
            trendValue="+12%"
            description="Active patient records"
          />
          <StatCard
            title="Available Doctors"
            value={stats.availableDoctors}
            icon={Stethoscope}
            gradient="from-green-500 to-emerald-600"
            glow="shadow-green-500/25"
            trend="up"
            trendValue="+5%"
            description="Currently on duty"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
            gradient="from-purple-500 to-pink-600"
            glow="shadow-purple-500/25"
            trend="up"
            trendValue="+8%"
            description="Scheduled for today"
          />
          <StatCard
            title="Queue Length"
            value={stats.queueLength}
            icon={Clock}
            gradient="from-orange-500 to-red-600"
            glow="shadow-orange-500/25"
            trend={stats.queueLength > 5 ? "up" : "down"}
            trendValue={stats.queueLength > 5 ? "High" : "Normal"}
            description="Patients waiting"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Doctors */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md h-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Available Doctors</h3>
                      <p className="text-gray-600 dark:text-gray-400">Currently on duty</p>
                    </div>
                  </div>
                  <Chip color="success" variant="flat" size="lg" className="font-semibold">
                    {stats.availableDoctors} Available
                  </Chip>
                </div>
              </CardHeader>
              
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {doctors
                    .filter(doctor => doctor.isActive && getAvailabilityStatus(doctor) === "available")
                    .slice(0, 6)
                    .map((doctor, index) => (
                      <Card 
                        key={doctor.id}
                        className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 cursor-pointer group hover:shadow-lg card-stagger"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => openDoctorModal(doctor)}
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center gap-4">
                            <Badge 
                              content="●" 
                              color="success" 
                              placement="bottom-right"
                              size="lg"
                            >
                              <Avatar
                                name={getInitials(doctor.name)}
                                className="w-14 h-14 text-lg font-bold bg-gradient-to-br from-green-500 to-emerald-500 text-white group-hover:scale-110 transition-transform duration-300"
                              />
                            </Badge>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-green-600 transition-colors">
                                  Dr. {doctor.name}
                                </h4>
                                <Chip size="sm" color="success" variant="dot">Available</Chip>
                              </div>
                              <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                {doctor.specialization}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  <span>{doctor.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Award size={12} />
                                  <span>{doctor.experienceYears}+ years</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${doctor.consultationFee}
                              </div>
                              <div className="text-xs text-gray-500">consultation</div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  }
                  
                  {stats.availableDoctors === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold">No doctors available at the moment</p>
                      <p className="text-sm">Check back later or contact administration</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button 
                  className="w-full justify-start p-4 h-auto bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 border-2 border-blue-200 dark:border-blue-700 transition-all duration-300"
                  variant="flat"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-blue-800 dark:text-blue-300">Add New Patient</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Register a new patient</p>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  className="w-full justify-start p-4 h-auto bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/50 dark:hover:to-green-700/50 border-2 border-green-200 dark:border-green-700 transition-all duration-300"
                  variant="flat"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-green-800 dark:text-green-300">Schedule Appointment</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Book new appointment</p>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  className="w-full justify-start p-4 h-auto bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/50 dark:hover:to-purple-700/50 border-2 border-purple-200 dark:border-purple-700 transition-all duration-300"
                  variant="flat"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-purple-800 dark:text-purple-300">Manage Queue</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">View patient queue</p>
                    </div>
                  </div>
                </Button>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  <Button size="sm" variant="light" color="primary">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 card-stagger"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg ${
                      activity.priority === 'high' 
                        ? 'bg-red-500' 
                        : activity.priority === 'medium' 
                          ? 'bg-yellow-500' 
                          : 'bg-blue-500'
                    }`}>
                      <activity.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm leading-relaxed">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <Chip
                      size="sm"
                      color={getActivityColor(activity.priority) as any}
                      variant="dot"
                    >
                      {activity.priority}
                    </Chip>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-black">
                    {stats.todayAppointments > 0 
                      ? Math.round((stats.completedAppointments / stats.todayAppointments) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Target className="w-8 h-8" />
                </div>
              </div>
              <Progress
                value={stats.todayAppointments > 0 
                  ? (stats.completedAppointments / stats.todayAppointments) * 100
                  : 0
                }
                className="mb-2"
                color="warning"
              />
              <p className="text-indigo-100 text-sm">
                {stats.completedAppointments} of {stats.todayAppointments} appointments completed
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Doctor Utilization</p>
                  <p className="text-3xl font-black">
                    {stats.totalDoctors > 0 
                      ? Math.round((stats.availableDoctors / stats.totalDoctors) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <UserCheck className="w-8 h-8" />
                </div>
              </div>
              <Progress
                value={stats.totalDoctors > 0 
                  ? (stats.availableDoctors / stats.totalDoctors) * 100
                  : 0
                }
                className="mb-2"
                color="success"
              />
              <p className="text-emerald-100 text-sm">
                {stats.availableDoctors} of {stats.totalDoctors} doctors available
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-rose-100 text-sm font-medium">Patient Satisfaction</p>
                  <p className="text-3xl font-black">4.8★</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Star className="w-8 h-8" />
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= 4 ? 'fill-yellow-300 text-yellow-300' : 'text-rose-200'}`}
                  />
                ))}
              </div>
              <p className="text-rose-100 text-sm">
                Based on recent patient feedback
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Doctor Detail Modal */}
      <Modal
        isOpen={isDoctorModalOpen}
        onClose={() => {
          setIsDoctorModalOpen(false)
          setSelectedDoctor(null)
        }}
        size="2xl"
        backdrop="blur"
        className="z-50"
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Doctor Information
          </ModalHeader>
          <ModalBody>
            {selectedDoctor && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                  <Badge 
                    content="●" 
                    color="success" 
                    placement="bottom-right"
                    size="lg"
                  >
                    <Avatar
                      name={getInitials(selectedDoctor.name)}
                      className="w-20 h-20 text-2xl font-bold bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                    />
                  </Badge>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                      Dr. {selectedDoctor.name}
                    </h2>
                    <p className="text-green-600 dark:text-green-400 text-xl font-semibold">
                      {selectedDoctor.specialization}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Chip color="success" variant="flat">Available Now</Chip>
                      <Chip color="primary" variant="flat">{selectedDoctor.experienceYears}+ years experience</Chip>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-gray-400" />
                        <span>{selectedDoctor.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-gray-400" />
                        <span>{selectedDoctor.email || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-gray-400" />
                        <span>{selectedDoctor.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Professional Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Consultation Fee</p>
                        <p className="text-2xl font-bold text-green-600">${selectedDoctor.consultationFee}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">License Number</p>
                        <p className="font-semibold">{selectedDoctor.licenseNumber || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDoctor.education && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Education & Qualifications</h3>
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <CardBody>
                        <p className="text-gray-800 dark:text-gray-200">{selectedDoctor.education}</p>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => {
                setIsDoctorModalOpen(false)
                setSelectedDoctor(null)
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
