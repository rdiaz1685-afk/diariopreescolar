import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('=== Creando estudiante (Supabase) ===')
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
      medicalNotes,
      campusId,
      groupId
    } = body

    // Validar campos requeridos
    if (!name || !lastName || !dateOfBirth || !gender) {
      console.log('❌ Validación fallida: faltan campos requeridos')
      return NextResponse.json(
        { error: 'Nombre, apellido, fecha de nacimiento y género son requeridos' },
        { status: 400 }
      )
    }

    if (!campusId) {
      console.log('❌ Validación fallida: faltan campusId')
      return NextResponse.json(
        { error: 'El campus es requerido' },
        { status: 400 }
      )
    }

    if (!groupId) {
      console.log('❌ Validación fallida: faltan groupId')
      return NextResponse.json(
        { error: 'El grupo es requerido' },
        { status: 400 }
      )
    }

    console.log('✅ Validación pasada')

    // Preparar datos para Supabase
    // Nota: Asegurarse de que los nombres de las columnas coincidan con los de Supabase
    const studentData = {
      name,
      lastName,
      dateOfBirth, // Supabase espera string YYYY-MM-DD para columnas de fecha
      gender,
      campusId,
      groupId,
      emergencyContact: emergencyContact || '',
      emergencyPhone: emergencyPhone || '',
      parentEmail: parentEmail || '',
      parentPhone: parentPhone || '',
      medicalNotes: medicalNotes || ''
    }

    console.log('📦 Datos a insertar en Supabase:', JSON.stringify(studentData, null, 2))

    const { data: student, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error de Supabase:', error)
      throw error
    }

    console.log('✅ Estudiante creado:', JSON.stringify(student, null, 2))

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando estudiante:', error)
    
    let errorMessage = 'Error al crear estudiante'
    let errorDetails = String(error)
    
    if (error && typeof error === 'object' && 'message' in error) {
      errorDetails = (error as any).message
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        message: 'Por favor verifica la conexión con la base de datos'
      },
      { status: 500 }
    )
  }
}
