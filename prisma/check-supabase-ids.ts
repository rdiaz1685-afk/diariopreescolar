import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

async function checkIds() {
    console.log('--- Campuses in Supabase ---')
    const { data: campuses } = await supabaseAdmin.from('campuses').select('id, name')
    console.log(JSON.stringify(campuses, null, 2))

    console.log('\n--- Groups in Supabase ---')
    const { data: groups } = await supabaseAdmin.from('groups').select('id, name, campusId')
    console.log(JSON.stringify(groups, null, 2))
}

checkIds().catch(console.error)
