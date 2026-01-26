import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const id = (await params).id
    const body = await request.json()

    console.log(`=== Actualizando reporte diario ${id} (Supabase) ===`)

    const { data: report, error } = await supabase
      .from('daily_reports')
      .update(body)
      .eq('id', id)
      .select('*, students(*)')
      .single()

    if (error) {
      console.error('❌ Error de Supabase:', error)
      throw error
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('❌ Error updating daily report:', error)
    return NextResponse.json(
      { error: 'Error updating daily report', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const id = (await params).id

    console.log(`=== Eliminando reporte diario ${id} (Supabase) ===`)

    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error de Supabase:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting daily report:', error)
    return NextResponse.json(
      { error: 'Error deleting daily report', details: String(error) },
      { status: 500 }
    )
  }
}
