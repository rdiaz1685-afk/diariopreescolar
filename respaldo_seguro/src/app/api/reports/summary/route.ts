import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const groupId = searchParams.get('groupId')

    console.log('=== Obteniendo resumen de reportes ===')
    console.log('Fecha:', date)
    console.log('Grupo:', groupId)

    // Obtener fecha de hoy (sin hora)
    const todayStart = new Date(date)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(date)
    todayEnd.setHours(23, 59, 59, 999)

    console.log('Buscando reportes entre:', todayStart.toISOString(), 'y', todayEnd.toISOString())

    // Obtener reportes del día
    const reports = await db.dailyReport.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        },
        ...(groupId && { groupId })
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            lastName: true,
            groupId: true
          }
        }
      }
    })

    console.log('Reportes encontrados:', reports.length)

    // Obtener todos los estudiantes del grupo (si se especifica)
    const allStudents = await db.student.findMany({
      where: groupId ? { groupId } : undefined,
      select: {
        id: true,
        name: true,
        lastName: true,
        groupId: true
      },
      orderBy: { name: 'asc' }
    })

    console.log('Total estudiantes en grupo:', allStudents.length)

    // Agrupar reportes por estudiante
    const reportsByStudent = new Map()
    reports.forEach(report => {
      const studentId = report.studentId
      if (!reportsByStudent.has(studentId)) {
        reportsByStudent.set(studentId, {
          studentId,
          studentName: report.student.name,
          studentLastName: report.student.lastName,
          hasMood: false,
          hasLunch: false,
          hasNap: false,
          hasDiaperChanged: false,
          hasMeds: false,
          hasAchievements: false,
          isComplete: false
        })
      }
      const studentReport = reportsByStudent.get(studentId)

      // Marcar lo que tiene
      if (report.mood) studentReport.hasMood = true
      if (report.lunchIntake) studentReport.hasLunch = true
      if (report.hadNap) studentReport.hasNap = true
      if (report.diaperChanged) studentReport.hasDiaperChanged = true
      if (report.medicationGiven) studentReport.hasMeds = true
      if (report.dailyAchievements && report.dailyAchievements.trim()) studentReport.hasAchievements = true

      if (studentReport.hasMood && studentReport.hasLunch) {
        studentReport.isComplete = true
      }
    })

    // Crear mapa de todos los estudiantes
    const allStudentsMap = new Map()
    allStudents.forEach(student => {
      const studentReport = reportsByStudent.get(student.id) || {
        studentId: student.id,
        studentName: student.name,
        studentLastName: student.lastName,
        hasMood: false,
        hasLunch: false,
        hasNap: false,
        hasDiaperChanged: false,
        hasMeds: false,
        hasAchievements: false,
        isComplete: false
      }

      // Agregar nombre si ya existe reporte
      if (reportsByStudent.has(student.id)) {
        studentReport.studentName = student.name
        studentReport.studentLastName = student.lastName
      }

      allStudentsMap.set(student.id, studentReport)
    })

    const studentSummaries = Array.from(allStudentsMap.values())

    // Calcular estadísticas
    const totalStudents = studentSummaries.length
    const completeStudents = studentSummaries.filter(s => s.isComplete).length
    const incompleteStudents = totalStudents - completeStudents

    const withMood = studentSummaries.filter(s => s.hasMood).length
    const withLunch = studentSummaries.filter(s => s.hasLunch).length
    const withNap = studentSummaries.filter(s => s.hasNap).length
    const withDiaperChanged = studentSummaries.filter(s => s.hasDiaperChanged).length
    const withMedication = studentSummaries.filter(s => s.hasMeds).length
    const withAchievement = studentSummaries.filter(s => s.hasAchievements).length

    console.log('=== Estadísticas ===')
    console.log('Total estudiantes:', totalStudents)
    console.log('Completos:', completeStudents)
    console.log('Incompletos:', incompleteStudents)

    const summary = {
      date,
      groupId,
      totalStudents,
      completeStudents,
      incompleteStudents,
      withMood,
      withLunch,
      withNap,
      withDiaperChanged,
      withMeds: withMedication,
      withAchievements: withAchievement,
      studentSummaries
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('❌ Error obteniendo resumen:', error)
    return NextResponse.json(
      { error: 'Error al obtener resumen de reportes' },
      { status: 500 }
    )
  }
}
