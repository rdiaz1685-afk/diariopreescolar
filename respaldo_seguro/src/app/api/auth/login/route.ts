import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-in-production'

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    console.log('=== Intento de login ===')
    console.log('Email:', body.email)

    // Buscar usuario por email
    const user = await db.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar password usando crypto (comparación simple)
    // NOTA: En producción, usa bcrypt para mejor seguridad
    const hash = crypto
      .createHash('sha256')
      .update(body.password)
      .digest('hex')

    if (user.password !== hash) {
      console.log('❌ Password incorrecto')
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    console.log('✅ Login exitoso:', user.name)

    // Crear token simple (JWT sin dependencias externas)
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      campusId: user.campusId,
      groupId: user.groupId
    })).toString('base64')

    // Retornar datos del usuario
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      campusId: user.campusId,
      groupId: user.groupId,
      token
    }

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error('❌ Error en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
