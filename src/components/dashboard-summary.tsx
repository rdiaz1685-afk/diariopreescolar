'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RefreshCw } from 'lucide-react'
import { Smile, Utensils, Moon, Baby, Pill, Award, CheckCircle2, AlertCircle, Edit2, Eye } from 'lucide-react'

interface StudentSummary {
  studentId: string
  studentName: string
  studentLastName: string
  hasMood: boolean
  hasLunch: boolean
  hasNap: boolean
  hasDiaperChanged: boolean
  hasMeds: boolean
  hasAchievements: boolean
  isComplete: boolean
}

interface DailySummary {
  date: string
  totalStudents: number
  completeStudents: number
  incompleteStudents: number
  withMood: number
  withLunch: number
  withNap: number
  withDiaperChanged: number
  withMeds: number
  withAchievements: number
  studentSummaries: StudentSummary[]
}

export function DashboardSummary() {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [localDate, setLocalDate] = useState<string>('')
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)

  // Set local date on client side
  useEffect(() => {
    const now = new Date()
    // Usar la fecha local del cliente, no UTC
    const localYear = now.getFullYear()
    const localMonth = String(now.getMonth() + 1).padStart(2, '0')
    const localDay = String(now.getDate()).padStart(2, '0')
    setLocalDate(`${localYear}-${localMonth}-${localDay}`)
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ date: localDate })
      const response = await fetch(`/api/reports/summary?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Error cargando resumen:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (localDate) {
      fetchSummary()
    }
  }, [localDate])

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const incompleteStudents = summary?.studentSummaries?.filter(s => !s.isComplete) || []
  const completedStudents = summary?.studentSummaries?.filter(s => s.isComplete) || []

  const handleEditStudent = (student: StudentSummary) => {
    // Guardar el estudiante en localStorage para que el componente principal lo seleccione
    localStorage.setItem('editingStudentId', student.studentId)
    localStorage.setItem('editingStudentName', `${student.studentName} ${student.studentLastName}`)
    setSelectedStudent(null)
  }

  return (
    <Card className="neon-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <div>
              Resumen del Día
            </div>
          </div>
          <RefreshCw
            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary"
            onClick={() => fetchSummary()}
            title="Recargar datos"
          />
        </CardTitle>
        <CardDescription>
          Estado de los reportes de hoy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!summary && loading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="ml-4 text-muted-foreground">Cargando...</p>
          </div>
        )}

        {summary && !loading && (
          <>
            {/* Estadísticas generales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border-primary/10">
                <div className="text-3xl font-bold text-primary">{summary.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total Alumnos</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-green-500/10 border-green-500/20">
                <div className="text-3xl font-bold text-green-600">{summary.completeStudents}</div>
                <div className="text-sm text-muted-foreground">Completados</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-orange-500/10 border-orange-500/20">
                <div className="text-3xl font-bold text-orange-600">{summary.incompleteStudents}</div>
                <div className="text-sm text-muted-foreground">Faltantes</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-blue-500/10 border-blue-500/20">
                <div className="text-3xl font-bold text-blue-600">{Math.round((summary.completeStudents / summary.totalStudents) * 100)}%</div>
                <div className="text-sm text-muted-foreground">Progreso</div>
              </div>
            </div>

            {/* Actividades registradas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Actividades Registradas Hoy</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border-purple-500/20">
                  <Moon className="w-6 h-6 text-purple-500 mx-auto" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{summary.withNap}</div>
                    <div className="text-sm text-purple-700">Siesta</div>
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-orange-500/10 border-orange-500/20">
                  <Baby className="w-6 h-6 text-orange-500 mx-auto" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{summary.withDiaperChanged}</div>
                    <div className="text-sm text-orange-700">Pañal/Ropa</div>
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-red-500/10 border-red-500/20">
                  <Pill className="w-6 h-6 text-red-500 mx-auto" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{summary.withMeds}</div>
                    <div className="text-sm text-red-700">Medicamento</div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Progreso del Día</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-yellow-500/10 border-yellow-500/20">
                  <Smile className="w-6 h-6 text-yellow-600 mx-auto" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{summary.withMood}</div>
                    <div className="text-sm text-yellow-700">Ánimo</div>
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-green-500/10 border-green-500/20">
                  <Utensils className="w-6 h-6 text-green-600 mx-auto" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{summary.withLunch}</div>
                    <div className="text-sm text-green-700">Lonche</div>
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-blue-500/10 border-blue-500/20">
                  <Award className="w-6 h-6 text-blue-600 mx-auto" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{summary.withAchievements}</div>
                    <div className="text-sm text-blue-700">Logros</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alumnos faltantes */}
            {incompleteStudents.length > 0 && (
              <Card className="mt-6 border-2 border-red-500/50 bg-red-50/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-red-900">
                        {incompleteStudents.length} Alumnos Faltantes
                      </h3>
                      <p className="text-sm text-red-700 mt-2">
                        Aún no se han completado todos los reportes del día
                      </p>
                      <div className="space-y-2">
                        {incompleteStudents.slice(0, 5).map((s, index) => (
                          <div key={s.studentId} className="p-3 bg-red-500/5">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-red-200 text-white text-xs">
                                  {getInitials(s.studentName, s.studentLastName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{s.studentName} {s.studentLastName}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {s.hasMood ? '✓ Ánimo' : '✗ Ánimo'}
                              {s.hasLunch ? ' | ✓ Lonche' : ' | ✗ Lonche'}
                              {s.hasNap ? ' | ✓ Siesta' : ' | ✗ Siesta'}
                              {s.hasDiaperChanged ? ' | ✓ Pañal' : ' | ✗ Pañal'}
                              {s.hasMeds ? ' | ✓ Meds' : ' | ✗ Meds'}
                              {s.hasAchievements ? ' | ✓ Logros' : ' | ✗ Logros'}
                            </div>
                          </div>
                        ))}
                        {incompleteStudents.length > 5 && (
                          <div className="text-center text-sm text-red-700 mt-4">
                            +{incompleteStudents.length - 5} más alumnos...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alumnos completados (verde individual) */}
            {completedStudents.length > 0 && completedStudents.length < summary?.totalStudents && (
              <Card className="mt-6 border-2 border-green-500/50 bg-green-50/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-green-900">
                        {completedStudents.length} Alumnos Completados
                      </h3>
                      <p className="text-sm text-green-700 mt-2">
                        Estos alumnos ya tienen sus reportes del día registrados
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {completedStudents.map((s, index) => (
                      <div
                        key={s.studentId}
                        className="p-3 bg-green-500/5 hover:bg-green-500/10 cursor-pointer transition-colors rounded-lg border border-green-500/20"
                        onClick={() => handleEditStudent(s)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-green-200 text-white text-sm font-semibold">
                                {getInitials(s.studentName, s.studentLastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm">{s.studentName} {s.studentLastName}</div>
                              <div className="text-xs text-muted-foreground">
                                {s.hasMood ? '✓ Ánimo' : ''}{' '}
                                {s.hasLunch ? '✓ Lonche' : ''}{' '}
                                {s.hasNap ? '✓ Siesta' : ''}{' '}
                                {s.hasDiaperChanged ? '✓ Pañal' : ''}{' '}
                                {s.hasMeds ? '✓ Meds' : ''}{' '}
                                {s.hasAchievements ? '✓ Logros' : ''}
                              </div>
                            </div>
                          </div>
                          <Edit2 className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Todos completos */}
            {summary && summary.completeStudents === summary.totalStudents && summary.totalStudents > 0 && (
              <Card className="mt-6 border-2 border-green-500/50 bg-green-50/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-green-900">
                        ¡Excelente! Todos los reportes completos
                      </h3>
                      <p className="text-sm text-green-700 mt-2">
                        Los {summary.totalStudents} alumnos tienen todos sus datos del día registrados
                      </p>
                      <div className="space-y-2 mt-4">
                        <div className="text-sm text-green-600">
                          ✅ {summary.withMood} alumnos tienen marcado su estado de ánimo
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ {summary.withLunch} alumnos tienen marcado su lonche
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ {summary.withNap} alumnos tienen marcado siesta
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ {summary.withDiaperChanged} alumnos tienen marcado pañal/ropa
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ {summary.withMeds} alumnos tienen marcado medicamento
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ {summary.withAchievements} alumnos tienen logros registrados
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
