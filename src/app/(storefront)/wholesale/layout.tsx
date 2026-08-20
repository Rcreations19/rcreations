import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wholesale B2B',
  description:
    'Factory-direct wholesale photo frames, crystal trophies, and wooden mementos from Gudiyattam, Vellore. MOQ as low as 10 units. GST registered, bulk pricing up to 45% off retail.',
  alternates: {
    canonical: '/wholesale',
  },
  openGraph: {
    title: 'Wholesale B2B | R Creation',
    description:
      'Factory-direct wholesale photo frames, crystal trophies, and wooden mementos from Gudiyattam, Vellore. MOQ 10 units.',
  },
};

export default function WholesaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
