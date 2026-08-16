export default function Loading() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 space-y-3">
        <div className="skeleton h-3 w-32 mx-auto rounded" />
        <div className="skeleton h-9 w-48 mx-auto rounded-lg" />
        <div className="skeleton h-4 w-64 mx-auto rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="aspect-[16/10] bg-neutral-100" />
            <div className="p-5 space-y-3">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-5 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="flex items-center gap-2 pt-2">
                <div className="skeleton h-3 w-12 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
