const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listSupabaseProfiles() {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Supabase Profiles:', data)
    }
}

listSupabaseProfiles()
