const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
    console.log('Testing insert into students table...')
    // We'll insert a dummy student and then delete it
    const { data, error } = await supabase.from('students').insert({
        name: 'Test',
        lastName: 'User',
        dateOfBirth: '2020-01-01',
        gender: 'M',
        campusId: 'cmkzwpqy20019uubgpvslg28g', // Mitras campus id from previous list-users check
        groupId: 'cmkzwpqy7001buubgsm89hllg'
    }).select()

    if (error) {
        console.error('Insert error:', error.message)
    } else {
        console.log('✅ Insert success:', data)
        await supabase.from('students').delete().eq('id', data[0].id)
        console.log('Cleanup success.')
    }
}

testInsert()
