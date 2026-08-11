'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="p-10 bg-red-100 text-red-900 border border-red-500 rounded-xl m-10 relative z-50">
      <h2 className="text-2xl font-bold mb-4">Client Rendering Error</h2>
      <p className="font-mono text-sm mb-4 whitespace-pre-wrap">{error.message}</p>
      <pre className="font-mono text-xs overflow-auto max-h-96 bg-white p-4 rounded">{error.stack}</pre>
    </div>
  );
}
