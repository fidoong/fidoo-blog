export function PostListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
        >
          <div className="w-full h-48 bg-gray-200" />
          <div className="p-6">
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
