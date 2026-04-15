/**
 * Shared mapping from LogTopic / LogSeverity to a shadcn Badge variant.
 * Used by LogEntry, LogFilters, LogDetailPanel, LogStats, and SeverityBadge
 * so every badge-like surface in the logs feature stays visually consistent.
 */

import type { LogSeverity, LogTopic } from '@nasnet/core/types';
import type { BadgeProps } from '@nasnet/ui/primitives';

export function topicToBadgeVariant(topic: LogTopic): NonNullable<BadgeProps['variant']> {
  switch (topic) {
    case 'firewall':
    case 'error':
    case 'critical':
      return 'error';
    case 'warning':
      return 'warning';
    case 'dhcp':
      return 'success';
    case 'wireless':
    case 'info':
      return 'info';
    case 'system':
      return 'offline';
    default:
      return 'secondary';
  }
}

export function severityToBadgeVariant(
  severity: LogSeverity
): NonNullable<BadgeProps['variant']> {
  switch (severity) {
    case 'debug':
      return 'offline';
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
    case 'critical':
      return 'error';
    default:
      return 'info';
  }
}
