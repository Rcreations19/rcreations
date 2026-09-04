import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, email, phone, items, status } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = (await getServiceRoleClient()) as any;

    const { data, error } = await supabase
      .from('abandoned_carts')
      .upsert(
        {
          session_id: sessionId,
          email: email || null,
          phone: phone || null,
          items: items || [],
          status: status || 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[Cart Sync] Error upserting cart:', error);
      return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Cart Sync] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
