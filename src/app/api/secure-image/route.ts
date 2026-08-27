import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  try {
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
