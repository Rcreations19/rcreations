export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero skeleton */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex w-full flex-col items-center gap-5 lg:w-[55%] lg:items-start">
            <div className="skeleton h-8 w-40 rounded-full" />
            <div className="skeleton h-14 w-full max-w-xl rounded-lg" />
            <div className="skeleton h-14 w-3/4 max-w-md rounded-lg" />
            <div className="skeleton h-5 w-full max-w-lg" />
            <div className="skeleton h-5 w-2/3 max-w-sm" />
            <div className="mt-2 flex gap-3">
              <div className="skeleton h-11 w-36 rounded-md" />
              <div className="skeleton h-11 w-36 rounded-md" />
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-3 lg:w-[45%] lg:justify-end">
            <div className="skeleton h-72 w-44 rounded-xl lg:h-96" />
            <div className="skeleton h-80 w-48 rounded-xl lg:h-[28rem]" />
            <div className="skeleton h-72 w-44 rounded-xl lg:h-96" />
          </div>
        </div>
      </section>

      {/* Trust banner skeleton */}
      <section className="border-y border-neutral-100 py-14">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="skeleton mx-auto mb-10 h-4 w-72 rounded" />
          <div className="flex flex-wrap justify-center gap-4 md:gap-16">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-3 w-32 rounded" />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews skeleton */}
      <section className="py-20">
        <div className="mx-auto mb-12 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="skeleton mx-auto mb-3 h-3 w-48 rounded" />
          <div className="skeleton mx-auto mb-4 h-9 w-72 rounded-lg" />
          <div className="skeleton mx-auto h-5 w-64 rounded" />
        </div>
        <div className="mx-auto flex h-96 max-w-6xl items-center justify-center gap-6 px-4">
          <div className="skeleton hidden h-96 w-1/4 rounded-2xl lg:block" />
          <div className="skeleton h-96 w-full max-w-xl rounded-3xl" />
          <div className="skeleton hidden h-96 w-1/4 rounded-2xl lg:block" />
        </div>
      </section>
    </div>
  );
}
