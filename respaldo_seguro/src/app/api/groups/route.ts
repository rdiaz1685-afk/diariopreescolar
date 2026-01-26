import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campusId')

    const where = campusId ? { campusId } : {}

    const groups = await db.group.findMany({
      where,
      orderBy: [
        { campus: { name: 'asc' } },
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    // Obtener conteo de estudiantes por grupo
    const groupIds = groups.map(g => g.id)
    const studentCounts = await db.student.groupBy({
      by: ['groupId'],
      where: {
        groupId: { in: groupIds }
      },
      _count: true
    })

    const groupsWithCount = groups.map(group => ({
      ...group,
      studentCount: studentCounts.find(sc => sc.groupId === group.id)?._count || 0
    }))

    return NextResponse.json(groupsWithCount)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Error fetching groups' },
      { status: 500 }
    )
  }
}
