export default function FinanzasLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) - Accounts Table */}
        <div className="lg:col-span-2 order-1 lg:order-first space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 h-20 flex flex-col justify-between">
                <div className="h-3.5 w-20 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="h-10 bg-gray-100 border-b border-gray-200"></div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - Register Payment Form */}
        <div className="lg:col-span-1 order-2 lg:order-last">
          <div className="card p-5 space-y-4">
            <div className="h-5 w-36 bg-gray-200 rounded mb-2"></div>
            {[1, 2, 3, 4].map((i) => (
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
