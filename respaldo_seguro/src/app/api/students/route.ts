import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let students
    if (search && search.length >= 2) {
      // Buscar por nombre o apellido (SQLite es case-insensitive por defecto con contains)
      students = await db.student.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { lastName: { contains: search } }
          ]
        },
        orderBy: { name: 'asc' }
      })
    } else {
      // Retornar todos si no hay búsqueda
      students = await db.student.findMany({
        orderBy: { name: 'asc' }
      })
    }

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
    const body = await request.json()

    console.log('=== Creando estudiante ===')
    console.log('Body recibido:', JSON.stringify(body, null, 2))

    // Validar campos requeridos
    if (!body.name || !body.lastName || !body.dateOfBirth || !body.gender) {
      console.log('❌ Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Nombre, apellido, fecha de nacimiento y género son requeridos' },
        { status: 400 }
      )
    }

    if (!body.campusId || !body.groupId) {
      console.log('❌ Faltan campusId o groupId')
      return NextResponse.json(
        { error: 'Campus y Grupo son requeridos' },
        { status: 400 }
      )
    }

    console.log('✅ Validación pasada, creando estudiante...')

    const student = await db.student.create({
      data: {
        name: body.name,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        campusId: body.campusId,
        groupId: body.groupId,
        emergencyContact: body.emergencyContact || '',
        emergencyPhone: body.emergencyPhone || '',
        parentEmail: body.parentEmail || '',
        parentPhone: body.parentPhone || '',
        medicalNotes: body.medicalNotes
      }
    })

    console.log('✅ Estudiante creado:', student.id)

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando estudiante:', error)
    return NextResponse.json(
      { error: 'Error creating student' },
      { status: 500 }
    )
  }
}
