const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDailyReports() {
    const { data, error } = await supabase.from('daily_reports').select('*').limit(1)
    if (error) {
        console.log(`Table "daily_reports" check: ${error.message}`)
    } else {
        console.log(`✅ Table "daily_reports" access success!`)
    }

    const { error: error2 } = await supabase.from('DailyReport').select('*').limit(1)
    if (error2) {
        console.log(`Table "DailyReport" check: ${error2.message}`)
    } else {
        console.log(`✅ Table "DailyReport" access success!`)
    }
}

checkDailyReports()
