import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [k, ...vParts] = line.split('=');
  if (k && vParts.length > 0) {
    let v = vParts.join('=');
    v = v.trim().replace(/^"|"$|^'|'$/g, '');
    acc[k.trim()] = v;
  }
  return acc;
}, {});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'] || supabaseKey; 

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanMockData() {
  console.log('Cleaning mock data...');

  const { error: orderError } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (orderError) console.error('Error deleting orders:', orderError.message);
  else console.log('✅ Orders cleared');

  const { error: productError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (productError) console.error('Error deleting products:', productError.message);
  else console.log('✅ Products cleared');

  const { error: reviewError } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (reviewError) console.error('Error deleting reviews:', reviewError.message);
  else console.log('✅ Reviews cleared');

  console.log('Mock data cleanup complete.');
}

cleanMockData();
