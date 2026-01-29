import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

async function checkTeacher() {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', 'maestra.mitras@ejemplo.com')
        .single()

    console.log('--- Teacher Profile ---')
    console.log(JSON.stringify(profile, null, 2))

    if (profile?.groupId) {
        const { data: group } = await supabaseAdmin.from('groups').select('*').eq('id', profile.groupId).single()
        console.log('\n--- Teacher Group ---')
        console.log(JSON.stringify(group, null, 2))
    }
}

checkTeacher().catch(console.error)
