import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const groupId = searchParams.get('groupId')

    console.log('=== Diagnóstico del sistema Supabase ===')

    // 1. Obtener todos los estudiantes
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select('id, name, "lastName", "groupId"')

    if (studentsError) throw studentsError

    // 2. Obtener reportes del día
    let reportsQuery = supabase
      .from('daily_reports')
      .select('*')
      .gte('date', `${date}T00:00:00`)
      .lte('date', `${date}T23:59:59`)

    const { data: reports, error: reportsError } = await reportsQuery

    if (reportsError) throw reportsError

    // 3. Procesar resultados
    const reportMap = new Map()
    reports?.forEach(report => {
      reportMap.set(report.studentId, {
        hasMood: !!report.mood,
        hasLunch: !!report.lunchIntake,
        isComplete: !!(report.mood && report.lunchIntake)
      })
    })

    const diagnostics = {
      timestamp: new Date().toISOString(),
      totalStudents: allStudents.length,
      reportCount: reports.length,
      requestedDate: date,
      groupId
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
