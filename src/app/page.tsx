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
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStudents, Student } from '@/hooks/use-students'
import { useDailyReports } from '@/hooks/use-daily-reports'
import { StudentFormSimple } from '@/components/student-form-simple'
import { ParentContactEditor } from '@/components/parent-contact-editor'
import { DashboardSummary } from '@/components/dashboard-summary'
import { EmailReportPreview } from '@/components/email-report-preview'
import { TeamManagement } from '@/components/team-management'
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
  Save,
  ShieldCheck,
  Lock,
  Server,
  Globe
} from 'lucide-react'

export default function DailyReports() {
  const { students, loading: studentsLoading } = useStudents()
  const { toast } = useToast()
  const { saveMultipleReports, saving, getTodayReport } = useDailyReports()
  const router = useRouter()

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
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Función de cierre de sesión
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: 'Sesión cerrada',
        description: 'Vuelve pronto maestra.',
      })

      router.push('/login')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error al cerrar sesión',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

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
    const dateStr = `${localYear}-${localMonth}-${localDay}`
    setLocalDate(dateStr)

    // Obtener perfil del usuario actual
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (!data.error) setCurrentUser(data)
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
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

  // Cargar datos del reporte cuando se selecciona un ÚNICO alumno (Edición fluida)
  useEffect(() => {
    if (selectedStudents.length === 1) {
      const studentId = selectedStudents[0]
      const report = existingReports[studentId]

      if (report) {
        console.log('Cargando reporte existente para edición:', report)
        if (report.mood) setSelectedMood(report.mood)
        if (report.lunchIntake) setSelectedLunch(report.lunchIntake)

        // Cargar siesta (extraer texto si es posible o usar boolean)
        if (report.hadNap) {
          // Intentar extraer duración si está en generalNotes (formato "Siesta: X. ...")
          const napMatch = report.generalNotes?.match(/Siesta: ([\w\s\+]+)\./)
          if (napMatch) {
            setNapTimes(prev => ({ ...prev, [studentId]: napMatch[1] }))
          } else {
            setNapTimes(prev => ({ ...prev, [studentId]: 'Sí' }))
          }
        } else {
          setNapTimes(prev => { const n = { ...prev }; delete n[studentId]; return n; })
        }

        // Cargar pañal
        if (report.diaperChanged) {
          setDiaperChanged(prev => ({ ...prev, [studentId]: true }))
          setDiaperChanges(prev => ({ ...prev, [studentId]: report.diaperNotes || "Cambio realizado" }))
        } else {
          setDiaperChanged(prev => ({ ...prev, [studentId]: false }))
          setDiaperChanges(prev => { const n = { ...prev }; delete n[studentId]; return n; })
        }

        // Cargar medicamento
        if (report.medicationGiven) {
          setMedicationGiven(prev => ({ ...prev, [studentId]: true }))
          setMedications(prev => ({
            ...prev,
            [studentId]: { name: report.medicationName || '', notes: report.medicationNotes || '' }
          }))
        }

        // Logros y Notas
        if (report.dailyAchievements) {
          setIndividualAchievements(prev => ({ ...prev, [studentId]: report.dailyAchievements }))
        }

        // Limpiar "Siesta: ..." de las notas generales para que no se duplique al editar
        let cleanNotes = report.generalNotes || ""
        cleanNotes = cleanNotes.replace(/Siesta: [\w\s\+]+\.\s*/, "").trim()
        setGeneralNotes(cleanNotes)
      }
    } else if (selectedStudents.length === 0) {
      // Limpiar campos compartidos si no hay selección
      setSelectedMood('')
      setSelectedLunch('')
      setGeneralNotes('')
    }
  }, [selectedStudents, existingReports])

  // Detectar cuando se quiere editar un estudiante desde el modal o historial
  useEffect(() => {
    const checkForEditRequest = () => {
      const editingStudentId = localStorage.getItem('editingStudentId')
      if (editingStudentId && students.length > 0) {
        setSelectedStudents([editingStudentId])
        localStorage.removeItem('editingStudentId')
        localStorage.removeItem('editingStudentName')

        toast({
          title: 'Modo edición',
          description: 'Cargando datos previos del estudiante.',
        })
      }
    }
    checkForEditRequest()
    const interval = setInterval(checkForEditRequest, 1000)
    return () => clearInterval(interval)
  }, [students])

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
        const napValue = napTimes[studentId] || ""
        const isNap = !!napValue && napValue !== "No durmió"

        let finalGeneralNotes = generalNotes || ""
        // Si hay una duración de siesta específica, la agregamos a las notas si no es masivo
        if (napValue && napValue !== "Sí" && napValue !== "No durmió" && selectedStudents.length === 1) {
          finalGeneralNotes = `Siesta: ${napValue}. ${finalGeneralNotes}`.trim()
        }

        return {
          studentId,
          date: localDate,
          ...(selectedMood && { mood: selectedMood }),
          ...(selectedLunch && { lunchIntake: selectedLunch }),
          hadNap: isNap,
          ...(diaperChanged[studentId] !== undefined && { diaperChanged: diaperChanged[studentId] }),
          ...(diaperChanges[studentId] && { diaperNotes: diaperChanges[studentId] }),
          ...(medicationGiven[studentId] !== undefined && { medicationGiven: medicationGiven[studentId] }),
          ...(medications[studentId]?.name && { medicationName: medications[studentId].name }),
          ...(medications[studentId]?.notes && { medicationNotes: medications[studentId].notes }),
          ...(individualAchievements[studentId] && { dailyAchievements: individualAchievements[studentId] }),
          generalNotes: finalGeneralNotes || null
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

  // Aplicar acción a estudiantes seleccionados
  const applyToSelected = (field: string, value: any) => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Selección vacía',
        description: 'Por favor selecciona al menos un estudiante.',
        variant: 'destructive'
      })
      return
    }

    if (field === 'mood') {
      setSelectedMood(value)
    } else if (field === 'lunchIntake') {
      setSelectedLunch(value)
    }

    toast({
      title: 'Dato Aplicado',
      description: `Se asignó a ${selectedStudents.length} estudiantes. Haz clic en "Guardar Todo" al terminar.`,
      variant: 'default'
    })
  }

  // Generar mensaje para WhatsApp
  const generateWhatsAppMessage = (student: any, report: any) => {
    const moods: Record<string, string> = {
      happy: '¡Muy feliz! 😊',
      thoughtful: 'Pensativo 🤔',
      sad: 'Un poco triste 😢',
      angry: 'Enojado 😠'
    };

    const intakes: Record<string, string> = {
      all: 'Todo 🍽️',
      half: 'Mitad 🥗',
      none: 'No comió 🚫'
    };

    const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    let message = `*📊 Reporte Diario - ${student.name} ${student.lastName}*\n`;
    message += `📅 _${dateStr}_\n\n`;
    message += `😊 *Ánimo:* ${moods[report.mood] || '¡Bien!'}\n`;
    message += `🍽️ *Lonche:* ${intakes[report.lunchIntake] || 'N/A'}\n`;

    if (report.hadNap) message += `😴 *Siesta:* Sí ✅\n`;
    if (report.diaperChanged) message += `🧷 *Pañal:* ${report.diaperNotes || 'Sí'} ✅\n`;
    if (report.medicationGiven) message += `💊 *Medicamento:* ${report.medicationName || 'Sí'} ✅\n`;

    if (report.dailyAchievements) {
      message += `\n⭐ *Logro del Día:*\n${report.dailyAchievements}\n`;
    }

    if (report.generalNotes) {
      message += `\n📝 *Observaciones:*\n${report.generalNotes}\n`;
    }

    message += `\n_Enviado desde Diario Preescolar_`;

    // Usar encodeURI para asegurar compatibilidad con emojis en WhatsApp Web
    return encodeURIComponent(message);
  };

  // Enviar reportes (automatizado seguro)
  const handleSendReports = (method: 'email' | 'whatsapp') => {
    const selectedCompleteStudents = selectedStudents.filter(id =>
      existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
    );

    if (selectedCompleteStudents.length === 0) {
      toast({
        title: "No hay reportes seleccionados",
        description: "Selecciona al menos un reporte completo (con ánimo y lonche).",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: method === 'email' ? "Abriendo correos" : "Abriendo WhatsApp",
      description: `Procesando ${selectedCompleteStudents.length} reportes...`,
    });

    selectedCompleteStudents.forEach((id, index) => {
      const student = students.find(s => s.id === id);
      const report = existingReports[id];
      if (!student || !report) return;

      setTimeout(() => {
        if (method === 'email') {
          if (!student.parentEmail) return;
          const subject = encodeURIComponent(`Reporte Diario de ${student.name} - ${currentDate}`);
          const body = encodeURIComponent(`Hola, aquí el reporte de ${student.name}. Puede verlo con más detalle en el sistema: ${window.location.origin}`);
          // Cambiar a window.location.href para evitar que Chrome abra pestañas en blanco
          window.location.href = `mailto:${student.parentEmail}?subject=${subject}&body=${body}`;
        } else {
          if (!student.parentPhone) {
            toast({
              title: "Error",
              description: `El estudiante ${student.name} no tiene teléfono registrado.`,
              variant: "destructive"
            });
            return;
          }
          const phone = student.parentPhone.replace(/\D/g, '');
          const message = generateWhatsAppMessage(student, report);
          // WhatsApp Web funciona mejor con api.whatsapp.com para asegurar que pase bien el texto
          window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
        }
      }, index * 2000); // Aumentamos a 2s para dar tiempo al sistema
    });
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    MP
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <Lock className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs principales - Responsivo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto scrollbar-hide pb-1">
            <TabsList className="flex h-12 min-w-max w-full items-center justify-start gap-1 p-1 md:flex md:h-12 md:w-full bg-muted/50">
              <TabsTrigger value="daily" className="gap-2 px-4 py-2 flex-shrink-0">
                <Baby className="w-4 h-4" />
                <span className="whitespace-nowrap">
                  {currentUser?.role === 'maestra' ? 'Captura Diaria' : 'Supervisión'}
                </span>
              </TabsTrigger>

              {/* Solo el Rector/Admin puede agregar/editar configuración global */}
              {currentUser?.role !== 'maestra' && (
                <>
                  <TabsTrigger value="add" className="gap-2 px-4 py-2 flex-shrink-0">
                    <Plus className="w-4 h-4" />
                    <span className="whitespace-nowrap">Agregar Alumno</span>
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="gap-2 px-4 py-2 flex-shrink-0">
                    <Edit2 className="w-4 h-4" />
                    <span className="whitespace-nowrap">Configuración</span>
                  </TabsTrigger>
                </>
              )}

              <TabsTrigger value="send" className="gap-2 px-4 py-2 flex-shrink-0">
                <Send className="w-4 h-4" />
                <span className="whitespace-nowrap">Enviar Reportes</span>
              </TabsTrigger>

              {(currentUser?.role === 'rector' || currentUser?.role === 'vicerrector') && (
                <TabsTrigger value="security" className="gap-2 px-4 py-2 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="whitespace-nowrap">Seguridad</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

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
                    {currentUser?.role === 'maestra' ? 'Mis Estudiantes' : 'Vista de Supervisión'} ({students.length})
                  </CardTitle>
                  <CardDescription>
                    {currentUser?.role === 'maestra'
                      ? 'Selecciona los estudiantes para aplicar acciones'
                      : 'Como administrador, puedes ver el estado pero no capturar reportes.'}
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
                            className={`cursor-pointer transition-all border-2 ${selectedStudents.includes(student.id)
                              ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                              : existingReports[student.id]
                                ? 'border-green-500/30 bg-green-50/50 hover:border-green-500/50'
                                : 'border-red-500/20 bg-red-50/30 hover:border-red-500/40'
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
                                    {existingReports[student.id] ? (
                                      <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Reporte Iniciado
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs border-red-200 text-red-600 bg-red-50">
                                        Sin Reporte
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

              {/* Panel de acciones - SOLO PARA MAESTRAS */}
              {currentUser?.role === 'maestra' ? (
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
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMood === item.mood
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
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedLunch === item.value
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

                  {/* Acciones rápidas (Siesta, Pañal...) */}
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Acciones Rápidas
                      </CardTitle>
                      <CardDescription>
                        {selectedStudents.length > 1
                          ? `Aplicando a ${selectedStudents.length} alumnos`
                          : 'Ajuste individual deslizante'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* --- SECCIÓN SIESTA --- */}
                      <div className="p-4 rounded-lg border bg-secondary/50">
                        <div className="flex items-center gap-3 mb-4">
                          <BedDouble className="w-5 h-5 text-purple-500" />
                          <p className="font-medium">¿Durmió la siesta?</p>
                        </div>

                        {selectedStudents.length > 1 ? (
                          // SELECCIÓN MÚLTIPLE: BOTONES RÁPIDOS
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant="secondary"
                              className="bg-white/70 hover:bg-purple-100"
                              onClick={() => {
                                selectedStudents.forEach(id => setNapTimes(prev => ({ ...prev, [id]: 'Sí' })))
                                toast({ title: "Siesta Masiva", description: "Marcado 'Sí' para todos" })
                              }}
                            >Sí</Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                selectedStudents.forEach(id => {
                                  setNapTimes(prev => { const n = { ...prev }; delete n[id]; return n; })
                                })
                                toast({ title: "Siesta Masiva", description: "Marcado 'No' para todos" })
                              }}
                            >No</Button>
                          </div>
                        ) : selectedStudents.length === 1 ? (
                          // SELECCIÓN INDIVIDUAL: SLIDER DE TIEMPO
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1">
                              <span>NADA</span>
                              <span>30m</span>
                              <span>1h</span>
                              <span>1.5h</span>
                              <span>2h+</span>
                            </div>
                            <Slider
                              defaultValue={[0]}
                              max={4}
                              step={1}
                              onValueChange={(vals) => {
                                const labels = ["No durmió", "30 min", "1 hora", "1.5 horas", "2 horas+"];
                                const val = labels[vals[0]];
                                setNapTimes(prev => ({ ...prev, [selectedStudents[0]]: val }));
                              }}
                            />
                            <div className="text-center font-bold text-lg text-purple-600">
                              {napTimes[selectedStudents[0]] || "Desliza para marcar"}
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-sm text-muted-foreground italic">Selecciona alumnos en la lista</p>
                        )}
                      </div>

                      {/* --- SECCIÓN PAÑAL / ROPA --- */}
                      <div className="p-4 rounded-lg border bg-secondary/50">
                        <div className="flex items-center gap-3 mb-4">
                          <Baby className="w-5 h-5 text-orange-500" />
                          <p className="font-medium">Cambio de Pañal / Ropa</p>
                        </div>

                        {selectedStudents.length > 1 ? (
                          // SELECCIÓN MÚLTIPLE: BOTONES RÁPIDOS
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant="secondary"
                              className="bg-white/70 hover:bg-orange-100"
                              onClick={() => {
                                selectedStudents.forEach(id => {
                                  setDiaperChanged(prev => ({ ...prev, [id]: true }))
                                  setDiaperChanges(prev => ({ ...prev, [id]: "Cambio realizado" }))
                                })
                                toast({ title: "Pañal Masivo", description: "Marcado 'Sí' para todos" })
                              }}
                            >Sí</Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                selectedStudents.forEach(id => {
                                  setDiaperChanged(prev => ({ ...prev, [id]: false }))
                                  setDiaperChanges(prev => { const n = { ...prev }; delete n[id]; return n; })
                                })
                                toast({ title: "Pañal Masivo", description: "Marcado 'No' para todos" })
                              }}
                            >No</Button>
                          </div>
                        ) : selectedStudents.length === 1 ? (
                          // SELECCIÓN INDIVIDUAL: SLIDER DE FRECUENCIA
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1">
                              <span>0</span>
                              <span>1</span>
                              <span>2</span>
                              <span>3+</span>
                            </div>
                            <Slider
                              defaultValue={[0]}
                              max={3}
                              step={1}
                              onValueChange={(vals) => {
                                const count = vals[0];
                                setDiaperChanged(prev => ({ ...prev, [selectedStudents[0]]: count > 0 }));
                                setDiaperChanges(prev => ({ ...prev, [selectedStudents[0]]: count === 0 ? "" : `${count} cambio${count !== 1 ? 's' : ''}` }));
                              }}
                            />
                            <div className="text-center font-bold text-lg text-orange-600">
                              {diaperChanges[selectedStudents[0]] || "0 cambios"}
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-sm text-muted-foreground italic">Selecciona alumnos en la lista</p>
                        )}
                      </div>

                      {/* Medicamento - Solo modo individual */}
                      {selectedStudents.length === 1 && (
                        <div className="p-4 rounded-lg border border-red-200 bg-red-50/50">
                          <div className="flex items-center gap-3 mb-2">
                            <Pill className="w-5 h-5 text-red-500" />
                            <p className="font-medium">Medicamento</p>
                          </div>
                          <Input
                            placeholder="Nombre y dosis (ej: Motrin 2ml)"
                            value={medications[selectedStudents[0]]?.name || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMedicationGiven(prev => ({ ...prev, [selectedStudents[0]]: val !== '' }));
                              setMedications(prev => ({
                                ...prev,
                                [selectedStudents[0]]: { name: val, notes: 'Administrado según indicación' }
                              }));
                            }}
                            className="bg-white"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Logros individuales */}
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Logros del Día
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Escribe el logro del día para los seleccionados..."
                        onChange={(e) => {
                          const val = e.target.value;
                          selectedStudents.forEach(id => setIndividualAchievements(prev => ({ ...prev, [id]: val })));
                        }}
                      />
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
              ) : (
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-dashed border-2">
                    <CardHeader className="text-center">
                      <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2 opacity-50" />
                      <CardTitle>Panel de Supervisión</CardTitle>
                      <CardDescription className="max-w-md mx-auto">
                        Como <strong>{currentUser?.role || 'Admin'}</strong>, tienes acceso a ver todos los reportes,
                        pero la captura está reservada para las maestras de cada grupo.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-8">
                      <Button variant="outline" onClick={() => setActiveTab('security')}>
                        Gestionar Personal
                      </Button>
                    </CardContent>
                  </Card>

                </div>
              )}

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
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-green-50/50 border-green-200">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">WhatsApp Web (Envío Directo)</p>
                        <p className="text-sm text-muted-foreground">
                          Se abrirá una ventana de WhatsApp por alumno con el reporte listo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-primary/5">
                    <p className="text-sm text-muted-foreground text-center">
                      Ideal para mantener una comunicación cercana y rápida con los padres de familia.
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const report = existingReports[student.id];
                                  if (report) {
                                    const phone = student.parentPhone?.replace(/\D/g, '');
                                    const message = generateWhatsAppMessage(student, report);
                                    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                                  }
                                }}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                WhatsApp
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const report = existingReports[student.id]
                                  if (report) {
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

              {/* Preview de correo profesional */}
              {emailPreviewStudent && (
                <div className="lg:col-span-2 mb-6">
                  <EmailReportPreview
                    report={emailPreviewStudent}
                    onClose={() => setEmailPreviewStudent(null)}
                    onSend={() => {
                      const subject = encodeURIComponent(`Reporte Diario de ${emailPreviewStudent.student.name} - ${currentDate}`);
                      const body = encodeURIComponent(`Hola, aquí el reporte de ${emailPreviewStudent.student.name}.`);
                      window.location.href = `mailto:${emailPreviewStudent.student.parentEmail}?subject=${subject}&body=${body}`;
                    }}
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
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          window.print();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-8 h-12 text-lg"
                        onClick={() => handleSendReports('whatsapp')}
                        disabled={selectedStudents.filter(id =>
                          existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
                        ).length === 0}
                      >
                        <MessageSquare className="w-5 h-5 mr-3" />
                        Enviar Reportes por WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 5: Seguridad y Gestión de Personal */}
          <TabsContent value="security" className="space-y-6">
            {/* Si el usuario es rector o admin, mostrar gestión de equipo */}
            {(currentUser?.role === 'rector' || currentUser?.role === 'admin' || currentUser?.role === 'directora') && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Panel de Administración</h2>
                    <p className="text-muted-foreground">Gestión de personal y accesos maestros</p>
                  </div>
                </div>
                <TeamManagement />
                <div className="my-10 border-t border-dashed opacity-20" />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="md:col-span-2 bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    Infraestructura de Datos Segura
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Nuestro sistema utiliza tecnología de grado bancario para proteger la información de los menores y la institución.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="card-hover border-green-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Lock className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">Encriptación de Datos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Toda la información personal de los alumnos y maestros se encuentra encriptada tanto en tránsito (SSL/TSL) como en reposo. Esto significa que los datos son ilegibles para cualquier persona ajena al sistema, incluyendo proveedores de internet.
                </CardContent>
              </Card>

              <Card className="card-hover border-blue-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Server className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Respaldo en la Nube (AWS)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Utilizamos la infraestructura de **Amazon Web Services (AWS)** a través de Supabase. AWS es la misma nube que utilizan gobiernos y bancos mundiales, garantizando una disponibilidad del 99.9% y protección contra incendios, fallas técnicas y robos físicos.
                </CardContent>
              </Card>

              <Card className="md:col-span-2 overflow-hidden border-orange-500/20">
                <CardHeader className="bg-orange-500/5">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-orange-600" />
                    <CardTitle>Cumplimiento y Certificaciones Internacionales</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="font-bold text-primary text-lg">SOC2 Type II</div>
                      <p className="text-xs text-muted-foreground">Auditoría de seguridad de nivel oro.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-bold text-primary text-lg">HIPAA</div>
                      <p className="text-xs text-muted-foreground">Estándar para datos de salud sensibles.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-bold text-primary text-lg">GDPR</div>
                      <p className="text-xs text-muted-foreground">Máximo estándar de privacidad europeo.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-bold text-primary text-lg">AES-256</div>
                      <p className="text-xs text-muted-foreground">Encriptación militar de archivos.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-primary/20 bg-secondary/30">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <ShieldCheck className="w-16 h-16 text-primary mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Privacidad de la Institución</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto italic">
                    "Ustedes son los únicos dueños de su información. El sistema está diseñado técnicamente para que cada plantel sea una isla aislada; la información de sus alumnos nunca se comparte con terceros ni se utiliza para fines comerciales."
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 6: Historial */}
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
