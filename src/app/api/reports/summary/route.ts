import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Obtener perfil del usuario para filtrar automáticamente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, campusId, groupId')
      .eq('id', user.id)
      .single()

    const { searchParams } = new URL(request.url)
    let date = searchParams.get('date')
    if (!date) {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      date = `${y}-${m}-${d}`
    }

    // Si es maestra, usamos su groupId de forma obligatoria
    // Si no es maestra pero se pasa un groupId, lo usamos (para el Rector/Director que quiera ver un grupo específico)
    let effectiveGroupId = searchParams.get('groupId')
    if (profile?.role === 'maestra' && profile.groupId) {
      effectiveGroupId = profile.groupId
    }

    console.log('=== Obteniendo resumen de reportes Supabase ===')
    console.log('Usuario:', user.email, 'Rol:', profile?.role)
    console.log('Fecha:', date)
    console.log('Grupo Efectivo:', effectiveGroupId)
    console.log('Campus Efectivo:', profile?.campusId)

    // Obtener reportes del día
    // NOTA: Para simplificar, buscamos los reportes que coincidan con la fecha ISO YYYY-MM-DD
    let reportsQuery = supabase
      .from('daily_reports')
      .select('*, student:students(id, name, "lastName", "groupId")')
      .eq('date', date)

    if (effectiveGroupId) {
      reportsQuery = reportsQuery.eq('student.groupId', effectiveGroupId)
    } else if (profile?.role === 'directora' && profile.campusId) {
      reportsQuery = reportsQuery.eq('student.campusId', profile.campusId)
    }

    const { data: reports, error: reportsError } = await reportsQuery

    if (reportsError) throw reportsError

    // Obtener todos los estudiantes del grupo para saber quiénes faltan
    let studentsQuery = supabase
      .from('students')
      .select('id, name, "lastName", "groupId"')
      .order('name', { ascending: true })

    if (effectiveGroupId) {
      studentsQuery = studentsQuery.eq('groupId', effectiveGroupId)
    } else if (profile?.role === 'directora' && profile.campusId) {
      studentsQuery = studentsQuery.eq('campusId', profile.campusId)
    }

    const { data: allStudents, error: studentsError } = await studentsQuery

    if (studentsError) throw studentsError

    // Agrupar reportes por estudiante
    const reportsByStudent = new Map()
    reports?.forEach((report: any) => {
      const studentId = report.studentId
      if (!reportsByStudent.has(studentId)) {
        reportsByStudent.set(studentId, {
          studentId,
          studentName: report.student?.name || 'N/A',
          studentLastName: report.student?.lastName || '',
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

    // Crear mapa final con todos los estudiantes
    const allStudentsMap = new Map()
    allStudents?.forEach((student: any) => {
      const studentId = student.id
      const studentReport = reportsByStudent.get(studentId) || {
        studentId,
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

      allStudentsMap.set(studentId, studentReport)
    })

    const studentSummaries = Array.from(allStudentsMap.values())

    // Estadísticas
    const totalStudents = studentSummaries.length
    const completeStudents = studentSummaries.filter(s => s.isComplete).length
    const incompleteStudents = totalStudents - completeStudents

    const summary = {
      date,
      groupId: effectiveGroupId,
      totalStudents,
      completeStudents,
      incompleteStudents,
      withMood: studentSummaries.filter(s => s.hasMood).length,
      withLunch: studentSummaries.filter(s => s.hasLunch).length,
      withNap: studentSummaries.filter(s => s.hasNap).length,
      withDiaperChanged: studentSummaries.filter(s => s.hasDiaperChanged).length,
      withMeds: studentSummaries.filter(s => s.hasMeds).length,
      withAchievements: studentSummaries.filter(s => s.hasAchievements).length,
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
