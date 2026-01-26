import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campusId')
    const groupId = searchParams.get('groupId')

    // Obtener estudiantes según filtros
    let studentsQuery = supabase.from('students').select('*')
    if (campusId) studentsQuery = studentsQuery.eq('campusId', campusId)
    if (groupId) studentsQuery = studentsQuery.eq('groupId', groupId)

    const { data: students } = await studentsQuery

    // Obtener reportes
    const { data: reports } = await supabase.from('daily_reports').select('*')

    // Calcular métricas básicas
    const metrics = {
      summary: {
        totalStudents: students?.length || 0,
        totalReports: reports?.length || 0
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    )
  }
}
