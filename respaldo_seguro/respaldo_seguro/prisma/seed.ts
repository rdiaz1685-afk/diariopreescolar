import { db } from '@/lib/db'

async function seed() {
  console.log('🌱 Seeding database...')

  // Crear campuses
  const campuses = await Promise.all([
    db.campus.create({
      data: {
        name: 'Mitras',
        code: 'MITRAS',
        address: 'Av. Mitras, Monterrey',
        phone: '+52811234567'
      }
    }),
    db.campus.create({
      data: {
        name: 'Cumbres',
        code: 'CUMBRES',
        address: 'Av. Cumbres, Monterrey',
        phone: '+5281987654'
      }
    }),
    db.campus.create({
      data: {
        name: 'Norte',
        code: 'NORTE',
        address: 'Av. Norte, Monterrey',
        phone: '+5281345678'
      }
    }),
    db.campus.create({
      data: {
        name: 'Dominio',
        code: 'DOMINIO',
        address: 'Av. Dominio, Monterrey',
        phone: '+5181234567'
      }
    }),
    db.campus.create({
      data: {
        name: 'Anahuac',
        code: 'ANAHUAC',
        address: 'Av. Anahuac, Monterrey',
        phone: '+5189876543'
      }
    })
  ])

  console.log('✅ Created 5 campuses')

  // Crear grupos para cada campus
  const levels = ['toddlers', 'prenursery', 'preescolar']
  const groupNames = {
    toddlers: 'Toddlers',
    prenursery: 'Prenursery',
    preescolar: 'Preescolar'
  }

  for (const campus of campuses) {
    for (const level of levels) {
      await db.group.create({
        data: {
          name: groupNames[level],
          level,
          campusId: campus.id
        }
      })
    }
    console.log(`✅ Created 3 groups for ${campus.name}`)
  }

  // Crear usuarios de ejemplo
  await Promise.all([
    // Rector
    db.user.create({
      data: {
        name: 'Dr. Carlos Rector',
        email: 'rector@escuelas.com',
        password: 'hashed_password',
        role: 'rector'
      }
    }),
    // Vicerrectora
    db.user.create({
      data: {
        name: 'Dra. Ana Vicerrectora',
        email: 'vicerrectora@escuelas.com',
        password: 'hashed_password',
        role: 'vicerrector'
      }
    }),
    // Directoras de cada campus
    ...campuses.map(campus =>
      db.user.create({
        data: {
          name: `Directora ${campus.name}`,
          email: `directora.${campus.code.toLowerCase()}@escuelas.com`,
          password: 'hashed_password',
          role: 'directora',
          campusId: campus.id
        }
      })
    ),
    // Maestras de ejemplo
    db.user.create({
      data: {
        name: 'Maestra Sofía',
        email: 'maestra.sofia@escuelas.com',
        password: 'hashed_password',
        role: 'maestra',
        campusId: campuses[0].id
      }
    }),
    db.user.create({
      data: {
        name: 'Maestra María',
        email: 'maestra.maria@escuelas.com',
        password: 'hashed_password',
        role: 'maestra',
        campusId: campuses[1].id
      }
    })
  ])

  console.log('✅ Created users (rector, vicerrector, directoras, maestras)')

  // Crear estudiantes distribuidos entre campuses y grupos
  const allGroups = await db.group.findMany()
  const studentNames = [
    { name: 'Sofía', lastName: 'García' },
    { name: 'Mateo', lastName: 'López' },
    { name: 'Valentina', lastName: 'Martínez' },
    { name: 'Leonardo', lastName: 'Hernández' },
    { name: 'Isabella', lastName: 'Sánchez' },
    { name: 'Santiago', lastName: 'Ramírez' },
    { name: 'Camila', lastName: 'Torres' },
    { name: 'Sebastián', lastName: 'Flores' },
    { name: 'Valeria', lastName: 'Rojas' },
    { name: 'Emiliano', lastName: 'Mendoza' }
  ]

  let studentIndex = 0
  for (const group of allGroups) {
    // Asignar 2-3 estudiantes por grupo
    const studentsPerGroup = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < studentsPerGroup && studentIndex < studentNames.length; i++) {
      const studentData = studentNames[studentIndex % studentNames.length]
      await db.student.create({
        data: {
          name: studentData.name,
          lastName: `${studentData.lastName} ${group.name}`,
          dateOfBirth: new Date('2020-05-15'),
          gender: Math.random() > 0.5 ? 'M' : 'F',
          emergencyContact: 'Padre',
          emergencyPhone: '5551234567',
          parentEmail: `${studentData.name.toLowerCase()}.${studentData.lastName.toLowerCase()}@email.com`,
          parentPhone: '5551234567',
          medicalNotes: Math.random() > 0.8 ? 'Alergia leve' : null,
          campusId: group.campusId,
          groupId: group.id
        }
      })
      studentIndex++
    }
  }

  console.log('✅ Created students distributed across all campuses and groups')

  // Crear algunos reportes de ejemplo para las métricas
  const students = await db.student.findMany({ take: 20 })
  const today = new Date()
  const moods = ['happy', 'thoughtful', 'sad', 'angry']
  const lunchIntakes = ['all', 'half', 'none']

  for (const student of students) {
    // Crear reportes para los últimos 5 días
    for (let day = 0; day < 5; day++) {
      const reportDate = new Date(today)
      reportDate.setDate(today.getDate() - day)

      await db.dailyReport.create({
        data: {
          studentId: student.id,
          date: reportDate,
          mood: moods[Math.floor(Math.random() * moods.length)],
          lunchIntake: lunchIntakes[Math.floor(Math.random() * lunchIntakes.length)],
          hadNap: Math.random() > 0.3,
          usedBathroom: Math.random() > 0.2,
          diaperChanged: Math.random() > 0.5,
          medicationGiven: Math.random() > 0.9,
          isComplete: true
        }
      })
    }
  }

  console.log('✅ Created sample daily reports for metrics')

  console.log('🎉 Seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`  - Campuses: ${campuses.length}`)
  console.log(`  - Groups: ${allGroups.length}`)
  console.log(`  - Students: ${students.length}`)
  console.log(`  - Reports: ${await db.dailyReport.count()}`)
}

seed()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
