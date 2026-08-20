import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Frame Builder',
  description:
    'Design your own custom photo frame, crystal trophy, or wooden memento with R Creations interactive 3D configurator. No minimum order, factory-direct quality.',
  alternates: {
    canonical: '/configurator',
  },
  openGraph: {
    title: 'Custom Frame Builder | R Creation',
    description:
      'Design your own custom photo frame, crystal trophy, or wooden memento with our interactive 3D configurator.',
  },
};

export default function ConfiguratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
