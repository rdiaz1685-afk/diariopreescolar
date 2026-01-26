import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const weekStart = searchParams.get('weekStart')

    let query = supabase
      .from('weekly_summaries')
      .select('*, student:students(*)')
      .order('weekStart', { ascending: false })

    if (studentId) {
      query = query.eq('studentId', studentId)
    }
    if (weekStart) {
      query = query.eq('weekStart', weekStart)
    }

    const { data: summaries, error } = await query

    if (error) throw error

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
    const supabase = await createClient()
    const body = await request.json()
    const { studentId, weekStart, weekEnd, behaviorSummary, aiSuggestions } = body

    const { data: summary, error } = await supabase
      .from('weekly_summaries')
      .insert({
        studentId,
        weekStart,
        weekEnd,
        behaviorSummary,
        aiSuggestions
      })
      .select('*, student:students(*)')
      .single()

    if (error) throw error

    return NextResponse.json(summary, { status: 201 })
  } catch (error) {
    console.error('Error creating weekly summary:', error)
    return NextResponse.json(
      { error: 'Error creating weekly summary' },
      { status: 500 }
    )
  }
}
