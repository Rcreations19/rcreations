'use server';

import { createClient } from '../supabase/server';

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
    // Self-heal: create a customer profile for them
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

  const updates = {
    full_name: formData.get('fullName') as string,
    phone: formData.get('phone') as string || null,
    default_address: formData.get('address') as string || null,
    default_city: formData.get('city') as string || null,
    default_state: formData.get('state') as string || null,
    default_pincode: formData.get('pincode') as string || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile.' };
  }

  return { success: true };
}
