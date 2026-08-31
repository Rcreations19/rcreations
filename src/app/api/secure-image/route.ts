import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient, createClient, verifyAdmin } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // LOW-3: Rate limit to prevent bulk signed-URL generation
  const rl = await rateLimit(20, 60000); // 20 per minute per IP
  if (!rl.success) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();

    let isAuthorized = false;

    try {
      await verifyAdmin();
      isAuthorized = true;
    } catch {
      // Not an admin, check if user is logged in and owns the file
      if (user) {
        // Query the database to check if this storage_path belongs to the user
        const { data: uploadRecord } = await userClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('customer_uploads' as any)
          .select('user_id')
          .eq('storage_path', path)
          .single();

        if (uploadRecord && (uploadRecord as any).user_id === user.id) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new NextResponse('Unauthorized access to image', { status: 401 });
    }

    const supabase = await getServiceRoleClient();
    
    // Create a temporary signed URL valid for 60 seconds.
    // We use the service role client so we can bypass the private bucket RLS,
    // allowing the cart/checkout to securely render the user's uploaded image.
    const { data, error } = await supabase.storage
      .from('customer-uploads')
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      console.error('Error generating signed URL:', error);
      return new NextResponse('Image not found or access denied', { status: 404 });
    }

    // Redirect the browser to the signed URL so it loads the image directly.
    return NextResponse.redirect(data.signedUrl, 307);
    
  } catch (error) {
    console.error('Error in secure-image route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
