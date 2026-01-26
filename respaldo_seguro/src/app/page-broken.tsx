'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useStudents, Student } from '@/hooks/use-students'
import { useDailyReports } from '@/hooks/use-daily-reports'
import { StudentFormSimple } from '@/components/student-form-simple'
import { ParentContactEditor } from '@/components/parent-contact-editor'
import { DashboardSummary } from '@/components/dashboard-summary'
import { EmailReportPreview } from '@/components/email-report-preview'
import {
  Baby,
  Mail,
  MessageSquare,
  History,
  CheckCircle2,
  Utensils,
  BedDouble,
  Pill,
  Award,
  Smile,
  Send,
  Search,
  Bell,
  Clock,
  Download,
  Plus,
  Edit2,
  Save
} from 'lucide-react'

export default function DailyReports() {
  const { students, loading: studentsLoading } = useStudents()
  const { toast } = useToast()
  const { saveMultipleReports, saving, getTodayReport } = useDailyReports()

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('daily')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [selectedLunch, setSelectedLunch] = useState<string>('')
  const [individualAchievements, setIndividualAchievements] = useState<Record<string, string>>({})
  const [generalNotes, setGeneralNotes] = useState('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [localDate, setLocalDate] = useState<string>('')
  const [emailPreviewStudent, setEmailPreviewStudent] = useState<any>(null)

  // Set current date only on client side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    // Guardar fecha local en formato ISO para enviar al backend
    // Usar la fecha local del cliente, no UTC
    const localYear = now.getFullYear()
    const localMonth = String(now.getMonth() + 1).padStart(2, '0')
    const localDay = String(now.getDate()).padStart(2, '0')
    setLocalDate(`${localYear}-${localMonth}-${localDay}`)
  }, [])

  // Estados para captura de datos
  const [napTimes, setNapTimes] = useState<Record<string, string>>({})
  const [diaperChanges, setDiaperChanges] = useState<Record<string, string>>({})
  const [medications, setMedications] = useState<Record<string, { name: string; notes: string }>>({})
  const [diaperChanged, setDiaperChanged] = useState<Record<string, boolean>>({})
  const [medicationGiven, setMedicationGiven] = useState<Record<string, boolean>>({})
  const [existingReports, setExistingReports] = useState<Record<string, any>>({})

  // Cargar reportes existentes al inicio
  useEffect(() => {
    let isMounted = true

    const loadExistingReports = async () => {
      if (!isMounted) return

      console.log('Cargando reportes existentes para', students.length, 'estudiantes, fecha:', localDate)

      for (const student of students) {
        if (!isMounted) break

        try {
          const report = await getTodayReport(student.id, localDate)
          if (report && isMounted) {
            setExistingReports(prev => ({
              ...prev,
              [student.id]: report
            }))
          }
        } catch (error) {
          console.error('Error cargando reporte para', student.name, error)
        }
      }
    }

    if (students.length > 0 && localDate) {
      loadExistingReports()
    }

    return () => {
      isMounted = false
    }
  }, [students.length, localDate]) // Ejecutar cuando cambia el número de estudiantes o la fecha local

  // Detectar cuando se quiere editar un estudiante desde el modal
  useEffect(() => {
    let checkInterval: NodeJS.Timeout

    const checkForEditRequest = () => {
      const editingStudentId = localStorage.getItem('editingStudentId')
      const editingStudentName = localStorage.getItem('editingStudentName')

      if (editingStudentId && students.length > 0) {
        // Verificar si el estudiante NO está seleccionado
        const isCurrentlySelected = selectedStudents.includes(editingStudentId)

        if (!isCurrentlySelected) {
          console.log('Seleccionando estudiante para editar:', editingStudentName, 'ID:', editingStudentId)

          // Seleccionar al estudiante
          setSelectedStudents([editingStudentId])

          // Cargar los datos existentes del estudiante en los campos
          const report = existingReports[editingStudentId]
          if (report) {
            console.log('Cargando datos del reporte:', report)

            // Cargar datos en los campos del formulario
            if (report.mood) setSelectedMood(report.mood)
            if (report.lunchIntake) setSelectedLunch(report.lunchIntake)
            if (report.hadNap) {
              setNapTimes(prev => ({ ...prev, [editingStudentId]: 'Si' }))
            }
            if (report.diaperChanged) {
              setDiaperChanged(prev => ({ ...prev, [editingStudentId]: true }))
            }
            if (report.diaperNotes) {
              setDiaperChanges(prev => ({ ...prev, [editingStudentId]: report.diaperNotes }))
            }
            if (report.medicationGiven) {
              setMedicationGiven(prev => ({ ...prev, [editingStudentId]: true }))
            }
            if (report.medicationName || report.medicationNotes) {
              setMedications(prev => ({
                ...prev,
                [editingStudentId]: {
                  name: report.medicationName || '',
                  notes: report.medicationNotes || ''
                }
              }))
            }
            if (report.dailyAchievements) {
              setIndividualAchievements(prev => ({
                ...prev,
                [editingStudentId]: report.dailyAchievements
              }))
            }
            if (report.generalNotes) {
              setGeneralNotes(report.generalNotes)
            }
          }

          // Mostrar notificación
          toast({
            title: 'Editando estudiante',
            description: `Editando a ${editingStudentName}`,
          })

          // Limpiar localStorage
          localStorage.removeItem('editingStudentId')
          localStorage.removeItem('editingStudentName')
        }
      }
    }

    // Verificar inmediatamente
    checkForEditRequest()

    // Verificar periódicamente (por si localStorage cambia)
    checkInterval = setInterval(checkForEditRequest, 500)

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, [students, existingReports, selectedStudents])

  // Calcular edad del estudiante
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Generar iniciales
  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Filtros de búsqueda
  const filteredStudents = students.filter(student =>
    `${student.name} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  // Toggle selección individual
  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // Guardar todos los reportes capturados
  const saveAllReports = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona al menos un estudiante',
        variant: 'destructive'
      })
      return
    }

    try {
      const reports = selectedStudents.map(studentId => {
        return {
          studentId,
          date: localDate, // Usar fecha local del cliente
          ...(selectedMood && { mood: selectedMood }),
          ...(selectedLunch && { lunchIntake: selectedLunch }),
          ...(napTimes[studentId] && { hadNap: true }),
          ...(diaperChanged[studentId] !== undefined && { diaperChanged: diaperChanged[studentId] }),
          ...(diaperChanges[studentId] && { diaperNotes: diaperChanges[studentId] }),
          ...(medicationGiven[studentId] !== undefined && { medicationGiven: medicationGiven[studentId] }),
          ...(medications[studentId]?.name && { medicationName: medications[studentId].name }),
          ...(medications[studentId]?.notes && { medicationNotes: medications[studentId].notes }),
          ...(individualAchievements[studentId] && { dailyAchievements: individualAchievements[studentId] }),
          ...(generalNotes && { generalNotes })
        }
      })

      const savedReports = await saveMultipleReports(reports)

      if (savedReports.length > 0) {
        // Actualizar el estado de reportes existentes
        const newReports: Record<string, any> = {}
        savedReports.forEach(report => {
          newReports[report.studentId] = report
        })
        setExistingReports(prev => ({ ...prev, ...newReports }))

        toast({
          title: '¡Guardado!',
          description: `Reportes guardados exitosamente para ${savedReports.length} estudiantes`,
          variant: 'default'
        })

        // Limpiar selección después de guardar
        setSelectedStudents([])
        setSelectedMood('')
        setSelectedLunch('')
        setGeneralNotes('')
        setNapTimes({})
        setDiaperChanges({})
        setMedications({})
        setDiaperChanged({})
        setMedicationGiven({})
        setIndividualAchievements({})
      }
    } catch (error) {
      console.error('Error guardando reportes:', error)
      toast({
        title: 'Error',
        description: 'Error al guardar los reportes',
        variant: 'destructive'
      })
    }
  }

  // Aplicar acción a estudiantes seleccionados (ahora actualiza estado local)
  const applyToSelected = (field: string, value: any) => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona al menos un estudiante',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: 'Preparado',
      description: `${field} listo para aplicar a ${selectedStudents.length} estudiantes. Haz clic en "Guardar" para confirmar.`,
      variant: 'default'
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent neon-text">
              Reportes Diarios
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema de reportes para preescolar con IA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {currentDate}
            </div>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                MP
              </AvatarFallback>
            </Avatar>
          </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[900px]">
            <TabsTrigger value="daily" className="gap-2">
              <Baby className="w-4 h-4" />
              Captura Diaria
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Editar Padres
            </TabsTrigger>
            <TabsTrigger value="send" className="gap-2">
              <Send className="w-4 h-4" />
              Enviar
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Captura Diaria */}
          <TabsContent value="daily" className="space-y-6">
            {/* Buscador y selección */}
            <Card className="card-hover neon-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar estudiante..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id="selectAll"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                      <Label htmlFor="selectAll">
                        Seleccionar todos ({filteredStudents.length})
                      </Label>
                    </div>
                  </div>
                  <Badge variant={selectedStudents.length > 0 ? "default" : "secondary"}>
                    {selectedStudents.length} seleccionados
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Lista de estudiantes */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-primary" />
                    Estudiantes ({students.length})
                  </CardTitle>
                  <CardDescription>
                    Selecciona los estudiantes para aplicar acciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="flex items-center justify-center h-[600px]">
                      <p className="text-muted-foreground">Cargando estudiantes...</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-3">
                        {filteredStudents.map((student) => (
                          <Card
                            key={student.id}
                            className={`cursor-pointer transition-all ${
                              selectedStudents.includes(student.id)
                                ? 'border-primary bg-primary/5 neon-border'
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => toggleStudent(student.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={selectedStudents.includes(student.id)}
                                  onCheckedChange={() => toggleStudent(student.id)}
                                  className="pointer-events-none"
                                />
                                <Avatar>
                                  <AvatarFallback className="bg-accent text-accent-foreground">
                                    {getInitials(student.name, student.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {student.name} {student.lastName}
                                    </h3>
                                    {existingReports[student.id] && (
                                      <Badge variant="default" className="text-xs">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Guardado
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {calculateAge(student.dateOfBirth)} años
                                  </p>
                                </div>
                                {individualAchievements[student.id] && (
                                  <Badge variant="secondary">
                                    <Award className="w-3 h-3 mr-1" />
                                    Logro
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Panel de acciones */}
              <div className="space-y-6">
                {/* Estado de ánimo */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smile className="w-5 h-5 text-accent" />
                      Estado de Ánimo
                      {selectedStudents.length > 0 && (
                        <Badge variant="secondary">({selectedStudents.length})</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      ¿Cómo estuvo de ánimo durante el día?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { mood: 'happy', emoji: '😊', label: 'Alegre', color: 'green' },
                        { mood: 'thoughtful', emoji: '🤔', label: 'Pensativo', color: 'yellow' },
                        { mood: 'sad', emoji: '😢', label: 'Triste', color: 'blue' },
                        { mood: 'angry', emoji: '😠', label: 'Enojado', color: 'red' }
                      ].map((item) => (
                        <div
                          key={item.mood}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedMood === item.mood
                              ? `border-${item.color}-500 bg-${item.color}-500/10`
                              : 'hover:border-gray-500/50'
                          }`}
                          onClick={() => {
                            setSelectedMood(item.mood)
                            applyToSelected('mood', item.mood)
                          }}
                        >
                          <div className="text-4xl">{item.emoji}</div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Comida */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-green-500" />
                      Lonche
                      {selectedStudents.length > 0 && (
                        <Badge variant="secondary">({selectedStudents.length})</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      ¿Cuánto se comió del lonche?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'all', emoji: '🍱', label: 'Todo', color: 'green' },
                        { value: 'half', emoji: '🥙', label: 'Mitad', color: 'yellow' },
                        { value: 'none', emoji: '🥺', label: 'Nada', color: 'red' }
                      ].map((item) => (
                        <div
                          key={item.value}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedLunch === item.value
                              ? `border-${item.color}-500 bg-${item.color}-500/10`
                              : 'hover:border-gray-500/50'
                          }`}
                          onClick={() => {
                            setSelectedLunch(item.value)
                            applyToSelected('lunchIntake', item.value)
                          }}
                        >
                          <div className="text-3xl">{item.emoji}</div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Acciones rápidas */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Acciones Rápidas
                    </CardTitle>
                    <CardDescription>
                      Aplicar a estudiantes seleccionados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Siesta */}
                    <div className="p-4 rounded-lg border bg-secondary/50">
                      <div className="flex items-center gap-3 mb-4">
                        <BedDouble className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Durmieron la siesta</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStudents.length > 1 ? 'Aplicar a selección masiva' : 'Tiempo de siesta individual'}
                          </p>
                        </div>
                      </div>
                      {selectedStudents.length > 1 ? (
                        // Selección masiva: botones Sí/No
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="default"
                            onClick={() => {
                              // Marcar siesta para todos los seleccionados
                              selectedStudents.forEach(id => {
                                setNapTimes(prev => ({
                                  ...prev,
                                  [id]: 'Marcado'
                                }))
                              })
                              toast({
                                title: 'Siesta preparada',
                                description: `Siesta marcada para ${selectedStudents.length} estudiantes. Haz clic en "Guardar" para confirmar.`
                              })
                            }}
                            className="h-16 text-lg neon-accent"
                            disabled={saving}
                          >
                            Sí
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Desmarcar siesta para todos los seleccionados
                              selectedStudents.forEach(id => {
                                setNapTimes(prev => {
                                  const newState = { ...prev }
                                  delete newState[id]
                                  return newState
                                })
                              })
                              toast({
                                title: 'Siesta preparada',
                                description: `No durmieron siesta (${selectedStudents.length} estudiantes). Haz clic en "Guardar" para confirmar.`
                              })
                            }}
                            className="h-16 text-lg"
                            disabled={saving}
                          >
                            No
                          </Button>
                        </div>
                      ) : selectedStudents.length === 1 ? (
                        // Selección individual: campo de texto para tiempo
                        <div className="space-y-2">
                          <Input
                            placeholder="Tiempo de siesta (ej: 30 minutos, 1 hora...)"
                            onChange={(e) => {
                              setNapTimes(prev => ({
                                ...prev,
                                [selectedStudents[0]]: e.target.value
                              }))
                            }}
                            disabled={saving}
                          />
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          Selecciona estudiantes
                        </div>
                      )}
                    </div>

                    {/* Pañal cambiado */}
                    <div className="p-4 rounded-lg border bg-secondary/50">
                      <div className="flex items-center gap-3 mb-4">
                        <Baby className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">Pañal/Ropa cambiada</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStudents.length > 1 ? 'Aplicar a selección masiva' : 'Número de cambios individual'}
                          </p>
                        </div>
                      </div>
                      {selectedStudents.length > 1 ? (
                        // Selección masiva: botones Sí/No
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="default"
                            onClick={() => {
                              selectedStudents.forEach(id => {
                                setDiaperChanged(prev => ({
                                  ...prev,
                                  [id]: true
                                }))
                              })
                              toast({
                                title: 'Pañal preparado',
                                description: `Pañal cambiado para ${selectedStudents.length} estudiantes. Haz clic en "Guardar" para confirmar.`
                              })
                            }}
                            className="h-16 text-lg neon-accent"
                            disabled={saving}
                          >
                            Sí
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              selectedStudents.forEach(id => {
                                setDiaperChanged(prev => ({
                                  ...prev,
                                  [id]: false
                                }))
                              })
                              toast({
                                title: 'Pañal preparado',
                                description: `No se cambió pañal (${selectedStudents.length} estudiantes). Haz clic en "Guardar" para confirmar.`
                              })
                            }}
                            className="h-16 text-lg"
                            disabled={saving}
                          >
                            No
                          </Button>
                        </div>
                      ) : selectedStudents.length === 1 ? (
                        // Selección individual: campo numérico para cantidad
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Número de cambios (ej: 2, 3, 4...)"
                            onChange={(e) => {
                              const count = parseInt(e.target.value) || 0
                              setDiaperChanges(prev => ({
                                ...prev,
                                [selectedStudents[0]]: `${count} cambio${count !== 1 ? 's' : ''}`
                              }))
                              setDiaperChanged(prev => ({
                                ...prev,
                                [selectedStudents[0]]: count > 0
                              }))
                            }}
                            disabled={saving}
                          />
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          Selecciona estudiantes
                        </div>
                      )}
                    </div>

                    {/* Medicamento - Solo individual */}
                    <div className="p-4 rounded-lg border bg-secondary/50">
                      <div className="flex items-center gap-3 mb-4">
                        <Pill className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium">Medicamento</p>
                          <p className="text-sm text-muted-foreground">
                            Solo disponible para selección individual
                          </p>
                        </div>
                      </div>
                      {!selectedStudents.length ? (
                        <div className="text-center text-muted-foreground py-4">
                          Selecciona un estudiante
                        </div>
                      ) : selectedStudents.length > 1 ? (
                        <div className="text-center text-muted-foreground py-4">
                          Los medicamentos solo se aplican a estudiantes individuales
                        </div>
                      ) : selectedStudents.length === 1 ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Nombre del medicamento y cantidad (ej: Paracetamol 5ml)"
                            onChange={(e) => {
                              setIndividualAchievements(prev => ({
                                ...prev,
                                [selectedStudents[0]]: `Medicamento: ${e.target.value}, `
                              }))
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                {/* Logros individuales */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Logros del Día
                    </CardTitle>
                    <CardDescription>
                      Solo disponible para selección individual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!selectedStudents.length ? (
                      <div className="text-center text-muted-foreground py-8">
                        Selecciona un estudiante
                      </div>
                    ) : selectedStudents.length > 1 ? (
                      <div className="text-center text-muted-foreground py-8">
                        Los logros solo se aplican a estudiantes individuales
                      </div>
                    ) : selectedStudents.length === 1 ? (
                      <div className="space-y-4">
                        {(() => {
                          const student = students.find(s => s.id === selectedStudents[0])
                          if (!student) return null
                          return (
                            <div key={selectedStudents[0]} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-sm">
                                    {getInitials(student.name, student.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name} {student.lastName}</span>
                              </div>
                              <Textarea
                                placeholder="Escribe el logro del día..."
                                value={(() => {
                                  const achievement = individualAchievements[selectedStudents[0]] || ''
                                  // Filtrar para mostrar solo logros (no siesta, pañal, medicamento)
                                  const parts = achievement.split(/, /).filter(part =>
                                    !part.toLowerCase().includes('siesta:') &&
                                    !part.toLowerCase().includes('pañal:') &&
                                    !part.toLowerCase().includes('medicamento:')
                                  )
                                  return parts.join(', ')
                                })()}
                                onChange={(e) =>
                                  setIndividualAchievements({
                                    ...individualAchievements,
                                    [selectedStudents[0]]: e.target.value
                                  })
                                }
                                className="min-h-[100px]"
                              />
                            </div>
                          )
                        })()}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Observaciones generales */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-500" />
                      Observaciones Generales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Agrega observaciones generales del día..."
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Botón de Guardar */}
              {selectedStudents.length > 0 && (
                <Card className="neon-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedStudents.length} {selectedStudents.length === 1 ? 'estudiante seleccionado' : 'estudiantes seleccionados'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Las actividades capturadas se guardarán para los estudiantes seleccionados
                        </p>
                      </div>
                      <Button
                        onClick={saveAllReports}
                        disabled={saving}
                        className="neon-accent"
                        size="lg"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Todo'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resumen del Día */}
              <DashboardSummary />
            </div>
          </TabsContent>

          {/* Tab 2: Agregar Estudiantes */}
          <TabsContent value="add" className="space-y-6">
            <StudentFormSimple />
          </TabsContent>

          {/* Tab 3: Editar Padres */}
          <TabsContent value="edit" className="space-y-6">
            <ParentContactEditor />
          </TabsContent>

          {/* Tab 4: Enviar Reportes */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Resumen del día */}
              <Card className="card-hover neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Resumen del Día
                  </CardTitle>
                  <CardDescription>Estado de los reportes de hoy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Calcular estadísticas dinámicamente */}
                  {(() => {
                    const totalStudents = filteredStudents.length
                    const completeStudents = filteredStudents.filter(s =>
                      existingReports[s.id] && (existingReports[s.id].mood && existingReports[s.id].lunchIntake)
                    ).length
                    const incompleteStudents = filteredStudents.filter(s =>
                      !existingReports[s.id] || !(existingReports[s.id]?.mood && existingReports[s.id]?.lunchIntake)
                    ).length
                    const notStartedStudents = filteredStudents.filter(s => !existingReports[s.id]).length

                    return (
                      <>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="font-medium">Completos</p>
                              <p className="text-sm text-muted-foreground">Listos para enviar</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500">{completeStudents}</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <div>
                              <p className="font-medium">Incompletos</p>
                              <p className="text-sm text-muted-foreground">Faltan datos</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-500">{incompleteStudents}</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium">Sin iniciar</p>
                              <p className="text-sm text-muted-foreground">No capturados</p>
                            </div>
                          </div>
                          <Badge className="bg-red-500/20 text-red-500">{notStartedStudents}</Badge>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Opciones de envío */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    Método de Envío
                  </CardTitle>
                  <CardDescription>
                    Selecciona cómo enviar los reportes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Correo Electrónico</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar a los padres por email
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar por WhatsApp Business
                        </p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="p-4 rounded-lg border bg-accent/5">
                    <p className="text-sm text-muted-foreground">
                      <strong>Nota:</strong> Para usar WhatsApp se requiere
                      WhatsApp Business API.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de estudiantes para enviar */}
              <Card className="lg:col-span-2 card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Reportes Completos
                  </CardTitle>
                  <CardDescription>
                    Selecciona los reportes completos para enviar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {(() => {
                        // Mostrar solo estudiantes con reportes completos (mood + lunchIntake)
                        const studentsWithCompleteReports = filteredStudents.filter(s =>
                          existingReports[s.id] && (existingReports[s.id].mood && existingReports[s.id].lunchIntake)
                        )

                        if (studentsWithCompleteReports.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                No hay reportes completos para enviar.
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Completa los reportes (ánimo + lonche) para que aparezcan aquí.
                              </p>
                            </div>
                          )
                        }

                        return studentsWithCompleteReports.map((student, index) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                          >
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudent(student.id)}
                            />
                            <Avatar>
                              <AvatarFallback className="bg-accent text-accent-foreground">
                                {getInitials(student.name, student.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {student.name} {student.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                ✅ Reporte completo
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const report = existingReports[student.id]
                                  if (report) {
                                    // Crear objeto completo del reporte con datos del estudiante
                                    const fullReport = {
                                      ...report,
                                      student: {
                                        name: student.name,
                                        lastName: student.lastName,
                                        parentEmail: student.parentEmail,
                                        parentPhone: student.parentPhone
                                      }
                                    }
                                    setEmailPreviewStudent(fullReport)
                                  }
                                }}
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Ver correo
                              </Button>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Preview de correo si hay un estudiante seleccionado con reporte completo */}
              {emailPreviewStudent && (
                <div className="lg:col-span-2 mb-4">
                  <EmailReportPreview
                    report={emailPreviewStudent}
                    onClose={() => setEmailPreviewStudent(null)}
                  />
                </div>
              )}

              {/* Botón de envío */}
              <Card className="lg:col-span-2 neon-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Enviar Reportes del Día</h3>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          // Calcular estudiantes con reportes completos seleccionados para enviar
                          const selectedCompleteStudents = selectedStudents.filter(id =>
                            existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
                          ).length
                          return selectedCompleteStudents > 0
                            ? `Se enviarán ${selectedCompleteStudents} reporte${selectedCompleteStudents !== 1 ? 's' : ''} seleccionado${selectedCompleteStudents !== 1 ? 's' : ''} por correo electrónico`
                            : 'Selecciona los reportes completos que deseas enviar'
                        })()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button
                        className="neon-accent"
                        disabled={selectedStudents.filter(id =>
                          existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
                        ).length === 0}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Reportes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Historial */}
          <TabsContent value="history" className="space-y-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Historial de Reportes
                </CardTitle>
                <CardDescription>
                  Historial de reportes de estudiantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">
                    Historial en desarrollo
                  </p>
                  <p className="text-muted-foreground">
                    Próximamente podrás ver el historial completo y generar resúmenes
                    semanales con IA
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
