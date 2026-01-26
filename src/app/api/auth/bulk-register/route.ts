import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Usamos la Service Role Key para poder crear usuarios sin confirmación de email
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { teachers } = body // Esperamos un array de maestras

        if (!teachers || !Array.isArray(teachers)) {
            return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
        }

        const results: { email: string; success: boolean; error?: string }[] = []

        for (const teacher of teachers) {
            const { email, password, name, role, campusId, groupId } = teacher

            // 1. Crear usuario en Auth (con email_confirm: true para que entren directo)
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { name, role }
            })

            if (authError) {
                results.push({ email, success: false, error: authError.message })
                continue
            }

            // 2. Crear perfil en la tabla public.profiles
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    name,
                    email,
                    role,
                    campusId,
                    groupId
                })

            if (profileError) {
                // Si falla el perfil, intentamos borrar el auth para no dejar basura
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
                results.push({ email, success: false, error: profileError.message })
            } else {
                results.push({ email, success: true })
            }
        }

        return NextResponse.json({ results })
    } catch (error: any) {
        console.error('Error masivo:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
