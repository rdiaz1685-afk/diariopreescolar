import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('=== Carga masiva de estudiantes ===')
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

    // Crear estudiantes en lote
    const studentsToCreate = students.map(student => {
      const data: any = {
        name: student.name,
        lastName: student.lastName,
        dateOfBirth: new Date(student.dateOfBirth),
        gender: student.gender
      }

      // Agregar campos opcionales
      if (student.campusId) {
        data.campusId = student.campusId
      }
      if (student.groupId) {
        data.groupId = student.groupId
      }
      if (student.emergencyContact) {
        data.emergencyContact = student.emergencyContact
      }
      if (student.emergencyPhone) {
        data.emergencyPhone = student.emergencyPhone
      }
      if (student.parentEmail) {
        data.parentEmail = student.parentEmail
      }
      if (student.parentPhone) {
        data.parentPhone = student.parentPhone
      }
      if (student.medicalNotes) {
        data.medicalNotes = student.medicalNotes
      }

      return data
    })

    console.log('📦 Datos a crear:', JSON.stringify(studentsToCreate.slice(0, 2), null, 2))

    const result = await db.student.createMany({
      data: studentsToCreate
    })

    console.log('✅ Estudiantes creados:', result.count)

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} estudiantes creados exitosamente`
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando estudiantes:', error)
    return NextResponse.json(
      { error: 'Error al crear estudiantes', details: String(error) },
      { status: 500 }
    )
  }
}
