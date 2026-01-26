import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    console.log('=== Actualizando estudiante Supabase ===')
    console.log('ID:', id)

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

    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedStudent)
  } catch (error: any) {
    console.error('❌ Error actualizando estudiante:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estudiante', details: error.message },
      { status: 500 }
    )
  }
}
