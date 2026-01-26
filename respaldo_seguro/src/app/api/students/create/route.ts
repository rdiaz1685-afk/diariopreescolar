import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('=== Creando estudiante ===')
    console.log('Body recibido:', JSON.stringify(body, null, 2))

    const {
      name,
      lastName,
      dateOfBirth,
      gender,
      emergencyContact,
      emergencyPhone,
      parentEmail,
      parentPhone,
      medicalNotes
    } = body

    // Validar campos requeridos
    if (!name || !lastName || !dateOfBirth || !gender) {
      console.log('❌ Validación fallida: faltan campos requeridos')
      return NextResponse.json(
        { error: 'Nombre, apellido, fecha de nacimiento y género son requeridos' },
        { status: 400 }
      )
    }

    if (!body.campusId) {
      console.log('❌ Validación fallida: faltan campusId')
      return NextResponse.json(
        { error: 'El campus es requerido' },
        { status: 400 }
      )
    }

    if (!body.groupId) {
      console.log('❌ Validación fallida: faltan groupId')
      return NextResponse.json(
        { error: 'El grupo es requerido' },
        { status: 400 }
      )
    }

    console.log('✅ Validación pasada')

    // Crear estudiante - campusId y groupId son obligatorios
    const studentData: any = {
      name,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      campusId: body.campusId,
      groupId: body.groupId
    }

    // Campos opcionales - usar cadenas vacías si no se proporcionan
    studentData.emergencyContact = emergencyContact || ''
    studentData.emergencyPhone = emergencyPhone || ''
    studentData.parentEmail = parentEmail || ''
    studentData.parentPhone = parentPhone || ''

    // Agregar notas médicas si existen
    if (medicalNotes) {
      studentData.medicalNotes = medicalNotes
    }

    console.log('📦 Datos a crear:', JSON.stringify(studentData, null, 2))

    const student = await db.student.create({
      data: studentData
    })

    console.log('✅ Estudiante creado:', JSON.stringify(student, null, 2))

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando estudiante:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Extract more detailed error info
    let errorDetails = String(error)
    if (error instanceof Error) {
      errorDetails = `${error.name}: ${error.message}`
    }

    return NextResponse.json(
      {
        error: 'Error al crear estudiante',
        details: errorDetails,
        message: 'Por favor verifica que todos los campos estén completos'
      },
      { status: 500 }
    )
  }
}
