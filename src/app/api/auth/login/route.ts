import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()

    console.log('=== Intento de login (Supabase) ===')
    console.log('Email:', email)

    // 1. Iniciar sesión con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message)
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // 2. Obtener el perfil del usuario para tener los metadatos (campus, grupo, rol)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.log('❌ Perfil no encontrado para el usuario autenticado')
      return NextResponse.json(
        { error: 'El perfil de usuario no existe en la base de datos' },
        { status: 404 }
      )
    }

    console.log('✅ Login exitoso:', profile.name)

    // Crear un token compatible con el formato actual (base64 de datos relevantes)
    // Nota: El login de Supabase ya gestiona la sesión mediante cookies, 
    // pero mantenemos el retorno de datos para compatibilidad con el frontend.
    const token = Buffer.from(JSON.stringify({
      userId: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      campusId: profile.campusId,
      groupId: profile.groupId
    })).toString('base64')

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      campusId: profile.campusId,
      groupId: profile.groupId,
      token
    })

  } catch (error) {
    console.error('❌ Error general en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
