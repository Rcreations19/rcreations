'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

interface StateAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  id?: string;
  ariaDescribedBy?: string;
}

export function StateAutocomplete({
  value,
  onChange,
  onBlur,
  hasError,
  id = 'state-autocomplete',
  ariaDescribedBy,
}: StateAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = INDIAN_STATES.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  // Sync external value into local query when value changes programmatically
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If query doesn't exactly match a state, restore last valid value
        if (!INDIAN_STATES.includes(query)) {
          setQuery(value);
        }
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [query, value]);

  const select = (state: string) => {
    onChange(state);
    setQuery(state);
    setOpen(false);
    setActiveIndex(-1);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) select(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery(value);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const isValid = INDIAN_STATES.includes(value);

  return (
    <div ref={containerRef} className="relative">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10 pointer-events-none" />
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-describedby={ariaDescribedBy}
        aria-invalid={hasError || undefined}
        type="text"
        value={query}
        placeholder="Search state…"
        autoComplete="off"
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
          // Clear parent value if user is typing something new
          if (INDIAN_STATES.includes(e.target.value)) {
            onChange(e.target.value);
          } else {
            onChange('');
          }
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={`w-full pl-10 pr-9 py-2.5 bg-neutral-50 border rounded-xl text-base sm:text-sm focus:ring-2 focus:outline-none transition-all ${
          hasError
            ? 'border-red-500 ring-red-500 focus:ring-red-400'
            : isValid
            ? 'border-emerald-400 focus:ring-emerald-400'
            : 'border-neutral-300 focus:ring-[#10164A]'
        }`}
      />
      {/* Valid check / chevron */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {isValid ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-auto max-h-52 py-1"
          >
            {filtered.map((state, i) => (
              <li
                key={state}
                role="option"
                aria-selected={value === state}
                onMouseDown={() => select(state)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  i === activeIndex
                    ? 'bg-[#10164A] text-white'
                    : value === state
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{state}</span>
                {value === state && <Check className="w-3.5 h-3.5 shrink-0" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
