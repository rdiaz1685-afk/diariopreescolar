const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listTables() {
    console.log('Fetching list of tables from Supabase...')

    // Check possible names
    const names = ['feedback', 'Feedback', 'feedbacks', 'Feedback_Model']
    for (const name of names) {
        const { error } = await supabase.from(name).select('*').limit(1)
        if (error) {
            console.log(`Table "${name}" check: ${error.message}`)
        } else {
            console.log(`✅ Table "${name}" exists and is accessible!`)
        }
    }
}

listTables()
