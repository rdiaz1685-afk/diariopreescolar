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
import { FeedbackModal } from '@/components/feedback-modal'
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
  Globe,
  Brain,
  Lightbulb
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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [emailPreviewStudent, setEmailPreviewStudent] = useState<any>(null)
  const [selectedBehavior, setSelectedBehavior] = useState<string>('')
  const [recessNote, setRecessNote] = useState<string>('')
  const [bathroomPee, setBathroomPee] = useState<boolean>(false)
  const [bathroomPoop, setBathroomPoop] = useState<boolean>(false)

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
  const [teachersMap, setTeachersMap] = useState<Record<string, string>>({})

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

  // Cargar mapeo de maestras
  useEffect(() => {
    async function fetchTeachers() {
      const { data } = await supabase
        .from('profiles')
        .select('name, groupId')
        .eq('role', 'maestra')

      if (data) {
        const map: Record<string, string> = {}
        data.forEach(t => {
          if (t.groupId) map[t.groupId] = t.name
        })
        setTeachersMap(map)
      }
    }
    fetchTeachers()
  }, [])

  // Cargar datos del reporte cuando se selecciona un ÚNICO alumno (Edición fluida)
  useEffect(() => {
    if (selectedStudents.length === 1) {
      const studentId = selectedStudents[0]
      const report = existingReports[studentId]

      // Limpiar estados antes de cargar o si no hay reporte
      setSelectedMood('')
      setSelectedLunch('')
      setGeneralNotes('')

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
        } else {
          setMedicationGiven(prev => ({ ...prev, [studentId]: false }))
          setMedications(prev => { const n = { ...prev }; delete n[studentId]; return n; })
        }

        // Logros y Notas
        if (report.dailyAchievements) {
          setIndividualAchievements(prev => ({ ...prev, [studentId]: report.dailyAchievements }))
        } else {
          setIndividualAchievements(prev => { const n = { ...prev }; delete n[studentId]; return n; })
        }

        // Limpiar "Siesta: ..." de las notas generales para que no se duplique al editar
        let cleanNotes = report.generalNotes || ""

        // Extraer Behavior si existe (Formato "Behavior: [Value].")
        const behaviorMatch = cleanNotes.match(/Behavior: ([\w\s!]+)\./)
        if (behaviorMatch) {
          setSelectedBehavior(behaviorMatch[1].toLowerCase().replace('!', ''))
          cleanNotes = cleanNotes.replace(/Behavior: [\w\s!]+\.\s*/, "")
        } else {
          setSelectedBehavior('')
        }

        // Extraer Recess si existe (Formato "Recess: [Value].")
        const recessMatch = cleanNotes.match(/Recess: ([\w\s\+]+)\./)
        if (recessMatch) {
          setRecessNote(recessMatch[1])
          cleanNotes = cleanNotes.replace(/Recess: [\w\s\+]+\.\s*/, "")
        } else {
          setRecessNote('')
        }

        cleanNotes = cleanNotes.replace(/Siesta: [\w\s\+]+\.\s*/, "").trim()
        setGeneralNotes(cleanNotes)

        // Extraer Bathroom (Pee/Poop) de diaperNotes
        const bathroomNotes = report.diaperNotes || ""
        setBathroomPee(bathroomNotes.includes('Pee'))
        setBathroomPoop(bathroomNotes.includes('Poop'))
      }
    } else if (selectedStudents.length === 0) {
      // Limpiar campos si no hay selección
      setSelectedMood('')
      setSelectedLunch('')
      setSelectedBehavior('')
      setRecessNote('')
      setBathroomPee(false)
      setBathroomPoop(false)
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

  // Seleccionar/deseleccionar todos (DESHABILITADO por petición del usuario)
  const toggleSelectAll = () => {
    // Ya no se permite selección múltiple
    return;
  }

  // Toggle selección individual (Solo uno a la vez)
  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? [] : [id]
    )
  }

  // Guardar el reporte del alumno seleccionado
  const saveReport = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un estudiante',
        variant: 'destructive'
      })
      return
    }

    try {
      const reports = selectedStudents.map(studentId => {
        const napValue = napTimes[studentId] || ""
        const isNap = !!napValue && napValue !== "No durmió"

        let finalGeneralNotes = generalNotes || ""

        // Agregar Comportamiento y Recreo a las notas generales
        if (selectedBehavior) {
          const behaviorLabel = selectedBehavior === 'excellent' ? 'Excellent!' : selectedBehavior === 'good' ? 'Good!' : 'Regular';
          finalGeneralNotes = `Behavior: ${behaviorLabel}. ${finalGeneralNotes}`.trim();
        }
        if (recessNote) {
          finalGeneralNotes = `Recess: ${recessNote}. ${finalGeneralNotes}`.trim();
        }

        // Si hay una duración de siesta específica, la agregamos a las notas si no es masivo
        if (napValue && napValue !== "Sí" && napValue !== "No durmió" && selectedStudents.length === 1) {
          finalGeneralNotes = `Siesta: ${napValue}. ${finalGeneralNotes}`.trim()
        }

        // Formatear notas de baño
        let finalBathroomNotes = "";
        if (bathroomPee) finalBathroomNotes += "Pee ";
        if (bathroomPoop) finalBathroomNotes += "Poop";
        finalBathroomNotes = finalBathroomNotes.trim();

        return {
          studentId,
          date: localDate,
          ...(selectedMood && { mood: selectedMood }),
          ...(selectedLunch && { lunchIntake: selectedLunch }),
          hadNap: isNap,
          diaperChanged: bathroomPee || bathroomPoop,
          diaperNotes: finalBathroomNotes || undefined,
          ...(medicationGiven[studentId] !== undefined && { medicationGiven: medicationGiven[studentId] }),
          ...(medications[studentId]?.name && { medicationName: medications[studentId].name }),
          ...(medications[studentId]?.notes && { medicationNotes: medications[studentId].notes }),
          ...(individualAchievements[studentId] && { dailyAchievements: individualAchievements[studentId] }),
          generalNotes: finalGeneralNotes || undefined
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
          description: `Reporte guardado exitosamente`,
          variant: 'default'
        })

        // Limpiar selección después de guardar
        setSelectedStudents([])
        setSelectedMood('')
        setSelectedLunch('')
        setSelectedBehavior('')
        setRecessNote('')
        setBathroomPee(false)
        setBathroomPoop(false)
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
        description: 'Por favor selecciona un estudiante.',
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
      title: 'Dato Actualizado',
      description: `Se asignó al alumno. Haz clic en "Guardar Reporte" al terminar.`,
      variant: 'default'
    })
  }

  // Generar mensaje para WhatsApp (Versión diaria concisa)
  const generateWhatsAppMessage = (student: any, report: any) => {
    const moods: Record<string, string> = {
      happy: 'Happy! 😁',
      sad: 'Sad 😢',
      tired: 'Tired 😴'
    };

    const intakes: Record<string, string> = {
      all: 'All 🍱',
      some: 'Some 🥗',
      just_a_bite: 'Just a bite 🥺'
    };

    const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    // Extraer comportamiento de las notas si existe
    let behaviorRaw = '';
    const behaviorMatch = report.generalNotes?.match(/Behavior: ([\w\s!]+)\./);
    if (behaviorMatch) {
      behaviorRaw = behaviorMatch[1];
    }

    let message = `*Daily Report: ${student.name}* (${dateStr})\n\n`;
    message += `😊 *Mood:* ${moods[report.mood] || 'Good!'}\n`;
    message += `🍽️ *Snack:* ${intakes[report.lunchIntake] || 'N/A'}\n`;

    if (behaviorRaw) message += `⭐ *Behavior:* ${behaviorRaw}\n`;
    if (report.hadNap) message += `😴 *Nap:* Yes ✅\n`;
    if (report.diaperChanged) message += `🧷 *Bathroom:* ${report.diaperNotes || 'Yes'} ✅\n`;

    if (report.dailyAchievements) {
      message += `\n✨ *Ask me about:* ${report.dailyAchievements}\n`;
    }

    if (report.generalNotes) {
      // Limpiar prefijos de comportamiento/siesta para el mensaje
      const cleanNotes = report.generalNotes
        .replace(/Behavior: [\w\s!]+\.\s*/, "")
        .replace(/Recess: [\w\s\+]+\.\s*/, "")
        .replace(/Siesta: [\w\s\+]+\.\s*/, "")
        .trim();

      if (cleanNotes) {
        message += `\n📝 *Note:* ${cleanNotes}\n`;
      }
    }

    message += `\n_Keep up the good work!_`;

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
      title: method === 'email' ? "Abriendo correo" : "Abriendo WhatsApp",
      description: `Procesando reporte de ${students.find(s => s.id === selectedCompleteStudents[0])?.name}...`,
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
              Daily Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-Powered Preschool Reporting System
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

            <FeedbackModal />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    MP
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <Lock className="w-4 h-4 mr-2" />
                  Logout
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
                  {currentUser?.role === 'maestra' ? 'Daily Capture' : 'Supervision'}
                </span>
              </TabsTrigger>

              {/* Add Student y Settings: Solo para el rol 'admin' */}
              {currentUser?.role === 'admin' && (
                <>
                  <TabsTrigger value="add" className="gap-2 px-4 py-2 flex-shrink-0">
                    <Plus className="w-4 h-4" />
                    <span className="whitespace-nowrap">Add Student</span>
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="gap-2 px-4 py-2 flex-shrink-0">
                    <Edit2 className="w-4 h-4" />
                    <span className="whitespace-nowrap">Settings</span>
                  </TabsTrigger>
                </>
              )}

              {/* Send Reports: Para Admin, Rector, Director y Maestras */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'rector' || currentUser?.role === 'directora' || currentUser?.role === 'vicerrector' || currentUser?.role === 'maestra') && (
                <TabsTrigger value="send" className="gap-2 px-4 py-2 flex-shrink-0">
                  <Send className="w-4 h-4" />
                  <span className="whitespace-nowrap">Send Reports</span>
                </TabsTrigger>
              )}

              {/* Security: Ahora accesible para todos (maestras, rector, admin) */}
              <TabsTrigger value="security" className="gap-2 px-4 py-2 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
                <span className="whitespace-nowrap">Security</span>
              </TabsTrigger>
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
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                      Select a student to record their daily report
                    </div>
                  </div>
                  <Badge variant={selectedStudents.length > 0 ? "default" : "secondary"}>
                    {selectedStudents.length === 1 ? "1 alumno seleccionado" : "Sin selección"}
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
                            className={`transition-all border-2 ${currentUser?.role === 'maestra' ? 'cursor-pointer' : 'cursor-default'} ${selectedStudents.includes(student.id)
                              ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                              : existingReports[student.id]
                                ? 'border-green-500/30 bg-green-50/50 hover:border-green-500/50'
                                : 'border-red-500/20 bg-red-50/30 hover:border-red-500/40'
                              }`}
                            onClick={() => currentUser?.role === 'maestra' && toggleStudent(student.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                {currentUser?.role === 'maestra' && (
                                  selectedStudents.includes(student.id) ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-muted" />
                                  )
                                )}
                                <Avatar>
                                  <AvatarFallback className="bg-accent text-accent-foreground">
                                    {getInitials(student.name, student.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  {currentUser?.role !== 'maestra' && (
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex gap-1 items-center mb-1">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{teachersMap[student.groupId] || 'No Teacher'}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="bg-slate-50 px-1.5 py-0.5 rounded">{student.groups?.name || 'No Group'}</span>
                                    </div>
                                  )}
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
                  {/* 1. During the day I was */}
                  <Card className="card-hover overflow-hidden border-none bg-white shadow-md ring-1 ring-blue-100">
                    <CardHeader className="pb-2 bg-blue-50/50">
                      <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <Smile className="w-6 h-6 text-blue-600" />
                        During the day I was
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'happy', emoji: '😁', label: 'Happy' },
                          { id: 'sad', emoji: '😢', label: 'Sad' },
                          { id: 'tired', emoji: '😴', label: 'Tired' }
                        ].map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedMood === item.id
                              ? 'border-blue-500 bg-blue-50 scale-105 shadow-md shadow-blue-200/50'
                              : 'border-slate-100 bg-slate-50/50 hover:border-blue-200'
                              }`}
                            onClick={() => setSelectedMood(item.id)}
                          >
                            <span className="text-5xl">{item.emoji}</span>
                            <span className={`text-sm font-bold uppercase tracking-wider ${selectedMood === item.id ? 'text-blue-700' : 'text-slate-600'}`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. My behavior was... */}
                  <Card className="card-hover overflow-hidden border-none bg-white shadow-md ring-1 ring-yellow-100">
                    <CardHeader className="pb-2 bg-yellow-50/50">
                      <CardTitle className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-600" />
                        My behavior was...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'excellent', emoji: '👍', label: 'Excellent!' },
                          { id: 'good', emoji: '😊', label: 'Good!' },
                          { id: 'regular', emoji: '😬', label: 'Regular' }
                        ].map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedBehavior === item.id
                              ? 'border-yellow-500 bg-yellow-50 scale-105 shadow-md shadow-yellow-200/50'
                              : 'border-slate-100 bg-slate-50/50 hover:border-yellow-200'
                              }`}
                            onClick={() => setSelectedBehavior(item.id)}
                          >
                            <span className="text-5xl">{item.emoji}</span>
                            <span className={`text-sm font-bold uppercase tracking-wider ${selectedBehavior === item.id ? 'text-yellow-700' : 'text-slate-600'}`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Ask me about: */}
                  <Card className="card-hover border-none bg-white shadow-md ring-1 ring-slate-200">
                    <CardHeader className="pb-2 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-primary" />
                        Ask me about:
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Textarea
                        placeholder="Write something special the student did today..."
                        className="min-h-[80px] text-lg bg-white border-slate-200 text-slate-900 focus:ring-primary"
                        value={selectedStudents.length === 1 ? (individualAchievements[selectedStudents[0]] || '') : ''}
                        onChange={(e) => {
                          if (selectedStudents.length === 1) {
                            setIndividualAchievements(prev => ({ ...prev, [selectedStudents[0]]: e.target.value }));
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* 4. Snack: I ate... */}
                  <Card className="card-hover overflow-hidden border-none bg-white shadow-md ring-1 ring-green-100">
                    <CardHeader className="pb-2 bg-green-50/50">
                      <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-green-600" />
                        Snack: I ate...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'all', label: 'All', emoji: '🍱' },
                          { id: 'some', label: 'Some', emoji: '🥗' },
                          { id: 'just_a_bite', label: 'Just a bite', emoji: '🥺' }
                        ].map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedLunch === item.id
                              ? 'border-green-500 bg-green-50 scale-105 shadow-sm shadow-green-200/50'
                              : 'border-slate-100 bg-slate-50/50 hover:border-green-200'
                              }`}
                            onClick={() => setSelectedLunch(item.id)}
                          >
                            <span className="text-3xl mb-1">{item.emoji}</span>
                            <span className={`text-sm font-bold uppercase tracking-wider text-center ${selectedLunch === item.id ? 'text-green-700' : 'text-slate-600'}`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. Bathroom: I went to... */}
                  <Card className="card-hover border-none bg-white shadow-md ring-1 ring-orange-100">
                    <CardHeader className="pb-2 bg-orange-50/50">
                      <CardTitle className="text-xl font-bold text-orange-900 flex items-center gap-2">
                        <Baby className="w-6 h-6 text-orange-600" />
                        Bathroom: I went to...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${bathroomPee ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-200/50' : 'border-slate-100 bg-slate-50/50 hover:border-orange-200'
                            }`}
                          onClick={() => setBathroomPee(!bathroomPee)}
                        >
                          <span className={`text-lg font-bold uppercase tracking-wider ${bathroomPee ? 'text-orange-700' : 'text-slate-600'}`}>Pee</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bathroomPee ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-200'}`}>
                            {bathroomPee && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${bathroomPoop ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-200/50' : 'border-slate-100 bg-slate-50/50 hover:border-orange-200'
                            }`}
                          onClick={() => setBathroomPoop(!bathroomPoop)}
                        >
                          <span className={`text-lg font-bold uppercase tracking-wider ${bathroomPoop ? 'text-orange-700' : 'text-slate-600'}`}>Poop</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bathroomPoop ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-200'}`}>
                            {bathroomPoop && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 6. Recess: I played with... */}
                  <Card className="card-hover border-none bg-white shadow-md ring-1 ring-slate-200">
                    <CardHeader className="pb-2 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Recess: I played with...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Input
                        placeholder="Names of friends or favorite activities at recess..."
                        className="text-lg bg-white border-slate-200 text-slate-900 focus:ring-primary"
                        value={recessNote}
                        onChange={(e) => setRecessNote(e.target.value)}
                      />
                    </CardContent>
                  </Card>

                  {/* 7. Note from teacher */}
                  <Card className="card-hover border-none bg-white shadow-md ring-1 ring-slate-200 lg:col-span-2">
                    <CardHeader className="pb-2 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-primary" />
                        Here's a note from my teacher:
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Textarea
                        placeholder="Any additional messages for parents..."
                        className="min-h-[120px] text-lg bg-white border-slate-200 text-slate-900 focus:ring-primary"
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-dashed border-2">
                    <CardHeader className="text-center">
                      <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2 opacity-50" />
                      <CardTitle>Supervision Panel</CardTitle>
                      <CardDescription className="max-w-md mx-auto">
                        As <strong>{currentUser?.role || 'User'}</strong>, you have access to view all reports,
                        while daily capture is reserved for teachers.
                      </CardDescription>
                    </CardHeader>
                    {currentUser?.role === 'admin' && (
                      <CardContent className="flex justify-center pb-8">
                        <Button variant="outline" onClick={() => setActiveTab('security')}>
                          Manage Staff
                        </Button>
                      </CardContent>
                    )}
                  </Card>

                </div>
              )}

              {/* Botón de Guardar: Solo para maestras */}
              {selectedStudents.length > 0 && currentUser?.role === 'maestra' && (
                <Card className="neon-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Confirmar Reporte
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Los datos capturados se guardarán para el alumno seleccionado
                        </p>
                      </div>
                      <Button
                        onClick={saveReport}
                        disabled={saving}
                        className="neon-accent"
                        size="lg"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Reporte'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resumen del Día */}
              <DashboardSummary userRole={currentUser?.role} />
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
                    Daily Summary
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
                            {selectedStudents.includes(student.id) ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted" onClick={() => toggleStudent(student.id)} />
                            )}
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
                              {currentUser?.role === 'maestra' || currentUser?.role === 'admin' ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const report = existingReports[student.id];
                                      if (report) {
                                        const phone = student.parentPhone?.replace(/\D/g, '');
                                        const message = generateWhatsAppMessage(student, report);
                                        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
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
                                </>
                              ) : (
                                <Badge variant="outline" className="text-slate-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Listo para envío
                                </Badge>
                              )}
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

              {/* Botón de envío: Solo para maestras y admin */}
              {(currentUser?.role === 'maestra' || currentUser?.role === 'admin') && (
                <Card className="lg:col-span-2 neon-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">Send Daily Reports</h3>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const selectedCompleteStudent = selectedStudents.find(id =>
                              existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
                            )
                            return selectedCompleteStudent
                              ? `Ready to send the report for the selected student`
                              : 'Select a completed report to send'
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
                          Download PDF
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-8 h-12 text-lg"
                          onClick={() => handleSendReports('whatsapp')}
                          disabled={selectedStudents.filter(id =>
                            existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
                          ).length === 0}
                        >
                          <MessageSquare className="w-5 h-5 mr-3" />
                          Send via WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab 5: Seguridad y Gestión de Personal */}
          <TabsContent value="security" className="space-y-6">
            {/* El Panel de Administración (Gestión de Personal) para 'admin' y 'rector' */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'rector') && (
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

                {/* Visualizador de Sugerencias para el Admin */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Review General Suggestions
                  </h3>
                  <div className="p-8 text-center border-2 border-dashed rounded-xl bg-primary/5">
                    <p className="text-muted-foreground mb-4">
                      Collect the ideas of your entire team to continue evolving the institution.
                    </p>
                    <Button variant="outline" onClick={() => window.alert('Próximamente: Panel de visualización de sugerencias')}>
                      View Suggestions Inbox
                    </Button>
                  </div>
                </div>

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
