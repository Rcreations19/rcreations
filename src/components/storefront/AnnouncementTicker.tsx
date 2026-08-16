'use client';

import React, { useRef, useEffect } from 'react';

const ITEMS = [
  'Latest Offers',
  'Latest Designs',
  'Local Delivery (40km Radius)',
  'Cash on Delivery (COD)',
];

const SPEED = 55; // px per second

// 4 copies instead of 2 — loop resets at scrollWidth/4 (one copy).
// With 4× the track length, sub-pixel rounding error is < 0.01% of loop → invisible.
const QUAD_ITEMS = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

export function AnnouncementTicker() {
  const trackRef  = useRef<HTMLDivElement>(null);
  const loopWidth = useRef(0);
  const xRef      = useRef(0);
  const rafRef    = useRef<number>(0);
  const lastTs    = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // One copy = exactly 1/4 of total scrollWidth
    loopWidth.current = track.scrollWidth / 4;

    const step = (ts: number) => {
      if (lastTs.current === null) lastTs.current = ts;
      const delta = ts - lastTs.current;
      lastTs.current = ts;

      xRef.current += (SPEED * delta) / 1000;
      if (xRef.current >= loopWidth.current) xRef.current -= loopWidth.current;

      track.style.transform = `translateX(${-xRef.current}px)`;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      className="w-full bg-[#2aabb0] text-[#0a0e27] py-2.5 overflow-hidden"
      aria-label="Announcements"
    >
      <div
        ref={trackRef}
        className="flex items-center will-change-transform"
        style={{ width: 'max-content' }}
      >
        {QUAD_ITEMS.map((item, i) => (
          <React.Fragment key={i}>
            <span className="px-8 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em]">
              {item}
            </span>
            <span className="opacity-40 select-none text-xs" aria-hidden="true">
              •
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
