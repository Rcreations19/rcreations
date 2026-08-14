'use client';

import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Plus, Minus, Ruler, PenTool, Layout, CheckCircle2, UploadCloud, Trash2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { GlassType, MountBoard } from '@/lib/supabase/types';
import dynamic from 'next/dynamic';
import PhotoCropper from '@/components/storefront/PhotoCropper';

const ThreeDFrameViewer = dynamic(() => import('@/components/storefront/ThreeDFrameViewer'), { ssr: false });

const FRAME_OPTIONS = [
  { id: 'f1', name: 'Classic Teak Wood', category: 'wood', unitPrice: 220, colorHex: '#5C4033', durability: 'Premium Real Wood' },
  { id: 'f2', name: 'Ornate Antique Gold', category: 'molding', unitPrice: 350, colorHex: '#D4AF37', durability: 'Heavy Duty Carved' },
  { id: 'f3', name: 'Minimalist Matte Black', category: 'molding', unitPrice: 180, colorHex: '#1a1a1a', durability: 'Sleek Synthetic' },
  { id: 'f4', name: 'Dark Rosewood / Mahogany', category: 'wood', unitPrice: 380, colorHex: '#3B1E16', durability: 'Premium Polished' },
  { id: 'f5', name: 'Textured Faux Leather', category: 'molding', unitPrice: 250, colorHex: '#4a3020', durability: 'Rich Texture' },
  { id: 'f6', name: 'Distressed Vintage White', category: 'wood', unitPrice: 280, colorHex: '#E8E5DF', durability: 'Shabby Chic' },
  { id: 'f7', name: 'Metallic Ribbed Silver', category: 'molding', unitPrice: 240, colorHex: '#C0C0C0', durability: 'Modern Metallic' },
  { id: 'f8', name: 'Traditional Bronze/Copper', category: 'molding', unitPrice: 290, colorHex: '#CD7F32', durability: 'Temple Style' },
  { id: 'f9', name: 'Natural Pine / Light Wood', category: 'wood', unitPrice: 190, colorHex: '#D2B48C', durability: 'Eco Light Grain' },
  { id: 'f10', name: 'Glossy White Acrylic', category: 'acrylic', unitPrice: 400, colorHex: '#ffffff', durability: 'High Reflection' },
  { id: 'f11', name: 'Royal Gold & Black Velvet', category: 'molding', unitPrice: 380, colorHex: '#D4AF37', durability: 'Ornate Gallery Style' },
  { id: 'f14', name: 'Mahogany with Brass Bevel', category: 'wood', unitPrice: 340, colorHex: '#4A0E0E', durability: 'Premium Polished' },
  { id: 'f17', name: 'Victorian Silver & Black', category: 'molding', unitPrice: 330, colorHex: '#C0C0C0', durability: 'Antique Finish' },
];

const STEPS = [
  { id: 1, title: 'Dimensions & Material' },
  { id: 2, title: 'Glass & Mount' },
  { id: 3, title: 'Customization & Review' }
];

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
}

export default function ConfiguratorPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [materialId, setMaterialId] = useState(FRAME_OPTIONS[0].id);
  const [widthCm, setWidthCm] = useState(30);
  const [heightCm, setHeightCm] = useState(45);
  const [frameThickness, setFrameThickness] = useState(1.0); // Thickness in inches
  const [glassType, setGlassType] = useState<GlassType>('clear-glass');
  const [mountBoard, setMountBoard] = useState<MountBoard>('none');
  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uncroppedImage, setUncroppedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUncroppedImage(url);
      setShowCropper(true);
    }
  };

  const selectedMaterial = useMemo(() => FRAME_OPTIONS.find(m => m.id === materialId) || FRAME_OPTIONS[0], [materialId]);

  const handleWhatsAppOrder = async () => {
    const adminNumber = '918754940610'; // Admin WhatsApp Number
    const message = `Hello, I would like to place an order for a custom frame!\n\n*Frame Style:* ${selectedMaterial.name}\n*Thickness:* ${frameThickness} inch\n*Dimensions:* ${widthCm}x${heightCm} cm\n*Glass:* ${glassType}\n*Mount:* ${mountBoard}\n*Quantity:* ${quantity}`;

    if (uploadedPhoto && navigator.canShare) {
      try {
        const file = await dataUrlToFile(uploadedPhoto, 'custom-order.jpg');
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Custom Frame Order',
            text: message,
          });
          return;
        }
      } catch (error) {
        console.error('Error sharing file:', error);
      }
    }

    const encodedMessage = encodeURIComponent(`${message}\n\n*Status:* I will send my cropped photo in the next message.`);
    alert("Please attach your photo in the WhatsApp chat after it opens!");
    window.open(`https://wa.me/${adminNumber}?text=${encodedMessage}`, '_blank');
  };

  // Variants for step transitions
  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pt-28 pb-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Zeigarnik Progress Bar */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0a0e27] tracking-tight">Interactive Builder</h1>
            <p className="text-sm text-[#555555] mt-2">Design your custom frame, trophy, or memento in real-time.</p>
          </div>
          
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#eaeaea] -translate-y-1/2 z-0 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#2aabb0]"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  step.id < currentStep ? 'bg-[#2aabb0] text-[#0a0e27]' : 
                  step.id === currentStep ? 'bg-[#0a0e27] text-white ring-4 ring-[#2aabb0]/30' : 'bg-white border-2 border-[#eaeaea] text-[#595959]'
                }`}>
                  {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${step.id === currentStep ? 'text-[#0a0e27]' : 'text-[#595959]'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
          
          {/* Left Column: Wizard Steps */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl border border-[#eaeaea] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden relative min-h-[500px]">
              
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Dimensions & Material */}
                {currentStep === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="p-8 sm:p-10">
                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-8 flex items-center gap-3">
                      <Layout className="w-6 h-6 text-[#2aabb0]" /> Choose Base Material
                    </h2>
                    
                    <div className="flex overflow-x-auto snap-x gap-4 pb-6 mb-8 -mx-8 px-8 sm:mx-0 sm:px-0 sm:flex-col sm:overflow-visible sm:snap-none sm:space-y-4 sm:gap-0 hide-scrollbar">
                      {FRAME_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setMaterialId(opt.id)}
                          className={`shrink-0 w-[260px] sm:w-full sm:shrink-1 flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group snap-start ${
                            materialId === opt.id ? 'border-[#0a0e27] bg-[#f8f9fa] shadow-md' : 'border-[#eaeaea] hover:border-[#2aabb0]/50 hover:bg-[#fcfcfc]'
                          }`}>
                          <div className="w-12 h-12 rounded-lg shadow-inner shrink-0 relative overflow-hidden" style={{ backgroundColor: opt.colorHex }}>
                            {opt.id.includes('acrylic') && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>}
                            {opt.id.includes('wood') && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 10c2-5 8-5 10 0s8 5 10 0\' stroke=\'%23000\' fill=\'none\' opacity=\'.1\'/%3E%3C/svg%3E")' }}></div>}
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-sm font-bold transition-colors ${materialId === opt.id ? 'text-[#0a0e27]' : 'text-[#555555] group-hover:text-[#0a0e27]'}`}>{opt.name}</h3>
                            <p className="text-[10px] text-[#595959] font-mono uppercase tracking-wider">{opt.durability}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-6 flex items-center gap-3">
                      <Ruler className="w-6 h-6 text-[#2aabb0]" /> Set Dimensions (cm)
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#595959] block mb-2">Width (cm)</label>
                        <input type="number" min="10" max="200" value={widthCm} onChange={(e) => setWidthCm(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#fcfcfc] border border-[#eaeaea] rounded-xl text-lg font-mono font-bold focus:ring-2 focus:ring-[#2aabb0]/50 focus:border-[#2aabb0] focus:outline-none transition-all shadow-inner" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#595959] block mb-2">Height (cm)</label>
                        <input type="number" min="10" max="200" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#fcfcfc] border border-[#eaeaea] rounded-xl text-lg font-mono font-bold focus:ring-2 focus:ring-[#2aabb0]/50 focus:border-[#2aabb0] focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-6 flex items-center gap-3 mt-10">
                      <Layout className="w-6 h-6 text-[#2aabb0]" /> Frame Thickness
                    </h2>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { val: 0.5, label: '0.5 inch' },
                        { val: 1.0, label: '1.0 inch' },
                        { val: 1.5, label: '1.5 inch' },
                        { val: 2.0, label: '2.0 inch' },
                      ].map((thick) => (
                        <button key={thick.val} onClick={() => setFrameThickness(thick.val)}
                          className={`py-3 rounded-xl border-2 text-center transition-all ${
                            frameThickness === thick.val ? 'border-[#0a0e27] bg-[#f8f9fa] shadow-sm' : 'border-[#eaeaea] hover:border-[#2aabb0]/50 hover:bg-[#fcfcfc]'
                          }`}>
                          <span className={`text-sm font-bold ${frameThickness === thick.val ? 'text-[#0a0e27]' : 'text-[#555555]'}`}>{thick.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Glass & Mount */}
                {currentStep === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="p-8 sm:p-10">
                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-8">Select Glass Type</h2>
                    <div className="flex overflow-x-auto snap-x gap-4 mb-10 pb-6 -mx-8 px-8 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-0 hide-scrollbar">
                      {[
                        { id: 'clear-glass', name: 'Clear Glass', desc: 'Standard 2mm float glass' },
                        { id: 'anti-glare-acrylic', name: 'Anti-Glare Acrylic', desc: 'Shatterproof museum grade' },
                        { id: 'led-backlit-panel', name: 'LED Backlit Panel', desc: '12V edge-lit glowing base' },
                      ].map(g => (
                        <button key={g.id} onClick={() => setGlassType(g.id as GlassType)}
                          className={`shrink-0 w-[240px] sm:w-auto p-5 rounded-xl border-2 text-left transition-all snap-start ${glassType === g.id ? 'border-[#0a0e27] bg-[#f8f9fa] shadow-md' : 'border-[#eaeaea] hover:border-[#2aabb0]/50 hover:bg-[#fcfcfc]'}`}>
                          <h4 className={`text-sm font-bold mb-1 ${glassType === g.id ? 'text-[#0a0e27]' : 'text-[#555555]'}`}>{g.name}</h4>
                          <p className="text-[10px] text-[#595959]">{g.desc}</p>
                        </button>
                      ))}
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-6">Mount Board</h2>
                    <div className="flex overflow-x-auto snap-x gap-4 pb-6 -mx-8 px-8 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 hide-scrollbar">
                      {[
                        { id: 'none', name: 'No Mount (Full Bleed)' },
                        { id: 'white-1-inch', name: '1-inch White Mount' },
                        { id: 'black-1-inch', name: '1-inch Black Mount' },
                        { id: 'custom-double', name: 'Premium Double Mount' },
                      ].map(m => (
                        <button key={m.id} onClick={() => setMountBoard(m.id as MountBoard)}
                          className={`shrink-0 w-[240px] sm:w-auto p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between snap-start ${mountBoard === m.id ? 'border-[#0a0e27] bg-[#f8f9fa]' : 'border-[#eaeaea] hover:border-[#2aabb0]/50'}`}>
                          <span className={`text-sm font-bold ${mountBoard === m.id ? 'text-[#0a0e27]' : 'text-[#555555]'}`}>{m.name}</span>
                          {mountBoard === m.id && <CheckCircle2 className="w-4 h-4 text-[#2aabb0]" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Customization & Review */}
                {currentStep === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="p-8 sm:p-10">
                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-6 flex items-center gap-3">
                      <PenTool className="w-6 h-6 text-[#2aabb0]" /> Add Laser Engraving
                    </h2>
                    <div className="mb-10">
                      <p className="text-xs text-[#595959] mb-4">Add customized text, names, or quotes to be engraved on a brass plate or directly on the wood/acrylic.</p>
                      <textarea 
                        value={customText} onChange={(e) => setCustomText(e.target.value)}
                        placeholder="e.g., Awarded to John Doe for Outstanding Performance 2026..."
                        className="w-full p-4 bg-[#fcfcfc] border border-[#eaeaea] rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-[#2aabb0] focus-visible:border-[#2aabb0] focus:outline-none transition-all shadow-inner resize-none h-32"
                      />
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#0a0e27] mb-6">Quantity</h2>
                    <div className="bg-[#f8f9fa] border border-[#eaeaea] p-6 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#0a0e27] mb-1">Number of Units</h4>
                      </div>
                      <div className="flex items-center gap-4 bg-white border border-[#eaeaea] rounded-lg p-1 shadow-sm">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-[#595959] hover:text-[#0a0e27] hover:bg-[#f8f9fa] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#2aabb0] outline-none">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-[#0a0e27]">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center text-[#595959] hover:text-[#0a0e27] hover:bg-[#f8f9fa] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#2aabb0] outline-none">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="p-4 sm:p-6 border-t border-[#eaeaea] bg-[#f8f9fa] flex items-center justify-between sticky bottom-[64px] md:bottom-0 md:relative z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:shadow-none">
                {currentStep > 1 ? (
                  <button onClick={() => setCurrentStep(currentStep - 1)} className="px-6 py-2.5 rounded-lg text-xs font-bold text-[#555555] hover:text-[#0a0e27] hover:bg-[#eaeaea] transition-all flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div></div>}
                
                {currentStep < 3 ? (
                  <button onClick={() => setCurrentStep(currentStep + 1)} className="px-8 py-2.5 bg-[#0a0e27] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#121840] shadow-md transition-all flex items-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleWhatsAppOrder} className="px-6 py-2.5 bg-[#25D366] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1DA851] shadow-md transition-all flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Order via WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Sticky Preview (Halo/Visual Feedback) */}
          <div className="lg:col-span-5 order-first lg:order-last mb-8 lg:mb-0 z-30">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-[88px] lg:top-28 bg-white rounded-3xl p-4 lg:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-[#eaeaea] relative overflow-hidden"
            >
              {/* TRUE 3D Preview Graphic */}
              <div className="w-full h-[220px] sm:h-[350px] lg:h-[650px] mb-4">
                <ThreeDFrameViewer 
                  materialId={selectedMaterial.id} 
                  widthCm={widthCm} 
                  heightCm={heightCm} 
                  thicknessCm={frameThickness * 2.54} // Convert inches to cm for 3D model
                  photoUrl={uploadedPhoto}
                  glassType={glassType}
                />
              </div>

              {/* Upload Photo Button */}
              <div className="flex justify-center">
                {uploadedPhoto ? (
                  <button onClick={() => setUploadedPhoto(null)} className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#f8f9fa] hover:bg-[#eaeaea] border border-[#eaeaea] rounded-full text-xs font-bold text-[#0a0e27] transition-all relative overflow-hidden">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                    <UploadCloud className="w-4 h-4 text-[#2aabb0]" /> Upload preview photo
                  </label>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {showCropper && uncroppedImage && (
        <PhotoCropper
          imageSrc={uncroppedImage}
          onCropComplete={(croppedUrl, newAspect) => {
            setUploadedPhoto(croppedUrl);
            setHeightCm(Math.round(widthCm / newAspect));
            setShowCropper(false);
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}
