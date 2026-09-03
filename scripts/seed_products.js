const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://mgdfzyilinleeylbzqoo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZGZ6eWlsaW5sZWV5bGJ6cW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1NDcwOCwiZXhwIjoyMTAxODMwNzA4fQ.iKrBhCCPjmieyYEPgedkMfSdiqn453zpat2_fKi--Yk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const seedFilePath = 'C:/Users/madha/.gemini/antigravity-ide/brain/62b3243e-e67b-46bc-a377-4bc8576ccd9a/scratch/products_seed.json';
const rawData = fs.readFileSync(seedFilePath, 'utf8');
const products = JSON.parse(rawData);

const defaultCategoryId = 'c1000000-0000-0000-0000-000000000003'; // Personalized Gifts

async function run() {
  console.log(`Read ${products.length} products. Starting upload...`);
  let successCount = 0;
  let errorCount = 0;
  
  for (const p of products) {
    const productRecord = {
      title: p.title,
      subtitle: p.subtitle || '',
      slug: p.slug,
      category_id: defaultCategoryId,
      price: p.price,
      wholesale_price: p.price * 0.8, // Estimate wholesale price
      image_url: p.images.length > 0 ? p.images[0] : 'placeholder.jpg',
      gallery_images: p.images,
      description: p.description,
      dimensions: p.dimensions || '',
      material: p.material || '',
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('products')
      .upsert(productRecord, { onConflict: 'slug' })
      .select();
      
    if (error) {
      console.error(`Error uploading ${p.slug}:`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
  }
  
  console.log(`Upload complete. Success: ${successCount}, Errors: ${errorCount}`);
}

run();
