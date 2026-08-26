import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAFA]">
      <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
      <p className="text-sm font-medium text-neutral-500 animate-pulse">Loading experience...</p>
    </div>
  );
}
