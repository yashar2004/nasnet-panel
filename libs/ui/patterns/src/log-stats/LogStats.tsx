/**
 * Log Stats Component
 * Displays statistics and severity distribution for logs
 * Epic 0.8: System Logs - Statistics Summary
 */

import * as React from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import type { LogEntry, LogSeverity } from '@nasnet/core/types';
import { Badge, Button, cn } from '@nasnet/ui/primitives';

import { severityToBadgeVariant } from '../log-entry';

export interface LogStatsProps {
  /**
   * Log entries to compute stats from
   */
  logs: LogEntry[];
  /**
   * Last update timestamp
   */
  lastUpdated?: Date;
  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;
  /**
   * Additional class names
   */
  className?: string;
}

interface SeverityStats {
  severity: LogSeverity;
  count: number;
  percentage: number;
  color: string;
}

const severityColors: Record<LogSeverity, string> = {
  debug: 'bg-slate-400',
  info: 'bg-info',
  warning: 'bg-warning',
  error: 'bg-error',
  critical: 'bg-error',
};

const severityOrder: LogSeverity[] = ['critical', 'error', 'warning', 'info', 'debug'];

/**
 * Compute stats from logs
 */
function computeStats(logs: LogEntry[]): SeverityStats[] {
  const counts = new Map<LogSeverity, number>();

  for (const log of logs) {
    const current = counts.get(log.severity) || 0;
    counts.set(log.severity, current + 1);
  }

  const total = logs.length || 1;

  return severityOrder.map((severity) => ({
    severity,
    count: counts.get(severity) || 0,
    percentage: ((counts.get(severity) || 0) / total) * 100,
    color: severityColors[severity],
  }));
}

/**
 * LogStats Component
 */
export function LogStats({ logs, className }: LogStatsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const stats = React.useMemo(() => computeStats(logs), [logs]);

  const nonZeroStats = stats.filter((s) => s.count > 0);

  return (
    <div className={cn('rounded-card-sm bg-card border p-3 transition-all', className)}>
      {/* Header - Always visible */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Total count */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">{logs.length}</span>
            <span className="text-muted-foreground text-sm">entries</span>
          </div>

          {/* Severity badges - compact */}
          <div className="hidden items-center gap-2 sm:flex">
            {nonZeroStats.map((stat) => (
              <Badge
                key={stat.severity}
                variant={severityToBadgeVariant(stat.severity)}
                className="gap-1.5"
              >
                <span
                  className={cn('inline-block shrink-0', stat.color)}
                  style={{ width: 8, height: 8, borderRadius: 9999 }}
                  aria-hidden="true"
                />
                <span className="capitalize">{stat.severity}</span>
                <span className="tabular-nums">{stat.count}</span>
              </Badge>
            ))}
          </div>

        </div>

        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          {isExpanded ?
            <ChevronUp className="h-4 w-4" />
          : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Expanded content - Severity distribution bar */}
      {isExpanded && logs.length > 0 && (
        <div className="mt-3 border-t pt-3">
          {/* Bar chart */}
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {stats.map(
              (stat) =>
                stat.percentage > 0 && (
                  <div
                    key={stat.severity}
                    className={cn(
                      'h-full transition-all',
                      stat.color,
                      stat.severity === 'critical' && 'animate-pulse'
                    )}
                    style={{ width: `${stat.percentage}%` }}
                    title={`${stat.severity}: ${stat.count} (${stat.percentage.toFixed(1)}%)`}
                  />
                )
            )}
          </div>

          {/* Legend - mobile */}
          <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
            {nonZeroStats.map((stat) => (
              <div
                key={stat.severity}
                className="text-muted-foreground flex items-center gap-1 text-xs"
              >
                <span
                  className={cn('inline-block shrink-0', stat.color)}
                  style={{ width: 8, height: 8, borderRadius: 9999 }}
                  aria-hidden="true"
                />
                <span className="capitalize">{stat.severity}:</span>
                <span className="tabular-nums">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
