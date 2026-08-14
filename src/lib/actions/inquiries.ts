'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateInquiryStatus(id: string, status: string) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/inquiries');
  revalidatePath(`/admin/inquiries/${id}`);
  return { success: true };
}

import { ApiResponse, createSuccessResponse, createErrorResponse } from '../api-response';
import { rateLimit } from '../rate-limit';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  phone: z.string().max(20, 'Phone is too long').optional(),
  company: z.string().max(100, 'Company name is too long').optional(),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  type: z.string().max(50, 'Type is too long').optional(),
});

export async function submitInquiry(formData: FormData): Promise<ApiResponse> {
  const rl = await rateLimit(3, 60000); // 3 inquiries per minute
  if (!rl.success) {
    return createErrorResponse('RATE_LIMIT_ERROR', rl.error!);
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    message: formData.get('message'),
    type: formData.get('type')
  });

  if (!parsed.success) {
    return createErrorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  const { name, email, phone, company, message, type } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.from('inquiries').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : null,
    company: company ? company.trim() : null,
    message: message.trim(),
    inquiry_type: type,
    status: 'new'
  });

  if (error) {
    console.error('Inquiry Submission Error:', error);
    return createErrorResponse('DB_ERROR', 'Failed to save inquiry.');
  }

  return createSuccessResponse(null);
}

