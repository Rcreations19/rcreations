import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'full-horizontal' | 'icon-only';
  theme?: 'dark' | 'light';
  iconSize?: number;
}

export function RCreationLogo({ variant = 'full-horizontal', theme = 'dark', iconSize = 36 }: LogoProps) {
  return (
    <div className="flex items-center" style={{ height: iconSize }}>
      <Image
        src="/logo.svg"
        alt="R Creation Logo"
        width={variant === 'full-horizontal' ? iconSize * 4 : iconSize}
        height={iconSize}
        className="object-contain w-auto h-full"
        priority
      />
    </div>
  );
}
