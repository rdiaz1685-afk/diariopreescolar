import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { content } = await request.json()

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        // Get user profile for metadata
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .single()

        const { data, error } = await supabase
            .from('feedback')
            .insert({
                user_id: user.id,
                user_name: profile?.name || 'Unknown',
                user_role: profile?.role || 'Unknown',
                content: content.trim(),
                status: 'pending'
            })
            .select()

        // Note: If the 'feedback' table doesn't exist yet, we'll need to create it.
        // In a real environment, I'd run a SQL script. 
        // Here I'll assume I can create the UI and if the user has Supabase access they can add the table.

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to save feedback. Please ensure the "feedback" table exists in Supabase.' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Feedback API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Only admins should see feedback
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin' && profile?.role !== 'rector') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
