const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('brand_story').select('*').limit(1).maybeSingle().then(res => {
  console.log('DATA:', JSON.stringify(res.data, null, 2));
  console.log('ERROR:', res.error);
}).catch(console.error);
