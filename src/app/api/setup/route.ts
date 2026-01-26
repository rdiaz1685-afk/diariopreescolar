import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true })
    const { count: campusCount } = await supabase.from('campuses').select('*', { count: 'exact', head: true })
    const { count: groupCount } = await supabase.from('groups').select('*', { count: 'exact', head: true })

    const stats = {
      campuses: campusCount,
      groups: groupCount,
      students: studentCount
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos Supabase activa',
      stats
    })
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error)
    return NextResponse.json({ error: 'Error al verificar base de datos' }, { status: 500 })
  }
}
