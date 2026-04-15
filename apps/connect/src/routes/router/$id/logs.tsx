import { createFileRoute } from '@tanstack/react-router';

import { LazyBoundary } from '@nasnet/ui/patterns';
import { Skeleton } from '@nasnet/ui/primitives';

import { LazyLogsTab } from '@/app/routes/router-panel/tabs/lazy';

/**
 * Logs Route - Code-split for optimal bundle size
 *
 * The LogsTab is lazy-loaded as it contains heavy virtualized log list
 * and log filtering components. Preloading happens on hover via
 * preloadLogsTab in the navigation component.
 *
 * @see NAS-4.12: Performance Optimization
 */
function LogsTabSkeleton() {
  return (
    <div
      className="px-page-mobile md:px-page-tablet lg:px-page-desktop animate-fade-in-up mx-auto max-w-7xl space-y-6 py-4 md:py-6"
      aria-busy="true"
      aria-label="Loading logs"
    >
      {/* Quick actions placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Card-shaped skeleton */}
      <div className="border-border bg-card rounded-card-sm border">
        {/* Card header */}
        <div className="p-component-md md:p-component-lg gap-component-sm flex flex-col">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Card content: filter controls + table */}
        <div className="p-component-md md:p-component-lg space-y-4 pt-0">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/router/$id/logs')({
  component: () => (
    <LazyBoundary fallback={<LogsTabSkeleton />}>
      <LazyLogsTab />
    </LazyBoundary>
  ),
});
