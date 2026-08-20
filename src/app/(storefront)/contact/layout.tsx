import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact R Creation in Gudiyattam, Vellore for wholesale inquiries, custom orders, and bulk pricing. Phone: +91-8754940610. Factory visits welcome Mon-Sat 9AM-8PM.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | R Creation',
    description:
      'Contact R Creation in Gudiyattam, Vellore for wholesale inquiries, custom orders, and bulk pricing.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
