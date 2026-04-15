/**
 * Logs Tab Component
 *
 * Displays system logs with filtering options.
 * Epic 0.8: System Logs - Story 0.8.1: Log Viewer
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useSystemLogs } from '@nasnet/api-client/queries';
import { LogViewer } from '@nasnet/features/dashboard';
import { useConnectionStore } from '@nasnet/state/stores';
import { Button, Card, CardContent, Icon } from '@nasnet/ui/primitives';

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export const LogsTab = React.memo(function LogsTab() {
  const queryClient = useQueryClient();
  const routerIp = useConnectionStore((state) => state.currentRouterIp) || '';
  const isRefreshing = useIsFetching({ queryKey: ['system', 'logs'] }) > 0;

  // Subscribe to the same query LogViewer uses (deduped by TanStack Query)
  // just to read dataUpdatedAt for the "Updated ..." indicator.
  const { dataUpdatedAt } = useSystemLogs(routerIp, { limit: 100 });
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : undefined;

  const [, forceTick] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    const interval = setInterval(forceTick, 10_000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['system', 'logs'] });
  }, [queryClient]);

  return (
    <div className="px-page-mobile md:px-page-tablet lg:px-page-desktop animate-fade-in-up mx-auto max-w-7xl space-y-6 py-4 md:py-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-end gap-3">
        {lastUpdated && (
          <span className="text-muted-foreground text-xs tabular-nums">
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh logs"
        >
          <Icon
            icon={RefreshCw}
            className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
            aria-hidden="true"
          />
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Logs Card */}
      <Card variant="flat" className="flex flex-col">
        <CardContent className="p-component-md md:p-component-lg flex h-[calc(100vh-12rem)] min-h-[480px] flex-col">
          <LogViewer limit={100} />
        </CardContent>
      </Card>
    </div>
  );
});

LogsTab.displayName = 'LogsTab';
