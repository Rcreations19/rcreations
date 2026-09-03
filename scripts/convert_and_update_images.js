/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp'); // sharp should be available through next/miniflare

const sourceDir = 'M:/Personal/Workspace/rcreation/R creation product';
const targetDir = 'M:/Personal/Workspace/rcreation/public/products';

const supabaseUrl = 'https://mgdfzyilinleeylbzqoo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZGZ6eWlsaW5sZWV5bGJ6cW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1NDcwOCwiZXhwIjoyMTAxODMwNzA4fQ.iKrBhCCPjmieyYEPgedkMfSdiqn453zpat2_fKi--Yk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'));

  console.log(`Found ${imageFiles.length} images to process. Converting to webp...`);

  let convertedCount = 0;
  for (const file of imageFiles) {
    const srcPath = path.join(sourceDir, file);
    const basename = path.parse(file).name;
    const destName = `${basename}.webp`;
    const destPath = path.join(targetDir, destName);

    try {
      if (!fs.existsSync(destPath)) {
        await sharp(srcPath)
          .resize(1200, 1500, { fit: 'inside', withoutEnlargement: true }) // Resize to reasonable dimensions
          .webp({ quality: 80 })
          .toFile(destPath);
      }
      convertedCount++;
      if (convertedCount % 10 === 0) console.log(`Converted ${convertedCount}/${imageFiles.length}...`);
    } catch (e) {
      console.error(`Error converting ${file}:`, e.message);
    }
  }

  console.log(`Finished converting ${convertedCount} images.`);

  console.log('Fetching products from database to update extensions...');
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
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
      const { error: updateErr } = await supabase
        .from('products')
        .update({ image_url: newImageUrl, gallery_images: newGallery })
        .eq('id', p.id);
        
      if (updateErr) {
        console.error(`Error updating product ${p.slug}:`, updateErr.message);
      } else {
        updateCount++;
      }
    }
  }

  console.log(`Updated ${updateCount} products in database to use .webp extensions.`);
  console.log('Done!');
}

run();
