import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

async function syncStudents() {
    // Definir los grupos que acabamos de crear (necesito sus IDs de Supabase)
    const teachersData = [
        { email: 'maestra.mitras@ejemplo.com', campusName: 'Mitras' },
        { email: 'maestra.cumbres@ejemplo.com', campusName: 'Cumbres' },
        { email: 'maestra.norte@ejemplo.com', campusName: 'Norte' },
        { email: 'maestradominio@ejemplo.com', campusName: 'Dominio' },
        { email: 'maestra.anahuac@ejemplo.com', campusName: 'Anahuac' },
    ]

    for (const t of teachersData) {
        // 1. Obtener Campus y Grupo de Supabase
        const { data: campus } = await supabaseAdmin.from('campuses').select('id').eq('name', t.campusName).single()
        const { data: group } = await supabaseAdmin.from('groups').select('id').eq('name', 'Grupo de Prueba').eq('campusId', campus?.id).single()

        if (!campus || !group) continue

        console.log(`\nSincronizando alumnos para ${t.campusName} (Grupo: ${group.id})`)

        for (let i = 1; i <= 5; i++) {
            const sName = `Alumno ${i}`
            const sLastName = t.campusName

            // 2. Verificar si ya existe el alumno en Supabase
            const { data: existing } = await supabaseAdmin.from('students').select('id').eq('name', sName).eq('lastName', sLastName).eq('groupId', group.id).single()

            if (!existing) {
                console.log(`  Creando ${sName} ${sLastName}...`)
                await supabaseAdmin.from('students').insert({
                    name: sName,
                    lastName: sLastName,
                    dateOfBirth: '2020-01-01',
                    gender: i % 2 === 0 ? 'M' : 'F',
                    campusId: campus.id,
                    groupId: group.id,
                    emergencyContact: 'Contacto',
                    emergencyPhone: '123456',
                    parentEmail: `padre${i}@ejemplo.com`,
                    parentPhone: '123456'
                })
            }
        }
    }
    console.log('\n✅ Todos los alumnos sincronizados en Supabase.')
}

syncStudents().catch(console.error)
