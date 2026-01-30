const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
    console.log('Checking feedback table columns...')

    // Attempt to fetch one row or metadata
    const { data, error } = await supabase.from('feedback').select('*').limit(1)
    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Data sample:', data)
        if (data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]))
        } else {
            console.log('Table is empty. Trying to list columns via RPC or assume schema.')
            // We can try to insert a dummy row to see what fails
            const { error: iError } = await supabase.from('feedback').insert({ content: 'test-column-check' })
            if (iError) {
                console.error('Insert failed with error:', iError.message)
            } else {
                console.log('Dummy insert successful.')
                // Clean up
                await supabase.from('feedback').delete().eq('content', 'test-column-check')
            }
        }
    }
}

checkColumns()
