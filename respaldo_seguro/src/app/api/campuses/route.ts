import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const campuses = await db.campus.findMany({
      orderBy: { name: 'asc' }
    })

    // Obtener conteo de estudiantes por campus
    const campusIds = campuses.map(c => c.id)
    const studentCounts = await db.student.groupBy({
      by: ['campusId'],
      where: {
        campusId: { in: campusIds }
      },
      _count: true
    })

    const campusesWithCount = campuses.map(campus => ({
      ...campus,
      studentCount: studentCounts.find(sc => sc.campusId === campus.id)?._count || 0
    }))

    console.log('Campuses:', campusesWithCount)

    return NextResponse.json(campusesWithCount)
  } catch (error) {
    console.error('Error fetching campuses:', error)
    return NextResponse.json(
      { error: 'Error fetching campuses' },
      { status: 500 }
    )
  }
}
