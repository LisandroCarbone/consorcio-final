export default function ProveedoresLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-36 bg-gray-200 rounded-lg mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active OTs */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="h-5 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-50 border-b border-gray-100"></div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4.5 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-7 w-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets without OT */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="h-5 w-52 bg-gray-200 rounded"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-5">
          {/* New OT Form */}
          <div className="card p-5 space-y-4">
            <div className="h-5 w-36 bg-gray-200 rounded mb-2"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
              </div>
            ))}
            <div className="pt-2">
              <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* New Provider Form */}
          <div className="card p-5 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
              </div>
            ))}
            <div className="pt-2">
              <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
