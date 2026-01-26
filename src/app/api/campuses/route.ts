import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: campuses, error: campusesError } = await supabase
      .from('campuses')
      .select('*')
      .order('name', { ascending: true })

    if (campusesError) throw campusesError

    // Obtener conteo de estudiantes por campus
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('campusId')

    if (studentsError) throw studentsError

    const campusesWithCount = campuses.map(campus => ({
      ...campus,
      studentCount: students.filter(s => s.campusId === campus.id).length
    }))

    return NextResponse.json(campusesWithCount)
  } catch (error) {
    console.error('Error fetching campuses:', error)
    return NextResponse.json(
      { error: 'Error fetching campuses' },
      { status: 500 }
    )
  }
}
