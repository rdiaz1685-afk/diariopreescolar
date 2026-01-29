import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

async function setupSupabase() {
    const teachersData = [
        { email: 'maestra.mitras@ejemplo.com', campusName: 'Mitras', campusCode: 'MITRAS', name: 'Maestra Mitras' },
        { email: 'maestra.cumbres@ejemplo.com', campusName: 'Cumbres', campusCode: 'CUMBRES', name: 'Maestra Cumbres' },
        { email: 'maestra.norte@ejemplo.com', campusName: 'Norte', campusCode: 'NORTE', name: 'Maestra Norte' },
        { email: 'maestradominio@ejemplo.com', campusName: 'Dominio', campusCode: 'DOMINIO', name: 'Maestra Dominio' },
        { email: 'maestra.anahuac@ejemplo.com', campusName: 'Anahuac', campusCode: 'ANAHUAC', name: 'Maestra Anahuac' },
    ]

    const password = 'password123'

    for (const t of teachersData) {
        console.log(`\n--- Configurando ${t.email} ---`)

        // 1. Asegurar Campus
        let { data: campus } = await supabaseAdmin.from('campuses').select('id').eq('name', t.campusName).single()
        if (!campus) {
            console.log(`  Creando campus ${t.campusName} (${t.campusCode})...`)
            const { data: newCampus, error: cErr } = await supabaseAdmin.from('campuses').insert({ name: t.campusName, code: t.campusCode }).select().single()
            if (cErr) { console.error('  Error campus:', cErr.message); continue; }
            campus = newCampus
        }
        console.log(`  Campus ID: ${campus.id}`)

        // 2. Asegurar Grupo
        let { data: group } = await supabaseAdmin.from('groups').select('id').eq('name', 'Grupo de Prueba').eq('campusId', campus.id).single()
        if (!group) {
            console.log(`  Creando grupo de prueba...`)
            const { data: newGroup, error: gErr } = await supabaseAdmin.from('groups').insert({ name: 'Grupo de Prueba', campusId: campus.id, level: 'preescolar' }).select().single()
            if (gErr) { console.error('  Error grupo:', gErr.message); continue; }
            group = newGroup
        }
        console.log(`  Group ID: ${group.id}`)

        // 3. Crear/Resetear Auth
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        let authUser = users.find(u => u.email === t.email)

        if (!authUser) {
            console.log(`  Creando usuario Auth...`)
            const { data: nAuth, error: aErr } = await supabaseAdmin.auth.admin.createUser({
                email: t.email,
                password: password,
                email_confirm: true,
                user_metadata: { name: t.name, role: 'maestra' }
            })
            if (aErr) { console.error('  Error auth:', aErr.message); continue; }
            authUser = nAuth.user
        } else {
            console.log(`  Usuario ya existe en Auth. Reseteando password...`)
            await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password: password })
        }

        // 4. Asegurar Perfil
        console.log(`  Actualizando perfil...`)
        const { error: pErr } = await supabaseAdmin.from('profiles').upsert({
            id: authUser.id,
            name: t.name,
            email: t.email,
            role: 'maestra',
            campusId: campus.id,
            groupId: group.id
        })
        if (pErr) console.error('  Error perfil:', pErr.message)
        else console.log(`  ✅ ${t.email} listo!`)
    }
}

setupSupabase().catch(console.error)
