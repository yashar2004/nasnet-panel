/**
 * DHCP Summary Card Component
 * Compact card showing active leases count and IP range
 * Based on UX Design Specification - Direction 4: Action-First
 *
 * Features:
 * - Active lease count display with capacity ratio
 * - IP address range visualization
 * - Loading state with spinner
 * - Optional link navigation with hover effects
 * - Dark/light theme support
 *
 * @example
 * ```tsx
 * <DHCPSummaryCard
 *   activeLeases={24}
 *   totalCapacity={100}
 *   ipRange="192.168.1.100-192.168.1.200"
 * />
 * ```
 */

import * as React from 'react';

import { Link } from '@tanstack/react-router';
import { Network, Users, ChevronRight, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@nasnet/ui/primitives';
import { cn } from '@nasnet/ui/utils';

/**
 * DHCPSummaryCard Props
 */
export interface DHCPSummaryCardProps {
  /** Total number of active leases */
  activeLeases: number;
  /** Total number of leases (for capacity) */
  totalCapacity?: number;
  /** IP address range (e.g., "192.168.1.100-192.168.1.200") */
  ipRange?: string;
  /** Server name */
  serverName?: string;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Link to full DHCP page */
  linkTo?: string;
  /** Custom className */
  className?: string;
}

/**
 * DHCPSummaryCard Component
 * Shows DHCP server summary with active lease count and IP range
 */
function DHCPSummaryCardComponent({
  activeLeases,
  totalCapacity,
  ipRange,
  serverName = 'DHCP Server',
  isLoading = false,
  linkTo = '/dhcp',
  className = '',
}: DHCPSummaryCardProps) {
  return (
    <Card
      className={cn('h-full', className)}
      role="region"
      aria-label={`${serverName} summary card`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-info/10 dark:bg-info/20 flex h-8 w-8 items-center justify-center rounded-lg">
              <Network className="text-info h-4 w-4" aria-hidden="true" />
            </div>
            <CardTitle className="text-base font-semibold">{serverName}</CardTitle>
          </div>
          {linkTo && (
            <Link to={linkTo as '/'}>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer rounded-full">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ?
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" aria-hidden="true" />
          </div>
        : activeLeases === 0 ?
          <div className="flex h-full flex-1 flex-col items-center justify-center py-10 text-center">
            <Network className="text-muted-foreground mb-2 h-8 w-8 animate-pulse" />
            <p className="text-muted-foreground text-sm">No active leases</p>
          </div>
        : <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Users className="text-muted-foreground h-5 w-5" aria-hidden="true" />
              <div>
                <p className="text-foreground text-2xl font-bold">
                  {activeLeases}
                  {totalCapacity && (
                    <span className="text-muted-foreground ml-1 text-sm font-normal">
                      / {totalCapacity}
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground text-xs">Active Leases</p>
              </div>
            </div>

            {ipRange && (
              <div className="border-border border-t pt-2">
                <p className="text-muted-foreground text-xs">IP Range</p>
                <p className="text-foreground truncate font-mono text-sm" title={ipRange}>
                  {ipRange}
                </p>
              </div>
            )}
          </div>
        }
      </CardContent>
    </Card>
  );
}

DHCPSummaryCardComponent.displayName = 'DHCPSummaryCard';

export const DHCPSummaryCard = React.memo(DHCPSummaryCardComponent);
