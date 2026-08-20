'use server';

import { createClient } from '../supabase/server';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(200),
  phone: z.string().max(20).optional().default(''),
  address: z.string().max(500).optional().default(''),
  city: z.string().max(100).optional().default(''),
  state: z.string().max(100).optional().default(''),
  pincode: z.string().max(10).optional().default(''),
});

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  default_address: string | null;
  default_city: string | null;
  default_state: string | null;
  default_pincode: string | null;
}

/**
 * Get the currently authenticated customer's profile.
 * Returns null if not authenticated or if the user is an admin (not a customer).
 */
export async function getCustomerSession(): Promise<CustomerProfile | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to get the customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('id, email, full_name, phone, default_address, default_city, default_state, default_pincode')
    .eq('id', user.id)
    .single();

  if (!customer) {
    // User is authenticated but has no customer profile (could be an admin)
    // Do NOT create customer profiles for admin users
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return null;
    }

    // Self-heal: create a customer profile for non-admin users
    const { data: newCustomer } = await supabase.from('customers').insert({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || null,
    }).select('id, email, full_name, phone, default_address, default_city, default_state, default_pincode').single();

    return newCustomer as CustomerProfile | null;
  }

  return customer as CustomerProfile;
}

/**
 * Update the customer's profile and default shipping info.
 */
export async function updateCustomerProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated.' };
  }

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
    city: formData.get('city') || undefined,
    state: formData.get('state') || undefined,
    pincode: formData.get('pincode') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { fullName, phone, address, city, state, pincode } = parsed.data;

  const updates = {
    full_name: fullName,
    phone: phone || null,
    default_address: address || null,
    default_city: city || null,
    default_state: state || null,
    default_pincode: pincode || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return { error: 'Failed to update profile.' };
  }

  return { success: true };
}
