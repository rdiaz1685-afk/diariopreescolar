import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // En Next.js 16, params es asíncrono (Promise)
    const { id } = await params
    const body = await request.json()

    console.log('=== Actualizando estudiante ===')
    console.log('ID:', id)
    console.log('Body recibido:', JSON.stringify(body, null, 2))

    // Verificar que el estudiante existe
    const existingStudent = await db.student.findUnique({
      where: { id }
    })

    if (!existingStudent) {
      console.log('❌ Estudiante no encontrado')
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar solo los campos de contacto
    const updateData: any = {}

    if (body.emergencyContact !== undefined) {
      updateData.emergencyContact = body.emergencyContact
    }
    if (body.emergencyPhone !== undefined) {
      updateData.emergencyPhone = body.emergencyPhone
    }
    if (body.parentEmail !== undefined) {
      updateData.parentEmail = body.parentEmail
    }
    if (body.parentPhone !== undefined) {
      updateData.parentPhone = body.parentPhone
    }

    console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2))

    const updatedStudent = await db.student.update({
      where: { id },
      data: updateData
    })

    console.log('✅ Estudiante actualizado:', JSON.stringify(updatedStudent, null, 2))

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('❌ Error actualizando estudiante:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estudiante', details: String(error) },
      { status: 500 }
    )
  }
}
