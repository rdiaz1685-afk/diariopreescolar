import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campusId')

    let query = supabase
      .from('groups')
      .select('*, campus:campuses(name)')
      .order('name', { ascending: true })

    if (campusId) {
      query = query.eq('campusId', campusId)
    }

    const { data: groups, error: groupsError } = await query

    if (groupsError) throw groupsError

    // Obtener conteo de estudiantes por grupo
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('groupId')

    if (studentsError) throw studentsError

    const groupsWithCount = groups.map(group => ({
      ...group,
      studentCount: students.filter(s => s.groupId === group.id).length
    }))

    return NextResponse.json(groupsWithCount)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Error fetching groups' },
      { status: 500 }
    )
  }
}
