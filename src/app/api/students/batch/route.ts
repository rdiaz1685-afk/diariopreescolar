import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('=== Carga masiva de estudiantes (Supabase) ===')
    console.log('Body recibido:', JSON.stringify(body, null, 2))

    const { students } = body

    // Validar que se proporcionaron estudiantes
    if (!students || !Array.isArray(students) || students.length === 0) {
      console.log('❌ Validación fallida: no hay estudiantes')
      return NextResponse.json(
        { error: 'Se requiere un array de estudiantes' },
        { status: 400 }
      )
    }

    console.log(`✅ ${students.length} estudiantes para crear`)

    // Validar cada estudiante
    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      if (!student.name || !student.lastName || !student.dateOfBirth || !student.gender) {
        console.log(`❌ Estudiante ${i} inválido:`, student)
        return NextResponse.json(
          { error: `El estudiante ${i + 1} no tiene nombre, apellido, fecha de nacimiento o género` },
          { status: 400 }
        )
      }
    }

    console.log('✅ Todos los estudiantes válidos')

    // Preparar estudiantes para Supabase
    const studentsToCreate = students.map(student => {
      return {
        name: student.name,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth, // Supabase espera string YYYY-MM-DD
        gender: student.gender,
        campusId: student.campusId || null,
        groupId: student.groupId || null,
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        medicalNotes: student.medicalNotes || ''
      }
    })

    console.log('📦 Datos a insertar en Supabase (primeros 2):', JSON.stringify(studentsToCreate.slice(0, 2), null, 2))

    const { data, error } = await supabase
      .from('students')
      .insert(studentsToCreate)
      .select()

    if (error) {
      console.error('❌ Error de Supabase:', error)
      throw error
    }

    const count = data ? data.length : 0
    console.log('✅ Estudiantes creados:', count)

    return NextResponse.json({
      success: true,
      count: count,
      message: `${count} estudiantes creados exitosamente`
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando estudiantes:', error)
    return NextResponse.json(
      { error: 'Error al crear estudiantes', details: String(error) },
      { status: 500 }
    )
  }
}
