export default function SueldosLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-60 bg-gray-200 rounded-lg mb-2"></div>
      <div className="h-4 w-40 bg-gray-200 rounded mb-6"></div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 h-20 flex flex-col justify-between">
            <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) - Employees Grid */}
        <div className="lg:col-span-2 order-1 lg:order-first space-y-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="h-5 w-36 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mt-2"></div>
              </div>
              <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
            </div>
            
            <div className="h-10 bg-gray-55 border-b border-gray-100"></div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - Sidebar Panels */}
        <div className="lg:col-span-1 order-2 lg:order-last space-y-5">
          {/* Actions Panel */}
          <div className="card p-5 space-y-4">
            <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200 space-y-1.5">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-3 w-4/5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Scales Panel */}
          <div className="card p-5 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100 space-y-1.5">
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="h-6 w-36 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
