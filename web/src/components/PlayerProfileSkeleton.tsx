import { Skeleton } from "./ui/Skeleton";

export function PlayerProfileSkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Skeleton */}
            <div className="relative overflow-visible mb-12 flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full mb-4 ring-4 ring-white/10" />
                <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-48 rounded" />
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-6 w-32 rounded mt-2" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Matches & Champions Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Match History */}
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Sidebar (Champions) */}
                <div className="space-y-6">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
