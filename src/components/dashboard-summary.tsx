'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RefreshCw, Smile, Utensils, Award, Baby, MessageSquare, Brain, CheckCircle2, AlertCircle, Edit2, History } from 'lucide-react'

interface StudentSummary {
  studentId: string
  studentName: string
  studentLastName: string
  groupName?: string
  teacherName?: string
  hasMood: boolean
  hasLunch: boolean
  hasBehavior: boolean
  hasBathroom: boolean
  hasRecess: boolean
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
  withBehavior: number
  withBathroom: number
  withRecess: number
  withAchievements: number
  studentSummaries: StudentSummary[]
}

interface DashboardSummaryProps {
  userRole?: string
}

export function DashboardSummary({ userRole }: DashboardSummaryProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [localDate, setLocalDate] = useState<string>('')

  // Set local date on client side
  useEffect(() => {
    const now = new Date()
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
      console.error('Error loading summary:', error)
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
    localStorage.setItem('editingStudentId', student.studentId)
    localStorage.setItem('editingStudentName', `${student.studentName} ${student.studentLastName}`)
    // This triggers an update in the main page if it listens to storage or we can use a custom event
    window.dispatchEvent(new Event('storage'))
    window.location.hash = 'daily-capture' // Rough way to suggest tab change
  }

  return (
    <Card className="neon-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} />
            <div>Resumen Diario</div>
          </div>
          <RefreshCw
            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary"
            onClick={() => fetchSummary()}
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

        {summary && (
          <>
            {/* Generales */}
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
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border-blue-500/20">
                <div className="text-3xl font-bold text-blue-600">
                  {summary.totalStudents > 0 ? Math.round((summary.completeStudents / summary.totalStudents) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Progreso</div>
              </div>
            </div>

            {/* Incompletes */}
            {incompleteStudents.length > 0 && (
              <Card className="border-2 border-orange-500/50 bg-orange-50/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <CardTitle className="text-lg text-orange-900">{incompleteStudents.length} Reportes Pendientes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {incompleteStudents.map((s) => (
                    <div key={s.studentId} className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm ring-1 ring-orange-100">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-orange-100">
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
                            {getInitials(s.studentName, s.studentLastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-[10px] font-bold text-orange-700 uppercase tracking-tight flex gap-1 items-center mb-0.5">
                            <span className="bg-orange-100 px-1.5 py-0.5 rounded">{s.teacherName || 'No Teacher'}</span>
                            <span className="text-orange-300">•</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{s.groupName || 'No Group'}</span>
                          </div>
                          <div className="font-bold text-slate-900">{s.studentName} {s.studentLastName}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex gap-2">
                            <span className={s.hasMood ? 'text-green-600' : ''}>{s.hasMood ? '✓' : '✗'} Ánimo</span>
                            <span className={s.hasLunch ? 'text-green-600' : ''}>{s.hasLunch ? '✓' : '✗'} Lonche</span>
                            <span className={s.hasBehavior ? 'text-green-600' : ''}>{s.hasBehavior ? '✓' : '✗'} Conducta</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Pendiente</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completes */}
            {completedStudents.length > 0 && completedStudents.length < summary.totalStudents && (
              <Card className="border-none bg-slate-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-lg text-slate-900">{completedStudents.length} Reportes Completos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {completedStudents.map((s) => (
                    <div
                      key={s.studentId}
                      className={`flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm transition-all ${userRole === 'maestra' ? 'hover:ring-1 hover:ring-green-400 cursor-pointer' : ''}`}
                      onClick={() => userRole === 'maestra' && handleEditStudent(s)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-green-100">
                          <AvatarFallback className="bg-green-100 text-green-600 text-xs font-bold">
                            {getInitials(s.studentName, s.studentLastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-[10px] font-bold text-green-700 uppercase tracking-tight flex gap-1 items-center mb-0.5">
                            <span className="bg-green-100 px-1.5 py-0.5 rounded">{s.teacherName || 'No Teacher'}</span>
                            <span className="text-orange-300">•</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{s.groupName || 'No Group'}</span>
                          </div>
                          <div className="font-bold text-slate-900">{s.studentName} {s.studentLastName}</div>
                        </div>
                      </div>
                      {userRole === 'maestra' && <Edit2 className="w-4 h-4 text-slate-400" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* All complete */}
            {summary.completeStudents === summary.totalStudents && summary.totalStudents > 0 && (
              <div className="text-center py-12 bg-green-500/5 rounded-2xl border-2 border-dashed border-green-500/20">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">¡Excelente!</h3>
                <p className="text-green-700">Todos los reportes de hoy están completos.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
