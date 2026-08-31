'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import * as ExcelJS from 'exceljs';

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
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    let frames: any[] = [];
    let backlit: any[] = [];

    // Parse Frame Pricing
    const frameSheet = workbook.getWorksheet('Frame Pricing');
    if (frameSheet) {
      frameSheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 3) return; // skip headers
        
        const rowValues = row.values as any[];
        // ExcelJS row values are 1-indexed, so rowValues[1] is the first column A
        const finalPrice = Number(rowValues[7]) || 0; 
        if (!rowValues || !rowValues[1] || finalPrice <= 0) return;
        
        frames.push({
          size: String(rowValues[1]),
          basePrice: Number(rowValues[2]) || 0,
          knownAddOn: Number(rowValues[3]) || 0,
          thickness: String(rowValues[4] || ''),
          finish: String(rowValues[5] || ''),
          thicknessAddOn: Number(rowValues[6]) || 0,
          finalPrice: finalPrice,
        });
      });
    } else {
      return { error: 'Missing "Frame Pricing" sheet in the uploaded Excel file.' };
    }

    // Parse Backlit Pricing
    const backlitSheet = workbook.getWorksheet('Backlit Pricing');
    if (backlitSheet) {
      backlitSheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 3) return;
        
        const rowValues = row.values as any[];
        const finalPrice = Number(rowValues[6]) || 0;
        if (!rowValues || !rowValues[1] || !rowValues[2] || String(rowValues[2]) === '—' || finalPrice <= 0) return;
        
        backlit.push({
          thickness: String(rowValues[1]),
          size: String(rowValues[2]),
          basePrice: Number(rowValues[3]) || 0,
          finish: String(rowValues[4] || ''),
          finishSurcharge: Number(rowValues[5]) || 0,
          finalPrice: finalPrice,
        });
      });
    } else {
      return { error: 'Missing "Backlit Pricing" sheet in the uploaded Excel file.' };
    }

    // Parse Settings
    let finishes: any[] = [];
    let thicknesses: any[] = [];
    const settingsSheet = workbook.getWorksheet('Settings');
    if (settingsSheet) {
      let currentSection = '';

      settingsSheet.eachRow((row, rowNumber) => {
        const rowValues = row.values as any[];
        if (!rowValues || !rowValues[1]) {
          currentSection = '';
          return;
        }
        
        const col1 = String(rowValues[1]);
        
        if (col1 === 'Finish Surcharge') {
          currentSection = 'finishes';
          return; // skip header row
        }
        
        if (col1 === 'Frame Thickness Add-on') {
          currentSection = 'thicknesses';
          return; // skip header row
        }
        
        if (currentSection === 'finishes') {
          finishes.push({
            finish: col1,
            surchargePercent: Number(rowValues[2]) || 0
          });
        }
        
        if (currentSection === 'thicknesses') {
          thicknesses.push({
            thickness: col1,
            addonSqFt: Number(rowValues[2]) || 0
          });
        }
      });
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
