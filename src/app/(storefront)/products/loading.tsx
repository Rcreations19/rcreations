export default function Loading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-28 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Filter sidebar skeleton */}
        <div className="hidden xl:block xl:col-span-3">
          <div className="sticky top-28 space-y-6 border border-neutral-200 p-6 rounded-2xl">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-9 w-full rounded-lg" />
              ))}
            </div>
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="xl:col-span-9">
          <div className="skeleton h-12 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col h-[300px] sm:h-[400px]">
                <div className="w-full aspect-[4/5] bg-neutral-100" />
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="skeleton h-3 w-20 rounded mb-3" />
                    <div className="skeleton h-5 w-full rounded mb-2" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                  <div className="pt-3 border-t border-neutral-100">
                    <div className="skeleton h-6 w-24 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
