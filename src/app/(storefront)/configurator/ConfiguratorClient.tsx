'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { uploadCustomerPhoto } from '@/lib/actions/customer-uploads';
import { ArrowRight, ArrowLeft, Plus, Minus, Ruler, CheckCircle2, UploadCloud, Trash2, Layers2, ShieldCheck, Zap, PackageX, Home } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { GlassType, MountBoard } from '@/lib/supabase/types';
import dynamic from 'next/dynamic';
import PhotoCropper from '@/components/storefront/PhotoCropper';
import { useCart } from '@/components/storefront/CartContext';

const ThreeDFrameViewer = dynamic(() => import('@/components/storefront/ThreeDFrameViewer'), { ssr: false });

const FRAME_OPTIONS = [
  { id: 'f1', name: 'Classic Teak Wood', category: 'wood', colorHex: '#5C4033', durability: 'Premium Real Wood' },
  { id: 'f2', name: 'Ornate Antique Gold', category: 'molding', colorHex: '#D4AF37', durability: 'Heavy Duty Carved' },
  { id: 'f3', name: 'Minimalist Matte Black', category: 'molding', colorHex: '#1a1a1a', durability: 'Sleek Synthetic' },
  { id: 'f4', name: 'Dark Rosewood / Mahogany', category: 'wood', colorHex: '#3B1E16', durability: 'Premium Polished' },
  { id: 'f10', name: 'Glossy White Acrylic', category: 'acrylic', colorHex: '#ffffff', durability: 'High Reflection' },
  { id: 'f21', name: 'Dual-Tone Brown & Gold', category: 'molding', colorHex: '#3E2723', durability: 'Premium Dual-Tone' },
];

const STEPS = [
  { id: 1, title: 'Product & Options' },
  { id: 2, title: 'Glass & Mount' },
  { id: 3, title: 'Customization & Review' }
];

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

export default function ConfiguratorClient({ config }: { config: Record<string, any> }) {
  const { addCustom } = useCart();
  const [currentStep, setCurrentStep] = useState(1);

  const playHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const frames = config?.frames || [];
  const backlit = config?.backlit || [];
  const settings = config?.settings || { finishes: [], thicknesses: [] };
  
  const [productType, setProductType] = useState<'frames' | 'backlit'>('frames');
  

  
  // Selection States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedThickness, setSelectedThickness] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('');
  const [materialId, setMaterialId] = useState(FRAME_OPTIONS[0].id);

  // Initialize selections when productType changes or data loads
  useEffect(() => {
    const data = productType === 'frames' ? frames : backlit;
    if (data.length > 0) {
      const sizes = Array.from(new Set(data.map((d: Record<string, unknown>) => d.size)));
      const firstSize = sizes[0] as string;
      
      const thicks = productType === 'frames' && settings.thicknesses.length > 0 
        ? settings.thicknesses.map((t: Record<string, unknown>) => t.thickness)
        : Array.from(new Set(data.filter((d: Record<string, unknown>) => d.size === firstSize).map((d: Record<string, unknown>) => d.thickness)));
      const firstThick = thicks[0] as string;
      
      const finishes = productType === 'frames' && settings.finishes.length > 0
        ? settings.finishes.map((f: Record<string, unknown>) => f.finish)
        : Array.from(new Set(data.filter((d: Record<string, unknown>) => d.size === firstSize && d.thickness === firstThick).map((d: Record<string, unknown>) => d.finish)));
        
      setTimeout(() => {
        setSelectedSize(firstSize);
        setSelectedThickness(firstThick);
        setSelectedFinish(finishes[0] as string);
      }, 0);
    }
  }, [productType, frames, backlit, settings]);

  // Derived options for dropdowns
  const currentData = productType === 'frames' ? frames : backlit;
  const availableSizes = Array.from(new Set(currentData.map((d: Record<string, unknown>) => d.size)));
  const availableThicknesses = productType === 'frames' && settings.thicknesses.length > 0 
    ? settings.thicknesses.map((t: Record<string, unknown>) => t.thickness) 
    : Array.from(new Set(currentData.filter((d: Record<string, unknown>) => d.size === selectedSize).map((d: Record<string, unknown>) => d.thickness)));
  const availableFinishes = productType === 'frames' && settings.finishes.length > 0
    ? settings.finishes.map((f: Record<string, unknown>) => f.finish)
    : Array.from(new Set(currentData.filter((d: Record<string, unknown>) => d.size === selectedSize && d.thickness === selectedThickness).map((d: Record<string, unknown>) => d.finish)));

  const handleSizeChange = (s: string) => {
    setSelectedSize(s);
    if (productType === 'backlit') {
      const thicks = Array.from(new Set(currentData.filter((d: Record<string, any>) => d.size === s).map((d: Record<string, any>) => d.thickness)));
      if (thicks.length > 0) {
        setSelectedThickness(thicks[0] as string);
        const fins = Array.from(new Set(currentData.filter((d: Record<string, any>) => d.size === s && d.thickness === thicks[0]).map((d: Record<string, any>) => d.finish)));
        if (fins.length > 0) setSelectedFinish(fins[0] as string);
      }
    }
  };

  const handleThicknessChange = (t: string) => {
    setSelectedThickness(t);
    if (productType === 'backlit') {
      const fins = Array.from(new Set(currentData.filter((d: Record<string, any>) => d.size === selectedSize && d.thickness === t).map((d: Record<string, any>) => d.finish)));
      if (fins.length > 0) setSelectedFinish(fins[0] as string);
    }
  };

  // Dimensions for 3D Viewer and pricing
  const [wIn, hIn] = (selectedSize || '12x8').split('x').map(s => parseFloat(s) || 12);
  const widthCm = wIn * 2.54;
  const heightCm = (hIn || 8) * 2.54;
  const numericThickness = parseFloat((selectedThickness || '1').replace('"', ''));

  // Pricing calculation
  let baseRate = 0;
  if (productType === 'frames') {
    const matchingRow = currentData.find((d: Record<string, any>) => d.size === selectedSize);
    const baseFinal = matchingRow ? matchingRow.finalPrice : 0;
    
    const sqFt = (wIn * hIn) / 144;
    const selectedThickSetting = settings.thicknesses.find((t: Record<string, any>) => t.thickness === selectedThickness);
    const thicknessAddonTotal = selectedThickSetting ? (selectedThickSetting.addonSqFt * sqFt) : 0;
    
    const selectedFinishSetting = settings.finishes.find((f: Record<string, any>) => f.finish === selectedFinish);
    const finishSurchargeTotal = selectedFinishSetting ? (baseFinal * selectedFinishSetting.surchargePercent) : 0;
    
    baseRate = Math.round((baseFinal + thicknessAddonTotal + finishSurchargeTotal) / 10) * 10;
  } else {
    // backlit
    const matchingRow = currentData.find((d: Record<string, any>) => d.size === selectedSize && d.thickness === selectedThickness && d.finish === selectedFinish);
    baseRate = matchingRow ? matchingRow.finalPrice : 0;
  }

  // Other configurations
  const [glassType, setGlassType] = useState<GlassType>('clear-glass');
  const [mountBoard, setMountBoard] = useState<MountBoard>('none');
  const [customText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uncroppedImage, setUncroppedImage] = useState<string | null>(null);
  
  // States for 3D+ (Lenticular) second photo
  const [uploadedPhoto2, setUploadedPhoto2] = useState<string | null>(null);
  const [uncroppedImage2, setUncroppedImage2] = useState<string | null>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<'primary' | 'secondary'>('primary');
  
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedMaterial = useMemo(() => FRAME_OPTIONS.find(m => m.id === materialId) || FRAME_OPTIONS[0], [materialId]);

  if (frames.length === 0 && backlit.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-screen pt-20 md:pt-32 pb-24 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-sm text-center max-w-md border border-neutral-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
            <PackageX className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-3">Configurator Unavailable</h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">Pricing configuration has not been set up. Please upload the Rate Card in the admin site settings to enable the configurator.</p>
          <a href="/" className="px-8 py-3 bg-[#10164A] text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2 hover:bg-[#10164A]/90">
            <Home className="w-4 h-4" /> Return Home
          </a>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'primary' | 'secondary' = 'primary') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Secure file type validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, or WebP).");
        e.target.value = ''; // Reset input
        return;
      }

      const url = URL.createObjectURL(file);
      if (target === 'primary') {
        setUncroppedImage(url);
      } else {
        setUncroppedImage2(url);
      }
      setActiveUploadTarget(target);
      setShowCropper(true);
    }
  };

  const handleOrderSubmit = async () => {
    if (!uploadedPhoto) {
      alert("Please upload a photo first.");
      return;
    }

    setIsUploading(true);

    try {
      const file = await dataUrlToFile(uploadedPhoto, 'custom-order.jpg');
      const formData = new FormData();
      formData.append('photo', file);

      const response = await uploadCustomerPhoto(formData);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'No data returned');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uploadData = response.data as any;
      const uploadId = uploadData.id;

      // Price is driven ENTIRELY by the excel data (baseRate) + static options
      let finalBase = baseRate;
      if (glassType !== 'clear-glass') finalBase += 50;
      if (mountBoard !== 'none') finalBase += 30;
      if (customText) finalBase += 40;
      
      const totalPrice = finalBase * quantity;

      addCustom({
        productType,
        size: selectedSize,
        thicknessString: selectedThickness,
        finish: selectedFinish,
        materialId,
        widthCm,
        heightCm,
        thicknessInches: numericThickness,
        glassType,
        mountBoard,
        customText,
        quantity,
        uploadedPhotoUrl: uploadData.storage_path,
        uploadId: uploadId
      } as any, totalPrice);

      alert("Successfully configured and added to cart!");
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : "Failed to process your photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pt-4 md:pt-28 pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-4 md:mb-14 max-w-4xl mx-auto">
          <div className="text-center mb-4 md:mb-10">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900">Configurator</h1>
            <p className="text-sm md:text-lg font-medium text-neutral-500 mt-2 md:mt-4 max-w-xl mx-auto hidden sm:block">Configure your product using live pricing.</p>
          </div>
          
          <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-neutral-200 -translate-y-1/2 z-0 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  step.id < currentStep ? 'bg-accent text-primary' : 
                  step.id === currentStep ? 'bg-white text-accent ring-4 ring-accent/20 shadow-sm' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {step.id < currentStep ? <CheckCircle2 className="w-5 h-5 text-primary" /> : step.id}
                </div>
                <span className={`text-xs font-semibold tracking-tight hidden sm:block ${step.id === currentStep ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl mx-auto">
          
          {/* Left Column: Wizard Steps */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
              
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Product & Dimensions */}
                {currentStep === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="p-6 sm:p-10">
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6 flex items-center gap-3">
                      Select Product Type
                    </h2>
                    
                    <div className="flex gap-4 mb-8">
                      <button 
                        onClick={() => { playHaptic(); setProductType('frames'); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${productType === 'frames' ? 'bg-[#10164A] text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                      >
                        Photo Frames
                      </button>
                      <button 
                        onClick={() => { playHaptic(); setProductType('backlit'); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${productType === 'backlit' ? 'bg-[#10164A] text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                      >
                        Backlit / Acrylic Panel
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#595959] block mb-2">Size (in)</label>
                        <select 
                          value={selectedSize}
                          onChange={(e) => { playHaptic(); handleSizeChange(e.target.value); }}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none"
                        >
                          {availableSizes.map((s: any) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-[#595959] block mb-2">Thickness</label>
                          <select 
                            value={selectedThickness}
                            onChange={(e) => { playHaptic(); handleThicknessChange(e.target.value); }}
                            disabled={availableThicknesses.length <= 1}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {availableThicknesses.map((t: string) => (
                              <option key={t} value={t}>{t}{availableThicknesses.length <= 1 ? ' (Only option)' : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-[#595959] block mb-2">Finish</label>
                          <select 
                            value={selectedFinish}
                            onChange={(e) => { playHaptic(); setSelectedFinish(e.target.value); }}
                            disabled={availableFinishes.length <= 1}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {availableFinishes.map((f: string) => (
                              <option key={f} value={f}>{f}{availableFinishes.length <= 1 ? ' (Only option)' : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-[#10164A]/5 rounded-xl border border-[#10164A]/10 flex justify-between items-center">
                      <span className="font-semibold text-neutral-700">Base Unit Price</span>
                      <span className="text-xl font-bold text-[#10164A]">₹{baseRate}</span>
                    </div>

                    {/* Frame Material (Visual only) */}
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6 flex items-center gap-3 mt-12">
                      Frame Material Color
                    </h2>
                    <div className="flex overflow-x-auto snap-x gap-4 pb-6 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 hide-scrollbar">
                      {FRAME_OPTIONS.map(opt => {
                        const isSelected = materialId === opt.id;
                        return (
                          <motion.button
                            key={opt.id}
                            onClick={() => { playHaptic(); setMaterialId(opt.id); }}
                            animate={{ scale: isSelected ? 0.98 : 1 }}
                            className={`p-4 rounded-2xl text-left flex items-center gap-3 transition-colors ${isSelected ? 'bg-accent text-primary shadow-lg' : 'bg-neutral-100 hover:bg-neutral-200/50 text-neutral-900'}`}
                          >
                            <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: opt.colorHex }} />
                            <div>
                              <h3 className="text-sm font-semibold">{opt.name}</h3>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Glass & Mount */}
                {currentStep === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="p-6 sm:p-10">
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-8">Select Glass Type</h2>
                    <div className="flex overflow-x-auto snap-x gap-4 mb-12 pb-6 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-0 hide-scrollbar">
                      {[
                        { id: 'clear-glass', name: 'Clear Glass', desc: 'Standard 2mm float glass', Icon: Layers2 },
                        { id: 'anti-glare-acrylic', name: 'Anti-Glare Acrylic', desc: 'Shatterproof museum grade (+₹50)', Icon: ShieldCheck },
                        { id: 'led-backlit-panel', name: 'LED Backlit Panel', desc: '12V edge-lit glowing base (+₹50)', Icon: Zap },
                      ].map(g => {
                        const isSelected = glassType === g.id;
                        const GlassIcon = g.Icon;
                        return (
                          <motion.button
                            key={g.id}
                            onClick={() => { playHaptic(); setGlassType(g.id as GlassType); }}
                            className={`p-5 rounded-2xl text-left transition-colors ${isSelected ? 'bg-accent text-primary shadow-lg' : 'bg-neutral-100 hover:bg-neutral-200/50 text-neutral-900'}`}
                          >
                            <GlassIcon className={`w-5 h-5 mb-4 ${isSelected ? 'text-primary' : 'text-neutral-500'}`} />
                            <h4 className="text-sm font-semibold">{g.name}</h4>
                            <p className="text-xs opacity-80">{g.desc}</p>
                          </motion.button>
                        );
                      })}
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6">Mount Board</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'none', name: 'No Mount', sub: 'Edge to edge' },
                        { id: 'white-1-inch', name: '1-inch White Mount', sub: '+₹30' },
                      ].map(m => {
                        const isSelected = mountBoard === m.id;
                        return (
                          <motion.button
                            key={m.id}
                            onClick={() => { playHaptic(); setMountBoard(m.id as MountBoard); }}
                            className={`p-4 rounded-2xl text-left transition-colors ${isSelected ? 'bg-accent text-primary shadow-lg' : 'bg-neutral-100 hover:bg-neutral-200/50'}`}
                          >
                            <span className="text-sm font-semibold">{m.name}</span>
                            <span className="text-xs opacity-80 block">{m.sub}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Customization & Review */}
                {currentStep === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="p-6 sm:p-10">
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6 flex items-center gap-3">
                      Review Price
                    </h2>
                    
                    <div className="bg-neutral-100 rounded-2xl p-6 mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Base Price (from Rate Card)</span>
                        <span className="font-semibold text-neutral-900">₹{baseRate}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Glass Add-on</span>
                        <span className="font-semibold text-neutral-900">₹{glassType !== 'clear-glass' ? 50 : 0}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Mount Add-on</span>
                        <span className="font-semibold text-neutral-900">₹{mountBoard !== 'none' ? 30 : 0}</span>
                      </div>
                      <div className="border-t border-neutral-300 my-4"></div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-neutral-900">Unit Price</span>
                        <span className="font-bold text-accent">₹{baseRate + (glassType !== 'clear-glass' ? 50 : 0) + (mountBoard !== 'none' ? 30 : 0)}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6">Quantity</h2>
                    <div className="bg-neutral-100 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-white rounded-xl p-1 shadow-sm">
                        <motion.button onClick={() => { playHaptic([10]); setQuantity(Math.max(1, quantity - 1)); }} className="w-10 h-10 flex items-center justify-center text-neutral-500 bg-transparent rounded-lg">
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="w-8 text-center font-mono font-semibold text-neutral-900 select-none">{quantity}</span>
                        <motion.button onClick={() => { playHaptic([10]); setQuantity(quantity + 1); }} className="w-10 h-10 flex items-center justify-center text-neutral-500 bg-transparent rounded-lg">
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="p-4 sm:p-6 bg-white flex items-center justify-between md:bottom-0 md:relative z-40 border-t border-neutral-100">
                {currentStep > 1 ? (
                  <motion.button 
                    onClick={() => { playHaptic(); setCurrentStep(currentStep - 1); }} 
                    className="px-6 py-3 rounded-full text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-colors flex items-center gap-2 active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                ) : <div></div>}
                
                {currentStep < 3 ? (
                  <motion.button 
                    onClick={() => { playHaptic([20]); setCurrentStep(currentStep + 1); }} 
                    disabled={currentStep === 1 && !uploadedPhoto}
                    className="px-8 py-3 bg-[#10164A] text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                  >
                    {currentStep === 1 && !uploadedPhoto ? 'Upload Photo to Continue' : 'Continue'} 
                    {currentStep !== 1 || uploadedPhoto ? <ArrowRight className="w-4 h-4" /> : null}
                  </motion.button>
                ) : (
                  <motion.button 
                    onClick={() => { playHaptic([20, 50, 20]); handleOrderSubmit(); }} 
                    disabled={isUploading}
                    className="px-8 py-3 bg-[#10164A] text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isUploading ? 'Processing...' : `Add to Cart - ₹${(baseRate + (glassType !== 'clear-glass' ? 50 : 0) + (mountBoard !== 'none' ? 30 : 0)) * quantity}`}
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Sticky Preview */}
          <div className="lg:col-span-5 order-first lg:order-last mb-8 lg:mb-0 z-30">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:sticky top-0 lg:top-32 bg-transparent overflow-hidden flex flex-col items-center"
            >
              <div className="w-full h-[280px] sm:h-[400px] lg:h-[600px] mb-4 md:mb-8">
                <ThreeDFrameViewer 
                  materialId={selectedMaterial.id} 
                  widthCm={widthCm} 
                  heightCm={heightCm} 
                  thicknessCm={numericThickness * 2.54}
                  photoUrl={uploadedPhoto}
                  photoUrl2={uploadedPhoto2}
                  glassType={glassType}
                  finish={selectedFinish}
                  productType={productType}
                />
              </div>

              <div className="flex flex-col gap-4 justify-center w-full mt-4">
                {/* Primary Photo Upload */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{selectedFinish === '3D+' ? 'Left Angle Photo' : 'Preview Photo'}</span>
                  {uploadedPhoto ? (
                    <motion.button onClick={() => { playHaptic(); setUploadedPhoto(null); }} className="text-sm font-medium text-red-500 bg-red-50 px-4 py-2 rounded-full flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Remove Photo
                    </motion.button>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm font-semibold tracking-tight text-neutral-900 transition-colors shadow-sm">
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handlePhotoUpload(e, 'primary')} />
                      <UploadCloud className="w-4 h-4 text-neutral-500" /> Upload Photo
                    </label>
                  )}
                </div>

                {/* Secondary Photo Upload (Only for 3D+) */}
                {selectedFinish === '3D+' && (
                  <div className="flex flex-col items-center gap-2 border-t border-neutral-200 pt-4">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Right Angle Photo (Required for 3D+)</span>
                    {uploadedPhoto2 ? (
                      <motion.button onClick={() => { playHaptic(); setUploadedPhoto2(null); }} className="text-sm font-medium text-red-500 bg-red-50 px-4 py-2 rounded-full flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Remove Second Photo
                      </motion.button>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm font-semibold tracking-tight text-neutral-900 transition-colors shadow-sm">
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handlePhotoUpload(e, 'secondary')} />
                        <UploadCloud className="w-4 h-4 text-neutral-500" /> Upload Second Photo
                      </label>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {showCropper && (activeUploadTarget === 'primary' ? uncroppedImage : uncroppedImage2) && (
        <PhotoCropper
          imageSrc={(activeUploadTarget === 'primary' ? uncroppedImage : uncroppedImage2) as string}
          lockedAspect={activeUploadTarget === 'secondary' && widthCm && heightCm ? (widthCm / heightCm) : undefined}
          onCropComplete={(croppedUrl, newAspect) => {
            if (activeUploadTarget === 'primary') {
              setUploadedPhoto(croppedUrl);
            } else {
              setUploadedPhoto2(croppedUrl);
            }
            setShowCropper(false);
            
            // Auto-select the closest size by aspect ratio (only for primary photo)
            if (activeUploadTarget === 'primary' && availableSizes.length > 0) {
              let closestSize = availableSizes[0];
              let smallestDiff = Infinity;
              
              availableSizes.forEach((s: any) => {
                const [w, h] = (s as string).split('x').map(num => parseFloat(num));
                if (w && h) {
                  const aspect = w / h;
                  const diff = Math.abs(aspect - newAspect);
                  if (diff < smallestDiff) {
                    smallestDiff = diff;
                    closestSize = s as string;
                  }
                }
              });
              
              if (closestSize) {
                handleSizeChange(closestSize as string);
                playHaptic([10, 30]);
              }
            }
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}
