import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Ruler, Settings, FileText, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical Specifications',
  description: 'Technical specifications, material details, and manufacturing standards for R Creation synthetic frames, crystal trophies, and custom engraving.',
  alternates: {
    canonical: '/specs',
  },
};

export default function SpecsPage() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 space-y-2">
        <span className="text-xs font-mono font-bold uppercase text-accent bg-[#10164A] px-2.5 py-1 rounded inline-block">
          Manufacturing Standards
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10164A] tracking-tight">
          Technical Specifications
        </h1>
        <p className="text-sm text-neutral-600">
          Detailed material compositions, tolerances, and hardware specifications for our product lines.
        </p>
      </div>

      <div className="space-y-8">
        {/* Synthetic Frames */}
        <section className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="bg-[#10164A] p-4 flex items-center gap-3">
            <Ruler className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-white">Synthetic PS Frame Moldings</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Our core framing profiles are extruded from high-density Polystyrene (PS). This material offers superior moisture resistance and dimensional stability compared to traditional softwoods, making it ideal for the humid South Indian climate.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Material Density</span>
                <span className="text-xs text-neutral-600 font-mono">400-500 kg/m³</span>
              </div>
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Profile Widths</span>
                <span className="text-xs text-neutral-600 font-mono">12mm, 19mm, 25mm, 38mm</span>
              </div>
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Corner Joinery</span>
                <span className="text-xs text-neutral-600 font-mono">Pneumatic V-Nail (7mm / 10mm)</span>
              </div>
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Finishing</span>
                <span className="text-xs text-neutral-600 font-mono">Hot Stamp Foil Laminate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Acrylic & Illumination */}
        <section className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="bg-[#10164A] p-4 flex items-center gap-3">
            <Settings className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-white">Acrylic & LED Illumination</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Used in our premium customized displays and LED trophies. We utilize optical-grade cast acrylic for superior light transmittance during edge-lighting applications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Acrylic Type</span>
                <span className="text-xs text-neutral-600 font-mono">Optical Cast PMMA (4mm/6mm)</span>
              </div>
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">LED Strips</span>
                <span className="text-xs text-neutral-600 font-mono">SMD 2835 (120 LEDs/m)</span>
              </div>
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Power Supply</span>
                <span className="text-xs text-neutral-600 font-mono">12V 1A/2A DC Adapter (BIS)</span>
              </div>
              <div className="flex items-start gap-2 border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-[#10164A] w-32 shrink-0">Base Material</span>
                <span className="text-xs text-neutral-600 font-mono">Solid Pine / Seasoned Teak</span>
              </div>
            </div>
          </div>
        </section>

        {/* Engraving Specs */}
        <section className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="bg-[#10164A] p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-white">CO2 Laser Engraving & Cutting</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-sm text-neutral-700 leading-relaxed">
              In-house laser engraving provides permanent, high-contrast marking on wooden mementos, leatherette items, and acrylic awards.
            </p>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-600 leading-relaxed">
              <strong className="text-[#10164A]">Design Submission Guidelines (B2B):</strong><br />
              - Format: Vector files (AI, EPS, CDR, SVG) or High-Res Bitmap (PNG, JPG at minimum 300 DPI).<br />
              - Color Space: Strictly Monochrome (100% Black for engrave areas, White for untouched areas). Grayscale is converted to halftone dots.<br />
              - Minimum Line Thickness: 0.2mm for crisp reproduction.<br />
              - Text: Convert all fonts to curves/outlines before submission.
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#10164A] text-[#10164A] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#10164A] hover:text-white active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            <FileText className="w-4 h-4" />
            <span>Request Full Specification PDF</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
