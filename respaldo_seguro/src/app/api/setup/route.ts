import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== Verificando y preparando base de datos ===')

    // Verificar campus existentes
    const existingCampuses = await db.campus.findMany()
    console.log('Campus existentes:', existingCampuses.length)

    // Crear campus si no existen
    const campuses = [
      { code: 'MITRAS', name: 'Mitras' },
      { code: 'CUMBRES', name: 'Cumbres' },
      { code: 'NORTE', name: 'Norte' },
      { code: 'DOMINIO', name: 'Dominio' },
      { code: 'ANAHUAC', name: 'Anahuac' }
    ]

    for (const campusData of campuses) {
      const existing = existingCampuses.find(c => c.code === campusData.code)
      if (!existing) {
        await db.campus.create({
          data: campusData
        })
        console.log('✅ Campus creado:', campusData.name)
      }
    }

    // Verificar grupos existentes
    const existingGroups = await db.group.findMany()
    console.log('Grupos existentes:', existingGroups.length)

    // Obtener todos los campus creados
    const allCampuses = await db.campus.findMany()

    // Crear grupos si no existen
    const levels = ['toddlers', 'prenursery', 'preescolar']
    for (const campus of allCampuses) {
      for (const level of levels) {
        const groupName = `${campus.name} ${level.charAt(0).toUpperCase() + level.slice(1)}`
        const existing = existingGroups.find(g => 
          g.name === groupName && g.level === level
        )

        if (!existing) {
          await db.group.create({
            data: {
              id: `${campus.code}-${level}`,
              name: groupName,
              level: level,
              campusId: campus.id
            }
          })
          console.log('✅ Grupo creado:', groupName)
        }
      }
    }

    // Contar estudiantes
    const studentCount = await db.student.count()
    console.log('📊 Total estudiantes:', studentCount)

    // Obtener stats
    const stats = {
      campuses: await db.campus.count(),
      groups: await db.group.count(),
      students: studentCount
    }

    console.log('📊 Estadísticas:', stats)

    return NextResponse.json({
      success: true,
      message: 'Base de datos preparada',
      stats
    })
  } catch (error) {
    console.error('❌ Error preparando base de datos:', error)
    return NextResponse.json(
      { 
        error: 'Error al preparar base de datos',
        details: String(error)
      },
      { status: 500 }
    )
  }
}
