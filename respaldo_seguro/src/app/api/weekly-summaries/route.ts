import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const weekStart = searchParams.get('weekStart')

    const where: any = {}
    if (studentId) {
      where.studentId = studentId
    }
    if (weekStart) {
      where.weekStart = new Date(weekStart)
    }

    const summaries = await db.weeklySummary.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { weekStart: 'desc' }
    })

    return NextResponse.json(summaries)
  } catch (error) {
    console.error('Error fetching weekly summaries:', error)
    return NextResponse.json(
      { error: 'Error fetching weekly summaries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, weekStart, weekEnd, behaviorSummary, aiSuggestions } = body

    const summary = await db.weeklySummary.create({
      data: {
        studentId,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        behaviorSummary,
        aiSuggestions
      },
      include: {
        student: true
      }
    })

    return NextResponse.json(summary, { status: 201 })
  } catch (error) {
    console.error('Error creating weekly summary:', error)
    return NextResponse.json(
      { error: 'Error creating weekly summary' },
      { status: 500 }
    )
  }
}
