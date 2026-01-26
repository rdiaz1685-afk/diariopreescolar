import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando carga de datos de prueba...')

  // Crear campus
  const mitras = await prisma.campus.upsert({
    where: { code: 'MITRAS' },
    update: {},
    create: {
      name: 'Mitras',
      code: 'MITRAS'
    }
  })

  const cumbres = await prisma.campus.upsert({
    where: { code: 'CUMBRES' },
    update: {},
    create: {
      name: 'Cumbres',
      code: 'CUMBRES'
    }
  })

  const norte = await prisma.campus.upsert({
    where: { code: 'NORTE' },
    update: {},
    create: {
      name: 'Norte',
      code: 'NORTE'
    }
  })

  const dominio = await prisma.campus.upsert({
    where: { code: 'DOMINIO' },
    update: {},
    create: {
      name: 'Dominio',
      code: 'DOMINIO'
    }
  })

  const anahuac = await prisma.campus.upsert({
    where: { code: 'ANAHUAC' },
    update: {},
    create: {
      name: 'Anahuac',
      code: 'ANAHUAC'
    }
  })

  console.log('✅ Campus creados')

  // Crear grupos
  const campuses = [mitras, cumbres, norte, dominio, anahuac]
  const levels = ['Toddlers', 'Prenursery', 'Preescolar']

  for (const campus of campuses) {
    for (const level of levels) {
      const groupName = `${campus.name} ${level}`
      await prisma.group.upsert({
        where: {
          id: `${campus.code}-${level.toLowerCase()}`
        },
        update: {},
        create: {
          id: `${campus.code}-${level.toLowerCase()}`,
          name: groupName,
          level: level.toLowerCase(),
          campusId: campus.id
        }
      })
    }
  }

  console.log('✅ Grupos creados')

  // Estudiantes de ejemplo
  const exampleStudents = [
    // Mitras - Toddlers
    { name: 'Sofía', lastName: 'García', dateOfBirth: '2021-03-15', gender: 'F', campusId: mitras.id },
    { name: 'Mateo', lastName: 'López', dateOfBirth: '2021-04-20', gender: 'M', campusId: mitras.id },
    // Mitras - Prenursery
    { name: 'Valentina', lastName: 'Martínez', dateOfBirth: '2020-05-10', gender: 'F', campusId: mitras.id },
    { name: 'Santiago', lastName: 'Ramírez', dateOfBirth: '2020-06-15', gender: 'M', campusId: mitras.id },
    // Mitras - Preescolar
    { name: 'Camila', lastName: 'Torres', dateOfBirth: '2019-02-28', gender: 'F', campusId: mitras.id },
    { name: 'Emiliano', lastName: 'Mendoza', dateOfBirth: '2019-03-10', gender: 'M', campusId: mitras.id },

    // Cumbres - Toddlers
    { name: 'Isabella', lastName: 'Sánchez', dateOfBirth: '2021-07-05', gender: 'F', campusId: cumbres.id },
    { name: 'Leonardo', lastName: 'Hernández', dateOfBirth: '2021-08-12', gender: 'M', campusId: cumbres.id },
    // Cumbres - Prenursery
    { name: 'María', lastName: 'Fernández', dateOfBirth: '2020-09-20', gender: 'F', campusId: cumbres.id },
    { name: 'Daniel', lastName: 'Rivera', dateOfBirth: '2020-10-15', gender: 'M', campusId: cumbres.id },
    // Cumbres - Preescolar
    { name: 'Lucía', lastName: 'Castro', dateOfBirth: '2019-04-18', gender: 'F', campusId: cumbres.id },
    { name: 'Alejandro', lastName: 'Méndez', dateOfBirth: '2019-05-22', gender: 'M', campusId: cumbres.id },

    // Norte - Toddlers
    { name: 'Emma', lastName: 'Ortiz', dateOfBirth: '2021-11-30', gender: 'F', campusId: norte.id },
    { name: 'Sebastián', lastName: 'Rojas', dateOfBirth: '2021-12-10', gender: 'M', campusId: norte.id },
    // Norte - Prenursery
    { name: 'Valeria', lastName: 'Morales', dateOfBirth: '2020-01-15', gender: 'F', campusId: norte.id },
    { name: 'Diego', lastName: 'Navarro', dateOfBirth: '2020-02-20', gender: 'M', campusId: norte.id },
    // Norte - Preescolar
    { name: 'Julieta', lastName: 'Vargas', dateOfBirth: '2019-06-08', gender: 'F', campusId: norte.id },
    { name: 'Thiago', lastName: 'Estrada', dateOfBirth: '2019-07-12', gender: 'M', campusId: norte.id },

    // Dominio - Toddlers
    { name: 'Victoria', lastName: 'Reyes', dateOfBirth: '2021-05-18', gender: 'F', campusId: dominio.id },
    { name: 'Joaquín', lastName: 'Silva', dateOfBirth: '2021-06-25', gender: 'M', campusId: dominio.id },
    // Dominio - Prenursery
    { name: 'Renata', lastName: 'Guerrero', dateOfBirth: '2020-03-10', gender: 'F', campusId: dominio.id },
    { name: 'Maximiliano', lastName: 'Cortés', dateOfBirth: '2020-04-15', gender: 'M', campusId: dominio.id },
    // Dominio - Preescolar
    { name: 'Carolina', lastName: 'Paredes', dateOfBirth: '2019-08-22', gender: 'F', campusId: dominio.id },
    { name: 'Andrés', lastName: 'Figueroa', dateOfBirth: '2019-09-05', gender: 'M', campusId: dominio.id },

    // Anahuac - Toddlers
    { name: 'Clara', lastName: 'Pacheco', dateOfBirth: '2021-09-30', gender: 'F', campusId: anahuac.id },
    { name: 'Bruno', lastName: 'Santos', dateOfBirth: '2021-10-12', gender: 'M', campusId: anahuac.id },
    // Anahuac - Prenursery
    { name: 'Regina', lastName: 'Miranda', dateOfBirth: '2020-05-08', gender: 'F', campusId: anahuac.id },
    { name: 'Fernando', lastName: 'Castillo', dateOfBirth: '2020-06-14', gender: 'M', campusId: anahuac.id },
    // Anahuac - Preescolar
    { name: 'Beatriz', lastName: 'Ramos', dateOfBirth: '2019-10-17', gender: 'F', campusId: anahuac.id },
    { name: 'Martín', lastName: 'Flores', dateOfBirth: '2019-11-20', gender: 'M', campusId: anahuac.id }
  ]

  // Crear estudiantes
  for (const student of exampleStudents) {
    try {
      await prisma.student.create({
        data: {
          name: student.name,
          lastName: student.lastName,
          dateOfBirth: new Date(student.dateOfBirth),
          gender: student.gender,
          campusId: student.campusId || null,
          groupId: null,
          emergencyContact: 'Padre',
          emergencyPhone: '5551234567',
          parentEmail: `${student.name.toLowerCase()}.${student.lastName.toLowerCase()}@email.com`,
          parentPhone: '5551234567',
          medicalNotes: null
        }
      })
    } catch (error) {
      console.log(`⚠️ Error creando estudiante ${student.name} ${student.lastName}:`, error.message)
    }
  }

  console.log(`✅ ${exampleStudents.length} estudiantes creados`)

  console.log('🎉 Carga de datos completada!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en la carga de datos:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
