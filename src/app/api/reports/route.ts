import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET - Obtener reportes de hoy para un estudiante específico
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    let dateStr = searchParams.get('date')

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      )
    }

    // Si no viene fecha, calculamos la local de hoy en formato YYYY-MM-DD
    if (!dateStr) {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      dateStr = `${y}-${m}-${d}`
    }

    console.log(`[GET Report] Buscando reporte: Alumno ${studentId}, Fecha ${dateStr}`)

    // Buscar reporte por fecha exacta (columna tipo DATE en Postgres)
    const { data: report, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('studentId', studentId)
      .eq('date', dateStr)
      .maybeSingle()

    if (error) throw error

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
    const supabase = await createClient()
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
      generalNotes
    } = body

    let { date: dateStr } = body

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      )
    }

    // Si no viene fecha, calculamos la local de hoy en formato YYYY-MM-DD
    if (!dateStr) {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      dateStr = `${y}-${m}-${d}`
    }

    console.log(`[POST Report] Alumno: ${studentId}, Fecha: ${dateStr}`)

    // Verificar si ya existe un reporte para esta fecha exacta
    const { data: existingReport, error: fetchError } = await supabase
      .from('daily_reports')
      .select('id')
      .eq('studentId', studentId)
      .eq('date', dateStr)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result

    if (existingReport) {
      // Actualizar reporte existente
      const { data, error: updateError } = await supabase
        .from('daily_reports')
        .update({
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
          "updatedAt": new Date().toISOString()
        })
        .eq('id', existingReport.id)
        .select()
        .single()

      if (updateError) throw updateError
      result = data
    } else {
      // Crear nuevo reporte
      const { data, error: insertError } = await supabase
        .from('daily_reports')
        .insert({
          studentId,
          mood: mood || 'happy',
          lunchIntake: lunchIntake || 'all',
          hadNap: hadNap || false,
          diaperChanged: diaperChanged || false,
          diaperNotes: diaperNotes || null,
          medicationGiven: medicationGiven || false,
          medicationName: medicationName || null,
          medicationNotes: medicationNotes || null,
          dailyAchievements: dailyAchievements || null,
          generalNotes: generalNotes || null,
          date: dateStr // Guardar el string "YYYY-MM-DD" directamente
        })
        .select()
        .single()

      if (insertError) throw insertError
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error guardando reporte diario:', error)
    return NextResponse.json(
      { error: 'Error al guardar reporte diario' },
      { status: 500 }
    )
  }
}
