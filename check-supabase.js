const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
    console.log('Checking Supabase connection and tables...')

    // Check if we can fetch from profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (pError) {
        console.error('Error fetching from profiles:', pError.message)
    } else {
        console.log('Successfully connected to Supabase. Profiles table exists.')
    }

    // Check if we can fetch from feedback
    const { data: feedback, error: fError } = await supabase.from('feedback').select('count', { count: 'exact', head: true })
    if (fError) {
        console.error('Error fetching from feedback:', fError.message)
        if (fError.message.includes('relation "public.feedback" does not exist')) {
            console.log('CRITICAL: The "feedback" table does NOT exist in Supabase.')
        }
    } else {
        console.log('The "feedback" table exists in Supabase.')
    }
}

checkTable()
