export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse flex flex-col">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-gray-200 flex-shrink-0" />

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Price row */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-gray-200 rounded-lg" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        {/* Location */}
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        {/* Spacer */}
        <div className="flex-1 min-h-[12px]" />
        {/* Action buttons */}
        <div className="pt-4 border-t border-gray-100 flex gap-2">
          <div className="h-10 bg-gray-200 rounded-xl flex-1" />
          <div className="h-10 bg-gray-200 rounded-xl w-16" />
        </div>
      </div>
    </div>
  );
}
