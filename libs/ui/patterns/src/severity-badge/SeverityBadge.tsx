/**
 * SeverityBadge Component
 * Displays log severity with color-coded visual indicators
 * Epic 0.8: System Logs - Story 0.8.3
 */

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import type { LogSeverity } from '@nasnet/core/types';
import { Badge, cn } from '@nasnet/ui/primitives';

import { severityToBadgeVariant } from '../log-entry';

/**
 * Severity badge variants with color mapping (legacy filter/button mode).
 * Row rendering uses the shadcn Badge primitive via severityToBadgeVariant().
 */
const severityBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      severity: {
        debug: 'text-muted-foreground bg-muted',
        info: 'text-info bg-info/10',
        warning: 'text-warning bg-warning/10',
        error: 'text-error bg-error/10',
        critical: 'text-error bg-error/20 ring-error/30 font-bold ring-1 ring-inset',
      },
    },
    defaultVariants: {
      severity: 'info',
    },
  }
);

export interface SeverityBadgeProps
  extends VariantProps<typeof severityBadgeVariants>,
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Log severity level
   */
  severity: LogSeverity;

  /**
   * Optional callback when badge is dismissed (for filter badges)
   * If provided, a dismiss button (X) will be shown
   */
  onRemove?: () => void;
}

/**
 * SeverityBadge Component
 *
 * Displays a color-coded badge for log severity levels.
 * Used in both log entries and filter badges.
 *
 * @example
 * ```tsx
 * // In log entry (no remove button)
 * <SeverityBadge severity="error" />
 *
 * // In filter area (with remove button)
 * <SeverityBadge
 *   severity="warning"
 *   onRemove={() => removeSeverity('warning')}
 * />
 * ```
 */
function SeverityBadgeBase({ severity, onRemove, className, ...props }: SeverityBadgeProps) {
  // Capitalize severity for display
  const displayText = severity.charAt(0).toUpperCase() + severity.slice(1);

  if (onRemove) {
    // Filter badge with dismiss button — uses shadcn Badge primitive
    return (
      <Badge
        variant={severityToBadgeVariant(severity)}
        className={cn(
          'group cursor-pointer gap-1 transition-opacity hover:opacity-80',
          className
        )}
        role="button"
        tabIndex={0}
        aria-label={`Remove ${displayText} filter`}
        onClick={onRemove}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRemove();
          }
        }}
      >
        <span>{displayText}</span>
        <X className="h-3 w-3 opacity-70 group-hover:opacity-100" aria-hidden="true" />
      </Badge>
    );
  }

  // Read-only badge (for log entries) — uses shadcn Badge primitive
  const { role, ...rest } = props as React.HTMLAttributes<HTMLSpanElement> & { role?: string };
  return (
    <Badge
      variant={severityToBadgeVariant(severity)}
      className={className}
      role={role ?? 'status'}
      aria-label={`Severity: ${displayText}`}
      {...rest}
    >
      {displayText}
    </Badge>
  );
}

export const SeverityBadge = React.memo(SeverityBadgeBase);

SeverityBadge.displayName = 'SeverityBadge';
