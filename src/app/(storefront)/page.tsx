import React from 'react';
import HomePageClient from '@/components/storefront/HomePageClient';
import { GoogleReviews } from '@/components/storefront/GoogleReviews';

export default function HomePage() {
  return (
    <HomePageClient>
      <GoogleReviews />
    </HomePageClient>
  );
}
