const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedTeacher() {
    const email = 'maestra@ejemplo.com'
    const password = 'password123'

    // Login to get the session/id
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (loginError) {
        console.log('No se pudo iniciar sesión, intentando registro...')
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name: 'Maestra Lupita', role: 'maestra' } }
        })
        if (signUpError) {
            console.error('Error en registro:', signUpError.message)
            return
        }
        await processProfile(signUpData.user.id, email)
    } else {
        await processProfile(loginData.user.id, email)
    }
}

async function processProfile(userId, email) {
    const { data: campuses } = await supabase.from('campuses').select('id').limit(1)
    const { data: groups } = await supabase.from('groups').select('id').limit(1)

    if (campuses && groups) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                name: 'Maestra Lupita',
                email: email,
                role: 'maestra',
                "campusId": campuses[0].id,
                "groupId": groups[0].id
            })

        if (profileError) console.error('Error al crear perfil:', profileError)
        else console.log('✅ Perfil de maestra creado y vinculado.')
    }
}

seedTeacher()
