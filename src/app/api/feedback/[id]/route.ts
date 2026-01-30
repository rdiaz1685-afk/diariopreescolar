import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const id = (await params).id

        console.log(`=== Eliminando sugerencia ${id} (Supabase) ===`)

        const { error } = await supabase
            .from('feedback')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('❌ Error de Supabase:', error)
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('❌ Error deleting feedback:', error)
        return NextResponse.json(
            { error: 'Error deleting feedback', details: String(error) },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const id = (await params).id
        const body = await request.json()

        console.log(`=== Actualizando sugerencia ${id} (Supabase) ===`)

        const { data, error } = await supabase
            .from('feedback')
            .update(body)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('❌ Error updating feedback:', error)
        return NextResponse.json(
            { error: 'Error updating feedback' },
            { status: 500 }
        )
    }
}
