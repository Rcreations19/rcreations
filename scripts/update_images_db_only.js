/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mgdfzyilinleeylbzqoo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZGZ6eWlsaW5sZWV5bGJ6cW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1NDcwOCwiZXhwIjoyMTAxODMwNzA4fQ.iKrBhCCPjmieyYEPgedkMfSdiqn453zpat2_fKi--Yk';
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: { fetch: fetch } // Uses native fetch
});

async function run() {
  console.log('Fetching products from database to update extensions to .webp...');
  let products;
  
  // Retry mechanism for fetching
  for (let i = 0; i < 3; i++) {
    console.log(`Attempt ${i+1} to fetch products...`);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error(`Attempt ${i+1} failed:`, error.message);
      if (i === 2) return;
      await new Promise(r => setTimeout(r, 2000));
    } else {
      products = data;
      break;
    }
  }

  let updateCount = 0;
  for (const p of products) {
    let needsUpdate = false;
    let newImageUrl = p.image_url;
    let newGallery = [...(p.gallery_images || [])];

    if (newImageUrl && newImageUrl.toUpperCase().endsWith('.JPG')) {
      newImageUrl = newImageUrl.replace(/\.JPG$/i, '.webp');
      needsUpdate = true;
    }

    for (let i = 0; i < newGallery.length; i++) {
      if (newGallery[i].toUpperCase().endsWith('.JPG')) {
        newGallery[i] = newGallery[i].replace(/\.JPG$/i, '.webp');
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      // Retry mechanism for updating
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error: updateErr } = await supabase
          .from('products')
          .update({ image_url: newImageUrl, gallery_images: newGallery })
          .eq('id', p.id);
          
        if (updateErr) {
          console.error(`Error updating product ${p.slug} (attempt ${attempt+1}):`, updateErr.message);
          await new Promise(r => setTimeout(r, 1000));
        } else {
          updateCount++;
          console.log(`Updated ${p.slug}`);
          break;
        }
      }
    }
  }

  console.log(`Updated ${updateCount} products in database to use .webp extensions.`);
  console.log('Database update complete!');
}

run();
