const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyProfiles() {
    const { data, error } = await supabase.from('profiles').select('id, name').limit(1)
    if (error) {
        console.error('Profiles access error:', error.message)
    } else {
        console.log('✅ Profiles access success:', data)
    }
}

verifyProfiles()
