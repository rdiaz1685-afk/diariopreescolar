const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAdmin() {
    const email = 'rafael.diaz@cambridgemty.edu.mx'
    const password = 'password123'
    const name = 'Rafael Diaz'

    console.log(`Intentando crear cuenta administrativa para: ${email}...`)

    // 1. Crear en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: 'rector' }
    })

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('El usuario ya existe en Auth. Actualizando perfil...')
            // Si ya existe, buscamos su ID
            const { data: userData } = await supabaseAdmin.auth.admin.listUsers()
            const user = userData.users.find(u => u.email === email)
            if (user) await updateProfile(user.id, name, email)
        } else {
            console.error('Error en Auth:', authError.message)
        }
        return
    }

    await updateProfile(authData.user.id, name, email)
}

async function updateProfile(userId, name, email) {
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

    if (profileError) {
        console.error('Error en Perfil:', profileError.message)
    } else {
        console.log('✅ ¡Cuenta administrativa lista!')
        console.log(`Usuario: ${email}`)
        console.log(`Contraseña: password123`)
    }
}

createAdmin()
