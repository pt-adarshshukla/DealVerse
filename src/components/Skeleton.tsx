import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-2xl bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-16 bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-2/3 bg-zinc-800 rounded" />
          <div className="flex justify-between items-end pt-2">
            <div className="h-6 w-20 bg-zinc-800 rounded" />
            <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridProductSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-3 animate-pulse">
      <div className="aspect-square rounded-2xl bg-zinc-800 mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-12 bg-zinc-800 rounded" />
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-6 w-16 bg-zinc-800 rounded mt-2" />
      </div>
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-6 animate-pulse">
      <div className="aspect-square rounded-[2rem] bg-zinc-800 mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-zinc-800 rounded" />
        <div className="h-8 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="h-32 w-full bg-zinc-800 rounded-2xl" />
        <div className="flex justify-between items-center pt-4">
          <div className="h-10 w-32 bg-zinc-800 rounded" />
          <div className="h-12 w-24 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
