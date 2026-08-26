'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import * as xlsx from 'xlsx';

export async function uploadPricingData(formData: FormData) {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: 'Unauthorized' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    let frames: any[] = [];
    let backlit: any[] = [];

    // Parse Frame Pricing
    const frameSheet = workbook.Sheets['Frame Pricing'];
    if (frameSheet) {
      const rows = xlsx.utils.sheet_to_json(frameSheet, { header: 1 }) as any[];
      for (let i = 4; i < rows.length; i++) {
        const row = rows[i];
        const finalPrice = Number(row[6]) || 0;
        if (!row || !row[0] || finalPrice <= 0) continue;
        frames.push({
          size: row[0],
          basePrice: Number(row[1]) || 0,
          knownAddOn: Number(row[2]) || 0,
          thickness: row[3] || '',
          finish: row[4] || '',
          thicknessAddOn: Number(row[5]) || 0,
          finalPrice: finalPrice,
        });
      }
    } else {
      return { error: 'Missing "Frame Pricing" sheet in the uploaded Excel file.' };
    }

    // Parse Backlit Pricing
    const backlitSheet = workbook.Sheets['Backlit Pricing'];
    if (backlitSheet) {
      const rows = xlsx.utils.sheet_to_json(backlitSheet, { header: 1 }) as any[];
      for (let i = 4; i < rows.length; i++) {
        const row = rows[i];
        const finalPrice = Number(row[5]) || 0;
        if (!row || !row[0] || !row[1] || row[1] === '—' || finalPrice <= 0) continue;
        backlit.push({
          thickness: row[0],
          size: row[1],
          basePrice: Number(row[2]) || 0,
          finish: row[3] || '',
          finishSurcharge: Number(row[4]) || 0,
          finalPrice: finalPrice,
        });
      }
    } else {
      return { error: 'Missing "Backlit Pricing" sheet in the uploaded Excel file.' };
    }

    // Parse Settings
    let finishes: any[] = [];
    let thicknesses: any[] = [];
    const settingsSheet = workbook.Sheets['Settings'];
    if (settingsSheet) {
      const rows = xlsx.utils.sheet_to_json(settingsSheet, { header: 1 }) as any[];
      let currentSection = '';

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || !row[0]) {
          currentSection = '';
          continue;
        }
        
        if (row[0] === 'Finish Surcharge') {
          currentSection = 'finishes';
          i++; // skip header row
          continue;
        }
        
        if (row[0] === 'Frame Thickness Add-on') {
          currentSection = 'thicknesses';
          i++; // skip header row
          continue;
        }
        
        if (currentSection === 'finishes') {
          finishes.push({
            finish: row[0],
            surchargePercent: Number(row[1]) || 0
          });
        }
        
        if (currentSection === 'thicknesses') {
          thicknesses.push({
            thickness: row[0],
            addonSqFt: Number(row[1]) || 0
          });
        }
      }
    }

    const pricingConfig = {
      frames,
      backlit,
      settings: {
        finishes,
        thicknesses
      }
    };

    const supabase = await createClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'pricing_config',
        value: pricingConfig as any,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.error('Failed to save pricing config to database:', error);
      return { error: 'Failed to save pricing data to database.' };
    }

    revalidatePath('/admin/site-settings');
    revalidatePath('/configurator');
    return { success: true, data: pricingConfig };
  } catch (error: any) {
    console.error('Error processing excel file:', error);
    return { error: 'Failed to process Excel file. Please ensure it matches the original format.' };
  }
}

export async function getPricingConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'pricing_config')
    .single();

  if (error || !data) {
    return null;
  }

  return data.value as any;
}
