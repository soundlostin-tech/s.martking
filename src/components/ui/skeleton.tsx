"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-[#E5E7EB] rounded-lg",
        className
      )} 
    />
  );
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.06)]", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.06)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.06)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-16 h-1.5 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-[#5FD3BC] rounded-lg p-6 relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-[#1A1A1A]/10" />
              <Skeleton className="h-10 w-32 bg-[#1A1A1A]/10" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl bg-[#1A1A1A]/10" />
          </div>
          <div className="flex items-center gap-6 pt-4 border-t border-[#1A1A1A]/10">
            <div className="space-y-1">
              <Skeleton className="h-2 w-20 bg-[#1A1A1A]/10" />
              <Skeleton className="h-5 w-16 bg-[#1A1A1A]/10" />
            </div>
            <div className="h-6 w-px bg-[#1A1A1A]/10" />
            <div className="space-y-1">
              <Skeleton className="h-2 w-16 bg-[#1A1A1A]/10" />
              <Skeleton className="h-5 w-12 bg-[#1A1A1A]/10" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
    </div>
  );
}

export function FeaturedCardSkeleton() {
  return (
    <div className="bg-[#5FD3BC] rounded-lg p-6 relative overflow-hidden min-h-[200px]">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-16 rounded-full bg-[#1A1A1A]/10" />
          <Skeleton className="h-6 w-24 rounded-full bg-[#1A1A1A]/10" />
        </div>
        <Skeleton className="h-8 w-48 bg-[#1A1A1A]/10" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12 rounded-lg bg-[#1A1A1A]/10" />
          <Skeleton className="h-6 w-20 rounded-lg bg-[#1A1A1A]/10" />
        </div>
        <div className="flex items-end justify-between pt-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 bg-[#1A1A1A]/10" />
            <Skeleton className="h-8 w-24 bg-[#1A1A1A]/10" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl bg-[#1A1A1A]/10" />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#1A1A1A] rounded-lg p-4 h-36">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="h-8 w-12 bg-white/10" />
        </div>
        <div className="h-8 flex items-end gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="flex-1 bg-white/10" style={{ height: `${20 + Math.random() * 60}%` }} />
          ))}
        </div>
      </div>
      <div className="bg-[#EDE9FE] rounded-lg p-4 h-36">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-[#1A1A1A]/10" />
          <Skeleton className="h-8 w-12 bg-[#1A1A1A]/10" />
          <Skeleton className="h-4 w-24 bg-[#1A1A1A]/10" />
        </div>
      </div>
    </div>
  );
}

export function StoriesSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 items-start">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-2 w-10" />
        </div>
      ))}
    </div>
  );
}
