import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

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
    const body: RegisterRequest = await request.json()

    console.log('=== Registro de usuario ===')
    console.log('Email:', body.email)
    console.log('Nombre:', body.name)
    console.log('Rol:', body.role)

    // Verificar si el email ya existe
    const existingUser = await db.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      console.log('❌ Email ya registrado')
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hashear password usando crypto
    const hash = crypto
      .createHash('sha256')
      .update(body.password)
      .digest('hex')

    console.log('✅ Password hasheado')

    // Crear usuario
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hash,
        role: body.role,
        campusId: body.campusId,
        groupId: body.groupId
      }
    })

    console.log('✅ Usuario creado:', user.id)

    // Crear token simple
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      campusId: user.campusId,
      groupId: user.groupId
    })).toString('base64')

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      campusId: user.campusId,
      groupId: user.groupId,
      token
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error en registro:', error)
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}
