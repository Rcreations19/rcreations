import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Shield, ShieldAlert, User, CheckCircle, XCircle } from 'lucide-react';
import { toggleUserActive } from '@/lib/actions/users';

export const metadata = {
  title: 'Users & Roles | Admin Dashboard',
};

export default async function UsersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'staff'])
    .order('created_at', { ascending: true });

  const handleToggle = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const isActive = formData.get('is_active') === 'true';
    await toggleUserActive(id, !isActive);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Users & Roles</h1>
          <p className="text-sm text-[#595959] mt-1">Manage staff and admin access to this portal.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">User</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className={`transition-colors ${!user.is_active ? 'bg-neutral-50' : 'hover:bg-surface'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#10164A] text-white flex items-center justify-center font-bold text-xs">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold ${!user.is_active ? 'text-[#888888] line-through' : 'text-[#111111]'}`}>
                            {user.full_name || 'Unnamed User'}
                          </span>
                          <span className="text-[10px] text-[#595959]">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-[#10164A] text-white' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#595959] text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={handleToggle}>
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="is_active" value={user.is_active.toString()} />
                        <button 
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 w-24 ml-auto ${
                            user.is_active 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {user.is_active ? <><XCircle className="w-3 h-3"/> Revoke</> : <><CheckCircle className="w-3 h-3"/> Restore</>}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User className="w-8 h-8 text-[#888888] mb-2" />
                      <p className="font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
