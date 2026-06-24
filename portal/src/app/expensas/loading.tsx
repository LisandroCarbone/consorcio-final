export default function ExpensasLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-36 bg-gray-200 rounded-lg mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) - Detail skeleton */}
        <div className="lg:col-span-2 order-1 lg:order-first space-y-6">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
                <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - Sidebar skeleton */}
        <div className="lg:col-span-1 order-2 lg:order-last space-y-6">
          {/* Periods List */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* New Period Form */}
          <div className="card p-5 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
              <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
