import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener reportes de hoy para un estudiante específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const dateStr = searchParams.get('date')

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      )
    }

    // Obtener fecha actual (inicio del día) usando la fecha del cliente si se proporciona
    let today = dateStr ? new Date(dateStr) : new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Buscar reporte de hoy
    const report = await db.dailyReport.findFirst({
      where: {
        studentId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error obteniendo reporte diario:', error)
    return NextResponse.json(
      { error: 'Error al obtener reporte diario' },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar reporte diario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      mood,
      lunchIntake,
      hadNap,
      diaperChanged,
      diaperNotes,
      medicationGiven,
      medicationName,
      medicationNotes,
      dailyAchievements,
      generalNotes,
      date
    } = body

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      )
    }

    // Obtener fecha actual (inicio del día) usando la fecha del cliente si se proporciona
    let today = date ? new Date(date) : new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Verificar si ya existe un reporte para hoy
    const existingReport = await db.dailyReport.findFirst({
      where: {
        studentId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    let report

    if (existingReport) {
      // Actualizar reporte existente
      report = await db.dailyReport.update({
        where: { id: existingReport.id },
        data: {
          ...(mood !== undefined && { mood }),
          ...(lunchIntake !== undefined && { lunchIntake }),
          ...(hadNap !== undefined && { hadNap }),
          ...(diaperChanged !== undefined && { diaperChanged }),
          ...(diaperNotes !== undefined && { diaperNotes }),
          ...(medicationGiven !== undefined && { medicationGiven }),
          ...(medicationName !== undefined && { medicationName }),
          ...(medicationNotes !== undefined && { medicationNotes }),
          ...(dailyAchievements !== undefined && { dailyAchievements }),
          ...(generalNotes !== undefined && { generalNotes }),
          updatedAt: new Date()
        }
      })
    } else {
      // Crear nuevo reporte
      report = await db.dailyReport.create({
        data: {
          studentId,
          mood: mood || null,
          lunchIntake: lunchIntake || null,
          hadNap: hadNap || false,
          diaperChanged: diaperChanged || false,
          diaperNotes: diaperNotes || null,
          medicationGiven: medicationGiven || false,
          medicationName: medicationName || null,
          medicationNotes: medicationNotes || null,
          dailyAchievements: dailyAchievements || null,
          generalNotes: generalNotes || null,
          date: today
        }
      })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error guardando reporte diario:', error)
    return NextResponse.json(
      { error: 'Error al guardar reporte diario' },
      { status: 500 }
    )
  }
}
