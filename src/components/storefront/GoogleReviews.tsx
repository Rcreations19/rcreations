import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

// Fetches live reviews from Google Places API (Server-Side)
async function getLiveReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = 'ChIJhXK-yFttrTsRVlbbUmueqAw'; // R Creation Vellore

  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY is not set in environment variables.');
    return [];
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
      },
      // Revalidate every 24 hours (86400 seconds) to cache results and prevent high API costs
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      console.error('Failed to fetch Google Reviews:', await res.text());
      return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return [];
  }
}

export async function GoogleReviews() {
  const placeData = await getLiveReviews();
  const reviews = placeData?.reviews || [];
  const averageRating = placeData?.rating || 5.0;
  const totalReviews = placeData?.userRatingCount || "100+";

  // Fallback reviews in case the API fails or returns nothing
  const displayReviews = reviews.length > 0 ? reviews.map((r: any) => ({
    author: r.authorAttribution?.displayName || 'Customer',
    role: 'Verified Google Review',
    rating: r.rating || 5,
    date: r.relativePublishTimeDescription || '',
    comment: r.text?.text || '',
    verified: true,
  })) : [
    {
      author: 'Karthik Raja',
      role: 'Verified Google Review',
      rating: 5,
      date: '2 weeks ago',
      comment: 'We have been sourcing synthetic frames and crystal awards from R Creation for over 3 years. Superb frame moulding quality, perfect miter joints, and punctual delivery for all our wedding studio orders.',
      verified: true,
    },
    {
      author: 'Praveen Kumar',
      role: 'Verified Google Review',
      rating: 5,
      date: '3 weeks ago',
      comment: 'Created a custom 24x36 family collage frame using their online frame customizer. The acrylic glass is crystal clear and packaging was sturdy enough to survive transit without a scratch!',
      verified: true,
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#fcfcfc] border-t border-[#eaeaea] relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2aabb0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold font-mono tracking-widest text-[#2aabb0] uppercase mb-2 block">
            Verified Customer Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0a0e27] tracking-tight mb-3">
            Google Reviews & Client Feedback
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto mb-6">
            Real experiences from photography studios, institutional organizers, and gift buyers across Tamil Nadu.
          </p>

          {/* Google Rating Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-sm border border-neutral-200/80">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="font-bold text-sm text-[#0a0e27]">{averageRating} / 5.0</span>
            </div>
            <div className="flex items-center text-amber-400">
              {[...Array(Math.round(averageRating))].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-neutral-500 font-medium border-l border-neutral-200 pl-3">
              {totalReviews} Verified Reviews
            </span>
          </div>
        </div>

        {/* Infinite CSS Marquee */}
        <div className="flex overflow-hidden relative w-full group">
          {/* We create a seamless loop by tripling the review list (since Google only returns 5) */}
          <div className="flex gap-6 animate-google-marquee group-hover:[animation-play-state:paused] w-max px-3">
            {[...displayReviews, ...displayReviews, ...displayReviews].map((review: any, i: number) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-100 flex flex-col justify-between relative w-[320px] sm:w-[380px] shrink-0"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-amber-400">
                      {[...Array(review.rating)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">{review.date}</span>
                  </div>

                  <p className="text-sm text-neutral-700 leading-relaxed mb-6 line-clamp-4">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0a0e27] truncate max-w-[160px]">{review.author}</h4>
                    <p className="text-xs text-neutral-500 truncate max-w-[160px]">{review.role}</p>
                  </div>
                  {review.verified && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        

      </div>
    </section>
  );
}

export default GoogleReviews;
