const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function updateDb() {
  const { data, error } = await supabase
    .from('brand_story')
    .update({ 
      image_url: '/zarish-luxury-card.webp',
      updated_at: new Date().toISOString()
    })
    .eq('id', 'c87b1c3d-d35d-45ad-bcac-340abfcfc410')
    .select();

  console.log('Update with service role:', data, 'error:', error);
}

updateDb().catch(console.error);
