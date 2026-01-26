import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (date) {
      where.date = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      }
    }
    if (studentId) {
      where.studentId = studentId
    }

    const reports = await db.dailyReport.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching daily reports:', error)
    return NextResponse.json(
      { error: 'Error fetching daily reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const report = await db.dailyReport.create({
      data: {
        studentId: body.studentId,
        mood: body.mood,
        lunchIntake: body.lunchIntake,
        hadNap: body.hadNap,
        usedBathroom: body.usedBathroom,
        diaperChanged: body.diaperChanged,
        diaperNotes: body.diaperNotes,
        medicationGiven: body.medicationGiven,
        medicationName: body.medicationName,
        medicationNotes: body.medicationNotes,
        dailyAchievements: body.dailyAchievements,
        generalNotes: body.generalNotes
      },
      include: {
        student: true
      }
    })
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating daily report:', error)
    return NextResponse.json(
      { error: 'Error creating daily report' },
      { status: 500 }
    )
  }
}
