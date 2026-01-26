import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const groupId = searchParams.get('groupId')

    console.log('=== Diagnóstico del sistema ===')
    console.log('Fecha solicitada:', date)
    console.log('Grupo solicitado:', groupId)

    // Obtener fecha de hoy (sin hora)
    const todayStart = new Date(date)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(date)
    todayEnd.setHours(23, 59, 59, 999)

    // 1. Verificar estudiantes
    const allStudents = await db.student.findMany({
      select: {
        id: true,
        name: true,
        lastName: true,
        groupId: true
      }
    })

    console.log('✅ Total estudiantes en DB:', allStudents.length)

    // 2. Verificar estudiantes del grupo
    let groupStudents = allStudents
    if (groupId) {
      groupStudents = allStudents.filter(s => s.groupId === groupId)
      console.log(`✅ Estudiantes en grupo ${groupId}:`, groupStudents.length)
    } else {
      console.log('⚠️ No se especificó groupId, usando todos los estudiantes')
    }

    // 3. Verificar reportes del día
    const reports = await db.dailyReport.findMany({
      where: {
        date: {
          gte: todayStart.toISOString(),
          lte: todayEnd.toISOString()
        },
        ...(groupId && { student: { groupId: groupStudents.map(s => s.id) } })
      },
      select: {
        id: true,
        studentId: true,
        mood: true,
        lunchIntake: true,
        hadNap: true,
        diaperChanged: true,
        medicationGiven: true,
        dailyAchievements: true
      }
    })

    console.log('✅ Reportes del día encontrados:', reports.length)

    // 4. Calcular estado por estudiante
    const reportMap = new Map()
    reports.forEach(report => {
      const studentId = report.studentId
      if (!reportMap.has(studentId)) {
        reportMap.set(studentId, {
          studentId,
          hasMood: false,
          hasLunch: false,
          hasNap: false,
          hasDiaper: false,
          hasMeds: false,
          hasAchievement: false,
          isComplete: false
        })
      }

      const studentReport = reportMap.get(report.studentId)
      if (studentReport) {
        if (report.mood) studentReport.hasMood = true
        if (report.lunchIntake) studentReport.hasLunch = true
        if (report.hadNap) studentReport.hasNap = true
        if (report.diaperChanged) studentReport.hasDiaperChanged = true
        if (report.medicationGiven) studentReport.hasMeds = true
        if (report.dailyAchievements && report.dailyAchievements.trim()) {
          studentReport.hasAchievement = true
        }

        if (studentReport.hasMood && studentReport.hasLunch) {
          studentReport.isComplete = true
        }
      }
    })

    const studentSummaries = Array.from(reportMap.values())

    // 5. Estadísticas
    const totalStudents = groupStudents.length
    const completeStudents = studentSummaries.filter(s => s.isComplete).length
    const incompleteStudents = totalStudents - completeStudents

    const withMood = studentSummaries.filter(s => s.hasMood).length
    const withLunch = studentSummaries.filter(s => s.hasLunch).length
    const withNap = studentSummaries.filter(s => s.hasNap).length
    const withDiaperChanged = studentSummaries.filter(s => s.hasDiaperChanged).length
    const withMeds = studentSummaries.filter(s => s.hasMeds).length
    const withAchievement = studentSummaries.filter(s => s.hasAchievement).length

    console.log('=== Estadísticas calculadas ===')
    console.log('Total estudiantes:', totalStudents)
    console.log('Completos:', completeStudents)
    console.log('Incompletos:', incompleteStudents)
    console.log('Con ánimo:', withMood)
    console.log('Con lonche:', withLunch)
    console.log('Con siesta:', withNap)
    console.log('Con pañal:', withDiaperChanged)
    console.log('Con medicamento:', withMeds)
    console.log('Con logros:', withAchievement)

    const diagnostics = {
      timestamp: new Date().toISOString(),
      requestedDate: date,
      groupId,
      totalStudents,
      completeStudents,
      incompleteStudents,
      withMood,
      withLunch,
      withNap,
      withDiaperChanged,
      withMeds,
      withAchievement,
      studentSummaries: studentSummaries.map(s => ({
        id: s.studentId,
        name: allStudents.find(st => st.id === s.studentId)?.name || 'Desconocido',
        lastName: allStudents.find(st => st.id === s.studentId)?.lastName || '',
        groupId: s.groupId,
        hasMood: s.hasMood,
        hasLunch: s.hasLunch,
        hasNap: s.hasNap,
        hasDiaperChanged: s.hasDiaperChanged,
        hasMeds: s.hasMeds,
        hasAchievement: s.hasAchievement,
        isComplete: s.isComplete
      }))
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
    return NextResponse.json(
      { error: 'Error en diagnóstico', details: String(error) },
      { status: 500 }
    )
  }
}
