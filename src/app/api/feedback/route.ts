import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { content, userId, userName, userRole } = await request.json()

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const { data: feedback, error } = await supabase
            .from('feedback')
            .insert({
                userId: userId || 'anonymous',
                userName: userName || 'Unknown',
                userRole: userRole || 'Unknown',
                content: content.trim(),
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, data: feedback })
    } catch (error: any) {
        console.error('Feedback API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: feedback, error } = await supabase
            .from('feedback')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error

        return NextResponse.json(feedback)
    } catch (error: any) {
        console.error('Error fetching feedback:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
