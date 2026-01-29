import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Faltan variables de entorno de Supabase.')
    process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const prisma = new PrismaClient()

async function main() {
    const teachers = [
        { email: 'maestra.mitras@ejemplo.com', campusCode: 'MITRAS', campusName: 'Mitras', name: 'Maestra Mitras' },
        { email: 'maestra.cumbres@ejemplo.com', campusCode: 'CUMBRES', campusName: 'Cumbres', name: 'Maestra Cumbres' },
        { email: 'maestra.norte@ejemplo.com', campusCode: 'NORTE', campusName: 'Norte', name: 'Maestra Norte' },
        { email: 'maestradominio@ejemplo.com', campusCode: 'DOMINIO', campusName: 'Dominio', name: 'Maestra Dominio' },
        { email: 'maestra.anahuac@ejemplo.com', campusCode: 'ANAHUAC', campusName: 'Anahuac', name: 'Maestra Anahuac' },
    ]

    const genericPassword = 'password123'

    // Obtener todos los usuarios de Auth para buscar IDs
    const { data: { users: authUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    for (const t of teachers) {
        console.log(`\nProcessing ${t.email}...`)

        let campus = await prisma.campus.findUnique({ where: { code: t.campusCode } })
        if (!campus) {
            campus = await prisma.campus.create({ data: { name: t.campusName, code: t.campusCode } })
            console.log(`  Created campus in Prisma: ${t.campusName}`)
        }

        let group = await prisma.group.findFirst({ where: { campusId: campus.id, name: 'Grupo de Prueba' } })
        if (!group) {
            group = await prisma.group.create({
                data: { name: 'Grupo de Prueba', level: 'preescolar', campusId: campus.id }
            })
            console.log(`  Created group in Prisma for ${t.campusName}`)
        }

        let userId = authUsers.find(u => u.email === t.email)?.id

        if (!userId) {
            console.log(`  Creating user in Supabase Auth...`)
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: t.email,
                password: genericPassword,
                email_confirm: true,
                user_metadata: { name: t.name, role: 'maestra' }
            })

            if (authError) {
                console.error(`  Error creating auth: ${authError.message}`)
                continue
            }
            userId = authData.user.id
        } else {
            console.log(`  User already in Auth. ID: ${userId}`)
        }

        await createProfileAndStudents(userId, t, campus.id, group.id)
    }
}

async function createProfileAndStudents(userId: string, t: any, campusId: string, groupId: string) {
    console.log(`  Upserting profile in Supabase table...`)
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            name: t.name,
            email: t.email,
            role: 'maestra',
            campusId: campusId,
            groupId: groupId
        })

    if (profileError) {
        console.error(`  Error in Supabase profile: ${profileError.message}`)
    } else {
        console.log(`  Supabase profile ready.`)
    }

    for (let i = 1; i <= 5; i++) {
        const sName = `Alumno ${i}`
        const sLastName = t.campusName
        const existingS = await prisma.student.findFirst({
            where: { name: sName, lastName: sLastName, groupId: groupId }
        })

        if (!existingS) {
            await prisma.student.create({
                data: {
                    name: sName,
                    lastName: sLastName,
                    dateOfBirth: new Date('2020-01-01'),
                    gender: i % 2 === 0 ? 'M' : 'F',
                    emergencyContact: 'Contacto',
                    emergencyPhone: '123456',
                    parentEmail: `padre${i}.${t.campusCode.toLowerCase()}@ejemplo.com`,
                    parentPhone: '123456',
                    campusId: campusId,
                    groupId: groupId
                }
            })
        }
    }
    console.log(`  5 students verified/created in Prisma Group.`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
