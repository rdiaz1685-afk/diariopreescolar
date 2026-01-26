import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const studentId = searchParams.get('studentId')

    let query = supabase
      .from('daily_reports')
      .select('*, student:students(*)')
      .order('date', { ascending: false })

    if (date) {
      query = query.gte('date', `${date}T00:00:00`).lte('date', `${date}T23:59:59`)
    }
    if (studentId) {
      query = query.eq('studentId', studentId)
    }

    const { data: reports, error } = await query

    if (error) throw error

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
    const supabase = await createClient()
    const body = await request.json()
    const { data: report, error } = await supabase
      .from('daily_reports')
      .insert({
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
      })
      .select('*, student:students(*)')
      .single()

    if (error) throw error

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating daily report:', error)
    return NextResponse.json(
      { error: 'Error creating daily report' },
      { status: 500 }
    )
  }
}
