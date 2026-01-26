import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Obtener el perfil del usuario actual para filtrar por grupo/campus
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
    const search = searchParams.get('search')

    let query = supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true })

    // Filtrado por jerarquía
    if (profile?.role === 'maestra' && profile.groupId) {
      query = query.eq('groupId', profile.groupId)
    } else if (profile?.role === 'directora' && profile.campusId) {
      query = query.eq('campusId', profile.campusId)
    }
    // Rector y Vicerrector ven todos (no filtramos)

    if (search && search.length >= 2) {
      // Usar comillas para las columnas con camelCase
      query = query.or(`name.ilike.%${search}%,"lastName".ilike.%${search}%`)
    }

    const { data: students, error } = await query

    if (error) throw error

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Error fetching students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('=== Creando estudiante ===')
    console.log('Body recibido:', JSON.stringify(body, null, 2))

    // Validar campos requeridos
    if (!body.name || !body.lastName || !body.dateOfBirth || !body.gender) {
      return NextResponse.json(
        { error: 'Nombre, apellido, fecha de nacimiento y género son requeridos' },
        { status: 400 }
      )
    }

    if (!body.campusId || !body.groupId) {
      return NextResponse.json(
        { error: 'Campus y Grupo son requeridos' },
        { status: 400 }
      )
    }

    const { data: student, error } = await supabase
      .from('students')
      .insert({
        name: body.name,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        campusId: body.campusId,
        groupId: body.groupId,
        emergencyContact: body.emergencyContact || '',
        emergencyPhone: body.emergencyPhone || '',
        parentEmail: body.parentEmail || '',
        parentPhone: body.parentPhone || '',
        medicalNotes: body.medicalNotes
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando estudiante:', error)
    return NextResponse.json(
      { error: 'Error creating student' },
      { status: 500 }
    )
  }
}
