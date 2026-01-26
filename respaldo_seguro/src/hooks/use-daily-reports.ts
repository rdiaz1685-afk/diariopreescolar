import { useState } from 'react'

interface DailyReportData {
  studentId: string
  mood?: string
  lunchIntake?: string
  hadNap?: boolean
  diaperChanged?: boolean
  diaperNotes?: string
  medicationGiven?: boolean
  medicationName?: string
  medicationNotes?: string
  dailyAchievements?: string
  generalNotes?: string
  date?: string // Fecha local del cliente
}

interface DailyReport {
  id: string
  studentId: string
  date: string
  mood: string | null
  lunchIntake: string | null
  hadNap: boolean
  diaperChanged: boolean
  diaperNotes: string | null
  medicationGiven: boolean
  medicationName: string | null
  medicationNotes: string | null
  dailyAchievements: string | null
  generalNotes: string | null
  isComplete: boolean
  sentViaEmail: boolean
  sentViaWhatsApp: boolean
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

export function useDailyReports() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveReport = async (data: DailyReportData): Promise<DailyReport | null> => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar reporte')
      }

      const report = await response.json()
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error guardando reporte:', err)
      return null
    } finally {
      setSaving(false)
    }
  }

  const saveMultipleReports = async (reports: DailyReportData[]): Promise<DailyReport[]> => {
    try {
      setSaving(true)
      setError(null)

      // Guardar cada reporte en paralelo
      const promises = reports.map(report => saveReport(report))
      const results = await Promise.all(promises)

      // Filtrar los que no fallaron
      const successfulReports = results.filter((r): r is DailyReport => r !== null)

      return successfulReports
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error guardando múltiples reportes:', err)
      return []
    } finally {
      setSaving(false)
    }
  }

  const getTodayReport = async (studentId: string, date?: string): Promise<DailyReport | null> => {
    try {
      setError(null)

      // Validar que studentId existe y no está vacío
      if (!studentId || studentId.trim() === '') {
        console.error('studentId inválido:', studentId)
        return null
      }

      // Usar URLSearchParams para evitar problemas con caracteres especiales
      const params = new URLSearchParams({ studentId: studentId.trim() })
      if (date) {
        params.append('date', date)
      }
      const url = `/api/reports?${params.toString()}`

      console.log('Obteniendo reporte de hoy para:', studentId, 'URL:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al obtener reporte de hoy`)
      }

      const report = await response.json()
      console.log('Reporte obtenido:', report)
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error obteniendo reporte:', err)
      console.error('Detalles del error:', {
        studentId,
        error: err,
        errorMessage
      })
      return null
    }
  }

  return {
    saveReport,
    saveMultipleReports,
    getTodayReport,
    saving,
    error
  }
}
