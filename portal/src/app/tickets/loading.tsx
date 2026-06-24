export default function TicketsLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-36 bg-gray-200 rounded-lg mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (2/5 width) - Filters and List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>

          {/* Tickets list */}
          <div className="card divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="flex gap-2">
                  <div className="h-4.5 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-4.5 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* New Ticket Form */}
          <div className="card p-5 space-y-3">
            <div className="h-5 w-28 bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
            <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
            <div className="h-16 w-full bg-gray-200 rounded-lg"></div>
            <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Right Column (3/5 width) - Ticket Detail Pane */}
        <div className="lg:col-span-3">
          <div className="card p-5 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
                <div className="h-3.5 w-1/3 bg-gray-200 rounded"></div>
              </div>
              <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>

            {/* Messages */}
            <div className="space-y-4 border-t pt-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-20 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Add Message Form */}
            <div className="space-y-3 border-t pt-4">
              <div className="h-20 w-full bg-gray-200 rounded-lg"></div>
              <div className="flex justify-end">
                <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
