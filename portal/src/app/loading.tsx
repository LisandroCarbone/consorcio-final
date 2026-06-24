export default function DashboardLoading() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 h-24 flex items-start gap-4">
            <div className="p-3 w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
              <div className="h-7 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) - Cashflow Chart */}
        <div className="card col-span-2 p-5 h-[400px] flex flex-col justify-between">
          <div className="space-y-2 border-b pb-4 mb-4">
            <div className="h-5 w-48 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-72 bg-gray-200 rounded"></div>
          </div>
          <div className="flex-1 w-full bg-gray-50 rounded-lg"></div>
        </div>

        {/* Right Column (1/3 width) - Collection Pie */}
        <div className="card p-5 h-[400px] flex flex-col justify-between">
          <div className="space-y-2 border-b pb-4 mb-4">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-8 border-gray-100 flex items-center justify-center">
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-50 rounded mt-4"></div>
        </div>
      </div>

      {/* Fila de Tablas y Agendas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table skeleton (2/3 width) */}
        <div className="card col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-60 bg-gray-200 rounded"></div>
              <div className="h-3 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-50 border-b border-gray-200"></div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda skeleton (1/3 width) */}
        <div className="card p-5 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b pb-4 mb-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-44 bg-gray-200 rounded"></div>
                <div className="h-3.5 w-36 bg-gray-200 rounded"></div>
              </div>
            </div>
            <ul className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-12 bg-gray-200 rounded shrink-0"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </ul>
          </div>
          <div className="h-14 bg-gray-50 rounded-lg mt-6"></div>
        </div>
      </div>
    </div>
  );
}

