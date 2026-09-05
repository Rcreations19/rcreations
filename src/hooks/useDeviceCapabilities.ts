'use client';

import { useState, useEffect } from 'react';

export type CapabilityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export function useDeviceCapabilities(): CapabilityTier {
  const [tier, setTier] = useState<CapabilityTier>('HIGH'); // Assume high on SSR

  useEffect(() => {
    // 1. Detect logical CPU cores
    const cores = navigator.hardwareConcurrency || 4;
    
    // 2. Detect device RAM (Chrome/Android mostly, returns GB)
    // @ts-ignore - deviceMemory is non-standard but highly useful
    const memory = navigator.deviceMemory || 8; 

    // 3. Detect mobile via User-Agent (rough heuristic)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let calculatedTier: CapabilityTier = 'HIGH';

    if (cores <= 4 || memory <= 4 || isMobile) {
      calculatedTier = 'MEDIUM';
    }

    // 4. Specifically detect very low-end devices or battery saver
    if (cores <= 2 || memory <= 2) {
      calculatedTier = 'LOW';
    }

    // Optional: Try to detect Battery Saver mode if Battery API is available
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery: any) => {
        if (!battery.charging && battery.level <= 0.2) {
          // If battery is low and not charging, they might be in battery saver
          // We can conservatively downgrade the visual tier
          setTier((currentTier) => {
            if (currentTier === 'HIGH') return 'MEDIUM';
            return 'LOW';
          });
        }
      }).catch(() => { /* ignore */ });
    }

    setTier(calculatedTier);
  }, []);

  return tier;
}
