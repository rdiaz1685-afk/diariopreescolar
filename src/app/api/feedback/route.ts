import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { content, userId, userName, userRole } = await request.json()

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const feedback = await db.feedback.create({
            data: {
                userId: userId || 'anonymous',
                userName: userName || 'Unknown',
                userRole: userRole || 'Unknown',
                content: content.trim(),
                status: 'pending'
            }
        })

        return NextResponse.json({ success: true, data: feedback })
    } catch (error: any) {
        console.error('Feedback API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        // En un entorno real, verificaríamos el token/sesión aquí.
        // Para esta implementación de prueba, permitiremos el acceso
        // pero idealmente deberíamos validar que el usuario sea admin/rector.

        const feedback = await db.feedback.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(feedback)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
