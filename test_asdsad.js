const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function check() {
  const { data: p } = await supabase
    .from('products')
    .select('*, variants:product_variants(*), images:product_images(*)')
    .eq('slug', 'asdsad')
    .single();

  console.log('Product:', p?.name, p?.slug);
  console.log('Variants count:', p?.variants?.length);
  p?.variants?.forEach(v => console.log('Variant:', v.color, v.size_id, v.stock_quantity));
  p?.images?.forEach(i => console.log('Image:', i.alt_text, i.role));
}

check();
