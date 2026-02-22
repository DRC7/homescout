export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-[16/10] animate-pulse bg-zinc-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200" />
      </div>
    </div>
  );
}
