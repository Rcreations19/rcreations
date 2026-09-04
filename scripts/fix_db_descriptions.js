require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('products').select('id, title, subtitle, description');
  if (error) console.error(error);
  
  let updated = 0;
  for (const product of data) {
    if ((product.subtitle && product.subtitle.includes('Auto-generated product')) || 
        (product.description && product.description.includes('Auto-generated product'))) {
      
      const newDesc = `Premium ${product.title.toLowerCase()} from R Creation. Factory-direct wholesale pricing. Available for custom sizing and delivery in Vellore & Gudiyattam.`;
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          subtitle: newDesc,
          description: `Experience factory-direct quality with our ${product.title}. As a leading manufacturer in Gudiyattam, Vellore, we offer premium materials, precise craftsmanship, and unbeatable wholesale pricing on all custom photo frames and personalized gifts.` 
        })
        .eq('id', product.id);
        
      if (updateError) console.error('Error updating', product.id, updateError);
      else updated++;
    }
  }
  console.log('Updated ' + updated + ' products.');
}
run();
