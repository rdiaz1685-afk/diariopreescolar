import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const email = 'rafael.diaz@cambridgemty.edu.mx'
        const password = 'password123'
        const name = 'Rafael Diaz'

        console.log(`🚀 Iniciando creación forzada de admin para: ${email}`)

        // 1. Intentar crear o actualizar el usuario en Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role: 'rector' }
        })

        let userId = ''

        if (authError) {
            if (authError.message.includes('already registered')) {
                // Si ya existe, obtenemos el ID para forzar el perfil
                const { data: users } = await supabaseAdmin.auth.admin.listUsers()
                const existingUser = users.users.find(u => u.email === email)
                if (existingUser) {
                    userId = existingUser.id
                    // Forzar cambio de contraseña para asegurar que sea password123
                    await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true })
                }
            } else {
                throw authError
            }
        } else {
            userId = authData.user.id
        }

        // 2. Asegurar que tenga perfil de rector
        const { data: campus } = await supabaseAdmin.from('campuses').select('id').limit(1).single()

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                name,
                email,
                role: 'rector',
                campusId: campus?.id
            })

        if (profileError) throw profileError

        return NextResponse.json({
            success: true,
            message: '¡Admin creado/actualizado exitosamente!',
            user: email,
            role: 'rector',
            hint: 'Ya puedes cerrar esta pestaña e iniciar sesión en /login'
        })

    } catch (error: any) {
        console.error('❌ Error en setup admin:', error)
        return NextResponse.json({
            error: error.message,
            tip: 'Verifica que las variables de entorno estén bien configuradas en Vercel'
        }, { status: 500 })
    }
}
