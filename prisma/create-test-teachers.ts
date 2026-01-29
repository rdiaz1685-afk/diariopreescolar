import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const teachers = [
        { email: 'maestra.mitras@ejemplo.com', campusCode: 'MITRAS', campusName: 'Mitras', name: 'Maestra Mitras' },
        { email: 'maestra.cumbres@ejemplo.com', campusCode: 'CUMBRES', campusName: 'Cumbres', name: 'Maestra Cumbres' },
        { email: 'maestra.norte@ejemplo.com', campusCode: 'NORTE', campusName: 'Norte', name: 'Maestra Norte' },
        { email: 'maestradominio@ejemplo.com', campusCode: 'DOMINIO', campusName: 'Dominio', name: 'Maestra Dominio' },
        { email: 'maestra.anahuac@ejemplo.com', campusCode: 'ANAHUAC', campusName: 'Anahuac', name: 'Maestra Anahuac' },
    ]

    const passwordHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' // SHA-256 for password123

    for (const t of teachers) {
        console.log(`Processing ${t.email}...`)

        // 1. Find or create Campus
        let campus = await prisma.campus.findUnique({
            where: { code: t.campusCode }
        })

        if (!campus) {
            campus = await prisma.campus.create({
                data: {
                    name: t.campusName,
                    code: t.campusCode
                }
            })
            console.log(`  Created campus: ${t.campusName}`)
        }

        // 2. Find or create Group for this teacher (default to 'Preescolar')
        let group = await prisma.group.findFirst({
            where: { campusId: campus.id, name: 'Grupo de Prueba' }
        })

        if (!group) {
            group = await prisma.group.create({
                data: {
                    name: 'Grupo de Prueba',
                    level: 'preescolar',
                    campusId: campus.id
                }
            })
            console.log(`  Created group: Grupo de Prueba for ${t.campusName}`)
        }

        // 3. Create Teacher User
        const user = await prisma.user.upsert({
            where: { email: t.email },
            update: {
                password: passwordHash,
                campusId: campus.id,
                groupId: group.id,
                role: 'maestra'
            },
            create: {
                name: t.name,
                email: t.email,
                password: passwordHash,
                role: 'maestra',
                campusId: campus.id,
                groupId: group.id
            }
        })
        console.log(`  Teacher user ready: ${t.email}`)

        // 4. Create 5 Students
        for (let i = 1; i <= 5; i++) {
            const studentName = `Alumno ${i}`
            const studentLastName = t.campusName

            // Check if student already exists to avoid duplicates
            const existingStudent = await prisma.student.findFirst({
                where: {
                    name: studentName,
                    lastName: studentLastName,
                    groupId: group.id
                }
            })

            if (!existingStudent) {
                await prisma.student.create({
                    data: {
                        name: studentName,
                        lastName: studentLastName,
                        dateOfBirth: new Date('2020-01-01'),
                        gender: i % 2 === 0 ? 'M' : 'F',
                        emergencyContact: 'Contacto de Emergencia',
                        emergencyPhone: '1234567890',
                        parentEmail: `padre${i}.${t.campusCode.toLowerCase()}@ejemplo.com`,
                        parentPhone: '1234567890',
                        campusId: campus.id,
                        groupId: group.id
                    }
                })
                console.log(`    Created student: ${studentName} ${studentLastName}`)
            } else {
                console.log(`    Student already exists: ${studentName} ${studentLastName}`)
            }
        }
    }

    console.log('✅ All test data created successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
