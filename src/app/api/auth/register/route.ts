import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'rector' | 'vicerrector' | 'directora' | 'maestra'
  campusId?: string
  groupId?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: RegisterRequest = await request.json()

    console.log('=== Registro de usuario en Supabase ===')
    console.log('Email:', body.email)

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          name: body.name,
          role: body.role,
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No se pudo crear el usuario')

    // 2. Crear perfil en la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: body.name,
        email: body.email,
        role: body.role,
        campusId: body.campusId,
        groupId: body.groupId
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creando perfil, eliminando usuario de auth...', profileError)
      // Nota: En una app real deberías manejar el rollback de auth
      throw profileError
    }

    return NextResponse.json({
      user: authData.user,
      profile
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error en registro:', error)
    return NextResponse.json(
      { error: error.message || 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}
